import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, walletUrl } from "@/lib/site";
import {
  HeroBrowser, RiskPermissions, RiskFake, RiskUpdate, RiskSeed,
  StepOpenTab, StepSetUp, StepBookmark, FutureStack, EmptyShelf,
  ArrowIcon, ChkSymbols,
} from "./Art";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Monero Wallet Chrome Extension: What Works Today",
  description: "Looking for a Monero wallet Chrome extension? Ours is only planned, but the full MonkStash wallet already works in Chrome today, with no install.",
  alternates: { canonical: "/monero-chrome-extension" },
  openGraph: ogFor({ title: "Monero Wallet Chrome Extension: What Works Today", description: "Looking for a Monero wallet Chrome extension? Ours is only planned, but the full MonkStash wallet already works in Chrome today, with no install.", path: "/monero-chrome-extension" }),
};

const faqs = [
  { q: "Is there an official Monero Chrome extension?", a: "There is no widely used, well-maintained Monero wallet extension in the Chrome Web Store. The options that exist are mostly old projects or tools that need the Monero command-line wallet running on your computer. Because of that gap, be careful with any extension claiming to be a Monero wallet." },
  { q: "Can I use Monero in Chrome without an extension?", a: "Yes. MonkStash is a full Monero wallet that runs in the browser, including Chrome, with nothing to install. You open the page, create or restore your wallet, and your keys stay encrypted on your device." },
  { q: "Are Monero browser extensions safe?", a: "Treat unknown extensions with caution. Browser extensions can request broad permissions, and there have been cases of malicious extensions in the past. Only install from official sources, check the permissions, and never enter recovery words into an extension you do not fully trust." },
  { q: "Will MonkStash have a Chrome extension?", a: "A Chrome extension is planned but not in development yet. We will share it if and when it is ready and properly reviewed. Until then, the web wallet gives you the same features in your browser." },
];

const risks = [
  { Art: RiskPermissions, title: "Broad permissions", body: "An extension can ask to read and change the pages you visit. Many people click Allow without reading the list." },
  { Art: RiskFake, title: "Fake listings", body: "Look-alike copies of real wallets turn up wherever people search. The name and the icon can match perfectly." },
  { Art: RiskUpdate, title: "Updates that change it", body: "Extensions update on their own. A tool that was fine last month can change what it does after an update." },
  { Art: RiskSeed, title: "Recovery word prompts", body: "A pop-up that asks you to type your 25 words is how wallets get emptied. A real wallet only asks when you restore." },
];

const checklist = [
  { b: "Know who made it.", t: "Find the maker on a site you trust, and check that site links back to the same listing." },
  { b: "Read the permissions.", t: "If a wallet wants to read every site you visit, ask why it needs that." },
  { b: "Look for public code.", t: "Open source does not make a wallet safe, but closed code leaves you only the maker's word." },
  { b: "Do not trust ratings alone.", t: "Stars and install counts say little about safety." },
  { b: "Never type your words into a pop-up.", t: "Only enter recovery words when you are restoring a wallet you chose to restore." },
  { b: "Start small.", t: "Try any new wallet with a small amount before you trust it with more." },
];

const futureBits = [
  { b: "A shortcut in your toolbar.", t: "Your balance and address one click away, without opening a tab." },
  { b: "The same design as the web wallet.", t: "Non-custodial, with your keys staying on your device and no tracking." },
  { b: "A release only when it is reviewed.", t: "We would rather ship late than rush something that touches your money." },
];

