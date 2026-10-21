"use client";
/**
 * Cashier mode: a till for selling in person. Type a price, the customer scans the QR with any
 * Monero wallet, and the screen turns into a big "Paid". Every sale gets its own subaddress, so
 * payments are matched by address, never by amount. Everything runs on this device: no server
 * sees the sales, and the wallet's keys never leave it. Best on a watch-only wallet, which
 * cannot spend even if the device is lost.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  atomicToFiat,
  buildPaymentUri,
  CONFIRMATION_PRESETS,
  createInvoice,
  fiatToAtomic,
  formatXmr,
  invoiceFromJson,
  InvoiceError,
  invoiceToJson,
  parseXmr,
  xmrAmountProblem,
  type InvoiceStatus,
  type WalletPublic,
} from "@quietmint/wallet-core";
import type { IncomingEntry, LiveWallet } from "@/lib/wallet/engine";
import { recordSeen, saleStatus, type CashierConfig, type CashierData, type CashierStore, type Sale, type Speed } from "@/lib/wallet/cashier";
import { fetchPriceFeed, fetchQuote, MAIN_CURRENCIES, PriceUnavailableError } from "@/lib/prices";
import { downloadCsv, salesCsv } from "@/lib/wallet/exports";
import { freshAddress } from "@/lib/wallet/addresses";
import { MAIN_ACCOUNT, tillAccount } from "@/lib/wallet/engine";
import { checkClock, clockOffset, clockWarning, serverNow, useClockOffset } from "@/lib/wallet/clock";
import { StorageError } from "@/lib/wallet/stateStore";
import { Credentials, type SettingsActions } from "./WalletSettings";
import { Qr } from "./Qr";
import styles from "./cashier.module.css";

type Screen = "setup" | "keypad" | "charge" | "sales" | "exit";

const SPEEDS: { id: Speed; title: string; text: string }[] = [
  { id: "quick", title: "Quick", text: "Up to 0.1 XMR: paid the moment it is seen. Up to 1 XMR: 1 confirmation (about 2 minutes). More: 10." },
  { id: "standard", title: "Standard", text: "1 confirmation (about 2 minutes). Over 5 XMR: 10 confirmations." },
  { id: "safe", title: "Safe", text: "10 confirmations (about 20 minutes), when the coins become spendable." },
];

const isFiat = (c: string) => c !== "XMR";

function money(amount: string, currency: string): string {
  if (!isFiat(currency)) return `${amount} XMR`;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
}

/** Keeps the till's screen on while cashier mode is open, where supported. */
function useWakeLock() {
  useEffect(() => {
    type Sentinel = { release(): Promise<void> };
    const nav = navigator as Navigator & { wakeLock?: { request(type: "screen"): Promise<Sentinel> } };
    if (!nav.wakeLock) return;
    let lock: Sentinel | null = null;
    let alive = true;
    const get = () => { void nav.wakeLock!.request("screen").then((l) => { if (alive) lock = l; else void l.release(); }).catch(() => {}); };
    const onVis = () => { if (!document.hidden) get(); };
    get();
    document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; document.removeEventListener("visibilitychange", onVis); void lock?.release().catch(() => {}); };
  }, []);
}

