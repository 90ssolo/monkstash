"use client";
/**
 * Proof of payment. "Prove this payment" makes a signed proof for a payment this wallet sent (it
 * can carry a message). It never includes the transaction key: with the sender's main address,
 * that key reveals the sender's change (monero-project/monero#11586). "Check a payment proof"
 * verifies one someone gives you, signed or with another wallet's tx key, against the blockchain.
 */
import { useState } from "react";
import { checkPaymentProof, formatFundsProof, formatPaymentProof, formatXmr, parseFundsProof, parsePaymentProof, parseXmr, PROOF_MESSAGE_MAX, ProofError, shortAddress } from "@quietmint/wallet-core";
import type { FundsCheck, LiveWallet, ProofCheck, TxSummary } from "@/lib/wallet/engine";
import { CopyButton } from "./CopyButton";
import styles from "./wallet.module.css";

export function ProveSent({ wallet, tx }: { wallet: LiveWallet; tx: TxSummary }) {
  const dests = tx.destinations ?? [];
  const [address, setAddress] = useState(dests[0]?.address ?? "");
  const [message, setMessage] = useState("");
  const [proof, setProof] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function make(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { signature } = await wallet.proveSent(tx.hash, address, message.trim());
      const p = checkPaymentProof({ txHash: tx.hash, address, signature, ...(message.trim() ? { message: message.trim() } : {}) });
      setProof(formatPaymentProof(p));
    } catch (err) {
      setError(err instanceof ProofError ? err.message : "A proof could not be made for this payment. It works for payments sent from this wallet; check the recipient address. The details a proof needs are kept only in the browser that sent the payment, so a wallet restored elsewhere may not have them.");
    } finally {
      setBusy(false);
    }
  }

  if (proof) {
    return (
      <div className={styles.proofBox}>
        <strong>Proof of payment</strong>
        <pre className={styles.code}><code>{proof}</code></pre>
        <div className={styles.contactActions}>
          <CopyButton value={proof} label="Copy proof" />
          {canShare ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => { void navigator.share({ title: "Monero payment proof", text: proof }).catch(() => {}); }}>Share</button> : null}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProof(null)}>Make another</button>
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          Anyone you give this to can confirm that this payment reached this address, in MonkStash, Feather, Cake or the Monero GUI
          (check a payment proof). It shows this one payment only, cannot be used to spend, and does not reveal your change or your
          other payments. Your message is signed into it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={make} className={styles.proofBox}>
      <strong>Prove this payment</strong>
      <div className="field">
        <label htmlFor={`pa-${tx.hash}`}>Paid to</label>
        {dests.length > 1 ? (
          <select id={`pa-${tx.hash}`} className="input" value={address} onChange={(e) => setAddress(e.target.value)}>
            {dests.map((d) => <option key={d.address} value={d.address}>{shortAddress(d.address, 8)} ({formatXmr(d.amount, 6)} XMR)</option>)}
          </select>
        ) : (
          <textarea id={`pa-${tx.hash}`} className="textarea mono" style={{ minHeight: 64 }} spellCheck={false} autoComplete="off" autoCapitalize="none" value={address}
            onChange={(e) => setAddress(e.target.value)} placeholder="The address you paid" />
        )}
      </div>
      <div className="field">
        <label htmlFor={`pm-${tx.hash}`}>Message (optional)</label>
        <input id={`pm-${tx.hash}`} className="input" maxLength={PROOF_MESSAGE_MAX} autoComplete="off" placeholder="For example: Order #42" value={message} onChange={(e) => setMessage(e.target.value)} />
        <span className="hint">Signed into the proof, so it cannot be changed later.</span>
      </div>
      {error ? <p className="error small" role="alert" style={{ margin: 0 }}>{error}</p> : null}
      <button className="btn btn-secondary" disabled={busy || !address.trim()}>{busy ? "Making proof…" : "Make proof"}</button>
    </form>
  );
}

