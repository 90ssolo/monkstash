import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { TocActive } from "@/components/article/TocActive";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { articlePath, type ArticleModule } from "@/lib/content";
import { ClusterLibrary } from "./ClusterLibrary";
import { pillarOf } from "@/lib/pillars";
import { absoluteUrl, walletUrl } from "@/lib/site";
import article from "@/components/article/article.module.css";
import styles from "./pillar.module.css";

/**
 * Pillar page: the flagship guide of a topic (Backlinko "definitive guide" format).
 * Hero with the keyword H1, a "What's inside" chapter grid, numbered chapters with
 * on-page navigation, sources, FAQ, then the full library of the pillar's cluster pages.
 */
export function PillarLayout({ module: mod, hero }: { module: ArticleModule; hero: ReactNode }) {
  const { meta, Body } = mod;
  const path = articlePath(meta);
  const pillar = pillarOf(path)?.pillar;
  const reviewed = new Date(meta.updated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org", "@type": "Article", headline: meta.title, description: meta.summary,
          datePublished: meta.published ?? meta.updated, dateModified: meta.updated, mainEntityOfPage: absoluteUrl(path),
          image: absoluteUrl("/opengraph-image"),
          author: { "@type": "Organization", name: "MonkStash", url: absoluteUrl("/about") },
          publisher: { "@type": "Organization", name: "MonkStash" },
          ...(meta.sources ? { citation: meta.sources.map((s) => s.href) } : {}),
        },
        {
          "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: meta.h1?.keyword ?? meta.title, item: absoluteUrl(path) },
          ],
        },
        ...(meta.faq ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: meta.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
      ]} />
      <ReadingProgress targetId="article-body" />
      <SiteHeader />
      <main id="main">
        <header className={styles.hero}>
          <div className={`container-wide ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <nav className={article.crumb} aria-label="Breadcrumb">
                <span className={article.crumbStep}><Link href="/">Home</Link><span aria-hidden="true">/</span></span>
                <span className={article.crumbHere} aria-current="page">{meta.h1?.keyword ?? meta.title}</span>
              </nav>
              <span className={styles.kicker}>The complete guide</span>
              <h1 className={styles.h1}>
                <span className={styles.h1Keyword}>{meta.h1?.keyword ?? meta.title}</span>{meta.h1?.sizzle ? " " : null}
                {meta.h1?.sizzle ? <span className={styles.h1Sizzle}>{meta.h1.sizzle}</span> : null}
              </h1>
              <p className={styles.summary}>{meta.summary}</p>
              <div className={styles.metaRow}>
                <span>By the <Link href="/about">MonkStash team</Link></span>
                <span>Reviewed <time dateTime={meta.updated}>{reviewed}</time></span>
                <span>{meta.readingMinutes} min read</span>
                <span>{meta.toc.length} chapters</span>
              </div>
              <div className={styles.heroActions}>
                <a href="#inside" className="btn btn-primary btn-lg">Start reading</a>
                <Link href={walletUrl} className="btn btn-ghost btn-lg">Open the wallet</Link>
              </div>
            </div>
            <figure className={styles.heroArt}>
              {hero}
            </figure>
          </div>
        </header>

        <section className={styles.inside} id="inside" aria-labelledby="inside-title">
          <div className="container-wide">
            <div className={styles.insideHead}>
              <span className={styles.insideEyebrow}>What&apos;s inside</span>
              <h2 id="inside-title">{meta.toc.length} short chapters. Read them in order, or jump to the one you need.</h2>
            </div>
            <ol className={styles.chapterGrid}>
              {meta.toc.map((c, i) => (
                <li key={c.id}>
                  <a href={`#${c.id}`} className={styles.chapterCard}>
                    <span className={styles.cardNum}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.cardTitle}>{c.label}</span>
                    {meta.chapterBlurbs?.[c.id] ? <span className={styles.cardBlurb}>{meta.chapterBlurbs[c.id]}</span> : null}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className={`container-wide ${article.wrap}`}>
          <div className={article.layout}>
            <TocActive items={meta.toc} />
            <div className={`${article.prose} ${styles.pillarProse}`} id="article-body">
              <Body />

              {meta.sources?.length ? (
                <details className={styles.sources}>
                  <summary>Sources we checked ({meta.sources.length})</summary>
                  <p>Primary sources behind the facts in this guide. Where a fact could change, we link the page that keeps it current.</p>
                  <ol>
                    {meta.sources.map((s) => (
                      <li key={s.href}><a href={s.href} rel="noopener">{s.label}</a></li>
                    ))}
                  </ol>
                </details>
              ) : null}

              {meta.faq ? (
                <section className={article.faq} aria-label="Frequently asked questions">
                  <h2>Frequently asked questions</h2>
                  {meta.faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
                </section>
              ) : null}
            </div>
          </div>

          {pillar ? <ClusterLibrary pillar={pillar.id} /> : null}

          <aside className={article.cta} aria-label="Try the wallet">
            <div className={article.ctaCopy}>
              <span className={article.ctaEyebrow}>MonkStash wallet</span>
              <h2>Your Monero, <em>kept quietly</em> in your own hands.</h2>
              <p>A free, non-custodial wallet that runs in your browser. Your keys are created on your device and stay there.</p>
            </div>
            <div className={article.ctaActions}>
              <Link href={walletUrl} className="btn btn-primary btn-lg">Open wallet</Link>
              <Link href="/monero-wallets" className="btn btn-ghost btn-lg">Compare wallets</Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
