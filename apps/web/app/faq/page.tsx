import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl } from "@/lib/site";
import { FaqHeroArt, ConfirmTimelineArt, RestoreFlowArt } from "../_trust/TrustArt";
import { allFaqs, faqCategories, type FaqEntry } from "./data";
import styles from "../_trust/trust.module.css";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about MonkStash: creating a Monero wallet, recovery words, safety, fees, and how it all works.",
  alternates: { canonical: "/faq" },
  openGraph: ogFor({ title: "Frequently Asked Questions", description: "Answers to common questions about MonkStash: creating a Monero wallet, recovery words, safety, fees, and how it all works.", path: "/faq" }),
};

const headings: Record<string, string> = {
  basics: "The basics",
  safety: "Safety and scams",
  using: "Using your wallet",
  fees: "Fees and timing",
  recovery: "Getting a wallet back",
  mymonero: "Coming from MyMonero",
};

function Answer({ item }: { item: FaqEntry }) {
  const { a, hl } = item;
  if (!hl || !a.includes(hl)) return <p>{a}</p>;
  const [before, ...rest] = a.split(hl);
  return <p>{before}<mark>{hl}</mark>{rest.join(hl)}</p>;
}

export default function FaqPage() {
  let counter = 0;
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: allFaqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "FAQ", item: absoluteUrl("/faq") },
        ] },
      ]} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">FAQ</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Frequently asked questions</span>{" "}
                  Quick answers, <mark>no jargon</mark>.
                </h1>
                <p className={styles.sub}>Short, plain answers about MonkStash and Monero, grouped by what you are trying to do. Pick a topic, open a question, and follow the link if you want the full guide. Still stuck? Head to <Link className={styles.inlineLink} href="/support">support</Link>.</p>
                <p className={styles.jumpLabel} id="jumpLabel">Jump to a topic</p>
                <ul className={styles.jump} aria-labelledby="jumpLabel">
                  {faqCategories.map((c) => (
                    <li key={c.id}>
                      <a href={`#${c.id}`}>
                        <span className={styles.jumpName}>{c.name}</span>
                        <span className={styles.jumpCount}>{c.items.length} questions</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <figure className={styles.fig}>
                <div className={styles.figBox}><FaqHeroArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>Every answer links to the deeper guide when there is one.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. GROUPS */}
        {faqCategories.map((c, gi) => (
          <section key={c.id} id={c.id} className={`${styles.faqGroup} ${gi % 2 === 1 ? styles.alt : ""}`} aria-labelledby={`${c.id}H`}>
            <div className={`container-wide ${styles.faqGrid}`}>
              <div className={styles.faqSide}>
                <p className="eyebrow">{c.name}</p>
                <h2 id={`${c.id}H`}>{headings[c.id] ?? c.name}</h2>
                <p>{c.blurb}</p>
                {c.id === "fees" ? (
                  <figure className={styles.fig}>
                    <div className={styles.figBox}><ConfirmTimelineArt /></div>
                    <figcaption className={styles.figCap}><span><b>Figure 2</b></span><span>From sent to treated as final.</span></figcaption>
                  </figure>
                ) : null}
                {c.id === "recovery" ? (
                  <figure className={styles.fig}>
                    <div className={styles.figBox}><RestoreFlowArt /></div>
                    <figcaption className={styles.figCap}><span><b>Figure 3</b></span><span>Your words bring the wallet back. Restore height says where to start looking.</span></figcaption>
                  </figure>
                ) : null}
              </div>
              <div className={styles.faq}>
                {c.items.map((f) => {
                  counter += 1;
                  return (
                    <details key={f.q} open={counter === 1}>
                      <summary><span className={styles.fn}>{counter}</span>{f.q}<span className={styles.pm} aria-hidden="true" /></summary>
                      <div className={styles.ans}>
                        <Answer item={f} />
                        {f.links?.length ? (
                          <p className={styles.more}>
                            <span className={styles.moreLabel}>Go deeper</span>
                            {f.links.map((l) => <Link key={l.href + l.label} className={styles.inlineLink} href={l.href}>{l.label}</Link>)}
                          </p>
                        ) : null}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          </section>
        ))}

        {/* 3. STILL STUCK (dark) */}
        <section className={`${styles.sec} ${styles.dark}`} aria-labelledby="stuckH">
          <div className="container-wide">
            <div className={styles.secHead} style={{ marginBottom: 0 }}>
              <p className="eyebrow">Still stuck</p>
              <h2 id="stuckH">Did not find your answer?</h2>
              <p className="lede">Our support page covers the common problems by symptom, and it carries one rule worth remembering: <mark>we will never ask for your recovery words</mark>.</p>
              <div className={styles.ctaRow} style={{ marginTop: "var(--s-6)", marginBottom: 0 }}>
                <Link className="btn btn-clay btn-lg" href="/support">Get help</Link>
                <Link className={styles.inlineLink} href="/what-is-monero" style={{ alignSelf: "center" }}>Or start with what Monero is</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
