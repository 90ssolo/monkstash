"use client";
/**
 * Security settings: change the password, turn the authenticator code on or off, and show the
 * keys a watch-only copy needs (for a till). Every action asks for the password (and code)
 * again, and nothing secret stays on screen longer than it must.
 */
import { useEffect, useState } from "react";
import type { TotpConfig } from "@quietmint/wallet-core";
import { Credentials, type SettingsActions } from "./WalletSettings";
import { CopyButton } from "./CopyButton";
import { Qr } from "./Qr";
import styles from "./wallet.module.css";

const MIN_PASSWORD = 10;
const REVEAL_SECONDS = 60;

function Problem({ text }: { text: string | null }) {
  return text ? <p className="small" role="alert" style={{ color: "var(--clay-ink)" }}>{text}</p> : null;
}

export function ChangePassword({ actions, onDone }: { actions: SettingsActions; onDone?: () => void }) {
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters. A short sentence works well.`);
    if (next !== again) return setError("The two new passwords do not match.");
    if (next === pw) return setError("The new password is the same as the current one.");
    setBusy(true);
    try {
      await actions.changePassword(pw, code, next);
      setPw(""); setCode(""); setNext(""); setAgain("");
      setDone(true);
      onDone?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <p className="small" role="status">Password changed. Use the new one next time you unlock.</p>;
  return (
    <form onSubmit={submit} className={styles.settingsForm}>
      <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="chpw" />
      <div className="field">
        <label htmlFor="chpw-new">New password</label>
        <input id="chpw-new" className="input" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required />
        <p className="small muted">At least {MIN_PASSWORD} characters. It cannot be reset, so keep it somewhere safe.</p>
      </div>
      <div className="field">
        <label htmlFor="chpw-again">New password again</label>
        <input id="chpw-again" className="input" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} required />
      </div>
      <Problem text={error} />
      <button className="btn btn-primary btn-block" disabled={busy || !pw || !next}>{busy ? "Saving…" : "Change password"}</button>
    </form>
  );
}

export function TwoFactor({ actions }: { actions: SettingsActions }) {
  const [setup, setSetup] = useState<{ config: TotpConfig; uri: string } | null>(null);
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function run(fn: () => Promise<void>, ok: string) {
    setError(null);
    setBusy(true);
    try {
      await fn();
      setPw(""); setCode(""); setSetup(null);
      setStatus(ok);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (actions.totpEnabled) {
    return (
      <form className={styles.settingsForm} onSubmit={(e) => { e.preventDefault(); void run(() => actions.disableTotp(pw, code), "The authenticator code is off. Unlocking now needs only your password."); }}>
        {status ? <p className="small" role="status">{status}</p> : null}
        <p className="small muted">Your wallet asks for a 6-digit code from your authenticator app at every unlock. To turn this off, confirm it is you.</p>
        <Credentials totp pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="tfa-off" />
        <Problem text={error} />
        <button className="btn btn-secondary btn-block" disabled={busy || !pw}>{busy ? "Saving…" : "Turn off the code"}</button>
      </form>
    );
  }

  if (!setup) {
    return (
      <div className={styles.settingsForm}>
        {status ? <p className="small" role="status">{status}</p> : null}
        <p className="small muted">
          Add a second lock: a 6-digit code from an app such as Aegis, 2FAS or Google Authenticator, asked at every unlock on this device. It does not protect your recovery words if someone else gets them.
        </p>
        <button type="button" className="btn btn-primary btn-block" onClick={() => { setStatus(null); setSetup(actions.newTotp()); }}>Set up the code</button>
      </div>
    );
  }

  return (
    <form className={styles.settingsForm} onSubmit={(e) => { e.preventDefault(); void run(() => actions.enableTotp(setup.config, code, pw), "The authenticator code is on. You will need it at every unlock."); }}>
      <p className="small muted">1. Scan this with your authenticator app (or type the key by hand).</p>
      <Qr value={setup.uri} label="QR code for your authenticator app" size={168} />
      <p className={`mono small ${styles.addr}`}>{setup.config.secret}</p>
      <div className="field">
        <label htmlFor="tfa-new">2. Enter the 6-digit code it shows</label>
        <input id="tfa-new" className="input mono" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
      </div>
      <div className="field">
        <label htmlFor="tfa-pw">3. Your wallet password</label>
        <input id="tfa-pw" className="input" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} required />
      </div>
      <Problem text={error} />
      <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
        <button className="btn btn-primary" disabled={busy || code.length !== 6 || !pw}>{busy ? "Saving…" : "Turn on the code"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => { setSetup(null); setCode(""); setPw(""); setError(null); }}>Cancel</button>
      </div>
    </form>
  );
}

/** The private view key and address, for setting up a watch-only copy (for example a till). */
export function WatchOnlyKeys({ actions }: { actions: SettingsActions }) {
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [keys, setKeys] = useState<{ address: string; viewKey: string; restoreHeight: number } | null>(null);
  const [left, setLeft] = useState(REVEAL_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!keys) return;
    setLeft(REVEAL_SECONDS);
    const t = setInterval(() => setLeft((s) => {
      if (s <= 1) { setKeys(null); return REVEAL_SECONDS; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [keys]);
  useEffect(() => () => setKeys(null), []);

  if (keys) {
    return (
      <div className={styles.settingsForm}>
        <div className="notice notice-warn" role="alert">
          <span><strong>The view key shows every payment you receive.</strong> It cannot spend, but share it only with a device you trust, such as your own till.</span>
        </div>
        <dl className={styles.facts}>
          <dt>Address</dt><dd className="mono" style={{ wordBreak: "break-all" }}>{keys.address}</dd>
          <dt>Private view key</dt><dd className="mono" style={{ wordBreak: "break-all" }}>{keys.viewKey}</dd>
          <dt>Restore height</dt><dd className="tnum">{keys.restoreHeight.toLocaleString()}</dd>
        </dl>
        <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
          <CopyButton value={keys.viewKey} label="Copy view key" />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setKeys(null)}>Hide now</button>
        </div>
        <p className="small muted">On the till, choose &quot;Add a watch-only wallet&quot;, paste the address and view key, then choose &quot;A block height&quot; and enter the restore height. Hiding in {left} seconds.</p>
      </div>
    );
  }

  return (
    <form className={styles.settingsForm} onSubmit={async (e) => {
      e.preventDefault();
      setError(null);
      setBusy(true);
      try {
        setKeys(await actions.watchOnlyKeys(pw, code));
        setPw(""); setCode("");
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(false);
      }
    }}>
      <p className="small muted">A watch-only copy sees payments arrive but can never spend. It is the safe way to run a till or check your balance on another device.</p>
      <Credentials totp={actions.totpEnabled} pw={pw} setPw={setPw} code={code} setCode={setCode} idPrefix="wok" />
      <Problem text={error} />
      <button className="btn btn-primary btn-block" disabled={busy || !pw}>{busy ? "Checking…" : "Show watch-only keys"}</button>
    </form>
  );
}
