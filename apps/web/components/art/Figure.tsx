import type { ReactNode } from "react";
import styles from "./art.module.css";

/**
 * A framed illustration with an optional caption, in the MonkStash paper style.
 * Inside an article the caption is auto-numbered ("Figure N") by CSS counters.
 */
export function Figure({ children, caption, bleed = false, className = "" }: { children: ReactNode; caption?: string; bleed?: boolean; className?: string }) {
  return (
    <figure className={`${styles.figure} ${bleed ? styles.bleed : ""} ${className}`}>
      <div className={styles.stage}>{children}</div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
