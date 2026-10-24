"use client";
/**
 * Pieces of the send screen: the speed choice, the view that shows where two lookalike addresses
 * differ, and the form for paying several people in one transaction.
 */
import { useId, useState } from "react";
import { addressDiff, checkAddressFormat, contactForAddress, formatXmr, lookalikeAddress, lookalikeContact, parseXmr, shortAddress, xmrAmountProblem, type Contact, type NetworkType } from "@quietmint/wallet-core";
import { MAX_DESTINATIONS, SEND_SPEEDS, type Destination, type SendSpeed } from "@/lib/wallet/engine";
import { QrScanButton } from "./QrScan";
import styles from "./wallet.module.css";

const SPEED_TEXT: Record<SendSpeed, { label: string; hint: string }> = {
  standard: { label: "Standard", hint: "The lowest fee. Usually confirms in the next block or two (about 2 to 4 minutes)." },
  faster: { label: "Faster", hint: "About 4 times the standard fee. Gets ahead of standard payments when the network is busy." },
  fastest: { label: "Fastest", hint: "About 16 times the standard fee. Only worth it when blocks are full and you are in a hurry." },
};

export function speedLabel(s: SendSpeed): string {
  return SPEED_TEXT[s].label;
}

export function SpeedPicker({ value, onChange, disabled }: { value: SendSpeed; onChange: (s: SendSpeed) => void; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="field">
      <span className={styles.amtHead}><span id={`${id}-l`} className={styles.fieldLabel}>Speed</span></span>
      <div className={styles.speed} role="radiogroup" aria-labelledby={`${id}-l`} aria-describedby={`${id}-h`}>
        {SEND_SPEEDS.map((s) => (
          <label key={s} className={value === s ? styles.speedOn : undefined}>
            <input type="radio" name={`${id}-speed`} value={s} checked={value === s} disabled={disabled} onChange={() => onChange(s)} />
            {SPEED_TEXT[s].label}
          </label>
        ))}
      </div>
      <span id={`${id}-h`} className="hint">{SPEED_TEXT[value].hint} You see the exact fee before you send.</span>
    </div>
  );
}

/** An address with the characters that differ from `other` highlighted. */
export function AddressDiff({ address, other }: { address: string; other: string }) {
  return (
    <span className={`mono ${styles.diff}`}>
      {addressDiff(address, other).map((p, i) => (p.same ? <span key={i}>{p.text}</span> : <mark key={i}>{p.text}</mark>))}
    </span>
  );
}

interface Row { id: number; to: string; amount: string }
let rowSeq = 0;
const newRow = (to = "", amount = ""): Row => ({ id: ++rowSeq, to, amount });

/** Reads "address amount" lines (space, comma, semicolon or tab between them). */
function parseList(text: string): { rows: Row[]; bad: number[] } {
  const rows: Row[] = [];
  const bad: number[] = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const t = line.trim();
    if (!t) return;
    const [to, amount, ...rest] = t.split(/[\s,;]+/);
    if (!to || !amount || rest.length) bad.push(i + 1);
    else rows.push(newRow(to, amount));
  });
  return { rows, bad };
}

/**
 * Pay several people in one transaction (one fee, one confirmation). Plain addresses only:
 * names (OpenAlias) and payment links go through the normal send screen.
 */
