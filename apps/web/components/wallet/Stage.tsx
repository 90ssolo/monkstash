/**
 * Presentational two-panel frame for the onboarding and unlock screens.
 * Left: a Ledger context panel (sizzle line, one figure, progress rail). Right: the form card.
 * Under 900px the panel becomes a compact header and the rail stays visible.
 */
import type { ReactNode } from "react";
import styles from "./wallet.module.css";

export function Stage({
  tone = "paper", kicker, sizzle, art, steps, current = 0, wide, children,
}: {
  tone?: "paper" | "ink";
  kicker: string;
  sizzle: ReactNode;
  art: ReactNode;
  steps?: string[];
  current?: number;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${styles.stage} ${wide ? styles.stageWide : ""}`}>
      <aside className={`${styles.ctx} ${tone === "ink" ? styles.ctxInk : ""}`}>
        <p className={`eyebrow ${styles.ctxKicker}`}>{kicker}</p>
        <p className={styles.ctxSizzle}>{sizzle}</p>
        <div className={styles.ctxArt} aria-hidden="true">{art}</div>
        {steps && steps.length > 1 ? (
          <ol className={styles.rail} aria-label="Progress">
            {steps.map((s, i) => (
              <li
                key={s}
                className={`${styles.railItem} ${i < current ? styles.done : i === current ? styles.now : ""}`}
                aria-current={i === current ? "step" : undefined}
              >
                <span className={styles.railDot}>
                  {i < current ? (
                    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ) : i + 1}
                </span>
                <span className={styles.railLabel}>{s}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </aside>
      <div className={`card ${styles.pane}`}>{children}</div>
    </div>
  );
}
