"use client";
/**
 * "Move money from another wallet": the user enters the other wallet's recovery words, this
 * device scans that wallet and sends everything in it to this wallet's main address. For old
 * paper wallets, a second wallet you no longer want, or a wallet someone gave you the words of.
 */
import { useEffect, useState } from "react";
import { checkMoneroWords, estimateHeightAt, exodusPhraseProblem, formatXmr, type NetworkType } from "@quietmint/wallet-core";
import { exodusToMoneroSeed, inspectSeed, normalizeSeed, polyseedWallet, type SendSpeed } from "@/lib/wallet/engine";
import type { SweepPlan, SweepStatus } from "@/lib/wallet/sweep";
import { Credentials, type SettingsActions } from "./WalletSettings";
import { EMPTY_START, RestoreStartField, startHeight, type RestoreStart } from "./RestoreStart";
import { SeedPassphrase } from "./Onboarding";
import { SpeedPicker, speedLabel } from "./SendParts";
import { CopyButton } from "./CopyButton";
import { GiftNote } from "./GiftNote";
import styles from "./wallet.module.css";

const POLL_MS = 1000;

/** A gift link being claimed (or one of this wallet's own gifts being taken back): the scan is already started. */
export interface GiftSweep { mine: boolean; message: string; amount?: bigint; onCheckAgain: () => Promise<void> }

