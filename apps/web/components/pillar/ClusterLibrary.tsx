import Link from "next/link";
import { articleByPath, getRootArticle } from "@/lib/content";
import { getPillar, type PillarId } from "@/lib/pillars";
import { ArticleCover } from "@/components/art/Covers";
import styles from "./pillar.module.css";

/** Titles for cluster members that are not articles (landing pages and tools). */
const NON_ARTICLE: Record<string, { title: string; kicker: string; summary?: string }> = {
  "/monero-chrome-extension": { title: "Monero wallet Chrome extension", kicker: "Extension", summary: "What exists today, what is planned, and the safe way to use Monero in your browser now." },
  "/mymonero-alternative": { title: "A safe MyMonero alternative", kicker: "Switching", summary: "MyMonero closed in January 2026. How to move on without falling for a clone." },
  "/tools/monero-fee-calculator": { title: "Monero fee calculator", kicker: "Free tool", summary: "What a payment costs right now, measured from real transactions in the latest blocks." },
  "/tools/monero-address-validator": { title: "Monero address validator", kicker: "Free tool", summary: "Check an address before you send. Runs in your browser, nothing is uploaded." },
  "/tools/monero-restore-height-calculator": { title: "Monero restore height calculator", kicker: "Free tool", summary: "Turn a date into a block height, or back. Runs in your browser, nothing is uploaded." },
  "/tools/monero-qr-code-generator": { title: "Monero QR code generator", kicker: "Free tool", summary: "Make a payment QR code and monero: link from any address, with an amount and a note." },
  "/tools/monero-mining-calculator": { title: "Monero mining calculator", kicker: "Free tool", summary: "Estimate what your computer would earn mining Monero, from live network difficulty." },
  "/monero-wallets/android": { title: "Best Monero wallets for Android", kicker: "Platform", summary: "Honest picks for Android phones, and what each one trades off." },
  "/monero-wallets/iphone": { title: "Best Monero wallets for iPhone", kicker: "Platform", summary: "What works on iPhone today, and how to stay safe while using it." },
  "/monero-wallets/desktop": { title: "Best Monero desktop wallets", kicker: "Platform", summary: "Windows, Mac and Linux options, from beginner friendly to full node." },
  "/monero-wallets/hardware": { title: "Monero hardware wallets", kicker: "Platform", summary: "Ledger and Trezor support, setup, and when cold storage is worth it." },
};

function card(path: string) {
  const a = articleByPath(path);
  if (a) return { path, title: a.title, kicker: a.kicker, summary: a.summary, minutes: a.readingMinutes };
  const n = NON_ARTICLE[path];
  return n ? { path, title: n.title, kicker: n.kicker, summary: n.summary ?? "", minutes: 0 } : null;
}

/** Every cluster page of a pillar as numbered cards (the pillar's "library"). */
export function ClusterLibrary({ pillar: id, eyebrow, title, intro }: { pillar: PillarId; eyebrow?: string; title?: string; intro?: string }) {
  const pillar = getPillar(id);
  const items = pillar.cluster.map(card).filter((x): x is NonNullable<ReturnType<typeof card>> => !!x);
  if (!items.length) return null;
  return (
    <section className={styles.library} aria-labelledby={`library-${id}`}>
      <div className={styles.libraryHead}>
        <span className="eyebrow">{eyebrow ?? `The ${pillar.name} library`}</span>
        <h2 id={`library-${id}`}>{title ?? "Every guide in this topic"}</h2>
        <p>{intro ?? "Each one goes deeper on a single question from this guide."}</p>
      </div>
      <ol className={styles.libraryGrid}>
        {items.map((x, i) => (
          <li key={x.path}>
            <Link href={x.path} className={styles.libCard}>
              <ArticleCover path={x.path} className={styles.libCover} />
              <span className={styles.libNum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.libKicker}>{x.kicker}</span>
              <span className={styles.libTitle}>{x.title}</span>
              {x.summary ? <span className={styles.libSummary}>{x.summary}</span> : null}
              <span className={styles.libFoot}>{x.minutes ? `${x.minutes} min read` : "Open"} <span aria-hidden="true">&rarr;</span></span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The complete guides (pillars) as cards, for the homepage. The homepage pillar itself is skipped. */
// Reading order for newcomers: what it is, which wallet, keep it safe, use it, get some, get paid, go deeper.
const PILLAR_ORDER: PillarId[] = ["basics", "wallets", "seed-keys", "using", "buying", "merchants", "nodes"];
const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
/** "Seven complete guides": the count in words, so the homepage copy never goes stale. */
export const PILLAR_COUNT_TEXT = WORDS[PILLAR_ORDER.length] ?? String(PILLAR_ORDER.length);

export function PillarIndex() {
  const cards = PILLAR_ORDER.map(getPillar).map((p) => {
    if (p.path === "/monero-wallets") {
      return { path: p.path, name: "Best Monero wallets", sizzle: "Six honest options, none ranked.", meta: `${p.cluster.length} guides inside` };
    }
    const mod = getRootArticle(p.path.slice(1));
    const m = mod?.meta;
    return {
      path: p.path,
      name: m?.h1?.keyword ?? p.name,
      sizzle: m?.h1?.sizzle ?? "",
      meta: m ? `${m.toc.length} chapters, ${m.readingMinutes} min read` : "",
    };
  });
  return (
    <ol className={styles.pillarIndex}>
      {cards.map((c, i) => (
        <li key={c.path}>
          <Link href={c.path} className={styles.pillarCard}>
            <ArticleCover path={c.path} className={styles.pillarCover} />
            <span className={styles.pillarNum}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.pillarEyebrow}>Complete guide</span>
            <span className={styles.pillarName}>{c.name}</span>
            <span className={styles.pillarSizzle}>{c.sizzle}</span>
            <span className={styles.pillarMeta}>{c.meta} <span aria-hidden="true">&rarr;</span></span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** Compact "start here" links for a pillar's cluster (used for the homepage's own cluster). */
export function ClusterLinks({ pillar: id }: { pillar: PillarId }) {
  const items = getPillar(id).cluster.map(card).filter((x): x is NonNullable<ReturnType<typeof card>> => !!x);
  return (
    <ul className={styles.clusterLinks}>
      {items.map((x) => (
        <li key={x.path}><Link href={x.path}>{x.title.split(/[:(?]/)[0]!.trim()}<span aria-hidden="true"> &rarr;</span></Link></li>
      ))}
    </ul>
  );
}
