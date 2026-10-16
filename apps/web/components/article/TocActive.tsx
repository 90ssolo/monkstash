"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./article.module.css";

interface TocItem { id: string; label: string }

/**
 * "On this page" navigation. Desktop: sticky list with the active section highlighted.
 * Tablet and phone: a collapsible <details> box above the body.
 * Without JavaScript every link still works as a plain anchor.
 */
export function TocActive({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const targets = items
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length || typeof IntersectionObserver === "undefined") return;

    const order = items.map((t) => t.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = e.target.id;
          if (e.isIntersecting) {
            setActive(id);
          } else if (e.boundingClientRect.top > 0) {
            // Heading moved back below the reading band (scrolling up): step to the previous section.
            const i = order.indexOf(id);
            const prev = order[i - 1];
            if (prev) setActive(prev);
          }
        }
      },
      { rootMargin: "-96px 0px -66% 0px", threshold: 0 },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  const list = (
    <ol>
      {items.map((t) => (
        <li key={t.id}>
          <a
            href={`#${t.id}`}
            className={active === t.id ? styles.tocActive : undefined}
            aria-current={active === t.id ? "location" : undefined}
            onClick={() => { if (detailsRef.current) detailsRef.current.open = false; }}
          >
            {t.label}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className={styles.tocCol}>
      <nav className={styles.toc} aria-label="On this page">
        <div className={styles.tocLabel}>On this page</div>
        {list}
      </nav>
      <details className={styles.tocMobile} ref={detailsRef}>
        <summary>On this page</summary>
        <nav aria-label="Sections of this article">{list}</nav>
      </details>
    </div>
  );
}
