import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, authorLd, organizationLd, walletUrl } from "@/lib/site";
import {
  HeroArt, AddressBarArt, WindowVaultArt,
  StepOpen, StepRestore, StepWords, StepSync,
  OutNoDownload, OutAnyBrowser, OutNoAccount, OutKeys, SealArt,
} from "./Art";
import styles from "./page.module.css";

const TITLE = "MyMonero Alternative: Move to a Safe Web Wallet";

export const metadata: Metadata = {
  title: TITLE,
  description: "Looking for a MyMonero alternative? MonkStash is a free, non-custodial Monero web wallet. Move your funds safely and skip the fake MyMonero sites.",
  alternates: { canonical: "/mymonero-alternative" },
  openGraph: ogFor({ title: TITLE, description: "Looking for a MyMonero alternative? MonkStash is a free, non-custodial Monero web wallet. Move your funds safely and skip the fake MyMonero sites.", path: "/mymonero-alternative" }),
};

const faqs = [
  { q: "Is MyMonero shut down?", a: "Yes. MyMonero announced it was winding down and stopped operating in January 2026, with stewardship passing to Cake Wallet. If you still have your recovery words, your funds are safe on the Monero network and can be restored in any Monero wallet." },
  { q: "How do I move my funds from MyMonero?", a: "Your money is not stored by MyMonero; it lives on the Monero network, and your recovery words control it. To move to another wallet, you simply restore your recovery words there. You do not send your coins anywhere to do this." },
  { q: "MyMonero used 13 words. Does MonkStash support that?", a: "Yes. MyMonero used a shorter 13-word phrase that derives keys differently from the standard 25 words, and most wallets cannot read it. MonkStash restores it in your browser using MyMonero's own derivation, checked against published MyMonero test phrases. After restoring, compare the address with your old MyMonero address before moving money." },
  { q: "Are there fake MyMonero websites?", a: "Yes, and this is the biggest risk right now. After the shutdown, look-alike sites appeared that copy the MyMonero name and design to steal recovery words. Never type your recovery words into a site you reached from an ad, a search result you are unsure about, or a message. Always confirm the address bar." },
  { q: "Is MonkStash a good replacement for MyMonero?", a: "MonkStash fills the same need: a free, non-custodial Monero wallet that runs in your browser with no download. Your keys are created and encrypted on your device and never reach our servers, so you stay in control." },
];

const faqHighlight: Record<number, string> = {
  0: "your funds are safe on the Monero network",
  1: "You do not send your coins anywhere",
  2: "keep them safe and check back",
  3: "Never type your recovery words into a site you reached from an ad",
};

function FaqAnswer({ index, text }: { index: number; text: string }) {
  const hl = faqHighlight[index];
  if (!hl || !text.includes(hl)) return <p>{text}</p>;
  const [before, after] = text.split(hl);
  return <p>{before}<mark>{hl}</mark>{after}</p>;
}

const outcomes = [
  { Icon: OutNoDownload, t: "Nothing to download", d: "No app, no installer, no store listing to second-guess. You open a page and you are in." },
  { Icon: OutAnyBrowser, t: "Open it in any browser", d: "Phone, tablet, or laptop. On a new device, your recovery words bring your wallet back." },
  { Icon: OutNoAccount, t: "No account, no email", d: "There is no sign-up. Nobody holds a profile with your name on it." },
  { Icon: OutKeys, t: "Keys stay on your device", d: "Your keys are made and locked on your own device and never reach our servers." },
];

const redFlags = [
  { t: "It reached you through an ad, a link, or a message", d: "Real wallets are found from a bookmark you made yourself, not from something that was pushed at you." },
  { t: "It asks you to \"verify\" or \"sync\" your words", d: "No real wallet asks you to type existing recovery words into a web form to prove who you are." },
  { t: "The address is almost right", d: "Look-alike domains swap or add a single character. Read the whole address, letter by letter." },
  { t: "A helpful stranger offers to move your funds", d: "Anyone who then asks for your words, or for a payment, is working for the clone." },
  { t: "It uses the MyMonero name and design", d: "After the shutdown, look-alike sites copied the name and look to steal recovery words." },
];

