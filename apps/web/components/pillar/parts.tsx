import type { ReactNode } from "react";
import Link from "next/link";
import { articleByPath } from "@/lib/content";
import styles from "./pillar.module.css";

/**
 * Chapter opener for pillar pages. Rendered as a sibling of the chapter's content (not a
 * wrapper) so the prose rules for direct children keep applying. The id is the anchor
 * used by the chapter grid and the on-page navigation.
 */
export function ChapterHead({ n, id, title }: { n: number; id: string; title: string }) {
  return (
    <div className={styles.chapterHead} id={id}>
      <span className={styles.chapterNum} aria-hidden="true">{String(n).padStart(2, "0")}</span>
      <div>
        <span className={styles.chapterLabel}>Chapter {n}</span>
        <h2 className={styles.chapterTitle}>{title}</h2>
      </div>
    </div>
  );
}

/** "Go deeper" links from a pillar chapter to its cluster pages. Titles come from the registry. */
export function DeepDive({ paths, label = "Go deeper" }: { paths: string[]; label?: string }) {
  const items = paths.map((p) => ({ path: p, a: articleByPath(p) })).filter((x) => x.a);
  if (!items.length) return null;
  return (
    <aside className={styles.deep} aria-label={label}>
      <span className={styles.deepLabel}>{label}</span>
      <ul>
        {items.map(({ path, a }) => (
          <li key={path}>
            <Link href={path}>
              <span className={styles.deepTitle}>{a!.title}</span>
              <span className={styles.deepMeta}>{a!.readingMinutes} min read <span aria-hidden="true">&rarr;</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Brian Dean style opener: "In this guide you'll learn" list of what the reader gets. */
export function YoullLearn({ items }: { items: ReactNode[] }) {
  return (
    <div className={styles.learn}>
      <span className={styles.learnLabel}>In this guide you&apos;ll learn</span>
      <ul>{items.map((i, k) => <li key={k}>{i}</li>)}</ul>
    </div>
  );
}

/** "At a glance" strip: the handful of numbers a reader should remember. */
export function FactStrip({ items }: { items: { value: string; label: string }[] }) {
  return (
    <dl className={styles.facts}>
      {items.map((f) => (
        <div key={f.label} className={styles.fact}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Use-case cards. Icons are simple line drawings keyed by name. */
const USE_ICONS: Record<string, ReactNode> = {
  save: <><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /><circle cx="12" cy="14" r="1.6" /></>,
  paid: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h4" /></>,
  give: <><path d="M12 20s-7-4.4-7-9.5A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5C19 15.6 12 20 12 20Z" /></>,
  world: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5S14.5 17.9 12 20.5M12 3.5C9.5 6.1 8.4 8.9 8.4 12s1.1 5.9 3.6 8.5" /></>,
  shop: <><path d="M5 8h14l-1.2 11H6.2L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
  shield: <><path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6l7-2.5Z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
};
export function UseCases({ items }: { items: { icon: keyof typeof USE_ICONS; title: string; body: ReactNode }[] }) {
  return (
    <ul className={styles.uses}>
      {items.map((u) => (
        <li key={u.title} className={styles.use}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{USE_ICONS[u.icon]}</svg>
          <strong>{u.title}</strong>
          <span>{u.body}</span>
        </li>
      ))}
    </ul>
  );
}

/** Vertical timeline. The last entry can be marked as upcoming. */
export function Timeline({ items }: { items: { when: string; title: string; body: ReactNode; upcoming?: boolean }[] }) {
  return (
    <ol className={styles.timeline}>
      {items.map((t) => (
        <li key={t.when + t.title} className={t.upcoming ? styles.tlNext : undefined}>
          <span className={styles.tlWhen}>{t.when}</span>
          <div className={styles.tlBody}>
            <strong>{t.title}</strong>
            <span>{t.body}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