export function Sweep({ actions, network, onClose, onSent, gift }: { actions: SettingsActions; network: NetworkType; onClose: () => void; onSent: () => void; gift?: GiftSweep }) {
  const [status, setStatus] = useState<SweepStatus>({ state: "idle" });
  const [words, setWords] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [start, setStart] = useState<RestoreStart>(EMPTY_START);
  const [speed, setSpeed] = useState<SendSpeed>("standard");
  const [plan, setPlan] = useState<SweepPlan | null>(null);
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A sweep keeps running while this screen is closed (it stops when the wallet locks): pick it up.
  useEffect(() => {
    let alive = true;
    const read = () => void actions.sweepStatus?.().then((s) => { if (alive) setStatus(s); }).catch(() => {});
    read();
    const t = setInterval(read, POLL_MS);
    return () => { alive = false; clearInterval(t); };
  }, [actions]);

  const count = words.trim() ? normalizeSeed(words).split(" ").length : 0;

  async function begin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const check = checkMoneroWords(words);
    if (check.kind === "unknown-words") return setError("Some words are not Monero words. Check the spelling against your backup.");
    if (check.kind === "bad-checksum") return setError("The 25th word does not match the other 24. One of the words is probably wrong or in the wrong place.");
    if (check.kind === "missing-checksum") return setError(`You entered 24 words. The 25th is a check word: it should be "${check.word}". Add it at the end.`);
    if (count !== 25 && count !== 16 && count !== 13 && count !== 12) return setError(`Recovery words come in sets of 25 (16 from Cake Wallet or Feather, 13 from MyMonero, 12 from Exodus). You entered ${count}.`);
    if (count === 12) {
      const problem = exodusPhraseProblem(words);
      if (problem) return setError(problem);
    }
    const from = startHeight(start, network);
    if ("error" in from) return setError(from.error);
    setBusy(true);
    if (count === 16) {
      // A Polyseed carries its own date.
      try {
        const p = await polyseedWallet(words, passphrase, network);
        await actions.sweepStart?.({ seed: p.seed, ...(p.seedOffset ? { seedOffset: p.seedOffset } : {}), restoreHeight: estimateHeightAt(new Date(p.birthday * 1000), network) });
        setWords("");
        setPassphrase("");
        setStatus((await actions.sweepStatus?.()) ?? { state: "idle" });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(false);
      }
      return;
    }
    try {
      const seed = count === 12 ? await exodusToMoneroSeed(words, network) : normalizeSeed(words);
      const seedOffset = count === 25 && passphrase ? passphrase : undefined;
      // Checks the words on this device before anything is opened.
      await inspectSeed(seed, network, seedOffset).catch(() => { throw new Error("These recovery words are not valid. Check the spelling and the order."); });
      await actions.sweepStart?.({ seed, ...(seedOffset ? { seedOffset } : {}), restoreHeight: from.height });
      setWords("");
      setPassphrase("");
      setStatus((await actions.sweepStatus?.()) ?? { state: "idle" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function prepare() {
    setError(null);
    setBusy(true);
    try {
      setPlan((await actions.sweepPrepare?.(speed)) ?? null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await actions.sweepSend?.(pw, code);
      setPw("");
      setCode("");
      setPlan(null);
      setStatus((await actions.sweepStatus?.()) ?? { state: "idle" });
      onSent();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function stop() {
    setPlan(null);
    setError(null);
    await actions.sweepCancel?.().catch(() => {});
    setStatus({ state: "idle" });
  }

  const title = gift ? (gift.mine ? "Take back a gift" : "Claim your gift") : "Move money from another wallet";
  const head = (
    <div className={styles.listHead}>
      <h3 id="sweep-h" className={styles.recentH}>{title}</h3>
      {/* Always stopped on the way out, even after an error: the next scan must start clean. */}
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { void stop().then(onClose); }}>
        {status.state === "scanning" || status.state === "ready" ? "Cancel" : "Close"}
      </button>
    </div>
  );

  if (status.state === "opening" || status.state === "scanning") {
    const pct = status.state === "scanning" ? Math.min(100, Math.round(status.percent * 1000) / 10) : 0;
    return (
      <section className={styles.sweep} aria-labelledby="sweep-h">
        {head}
        <p className="small" role="status">
          {status.state === "opening" ? (gift ? "Opening the gift…" : "Opening the other wallet…") : `${gift ? "Looking for the gift" : "Looking for its payments"}: ${pct}%`}
          {status.state === "scanning" && status.endHeight ? <span className="muted"> (block {status.height.toLocaleString()} of {status.endHeight.toLocaleString()})</span> : null}
        </p>
        <div className={styles.sweepBar} aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
        {status.state === "scanning" && !gift ? <p className="small muted" style={{ margin: 0 }}>From <span className="mono">{status.from.slice(0, 8)}…{status.from.slice(-6)}</span>. This can take a while for an old wallet. You can keep using this one; the scan stops if it locks.</p> : null}
        {gift ? <GiftNote amount={gift.amount} message={gift.message} kicker={gift.mine ? "Your gift" : "A gift for you"} /> : null}
      </section>
    );
  }

  if (status.state === "sent") {
    return (
      <section className={styles.sweep} aria-labelledby="sweep-h">
        {head}
        <p role="status"><strong>{formatXmr(status.amount)} XMR is on its way to this wallet.</strong> It shows in Activity once a block includes it, and can be spent after about 20 minutes.</p>
        <ul className={styles.sweepHashes} aria-label="Transaction IDs">
          {status.hashes.map((h) => <li key={h}><span className="mono">{h.slice(0, 12)}…{h.slice(-8)}</span> <CopyButton value={h} label="Copy ID" /></li>)}
        </ul>
        {gift ? null : <p className="small muted" style={{ margin: 0 }}>The other wallet is now empty. Stop using its recovery words: anyone who has them could see its past payments.</p>}
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => void stop().then(() => { if (gift) onClose(); })}>Done</button>
      </section>
    );
  }

  if (status.state === "ready") {
    const locked = status.total - status.unlocked;
    return (
      <section className={styles.sweep} aria-labelledby="sweep-h">
        {head}
        {gift ? <GiftNote amount={gift.amount} message={gift.message} kicker={gift.mine ? "Your gift" : "A gift for you"} /> : null}
        {gift && status.total === 0n ? null : (
          <dl className={styles.facts}>
            <dt>{gift ? "Found in the gift" : "Other wallet"}</dt>{gift ? <dd><strong>{formatXmr(status.total)} XMR</strong></dd> : <dd className="mono">{status.from.slice(0, 8)}…{status.from.slice(-6)}</dd>}
            {gift ? null : <><dt>Balance</dt><dd>{formatXmr(status.total)} XMR</dd></>}
            {locked > 0n ? <><dt>Not spendable yet</dt><dd>{formatXmr(locked)} XMR</dd></> : null}
          </dl>
        )}
        {status.unlocked === 0n ? (
          gift ? (
            <>
              <p className="small" role="status">{giftWaitText(status.total, status.received, gift.mine)}</p>
              {status.total > 0n || status.received === 0n ? (
                <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => { setBusy(true); setError(null); void gift.onCheckAgain().catch((e: Error) => setError(`Could not check the gift: ${e.message || "the network did not answer."} Try again in a minute.`)).finally(() => setBusy(false)); }}>{busy ? "Checking…" : "Check again"}</button>
              ) : null}
            </>
          ) : (
            <p className="small" role="status">{status.total === 0n
              ? "This wallet is empty. If you expected money, check the start date: payments before it are not found."
              : "Its money is still confirming. Scan again in about 20 minutes."}</p>
          )
        ) : plan ? (
          <form onSubmit={send} className={styles.settingsForm}>
            <dl className={styles.facts}>
              <dt>This wallet receives</dt><dd><strong>{formatXmr(plan.amount)} XMR</strong></dd>
              <dt>Network fee</dt><dd>{formatXmr(plan.fee)} XMR ({speedLabel(plan.speed).toLowerCase()} speed)</dd>
              {plan.count > 1 ? <><dt>Transactions</dt><dd>{plan.count} (it holds many small payments)</dd></> : null}
              <dt>To</dt><dd>This wallet&apos;s main address</dd>
            </dl>
            <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="sweep" />
            <div className={styles.exportActions}>
              <button className="btn btn-primary btn-sm" disabled={busy || !pw}>{busy ? "Sending…" : `${gift ? (gift.mine ? "Take back" : "Claim") : "Move"} ${formatXmr(plan.amount)} XMR now`}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPlan(null)}>Back</button>
            </div>
          </form>
        ) : (
          <>
            <SpeedPicker value={speed} onChange={setSpeed} disabled={busy} />
            <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => void prepare()}>{busy ? "Calculating fee…" : gift ? (gift.mine ? "Review taking it back" : "Review the claim") : "Review the move"}</button>
          </>
        )}
        {error ? <p className="error small" role="alert" style={{ margin: 0 }}>{error}</p> : null}
      </section>
    );
  }

  if (gift) {
    return (
      <section className={styles.sweep} aria-labelledby="sweep-h">
        {head}
        <GiftNote amount={gift.amount} message={gift.message} kicker={gift.mine ? "Your gift" : "A gift for you"} />
        {status.state === "error" ? <p className="error small" role="alert" style={{ margin: 0 }}>{status.message}</p> : <p className="small" role="status">Opening the gift…</p>}
      </section>
    );
  }

  return (
    <section className={styles.sweep} aria-labelledby="sweep-h">
      {head}
      <p className="small muted" style={{ margin: 0 }}>
        Enter the recovery words of a wallet you control, such as an old paper wallet or a second wallet you no longer need.
        This device scans it and sends everything in it to this wallet. The words are not saved.
      </p>
      {status.state === "error" ? <p className="error small" role="alert" style={{ margin: 0 }}>{status.message}</p> : null}
      <form onSubmit={begin} className={styles.settingsForm}>
        <div className="field">
          <label htmlFor="sweep-words">Recovery words of the other wallet</label>
          <textarea id="sweep-words" className="textarea mono" autoComplete="off" autoCapitalize="none" spellCheck={false} value={words}
            onChange={(e) => { setWords(e.target.value); setError(null); }} />
          <span className="hint">{count === 16 ? "16 words: a Polyseed. Its date is in the words." : count ? `${count} words` : "25 words, 16 from Cake Wallet or Feather, 13 from MyMonero, or 12 from Exodus"}</span>
        </div>
        {count === 25 || count === 16 || passphrase ? <SeedPassphrase id="sweep-pass" value={passphrase} onChange={setPassphrase} /> : null}
        {count === 16 ? null : <RestoreStartField value={start} onChange={setStart} network={network} idPrefix="sweep" dateLabel="When was that wallet made? (speeds up the scan)" />}
        {error ? <p className="error small" role="alert">{error}</p> : null}
        <button className="btn btn-primary btn-sm" disabled={busy || !count}>{busy ? "Checking…" : "Scan that wallet"}</button>
      </form>
    </section>
  );
}

/** What an empty or still confirming gift means, for the person claiming it or the sender. */
function giftWaitText(total: bigint, received: bigint, mine: boolean): string {
  if (total > 0n) return "The gift has arrived and is confirming. It can be moved after 10 confirmations, usually about 20 minutes after it was sent. Check again then.";
  if (received > 0n) return mine ? "This gift was claimed: the money is in the recipient's wallet now." : "This gift was already claimed. A gift link can be claimed only once.";
  return mine
    ? "Nothing has arrived at this gift yet. A new gift shows up after a block or two (a few minutes)."
    : "Nothing has arrived at this gift yet. If it was just sent, it shows up after a block or two (a few minutes).";
}