export default function ChromeExtensionPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "Article", headline: "Monero Wallet Chrome Extension: What Exists and What Works Today", description: metadata.description as string, dateModified: "2026-10-15", mainEntityOfPage: absoluteUrl("/monero-chrome-extension"), author: { "@type": "Organization", name: "MonkStash" }, publisher: { "@type": "Organization", name: "MonkStash" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Chrome extension", item: absoluteUrl("/monero-chrome-extension") },
        ] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]} />
      <SiteHeader />
      <main id="main">
        <ChkSymbols />

        {/* 1. HERO */}
        <section className={styles.hero} id="top">
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb" style={{ marginBottom: "var(--s-6)" }}>
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Chrome extension</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Monero wallet Chrome extension</span>{" "}
                  You <mark>do not need</mark> an extension to use Monero in Chrome.
                </h1>
                <p className={styles.sub}>A MonkStash Chrome extension is planned, but it is not in development yet. You do not have to wait: the full MonkStash wallet runs in Chrome right now, with no install and no download.</p>
                <div className={styles.ctaRow}>
                  <Link className="btn btn-primary btn-lg" href={walletUrl}>Open the wallet in Chrome <ArrowIcon /></Link>
                  <Link className="btn btn-ghost btn-lg" href="#risks">Why extensions are risky</Link>
                </div>
                <p className={styles.micro}><span>Works today.</span><span>Nothing to install.</span><span>Keys stay on your device.</span></p>
              </div>
              <figure className={styles.fig}>
                <div className={styles.heroArt}><HeroBrowser /></div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>The wallet in a normal tab. The dashed slot is where a future toolbar icon would go.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. HONEST STATE */}
        <section className={`${styles.sec} ${styles.alt}`} id="state">
          <div className="container-wide">
            <div className={styles.stateGrid}>
              <div>
                <div className={styles.secHead} style={{ marginBottom: 28 }}>
                  <p className="eyebrow">The honest state</p>
                  <h2>The shelf for Monero extensions is nearly empty.</h2>
                </div>
                <p className={styles.stateBody}>If you have searched the Chrome Web Store for a Monero wallet, you have probably found slim pickings. There is <mark>no widely used, actively maintained Monero wallet extension</mark>. The options that turn up are mostly old projects, or tools that only work alongside the Monero command-line wallet running on your own computer.</p>
                <p className={styles.stateBody}>That gap is exactly why it pays to be careful. An empty shelf is where look-alikes move in. Our own extension is <Link className={styles.inlineLink} href="#future">planned, not built</Link>, and the <Link className={styles.inlineLink} href={walletUrl}>web wallet</Link> already does the job.</p>
              </div>
              <figure className={styles.stateFig}>
                <EmptyShelf />
                <figcaption className={styles.figCap}><span><b>Figure 2</b></span><span>Old projects and gaps, not a well-kept shelf.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 3. RISKS */}
        <section className={`${styles.sec} ${styles.dark}`} id="risks" aria-labelledby="risksH">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Before you install anything</p>
              <h2 id="risksH">Wallet extensions are a favourite target.</h2>
              <p className="lede">Browser extensions can ask for broad access to what you do online, and in the past some crypto extensions have turned out to be malicious. Here are the four ways it usually goes <mark>wrong for the user</mark>.</p>
            </div>
            <div className={styles.riskGrid}>
              {risks.map(({ Art, title, body }) => (
                <article key={title} className={styles.risk}>
                  <Art />
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
            <div className={styles.checkWrap}>
              <div>
                <h3>Your checklist for any wallet extension</h3>
                <p>Run through it every time. It takes about a minute, and it is the cheapest security you will ever buy.</p>
              </div>
              <ul className={styles.checklist}>
                {checklist.map((c) => <li key={c.b}><b>{c.b}</b> {c.t}</li>)}
              </ul>
            </div>
            <div className={styles.riskClose}>
              <p>When in doubt, a web wallet you load from a bookmarked address is easier to verify.</p>
              <Link className="btn btn-clay" href="/monero-phishing-sites">How to spot fake Monero sites</Link>
            </div>
          </div>
        </section>

        {/* 4. USE IT TODAY */}
        <section className={styles.sec} id="today">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Use MonkStash in Chrome today</p>
              <h2>Three steps, and Monero is in your browser.</h2>
              <p className="lede">MonkStash runs in the browser itself. You create or restore your wallet, your recovery words are <mark>encrypted on your device</mark>, and the wallet connects to a Monero node to find your payments. Nothing is installed, and nothing is sent to our servers.</p>
            </div>
            <div className={styles.steps}>
              <article className={styles.step}>
                <span className={styles.stepNum}>i</span>
                <div className={styles.stepIll}><StepOpenTab /></div>
                <h3>Open the wallet</h3>
                <p>Go to the <Link className={styles.inlineLink} href={walletUrl}>MonkStash wallet</Link> in Chrome. It is a normal web page, so there is <mark>nothing to approve or install</mark>.</p>
              </article>
              <article className={styles.step}>
                <span className={styles.stepNum}>ii</span>
                <div className={styles.stepIll}><StepSetUp /></div>
                <h3>Create or restore</h3>
                <p>Choose create a new wallet, or restore one with your recovery words. Then back up your words and set a password to lock the wallet.</p>
              </article>
              <article className={styles.step}>
                <span className={styles.stepNum}>iii</span>
                <div className={styles.stepIll}><StepBookmark /></div>
                <h3>Bookmark it</h3>
                <p>Star the page once. From then on you reach the wallet from <mark>your own bookmark</mark>, not from a search result that could be a fake. You are ready to receive and send XMR.</p>
              </article>
            </div>
            <p className={styles.stepsNext}>New to Monero? Start with <Link className={styles.inlineLink} href="/create-monero-wallet">how to create a wallet</Link> or <Link className={styles.inlineLink} href="/what-is-monero">what Monero is</Link>.</p>
          </div>
        </section>

        {/* 5. FUTURE */}
        <section className={`${styles.sec} ${styles.alt}`} id="future" aria-labelledby="futureH">
          <div className="container-wide">
            <div className={styles.futGrid}>
              <div>
                <div className={styles.secHead} style={{ marginBottom: 28 }}>
                  <p className="eyebrow">What the extension will add</p>
                  <h2 id="futureH">A toolbar shortcut, built the same careful way.</h2>
                </div>
                <p className="lede" style={{ marginBottom: 22 }}>A Chrome extension can make a wallet quicker to reach and can integrate with pages you visit. If we build one, it will follow the same principles as the web wallet.</p>
                <ul className={styles.futList}>
                  {futureBits.map((f) => <li key={f.b}><b>{f.b}</b> {f.t}</li>)}
                </ul>
                <div className={styles.noDate}>
                  <p>The extension is a milestone on the <Link className={styles.inlineLink} href="/donate">community roadmap</Link>, funded by the people who use MonkStash. <mark>We are not promising a date.</mark></p>
                </div>
                <div className={styles.actions}>
                  <Link className="btn btn-clay" href="/donate">Help fund the extension</Link>
                  <Link className={styles.inlineLink} href={walletUrl}>Or use the wallet now</Link>
                </div>
              </div>
              <figure className={styles.futFig}>
                <FutureStack />
                <figcaption className={`${styles.figCap} ${styles.darkCap}`}><span><b>Figure 3</b></span><span>The plan on paper: a popup on top of the same wallet core. Not built yet.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 6. COMPARE */}
        <section className={styles.sec} id="compare">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Side by side</p>
              <h2>Three ways to get Monero into Chrome.</h2>
              <p className="lede">Only one of them works today and has an address you can bookmark and check.</p>
            </div>
            <div className={styles.tablewrap}>
              <table className={styles.mag}>
                <caption>Table 1. MonkStash in Chrome, a future extension, and unknown extensions</caption>
                <thead>
                  <tr>
                    <th scope="col">What you care about</th>
                    <th scope="col" className={styles.us}>MonkStash in Chrome today</th>
                    <th scope="col">A future MonkStash extension</th>
                    <th scope="col">Unknown extensions from the store</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Install needed</th>
                    <td className={styles.us} data-label="Today">Nothing</td>
                    <td data-label="Future extension">A store install</td>
                    <td data-label="Unknown extensions">A store install</td>
                  </tr>
                  <tr>
                    <th scope="row">Where your keys live</th>
                    <td className={styles.us} data-label="Today">Encrypted on your device</td>
                    <td data-label="Future extension">Encrypted on your device (same design)</td>
                    <td data-label="Unknown extensions">Depends on the maker. Check first.</td>
                  </tr>
                  <tr>
                    <th scope="row">Risk of fake copies</th>
                    <td className={styles.us} data-label="Today">Lower, if you use your own bookmark</td>
                    <td data-label="Future extension">Possible, as with any extension</td>
                    <td data-label="Unknown extensions">Higher. Look-alikes are common.</td>
                  </tr>
                  <tr>
                    <th scope="row">Updates</th>
                    <td className={styles.us} data-label="Today">You get the current version each time you open it</td>
                    <td data-label="Future extension">Through the store</td>
                    <td data-label="Unknown extensions">Automatic, and can change the tool</td>
                  </tr>
                  <tr>
                    <th scope="row">Works today</th>
                    <td className={styles.us} data-label="Today"><span className={styles.yes}><svg aria-hidden="true"><use href="#exChk" /></svg>Yes</span></td>
                    <td data-label="Future extension"><span className={styles.yes}><svg className={styles.chkClay} aria-hidden="true"><use href="#exNo" /></svg>No, planned</span></td>
                    <td data-label="Unknown extensions">Varies. Few are maintained.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.tnote}>
              <p>Want the full picture of wallet types? <Link className={styles.inlineLink} href="/monero-wallets">Compare every kind of Monero wallet</Link>, or read why a <Link className={styles.inlineLink} href="/mymonero-alternative">MyMonero alternative</Link> is worth choosing carefully.</p>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
        <section className={`${styles.sec} ${styles.alt}`} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>Monero in Chrome, answered</h2>
              <p>More questions? See the <Link className={styles.inlineLink} href="/faq">full FAQ</Link> or <Link className={styles.inlineLink} href="/support">ask for support</Link>.</p>
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

        {/* 8. FINAL CTA */}
        <section className={styles.final} aria-labelledby="finalH">
          <div className={`container-wide ${styles.finalInner}`}>
            <h2 id="finalH">Skip the store. Open your wallet.</h2>
            <p>Free, non-custodial, and ready in Chrome in about two minutes. No download, no account, and no extension to vet.</p>
            <div className={styles.ctaRow}>
              <Link className="btn btn-primary btn-lg" href={walletUrl}>Open the wallet in Chrome</Link>
              <Link className="btn btn-ghost btn-lg" href="/donate">Help fund the extension</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
