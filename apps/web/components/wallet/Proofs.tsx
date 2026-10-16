"use client";
/**
 * Proof of payment. "Prove this payment" makes a shareable proof for a payment this wallet
 * sent (transaction key plus a signed proof that can carry a message). "Check a payment proof"
 * verifies one someone gives you, against the blockchain. Proofs show one payment to one
 * address; they cannot be used to spend and reveal nothing about other payments.
 */
import { useState } from "react";
import { checkPaymentProof, formatPaymentProof, formatXmr, parsePaymentProof, PROOF_MESSAGE_MAX, ProofError, shortAddress } from "@quietmint/wallet-core";
import type { LiveWallet, ProofCheck, TxSummary } from "@/lib/wallet/engine";
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
      const { txKey, signature } = await wallet.proveSent(tx.hash, address, message.trim());
      const p = checkPaymentProof({ txHash: tx.hash, address, signature, ...(txKey ? { txKey } : {}), ...(message.trim() ? { message: message.trim() } : {}) });
      setProof(formatPaymentProof(p));
    } catch (err) {
      setError(err instanceof ProofError ? err.message : "A proof could not be made for this payment. It works for payments sent from this wallet; check the recipient address. The transaction key is kept only in the browser that sent the payment, so a wallet restored elsewhere may not have it.");
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
          Anyone you give this to can confirm that this payment reached this address. It shows this one payment only, and it cannot be
          used to spend. Most wallets and block explorers accept the transaction key; the signed proof also covers your message.
          {proof.includes("\nTransaction key: ") ? null : " This proof has no transaction key: that key exists only in the browser that sent the payment, so the signed proof is used instead."}
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
            onChange={(e) => { setText(e.target.value); setResult(null); setError(null); }} placeholder={"Transaction: ...\nAddress: ...\nTransaction key: ..."} />
          <span className="hint">It needs the transaction ID, the address, and a transaction key or signed proof.</span>
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