export function Cashier({ pub, wallet, store, settings, synced, offlineSince = null, onExit }: {
  pub: WalletPublic;
  wallet: LiveWallet;
  store: CashierStore;
  settings?: SettingsActions;
  synced: boolean;
  /** Time (as text) of the last successful sync, when the node has stopped answering. */
  offlineSince?: string | null;
  onExit: () => void;
}) {
  const [data, setData] = useState<CashierData | null>(null);
  const [screen, setScreen] = useState<Screen>("keypad");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<IncomingEntry[]>([]);
  // Every time on the till is corrected by the server clock, so a device clock that is off cannot
  // expire a sale early or ignore its payment (see clock.ts).
  const [now, setNow] = useState(() => serverNow());
  const dataRef = useRef<CashierData | null>(null);
  const clockMsg = clockWarning(useClockOffset());
  useWakeLock();

  useEffect(() => {
    let alive = true;
    void store.load().then((d) => {
      if (!alive) return;
      dataRef.current = d;
      setData(d);
      if (!d.config) setScreen("setup");
    });
    return () => { alive = false; };
  }, [store]);

  // The till keeps working from memory if a save fails, and says so: export before closing.
  const [saveError, setSaveError] = useState<string | null>(null);
  const persist = useCallback(async (next: CashierData) => {
    dataRef.current = next;
    setData(next);
    try {
      await store.save(next);
      setSaveError(null);
    } catch (err) {
      setSaveError((err as Error).message);
    }
  }, [store]);

  // A one-second clock for countdowns.
  useEffect(() => {
    const t = setInterval(() => setNow(serverNow()), 1000);
    return () => clearInterval(t);
  }, []);

  // Watch for payments: every 3 s while a sale is on screen, every 10 s otherwise. During a sale
  // the wallet also syncs more often than its background sync, so new payments show sooner.
  const charging = screen === "charge";
  useEffect(() => {
    let alive = true;
    let syncing = false;
    const read = async () => {
      try {
        const list = await wallet.incoming();
        if (!alive) return;
        setIncoming(list);
        const d = dataRef.current;
        const seen = d ? recordSeen(d.sales, list, serverNow()) : null;
        if (d && seen) void persist({ ...d, sales: seen });
      } catch { /* wallet closing */ }
    };
    void read();
    const t = setInterval(read, charging ? 3000 : 10_000);
    const s = charging && wallet.syncNow ? setInterval(() => {
      if (syncing) return;
      syncing = true;
      void wallet.syncNow!().catch(() => {}).finally(() => { syncing = false; });
    }, 10_000) : null;
    return () => { alive = false; clearInterval(t); if (s) clearInterval(s); };
  }, [wallet, charging, persist]);

  if (!data) return <div className={styles.till}><p className={styles.loading}>Opening the till…</p></div>;

  const config = data.config;
  /** The newest data, even inside callbacks created by an earlier render. */
  const latest = (): CashierData => dataRef.current ?? data;
  const active = activeId ? data.sales.find((s) => s.invoice.id === activeId) ?? null : null;

  const today = new Date(now).toDateString();
  const todays = data.sales.filter((s) => new Date(s.invoice.createdAt).toDateString() === today);
  const paidToday = todays.filter((s) => countsAsPaid(s, saleStatus(s, incoming, now)));

  const header = (
    <header className={styles.bar}>
      <div className={styles.barName}>
        <strong>{config?.shopName || "Cashier"}</strong>
        <span>{pub.kind === "view-only" ? "Watch-only till" : "Full wallet"} on {pub.network}{config ? `, prices in ${config.currency}` : ""}</span>
      </div>
      <div className={styles.barStats} aria-live="polite">
        <span><b className="tnum">{paidToday.length}</b> paid today</span>
      </div>
      <nav className={styles.barNav} aria-label="Cashier">
        {config ? (
          <>
            <button type="button" className={`btn btn-ghost btn-sm ${screen === "keypad" || screen === "charge" ? styles.navOn : ""}`} aria-current={screen === "keypad" || screen === "charge" ? "page" : undefined} onClick={() => setScreen(active && screen !== "keypad" ? "charge" : "keypad")}>Till</button>
            <button type="button" className={`btn btn-ghost btn-sm ${screen === "sales" ? styles.navOn : ""}`} aria-current={screen === "sales" ? "page" : undefined} onClick={() => setScreen("sales")}>Sales</button>
            <button type="button" className={`btn btn-ghost btn-sm ${screen === "setup" ? styles.navOn : ""}`} aria-current={screen === "setup" ? "page" : undefined} onClick={() => setScreen("setup")}>Settings</button>
          </>
        ) : null}
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => (settings ? setScreen("exit") : onExit())}>Exit</button>
      </nav>
    </header>
  );

  return (
    <div className={styles.till} role="region" aria-label="Cashier mode">
      {header}
      <div className={styles.body}>
        {saveError ? (
          <div className="notice notice-warn" role="alert"><span><strong>Sales are not being saved on this device.</strong> {saveError} Export your sales (CSV) before you close the till.</span></div>
        ) : null}
        {!synced ? (
          <div className="notice notice-warn" role="status"><span>The wallet is still syncing. Sales work, but payments show once it is up to date.</span></div>
        ) : null}
        {offlineSince ? (
          <div className="notice notice-warn" role="alert">
            <span>
              <strong>Not connected to the Monero network since {offlineSince}.</strong> New payments will not show until it reconnects, so a
              sale can say &quot;Waiting for payment&quot; even if the customer paid. Check again before you ask them to pay twice.
            </span>
          </div>
        ) : null}
        {clockMsg ? <div className="notice notice-warn" role="status"><span>{clockMsg} Price holds and payment times depend on it.</span></div> : null}
        {screen === "setup" ? (
          <Setup pub={pub} initial={config} settings={settings} onSave={async (c) => { await persist({ ...latest(), config: c }); setScreen("keypad"); }} />
        ) : null}
        {screen === "keypad" && config ? (
          <Keypad config={config} pub={pub} wallet={wallet}
            usedIndexes={data.sales.filter((s) => (s.account ?? MAIN_ACCOUNT) === tillAccount(config.tillNumber ?? 1)).map((s) => s.invoice.subaddressIndex)}
            onCreated={async (sale) => {
            // Always build on the latest data (dataRef), never on a copy from an earlier render.
            await persist({ ...latest(), sales: [sale, ...latest().sales] });
            setActiveId(sale.invoice.id);
            setScreen("charge");
          }} />
        ) : null}
        {screen === "charge" && config && active ? (
          <Charge sale={active} config={config} incoming={incoming} now={now}
            onNew={() => { setActiveId(null); setScreen("keypad"); }}
            onResolve={async (resolution) => {
              await persist({ ...latest(), sales: latest().sales.map((s) => (s.invoice.id === active.invoice.id ? { ...s, resolution } : s)) });
              if (resolution === "cancelled") { setActiveId(null); setScreen("keypad"); }
            }} />
        ) : null}
        {screen === "sales" ? (
          <Sales sales={data.sales} incoming={incoming} now={now} onOpen={(id) => { setActiveId(id); setScreen("charge"); }} />
        ) : null}
        {screen === "exit" && settings ? (
          <ExitCheck settings={settings} onBack={() => setScreen(active ? "charge" : "keypad")} onExit={onExit} />
        ) : null}
      </div>
    </div>
  );
}