export function CheckProof({ wallet, onClose }: { wallet: LiveWallet; onClose: () => void }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ check: ProofCheck; address: string; message?: string; signed: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    let p;
    try {
      p = parsePaymentProof(text);
    } catch (err) {
      return setError(err instanceof ProofError ? err.message : "This proof could not be read.");
    }
    setBusy(true);
    try {
      // Only the signature path covers the message (checkProof uses checkTxKey otherwise).
      setResult({ check: await wallet.checkProof(p), address: p.address, message: p.message, signed: !!p.signature });
    } catch (err) {
      const msg = (err as Error).message || "";
      setError(/not found|No transaction/i.test(msg)
        ? "That transaction was not found on the network. Check the transaction ID, or wait a minute if it was just sent."
        : "The proof could not be checked right now. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const r = result?.check;
  return (
    <section className={styles.proofBox} aria-labelledby="check-proof-h">
      <div className={styles.contactBarHead}>
        <h3 id="check-proof-h" style={{ margin: 0 }}>Check a payment proof</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
      <form onSubmit={check} style={{ display: "grid", gap: "var(--s-3)" }}>
        <div className="field">
          <label htmlFor="proof-text">Paste the proof</label>
          <textarea id="proof-text" className="textarea mono" style={{ minHeight: 140 }} spellCheck={false} autoComplete="off" autoCapitalize="none" value={text}
            onChange={(e) => { setText(e.target.value); setResult(null); setError(null); }} placeholder={"Transaction: ...\nAddress: ...\nSigned proof: OutProofV2..."} />
          <span className="hint">It needs the transaction ID, the address, and a signed proof (or a transaction key from another wallet).</span>
        </div>
        {error ? <p className="error small" role="alert" style={{ margin: 0 }}>{error}</p> : null}
        <button className="btn btn-primary" disabled={busy || !text.trim()}>{busy ? "Checking on the network…" : "Check proof"}</button>
      </form>
      {r ? (
        <div className={r.good ? styles.proofGood : styles.alarm} role="status">
          {r.good ? (
            <>
              <strong>Valid: {formatXmr(r.received, 6)} XMR was paid to this address</strong>
              <span className="small">
                To {shortAddress(result!.address, 8)}. {r.inPool ? "Not confirmed yet (waiting in the pool)." : `${r.confirmations} confirmation${r.confirmations === 1 ? "" : "s"}.`}
                {result!.message
                  ? result!.signed
                    ? ` Signed message: "${result!.message}".`
                    : ` Message (not verified: only a signed proof covers the message): "${result!.message}".`
                  : ""}
              </span>
              {r.received === 0n ? <span className="small">The proof is genuine, but no XMR went to this address in this transaction.</span> : null}
              {!result!.signed ? <span className="small">This proof uses a transaction key. Together with the sender&apos;s address, that key can reveal their change, so suggest they send a signed proof next time.</span> : null}
            </>
          ) : (
            <>
              <strong className={styles.alarmTitle}>This proof does not check out</strong>
              <span className="small">Either the payment did not go to this address, or the key, proof or message is not the original. Ask for the proof again.</span>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

/**
 * A receipt for a payment this wallet sent: when, how much, to whom, what for, and a signed proof
 * per recipient, as plain text to keep or share. Anyone can check the proofs in MonkStash, Feather
 * or the Monero GUI; nothing else about the wallet is revealed.
 */
export function Receipt({ wallet, tx, note }: { wallet: LiveWallet; tx: TxSummary; note?: string }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dests = tx.destinations ?? [];
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  if (!dests.length) return null;

  async function make() {
    setBusy(true);
    setError(null);
    try {
      const lines = ["MonkStash payment receipt"];
      if (tx.timestamp) lines.push(`Date: ${new Date(tx.timestamp * 1000).toLocaleString()}`);
      lines.push(`Paid: ${formatXmr(tx.amount, 12)} XMR`);
      if (tx.fee !== undefined) lines.push(`Network fee: ${formatXmr(tx.fee, 12)} XMR`);
      if (note) lines.push(`For: ${note}`);
      lines.push(`Transaction: ${tx.hash}`);
      for (const d of dests) {
        const { signature } = await wallet.proveSent(tx.hash, d.address, "");
        lines.push("", `To: ${d.address}`, `Amount: ${formatXmr(d.amount, 12)} XMR`, `Signed proof: ${signature}`);
      }
      lines.push("", "Check it with Check a payment proof in MonkStash, Feather or the Monero GUI.");
      setText(lines.join("\n"));
    } catch (err) {
      setError(err instanceof ProofError ? err.message : "A receipt could not be made. It works for payments sent from this browser.");
    } finally {
      setBusy(false);
    }
  }

  if (!text) {
    return (
      <div style={{ display: "grid", gap: "var(--s-2)", justifyItems: "start" }}>
        <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => void make()}>{busy ? "Making receipt…" : "Make a receipt"}</button>
        {error ? <p className="error small" role="alert" style={{ margin: 0 }}>{error}</p> : null}
      </div>
    );
  }
  return (
    <div className={styles.proofBox}>
      <strong>Receipt</strong>
      <pre className={styles.code}><code>{text}</code></pre>
      <div className={styles.contactActions}>
        <CopyButton value={text} label="Copy receipt" />
        {canShare ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => { void navigator.share({ title: "Monero payment receipt", text }).catch(() => {}); }}>Share</button> : null}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setText(null)}>Close</button>
      </div>
      <p className="small muted" style={{ margin: 0 }}>Keep it for your records, or send it to the shop if they ask. It contains signed proofs, never your keys or a transaction key.</p>
    </div>
  );
}

/**
 * Proof of funds: show that this wallet holds at least an amount (or everything it has), without
 * moving anything, for example before a peer-to-peer trade; and check one someone gives you.
 */
export function FundsProofPanel({ wallet, primaryAddress, canProve, onClose }: { wallet: LiveWallet; primaryAddress: string; canProve: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [proof, setProof] = useState<string | null>(null);
  const [paste, setPaste] = useState("");
  const [result, setResult] = useState<FundsCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"prove" | "check" | null>(null);

  async function prove(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const a = amount.trim() ? parseXmr(amount) : undefined;
    if (amount.trim() && (a === null || a === undefined || a <= 0n)) return setError("Enter an amount in XMR, like 2.5, or leave it empty for the whole wallet.");
    if (message.length > PROOF_MESSAGE_MAX) return setError(`Keep the message under ${PROOF_MESSAGE_MAX} characters.`);
    setBusy("prove");
    try {
      const signature = await wallet.proveFunds(a ?? undefined, message.trim());
      setProof(formatFundsProof({ address: primaryAddress, signature, ...(a ? { amount: a } : {}), ...(message.trim() ? { message: message.trim() } : {}) }, (x) => formatXmr(x, 12)));
    } catch (err) {
      setError((err as Error).message || "A proof of funds could not be made.");
    } finally { setBusy(null); }
  }

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    let f;
    try { f = parseFundsProof(paste); } catch (err) { return setError(err instanceof ProofError ? err.message : "This proof could not be read."); }
    setBusy("check");
    try { setResult(await wallet.checkFunds(f)); }
    catch { setError("The proof could not be checked right now. Check your connection and try again."); }
    finally { setBusy(null); }
  }

  return (
    <section className={styles.proofBox} aria-labelledby="funds-h">
      <div className={styles.contactBarHead}>
        <h3 id="funds-h" style={{ margin: 0 }}>Proof of funds</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
      <p className="small muted" style={{ margin: 0 }}>Show that a wallet holds at least an amount, without moving anything. Useful before a peer-to-peer trade.</p>
      {canProve ? (
        proof ? (
          <div style={{ display: "grid", gap: "var(--s-2)" }}>
            <pre className={styles.code}><code>{proof}</code></pre>
            <div className={styles.contactActions}>
              <CopyButton value={proof} label="Copy proof" />
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProof(null)}>Make another</button>
            </div>
          </div>
        ) : (
          <form onSubmit={prove} style={{ display: "grid", gap: "var(--s-3)" }}>
            <div className="field">
              <label htmlFor="funds-amt">Prove at least (XMR)</label>
              <input id="funds-amt" className="input" inputMode="decimal" autoComplete="off" placeholder="Empty: the whole wallet" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="funds-msg">Message (optional)</label>
              <input id="funds-msg" className="input" maxLength={PROOF_MESSAGE_MAX} autoComplete="off" placeholder="For example: Trade 7, 26 October" value={message} onChange={(e) => setMessage(e.target.value)} />
              <span className="hint">Signed into the proof, so it cannot be reused for something else.</span>
            </div>
            <div className="notice notice-warn">
              <span>
                A proof of funds shows your main address and names the coins it covers. When you later spend those coins, anyone
                with the proof can tell. <strong>Prove only what you need</strong>, ideally from a separate wallet you keep for trading.
              </span>
            </div>
            <button className="btn btn-secondary" disabled={busy !== null}>{busy === "prove" ? "Making proof…" : "Make proof of funds"}</button>
          </form>
        )
      ) : null}
      <form onSubmit={check} style={{ display: "grid", gap: "var(--s-3)" }}>
        <div className="field">
          <label htmlFor="funds-paste">Check a proof of funds</label>
          <textarea id="funds-paste" className="textarea mono" style={{ minHeight: 110 }} spellCheck={false} autoComplete="off" autoCapitalize="none" value={paste}
            onChange={(e) => { setPaste(e.target.value); setResult(null); }} placeholder={"Address: ...\nSigned proof: ReserveProofV2..."} />
        </div>
        <button className="btn btn-ghost" disabled={busy !== null || !paste.trim()}>{busy === "check" ? "Checking on the network…" : "Check proof"}</button>
      </form>
      {error ? <p className="error small" role="alert" style={{ margin: 0 }}>{error}</p> : null}
      {result ? (
        <div className={result.good ? styles.proofGood : styles.alarm} role="status">
          {result.good ? (
            <>
              <strong>Valid: this wallet holds at least {formatXmr(result.total - result.unconfirmedSpent, 6)} XMR</strong>
              {result.unconfirmedSpent > 0n ? <span className="small">{formatXmr(result.unconfirmedSpent, 6)} XMR of the coins in the proof is already being spent.</span> : null}
            </>
          ) : (
            <strong className={styles.alarmTitle}>This proof does not check out</strong>
          )}
        </div>
      ) : null}
    </section>
  );
}
