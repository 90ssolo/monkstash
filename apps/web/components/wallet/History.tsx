"use client";
/**
 * Activity: the wallet's payments with search and filters, a private note on each payment, and
 * a CSV export that can add each payment's value on its day. Notes and labels stay on this device.
 */
import { useEffect, useId, useMemo, useState } from "react";
import { formatXmr, LABEL_MAX, withTxNote, type WalletLabels } from "@quietmint/wallet-core";
import type { LiveWallet, TxSummary } from "@/lib/wallet/engine";
import { downloadCsv, historyCsv } from "@/lib/wallet/exports";
import { fetchPriceHistory, historyYears, isFiltered, matchesFilter, NO_FILTER, tagsOf, type HistoryFilter, type HistoryKind, type TxTags } from "@/lib/wallet/history";
import { fetchPriceFeed, MAIN_CURRENCIES } from "@/lib/prices";
import { CurrencyPicker, OFF, useCurrencyPref } from "./FiatValue";
import { CopyButton } from "./CopyButton";
import { CheckProof, FundsProofPanel, ProveSent, Receipt } from "./Proofs";
import styles from "./wallet.module.css";

/** About two minutes per block until the 10-block spendable age. */
export function minutesLeft(confirmations: number): number {
  return Math.max(2, (10 - Math.min(confirmations, 10)) * 2);
}

/**
 * Where a payment is, in plain words: on the network, in a block, then spendable after 10
 * confirmations (about 20 minutes). Monero's 10-block wait is the usual "where is my money?".
 */
