import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { SeedDoctor } from "@/components/tools/SeedDoctor";
import { FORMAT_TABLE, ZERO_BALANCE_CAUSES } from "@/lib/seedDoctor";
import { absoluteUrl, walletUrl } from "@/lib/site";
import styles from "../monero-address-validator/page.module.css";

const PATH = "/tools/monero-seed-doctor";
const TITLE = "Monero Seed Doctor: Which Recovery Phrase Do You Have?";
const DESCRIPTION = "25, 16, 13, 12 or 24 words? Find out what your Monero recovery phrase is, where it restores and why a restore can show 0. It never asks for your words.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: ogFor({ title: TITLE, description: DESCRIPTION, path: PATH }),
};

const faqs = [
  { q: "Is it safe to type my seed into a seed checker website?", a: "No. Anyone who sees your recovery words can take your money, and fake checker and wallet sites exist to collect them. This tool only asks how many words you have and which app made them. Type your words only into a wallet app you trust, on your own device." },
  { q: "Why does my restored Monero wallet show 0?", a: "Usually the restore height is too late, so the wallet skipped your earlier payments, or the scan has not finished. Restore again with an earlier date and wait until it says it is up to date. Also check that the address matches the one you used: a phrase from another app can open a different, empty wallet." },
  { q: "What is a 16-word Monero seed?", a: "It is a Polyseed, the newer format that Feather (since version 2.0) and Cake Wallet use. The wallet's creation date is built into the words, so you do not need a restore height. To use it in a wallet without Polyseed support, Feather can show the same wallet as a 25-word seed." },
  { q: "Can I turn a 25-word seed into a 16-word Polyseed?", a: "No. Feather's documentation explains that Polyseed derives the spend key in a way that cannot be reversed. To get a Polyseed, create a new wallet and move your funds to it." },
  { q: "My Monero seed has 24 words. Is that wrong?", a: "Not always. It may be a standard seed missing its 25th check word, which can be worked out from the other 24 (the MonkStash restore screen does this). It can also be a hardware wallet's phrase, which you use with the device, or a 24-word BIP39 phrase from Cake Wallet." },
  { q: "Do I need a restore height?", a: "For every format except Polyseed, yes, or the wallet scans the whole chain. Pick a date before your first payment: too early only costs time, too late hides money. This tool and our restore height calculator turn a date into a block height." },
];

const related = [
  { href: "/tools/monero-restore-height-calculator", tag: "Tool", title: "Restore height calculator", body: "Turn any date into the block to restore from." },
  { href: "/monero-wallet-not-showing-balance", tag: "Fix", title: "Wallet not showing balance", body: "Every reason a balance looks wrong, and the fix for each." },
  { href: "/monero-seed-phrase", tag: "Learn", title: "Monero seed phrases", body: "What the words are, how to store them, and what to never do." },
  { href: walletUrl, tag: "Wallet", title: "Restore in MonkStash", body: "25, 13 and 12-word phrases, checked word by word in your browser." },
];

export default function SeedDoctorPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebApplication", name: "Monero Seed Doctor", url: absoluteUrl(PATH), applicationCategory: "UtilitiesApplication", operatingSystem: "Any (web browser)", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
          { "@type": "ListItem", position: 3, name: "Seed doctor", item: absoluteUrl(PATH) },
        ] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]} />
      <SiteHeader />
      <main id="main">
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/tools">Tools</Link><span aria-hidden="true">/</span><span>Seed doctor</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Monero seed doctor</span>{" "}
                  Know your phrase. <mark>Find your coins.</mark>
                </h1>
                <p className={styles.sub}>Tell us how many words you have and which app made them. We tell you what kind of phrase it is, where it restores, and what to do if a restore shows 0. Without ever asking for the words.</p>
                <p className={styles.micro}><span>Free.</span><span>No words entered.</span><span>Nothing uploaded.</span></p>
              </div>
              <SeedDoctor />
            </div>
          </div>
        </section>

        <section className={`${styles.sec} ${styles.alt}`} id="formats">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Every format</p>
              <h2>Which Monero recovery phrase do I have?</h2>
              <p className="lede">The number of words <mark>tells you most of the story</mark>. The app that made it tells you the rest.</p>
            </div>
            <div className={styles.tablewrap}>
              <table className={styles.mag}>
                <caption>Table 1. Monero recovery phrase formats, checked 20 October 2026</caption>
                <thead>
                  <tr><th scope="col">Words</th><th scope="col">What it is</th><th scope="col">Made by</th><th scope="col">Restores in</th><th scope="col">MonkStash</th></tr>
                </thead>
                <tbody>
                  {FORMAT_TABLE.map((r) => (
                    <tr key={r.words}><th scope="row">{r.words}</th><td>{r.name}</td><td>{r.madeBy}</td><td>{r.restores}</td><td>{r.here}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginTop: 20 }}>
              Sources: the <a className={styles.inlineLink} href="https://getmonero.org/resources/user-guides/restore_account.html" rel="noopener">getmonero.org restore guide</a>,
              Feather&apos;s <a className={styles.inlineLink} href="https://docs.featherwallet.org/guides/seed-scheme" rel="noopener">seed scheme</a> page,
              Cake Wallet&apos;s <a className={styles.inlineLink} href="https://docs.cakewallet.com/cryptos/monero" rel="noopener">Monero documentation</a>,
              and the <a className={styles.inlineLink} href="https://github.com/tevador/polyseed" rel="noopener">Polyseed specification</a>.
            </p>
          </div>
        </section>

        <section className={styles.sec} id="never">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Why no words</p>
              <h2>Why this tool never asks for your words</h2>
              <p className="lede">A website that asks for your recovery words is <mark>the classic way Monero gets stolen</mark>.</p>
            </div>
            <div className={styles.lookGrid}>
              <div>
                <p>Since MyMonero shut down in January 2026, search results for &quot;restore my Monero seed&quot; are full of copies that look helpful and can send any phrase typed into them to a thief. A real tool does not need your words to tell you what they are.</p>
                <p>When you do restore, do it in a wallet app you trust, on your own device. In MonkStash the words stay in your browser: the restore screen checks each word and the check word before it starts, and nothing is uploaded. See <Link className={styles.inlineLink} href="/monero-phishing-sites">how to spot fake Monero sites</Link>.</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.sec} ${styles.dark}`} id="zero">
          <div className="container-wide">
            <div className={styles.secHead} style={{ marginBottom: 28 }}>
              <p className="eyebrow">Restored and found 0</p>
              <h2>Why a restored wallet can show 0</h2>
              <p className="lede">Your coins are on the chain, not in the app. <mark>The wallet just has not found them yet.</mark></p>
            </div>
            <ol className={styles.checks}>
              {ZERO_BALANCE_CAUSES.map((c, i) => (
                <li key={c.title}><span className={styles.num}>{["i", "ii", "iii", "iv"][i]}</span><div><b>{c.title}</b><p>{c.body}</p></div></li>
              ))}
            </ol>
            <p className={styles.darkNote}>More causes and fixes: <Link href="/monero-wallet-not-showing-balance">Monero wallet not showing balance</Link>.</p>
          </div>
        </section>

        <section className={styles.sec} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>Recovery phrase questions, answered</h2>
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

        <section className={`${styles.sec} ${styles.alt}`} id="related">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Keep going</p>
              <h2>Ready to restore?</h2>
              <p className="lede">Have a 25, 13 or 12-word phrase? You can <Link className={styles.inlineLink} href={walletUrl}>restore it in MonkStash</Link> in a few minutes. It is free and non-custodial, so your keys stay on your device.</p>
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
