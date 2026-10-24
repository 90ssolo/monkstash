"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Credentials, LoadMoveFile, NodeSettings, RescanFrom, RevealWords, SaveMoveFile, type SettingsActions } from "./WalletSettings";
import { WalletSwitcher } from "./WalletSwitcher";
import { FiatValue } from "./FiatValue";
import type { WalletSummary } from "@/lib/wallet/session";
import { ChangePassword, TwoFactor, WatchOnlyKeys } from "./Security";
import { Checkup, checkupItems, checkupScore, useLocalChecks } from "./Checkup";
import { addressNetwork, aliasChanged, atomicToFiat, buildPaymentFragment, checkContact, ContactError, contactForAddress, contactForAlias, lookalikeContact, type Contact, buildPaymentUri, checkAddressFormat, checkReturnUrl, fiatToAtomic, formatXmr, NOTE_MAX, openAliasFqdn, parsePaymentUri, parseXmr, paymentLink, shortAddress, xmrAmountProblem, type WalletPublic } from "@quietmint/wallet-core";
import { fetchPriceFeed, fetchQuote, MAIN_CURRENCIES, PriceUnavailableError } from "@/lib/prices";
import { fiatText, localCurrency } from "@/lib/localCurrency";
import { recordRequestSeen, statusOf, type PaymentRequest, type RequestStatus, type RequestStore } from "@/lib/wallet/requests";
import type { Balances, IncomingEntry, LiveWallet, SyncHealth, SyncState, TxSummary, TxWhere } from "@/lib/wallet/engine";
import { ACCOUNT_NAME, CHECKPOINT_BLOCKS } from "@/lib/wallet/engine";
import { checkClock, clockWarning, serverNow, useClockOffset } from "@/lib/wallet/clock";
import { apiUrl } from "@/lib/wallet/config";
import { validateAddress } from "@/lib/wallet/engine";
import { downloadCsv, historyCsv, requestsCsv } from "@/lib/wallet/exports";
import Link from "next/link";
import type { TestMode } from "@/lib/wallet/demo";
import { MoneroSymbol } from "@/components/art/MoneroSymbol";
import { CopyButton } from "./CopyButton";
import { Cashier } from "./Cashier";
import { ContactChips, ContactManager, TamperAlarm } from "./Contacts";
import { CheckProof, ProveSent } from "./Proofs";
import type { ContactStore } from "@/lib/wallet/contacts";
import { freshAddress } from "@/lib/wallet/addresses";
import { payLinkOrigin, siteHref } from "@/lib/site";
import type { CashierStore } from "@/lib/wallet/cashier";
import { Qr } from "./Qr";
import { AUTO_LOCK_HIDDEN_MS, AUTO_LOCK_IDLE_MS } from "@/lib/wallet/autolock";
import styles from "./wallet.module.css";

interface DemoInfo { mode: TestMode; fellBack: boolean; assignedLabel: string; onSwitchMode: (m: TestMode) => void }

/** After this long without a successful sync, the wallet says it is not connected. */
const STALE_MS = 2 * 60 * 1000;
const timeText = (ms: number) => new Date(ms).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

/** A request opened from a /pay link ("Pay with MonkStash"). */
interface Prefill { address: string; amount?: bigint; note?: string; expiresAt?: number }

type Section = "home" | "send" | "receive" | "paid" | "activity" | "contacts" | "checkup" | "settings" | "more";

const ICONS: Record<Section, React.ReactNode> = {
  home: <><path d="M4 11 12 4l8 7" /><path d="M6 10v10h12V10" /><path d="M10 20v-5h4v5" /></>,
  send: <><path d="M12 20V8" /><path d="m6.5 13.5 5.5-5.5 5.5 5.5" /><path d="M5 4h14" /></>,
  receive: <><path d="M12 4v12" /><path d="m6.5 10.5 5.5 5.5 5.5-5.5" /><path d="M5 20h14" /></>,
  paid: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  activity: <path d="M4 12h3.5l2.5-6 4 12 2.5-6H20" />,
  contacts: <><circle cx="10" cy="8" r="3.2" /><path d="M4 19c.8-3.4 3.2-5 6-5s5.2 1.6 6 5" /><path d="M17 7h4M19 5v4" /></>,
  checkup: <><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" /><path d="m9 12 2 2 4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></>,
  more: <><circle cx="5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="19" cy="12" r="1.4" /></>,
};
const LABEL: Record<Section, string> = {
  home: "Home", send: "Send", receive: "Receive", paid: "Get paid", activity: "Activity",
  contacts: "Contacts", checkup: "Checkup", settings: "Settings", more: "More",
};
/** Desktop rail: everyday tasks first, then the rest below a divider. */
const RAIL_MAIN: Section[] = ["home", "send", "receive", "paid", "activity"];
const RAIL_MORE: Section[] = ["contacts", "checkup", "settings"];
/** Phone bottom bar: five slots; "More" holds the rest. */
const BAR: Section[] = ["home", "send", "receive", "paid", "more"];
const MORE_LIST: Section[] = ["activity", "contacts", "checkup", "settings"];
/**
 * Compact view (the browser extension's popup): only quick everyday tasks. Everything else opens
 * in the full view, at that section, instead of being squeezed into a small window.
 */
const COMPACT: Section[] = ["home", "send", "receive", "activity", "more"];
const COMPACT_BAR: Section[] = ["home", "send", "receive", "activity", "more"];
const COMPACT_MORE: Section[] = ["paid", "contacts", "checkup", "settings"];
const SECTIONS = Object.keys(LABEL) as Section[];

/** A section asked for in the address (#section=settings), as the extension's full view opens it. */
function sectionFromHash(): Section | null {
  if (typeof window === "undefined") return null;
  const m = /^#section=([a-z]+)$/.exec(window.location.hash);
  const s = m?.[1] as Section | undefined;
  if (!s || !SECTIONS.includes(s)) return null;
  history.replaceState(null, "", window.location.pathname);
  return s;
}

/** Set by the extension's popup: quick tasks here, the rest opens in the full view. */
export interface CompactView {
  openFull(section: string): void;
}

function NavIcon({ s }: { s: Section }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{ICONS[s]}</svg>;
}

/** The web wallet's choice to lock after the tab is left; the extension has no such toggle. */
export interface LockOnLeave { on: boolean; onChange: (on: boolean) => void }

/** The wallets in this browser and what the wallet menu can do with them. */
export interface WalletMenu {
  wallets: WalletSummary[];
  onSwitch: (id: string) => Promise<void>;
  onAdd: () => void;
  onRename: (name: string) => Promise<void>;
}

