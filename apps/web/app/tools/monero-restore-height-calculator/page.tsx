import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { estimateHeightAt } from "@quietmint/wallet-core";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { RestoreHeightCalculator } from "@/components/tools/RestoreHeightCalculator";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { absoluteUrl, walletUrl } from "@/lib/site";
import { BlockTimeWide, BlockTimeNarrow } from "./Art";
import styles from "../monero-address-validator/page.module.css";

export const metadata: Metadata = {
  title: "Monero Restore Height Calculator (Date to Block)",
  description: "Free Monero restore height calculator: turn a date into a block height, or a height into a date. Runs in your browser, nothing is uploaded.",
  alternates: { canonical: "/tools/monero-restore-height-calculator" },
  openGraph: ogFor({ title: "Monero Restore Height Calculator (Date to Block)", description: "Free Monero restore height calculator: turn a date into a block height, or a height into a date. Runs in your browser, nothing is uploaded.", path: "/tools/monero-restore-height-calculator" }),
};

const faqs = [
  { q: "What restore height should I use?", a: "Use the block of your first incoming payment, or a little before it. If you only know the date, enter it in the calculator above. It moves the result 7 days earlier, so the scan starts before your first payment. When unsure, go lower: a height that is too low only costs time." },
  { q: "What if I do not know when I made my wallet?", a: "Pick the earliest date it could possibly be, such as the year you first bought Monero. A restore height far too early is safe, just slower. If you have no idea at all, use a height of 0 and let the wallet scan the whole chain." },
  { q: "Can a restore height be too early?", a: "Yes, but the only cost is time. The wallet scans blocks that hold none of your payments before it reaches the first one. Your balance and history will still be correct." },
  { q: "Does MyMonero have a restore height?", a: "MyMonero 13-word phrases do not store a date, so there is nothing to look up. MonkStash can restore them. Pick a date before the first time you used MyMonero, and use an earlier one if the balance looks low." },
  { q: "Is this calculator accurate?", a: "It is an estimate, usually within roughly a day. It uses real block timestamps from the Monero chain, not a flat 2 minute guess, and then adds a 7 day safety margin. Treat the second number it shows as the approximate block, and the big number as the one to use." },
  { q: "Does it work for stagenet or testnet?", a: "No. This calculator is for Monero mainnet only. Stagenet and testnet have their own, much shorter chains, and nobody keeps real money there." },
];

const related = [
  { href: "/monero-restore-height", tag: "Learn", title: "Monero restore height", body: "The full guide: what to pick, and what happens if you get it wrong." },
  { href: "/restore-monero-wallet", tag: "Guide", title: "Restore a Monero wallet", body: "Step by step, from seed phrase to balance." },
  { href: "/restore-mymonero-seed", tag: "Guide", title: "Restore a MyMonero seed", body: "Bring your 13-word phrase to a wallet that still works." },
  { href: walletUrl, tag: "Wallet", title: "Open your wallet", body: "Free, in your browser, ready in about two minutes." },
];

const YEARS = Array.from({ length: 12 }, (_, i) => 2015 + i);
const yearRows = YEARS.map((y) => {
  const h = estimateHeightAt(new Date(Date.UTC(y, 0, 1)), "mainnet", 0);
  return { year: y, height: Math.round(h / 1000) * 1000 };
});

const steps = [
  { n: "i", t: "Pick a date a bit before your first payment", b: "The day you made the wallet, or the first time anyone sent you Monero. If you are not sure, choose an earlier day." },
  { n: "ii", t: "Copy the height", b: "The big number already includes a 7 day safety margin. Use the Copy button so nothing gets mistyped." },
  { n: "iii", t: "Paste it into your wallet", b: "Most wallets have a restore height field on the restore screen. MonkStash asks for a date instead and does this for you." },
  { n: "iv", t: "If the balance looks low, go earlier", b: "Restore again with an earlier date. A lower height never loses money. It only makes the first scan longer." },
];

export default function RestoreHeightCalculatorPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebApplication", name: "Monero Restore Height Calculator", url: absoluteUrl("/tools/monero-restore-height-calculator"), applicationCategory: "UtilitiesApplication", operatingSystem: "Any (web browser)", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
          { "@type": "ListItem", position: 3, name: "Restore height calculator", item: absoluteUrl("/tools/monero-restore-height-calculator") },
        ] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO + TOOL */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/tools">Tools</Link><span aria-hidden="true">/</span><span>Restore height calculator</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Monero restore height calculator</span>{" "}
                  Start the scan just <mark>before</mark> your first payment.
                </h1>
                <p className={styles.sub}>Pick a date and get the block height to restore from. Or turn a block height back into a date. It runs in your browser and nothing is uploaded.</p>
                <p className={styles.micro}><span>Free.</span><span>Mainnet.</span><span>No network calls.</span></p>
              </div>
              <RestoreHeightCalculator />
            </div>
          </div>
        </section>

        {/* 2. WHAT IS A RESTORE HEIGHT */}
        <section className={`${styles.sec} ${styles.alt}`} id="what">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">The basics</p>
              <h2>What is a restore height?</h2>
              <p className="lede">A Monero wallet finds your payments by reading the blockchain block by block. The restore height is the block where it <mark>starts reading</mark>.</p>
            </div>
            <div className={styles.lookGrid}>
              <div>
                <p>Nothing before that block is looked at. So the number has to be at or before your first payment. Your money is not stored in the wallet. It sits on the chain, and the wallet only needs to find it.</p>
                <ul className={styles.facts}>
                  <li><b>Too early.</b> The wallet scans blocks that hold nothing of yours. <mark>It is slower, but the balance is right.</mark></li>
                  <li><b>Too late.</b> The wallet skips payments that came first. The balance looks too low and the history has gaps.</li>
                </ul>
                <p style={{ marginTop: 20 }}>Not sure which to pick? Read the full guide on <Link className={styles.inlineLink} href="/monero-restore-height">Monero restore height</Link>, or follow <Link className={styles.inlineLink} href="/restore-monero-wallet">how to restore a Monero wallet</Link>. The height only helps if you still have your recovery words, so read the <Link className={styles.inlineLink} href="/monero-seed-phrase">guide to your Monero seed phrase</Link> too.</p>
              </div>
              <div className={styles.tablewrap} style={{ marginTop: 0 }}>
                <table className={styles.mag}>
                  <caption>Table 1. Approximate block height on 1 January</caption>
                  <thead>
                    <tr><th scope="col">Year</th><th scope="col">About</th></tr>
                  </thead>
                  <tbody>
                    {yearRows.map((r) => (
                      <tr key={r.year}><th scope="row">{r.year}</th><td>{r.height.toLocaleString("en-US")}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BEFORE 2016 */}
        <section className={styles.sec} id="before-2016">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Old wallets</p>
              <h2>Why dates before 2016 are different</h2>
              <p className="lede">Monero blocks came every 60 seconds until March 2016 (block 1,009,827). After that, <mark>one every 120 seconds</mark>.</p>
            </div>
            <div className={styles.lookGrid}>
              <div>
                <p>Early on there were twice as many blocks a day. A calculator that assumes 2 minutes all the way back counts too few of them, and puts an early wallet far too late. That means missing payments.</p>
                <p>This calculator uses real block timestamps instead of a flat guess. <mark>That is why the numbers in the table are not a straight line.</mark> The change of pace shows up in the 2015 and 2016 rows.</p>
              </div>
              <figure className={styles.fig}>
                <div className={styles.figBox}>
                  <Adaptive wide={<BlockTimeWide />} narrow={<BlockTimeNarrow />} />
                </div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>Blocks came twice as fast before March 2016.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 4. HOW TO USE (dark) */}
        <section className={`${styles.sec} ${styles.dark}`} id="how-to-use">
          <div className="container-wide">
            <div className={styles.secHead} style={{ marginBottom: 28 }}>
              <p className="eyebrow">Put it to work</p>
              <h2>How to use it in your wallet</h2>
              <p className="lede">Four steps. The only one that matters is <mark>starting early</mark>.</p>
            </div>
            <ol className={styles.checks}>
              {steps.map((s) => (
                <li key={s.n}><span className={styles.num}>{s.n}</span><div><b>{s.t}</b><p>{s.b}</p></div></li>
              ))}
            </ol>
            <p className={styles.darkNote}>Restoring from a seed phrase? See <Link href="/restore-monero-wallet">how to restore a Monero wallet</Link>.</p>
          </div>
        </section>

        {/* 5. FAQ */}
        <section className={styles.sec} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>Restore height questions, answered</h2>
            </div>
            <div className={styles.faq}>
              {faqs.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary><span className={styles.fn}>{i + 1}</span>{f.q}<span className={styles.pm} aria-hidden="true" /></summary>
                  <div className={styles.ans}><p>{f.a}</p></div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 6. RELATED */}
        <section className={`${styles.sec} ${styles.alt}`} id="related">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Keep going</p>
              <h2>Ready to restore?</h2>
              <p className="lede">Have your seed phrase and a date? You can <Link className={styles.inlineLink} href={walletUrl}>open a MonkStash wallet</Link> in about two minutes. It is free and non-custodial, so your keys stay on your device.</p>
            </div>
            <div className={styles.relGrid}>
              {related.map((r) => (
                <Link key={r.href} className={styles.rel} href={r.href}>
                  <span className={styles.relTag}>{r.tag}</span>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                  <span className={styles.go}>Read more</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
