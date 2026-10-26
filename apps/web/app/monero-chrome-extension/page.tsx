import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, authorLd, organizationLd, helpDiscussionsUrl, repoUrl, walletUrl } from "@/lib/site";
import { extensionRelease as rel } from "@/lib/extensionRelease";
import {
  RiskPermissions, RiskFake, RiskUpdate, RiskSeed,
  StepOpenTab, StepSetUp, StepBookmark, EmptyShelf,
  ArrowIcon, ChkSymbols,
} from "./Art";
import styles from "./page.module.css";

const TITLE = "MonkStash Monero Wallet Extension for Chrome and Firefox";
// The <title>: the search phrase first, and no second brand name (the layout appends " | MonkStash").
const SEO_TITLE = "Monero Wallet Chrome Extension (and Firefox)";
const DESCRIPTION = "A non-custodial Monero wallet in your browser toolbar, for Chrome and Firefox. Open source, keys kept on your device. How to recognise the real listing.";
const UPDATED = "2026-10-22";

export const metadata: Metadata = {
  title: SEO_TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/monero-chrome-extension" },
  openGraph: ogFor({ title: TITLE, description: DESCRIPTION, path: "/monero-chrome-extension" }),
};

const faqs = [
  { q: "Is the MonkStash extension available?", a: "It is built for Chrome and Firefox and its code is public. The Chrome Web Store and Firefox Add-ons are reviewing it, and we link the official listings on this page the day they are approved. Until then, any store listing called MonkStash is not ours. You can install it yourself from our official GitHub release (see the steps on this page), or use the web wallet, which does the same job in a normal tab." },
  { q: "Is it safe to install the extension from a zip file?", a: "Only from our official release, linked on this page, and only after checking that the file's SHA-256 matches the one shown here. We never send extension files by email or chat. A wallet extension offered anywhere else, or sent to you directly, is not ours." },
  { q: "How do I know a MonkStash extension is real?", a: "Install it only from a link on this page, on monkstash.com. Check that the publisher is MonkStash and that the listing links back to monkstash.com. In the extension, Settings shows a build fingerprint you can check against the public source code." },
  { q: "Can the extension read the websites I visit?", a: "No. It has no content scripts and no access to web pages, and no website can talk to it. It connects only to our relay at wallet.monkstash.com, or to your own node if you add one." },
  { q: "Where are my keys kept?", a: "On your device, in the extension's own storage, encrypted with your password. While the wallet is unlocked the keys are held only in memory, and they are gone when it locks: after idle time, when your computer locks, and when the browser closes." },
  { q: "Can I move my web wallet into the extension?", a: "Yes. In the web wallet, save a move file (Settings, Move to another device). In the extension's setup, choose I already use MonkStash, pick that file and enter your recovery words. The file carries the scan progress, your contacts and payment requests, so the extension skips the long first scan." },
  { q: "Can I use Monero in Chrome without an extension?", a: "Yes. The MonkStash web wallet is the same wallet in a normal tab, with nothing to install. Open it from your own bookmark." },
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

const features = [
  { b: "One click from the toolbar.", t: "Balance, send, receive and recent activity in a small popup that opens instantly, even while a scan runs." },
  { b: "The full wallet when you need it.", t: "Expand to a tab, or keep it in the side panel while you browse: payment requests, a till, contacts, proofs and every setting." },
  { b: "Locks itself, and asks before it pays.", t: "Every payment needs your password. It locks after idle time, a minute after every MonkStash window has closed (a few seconds in Firefox), when your computer locks, and when the browser closes." },
  { b: "Bring your wallet.", t: "Create one, restore 25, 13 (MyMonero) or 12 (Exodus) words, add a watch-only wallet, or move from the web wallet without rescanning." },
];

const permissions = [
  { p: "Storage and unlimited storage", why: "to keep the encrypted wallet and its scan progress on your device, in storage that clearing your browsing history does not erase." },
  { p: "wallet.monkstash.com", why: "our relay to the Monero network, the only site it connects to by default." },
  { p: "Idle", why: "to lock the wallet when your computer locks." },
  { p: "Context menus", why: "for one right-click item, \"Pay with MonkStash\": when you choose it, the browser hands over only the address or link you right-clicked, and Send opens filled in." },
  { p: "Offscreen and side panel (Chrome only)", why: "to keep the wallet running while the popup is closed, and to open it in the side panel." },
  { p: "Your own node, only if you add one", why: "the browser asks you to allow that one address." },
];

export default function ChromeExtensionPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: DESCRIPTION, dateModified: UPDATED, mainEntityOfPage: absoluteUrl("/monero-chrome-extension"), author: authorLd, publisher: organizationLd },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Browser extension", item: absoluteUrl("/monero-chrome-extension") },
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
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Browser extension</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Monero wallet extension for Chrome and Firefox</span>{" "}
                  Your Monero wallet, <mark>one click away</mark>.
                </h1>
                <p className={styles.sub}>MonkStash in your browser toolbar: check your balance, send and receive XMR without opening a tab. Your keys are made and kept on your device, and the code is public.</p>
                <div className={styles.statusCard} role="status">
                  <p><strong>Store listings are on their way.</strong> The Chrome Web Store and Firefox Add-ons are reviewing it. We link the official listings here the day they are approved; until then, a store listing called MonkStash is not ours.</p>
                  <p>Want it now? <a className={styles.inlineLink} href="#install">Install it yourself</a> from our official release, or use the <Link className={styles.inlineLink} href={walletUrl}>web wallet</Link>, which is the same wallet.</p>
                </div>
                <div className={styles.ctaRow}>
                  <Link className="btn btn-primary btn-lg" href={walletUrl}>Open the web wallet <ArrowIcon /></Link>
                  <a className="btn btn-ghost btn-lg" href={repoUrl} rel="noopener">See the source code</a>
                </div>
                <p className={styles.micro}><span>Chrome and Firefox.</span><span>Cannot read your websites.</span><span>Open source.</span></p>
              </div>
              <figure className={styles.fig}>
                <img className={styles.shotPopup} src="/extension/popup-home.png" width={760} height={1200} alt="The MonkStash extension popup: sync status, the balance, and Send, Receive and Get paid buttons, with Home, Send, Receive, Activity and More at the bottom." />
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>The popup, release build, with a new empty wallet.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. HOW TO RECOGNISE IT */}
        <section className={`${styles.sec} ${styles.alt}`} id="real">
          <div className="container-wide">
            <div className={styles.stateGrid}>
              <div>
                <div className={styles.secHead} style={{ marginBottom: 28 }}>
                  <p className="eyebrow">The real one</p>
                  <h2>Install it only from a link on this page.</h2>
                </div>
                <p className={styles.stateBody}>The shelf for Monero extensions is nearly empty, and <mark>an empty shelf is where look-alikes move in</mark>. Fake wallet extensions copy the name and the icon perfectly, so the only reliable check is where the link came from.</p>
                <p className={styles.stateBody}>The official MonkStash listings will be linked here, on monkstash.com, and nowhere else. The publisher is MonkStash, the listing links back to this site, and the extension shows a build fingerprint in Settings that anyone can check against the <a className={styles.inlineLink} href={repoUrl} rel="noopener">public source code</a> (see <Link className={styles.inlineLink} href="/verify">how to verify a build</Link>).</p>
              </div>
              <figure className={styles.stateFig}>
                <EmptyShelf />
                <figcaption className={styles.figCap}><span><b>Figure 2</b></span><span>Old projects and gaps: where copies like to sit.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 3. WHAT IT DOES */}
        <section className={`${styles.sec}`} id="features" aria-labelledby="featuresH">
          <div className="container-wide">
            <div className={styles.futGrid}>
              <div>
                <div className={styles.secHead} style={{ marginBottom: 28 }}>
                  <p className="eyebrow">What the extension does</p>
                  <h2 id="featuresH">Quick in the popup, <mark>complete in a tab</mark>.</h2>
                </div>
                <ul className={styles.futList}>
                  {features.map((f) => <li key={f.b}><b>{f.b}</b> {f.t}</li>)}
                </ul>
                <h3 style={{ margin: "28px 0 12px" }}>What it asks your browser for</h3>
                <ul className={styles.permList}>
                  {permissions.map((p) => <li key={p.p}><b>{p.p}:</b> {p.why}</li>)}
                </ul>
                <p>It has no content scripts and cannot read or change the pages you visit. More in the <Link className={styles.inlineLink} href="/privacy#extension">privacy policy</Link>.</p>
              </div>
              <figure className={styles.futFig}>
                <img className={styles.shotWide} src="/extension/tab-home.png" width={1600} height={1000} alt="The full MonkStash wallet in a browser tab: a side menu with Home, Send, Receive, Get paid, Activity, Contacts, Checkup and Settings, and the balance with Send, Receive and Get paid." loading="lazy" />
                <figcaption className={`${styles.figCap} ${styles.darkCap}`}><span><b>Figure 3</b></span><span>The same wallet expanded to a tab.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 3b. INSTALL IT YOURSELF */}
        <section className={`${styles.sec} ${styles.alt}`} id="install" aria-labelledby="installH">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Before the store listings</p>
              <h2 id="installH">Install it yourself, from the <mark>official release</mark>.</h2>
              <p className="lede">The release files are on GitHub, built from the public source. It takes about two minutes. In Chrome, Edge and Brave it stays installed; Firefox only allows a temporary install until its listing is approved.</p>
            </div>
            <div className={styles.installNote} role="note">
              <p><strong>Only from this link:</strong> <a className={styles.inlineLink} href={rel.url} rel="noopener">github.com/90ssolo/monkstash, release {rel.tag}</a>. We never send extension files by email, chat or anywhere else, and no other site offers them. Check the file before you install it.</p>
            </div>
            <div className={styles.installGrid}>
              <article className={styles.installCol}>
                <h3>Chrome, Edge and Brave</h3>
                <ol className={styles.installSteps}>
                  <li>From the <a className={styles.inlineLink} href={rel.url} rel="noopener">release</a>, download <code>{rel.chrome.file}</code>.</li>
                  <li>Check it. The SHA-256 must be <code className={styles.hash}>{rel.chrome.sha256}</code>
                    <span className={styles.cmdLabel}>Windows (Command Prompt):</span><code className={styles.cmd}>certutil -hashfile {rel.chrome.file} SHA256</code>
                    <span className={styles.cmdLabel}>macOS or Linux (Terminal):</span><code className={styles.cmd}>shasum -a 256 {rel.chrome.file}</code></li>
                  <li>Unzip it into a folder you keep. Deleting the folder removes the extension.</li>
                  <li>Open <code>chrome://extensions</code> (in Edge <code>edge://extensions</code>), turn on <b>Developer mode</b>, click <b>Load unpacked</b> and choose that folder.</li>
                  <li>Pin MonkStash to the toolbar. In its Settings, the app build should start with <code>{rel.chrome.fingerprint.slice(0, 12)}</code>.</li>
                </ol>
              </article>
              <article className={styles.installCol}>
                <h3>Firefox (to try it)</h3>
                <ol className={styles.installSteps}>
                  <li>From the <a className={styles.inlineLink} href={rel.url} rel="noopener">release</a>, download <code>{rel.firefox.file}</code>.</li>
                  <li>Check it. The SHA-256 must be <code className={styles.hash}>{rel.firefox.sha256}</code> (same commands as for Chrome).</li>
                  <li>Open <code>about:debugging#/runtime/this-firefox</code>, click <b>Load Temporary Add-on</b> and choose the zip file.</li>
                  <li>In its Settings, the app build should start with <code>{rel.firefox.fingerprint.slice(0, 12)}</code>.</li>
                </ol>
                <p className={styles.installWarn}><b>Temporary means temporary:</b> Firefox removes the add-on, and the wallet in it, when it closes. Use it to look around, with a watch-only wallet or a new empty one, and keep your recovery words.</p>
              </article>
            </div>
            <ul className={styles.futList} style={{ marginTop: 28 }}>
              <li><b>No automatic updates.</b> A self-installed copy stays on this version. New releases are listed here and on GitHub.</li>
              <li><b>A separate install from the store version.</b> When the store listing is live, install it from there, bring your wallet in with your recovery words or a move file, then remove this copy.</li>
              <li><b>Chrome may remind you about developer-mode extensions.</b> That is normal for any extension you install yourself.</li>
              <li><b>Early preview.</b> Use small amounts until the public security review is complete.</li>
            </ul>
          </div>
        </section>

        {/* 4. RISKS */}
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
                <p>Run through it every time, ours included. It takes about a minute, and it is the cheapest security you will ever buy.</p>
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

        {/* 5. USE IT TODAY */}
        <section className={styles.sec} id="today">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Until the listings are live</p>
              <h2>Three steps, and Monero is in your browser today.</h2>
              <p className="lede">The web wallet is the same MonkStash in a normal tab. You create or restore your wallet, your recovery words are <mark>encrypted on your device</mark>, and nothing is installed. Later, a move file takes it into the extension without a rescan.</p>
            </div>
            <div className={styles.steps}>
              <article className={styles.step}>
                <span className={styles.stepNum}>i</span>
                <div className={styles.stepIll}><StepOpenTab /></div>
                <h3>Open the wallet</h3>
                <p>Go to the <Link className={styles.inlineLink} href={walletUrl}>MonkStash wallet</Link>. It is a normal web page, so there is <mark>nothing to approve or install</mark>.</p>
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
                <p>Star the page once. From then on you reach the wallet from <mark>your own bookmark</mark>, not from a search result that could be a fake.</p>
              </article>
            </div>
            <p className={styles.stepsNext}>New to Monero? Start with <Link className={styles.inlineLink} href="/create-monero-wallet">how to create a wallet</Link> or <Link className={styles.inlineLink} href="/what-is-monero">what Monero is</Link>.</p>
          </div>
        </section>

        {/* 6. COMPARE */}
        <section className={`${styles.sec} ${styles.alt}`} id="compare">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Side by side</p>
              <h2>The web wallet, the extension, and unknown extensions.</h2>
              <p className="lede">The first two are the same wallet. The difference is where it opens.</p>
            </div>
            <div className={styles.tablewrap}>
              <table className={styles.mag}>
                <caption>Table 1. MonkStash on the web, the MonkStash extension, and unknown extensions (20 October 2026)</caption>
                <thead>
                  <tr>
                    <th scope="col">What you care about</th>
                    <th scope="col" className={styles.us}>MonkStash web wallet</th>
                    <th scope="col">MonkStash extension</th>
                    <th scope="col">Unknown extensions from the store</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Install needed</th>
                    <td className={styles.us} data-label="Web wallet">Nothing</td>
                    <td data-label="Extension">From the official store listing</td>
                    <td data-label="Unknown extensions">A store install</td>
                  </tr>
                  <tr>
                    <th scope="row">Where your keys live</th>
                    <td className={styles.us} data-label="Web wallet">Encrypted on your device</td>
                    <td data-label="Extension">Encrypted on your device, in memory only while unlocked</td>
                    <td data-label="Unknown extensions">Depends on the maker. Check first.</td>
                  </tr>
                  <tr>
                    <th scope="row">Access to your websites</th>
                    <td className={styles.us} data-label="Web wallet">None</td>
                    <td data-label="Extension">None (no content scripts)</td>
                    <td data-label="Unknown extensions">Often asks to read every page</td>
                  </tr>
                  <tr>
                    <th scope="row">How to check it</th>
                    <td className={styles.us} data-label="Web wallet">Your own bookmark, and /verify</td>
                    <td data-label="Extension">Link from this page, build fingerprint in Settings</td>
                    <td data-label="Unknown extensions">Hard. Look-alikes are common.</td>
                  </tr>
                  <tr>
                    <th scope="row">Available</th>
                    <td className={styles.us} data-label="Web wallet"><span className={styles.yes}><svg aria-hidden="true"><use href="#exChk" /></svg>Yes</span></td>
                    <td data-label="Extension">After store review</td>
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
        <section className={styles.sec} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>The MonkStash extension, answered</h2>
              <p>More questions? See the <Link className={styles.inlineLink} href="/faq">full FAQ</Link>, <a className={styles.inlineLink} href={helpDiscussionsUrl} rel="noopener">ask in public on GitHub</a> or <Link className={styles.inlineLink} href="/support">email support</Link>.</p>
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
            <h2 id="finalH">Start today. Move to the toolbar later.</h2>
            <p>The web wallet is free, non-custodial and ready in about two minutes. When the store listings go live, a move file brings your wallet into the extension without a rescan.</p>
            <div className={styles.ctaRow}>
              <Link className="btn btn-primary btn-lg" href={walletUrl}>Open the web wallet</Link>
              <a className="btn btn-ghost btn-lg" href={repoUrl} rel="noopener">Read the source code</a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