function Setup({ pub, initial, settings, onSave }: { pub: WalletPublic; initial: CashierConfig | null; settings?: SettingsActions; onSave: (c: CashierConfig) => Promise<void> }) {
  const [currency, setCurrency] = useState(initial?.currency ?? "EUR");
  const [speed, setSpeed] = useState<Speed>(initial?.speed ?? "quick");
  const [shopName, setShopName] = useState(initial?.shopName ?? "");
  // No default on first setup: two tills that both kept "Till 1" would share addresses.
  // (A till saved before this choice existed is till 1, as it always was.)
  const [tillNumber, setTillNumber] = useState<number | null>(initial ? initial.tillNumber ?? 1 : null);
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className={styles.setup} onSubmit={async (e) => {
      e.preventDefault();
      setError(null);
      if (tillNumber === null) return setError("Choose this till's number first.");
      setBusy(true);
      try {
        // Staff at the till must not be able to change which addresses it uses (or its prices).
        if (!settings) throw new Error("The till cannot be set up from here.");
        await settings.checkAccess(pw, code);
        await onSave({ currency, speed, tillNumber, ...(shopName.trim() ? { shopName: shopName.trim().slice(0, 60) } : {}) });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(false);
      }
    }}>
      <h2 className={styles.h}>Set up the till</h2>
      <p className="muted" style={{ margin: 0 }}>
        Type a price, let the customer scan, and watch it turn green. Each sale gets its own address, and the sales list is
        kept encrypted on this device only.
      </p>
      {pub.kind === "full" ? (
        <div className="notice notice-warn">
          <span>
            <strong>Tip: use a watch-only wallet on the till.</strong> It sees payments but cannot spend, so a lost or stolen
            tablet cannot lose you money. A full wallet also locks itself when idle, which interrupts sales.
          </span>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="c-shop">Shop name (optional)</label>
        <input id="c-shop" className="input" maxLength={60} autoComplete="off" placeholder="For example: Corner Coffee" value={shopName} onChange={(e) => setShopName(e.target.value)} />
        <span className="hint">Shown in the customer&apos;s wallet as who they are paying.</span>
      </div>
      <div className="field">
        <label htmlFor="c-till">Till number</label>
        <select id="c-till" className="input" value={tillNumber ?? ""} required onChange={(e) => setTillNumber(e.target.value ? Number(e.target.value) : null)}>
          {tillNumber === null ? <option value="">Choose a number</option> : null}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>Till {n}</option>)}
        </select>
        <span className="hint">Give every device that runs a till on this wallet its own number, so no two tills ever use the same payment address. Only one till? Choose 1.</span>
      </div>
      <div className="field">
        <label htmlFor="c-cur">Prices in</label>
        <select id="c-cur" className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {MAIN_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          <option value="XMR">XMR (no conversion)</option>
        </select>
        <span className="hint">Prices in your currency are converted at a live rate, held for 15 minutes per sale.</span>
      </div>
      <fieldset className={styles.speeds}>
        <legend>When is a sale paid?</legend>
        {SPEEDS.map((s) => (
          <label key={s.id} className={`${styles.speed} ${speed === s.id ? styles.speedOn : ""}`}>
            <input type="radio" name="speed" value={s.id} checked={speed === s.id} onChange={() => setSpeed(s.id)} />
            <span><strong>{s.title}</strong><span>{s.text}</span></span>
          </label>
        ))}
      </fieldset>
      {settings ? <Credentials totp={settings.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="till-setup" /> : null}
      {error ? <p className="error" role="alert" style={{ margin: 0 }}>{error}</p> : null}
      <button className="btn btn-primary btn-lg" disabled={busy || tillNumber === null || (!!settings && !pw)}>{busy ? "Saving…" : "Save and open the till"}</button>
    </form>
  );
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"] as const;

function Keypad({ config, pub, wallet, onCreated, usedIndexes }: { config: CashierConfig; pub: WalletPublic; wallet: LiveWallet; onCreated: (s: Sale) => Promise<void>; usedIndexes: number[] }) {
  const [entry, setEntry] = useState("");
  const [note, setNote] = useState("");
  const [rate, setRate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fiat = isFiat(config.currency);
  const maxDecimals = fiat ? 2 : 6;

  // A live estimate while typing (the real rate is fetched again when charging).
  useEffect(() => {
    if (!fiat) return;
    let alive = true;
    const load = () => void fetchPriceFeed().then((f) => { if (alive) setRate(f.rates[config.currency] ?? null); }).catch(() => { if (alive) setRate(null); });
    load();
    const t = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, [fiat, config.currency]);

  const press = useCallback((k: string) => {
    setError(null);
    setEntry((v) => {
      if (k === "back") return v.slice(0, -1);
      if (k === "clear") return "";
      if (k === ".") return v.includes(".") ? v : (v || "0") + ".";
      const next = v === "0" ? k : v + k;
      const [w, f = ""] = next.split(".");
      if ((w ?? "").length > 9 || f.length > maxDecimals) return v;
      return next;
    });
  }, [maxDecimals]);

  // Hardware keyboards and barcode-style number pads work too.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "." || e.key === ",") press(".");
      else if (e.key === "Backspace") press("back");
      else if (e.key === "Escape") press("clear");
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const value = entry.replace(/\.$/, "");
  const positive = !!value && Number(value) > 0;
  let estimate: string | null = null;
  if (positive && fiat && rate) {
    try { estimate = `about ${formatXmr(fiatToAtomic(value, rate), 6)} XMR`; } catch { estimate = null; }
  }

  async function charge() {
    if (!positive || busy) return;
    setBusy(true);
    setError(null);
    try {
      await checkClock();
      const nowMs = serverNow();
      let price: { xmr: bigint } | { fiat: string; quote: Awaited<ReturnType<typeof fetchQuote>> };
      let expected: bigint;
      // The quote's age on the price server's own clock, when the offset is known.
      let quoteAgeMs: number | undefined;
      if (fiat) {
        const quote = await fetchQuote(config.currency);
        price = { fiat: value, quote };
        expected = fiatToAtomic(value, quote.rate);
        if (clockOffset() !== null) quoteAgeMs = serverNow() - quote.quotedAt;
      } else {
        const a = parseXmr(value);
        if (a === null) throw new InvoiceError(xmrAmountProblem(value) ?? "Enter an amount.");
        if (a <= 0n) throw new InvoiceError("Enter an amount.");
        price = { xmr: a };
        expected = a;
      }
      const ref = note.trim();
      const label = `Sale ${new Date(nowMs).toLocaleString()}${ref ? `: ${ref}` : ""}`.slice(0, 100);
      const account = tillAccount(config.tillNumber ?? 1);
      const { address, index } = await freshAddress(wallet, label, usedIndexes, expected, account);
      const invoice = createInvoice({
        id: crypto.randomUUID(), subaddressIndex: index, address, now: serverNow(), price, ...(quoteAgeMs !== undefined ? { quoteAgeMs } : {}),
        policy: CONFIRMATION_PRESETS[config.speed], ...(ref ? { reference: ref.slice(0, 64) } : {}),
      });
      await onCreated({ invoice: invoiceToJson(invoice), seen: {}, account });
      setEntry("");
      setNote("");
    } catch (err) {
      setError(err instanceof PriceUnavailableError || err instanceof InvoiceError || err instanceof StorageError
        ? err.message
        : "The sale could not be started. Check the connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.keypadWrap}>
      <div className={styles.display} aria-live="polite">
        <span className={styles.displayLabel}>Amount to charge</span>
        <output className={styles.amount} aria-label="Amount">{entry ? money(entry.endsWith(".") ? entry + "0" : entry, config.currency) : money("0", config.currency)}</output>
        <span className={styles.estimate}>{fiat ? (estimate ?? (rate ? " " : "Live rate loading…")) : " "}</span>
      </div>
      <div className={styles.keys} role="group" aria-label="Number pad">
        {KEYS.map((k) => (
          <button key={k} type="button" className={styles.key} onClick={() => press(k)} aria-label={k === "back" ? "Delete last digit" : k === "." ? "Decimal point" : k}>
            {k === "back" ? <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5h11v14H9l-6-7z" /><path d="m12.5 9.5 5 5m0-5-5 5" /></svg> : k}
          </button>
        ))}
      </div>
      <div className="field">
        <label htmlFor="c-ref">Reference (optional)</label>
        <input id="c-ref" className="input" maxLength={64} autoComplete="off" placeholder="Order number or item" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {error ? <p className="error" role="alert" style={{ margin: 0 }}>{error}</p> : null}
      <div className={`${styles.keyActions} ${styles.padActions}`}>
        <button type="button" className="btn btn-secondary btn-lg" onClick={() => press("clear")} disabled={!entry}>Clear</button>
        <button type="button" className={`btn btn-primary btn-lg ${styles.chargeBtn}`} onClick={() => void charge()} disabled={!positive || busy}>
          {busy ? "Preparing…" : positive ? `Charge ${money(value, config.currency)}` : "Charge"}
        </button>
      </div>
      {pub.network !== "mainnet" ? <p className="small muted" style={{ margin: 0 }}>Test network ({pub.network}): practice coins only.</p> : null}
    </div>
  );
}

/** A sale counts towards takings when it is paid and not cancelled or refunded, or when the merchant accepted it. */
function countsAsPaid(sale: Sale, st: InvoiceStatus): boolean {
  return sale.resolution === "accepted" || (st.kind === "paid" && !sale.resolution);
}

function statusLine(s: InvoiceStatus): string {
  switch (s.kind) {
    case "waiting": return "Waiting for payment";
    case "expired": return "Price expired";
    case "partial": return "Partly paid";
    case "confirming": return s.required === 0 ? "Payment seen" : `Confirming ${s.confirmations} of ${s.required}`;
    case "paid": return s.overpaid > 0n ? "Paid (overpaid)" : "Paid";
    case "late": return "Paid late: review";
  }
}

function Charge({ sale, config, incoming, now, onNew, onResolve }: {
  sale: Sale; config: CashierConfig; incoming: IncomingEntry[]; now: number;
  onNew: () => void; onResolve: (r: NonNullable<Sale["resolution"]>) => Promise<void>;
}) {
  const inv = useMemo(() => invoiceFromJson(sale.invoice), [sale.invoice]);
  const status = saleStatus(sale, incoming, now);
  const due = inv.amount ?? 0n;
  const priceText = inv.fiat ? money(inv.fiat.amount, inv.fiat.currency) : `${formatXmr(due, 6)} XMR`;
  const left = inv.expiresAt ? Math.max(0, inv.expiresAt - now) : null;
  const mmss = left !== null ? `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, "0")}` : null;
  const qrAmount = status.kind === "partial" ? status.remaining : due;
  // Never let one bad record take the till down: fall back to the bare address.
  let uri: string;
  try {
    uri = buildPaymentUri({ address: inv.address, amount: qrAmount > 0n ? qrAmount : undefined, note: inv.reference, name: config.shopName });
  } catch {
    uri = `monero:${inv.address}`;
  }

  if (sale.resolution === "cancelled") {
    return (
      <div className={styles.result}>
        <h2 className={styles.h}>Sale cancelled</h2>
        <p className="muted">{priceText}{inv.reference ? `, ${inv.reference}` : ""}. {status.kind !== "waiting" && status.kind !== "expired" ? "A payment arrived anyway: refund it or accept it." : ""}</p>
        <div className={styles.keyActions}>
          {status.kind !== "waiting" && status.kind !== "expired" ? (
            <>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => void onResolve("refund")}>Needs refund</button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => void onResolve("accepted")}>Accept payment</button>
            </>
          ) : null}
          <button type="button" className="btn btn-primary btn-lg" onClick={onNew}>New sale</button>
        </div>
      </div>
    );
  }

  if (sale.resolution === "refund") {
    const got = status.kind === "waiting" || status.kind === "expired" ? 0n : status.received;
    return (
      <div className={`${styles.result} ${styles.review}`}>
        <h2 className={styles.h}>Marked for refund</h2>
        <p>
          <strong>{formatXmr(got, 6)} XMR</strong> arrived for {priceText}{inv.reference ? `, ${inv.reference}` : ""}. Send it back from your full wallet:
          Monero hides the sender, so ask the customer for their refund address.
        </p>
        <div className={styles.keyActions}>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => void onResolve("accepted")}>Accept as paid instead</button>
          <button type="button" className="btn btn-primary btn-lg" onClick={onNew}>Back to the till</button>
        </div>
      </div>
    );
  }

  if (status.kind === "paid" || sale.resolution === "accepted") {
    const overpaid = status.kind === "paid" ? status.overpaid : 0n;
    return (
      <div className={`${styles.result} ${styles.paid}`} role="status" aria-live="assertive">
        <span className={styles.tick} aria-hidden="true">
          <svg viewBox="0 0 48 48" width="72" height="72"><circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="3" /><path d="m14 25 7 7 14-15" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h2 className={styles.paidH}>Paid</h2>
        <p className={styles.paidAmt}>{priceText}</p>
        <p className={styles.paidSub}>{formatXmr(status.kind === "paid" ? status.received : due, 6)} XMR received{inv.reference ? `, ${inv.reference}` : ""}</p>
        {overpaid > 0n ? <p className={styles.paidNote}>The customer sent {formatXmr(overpaid, 6)} XMR too much. Refund it if they ask.</p> : null}
        {sale.resolution === "accepted" ? <p className={styles.paidNote}>Accepted after review.</p> : null}
        <button type="button" className={`btn btn-lg ${styles.newBtn}`} onClick={onNew} autoFocus>New sale</button>
      </div>
    );
  }

  if (status.kind === "late") {
    const nowValue = inv.fiat ? money(atomicToFiat(status.received, inv.fiat.rate), inv.fiat.currency) : null;
    return (
      <div className={`${styles.result} ${styles.review}`} role="alert">
        <h2 className={styles.h}>Payment arrived after the price expired</h2>
        <p>
          The customer sent <strong>{formatXmr(status.received, 6)} XMR</strong> for a sale of <strong>{priceText}</strong>
          {nowValue ? <> (worth {nowValue} at the held rate)</> : null}, but it arrived after the 15-minute price hold ended.
          {status.pending ? " It is not confirmed yet." : ""}
        </p>
        <p className="small muted">If the price moved, you may want to ask for the difference or refund it. Monero hides the sender, so ask the customer for a refund address.</p>
        <div className={styles.keyActions}>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => void onResolve("refund")}>{sale.resolution === "refund" ? "Marked for refund" : "Needs refund"}</button>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => void onResolve("accepted")}>Accept as paid</button>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onNew}>Back to the till</button>
      </div>
    );
  }

  if (status.kind === "expired") {
    return (
      <div className={styles.result}>
        <h2 className={styles.h}>Price expired</h2>
        <p className="muted">No payment arrived for {priceText} within 15 minutes. Start the sale again for a fresh rate.</p>
        <div className={styles.keyActions}>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => void onResolve("cancelled")}>Cancel sale</button>
          <button type="button" className="btn btn-primary btn-lg" onClick={onNew}>Back to the till</button>
        </div>
      </div>
    );
  }

  const confirming = status.kind === "confirming";
  return (
    <div className={styles.charge}>
      <div className={styles.qrSide}>
        <div className={`${styles.qrFrame} ${confirming ? styles.qrDim : ""}`}>
          <Qr value={uri} label={`Payment QR code for ${priceText}`} size={340} />
        </div>
        <p className={styles.scan}>{confirming ? "Payment received" : "Scan with any Monero wallet"}</p>
      </div>
      <div className={styles.info}>
        <span className={styles.displayLabel}>{inv.reference ?? "Sale"}</span>
        <p className={styles.chargeAmt}>{priceText}</p>
        <p className={styles.chargeXmr}>{formatXmr(due, 6)} XMR{inv.fiat ? <span> at {money(inv.fiat.rate, inv.fiat.currency)} per XMR</span> : null}</p>

        <div className={`${styles.state} ${confirming ? styles.stateGood : ""}`} role="status" aria-live="polite">
          <span className={styles.pulse} aria-hidden="true" />
          <div>
            <strong>{statusLine(status)}</strong>
            {status.kind === "partial" ? (
              <span>{formatXmr(status.received, 6)} XMR received. <b>{formatXmr(status.remaining, 6)} XMR</b> still to pay: the QR now asks for the rest.</span>
            ) : confirming ? (
              <span>{status.required === 0 ? "Accepting now…" : `Usually about ${Math.max(1, (status.required - status.confirmations) * 2)} minutes. You can start the next sale; this one keeps updating in Sales.`}</span>
            ) : (
              <span>{mmss ? <>Price held for <b className="tnum">{mmss}</b></> : "Leave this screen open until it turns green."}</span>
            )}
          </div>
        </div>
        {confirming && status.required > 0 ? (
          <div className={styles.confBar} aria-hidden="true"><span style={{ width: `${Math.min(100, (status.confirmations / status.required) * 100)}%` }} /></div>
        ) : null}

        <div className={styles.keyActions}>
          {confirming ? <button type="button" className="btn btn-secondary btn-lg" onClick={onNew}>Next sale</button>
            : <button type="button" className="btn btn-secondary btn-lg" onClick={() => void onResolve("cancelled")}>Cancel sale</button>}
        </div>
        <details className={styles.addrBox}>
          <summary>Address and details</summary>
          <p className="mono small" style={{ wordBreak: "break-all", margin: 0 }}>{inv.address}</p>
          <p className="small muted" style={{ margin: 0 }}>A fresh address for this sale only. Payments to it are matched to this sale, whatever the amount.</p>
        </details>
      </div>
    </div>
  );
}