export default function MyMoneroAlternativePage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "Article", headline: TITLE, description: metadata.description as string, dateModified: "2026-10-15", mainEntityOfPage: absoluteUrl("/mymonero-alternative"), author: authorLd, publisher: organizationLd },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "MyMonero alternative", item: absoluteUrl("/mymonero-alternative") },
        ] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>MyMonero alternative</span></nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}><span className={`eyebrow ${styles.h1Kicker}`}>A safe MyMonero alternative</span>{" "}MyMonero closed. <mark>Your Monero did not.</mark></h1>
                <p className={styles.sub}>MyMonero shut down in January 2026, but your coins live on the Monero network, and your recovery words still open them. Here is how to choose a MyMonero alternative and move over in a few minutes, and how to dodge the fake sites on the way.</p>
                <div className={styles.ctaRow}>
                  <Link className="btn btn-primary btn-lg" href={walletUrl}>Restore my wallet</Link>
                  <Link className="btn btn-ghost btn-lg" href="#safety">Check it&apos;s safe first</Link>
                </div>
                <p className={styles.micro}><span>Free to use.</span><span>No download.</span><span>No account.</span></p>
              </div>
              <figure className={styles.fig}>
                <div className={styles.figBox}><HeroArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>The old app closed. The money stayed on the network.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. SAFETY BAND */}
        <section className={styles.safety} id="safety" aria-labelledby="safetyH">
          <div className={`container-wide ${styles.safetyGrid}`}>
            <div>
              <p className="eyebrow">Before anything else</p>
              <h2 id="safetyH">The real danger is a fake MyMonero site.</h2>
              <p className={styles.safeLead}>After the shutdown, look-alike websites appeared that copy the MyMonero name and design to steal recovery words. <mark>Never type your recovery words into a site you reached from an ad, a link, or a message.</mark></p>
              <ul className={styles.tick}>
                <li><b>Bookmark</b> the real wallet once, then open it only from your bookmark.</li>
                <li><b>Read the address bar</b> every time. One swapped letter is all a clone needs.</li>
                <li><b>Be wary of anyone</b> who offers to help you move funds and then asks for your words.</li>
              </ul>
            </div>
            <figure className={styles.fig}>
              <div className={styles.figBox}><AddressBarArt /></div>
              <figcaption className={styles.figCap}><span><b>Figure 2</b></span><span>A real address and a look-alike, side by side.</span></figcaption>
            </figure>
          </div>
        </section>

        {/* 3. WHY SAFE */}
        <section className={styles.sec} id="why-safe">
          <div className="container-wide">
            <div className={styles.twoCol}>
              <div>
                <div className={styles.secHead}>
                  <p className="eyebrow">Take a breath</p>
                  <h2>Your money was never inside the app.</h2>
                  <p className="lede">A wallet app is a window. The money sits on the Monero network, and your recovery words are the key that opens it. When a window closes, the vault is still there.</p>
                </div>
                <p className={styles.body}>MyMonero never held your coins. It was a window onto the blockchain, not a bank. So when it shut down in January 2026, <mark>your funds did not go anywhere</mark>. You do not need to rush to &quot;withdraw&quot; anything. You just open a new window by restoring your recovery words somewhere else.</p>
                <p className={styles.body}>New to this idea? Our guide on <Link className={styles.inlineLink} href="/what-is-monero">what Monero is</Link> explains how keys and the network fit together.</p>
              </div>
              <figure className={styles.fig}>
                <div className={styles.figBox}><WindowVaultArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 3</b></span><span>New window, same vault, opened with your words.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 4. STEPS */}
        <section className={`${styles.sec} ${styles.alt}`} id="steps">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Your fresh start</p>
              <h2>Move to MonkStash in 4 steps.</h2>
              <p className="lede">If you have your 25-word recovery phrase, this takes a couple of minutes. You never send your coins anywhere. You restore the words.</p>
            </div>
            <div className={styles.steps}>
              <article className={styles.step}>
                <span className={styles.stepNum}>i</span>
                <div className={styles.stepIll}><StepOpen /></div>
                <h3>Open the wallet</h3>
                <p>Go to the <Link className={styles.inlineLink} href={walletUrl}>MonkStash wallet</Link> from your bookmark.</p>
              </article>
              <article className={styles.step}>
                <span className={styles.stepNum}>ii</span>
                <div className={styles.stepIll}><StepRestore /></div>
                <h3>Choose Restore</h3>
                <p>Pick <strong>Restore from recovery words</strong>, not create a new wallet.</p>
              </article>
              <article className={styles.step}>
                <span className={styles.stepNum}>iii</span>
                <div className={styles.stepIll}><StepWords /></div>
                <h3>Enter your 25 words</h3>
                <p>Type your recovery words, <mark>in order</mark>. Only do this on the site you opened yourself.</p>
              </article>
              <article className={styles.step}>
                <span className={styles.stepNum}>iv</span>
                <div className={styles.stepIll}><StepSync /></div>
                <h3>Lock it and let it sync</h3>
                <p>Set a new password to lock the wallet in this browser. Once it syncs, your balance and history appear.</p>
              </article>
            </div>
            <p className={styles.more}>Want every detail, including restore height? Read <Link className={styles.inlineLink} href="/restore-monero-wallet">how to restore a Monero wallet</Link>.</p>
          </div>
        </section>

        {/* 5. 13 WORDS */}
        <section className={styles.sec} id="thirteen">
          <div className="container-wide">
            <div className={styles.thirteen}>
              <div className={styles.numBig} aria-hidden="true"><span>13</span><i>vs</i><span>25</span></div>
              <div>
                <p className="eyebrow">A different kind of phrase</p>
                <h2>Have a 13-word MyMonero phrase?</h2>
                <p>MyMonero used a shorter 13-word recovery phrase, while standard Monero wallets use 25 words, and most of them cannot read MyMonero&apos;s format. <mark>MonkStash restores both.</mark> The words are turned into keys in your browser, using MyMonero&apos;s own method, and are never uploaded.</p>
                <p>Support for 13 words is new. We checked it against published MyMonero test phrases, and the wallet refuses to open if the address does not match the keys. Still, compare the address with your old MyMonero address before you move money. <Link className={styles.inlineLink} href="/restore-mymonero-seed">See the step-by-step guide</Link>.</p>
                <p className={styles.small}>Keep those words offline and private either way. See <Link className={styles.inlineLink} href="/back-up-monero-wallet">how to back up a Monero wallet</Link>.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. OUTCOMES */}
        <section className={`${styles.sec} ${styles.alt}`} id="outcomes">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">What you get</p>
              <h2>The same simple idea, rebuilt for a clean start.</h2>
              <p className="lede">MonkStash fills the same need MyMonero did: a free, non-custodial Monero wallet that runs in your browser.</p>
            </div>
            <div className={styles.outGrid}>
              {outcomes.map(({ Icon, t, d }) => (
                <article key={t} className={styles.out}><Icon /><h3>{t}</h3><p>{d}</p></article>
              ))}
            </div>
            <div className={styles.honest}>
              <p><b>The honest part.</b> 13-word support is new, so check the address matches (see above), and the wallet asks a Monero node to find your payments. Read <Link className={styles.inlineLink} href="/monero-node">what a node can see</Link>, or compare <Link className={styles.inlineLink} href="/monero-wallets">all the Monero wallets</Link>. Staying safe in general? Start with <Link className={styles.inlineLink} href="/is-monero-safe">is Monero safe</Link>.</p>
            </div>
          </div>
        </section>

        {/* 7. CLONE CHECKLIST */}
        <section className={`${styles.sec} ${styles.dark}`} id="clones">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Spot the clone</p>
              <h2>Five red flags that mean walk away.</h2>
              <p className="lede">If any one of these is true, close the tab. Your recovery words open your money, so keep them to yourself.</p>
            </div>
            <ol className={styles.flags}>
              {redFlags.map((f, i) => (
                <li key={f.t}>
                  <span className={styles.flagN} aria-hidden="true">{["i", "ii", "iii", "iv", "v"][i]}</span>
                  <div><h3>{f.t}</h3><p>{f.d}</p></div>
                </li>
              ))}
            </ol>
            <p className={styles.darkNote}>Stuck or unsure? Visit <Link href="/support">support</Link> before you type anything.</p>
          </div>
        </section>

        {/* 8. FAQ */}
        <section className={styles.sec} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>MyMonero questions, answered</h2>
              <p className={styles.small}>More general questions are in the <Link className={styles.inlineLink} href="/faq">main FAQ</Link>.</p>
            </div>
            <div className={styles.faq}>
              {faqs.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary><span className={styles.fn}>{i + 1}</span>{f.q}<span className={styles.pm} aria-hidden="true" /></summary>
                  <div className={styles.ans}><FaqAnswer index={i} text={f.a} /></div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FINAL CTA */}
        <section className={styles.final} aria-labelledby="finalH">
          <div className={`container-wide ${styles.finalGrid}`}>
            <div>
              <h2 id="finalH">Your Monero is still yours. Pick it back up.</h2>
              <p>Open the wallet from your bookmark, restore your 25 words, and you are back in a few minutes. Free, with no download and no account.</p>
              <div className={styles.ctaRow}>
                <Link className="btn btn-primary btn-lg" href={walletUrl}>Restore my wallet</Link>
                <Link className="btn btn-ghost btn-lg" href="/restore-monero-wallet">Read the full guide</Link>
              </div>
            </div>
            <SealArt className={styles.finalArt} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
