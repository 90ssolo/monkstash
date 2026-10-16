import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { ArticleCover } from "@/components/art/Covers";
import { getArticles, type ArticleCard } from "@/lib/content";
import { absoluteUrl, walletUrl } from "@/lib/site";
import { BridgeArt, LearnHeroArt } from "./SectionArt";
import styles from "./section-index.module.css";

/**
 * The library: every guide and explainer in one place, grouped by what the reader wants to do.
 * (Guides and Learn used to be two hubs that looked the same; one library is easier to find
 * your way in.) Anything not mapped below lands in "More", so new articles never vanish.
 */
const TITLE = "The Monero library";
const SUB = "Plain-language guides and explainers for every step: understand Monero, set up a wallet, send and receive, fix problems, and get paid. Grouped by what you want to do.";

const FEATURED = "use-monero";
const PICKS = ["create-monero-wallet", "what-is-monero"];

const GROUPS: { id: string; title: string; blurb: string; slugs: string[]; more?: { href: string; label: string } }[] = [
  { id: "understand", title: "Understand Monero", blurb: "What it is, how it works, and how it compares.", slugs: ["how-monero-works", "monero-fcmp", "monero-vs-bitcoin", "monero-vs-zcash", "is-monero-safe"] },
  { id: "set-up", title: "Set up your wallet", blurb: "From nothing to a wallet you can trust, backed up properly.", slugs: ["back-up-monero-wallet", "monero-seed-phrase", "monero-view-only-wallet", "monero-view-key"] },
  { id: "send-receive", title: "Send and receive", blurb: "Move money with confidence, and check or prove a payment.", slugs: ["send-monero", "receive-monero", "check-monero-balance", "monero-subaddress", "monero-transaction-fee", "monero-transaction-time", "monero-transaction-lookup"] },
  { id: "restore", title: "Recover and restore", blurb: "Get your wallet back from your words, including from MyMonero.", slugs: ["restore-monero-wallet", "exodus-monero", "restore-mymonero-seed", "monero-restore-height"] },
  { id: "fix", title: "Fix a problem", blurb: "Stuck sync, no connection, missing balance, antivirus alarms.", slugs: ["monero-wallet-not-syncing", "monero-wallet-not-connecting", "monero-wallet-not-showing-balance", "monero-unlocked-balance", "monero-gui-virus-warning"] },
  { id: "privacy", title: "How the privacy works", blurb: "Who paid, who got paid, and what stays hidden.", slugs: ["monero-ring-signatures", "monero-stealth-address", "is-monero-traceable"] },
  { id: "nodes", title: "Nodes and light wallets", blurb: "Who your wallet talks to, and how to run your own.", slugs: ["monero-node", "monero-remote-node", "monero-light-wallet", "run-a-monero-node", "monero-pruned-node"] },
  { id: "buy-mine", title: "Buy and mine", blurb: "Where your first XMR comes from.", slugs: ["buy-monero", "buy-monero-without-kyc", "swap-bitcoin-to-monero", "mine-monero", "monero-p2pool"] },
  { id: "safe-legal", title: "Stay safe and legal", blurb: "Avoid the fakes, and know the rules where you live.", slugs: ["monero-phishing-sites", "is-monero-legal", "monero-eu-2027"] },
  { id: "get-paid", title: "Get paid in Monero", blurb: "Payment links, a till for your counter, and shop checkout.", slugs: ["accept-monero-payments", "monero-payment-link", "monero-pos", "monero-payment-gateway", "monero-woocommerce"], more: { href: "/business", label: "MonkStash for business" } },
  { id: "wallets", title: "Choose a wallet", blurb: "Honest reviews and comparisons.", slugs: ["safest-monero-wallet", "cake-wallet-review", "feather-wallet-review", "monero-gui-vs-cli"], more: { href: "/monero-wallets", label: "Compare all Monero wallets" } },
];

export const libraryMetadata: Metadata = {
  title: "Monero Guides and Explainers: The Library",
  description: "Every MonkStash guide in one place: set up a Monero wallet, send and receive, restore, fix problems, understand privacy, and get paid.",
  alternates: { canonical: "/learn" },
  openGraph: ogFor({ type: "website", title: TITLE, description: SUB, path: "/learn" }),
};