export function Dashboard({ pub, wallet, onLock, onRemove, onSynced, settings, requests, cashier, contacts, onCashierChange, demo, compact, leaveText = "you leave this tab", leaveDelay, lockOnLeave, walletMenu }: { pub: WalletPublic; wallet: LiveWallet; onLock: () => void; onRemove: () => void; onSynced?: () => void; settings?: SettingsActions; requests?: RequestStore; cashier?: CashierStore; contacts?: ContactStore; onCashierChange?: (on: boolean) => void; demo?: DemoInfo; compact?: CompactView; leaveText?: string; leaveDelay?: string; lockOnLeave?: LockOnLeave; walletMenu?: WalletMenu }) {
  const [sync, setSync] = useState<SyncState | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [bal, setBal] = useState<Balances | null>(null);
  const [txs, setTxs] = useState<TxSummary[]>([]);
  const [incoming, setIncoming] = useState<IncomingEntry[]>([]);
  const [section, setSection] = useState<Section>(() => sectionFromHash() ?? "home");
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [tillOpen, setTillOpen] = useState(false);
  // Privacy screen: hide amounts in public or while sharing a screen. A per-device preference.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try { setHidden(localStorage.getItem("monkstash.hideAmounts") === "1"); } catch { /* storage blocked */ }
  }, []);
  const toggleHidden = () => {
    setHidden((h) => {
      try { localStorage.setItem("monkstash.hideAmounts", h ? "0" : "1"); } catch { /* storage blocked */ }
      return !h;
    });
  };
  const [contactList, setContactList] = useState<Contact[]>([]);
  useEffect(() => {
    let alive = true;
    void contacts?.load().then((l) => { if (alive) setContactList(l); });
    return () => { alive = false; };
  }, [contacts]);
  // Save first, then show: a failed save must never look saved.
  const saveContacts = useCallback(async (list: Contact[]) => {
    await contacts?.save(list);
    setContactList(list);
  }, [contacts]);
  const local = useLocalChecks(pub);
  const clockMsg = clockWarning(useClockOffset());
  // Node health after the first sync: a node that stops answering must not leave "Up to date" on screen.
  const [health, setHealth] = useState<SyncHealth | null>(null);
  useEffect(() => {
    if (!wallet.health) return;
    const read = () => setHealth(wallet.health!());
    read();
    const t = setInterval(read, 10_000);
    return () => clearInterval(t);
  }, [wallet]);
  const started = useRef(false);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    try {
      setBal(await wallet.balances());
      setTxs(await wallet.txs());
      setIncoming(await wallet.incoming());
    } catch {
      /* wallet may be closing */
    }
  }, [wallet]);

  const runSync = useCallback(async () => {
    setSyncError(null);
    // Public nodes stall on large block downloads now and then ("Exception in thread pool"). The
    // wallet keeps every block it already scanned, so carry on: keep retrying while each attempt
    // makes progress, and show the error only after 3 failures in a row that got nowhere. A lock
    // stops syncing on purpose and is not retried.
    let reached = -1;
    let stuck = 0;
    let height = -1;
    for (;;) {
      try {
        await wallet.sync((s) => { height = s.height; setSync(s); });
        await refresh();
        await wallet.startBackgroundSync();
        onSynced?.();
        return;
      } catch (e) {
        const msg = (e as Error).message || "Could not reach the Monero node.";
        if (msg === "Sync stopped.") return;
        if (height > reached) { reached = height; stuck = 0; } else stuck++;
        if (stuck >= 3) { setSyncError(msg); return; }
        await new Promise((r) => setTimeout(r, [3_000, 10_000, 20_000][stuck] ?? 20_000));
      }
    }
  }, [wallet, refresh, onSynced]);

  useEffect(() => {
    const t = setInterval(() => { void wallet.incoming().then(setIncoming).catch(() => {}); }, 5000);
    return () => clearInterval(t);
  }, [wallet]);

  // "Pay with MonkStash" from a /pay link: open Send with the request filled in.
  useEffect(() => {
    if (!window.location.hash.startsWith("#pay=")) return;
    try {
      const r = parsePaymentUri(window.location.hash);
      setPrefill({ address: r.address, amount: r.amount, note: r.note, ...(r.expiresAt !== undefined ? { expiresAt: r.expiresAt } : {}) });
      setSection("send");
    } catch {
      /* not a valid request: ignore */
    }
    history.replaceState(null, "", window.location.pathname);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    wallet.onBalances((b) => { setBal(b); void refresh(); });
    void runSync();
  }, [wallet, runSync, refresh]);

  // Cashier mode covers the whole screen; the page underneath must not scroll.
  useEffect(() => {
    onCashierChange?.(tillOpen);
    if (!tillOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; onCashierChange?.(false); };
  }, [tillOpen, onCashierChange]);

  // Payment requests, for the Home summary card (reloaded whenever Home is shown).
  const [reqList, setReqList] = useState<PaymentRequest[]>([]);
  useEffect(() => {
    if (section !== "home" || !requests) return;
    let alive = true;
    void requests.load().then((l) => { if (alive) setReqList(l); });
    return () => { alive = false; };
  }, [section, requests]);

  const pct = sync ? Math.min(100, Math.round(sync.percent * 1000) / 10) : 0;
  const synced = !!sync?.done;
  const stale = synced && !syncError && !!health?.lastOk && Date.now() - health.lastOk > STALE_MS;
  const lastChecked = health?.lastOk ? timeText(health.lastOk) : null;
  const longScan = !!sync && !sync.done && sync.height >= pub.restoreHeight && sync.endHeight - sync.height > CHECKPOINT_BLOCKS;

  const items = checkupItems({
    pub, totpEnabled: settings?.totpEnabled ?? pub.totpEnabled, ownNode: !!settings?.node, synced,
    contacts: contactList.length, backupAt: local.backupAt, bookmarked: local.bookmarked,
  });
  const score = checkupScore(items);

  const go = (s: Section) => {
    if (compact && !COMPACT.includes(s)) {
      compact.openFull(s);
      return;
    }
    setSection(s);
    // Start each section at its top (phones would otherwise keep the old scroll position).
    requestAnimationFrame(() => {
      const top = mainRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) mainRef.current?.scrollIntoView({ block: "start" });
      // Move focus to the new section's heading, so keyboard and screen reader users land on it.
      mainRef.current?.querySelector<HTMLElement>(":scope > section:not([hidden]) h2[tabindex]")?.focus({ preventScroll: true });
    });
  };
  const active = (s: Section) => section === s || (s === "more" && (compact ? COMPACT_MORE : MORE_LIST).includes(section));
  const bar = compact ? COMPACT_BAR : BAR;
  const moreList = compact ? COMPACT_MORE : MORE_LIST;
  const balanceText = hidden ? "••••" : bal && synced ? `${formatXmr(bal.total, 4)} XMR` : "…";

  let openRequests = 0;
  let paidToday = 0;
  const today = new Date().toDateString();
  for (const r of reqList) {
    const st = statusOf(r, incoming);
    if (st.kind === "unpaid" || st.kind === "arriving" || st.kind === "partial" || st.kind === "confirming") openRequests++;
    if (st.kind === "paid" && new Date(r.createdAt).toDateString() === today) paidToday++;
  }

  return (
    <div className={styles.wallet}>
      {tillOpen && cashier ? (
        <Cashier pub={pub} wallet={wallet} store={cashier} settings={settings} synced={!!sync?.done} offlineSince={stale ? lastChecked : null} onExit={() => setTillOpen(false)} />
      ) : null}
      {demo ? (
        <div className={`notice notice-warn ${styles.demoBar}`}>
          <span>
            <strong>Demo wallet.</strong> Assigned <strong>{demo.assignedLabel}</strong>. Mode:{" "}
            <strong>{demo.mode === "simulation" ? "Simulation (mock data)" : "Stagenet (live test node)"}</strong>
            {demo.fellBack ? " (node unreachable, using simulation)" : ""}. <Link href="/dev/wallets">Admin</Link>
          </span>
          <span className={styles.modeSwitch}>
            <button className="btn btn-secondary btn-sm" disabled={demo.mode === "stagenet" && !demo.fellBack}
              onClick={() => demo.onSwitchMode("stagenet")}>Stagenet</button>
            <button className="btn btn-secondary btn-sm" disabled={demo.mode === "simulation"}
              onClick={() => demo.onSwitchMode("simulation")}>Simulation</button>
          </span>
        </div>
      ) : null}

      {/* While the till is open, nothing underneath can be reached by keyboard or screen reader. */}
      <div className={styles.appGrid} inert={tillOpen || undefined}>
        <nav className={styles.navRail} aria-label="Wallet">
          <ul>
            {RAIL_MAIN.map((s) => (
              <li key={s}><button type="button" className={`${styles.navItem} ${active(s) ? styles.navOn : ""}`} aria-current={section === s ? "page" : undefined} title={LABEL[s]} onClick={() => go(s)}>
                <NavIcon s={s} /><span>{LABEL[s]}</span>
              </button></li>
            ))}
          </ul>
          <hr />
          <ul>
            {RAIL_MORE.map((s) => (
              <li key={s}><button type="button" className={`${styles.navItem} ${active(s) ? styles.navOn : ""}`} aria-current={section === s ? "page" : undefined} title={LABEL[s]} onClick={() => go(s)}>
                <NavIcon s={s} /><span>{LABEL[s]}</span>
                {s === "checkup" && score.done < score.total ? <span className={styles.navBadge}>{score.done}/{score.total}</span> : null}
              </button></li>
            ))}
          </ul>
        </nav>

        <div className={styles.content} ref={mainRef}>
          <h1 className="visually-hidden">Your MonkStash wallet</h1>
          <div className={styles.strip}>
            {walletMenu ? <WalletSwitcher current={pub.name} wallets={walletMenu.wallets} onSwitch={walletMenu.onSwitch} onAdd={walletMenu.onAdd} /> : null}
            {/* Only when it tells you something: a test network, or a watch-only wallet. */}
            {pub.network !== "mainnet" || pub.kind === "view-only" ? (
              <span className={styles.heroChip}>{[pub.kind === "view-only" ? "Watch-only" : null, pub.network !== "mainnet" ? pub.network : null].filter(Boolean).join(", ")}</span>
            ) : null}
            <span className={`${styles.syncPill} ${syncError ? styles.syncBad : stale ? styles.syncWarn : synced ? styles.syncOk : ""}`}>
              <span className={styles.syncDot} aria-hidden="true" />
              {syncError ? "Sync stopped" : stale ? `Not connected, last checked ${lastChecked}` : synced ? "Up to date" : !sync ? "Connecting" : sync.height < pub.restoreHeight ? "Preparing" : `Syncing ${Math.floor(pct)}%`}
            </span>
            {section !== "home" ? <span className={styles.stripBal}>{balanceText}</span> : null}
            <button className={`btn btn-ghost btn-sm ${styles.lockBtn}`} onClick={onLock}>
              <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5.2 7V5a2.8 2.8 0 015.6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
              Lock
            </button>
          </div>

          {clockMsg ? <div className="notice notice-warn" role="status"><span>{clockMsg} Payment requests and the till use the time.</span></div> : null}
          {stale ? (
            <div className={styles.syncRow} role="status">
              <span className={styles.heroNote}>
                The wallet has not reached the Monero network since {lastChecked}, so new payments and your balance may be out of date.
                It keeps trying. If this goes on, choose another node in Settings.
              </span>
            </div>
          ) : null}
          {!synced ? (
            <div className={styles.syncRow}>
              {syncError ? (
                <>
                  <span className={styles.heroNote}>Could not reach the Monero network: {syncError} If this keeps happening, choose another node in Settings.</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => void runSync()}>Try again</button>
                </>
              ) : (
                <>
                  <div className={styles.bar} aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
                  <span className={styles.heroNote}>
                    {!sync
                      ? "Connecting to the Monero network…"
                      : sync.height < pub.restoreHeight
                        ? "Getting the block list ready, then the scan carries on."
                        : `Checking for your payments: block ${sync.height.toLocaleString()} of ${sync.endHeight.toLocaleString()}`}
                    {longScan ? " Progress is saved about once a minute, so you can close this tab or press Lock and carry on later." : ""}
                  </span>
                </>
              )}
            </div>
          ) : null}

          {/* Sections stay mounted (hidden when inactive) so a half-filled form survives switching. */}
          <section hidden={section !== "home"} aria-labelledby="bal-h" className={`${styles.section} ${styles.sectionBare}`}>
            <div className={styles.home}>
              <div className={styles.homeBal}>
                <div className={styles.balHead}>
                  <h2 id="bal-h" className={styles.heroLabel} tabIndex={-1}>Balance</h2>
                  <button type="button" className={styles.eye} onClick={toggleHidden} aria-pressed={hidden} title="Hide balance">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" />
                      {hidden ? <path d="M4 4l16 16" /> : null}
                    </svg>
                    {/* Fixed name plus aria-pressed: pressed means the balance is hidden. */}
                    <span>Hide<span className="visually-hidden"> balance</span></span>
                  </button>
                </div>
                <p className={styles.balance}>
                  {hidden ? <><span aria-hidden="true">••••••</span><span className="visually-hidden">Balance hidden</span></>
                    : bal && synced ? formatXmr(bal.total, 6)
                    : <><span className={styles.balancePending} aria-hidden="true">…</span><span className="visually-hidden">Balance loading</span></>}
                  <span className={styles.unit}><MoneroSymbol size={26} /> XMR</span>
                </p>
                <FiatValue atomic={bal && synced ? bal.total : null} hidden={hidden} />
                {bal && synced && !hidden && bal.total - otherTotal(bal) > bal.unlocked ? (
                  <p className={styles.heroNote}><strong>{formatXmr(bal.unlocked, 6)} XMR</strong> spendable now. {unlockNote(txs)}</p>
                ) : null}
                {pub.kind === "view-only" ? (
                  <p className={styles.heroNote}>A watch-only wallet sees money coming in, not money going out, so the real balance may be lower.</p>
                ) : null}
              </div>
              <div className={styles.quick}>
                {(["send", "receive", "paid"] as Section[]).filter((s) => s !== "send" || pub.kind === "full").map((s) => (
                  <button key={s} type="button" className={`btn btn-lg ${styles.quickBtn}`} onClick={() => go(s)}><NavIcon s={s} /> {LABEL[s]}</button>
                ))}
              </div>
            </div>

            {bal?.other?.length && synced ? (
              <div className={styles.panel}>
                <h3 className={styles.recentH}>Shop and till takings</h3>
                <p className="small muted" style={{ margin: "var(--s-2) 0 var(--s-3)" }}>
                  Money paid to your shop checkout or tills sits in its own account, so the tills never share an address. Move it to your main balance to spend it.
                </p>
                {bal.other.map((o) => (
                  <MoveFunds key={o.account} account={o.account} balance={o.balance} unlocked={o.unlocked} wallet={wallet} settings={settings} canSend={pub.kind === "full"} hidden={hidden} onDone={refresh} />
                ))}
              </div>
            ) : null}
            <div className={styles.homeCards}>
              <button type="button" className={styles.homeCard} onClick={() => go("checkup")}>
                <span className={styles.homeCardTop}><NavIcon s="checkup" /> Checkup: {score.done} of {score.total}</span>
                <span className="small muted">{score.next ? `Next: ${score.next.action?.label ?? score.next.title}` : "All done. Nice work."}</span>
              </button>
              {/* The compact popup keeps Home short: this card only when requests are waiting. */}
              {!compact || openRequests ? <button type="button" className={styles.homeCard} onClick={() => go("paid")}>
                <span className={styles.homeCardTop}><NavIcon s="paid" /> {openRequests ? `${openRequests} open payment request${openRequests === 1 ? "" : "s"}` : "Get paid"}</span>
                <span className="small muted">{openRequests || paidToday ? `${paidToday} paid today` : "Payment links and a till for your counter"}</span>
              </button> : null}
            </div>

            <div className={styles.panel}>
              <Activity txs={txs.slice(0, 5)} synced={synced} onReceive={() => go("receive")} wallet={wallet} hidden={hidden} compact onSeeAll={txs.length > 5 ? () => go("activity") : undefined} />
            </div>
          </section>

          <section hidden={section !== "send"} aria-labelledby="send-h" className={styles.section}>
            <h2 id="send-h" className={styles.panelH} tabIndex={-1}>Send Monero</h2>
            {pub.kind === "full" ? (
              <Send key={prefill ? `${prefill.address}${prefill.amount ?? ""}` : "send"} pub={pub} wallet={wallet} settings={settings} synced={synced} unlocked={bal?.unlocked ?? 0n} onSent={refresh} prefill={prefill}
                contacts={contacts ? contactList : null} onSaveContacts={saveContacts} hidden={hidden} />
            ) : (
              <p className="muted">This is a watch-only wallet: it can see payments but has no key to send. Send from the full wallet that holds your recovery words.</p>
            )}
          </section>

          <section hidden={section !== "receive"} aria-labelledby="receive-h" className={styles.section}>
            <h2 id="receive-h" className={styles.panelH} tabIndex={-1}>Receive Monero</h2>
            <AddressView pub={pub} wallet={wallet} requests={requests} />
            <p className="small muted" style={{ marginTop: "var(--s-5)" }}>
              Want a set amount, a price in your currency, or to see when someone has paid?{" "}
              <button type="button" className={styles.inlineLink} onClick={() => go("paid")}>Make a payment request</button>.
            </p>
          </section>

          <section hidden={section !== "paid"} aria-labelledby="paid-h" className={styles.section}>
            <h2 id="paid-h" className={styles.panelH} tabIndex={-1}>Get paid</h2>
            {cashier ? (
              <div className={styles.tillCard}>
                <div>
                  <h3>Selling in person?</h3>
                  <p className="small muted">Cashier mode turns this screen into a till: type a price in your currency, the customer scans, and it shows <strong>Paid</strong>. Best on a watch-only wallet.</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setTillOpen(true)}>Open cashier mode</button>
              </div>
            ) : null}
            <h3 className={styles.recentH}>Payment requests</h3>
            <RequestsView pub={pub} wallet={wallet} requests={requests} incoming={incoming} onChanged={refresh} />
          </section>

          <section hidden={section !== "activity"} aria-label="Activity" className={styles.section}>
            <Activity txs={txs} synced={synced} onReceive={() => go("receive")} wallet={wallet} hidden={hidden} />
          </section>

          <section hidden={section !== "contacts"} aria-labelledby="contacts-h" className={styles.section}>
            <h2 id="contacts-h" className={styles.panelH} tabIndex={-1}>Contacts</h2>
            {contacts ? (
              <ContactManager contacts={contactList} network={pub.network} onSave={saveContacts} onClose={() => go("home")} />
            ) : <p className="muted">Contacts are available once the wallet is unlocked.</p>}
          </section>

          <section hidden={section !== "checkup"} aria-labelledby="checkup-h" className={styles.section}>
            <h2 id="checkup-h" className={styles.panelH} tabIndex={-1}>Checkup</h2>
            <Checkup items={items} actions={settings} walletId={pub.id} onGo={(t) => go(t)} onLocalChange={local.refresh} />
          </section>

          <section hidden={section !== "more"} aria-labelledby="more-h" className={styles.section}>
            <h2 id="more-h" className={styles.panelH} tabIndex={-1}>More</h2>
            <ul className={styles.moreList}>
              {moreList.map((s) => (
                <li key={s}><button type="button" onClick={() => go(s)}><NavIcon s={s} /><span>{LABEL[s]}</span>
                  {s === "checkup" ? <span className="small muted">{score.done} of {score.total}</span> : null}
                  {compact ? <span className="small muted">Opens in a tab</span> : null}
                </button></li>
              ))}
            </ul>
          </section>

          <section hidden={section !== "settings"} aria-labelledby="settings-h" className={styles.section}>
            <h2 id="settings-h" className={styles.panelH} tabIndex={-1}>Settings</h2>
            <div className={styles.setGrid}>
              <section className={styles.setBlock} aria-labelledby="set-details">
                <h3 id="set-details">This wallet</h3>
                {walletMenu ? <RenameWallet name={pub.name} onRename={walletMenu.onRename} /> : null}
                <dl className={styles.facts}>
                  <dt>Type</dt><dd>{pub.kind === "view-only" ? "Watch-only" : "Full wallet"}</dd>
                  <dt>Network</dt><dd>{pub.network}</dd>
                  <dt>Restore height</dt><dd className="tnum">{pub.restoreHeight.toLocaleString()}</dd>
                  <dt>Main address</dt><dd className="mono" title={pub.primaryAddress}>{shortAddress(pub.primaryAddress, 8)}</dd>
                  <dt>App build</dt><dd><BuildFingerprint /></dd>
                </dl>
                <CopyButton value={pub.primaryAddress} label="Copy main address" />
                {settings ? (
                  <>
                    <details className={styles.danger}>
                      <summary>Scan again from an earlier date</summary>
                      <RescanFrom actions={settings} />
                    </details>
                    <details className={styles.danger}>
                      <summary>Move to another device</summary>
                      <SaveMoveFile actions={settings} />
                    </details>
                    <details className={styles.danger}>
                      <summary>Load a move file</summary>
                      <LoadMoveFile actions={settings} />
                    </details>
                  </>
                ) : null}
              </section>

              <section className={styles.setBlock} aria-labelledby="set-security">
                <h3 id="set-security">Security</h3>
                <div className={styles.autolock}>
                  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3" y="7" width="10" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M5.2 7V5a2.8 2.8 0 015.6 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                  {lockOnLeave && !lockOnLeave.on ? (
                    <p>Locks itself after {Math.round(AUTO_LOCK_IDLE_MS / 60000)} minutes idle. While a scan is running, it stays open in a background tab so the scan can finish.</p>
                  ) : (
                    <p>Locks itself after {Math.round(AUTO_LOCK_IDLE_MS / 60000)} minutes idle, or {leaveDelay ?? `${Math.round(AUTO_LOCK_HIDDEN_MS / 60000)} minutes`} after {leaveText}. Every payment asks for your password.</p>
                  )}
                </div>
                {lockOnLeave ? (
                  <label className="check" style={{ margin: "0 0 var(--s-4)" }}>
                    <input type="checkbox" checked={lockOnLeave.on} onChange={(e) => lockOnLeave.onChange(e.target.checked)} />
                    <span>
                      Lock {Math.round(AUTO_LOCK_HIDDEN_MS / 60000)} minutes after I leave this tab.{" "}
                      <span className="muted">Turn off to let a long scan finish while you use other tabs. Your browser may still slow a background tab down. Leave it on if other people use this computer.</span>
                    </span>
                  </label>
                ) : null}
                {settings ? (
                  <>
                    <details className={styles.danger}>
                      <summary>Authenticator code: {settings.totpEnabled ? "on" : "off"}</summary>
                      <TwoFactor actions={settings} />
                    </details>
                    <details className={styles.danger}>
                      <summary>Change password</summary>
                      <ChangePassword actions={settings} />
                    </details>
                    <details className={styles.danger}>
                      <summary>Show recovery words</summary>
                      <RevealWords actions={settings} />
                    </details>
                    <details className={styles.danger}>
                      <summary>Watch-only keys (for a till)</summary>
                      <WatchOnlyKeys actions={settings} />
                    </details>
                  </>
                ) : null}
              </section>

              {settings ? (
                <section className={styles.setBlock} aria-labelledby="set-node">
                  <h3 id="set-node">Connection</h3>
                  <details className={styles.danger}>
                    <summary>Node: {settings.node ? "your own node" : "MonkStash relay"}</summary>
                    <NodeSettings actions={settings} />
                  </details>
                </section>
              ) : null}

              <section className={styles.setBlock} aria-labelledby="set-support">
                <h3 id="set-support">Support MonkStash</h3>
                <p className="small muted" style={{ margin: "0 0 var(--s-3)" }}>
                  MonkStash is free, open source and takes no fee on your payments. If it is useful to you, a donation in XMR keeps it going. The donation wallet is public, so anyone can check what comes in.
                </p>
                <a className="btn btn-secondary btn-sm" href={siteHref("/donate")} target="_blank" rel="noopener">Donate to MonkStash</a>
              </section>

              <section className={`${styles.setBlock} ${styles.setDanger}`} aria-labelledby="set-remove">
                <h3 id="set-remove">Remove from this browser</h3>
                {walletMenu && walletMenu.wallets.length > 1 ? (
                  <p className="small muted" style={{ margin: "0 0 var(--s-2)" }}>Removes only &quot;{pub.name}&quot;. Your other wallets in this browser stay.</p>
                ) : null}
                <details className={styles.danger}>
                  <summary>Remove wallet</summary>
                  <RemoveWallet onRemove={onRemove} settings={settings} kind={pub.kind} />
                </details>
              </section>
            </div>
          </section>
        </div>
      </div>

      <nav className={styles.bottomBar} aria-label="Wallet sections" inert={tillOpen || undefined}>
        {bar.map((s) => (
          <button key={s} type="button" className={active(s) ? styles.barOn : undefined} aria-current={active(s) ? "page" : undefined} onClick={() => go(s)}>
            <NavIcon s={s} /><span>{LABEL[s]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function AddressView({ pub, wallet, requests }: { pub: WalletPublic; wallet: LiveWallet; requests?: RequestStore }) {
  const [address, setAddress] = useState(pub.primaryAddress);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSub = address !== pub.primaryAddress;
  return (
    <div className={styles.receive}>
      <Qr value={`monero:${address}`} label="QR code of your receiving address" />
      <div style={{ minWidth: 0 }}>
        <h3>{isSub ? "A new address" : "Your main address"}</h3>
        <p className={`mono ${styles.addr}`}>{address}</p>
        <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
          <CopyButton value={address} label="Copy address" />
          {pub.kind === "full" ? (
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={async () => {
              setBusy(true);
              setError(null);
              // Same guards as payment requests: never an index a request already uses, and the new
              // index is recorded (sealed) before it is shown, so a later request cannot reuse it.
              try {
                const used = requests ? (await requests.load()).map((r) => r.index) : [];
                setAddress((await freshAddress(wallet, "Receive", used)).address);
              } catch (err) {
                setError((err as Error).message || "A new address could not be made.");
              } finally { setBusy(false); }
            }}>
              {busy ? "Creating…" : "New address"}
            </button>
          ) : null}
        </div>
        {error ? <p className="error small" role="alert">{error}</p> : null}
        <p className="small muted" style={{ marginTop: "var(--s-4)" }}>
          Every address here belongs to your wallet. Giving each person a different one makes your payments harder to link together.
        </p>
      </div>
    </div>
  );
}

const STATUS_TEXT = (s: RequestStatus, amount?: string): string => {
  switch (s.kind) {
    case "unpaid": return "Waiting for payment";
    case "expired": return "Expired, not paid";
    case "late": return `Paid after it expired: ${formatXmr(s.received, 6)} XMR`;
    case "arriving": return "Payment arriving";
    case "partial": return `Partly paid: ${formatXmr(s.received, 6)} of ${amount ? formatXmr(BigInt(amount), 6) : "?"} XMR`;
    case "confirming": return `Paid, confirming ${s.confirmations} of 10`;
    case "paid": return "Paid";
  }
};

const EXPIRY_CHOICES: { label: string; minutes: number | null }[] = [
  { label: "Never", minutes: null },
  { label: "1 hour", minutes: 60 },
  { label: "24 hours", minutes: 60 * 24 },
  { label: "7 days", minutes: 60 * 24 * 7 },
  { label: "30 days", minutes: 60 * 24 * 30 },
];

function moneyText(amount: string, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
}

/** A copy-paste "Pay with Monero" button: plain HTML, no scripts, no tracking. */
function buttonHtml(link: string): string {
  const href = link.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#1f4733;color:#ffffff;font:600 16px/1.2 system-ui,-apple-system,Segoe UI,sans-serif;text-decoration:none">Pay with Monero</a>`;
}

function RequestsView({ pub, wallet, requests, incoming, onChanged }: { pub: WalletPublic; wallet: LiveWallet; requests?: RequestStore; incoming: IncomingEntry[]; onChanged: () => void }) {
  const [list, setListState] = useState<PaymentRequest[] | null>(null);
  // The latest list, for async create/remove: building on the list captured at submit would
  // overwrite first-seen times recorded while the request was being made.
  const listRef = useRef<PaymentRequest[] | null>(null);
  const setList = (l: PaymentRequest[]) => { listRef.current = l; setListState(l); };
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("XMR");
  const [note, setNote] = useState("");
  const [expiry, setExpiry] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [returnUrl, setReturnUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<{ id: string; what: "qr" | "button" } | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const fiat = currency !== "XMR";

  useEffect(() => {
    let alive = true;
    void (requests ? requests.load() : Promise.resolve([])).then((l) => { if (alive) setList(l); });
    return () => { alive = false; };
  }, [requests]);

  // Remember when each payment was first seen, so one sent before the deadline but confirmed
  // after it is not called late.
  useEffect(() => {
    if (!list || !requests) return;
    const next = recordRequestSeen(list, incoming, serverNow());
    if (!next) return;
    setList(next);
    void requests.save(next).catch(() => { /* shown on the next explicit save */ });
  }, [incoming, list, requests]);

  if (!requests) return <p className="muted">Payment requests are available once the wallet is unlocked.</p>;

  // The QR and "open in wallet" use the plain standard URI; the shareable link adds MonkStash extras.
  // Built during render, so a damaged saved request must not take the whole wallet down.
  const uriOf = (r: PaymentRequest) => {
    try { return buildPaymentUri({ address: r.address, amount: r.amount ? BigInt(r.amount) : undefined, note: r.note, name: r.name }); } catch { return `monero:${r.address}`; }
  };
  const linkOf = (r: PaymentRequest) => {
    try {
      return paymentLink(payLinkOrigin(), buildPaymentFragment({
        address: r.address, amount: r.amount ? BigInt(r.amount) : undefined, note: r.note, name: r.name,
        expiresAt: r.expiresAt, fiat: r.fiat, returnUrl: r.returnUrl,
      }));
    } catch {
      return paymentLink(payLinkOrigin(), uriOf(r));
    }
  };

  function pickCurrency(c: string) {
    setCurrency(c);
    // A price in another currency is held at today's rate, so it should not stay open forever.
    if (c !== "XMR" && expiry === null) setExpiry(60 * 24);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // A comma is a decimal point only in a fiat price ("12,50"). In XMR, "1,000" is ambiguous and
    // parseXmr refuses it, so it is never read as 1 XMR.
    const value = fiat ? amount.trim().replace(",", ".") : amount.trim();
    let atomic: bigint | undefined;
    let fiatInfo: PaymentRequest["fiat"];
    if (value) {
      if (fiat) {
        if (!/^\d{1,9}(\.\d{1,2})?$/.test(value) || Number(value) <= 0) return setError("Enter a price like 12.50, or leave it empty for any amount.");
      } else {
        atomic = parseXmr(value) ?? undefined;
        if (atomic === undefined) return setError(xmrAmountProblem(value) ?? "Enter an amount in XMR, like 0.5.");
        if (atomic <= 0n) return setError("Enter an amount greater than 0, or leave it empty for any amount.");
      }
    } else if (fiat) {
      return setError(`Enter a price in ${currency}, or switch to XMR for an open amount.`);
    }
    if (note.trim().length > NOTE_MAX) return setError(`Keep the note under ${NOTE_MAX} characters.`);
    const ret = returnUrl.trim() ? checkReturnUrl(returnUrl, process.env.NODE_ENV !== "production") : null;
    if (returnUrl.trim() && !ret) return setError("The return link must be a full https:// address.");
    setBusy(true);
    try {
      await checkClock();
      if (fiat) {
        const quote = await fetchQuote(currency);
        atomic = fiatToAtomic(value, quote.rate);
        fiatInfo = { currency, amount: value, rate: quote.rate };
      }
      const { address, index } = await freshAddress(wallet, note.trim() || "Payment request", (listRef.current ?? []).map((r) => r.index), atomic);
      const req: PaymentRequest = {
        id: crypto.randomUUID(), index, address, amount: atomic ? atomic.toString() : undefined, note: note.trim() || undefined,
        createdAt: new Date(serverNow()).toISOString(),
        ...(name.trim() ? { name: name.trim().slice(0, 60) } : {}),
        ...(expiry ? { expiresAt: serverNow() + expiry * 60_000 } : {}),
        ...(fiatInfo ? { fiat: fiatInfo } : {}),
        ...(ret ? { returnUrl: ret } : {}),
      };
      const next = [req, ...(listRef.current ?? [])];
      await requests!.save(next);
      setList(next);
      setFresh(req.id);
      setOpen({ id: req.id, what: "qr" });
      setAmount("");
      setNote("");
      onChanged();
    } catch (err) {
      setError(err instanceof PriceUnavailableError ? err.message : (err as Error).message || "The request could not be created.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    const next = (listRef.current ?? []).filter((r) => r.id !== id);
    try {
      await requests!.save(next);
      setList(next);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const toggle = (id: string, what: "qr" | "button") => setOpen(open?.id === id && open.what === what ? null : { id, what });

  return (
    <div className={styles.requests}>
      <form onSubmit={create} className={styles.reqForm}>
        <p className="small muted" style={{ margin: 0 }}>
          Create a link anyone can pay from any Monero wallet. Each request gets its own fresh address, so you can see when it is paid.
          The details stay in the link itself; MonkStash&apos;s servers never see them.
        </p>
        <div className={styles.reqFields}>
          <div className="field">
            <label htmlFor="req-amt">{fiat ? `Price (${currency})` : "Amount (XMR)"}</label>
            <div className={styles.amtRow}>
              <input id="req-amt" className="input" inputMode="decimal" autoComplete="off" placeholder={fiat ? "12.50" : "Any amount"} value={amount} onChange={(e) => setAmount(e.target.value)} />
              <select className="input" aria-label="Currency" value={currency} onChange={(e) => pickCurrency(e.target.value)}>
                <option value="XMR">XMR</option>
                {MAIN_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {fiat ? <span className="hint">Turned into XMR at today&apos;s rate, which the link keeps until it expires.</span> : null}
          </div>
          <div className="field">
            <label htmlFor="req-note">What is it for? (optional)</label>
            <input id="req-note" className="input" maxLength={NOTE_MAX} autoComplete="off" placeholder="For example: Logo design" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <details className={styles.reqMore}>
          <summary>More options: expiry, your name, return link</summary>
          <div className={styles.reqFields}>
            <div className="field">
              <label htmlFor="req-exp">Expires after</label>
              <select id="req-exp" className="input" value={expiry ?? ""} onChange={(e) => setExpiry(e.target.value ? Number(e.target.value) : null)}>
                {EXPIRY_CHOICES.filter((c) => !(fiat && c.minutes === null)).map((c) => <option key={c.label} value={c.minutes ?? ""}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="req-name">Your name or shop (optional)</label>
              <input id="req-name" className="input" maxLength={60} autoComplete="off" placeholder="Shown to the payer" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="req-ret">Return link (optional)</label>
            <input id="req-ret" className="input" inputMode="url" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="https://yourshop.com/thank-you" value={returnUrl} onChange={(e) => setReturnUrl(e.target.value)} />
            <span className="hint">After paying, the payer sees a button back to this page, for example your order page.</span>
          </div>
        </details>
        {error ? <p className="error small" role="alert">{error}</p> : null}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Creating…" : "Create payment request"}</button>
      </form>

      {list === null ? null : list.length === 0 ? (
        <p className="small muted" style={{ margin: 0 }}>Your requests will appear here, with their status.</p>
      ) : (
        <>
        <div className={styles.listHead}>
          <h3>Your requests</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => downloadCsv("payment-requests", requestsCsv(list, incoming))}>Export CSV</button>
        </div>
        <ul className={styles.reqList} aria-label="Your payment requests">
          {list.map((r) => {
            const status = statusOf(r, incoming);
            const xmrText = r.amount ? `${formatXmr(BigInt(r.amount), 6)} XMR` : "Any amount";
            const expired = r.expiresAt !== undefined && serverNow() >= r.expiresAt;
            return (
              <li key={r.id} className={`${styles.reqItem} ${fresh === r.id ? styles.reqFresh : ""}`}>
                <div className={styles.reqTop}>
                  <div style={{ minWidth: 0 }}>
                    <strong className={styles.reqAmt}>{r.fiat ? moneyText(r.fiat.amount, r.fiat.currency) : xmrText}</strong>
                    {r.fiat ? <span className="small muted">{xmrText}</span> : null}
                    {r.note ? <span className={styles.reqNote}>{r.note}</span> : null}
                    <span className="small muted">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                      {r.expiresAt ? `, ${expired ? "expired" : "expires"} ${new Date(r.expiresAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}
                    </span>
                  </div>
                  <span className={`${styles.chip} ${status.kind === "paid" ? styles.chipPaid : status.kind === "unpaid" || status.kind === "expired" ? styles.chipIdle : styles.chipWait}`} aria-live="polite">{STATUS_TEXT(status, r.amount)}</span>
                </div>
                <div className={styles.reqActions}>
                  <CopyButton value={linkOf(r)} label="Copy link" />
                  {canShare ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { void navigator.share({ title: "Monero payment request", text: r.note ?? "Payment request", url: linkOf(r) }).catch(() => {}); }}>Share</button>
                  ) : null}
                  <button type="button" className="btn btn-ghost btn-sm" aria-expanded={open?.id === r.id && open.what === "qr"} onClick={() => toggle(r.id, "qr")}>{open?.id === r.id && open.what === "qr" ? "Hide QR" : "Show QR"}</button>
                  <button type="button" className="btn btn-ghost btn-sm" aria-expanded={open?.id === r.id && open.what === "button"} onClick={() => toggle(r.id, "button")}>Website button</button>
                  <a className="btn btn-ghost btn-sm" href={linkOf(r)} target="_blank" rel="noopener noreferrer">Open page</a>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => void remove(r.id)}>Remove</button>
                </div>
                {open?.id === r.id && open.what === "qr" ? (
                  <div className={styles.reqQr}>
                    <Qr value={uriOf(r)} label={`QR code for the payment request${r.note ? `: ${r.note}` : ""}`} size={176} />
                    <p className="small muted">Scan with any Monero wallet. It fills in the address{r.amount ? " and amount" : ""}.</p>
                  </div>
                ) : null}
                {open?.id === r.id && open.what === "button" ? (
                  <div className={styles.reqButton}>
                    <p className="small" style={{ margin: 0 }}>Paste this into your website, shop page or blog. It is plain HTML: no scripts, no tracking.</p>
                    <div className={styles.btnPreview} aria-hidden="true">
                      <span>Pay with Monero</span>
                    </div>
                    <pre className={styles.code}><code>{buttonHtml(linkOf(r))}</code></pre>
                    <div className={styles.reqActions}>
                      <CopyButton value={buttonHtml(linkOf(r))} label="Copy button code" />
                      <CopyButton value={`[Pay with Monero](${linkOf(r)})`} label="Copy as Markdown" />
                    </div>
                    <p className="small muted" style={{ margin: 0 }}>
                      Every click opens this same request and address. That suits one product, a tip jar or donations. For separate
                      orders, make a new request each time, so each order has its own address and status.
                    </p>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
        </>
      )}
      {pub.kind === "view-only" ? <p className="small muted">This is a watch-only wallet: it can receive and track requests, but spending needs the full wallet.</p> : null}
    </div>
  );
}

function Send({ pub, wallet, settings, synced, unlocked, onSent, prefill, contacts, onSaveContacts, hidden }: { pub: WalletPublic; wallet: LiveWallet; settings?: SettingsActions; synced: boolean; unlocked: bigint; onSent: () => void; prefill?: Prefill | null; contacts: Contact[] | null; onSaveContacts: (l: Contact[]) => Promise<void>; hidden?: boolean }) {
  const [to, setTo] = useState(prefill?.address ?? "");
  const [amount, setAmount] = useState(prefill?.amount ? formatXmr(prefill.amount) : "");
  // "Send all": everything spendable, the network fee taken out of it (no amount to type).
  const [sendAll, setSendAll] = useState(false);
  // The password (and code) that approve the reviewed payment; the wallet sends nothing without them.
  const [sendPw, setSendPw] = useState("");
  const [sendCode, setSendCode] = useState("");
  // The review is a frozen snapshot: what was built is what is shown and sent, whatever the form says now.
  const [review, setReview] = useState<{ fee: bigint; amount: bigint; metadata: string; address: string; hash?: string; alias: { fqdn: string; name?: string; dnssec: boolean } | null; all: boolean } | null>(null);
  const toRef = useRef("");
  const [state, setState] = useState<"idle" | "preparing" | "sending" | "checking" | "sent">("idle");
  // After a broadcast error the payment may or may not be on the network. Until a check shows the
  // network does not have it, the only way forward is the SAME signed payment (it can never be paid
  // twice): a new build could pick different coins and pay a second time.
  const [unsure, setUnsure] = useState<{ message: string; absent: boolean } | null>(null);
  const expiredRequest = prefill?.expiresAt !== undefined && serverNow() >= prefill.expiresAt;
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  // OpenAlias: a name like donate.getmonero.org instead of an address.
  const [alias, setAlias] = useState<{ fqdn: string; address: string; name?: string; description?: string; dnssec: boolean } | null>(null);
  const [aliasState, setAliasState] = useState<"idle" | "looking" | "error">("idle");
  const [aliasError, setAliasError] = useState<string | null>(null);
  const [trusted, setTrusted] = useState(false);
  const fqdn = openAliasFqdn(to);
  useEffect(() => { toRef.current = to; }, [to]);
  const [managing, setManaging] = useState(false);
  // The tamper alarm needs an explicit "I checked" for this exact recipient.
  const [alarmOk, setAlarmOk] = useState(false);
  useEffect(() => { setAlarmOk(false); }, [to]);
  const [saveName, setSaveName] = useState("");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const sentTo = useRef("");
  const sentAlias = useRef<string | null>(null);
  // Your own currency next to the amount catches decimal slips (1 instead of 0.1).
  const [fx, setFx] = useState<{ currency: string; rate: string } | null>(null);
  useEffect(() => {
    let alive = true;
    const currency = localCurrency();
    const load = () => void fetchPriceFeed().then((f) => { if (alive && f.rates[currency]) setFx({ currency, rate: f.rates[currency]! }); }).catch(() => {});
    load();
    const t = setInterval(load, 120_000);
    return () => { alive = false; clearInterval(t); };
  }, []);
  const inFiat = (a: bigint) => (fx ? fiatText(atomicToFiat(a, fx.rate), fx.currency) : null);

  useEffect(() => {
    if (!fqdn) { setAliasState("idle"); setAliasError(null); return; }
    if (alias?.fqdn === fqdn) return;
    setAlias(null);
    setTrusted(false);
    setAliasState("looking");
    setAliasError(null);
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(apiUrl(`/api/openalias?name=${encodeURIComponent(fqdn)}`));
        const data = (await res.json()) as { ok: boolean; error?: string; fqdn?: string; address?: string; name?: string; description?: string; dnssec?: boolean };
        if (!alive) return;
        if (data.ok && data.address && data.fqdn === fqdn) {
          setAlias({ fqdn, address: data.address, name: data.name, description: data.description, dnssec: !!data.dnssec });
          setAliasState("idle");
        } else {
          setAliasState("error");
          setAliasError(data.error === "not-found" ? `No Monero address is published for ${fqdn}.` : data.error === "invalid" ? "That is not a valid name." : "The name could not be looked up right now. Try again, or paste the address.");
        }
      } catch {
        if (alive) { setAliasState("error"); setAliasError("The name could not be looked up right now. Try again, or paste the address."); }
      }
    }, 600);
    return () => { alive = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fqdn]);

  if (pub.kind === "view-only") {
    return <p className="muted" style={{ margin: 0 }}>This is a view-only wallet. To send, restore the wallet from its recovery words.</p>;
  }
  if (state === "sent" && txHash) {
    const paidTo = contacts ? contactForAddress(sentTo.current, contacts) : null;
    async function saveRecipient(e: React.FormEvent) {
      e.preventDefault();
      if (!contacts) return;
      try {
        const clean = checkContact({ name: saveName, address: sentTo.current, alias: sentAlias.current ?? undefined }, pub.network, contacts);
        await onSaveContacts([...contacts, { id: crypto.randomUUID(), ...clean, createdAt: new Date().toISOString(), lastPaidAt: new Date().toISOString() }]);
        setSaveMsg(`Saved as ${clean.name}.`);
      } catch (err) {
        setSaveMsg(err instanceof ContactError ? err.message : "The contact could not be saved.");
      }
    }
    return (
      <div>
        <h3>Sent{paidTo ? ` to ${paidTo.name}` : ""}</h3>
        <p className="muted">Your payment was sent to the network. It usually confirms in about 2 minutes.</p>
        <p className="small">Transaction ID</p>
        <p className={`mono ${styles.addr}`}>{txHash}</p>
        <CopyButton value={txHash} label="Copy transaction ID" />
        {contacts && !paidTo ? (
          <form onSubmit={saveRecipient} className={styles.saveContact}>
            <label htmlFor="save-name">Save this recipient as a contact?</label>
            <div className={styles.saveRow}>
              <input id="save-name" className="input" maxLength={40} autoComplete="off" placeholder="Their name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
              <button className="btn btn-secondary" disabled={!saveName.trim()}>Save</button>
            </div>
            {saveMsg ? <p className="small" role="status" style={{ margin: 0 }}>{saveMsg}</p> : null}
          </form>
        ) : null}
        <button className="btn btn-ghost btn-sm" onClick={() => { setState("idle"); setTo(""); setAmount(""); setSendAll(false); setReview(null); setTxHash(null); }}>Send another</button>
      </div>
    );
  }

  const resolved = fqdn ? (alias?.fqdn === fqdn ? alias : null) : null;
  const dest = resolved ? resolved.address : to.trim();
  const fmt = fqdn ? (resolved ? checkAddressFormat(resolved.address, pub.network) : null) : to ? checkAddressFormat(to, pub.network) : null;
  const atomic = parseXmr(amount);
  const destNet = resolved ? addressNetwork(resolved.address) : null;
  const wrongNet = destNet && destNet !== pub.network ? destNet : null;
  // Contacts and the tamper alarm.
  const known = contacts && dest ? contactForAddress(dest, contacts) : null;
  const lookalike = contacts && dest && fmt?.ok && !known ? lookalikeContact(dest, contacts) : null;
  const aliasContact = contacts && fqdn ? contactForAlias(fqdn, contacts) : null;
  const aliasMoved = aliasContact && resolved && aliasChanged(aliasContact, resolved.address) ? aliasContact : null;
  const alarm = !!(lookalike || aliasMoved);

  async function prepare(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!synced) return setError("Wait until the wallet has finished syncing.");
    if (prefill?.expiresAt !== undefined && serverNow() >= prefill.expiresAt) {
      return setError("This payment request has expired. Ask the person for a new one before you pay.");
    }
    if (fqdn && !resolved) return setError(aliasState === "looking" ? "Still looking up that name." : aliasError ?? "That name has no Monero address.");
    if (resolved && !resolved.dnssec && !trusted) return setError("This name is not protected by DNSSEC. Tick the box to confirm you trust it and checked the address.");
    if (wrongNet) return setError(`${resolved!.fqdn} points to a ${wrongNet} address, but this wallet is on ${pub.network}.`);
    if (!fmt?.ok) return setError(fmt?.reason ?? "Enter a recipient address");
    if (alarm && !alarmOk) return setError("Check the warning above before you continue.");
    const nothingSpendable = "There is nothing to send yet. Money you receive can be spent after 10 confirmations (about 20 minutes).";
    if (!sendAll) {
      if (atomic === null) return setError(xmrAmountProblem(amount) ?? "Enter an amount in XMR, like 0.5.");
      if (atomic <= 0n) return setError("Enter an amount greater than 0");
      if (unlocked <= 0n) return setError(nothingSpendable);
      if (atomic >= unlocked) return setError(`That leaves nothing for the network fee. You can send a little under ${formatXmr(unlocked)} XMR, or use Send all.`);
    } else if (unlocked <= 0n) {
      return setError(nothingSpendable);
    }
    const target = dest;
    const targetAlias = resolved ? { fqdn: resolved.fqdn, name: resolved.name, dnssec: resolved.dnssec } : null;
    const typed = to;
    setState("preparing");
    if (!(await validateAddress(target, pub.network))) {
      setState("idle");
      return setError("This address failed the checksum test. Copy it again.");
    }
    try {
      const built = sendAll ? await wallet.prepareSweep(target) : await wallet.prepareSend(target, atomic!);
      // If the recipient changed while the fee was being calculated, start over rather than guess.
      if (toRef.current !== typed || built.address !== target) {
        setError("The recipient changed while the payment was being prepared. Check it and press Review again.");
      } else {
        setReview({ ...built, alias: targetAlias, all: sendAll });
      }
    } catch (err) {
      setError((err as Error).message);
    }
    setState("idle");
  }

  function markSent(hash: string) {
    if (!review) return;
    setTxHash(hash);
    setUnsure(null);
    sentTo.current = review.address;
    sentAlias.current = review.alias ? review.alias.fqdn : null;
    setState("sent");
    onSent();
    const paid = contacts ? contactForAddress(review.address, contacts) : null;
    if (contacts && paid) void onSaveContacts(contacts.map((c) => (c.id === paid.id ? { ...c, lastPaidAt: new Date().toISOString() } : c)));
  }

  /** Where the prepared payment is: in this wallet's history, or the node's pool or chain. "unknown" when it cannot be checked. */
  async function locate(hash: string | undefined): Promise<TxWhere | "unknown"> {
    if (!hash) return "unknown";
    await wallet.syncNow?.().catch(() => {});
    const mine = (await wallet.txs().catch(() => [] as TxSummary[])).find((t) => t.hash === hash);
    if (mine) return mine.pending ? "pool" : "chain";
    if (!wallet.findTx) return "unknown";
    return wallet.findTx(hash).catch(() => "unknown" as const);
  }

  /** Checks whether the payment went out, and says what the person can safely do next. */
  async function check(reason: string) {
    if (!review) return;
    setState("checking");
    const where = await locate(review.hash);
    if (where === "pool" || where === "chain") return markSent(review.hash!);
    setUnsure({
      absent: where === "none",
      message: where === "none"
        ? "The network does not have this payment, so it was not sent."
        : `${reason} We could not check yet whether it reached the network.`,
    });
    setState("idle");
  }

  async function confirm() {
    if (!review) return;
    setState("sending");
    setError(null);
    // The wallet only broadcasts a payment approved with the password (and code) just now.
    try {
      if (!settings) throw new Error("Payments cannot be confirmed from here.");
      await settings.approveSend(sendPw, sendCode, [review.metadata]);
    } catch (err) {
      setError((err as Error).message);
      setState("idle");
      return;
    }
    try {
      // Always the payment built for this review. After an error this re-sends the same signed
      // transaction, which the network accepts at most once.
      markSent(await wallet.relay(review.metadata));
    } catch (err) {
      const raw = (err as Error).message || "The node did not answer.";
      // A node that already has this exact transaction answers like this when it is sent again.
      const probablySent = /double.?spend|already|tx.?exists|in.?pool|key image/i.test(raw);
      await check(probablySent ? "The node says this payment may already be on the network." : `Sending failed: ${raw}`);
    }
  }

  if (review) {
    const reviewContact = contacts ? contactForAddress(review.address, contacts) : null;
    return (
      <div>
        <h3>Review payment</h3>
        <dl className={styles.review}>
          {review.alias ? <><dt>Name</dt><dd>{review.alias.fqdn}{review.alias.name ? ` (${review.alias.name})` : ""}{review.alias.dnssec ? ", DNSSEC verified" : ", not DNSSEC verified"}</dd></> : null}
          {reviewContact ? <><dt>Contact</dt><dd><strong>{reviewContact.name}</strong> <span className="muted">(saved contact)</span></dd></> : null}
          <dt>To</dt><dd><AddressCheck address={review.address} /></dd>
          <dt>Amount</dt><dd>{formatXmr(review.amount)} XMR{inFiat(review.amount) ? <span className="muted"> (about {inFiat(review.amount)})</span> : null}</dd>
          <dt>Network fee</dt><dd>{formatXmr(review.fee)} XMR</dd>
          <dt>Total</dt><dd><strong>{formatXmr(review.amount + review.fee)} XMR</strong></dd>
        </dl>
        {review.all ? <p className="small muted" style={{ margin: "var(--s-3) 0 0" }}>This sends everything spendable. The network fee comes out of it, so the recipient gets the amount above.</p> : null}
        {unlocked > 0n && review.amount * 2n >= unlocked ? (
          <div className="notice notice-warn" role="alert" style={{ margin: "var(--s-4) 0 0" }}>
            <span>
              <strong>This is {Number((review.amount * 100n) / unlocked)}% of your spendable balance.</strong> Make sure the amount is right
              {inFiat(review.amount) ? <>: about <strong>{inFiat(review.amount)}</strong></> : null}.
            </span>
          </div>
        ) : null}
        <div className="notice notice-warn" style={{ margin: "var(--s-4) 0" }}>
          <span>Once you send Monero, it cannot be undone. Check the first and last few characters of the address before you send.</span>
        </div>
        <Credentials totp={!!settings?.totpEnabled} pw={sendPw} setPw={setSendPw} code={sendCode} setCode={setSendCode} idPrefix="send" />
        {error ? <p className="error small" role="alert">{error}</p> : null}
        {state === "checking" ? <p className="small" role="status">Checking whether the payment reached the network…</p> : null}
        {unsure ? (
          <div style={{ display: "grid", gap: "var(--s-2)" }}>
            <div className="notice notice-warn" role="alert">
              <span>
                <strong>{unsure.absent ? "This payment was not sent." : "We could not confirm this payment went out."}</strong> {unsure.message}{" "}
                {unsure.absent
                  ? "You can send it again, or change it."
                  : "Do not make a new payment yet. Sending this one again is safe: it is the exact same signed payment, so it can never be paid twice."}
              </span>
            </div>
            <button className="btn btn-primary btn-block" disabled={state !== "idle" || !sendPw} onClick={confirm}>{state === "sending" ? "Sending…" : "Try sending the same payment again"}</button>
            {!unsure.absent ? (
              <button className="btn btn-secondary btn-block" disabled={state !== "idle"} onClick={() => void check("Still no answer from the node.")}>Check again</button>
            ) : (
              <button className="btn btn-ghost btn-block" disabled={state !== "idle"} onClick={() => { setUnsure(null); setReview(null); }}>It was not sent: change the payment</button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "var(--s-2)" }}>
            <button className="btn btn-primary btn-block" disabled={state !== "idle" || !sendPw} onClick={confirm}>{state === "sending" ? "Sending…" : "Send now"}</button>
            <button className="btn btn-ghost btn-block" disabled={state !== "idle"} onClick={() => setReview(null)}>Edit</button>
          </div>
        )}
      </div>
    );
  }

  if (managing && contacts) {
    return <ContactManager contacts={contacts} network={pub.network} onSave={onSaveContacts} onClose={() => setManaging(false)} />;
  }

  return (
    <form onSubmit={prepare}>
      {contacts ? <ContactChips contacts={contacts} onManage={() => setManaging(true)} onPick={(c) => { setTo(c.alias ?? c.address); setError(null); }} /> : null}
      {prefill ? (
        <div className="notice notice-info" style={{ marginBottom: "var(--s-4)" }}>
          <span>
            <strong>Paying a request{prefill.note ? `: ${prefill.note}` : ""}.</strong> Check the address and amount below, then review. Only pay requests from
            people you trust; anyone can make a payment link.
            {prefill.expiresAt !== undefined && !expiredRequest ? <> It expires {new Date(prefill.expiresAt).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.</> : null}
          </span>
        </div>
      ) : null}
      {expiredRequest ? (
        <div className="notice notice-warn" role="alert" style={{ marginBottom: "var(--s-4)" }}>
          <span>
            <strong>This payment request has expired.</strong> The price or address may no longer be valid. Ask the person for a new
            request before you pay.
          </span>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="to">Recipient (address or name)</label>
        <textarea id="to" className="textarea mono" style={{ minHeight: 80 }} spellCheck={false} autoComplete="off" autoCapitalize="none" value={to} readOnly={state === "preparing"}
          onChange={(e) => {
            const v = e.target.value;
            setError(null);
            // A pasted payment link (monero:address?tx_amount=...) fills in the address and amount.
            if (/^\s*monero:/i.test(v)) {
              try {
                const req = parsePaymentUri(v);
                setTo(req.address);
                if (req.amount) setAmount(formatXmr(req.amount));
                return;
              } catch (err) {
                setError((err as Error).message);
              }
            }
            setTo(v);
          }} aria-describedby="to-hint" />
        <span id="to-hint" className={fmt && !fmt.ok ? "error" : "hint"}>
          {fqdn ? (resolved ? (fmt?.ok ? `Name found: valid ${fmt.kind} address` : wrongNet ? `${resolved.fqdn} points to a ${wrongNet} address, but this wallet is on ${pub.network}.` : fmt?.reason) : aliasState === "looking" ? `Looking up ${fqdn}…` : aliasError)
            : fmt ? (fmt.ok ? `Valid ${fmt.kind} address format` : fmt.reason) : "Paste the full address, a payment link, or a name like donate.getmonero.org"}
        </span>
        {known && !alarm ? <span className={styles.knownContact}>Saved contact: <strong>{known.name}</strong></span> : null}
        {lookalike ? (
          <TamperAlarm title={`This looks like ${lookalike.name}'s address, but it is different`} checked={alarmOk} onCheck={setAlarmOk}>
            <p>It starts and ends like the address you saved for {lookalike.name}, but the middle is not the same. Malware that swaps copied addresses makes lookalikes exactly like this.</p>
            <p>Saved: <span className="mono">{shortAddress(lookalike.address, 8)}</span>. Do not send unless {lookalike.name} confirms this new address another way.</p>
          </TamperAlarm>
        ) : null}
        {aliasMoved ? (
          <TamperAlarm title={`${aliasMoved.alias} now points to a different address`} checked={alarmOk} onCheck={setAlarmOk}>
            <p>When you saved {aliasMoved.name}, this name pointed to <span className="mono">{shortAddress(aliasMoved.address, 8)}</span>. It may have been changed on purpose, or the domain may have been taken over.</p>
          </TamperAlarm>
        ) : null}
        {resolved ? (
          <div className={`${styles.aliasCard} ${resolved.dnssec ? "" : styles.aliasWarn}`} aria-live="polite">
            <div className={styles.aliasTop}>
              <strong>{resolved.name ?? resolved.fqdn}</strong>
              <span className={`${styles.chip} ${resolved.dnssec ? styles.chipPaid : styles.chipWait}`}>{resolved.dnssec ? "DNSSEC verified" : "Not DNSSEC verified"}</span>
            </div>
            {resolved.description ? <p className="small muted" style={{ margin: 0 }}>{resolved.description}</p> : null}
            <p className={`mono ${styles.addr}`} style={{ margin: 0 }}>{resolved.address}</p>
            <p className="small muted" style={{ margin: 0 }}>
              {resolved.fqdn} points to this address. Check that it is who you expect. We looked it up through our server, so your IP
              address was not shared with the DNS provider.
            </p>
            {!resolved.dnssec ? (
              <label className={styles.trust}>
                <input type="checkbox" checked={trusted} onChange={(e) => setTrusted(e.target.checked)} />
                <span>I trust this domain and checked the address. Without DNSSEC, the answer could have been tampered with.</span>
              </label>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="field">
        <span className={styles.amtHead}>
          <label htmlFor="amt">Amount (XMR)</label>
          <button type="button" className={`btn btn-ghost btn-sm ${sendAll ? styles.allOn : ""}`} aria-pressed={sendAll} disabled={state === "preparing" || !synced}
            onClick={() => { setSendAll((v) => !v); setAmount(""); setError(null); }}>Send all</button>
        </span>
        <input id="amt" className="input" inputMode="decimal" autoComplete="off" value={sendAll ? "" : amount} placeholder={sendAll ? "Everything spendable, minus the fee" : undefined}
          readOnly={state === "preparing"} onChange={(e) => { setSendAll(false); setAmount(e.target.value); setError(null); }} aria-describedby="amt-hint" />
        <span id="amt-hint" className="hint">
          {atomic && atomic > 0n && inFiat(atomic) ? <><strong>About {inFiat(atomic)}</strong>. </> : null}
          Spendable now: {!synced ? "syncing…" : hidden ? "hidden" : `${formatXmr(unlocked)} XMR`}
        </span>
      </div>
      {error ? <p className="error small" role="alert">{error}</p> : null}
      <button className="btn btn-primary btn-block" disabled={state === "preparing"}>{state === "preparing" ? "Calculating fee…" : "Review"}</button>
    </form>
  );
}

function Activity({ txs, synced, onReceive, wallet, hidden, compact = false, onSeeAll }: { txs: TxSummary[]; synced: boolean; onReceive: () => void; wallet: LiveWallet; hidden: boolean; compact?: boolean; onSeeAll?: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  if (checking) return <CheckProof wallet={wallet} onClose={() => setChecking(false)} />;
  if (!txs.length) {
    return (
      <div className={styles.empty}>
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <rect x="7" y="12" width="34" height="26" rx="4" /><path d="M7 19h34" /><path d="M24 25v8" /><path d="m20 29 4 4 4-4" />
        </svg>
        <h2 tabIndex={-1}>{synced ? "No payments yet" : "Looking for your payments"}</h2>
        <p>{synced ? "Share your address and your first XMR will show up here." : "They appear here as the wallet catches up with the network."}</p>
        {synced ? <button className="btn btn-primary" onClick={onReceive}>Receive your first XMR</button> : null}
      </div>
    );
  }
  return (
    <>
      <div className={styles.listHead}>
        {compact ? <h3 className={styles.recentH}>Recent activity</h3> : <h2 className={styles.panelH} tabIndex={-1}>Activity</h2>}
        <span className={styles.contactActions}>
          {compact ? (
            onSeeAll ? <button type="button" className="btn btn-ghost btn-sm" onClick={onSeeAll}>See all</button> : null
          ) : (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setChecking(true)}>Check a payment proof</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => downloadCsv("history", historyCsv(txs))}>Export CSV</button>
            </>
          )}
        </span>
      </div>
      <ul className={styles.txs}>
        {txs.map((t) => {
          const confirming = !t.pending && t.confirmations < 10;
          return (
            <li key={t.hash} className={open === t.hash ? styles.txOpen : undefined}>
              <button type="button" className={styles.txToggle} aria-expanded={open === t.hash} aria-label={`Details of this ${t.direction === "in" ? "incoming" : "outgoing"} payment`} onClick={() => setOpen(open === t.hash ? null : t.hash)} />
              <span className={`${styles.txDir} ${t.direction === "in" ? styles.txIn : ""}`} aria-hidden="true">{t.direction === "in" ? "↓" : "↑"}</span>
              <div className={styles.txMain}>
                <strong>{t.direction === "in" ? "Received" : t.direction === "self" ? "Sent to yourself" : "Sent"}</strong>
                <span className={`small muted mono ${styles.txHash}`} title={t.hash}>{t.hash.slice(0, 10)}…{t.hash.slice(-6)}</span>
              </div>
              <div className={styles.txSide}>
                <strong className={t.direction === "in" ? styles.amtIn : undefined}>{hidden ? "••••" : `${t.direction === "in" ? "+" : "−"}${formatXmr(t.amount, 6)}`} <span className={styles.txUnit}>XMR</span></strong>
                {t.pending ? (
                  <span className={`${styles.chip} ${styles.chipWait}`}>{t.direction === "in" ? "Spendable in about 20 min" : "Waiting to confirm"}</span>
                ) : confirming ? (
                  <span className={styles.confirming} title={`${t.confirmations} of 10 confirmations`}>
                    <span className={styles.miniBar} aria-hidden="true"><span style={{ width: `${(t.confirmations / 10) * 100}%` }} /></span>
                    {t.direction === "in" ? `Spendable in about ${minutesLeft(t.confirmations)} min` : `${t.confirmations} of 10`}
                  </span>
                ) : (
                  <span className="small muted">{t.timestamp ? new Date(t.timestamp * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Confirmed"}</span>
                )}
              </div>
              {open === t.hash ? (
                <div className={styles.txDetails}>
                  <dl className={styles.facts}>
                    <dt>Transaction ID</dt><dd className="mono" style={{ wordBreak: "break-all" }}>{t.hash}</dd>
                    {t.timestamp ? <><dt>Date</dt><dd>{new Date(t.timestamp * 1000).toLocaleString()}</dd></> : null}
                    <dt>Confirmations</dt><dd>{t.pending ? "Waiting in the pool" : t.confirmations}</dd>
                    {t.fee !== undefined && t.direction !== "in" ? <><dt>Network fee</dt><dd>{formatXmr(t.fee)} XMR</dd></> : null}
                  </dl>
                  <CopyButton value={t.hash} label="Copy transaction ID" />
                  {t.direction !== "in" ? <ProveSent wallet={wallet} tx={t} /> : (
                    <p className="small muted" style={{ margin: 0 }}>Received payments are proven by the sender. If someone sent you a proof, use <em>Check a payment proof</em> above.</p>
                  )}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** About two minutes per block until the 10-block spendable age. */
function minutesLeft(confirmations: number): number {
  return Math.max(2, (10 - Math.min(confirmations, 10)) * 2);
}

/** When the locked part of the balance becomes spendable, from the newest incoming payment. */
/** The build this wallet was loaded from (public/build.json), linking to how to check it. */
function BuildFingerprint() {
  const [fp, setFp] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    fetch("/build.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: { fingerprint?: string } | null) => setFp(b?.fingerprint ?? null))
      .catch(() => setFp(null));
  }, []);
  if (fp === undefined) return <span className="muted">…</span>;
  if (fp === null) return <span className="muted">development build</span>;
  return <a href={siteHref("/verify")} className="mono" title={`Fingerprint ${fp}. How to check it`}>{fp.slice(0, 12)}</a>;
}

function unlockNote(txs: TxSummary[]): string {
  const waiting = txs.filter((t) => t.direction === "in" && (t.pending || t.confirmations < 10));
  if (!waiting.length) return "The rest unlocks after about 10 confirmations, usually around 20 minutes.";
  const mins = Math.max(...waiting.map((t) => (t.pending ? 20 : minutesLeft(t.confirmations))));
  return `The rest should be spendable in about ${mins} minutes (Monero waits 10 blocks).`;
}

/** The address split into groups, with the first and last six characters highlighted for checking. */
function AddressCheck({ address }: { address: string }) {
  const head = address.slice(0, 6);
  const tail = address.slice(-6);
  const middle = address.slice(6, -6).match(/.{1,6}/g) ?? [];
  return (
    <span className={`mono ${styles.addrCheck}`}>
      <span><mark>{head}</mark>{" "}{middle.join(" ")}{" "}<mark>{tail}</mark></span>
      <span className={styles.addrCheckHint}>Check the highlighted start and end against where you copied it from.</span>
    </span>
  );
}

/** The wallet's name in the wallet menu. */
function RenameWallet({ name, onRename }: { name: string; onRename: (name: string) => Promise<void> }) {
  const [value, setValue] = useState(name);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { setValue(name); }, [name]);
  return (
    <form className={styles.renameRow} onSubmit={async (e) => {
      e.preventDefault();
      setError(null);
      setState("saving");
      try {
        await onRename(value);
        setState("saved");
      } catch (err) {
        setError((err as Error).message);
        setState("idle");
      }
    }}>
      <div className="field" style={{ margin: 0, flex: 1, minWidth: 0 }}>
        <label htmlFor="wallet-name">Wallet name</label>
        <input id="wallet-name" className="input" value={value} maxLength={24} autoComplete="off" onChange={(e) => { setValue(e.target.value); setState("idle"); }} />
      </div>
      <button type="submit" className="btn btn-secondary btn-sm" disabled={state === "saving" || !value.trim() || value.trim() === name}>{state === "saved" ? "Saved" : "Rename"}</button>
      {error ? <p className="error small" role="alert" style={{ flexBasis: "100%", margin: 0 }}>{error}</p> : null}
    </form>
  );
}

function RemoveWallet({ onRemove, settings, kind }: { onRemove: () => void; settings?: SettingsActions; kind: WalletPublic["kind"] }) {
  const [text, setText] = useState("");
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form style={{ paddingBottom: "var(--s-4)" }} onSubmit={async (e) => {
      e.preventDefault();
      setError(null);
      setBusy(true);
      try {
        // Only the owner may remove it (a till or a borrowed device must not be wiped by anyone).
        // Fails closed: without the settings actions there is no way to check, so no removal.
        if (!settings) throw new Error("This wallet cannot be removed from here.");
        await settings.checkAccess(pw, code);
        onRemove();
      } catch (err) {
        setError((err as Error).message);
        setBusy(false);
      }
    }}>
      <p className="small muted">
        This removes the wallet from this browser only. Your money stays safe on the Monero network, and you can bring the wallet
        back any time with {kind === "view-only" ? "its address and private view key" : "your recovery words. Without those words, the money is gone for good"}.
      </p>
      <p className="small muted">
        It also deletes this wallet&apos;s contacts, payment requests and till sales stored in this browser. Export them first with <em>Export CSV</em> in Activity and Get paid.
      </p>
      {settings ? <Credentials totp={settings.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="rm" /> : null}
      <div className="field">
        <label htmlFor="rm">Type REMOVE to confirm</label>
        <input id="rm" className="input" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" />
      </div>
      {error ? <p className="small" role="alert" style={{ color: "var(--clay-ink)" }}>{error}</p> : null}
      <button className="btn btn-danger btn-sm" disabled={busy || text !== "REMOVE" || (!!settings && !pw)}>{busy ? "Checking…" : "Remove wallet"}</button>
    </form>
  );
}

/** Money held in accounts other than the main one (shop checkout, tills). */
function otherTotal(b: Balances): bigint {
  return (b.other ?? []).reduce((sum, o) => sum + o.balance, 0n);
}

/** One account's takings, with a two-step move into the main balance (fee shown first). */
function MoveFunds({ account, balance, unlocked, wallet, settings, canSend, hidden, onDone }: { account: number; balance: bigint; unlocked: bigint; wallet: LiveWallet; settings?: SettingsActions; canSend: boolean; hidden: boolean; onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [plan, setPlan] = useState<{ fee: bigint; amount: bigint; metadata: string[] } | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const amt = (a: bigint) => (hidden ? "••••" : `${formatXmr(a, 6)} XMR`);
  return (
    <div className={styles.moveRow}>
      <div style={{ minWidth: 0 }}>
        <strong>{ACCOUNT_NAME(account)}</strong>
        <p className="small muted" style={{ margin: 0 }}>{amt(balance)}{unlocked < balance ? `, ${amt(unlocked)} spendable now` : ""}</p>
        {plan ? <p className="small" style={{ margin: "var(--s-2) 0 0" }}>Move {amt(plan.amount)} to your main balance for a network fee of {formatXmr(plan.fee)} XMR?</p> : null}
        {plan ? <Credentials totp={!!settings?.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix={`move-${account}`} /> : null}
        {state === "done" ? <p className="small" role="status" style={{ margin: "var(--s-2) 0 0" }}>Moved. It is spendable from your main balance after 10 confirmations (about 20 minutes).</p> : null}
        {error ? <p className="small" role="alert" style={{ margin: "var(--s-2) 0 0", color: "var(--clay-ink)" }}>{error}</p> : null}
      </div>
      {!canSend ? (
        <span className="small muted">Move it from your full wallet</span>
      ) : plan ? (
        <span className={styles.contactActions}>
          <button type="button" className="btn btn-primary btn-sm" disabled={state === "busy" || !pw} onClick={async () => {
            setState("busy"); setError(null);
            try {
              if (!settings) throw new Error("This move cannot be confirmed from here.");
              await settings.approveSend(pw, code, plan.metadata);
              for (const m of plan.metadata) await wallet.relay(m);
              setPlan(null); setState("done"); onDone();
            } catch (err) {
              setError(`${(err as Error).message} Check Activity before trying again.`); setState("idle");
            }
          }}>{state === "busy" ? "Moving…" : "Move now"}</button>
          <button type="button" className="btn btn-ghost btn-sm" disabled={state === "busy"} onClick={() => setPlan(null)}>Cancel</button>
        </span>
      ) : (
        <button type="button" className="btn btn-secondary btn-sm" disabled={state === "busy" || unlocked === 0n} onClick={async () => {
          setState("busy"); setError(null);
          try { setPlan(await wallet.prepareMove(account)); setState("idle"); } catch (err) { setError((err as Error).message); setState("idle"); }
        }}>{state === "busy" ? "Checking…" : "Move to main balance"}</button>
      )}
    </div>
  );
}