export function TxTimeline({ tx }: { tx: TxSummary }) {
  const conf = tx.pending ? 0 : tx.confirmations;
  const incoming = tx.direction === "in";
  const steps = [
    { label: incoming ? "Seen on the network" : "Sent to the network", done: true, detail: tx.pending ? "Waiting for its first block" : null },
    { label: "Recorded in a block", done: conf >= 1, detail: conf >= 1 ? `${conf >= 10 ? "10+" : conf} confirmation${conf === 1 ? "" : "s"}` : "Usually within 2 minutes" },
    {
      label: incoming || tx.direction === "self" ? "Spendable" : "Spendable by the recipient",
      done: conf >= 10,
      detail: conf >= 10 ? "Final. It cannot be reversed." : `In about ${minutesLeft(conf)} min, after 10 confirmations`,
    },
  ];
  const current = steps.findIndex((st) => !st.done);
  return (
    <ol className={styles.timeline} aria-label="Payment status">
      {steps.map((st, i) => (
        <li key={st.label} className={st.done ? styles.tlDone : i === current ? styles.tlNow : undefined} aria-current={i === current ? "step" : undefined}>
          <span className={styles.tlDot} aria-hidden="true" />
          <span className={styles.tlText}>
            <strong>{st.label}</strong>
            {st.detail ? <span className="small muted">{st.detail}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}

const KINDS: { kind: HistoryKind; label: string }[] = [
  { kind: "all", label: "All" },
  { kind: "in", label: "Received" },
  { kind: "out", label: "Sent" },
];

export function Activity({ txs, synced, onReceive, wallet, hidden, onToggleHidden, compact = false, onSeeAll, labels, arrived, onSaveLabels, funds }: {
  txs: TxSummary[];
  synced: boolean;
  onReceive: () => void;
  wallet: LiveWallet;
  hidden: boolean;
  onToggleHidden?: () => void;
  compact?: boolean;
  onSeeAll?: () => void;
  labels: WalletLabels;
  /** Names of the receive addresses each incoming payment arrived at, by hash. */
  arrived: Map<string, string[]>;
  /** Absent while the labels cannot be saved (for example in a locked extension view). */
  onSaveLabels?: (l: WalletLabels) => Promise<void>;
  /** Proof of funds: the wallet's main address, and whether it can prove (full wallets only). */
  funds?: { primaryAddress: string; canProve: boolean };
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [proving, setProving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>(NO_FILTER);
  const kindName = useId();
  const tags = (t: TxSummary) => tagsOf(t, labels, arrived);
  const years = useMemo(() => historyYears(txs), [txs]);
  const filtered = isFiltered(filter);
  const shown = compact || !filtered ? txs : txs.filter((t) => matchesFilter(t, tags(t), filter));

  if (checking) return <CheckProof wallet={wallet} onClose={() => setChecking(false)} />;
  if (proving && funds) return <FundsProofPanel wallet={wallet} primaryAddress={funds.primaryAddress} canProve={funds.canProve} onClose={() => setProving(false)} />;
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
              {onToggleHidden ? <button type="button" className="btn btn-ghost btn-sm" aria-pressed={hidden} onClick={onToggleHidden}>Hide<span className="visually-hidden"> amounts and notes</span></button> : null}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setChecking(true)}>Check a payment proof</button>
              {funds ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProving(true)}>Proof of funds</button> : null}
              <button type="button" className="btn btn-ghost btn-sm" aria-expanded={exporting} onClick={() => setExporting((x) => !x)}>Export</button>
            </>
          )}
        </span>
      </div>

      {!compact && exporting ? <ExportPanel all={txs} shown={shown} filtered={filtered} tags={tags} onClose={() => setExporting(false)} /> : null}

      {!compact && txs.length > 1 ? (
        <div className={styles.histTools} role="search">
          <span className={styles.histSearch}>
            <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false"><circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m10.5 10.5 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <input type="search" className="input" aria-label="Search payments" placeholder="Search notes, amounts, IDs" value={filter.text}
              autoComplete="off" spellCheck={false} onChange={(e) => setFilter({ ...filter, text: e.target.value })} />
          </span>
          <div className={`${styles.speed} ${styles.histKinds}`} role="radiogroup" aria-label="Show">
            {KINDS.map((k) => (
              <label key={k.kind} className={filter.kind === k.kind ? styles.speedOn : undefined}>
                <input type="radio" name={kindName} checked={filter.kind === k.kind} onChange={() => setFilter({ ...filter, kind: k.kind })} />
                {k.label}
              </label>
            ))}
          </div>
          {years.length > 1 ? (
            <select className="input" aria-label="Year" value={filter.year ?? ""} onChange={(e) => setFilter({ ...filter, year: e.target.value ? Number(e.target.value) : null })}>
              <option value="">All years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          ) : null}
        </div>
      ) : null}
      {!compact && filtered ? (
        <p className={`small muted ${styles.histCount}`} aria-live="polite">
          {shown.length ? `${shown.length} of ${txs.length} payments` : "No payment matches."}{" "}
          <button type="button" className={styles.inlineLink} onClick={() => setFilter(NO_FILTER)}>Clear</button>
        </p>
      ) : null}

      <ul className={styles.txs}>
        {shown.map((t) => {
          const confirming = !t.pending && t.confirmations < 10;
          const tg = tags(t);
          const sub = tg.note ?? (tg.at.length ? `To ${tg.at.join(", ")}` : null);
          return (
            <li key={t.hash} className={open === t.hash ? styles.txOpen : undefined}>
              <button type="button" className={styles.txToggle} aria-expanded={open === t.hash} aria-label={`Details of this ${t.direction === "in" ? "incoming" : "outgoing"} payment`} onClick={() => setOpen(open === t.hash ? null : t.hash)} />
              <span className={`${styles.txDir} ${t.direction === "in" ? styles.txIn : ""}`} aria-hidden="true">{t.direction === "in" ? "↓" : "↑"}</span>
              <div className={styles.txMain}>
                <strong>{t.direction === "in" ? "Received" : t.direction === "self" ? "Sent to yourself" : "Sent"}</strong>
                {sub && !hidden
                  ? <span className={`small ${styles.txNote}`} title={sub}>{sub}</span>
                  : <span className={`small muted mono ${styles.txHash}`} title={t.hash}>{t.hash.slice(0, 10)}…{t.hash.slice(-6)}</span>}
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
                  <TxTimeline tx={t} />
                  <dl className={styles.facts}>
                    <dt>Transaction ID</dt><dd className="mono" style={{ wordBreak: "break-all" }}>{t.hash}</dd>
                    {t.timestamp ? <><dt>Date</dt><dd>{new Date(t.timestamp * 1000).toLocaleString()}</dd></> : null}
                    <dt>Confirmations</dt><dd>{t.pending ? "Waiting in the pool" : t.confirmations}</dd>
                    {t.fee !== undefined && t.direction !== "in" ? <><dt>Network fee</dt><dd>{hidden ? "••••" : `${formatXmr(t.fee)} XMR`}</dd></> : null}
                    {tg.at.length && !hidden ? <><dt>Arrived at</dt><dd>{tg.at.join(", ")}</dd></> : null}
                  </dl>
                  {onSaveLabels && !hidden ? <NoteEditor key={t.hash} note={tg.note ?? ""} onSave={(n) => onSaveLabels(withTxNote(labels, t.hash, n))} /> : null}
                  <CopyButton value={t.hash} label="Copy transaction ID" />
                  {t.direction !== "in" ? <Receipt wallet={wallet} tx={t} note={tg.note} /> : null}
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

/** A private note on one payment, saved sealed on this device. */
function NoteEditor({ note, onSave }: { note: string; onSave: (note: string) => Promise<void> }) {
  const [text, setText] = useState(note);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const changed = text.trim() !== note;
  return (
    <form className={styles.noteForm} onSubmit={async (e) => {
      e.preventDefault();
      setState("saving");
      setError(null);
      try {
        await onSave(text);
        setState("saved");
      } catch (err) {
        setError((err as Error).message || "The note could not be saved.");
        setState("idle");
      }
    }}>
      <label htmlFor={id}>Note <span className="muted">(only on this device)</span></label>
      <div className={styles.noteRow}>
        <input id={id} className="input" maxLength={LABEL_MAX} placeholder="What was this for?" value={text}
          onChange={(e) => { setText(e.target.value); setState("idle"); }} />
        <button className="btn btn-secondary btn-sm" disabled={!changed || state === "saving"}>{state === "saving" ? "Saving…" : "Save note"}</button>
      </div>
      {state === "saved" && !changed ? <p className="small muted" role="status" style={{ margin: 0 }}>Saved.</p> : null}
      {error ? <p className="error small" role="alert" style={{ margin: 0 }}>{error}</p> : null}
    </form>
  );
}

/** Export options: which payments, and optionally their value in a currency on each payment's day. */
function ExportPanel({ all, shown, filtered, tags, onClose }: {
  all: TxSummary[];
  shown: TxSummary[];
  filtered: boolean;
  tags: (t: TxSummary) => TxTags;
  onClose: () => void;
}) {
  const [pref] = useCurrencyPref();
  const [picked, setPicked] = useState<string | null>(null);
  const currency = picked ?? pref;
  const [more, setMore] = useState<string[]>([]);
  const [onlyShown, setOnlyShown] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void fetchPriceFeed()
      .then((f) => { if (alive) setMore(Object.keys(f.rates).filter((c) => !(MAIN_CURRENCIES as readonly string[]).includes(c)).sort()); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const list = filtered && onlyShown ? shown : all;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const prices = currency === OFF ? undefined : { currency, days: (await fetchPriceHistory(currency)).days };
      downloadCsv("history", historyCsv(list, { tags, ...(prices ? { prices } : {}) }));
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.exportPanel} aria-labelledby="export-h">
      <h3 id="export-h">Export your history</h3>
      {filtered ? (
        <div className={styles.exportScope} role="radiogroup" aria-label="Which payments">
          <label className="check"><input type="radio" name="export-scope" checked={onlyShown} onChange={() => setOnlyShown(true)} /> The {shown.length} shown</label>
          <label className="check"><input type="radio" name="export-scope" checked={!onlyShown} onChange={() => setOnlyShown(false)} /> All {all.length} payments</label>
        </div>
      ) : null}
      <div className={styles.exportCur}>
        <span>Value of each payment in</span>
        <CurrencyPicker value={currency} main={[...MAIN_CURRENCIES]} more={more} onPick={setPicked} offHint="No value column" label="Value each payment in" />
      </div>
      <p className="small muted" style={{ margin: 0 }}>
        {currency === OFF
          ? "A CSV with dates, amounts, fees, transaction IDs and your notes."
          : <>Each payment gets the XMR closing price of its day (UTC). Our server sends the whole daily price table for {currency}, so it never learns your dates or amounts.</>}
      </p>
      {error ? <p className="error small" role="alert" style={{ margin: 0 }}>{error}</p> : null}
      <div className={styles.exportActions}>
        <button type="button" className="btn btn-primary btn-sm" disabled={busy || !list.length} onClick={() => void save()}>{busy ? "Getting prices…" : `Download CSV (${list.length})`}</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
      </div>
    </section>
  );
}
