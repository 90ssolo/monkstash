"use client";
/**
 * The wallet menu at the top of the dashboard: which wallet is open, the others in this browser,
 * and "Add a wallet". One password unlocks them all, so switching needs no password.
 */
import { useEffect, useId, useRef, useState } from "react";
import type { WalletSummary } from "@/lib/wallet/session";
import styles from "./wallet.module.css";

export function WalletSwitcher({ current, wallets, onSwitch, onAdd }: {
  current: string;
  wallets: WalletSummary[];
  onSwitch: (id: string) => Promise<void> | void;
  onAdd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Closes on a click outside and on Escape (focus goes back to the button).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); button.current?.focus(); } };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  async function pick(id: string) {
    setError(null);
    setBusy(id);
    try {
      await onSwitch(id);
      setOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={styles.switcher} ref={box}>
      <button ref={button} type="button" className={styles.switcherBtn} aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((o) => !o)}>
        <span className={styles.switcherName}>{current}</span>
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="visually-hidden">, switch wallet</span>
      </button>
      {open ? (
        <div id={menuId} className={styles.switcherMenu}>
          <p className={styles.switcherHead}>Wallets in this browser</p>
          <ul>
            {wallets.map((w) => (
              <li key={w.id}>
                <button type="button" className={styles.switcherItem} aria-current={w.active ? "true" : undefined} disabled={w.active || busy !== null} onClick={() => void pick(w.id)}>
                  <span className={styles.switcherDot} aria-hidden="true">{w.active ? "✓" : ""}</span>
                  <span className={styles.switcherItemName}>{w.name}</span>
                  {w.kind === "view-only" ? <span className={styles.switcherTag}>Watch-only</span> : null}
                  {busy === w.id ? <span className="small muted">Opening…</span> : null}
                </button>
              </li>
            ))}
          </ul>
          {error ? <p className="error small" role="alert" style={{ margin: "var(--s-2) var(--s-3)" }}>{error}</p> : null}
          <button type="button" className={styles.switcherAdd} disabled={busy !== null} onClick={() => { setOpen(false); onAdd(); }}>
            <span aria-hidden="true">+</span> Add a wallet
          </button>
        </div>
      ) : null}
    </div>
  );
}