export function BatchForm({ network, contacts, past, unlocked, synced, busy, error, speed, onSpeed, onBuild, onCancel, inFiat }: {
  network: NetworkType;
  contacts: Contact[] | null;
  past: string[];
  unlocked: bigint;
  synced: boolean;
  busy: boolean;
  error: string | null;
  speed: SendSpeed;
  onSpeed: (s: SendSpeed) => void;
  onBuild: (destinations: Destination[]) => void;
  onCancel: () => void;
  inFiat: (a: bigint) => string | null;
}) {
  const [rows, setRows] = useState<Row[]>(() => [newRow(), newRow()]);
  const [list, setList] = useState("");
  const [listMsg, setListMsg] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const set = (id: number, patch: Partial<Row>) => { setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x))); setProblem(null); setChecked(false); };
  const remove = (id: number) => setRows((r) => (r.length > 1 ? r.filter((x) => x.id !== id) : r));

  const checks = rows.map((r) => {
    const to = r.to.trim();
    const fmt = to ? checkAddressFormat(to, network) : null;
    const atomic = r.amount.trim() ? parseXmr(r.amount) : null;
    const contact = fmt?.ok && contacts ? contactForAddress(to, contacts) : null;
    const lookContact = fmt?.ok && contacts && !contact ? lookalikeContact(to, contacts) : null;
    const lookPast = fmt?.ok && !contact && !lookContact && !past.includes(to) ? lookalikeAddress(to, past) : null;
    return { to, fmt, atomic, contact, look: lookContact ? { name: lookContact.name, address: lookContact.address } : lookPast ? { name: null, address: lookPast } : null };
  });
  const total = checks.reduce((s, c) => s + (c.atomic && c.atomic > 0n ? c.atomic : 0n), 0n);
  const flagged = checks.some((c) => c.look);

  function addList() {
    const { rows: added, bad } = parseList(list);
    const kept = rows.filter((r) => r.to.trim() || r.amount.trim());
    const next = [...kept, ...added];
    if (next.length > MAX_DESTINATIONS) { setListMsg(`One payment can pay at most ${MAX_DESTINATIONS} people. Split the list in two.`); return; }
    setRows(next.length ? next : [newRow()]);
    setList("");
    setListMsg(`${added.length} added.${bad.length ? ` Lines ${bad.join(", ")} were not "address amount" and were skipped.` : ""}`);
    setChecked(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!synced) return setProblem("Wait until the wallet has finished syncing.");
    const used = rows.filter((_, i) => checks[i]!.to || rows[i]!.amount.trim());
    if (used.length < 2) return setProblem("Add at least two recipients. For one, use the normal send screen.");
    const dests: Destination[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < rows.length; i++) {
      const c = checks[i]!;
      if (!c.to && !rows[i]!.amount.trim()) continue;
      const n = i + 1;
      if (!c.fmt?.ok) return setProblem(`Recipient ${n}: ${c.fmt?.reason ?? "enter an address"}.`);
      if (c.atomic === null) return setProblem(`Recipient ${n}: ${xmrAmountProblem(rows[i]!.amount) ?? "enter an amount in XMR, like 0.5"}.`);
      if (c.atomic <= 0n) return setProblem(`Recipient ${n}: enter an amount greater than 0.`);
      if (seen.has(c.to)) return setProblem(`Recipient ${n} is the same address as an earlier one. Combine them into one line.`);
      seen.add(c.to);
      dests.push({ address: c.to, amount: c.atomic });
    }
    if (total >= unlocked) return setProblem(`The total leaves nothing for the network fee. You can send a little under ${formatXmr(unlocked)} XMR in all.`);
    if (flagged && !checked) return setProblem("Check the flagged addresses above before you continue.");
    onBuild(dests);
  }

  return (
    <form onSubmit={submit} className={styles.batch}>
      <div className={styles.batchHead}>
        <h3>Pay several people</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Back to one recipient</button>
      </div>
      <p className="small muted" style={{ margin: 0 }}>Everyone is paid in one transaction, with one network fee. Up to {MAX_DESTINATIONS} recipients. Use addresses here; names and payment links work on the normal send screen.</p>
      <ol className={styles.batchRows}>
        {rows.map((r, i) => {
          const c = checks[i]!;
          return (
            <li key={r.id} className={styles.batchRow}>
              <span className={styles.batchNum} aria-hidden="true">{i + 1}</span>
              <div className={styles.batchFields}>
                <label className="visually-hidden" htmlFor={`b-to-${r.id}`}>Recipient {i + 1} address</label>
                <input id={`b-to-${r.id}`} className="input mono" placeholder="Address" spellCheck={false} autoComplete="off" autoCapitalize="none" value={r.to} readOnly={busy} onChange={(e) => set(r.id, { to: e.target.value })} />
                <label className="visually-hidden" htmlFor={`b-amt-${r.id}`}>Recipient {i + 1} amount in XMR</label>
                <input id={`b-amt-${r.id}`} className={`input ${styles.batchAmt}`} placeholder="XMR" inputMode="decimal" autoComplete="off" value={r.amount} readOnly={busy} onChange={(e) => set(r.id, { amount: e.target.value })} />
                <button type="button" className={`btn btn-ghost btn-sm ${styles.batchDel}`} aria-label={`Remove recipient ${i + 1}`} disabled={busy || rows.length < 2} onClick={() => remove(r.id)}>
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </button>
                <span className={`small ${c.fmt && !c.fmt.ok ? "error" : "muted"} ${styles.batchNote}`}>
                  {c.contact ? <span className={styles.knownContact}>{c.contact.name}</span>
                    : c.fmt && !c.fmt.ok ? c.fmt.reason
                    : c.atomic && c.atomic > 0n && inFiat(c.atomic) ? `About ${inFiat(c.atomic)}` : null}
                </span>
                {c.look ? (
                  <div className={`${styles.batchFlag} ${styles.batchNote}`} role="alert">
                    <strong>{c.look.name ? `Looks like ${c.look.name}'s address, but it is different.` : "Looks like an address you paid before, but it is different."}</strong>
                    <span>This one: <AddressDiff address={c.to} other={c.look.address} /></span>
                    <span className="muted">Before: <span className="mono">{shortAddress(c.look.address, 8)}</span></span>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      <div className={styles.batchTools}>
        <button type="button" className="btn btn-secondary btn-sm" disabled={busy || rows.length >= MAX_DESTINATIONS} onClick={() => setRows((r) => [...r, newRow()])}>+ Add recipient</button>
        <QrScanButton disabled={busy || rows.length >= MAX_DESTINATIONS && rows.every((r) => r.to.trim())} onScan={(text) => {
          const address = text.replace(/^monero:/i, "").split("?")[0]!.trim();
          setRows((r) => {
            const empty = r.find((x) => !x.to.trim());
            return empty ? r.map((x) => (x === empty ? { ...x, to: address } : x)) : r.length < MAX_DESTINATIONS ? [...r, newRow(address)] : r;
          });
        }} />
      </div>
      <details className={styles.batchList}>
        <summary>Paste a list</summary>
        <label htmlFor="b-list" className="small muted">One recipient per line: the address, then the amount in XMR.</label>
        <textarea id="b-list" className="textarea mono" rows={4} spellCheck={false} value={list} onChange={(e) => { setList(e.target.value); setListMsg(null); }} placeholder={"4Abc...xyz 0.25\n8Def...uvw 1.5"} />
        <button type="button" className="btn btn-secondary btn-sm" disabled={!list.trim() || busy} onClick={addList}>Add these</button>
        {listMsg ? <p className="small" role="status" style={{ margin: 0 }}>{listMsg}</p> : null}
      </details>
      <SpeedPicker value={speed} onChange={onSpeed} disabled={busy} />
      <p className={styles.batchTotal}>
        <span>Total to recipients</span>
        <strong>{formatXmr(total)} XMR{inFiat(total) && total > 0n ? <span className="muted"> (about {inFiat(total)})</span> : null}</strong>
      </p>
      <p className="small muted" style={{ margin: 0 }}>Spendable now: {synced ? `${formatXmr(unlocked)} XMR` : "syncing…"}. The network fee is added on the next screen.</p>
      {flagged ? (
        <label className={styles.trust}>
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          <span>I checked every flagged address with the person directly, not from the same message or clipboard.</span>
        </label>
      ) : null}
      {problem || error ? <p className="error small" role="alert">{problem ?? error}</p> : null}
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Calculating fee…" : "Review"}</button>
    </form>
  );
}