function Sales({ sales, incoming, now, onOpen }: { sales: Sale[]; incoming: IncomingEntry[]; now: number; onOpen: (id: string) => void }) {
  if (!sales.length) return <p className="muted">No sales yet. They will appear here, newest first.</p>;
  const groups = new Map<string, Sale[]>();
  for (const s of sales) {
    const day = new Date(s.invoice.createdAt).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
    groups.set(day, [...(groups.get(day) ?? []), s]);
  }
  return (
    <div className={styles.sales}>
      <div className={styles.salesHead}>
        <h2 className={styles.h}>Sales</h2>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => downloadCsv("sales", salesCsv(sales, incoming, serverNow()))}>Export CSV</button>
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        Kept encrypted on this device. Tap a sale to see it again or settle it. The export is for your accountant: it is saved to this
        device&apos;s downloads, unencrypted, so keep it somewhere safe.
      </p>
      {[...groups.entries()].map(([day, list]) => {
        const totals = new Map<string, number>();
        let xmr = 0n;
        for (const s of list) {
          const st = saleStatus(s, incoming, now);
          if (!countsAsPaid(s, st)) continue;
          const inv = invoiceFromJson(s.invoice);
          xmr += st.kind === "paid" ? st.received : inv.amount ?? 0n;
          if (inv.fiat) totals.set(inv.fiat.currency, (totals.get(inv.fiat.currency) ?? 0) + Number(inv.fiat.amount));
        }
        const fiatTotal = [...totals.entries()].map(([c, v]) => money(v.toFixed(2), c)).join(", ");
        return (
          <section key={day} className={styles.day}>
            <div className={styles.dayHead}>
              <h3>{day}</h3>
              <span>{fiatTotal ? `${fiatTotal}, ` : ""}{formatXmr(xmr, 6)} XMR paid</span>
            </div>
            <ul className={styles.saleList}>
              {list.map((s) => {
                const inv = invoiceFromJson(s.invoice);
                const st = saleStatus(s, incoming, now);
                // Money that arrives for a cancelled sale must not hide behind "Cancelled".
                const paidAfterCancel = s.resolution === "cancelled" && st.kind !== "waiting" && st.kind !== "expired";
                const label = paidAfterCancel ? "Paid after cancel: review" : s.resolution === "cancelled" ? "Cancelled" : s.resolution === "accepted" ? "Paid (accepted)" : s.resolution === "refund" ? "Needs refund" : statusLine(st);
                const tone = paidAfterCancel || st.kind === "late" || s.resolution === "refund" ? styles.tWarn
                  : s.resolution === "accepted" || (st.kind === "paid" && !s.resolution) ? styles.tPaid
                  : s.resolution === "cancelled" || st.kind === "expired" ? styles.tIdle : styles.tWait;
                return (
                  <li key={inv.id}>
                    <button type="button" className={styles.saleRow} onClick={() => onOpen(inv.id)}>
                      <span className={styles.saleTime}>{new Date(inv.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
                      <span className={styles.saleWhat}>
                        <strong>{inv.fiat ? money(inv.fiat.amount, inv.fiat.currency) : `${formatXmr(inv.amount ?? 0n, 6)} XMR`}</strong>
                        <span>{inv.reference ?? `${formatXmr(inv.amount ?? 0n, 6)} XMR`}</span>
                      </span>
                      <span className={`${styles.tag} ${tone}`}>{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ExitCheck({ settings, onBack, onExit }: { settings: SettingsActions; onBack: () => void; onExit: () => void }) {
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className={styles.setup} onSubmit={async (e) => {
      e.preventDefault();
      setBusy(true);
      setError(null);
      try { await settings.checkAccess(pw, code); onExit(); } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
    }}>
      <h2 className={styles.h}>Leave cashier mode</h2>
      <p className="muted" style={{ margin: 0 }}>Enter the wallet password, so staff using the till cannot open the wallet itself.</p>
      <Credentials totp={settings.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="cashier-exit" />
      {error ? <p className="error" role="alert" style={{ margin: 0 }}>{error}</p> : null}
      <div className={styles.keyActions}>
        <button type="button" className="btn btn-secondary btn-lg" onClick={onBack}>Stay in cashier</button>
        <button className="btn btn-primary btn-lg" disabled={busy || !pw}>{busy ? "Checking…" : "Leave"}</button>
      </div>
    </form>
  );
}
