"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createTotpSecret, totpUri, verifyTotp, type TotpConfig } from "@quietmint/wallet-core";
import { Qr } from "./Qr";
import styles from "./wallet.module.css";

/** Optional second unlock step with an authenticator app. */
/** `busy` disables every button while the wallet is being saved, so it cannot be opened twice. */
export function TotpStep({ onDone, busy = false, address }: { onDone: (cfg: TotpConfig | undefined) => void; busy?: boolean; address?: string }) {
  const [enabled, setEnabled] = useState(false);
  const cfg = useMemo(() => createTotpSecret(), []);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  // The "Set up authenticator" button disappears when pressed: move focus to the new heading.
  const scanHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (enabled) scanHeading.current?.focus(); }, [enabled]);

  if (!enabled) {
    return (
      <div>
        <h2 tabIndex={-1}>Add an authenticator code? (optional)</h2>
        <p className="muted">
          You can require a 6-digit code from an app such as Aegis, 2FAS or Google Authenticator each time you unlock this
          wallet. It adds a second step on this device. It does not protect your recovery words if someone else gets them.
        </p>
        <div className={styles.actions}>
          <button type="button" className="btn btn-secondary btn-block" disabled={busy} onClick={() => setEnabled(true)}>Set up authenticator</button>
          <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={() => onDone(undefined)}>Skip for now</button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (busy) return;
        if (verifyTotp(cfg, code)) onDone(cfg);
        else setError("That code did not match. Check that your phone’s clock is set to automatic time, and try the newest code.");
      }}
    >
      <h2 tabIndex={-1} ref={scanHeading}>Scan with your authenticator app</h2>
      <div className={styles.totpGrid}>
        <Qr value={totpUri(cfg, address ? `MonkStash ${address.slice(0, 6)}` : undefined)} label="Authenticator setup QR code" size={168} />
        <div className={styles.totpKey}>
          <p className="small muted" style={{ marginBottom: "var(--s-2)" }}>Or enter this key manually:</p>
          <code style={{ wordBreak: "break-all" }}>{cfg.secret}</code>
        </div>
      </div>
      <div className="field">
        <label htmlFor="totp">6-digit code</label>
        <input id="totp" className="input mono" inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code}
          onChange={(e) => { setCode(e.target.value); setError(null); }} aria-invalid={!!error} aria-describedby={error ? "totp-err" : undefined} />
        {error ? <span id="totp-err" className="error" role="alert">{error}</span> : null}
      </div>
      <div className={styles.actions}>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Opening…" : "Verify and continue"}</button>
        <button type="button" className="btn btn-ghost btn-block" disabled={busy} onClick={() => onDone(undefined)}>Skip</button>
      </div>
    </form>
  );
}
