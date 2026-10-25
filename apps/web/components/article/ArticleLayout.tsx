import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { articleByPath, articlePath, getRelated, SECTION_LABEL, SECTION_PATH, type ArticleModule } from "@/lib/content";
import { clusterNeighbors, pillarOf } from "@/lib/pillars";
import { absoluteUrl, authorLd, organizationLd, walletUrl } from "@/lib/site";
import { TocActive } from "./TocActive";
import { ReadingProgress } from "./ReadingProgress";
import { PillarLayout } from "@/components/pillar/PillarLayout";
import styles from "./article.module.css";
import { ArticleCover } from "@/components/art/Covers";

export function ArticleLayout({ module: mod }: { module: ArticleModule }) {
  const { meta, Body, Hero } = mod;
  if (meta.layout === "pillar") return <PillarLayout module={mod} hero={Hero ? <Hero /> : null} />;
  const path = articlePath(meta);
  const related = getRelated(meta);
  const updated = new Date(meta.updated);
  const reviewed = updated.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Breadcrumb follows the pillar the page belongs to (Home > Pillar > Page). The homepage
  // pillar adds no middle step, and pages outside any pillar fall back to their library.
  const inPillar = pillarOf(path);
  const parent = inPillar
    ? (inPillar.isPillar || inPillar.pillar.path === "/" ? null : { name: inPillar.pillar.name, path: inPillar.pillar.path })
    : { name: SECTION_LABEL[meta.section], path: SECTION_PATH[meta.section] };
  const crumbs = [{ name: "Home", path: "/" }, ...(parent ? [parent] : []), { name: meta.title, path }];
  const { prev, next } = clusterNeighbors(path);
  const prevTitle = prev ? (prev === inPillar?.pillar.path ? inPillar.pillar.name : articleByPath(prev)?.title ?? null) : null;
  const nextTitle = next ? articleByPath(next)?.title ?? null : null;

  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org", "@type": "Article", headline: meta.title, description: meta.summary,
          datePublished: meta.published ?? meta.updated, dateModified: meta.updated, mainEntityOfPage: absoluteUrl(path),
          image: absoluteUrl(`${path}/opengraph-image`),
          ...(meta.sources?.length ? { citation: meta.sources.map((s) => s.href) } : {}),
          author: authorLd, publisher: organizationLd,
        },
        {
          "@context": "https://schema.org", "@type": "BreadcrumbList",
          itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path) })),
        },
        ...(meta.faq ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: meta.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }] : []),
      ]} />
      <ReadingProgress targetId="article-body" />
      <SiteHeader />
      <main id="main" className={styles.wrap}>
        <article className="container-wide">
          <nav className={`${styles.crumb} ${styles.crumbArticle}`} aria-label="Breadcrumb">
            {crumbs.slice(0, -1).map((c) => (
              <span key={c.path} className={styles.crumbStep}><Link href={c.path}>{c.name}</Link><span aria-hidden="true">/</span></span>
            ))}
            <span className={styles.crumbHere} aria-current="page">{meta.title}</span>
          </nav>

          <header className={`${styles.head} ${styles.headArticle}`}>
            <span className={styles.kicker}>{meta.kicker}</span>
            <h1 className={styles.title}>{meta.title}</h1>
            <p className={styles.summary}>{meta.summary}</p>
            <div className={styles.meta}>
              <span className={styles.metaItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="m14 8 3 3" /></svg>
                By the MonkStash team
              </span>
              <span className={styles.sep} aria-hidden="true" />
              <span className={styles.metaItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>
                Reviewed <time dateTime={meta.updated}>{reviewed}</time>
              </span>
              <span className={styles.sep} aria-hidden="true" />
              <span className={styles.metaItem}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
                {meta.readingMinutes} min read
              </span>
            </div>
          </header>

          <div className={styles.layout}>
            <TocActive items={meta.toc} />

            <div className={`${styles.prose} ${styles.proseArticle}`} id="article-body">
              <Body />

              {meta.faq ? (
                <section className={styles.faq} aria-label="Frequently asked questions">
                  <h2>Frequently asked questions</h2>
                  {meta.faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
                </section>
              ) : null}

              {meta.sources?.length ? (
                <section aria-labelledby="sources-h">
                  <h2 id="sources-h">Sources</h2>
                  <p>Primary sources behind the facts in this guide.</p>
                  <ol>
                    {meta.sources.map((s) => <li key={s.href}><a href={s.href} rel="noopener">{s.label}</a></li>)}
                  </ol>
                </section>
              ) : null}
            </div>
          </div>

          {prevTitle || nextTitle ? (
            <nav className={styles.seq} aria-label={inPillar ? `More in ${inPillar.pillar.name}` : "More guides"}>
              {prev && prevTitle ? (
                <Link href={prev} className={styles.seqLink} rel="prev">
                  <span className={styles.seqDir}>&larr; Previous</span>
                  <span className={styles.seqTitle}>{prevTitle}</span>
                </Link>
              ) : <span />}
              {next && nextTitle ? (
                <Link href={next} className={`${styles.seqLink} ${styles.seqNext}`} rel="next">
                  <span className={styles.seqDir}>Next &rarr;</span>
                  <span className={styles.seqTitle}>{nextTitle}</span>
                </Link>
              ) : null}
            </nav>
          ) : null}

          <aside className={styles.cta} aria-label="Try the wallet">
            <div className={styles.ctaCopy}>
              <span className={styles.ctaEyebrow}>MonkStash wallet</span>
              <h2>Your Monero, <em>kept quietly</em> in your own hands.</h2>
              <p>A free, non-custodial wallet that runs in your browser. Your keys are created on your device and stay there.</p>
            </div>
            <div className={styles.ctaActions}>
              <Link href={walletUrl} className="btn btn-primary btn-lg">Open wallet</Link>
              <Link href="/monero-wallets" className="btn btn-ghost btn-lg">Compare wallets</Link>
            </div>
          </aside>

          {related.length ? (
            <section className={styles.related} aria-labelledby="keep-reading">
              <div className={styles.relatedHead}>
                <span className="eyebrow">Next up</span>
                <h2 id="keep-reading">Keep reading</h2>
              </div>
              <div className={styles.relatedGrid}>
                {related.map((r) => (
                  <Link key={r.slug} href={r.path} className={styles.relCard}>
                    <ArticleCover path={r.path} className={styles.relCover} />
                    <span className={styles.relKicker}>{r.kicker}</span>
                    <h3>{r.title}</h3>
                    <span className={styles.relMeta}>{r.readingMinutes} min read<span className={styles.relArrow} aria-hidden="true">&rarr;</span></span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