function Card({ a, tone, first = false }: { a: ArticleCard; tone?: "clay"; first?: boolean }) {
  return (
    <Link href={a.path} className={`${styles.card} ${tone === "clay" ? styles.cardClay : ""}`}>
      <ArticleCover path={a.path} className={styles.cover} />
      {first ? <span className={styles.firstBadge}>Start with this one</span> : null}
      <span className={styles.kicker}>{a.kicker}</span>
      <h3>{a.title}</h3>
      <p>{a.summary}</p>
      <span className={styles.cardFoot}><span className={styles.read}>Read <span aria-hidden="true">→</span></span><em>{a.readingMinutes} min</em></span>
    </Link>
  );
}

export function Library() {
  const all = getArticles();
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  const featured = bySlug.get(FEATURED);
  const picks = PICKS.map((s) => bySlug.get(s)).filter((a): a is ArticleCard => !!a);
  const shown = new Set([FEATURED, ...PICKS]);
  const known = new Set(GROUPS.flatMap((g) => g.slugs));
  const groups = [
    ...GROUPS.map((g) => ({ ...g, items: g.slugs.filter((s) => !shown.has(s)).map((s) => bySlug.get(s)).filter((a): a is ArticleCard => !!a) })),
    { id: "more", title: "More", blurb: "Newer articles, filed as we go.", slugs: [], items: all.filter((a) => a.section !== "wallets" && !known.has(a.slug) && !shown.has(a.slug)) },
  ].filter((g) => g.items.length > 0);
  const listed = [featured, ...picks, ...groups.flatMap((g) => g.items)].filter((a): a is ArticleCard => !!a);

  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: TITLE, description: SUB, url: absoluteUrl("/learn") },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Learn", item: absoluteUrl("/learn") },
        ] },
        { "@context": "https://schema.org", "@type": "ItemList", itemListElement: listed.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(a.path), name: a.title })) },
      ]} />
      <SiteHeader />
      <main id="main" className={styles.wrap}>
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Learn</span>
            </nav>
            <div className={styles.heroGrid}>
              <header className={styles.head}>
                <p className="eyebrow">Learn</p>
                <h1 className={styles.h1}>{TITLE}</h1>
                <p className={styles.sizzle}>Pick what you came to do. We&apos;ll walk you through it.</p>
                <p className={styles.sub}>{SUB}</p>
                <p className={styles.count}>{listed.length} guides and explainers.</p>
              </header>
              <figure className={styles.heroArt}>
                <LearnHeroArt />
              </figure>
            </div>
          </div>
        </section>

        <nav className={styles.topics} aria-label="Topics">
          <div className="container-wide">
            <ul>
              {groups.map((g) => <li key={g.id}><a href={`#${g.id}`}>{g.title}</a></li>)}
            </ul>
          </div>
        </nav>

        {featured ? (
          <section className={styles.start} aria-labelledby="start-h">
            <div className="container-wide">
              <p className="eyebrow">Start here</p>
              <h2 id="start-h" className={styles.h2}>New to Monero? Begin with these.</h2>
              <div className={styles.grid}>
                <Card a={featured} first />
                {picks.map((a, i) => <Card key={a.slug} a={a} tone={i === 0 ? "clay" : undefined} />)}
              </div>
            </div>
          </section>
        ) : null}

        <div className="container-wide">
          {groups.map((g) => (
            <section key={g.id} id={g.id} className={styles.group} aria-labelledby={`${g.id}-h`}>
              <div className={styles.groupHead}>
                <h2 id={`${g.id}-h`} className={styles.h2}>{g.title}</h2>
                <p>{g.blurb}{g.more ? <> <Link href={g.more.href}>{g.more.label} <span aria-hidden="true">→</span></Link></> : null}</p>
              </div>
              <div className={styles.grid}>
                {g.items.map((a, i) => <Card key={a.slug} a={a} tone={i % 3 === 1 ? "clay" : undefined} />)}
              </div>
            </section>
          ))}
        </div>

        <section className={styles.band} aria-labelledby="next-h">
          <div className="container-wide">
            <div className={styles.bandGrid}>
              <div>
                <p className={styles.bandEyebrow}>Ready to do it</p>
                <h2 id="next-h" className={styles.bandH}>Read enough? Try it.</h2>
                <p className={styles.bandP}>Open the wallet and make your first address in a minute. Nothing to install, no account.</p>
                <ul className={styles.bandLinks}>
                  <li><Link href={walletUrl}>Open the MonkStash wallet <span aria-hidden="true">→</span></Link></li>
                  <li><Link href="/business">Get paid in Monero <span aria-hidden="true">→</span></Link></li>
                  <li><Link href="/monero-wallets">Compare Monero wallets <span aria-hidden="true">→</span></Link></li>
                </ul>
              </div>
              <div className={styles.bandArt}><BridgeArt /></div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
