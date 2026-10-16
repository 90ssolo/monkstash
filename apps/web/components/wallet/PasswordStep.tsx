"use client";
import { useRef, useState } from "react";

const MIN = 10;

export function PasswordStep({ onDone, busy }: { onDone: (password: string) => void; busy?: boolean }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [touched, setTouched] = useState(false);
  const tooShort = pw.length < MIN;
  const mismatch = (touched || pw2.length > 0) && pw !== pw2;
  const repeatEmpty = touched && pw2.length === 0;
  const ok = !tooShort && pw === pw2;
  const pwRef = useRef<HTMLInputElement>(null);
  const pw2Ref = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (ok) onDone(pw);
        else if (tooShort) pwRef.current?.focus();
        else pw2Ref.current?.focus();
      }}
    >
      <h2 tabIndex={-1}>Set a wallet password</h2>
      <p className="muted">
        This password encrypts your wallet in this browser. It is not sent anywhere and cannot be reset. If you forget it,
        bring the wallet back using your recovery words.
      </p>
      <div className="field">
        <label htmlFor="pw">Password</label>
        <input id="pw" ref={pwRef} className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)}
          aria-invalid={touched && tooShort} aria-describedby="pw-hint" />
        <span id="pw-hint" className={touched && tooShort ? "error" : "hint"}>At least {MIN} characters. A short sentence works well.</span>
      </div>
      <div className="field">
        <label htmlFor="pw2">Repeat password</label>
        <input id="pw2" ref={pw2Ref} className="input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)}
          aria-invalid={mismatch || repeatEmpty} aria-describedby="pw2-hint" />
        {repeatEmpty ? <span id="pw2-hint" className="error">Repeat your password</span>
          : mismatch ? <span id="pw2-hint" className="error">Passwords do not match</span>
          : <span id="pw2-hint" className="hint">&nbsp;</span>}
      </div>
      <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Encrypting…" : "Continue"}</button>
    </form>
  );
}
