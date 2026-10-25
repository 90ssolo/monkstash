"use client";
/**
 * Gift links: Monero in a link (see wallet-core gift.ts). The sender pays a fresh one-off wallet and
 * shares a link holding its key; whoever opens the link moves the gift into their own wallet. The
 * sender keeps every link (sealed on this device) and can take an unclaimed gift back.
 */
import { useCallback, useEffect, useState } from "react";
import { formatXmr, GIFT_MESSAGE_MAX, parseXmr, xmrAmountProblem, type NetworkType } from "@quietmint/wallet-core";
import { Credentials, type GiftView, type SettingsActions } from "./WalletSettings";
import { Sweep } from "./Sweep";
import { CopyButton } from "./CopyButton";
import { Qr } from "./Qr";
import styles from "./wallet.module.css";

/** The smallest gift: below this, the fee to claim it would eat most of it. */
const GIFT_MIN = 100_000_000n; // 0.0001 XMR

/** Make a gift link, then the list of links made from this wallet. */
export function GiftLinks({ actions, network, unlocked, synced, hidden, onSent }: {
  actions: SettingsActions;
  network: NetworkType;
  unlocked: bigint;
  synced: boolean;
  hidden: boolean;
  onSent: () => void;
}) {
  const [making, setMaking] = useState(false);
  const [gifts, setGifts] = useState<GiftView[] | null>(null);
  const [reclaiming, setReclaiming] = useState<GiftView | null>(null);
  const reload = useCallback(async () => {
    try { setGifts((await actions.gifts?.()) ?? []); } catch { setGifts([]); }
  }, [actions]);
  useEffect(() => { void reload(); }, [reload]);

  return (
    <section className={styles.gifts} aria-labelledby="gifts-h">
      <div className={styles.listHead}>
        <h3 id="gifts-h" className={styles.recentH}>Gift links</h3>
        {!making ? <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMaking(true)}>Make a gift link</button> : null}
      </div>
      {!making && !gifts?.length ? (
        <p className="small muted" style={{ margin: 0 }}>
          Give Monero to someone without asking for their address: you get a link, and whoever opens it moves the money into their
          own wallet (MonkStash makes them one if they have none). Until it is claimed, you can take it back.
        </p>
      ) : null}
      {making ? <GiftMaker actions={actions} unlocked={unlocked} synced={synced} hidden={hidden} onClose={() => { setMaking(false); void reload(); }} onSent={() => { onSent(); void reload(); }} /> : null}
      {reclaiming ? (
        <Sweep actions={actions} network={network} onClose={() => { setReclaiming(null); void reload(); }} onSent={() => { onSent(); void reload(); }}
          gift={{ mine: true, message: reclaiming.message, onCheckAgain: async () => { await actions.giftOpen?.(reclaiming.id); } }} />
      ) : null}
      {gifts?.length ? (
        <ul className={styles.giftList}>
          {gifts.map((g) => (
            <GiftRow key={g.id} gift={g} hidden={hidden} busy={!!reclaiming}
              onCheck={async () => { await actions.giftOpen?.(g.id); setReclaiming(g); }}
              onForget={async () => { await actions.giftForget?.(g.id); await reload(); }} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function giftState(g: GiftView): string {
  if (g.reclaimed) return "Taken back";
  if (g.claimedAt) return "Claimed";
  if (!g.hash) return "Sending was not confirmed: check it";
  return "Not claimed yet";
}

function GiftRow({ gift, hidden, busy, onCheck, onForget }: { gift: GiftView; hidden: boolean; busy: boolean; onCheck: () => Promise<void>; onForget: () => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [confirmForget, setConfirmForget] = useState(false);
  const done = !!gift.claimedAt;
  return (
    <li>
      <div className={styles.giftRowMain}>
        <strong className="tnum">{hidden ? "••••" : `${formatXmr(BigInt(gift.amount))} XMR`}</strong>
        <span className="small muted">
          {new Date(gift.createdAt).toLocaleDateString()}, {giftState(gift)}
          {gift.message && !hidden ? <>: &quot;{gift.message}&quot;</> : null}
        </span>
      </div>
      <div className={styles.giftRowActions}>
        {!done ? <CopyButton value={gift.link} label="Copy link" /> : null}
        {!done ? <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => { setError(null); void onCheck().catch((e: Error) => setError(e.message)); }}>Check or take back</button> : null}
        {done || confirmForget ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void onForget().catch((e: Error) => setError(e.message))}>{confirmForget ? "Yes, remove it" : "Remove"}</button>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmForget(true)}>Remove</button>
        )}
      </div>
      {confirmForget && !done ? <p className="small" role="alert" style={{ margin: 0 }}>Removing an unclaimed gift deletes its link from this wallet: you could no longer take it back. The money stays in the gift until someone with the link claims it.</p> : null}
      {error ? <p className="error small" role="alert" style={{ margin: 0 }}>{error}</p> : null}
    </li>
  );
}

function GiftMaker({ actions, unlocked, synced, hidden, onClose, onSent }: { actions: SettingsActions; unlocked: bigint; synced: boolean; hidden: boolean; onClose: () => void; onSent: () => void }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [review, setReview] = useState<{ fee: bigint; amount: bigint } | null>(null);
  const [made, setMade] = useState<GiftView | null>(null);
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState(false);

  // Leaving the form drops a gift that was built but not sent (its key was never saved).
  useEffect(() => () => { void actions.giftCancel?.(); }, [actions]);

  async function prepare(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const problem = xmrAmountProblem(amount);
    const atomic = parseXmr(amount);
    if (problem || !atomic || atomic <= 0n) return setError(problem ?? "Enter an amount, like 0.05");
    if (atomic < GIFT_MIN) return setError(`A gift needs at least ${formatXmr(GIFT_MIN)} XMR, or the network fee to claim it would take most of it.`);
    if (!synced) return setError("Wait until the wallet is up to date.");
    if (atomic >= unlocked) return setError(`That leaves nothing for the network fee. You can spend ${formatXmr(unlocked)} XMR now.`);
    setBusy(true);
    try {
      setReview((await actions.giftPrepare?.(atomic, message, "standard")) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const g = await actions.giftSend?.(pw, code);
      if (g) {
        setMade(g);
        setReview(null);
        setPw("");
        setCode("");
        onSent();
      }
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }

  if (made) {
    const share = typeof navigator !== "undefined" && typeof navigator.share === "function";
    return (
      <div className={styles.giftMade} role="status">
        <p style={{ margin: 0 }}><strong>Your gift of {formatXmr(BigInt(made.amount))} XMR is ready.</strong> Send this link to the person, in a private message.</p>
        <textarea className="textarea mono" readOnly value={made.link} rows={3} aria-label="Gift link" onFocus={(e) => e.currentTarget.select()} />
        <div className={styles.exportActions}>
          <CopyButton value={made.link} label="Copy link" />
          {share ? <button type="button" className="btn btn-secondary btn-sm" onClick={() => void navigator.share({ text: made.message || "A Monero gift for you", url: made.link }).catch(() => {})}>Share</button> : null}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQr(!qr)} aria-expanded={qr}>{qr ? "Hide QR code" : "Show QR code"}</button>
        </div>
        {qr ? <Qr value={made.link} size={220} label="QR code of the gift link" /> : null}
        <div className="notice notice-warn"><span><strong>Anyone who has this link can take the gift.</strong> Share it like cash: only with the person it is for, never in a public post. It is saved in your list below, so you can copy it again or take the gift back while it is unclaimed.</span></div>
        <p className="small muted" style={{ margin: 0 }}>They can claim it once your payment has 10 confirmations, about 20 minutes from now.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Done</button>
      </div>
    );
  }

  if (review) {
    return (
      <form onSubmit={send} className={styles.settingsForm}>
        <dl className={styles.facts}>
          <dt>Gift</dt><dd><strong>{formatXmr(review.amount)} XMR</strong></dd>
          <dt>Network fee</dt><dd>{formatXmr(review.fee)} XMR</dd>
          <dt>Total</dt><dd>{formatXmr(review.amount + review.fee)} XMR</dd>
          {message.trim() ? <><dt>Message</dt><dd>{message.trim()}</dd></> : null}
        </dl>
        <p className="small muted" style={{ margin: 0 }}>When they claim it, a second small network fee comes out of the gift, so they receive a little less (usually under 0.0001 XMR less).</p>
        <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="gift" />
        {error ? <p className="error small" role="alert">{error}</p> : null}
        <div className={styles.exportActions}>
          <button className="btn btn-primary btn-sm" disabled={busy || !pw}>{busy ? "Sending…" : "Make the gift link"}</button>
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => { setReview(null); void actions.giftCancel?.(); }}>Edit</button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={prepare} className={styles.settingsForm}>
      <div className="field">
        <label htmlFor="gift-amt">Amount (XMR)</label>
        <input id="gift-amt" className="input" inputMode="decimal" autoComplete="off" value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); }} aria-describedby="gift-amt-h" />
        <span id="gift-amt-h" className="hint">Spendable now: {!synced ? "syncing…" : hidden ? "hidden" : `${formatXmr(unlocked)} XMR`}</span>
      </div>
      <div className="field">
        <label htmlFor="gift-msg">Message (optional)</label>
        <input id="gift-msg" className="input" maxLength={GIFT_MESSAGE_MAX} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Happy birthday!" aria-describedby="gift-msg-h" />
        <span id="gift-msg-h" className="hint">Travels inside the link and shows when they open it. Anyone with the link can read it.</span>
      </div>
      {error ? <p className="error small" role="alert">{error}</p> : null}
      <div className={styles.exportActions}>
        <button className="btn btn-primary btn-sm" disabled={busy || !amount}>{busy ? "Preparing…" : "Review the gift"}</button>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

/** Claims a gift link into this wallet: from a link opened in this tab, or one pasted here. */
export function GiftClaim({ actions, network, code, onClose, onSent }: { actions: SettingsActions; network: NetworkType; code?: string; onClose: () => void; onSent: () => void }) {
  const [pasted, setPasted] = useState("");
  const [gift, setGift] = useState<{ link: string; message: string; mine: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const open = useCallback(async (link: string) => {
    setError(null);
    setBusy(true);
    try {
      const r = await actions.giftOpen!(link);
      setGift({ link, ...r });
    } catch (err) {
      setError((err as Error).message);
    }
    setBusy(false);
  }, [actions]);
  useEffect(() => { if (code) void open(`#gift=${code}`); }, [code, open]);

  if (gift) {
    return <Sweep actions={actions} network={network} onClose={onClose} onSent={onSent}
      gift={{ mine: gift.mine, message: gift.message, onCheckAgain: async () => { await actions.giftOpen!(gift.link); } }} />;
  }
  return (
    <section className={styles.sweep} aria-labelledby="claim-h">
      <div className={styles.listHead}>
        <h3 id="claim-h" className={styles.recentH}>{code ? "You have a Monero gift" : "Claim a gift link"}</h3>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
      {code ? (
        busy ? <p className="small" role="status">Opening the gift…</p> : null
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void open(pasted); }} className={styles.settingsForm}>
          <div className="field">
            <label htmlFor="claim-link">Gift link</label>
            <input id="claim-link" className="input mono" autoComplete="off" spellCheck={false} value={pasted} onChange={(e) => { setPasted(e.target.value); setError(null); }} placeholder="https://…#gift=…" />
            <span className="hint">The gift moves into this wallet. The link is not saved.</span>
          </div>
          <button className="btn btn-primary btn-sm" disabled={busy || !pasted.trim()}>{busy ? "Opening…" : "Open the gift"}</button>
        </form>
      )}
      {error ? <p className="error small" role="alert" style={{ margin: 0 }}>{error}</p> : null}
    </section>
  );
}
