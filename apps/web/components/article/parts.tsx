import type { ReactNode } from "react";
import styles from "./article.module.css";

function InfoIcon() {
  return (
    <svg className={styles.calloutIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 11v5.2" /><circle cx="12" cy="7.8" r="0.6" fill="currentColor" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg className={styles.calloutIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.6 21.2 19.5H2.8L12 3.6Z" /><path d="M12 10v4.2" /><circle cx="12" cy="16.9" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function Callout({ kind = "info", title, children }: { kind?: "info" | "warn"; title?: string; children: ReactNode }) {
  return (
    <aside className={`${styles.callout} ${kind === "warn" ? styles.calloutWarn : ""}`}>
      {kind === "warn" ? <WarnIcon /> : <InfoIcon />}
      <div className={styles.calloutBody}>
        {title ? <strong className={styles.calloutTitle}>{title}</strong> : null}
        <div>{children}</div>
      </div>
    </aside>
  );
}

export function Takeaways({ items }: { items: string[] }) {
  return (
    <div className={styles.takeaways}>
      <span className={styles.takeawaysLabel}>Key points</span>
      <ul>{items.map((i, k) => <li key={k}>{i}</li>)}</ul>
    </div>
  );
}

/** Numbered how-to steps. Each item is a title with an optional body. */
export function Steps({ items }: { items: { title: string; body?: ReactNode }[] }) {
  return (
    <ol className={styles.steps}>
      {items.map((s, k) => (
        <li key={k}>
          <strong>{s.title}</strong>
          {s.body ? <div>{s.body}</div> : null}
        </li>
      ))}
    </ol>
  );
}

/** An editorial pull quote. Use sparingly, once or twice per article. */
export function PullQuote({ children, cite }: { children: ReactNode; cite?: string }) {
  return (
    <div className={styles.pullQuote}>
      <blockquote>{children}</blockquote>
      {cite ? <p className={styles.pullCite}>{cite}</p> : null}
    </div>
  );
}

/** A single stand-out fact with a short label, for the one number or rule a reader should remember. */
export function KeyFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.keyFact}>
      <span className={styles.keyFactLabel}>{label}</span>
      <p>{children}</p>
    </div>
  );
}
