import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, walletUrl } from "@/lib/site";
import { SupportHeroArt, NeverAskArt, PipeArt } from "../_trust/TrustArt";
import styles from "../_trust/trust.module.css";

export const metadata: Metadata = {
  title: "Support & Help",
  description: "Get help with MonkStash: common problems and fixes, how to stay safe from scams, and where to find trustworthy Monero resources.",
  alternates: { canonical: "/support" },
  openGraph: ogFor({ title: "Support & Help", description: "Get help with MonkStash: common problems and fixes, how to stay safe from scams, and where to find trustworthy Monero resources.", path: "/support" }),
};

const symptoms = [
  { href: "/monero-wallet-not-syncing", t: "My wallet will not sync", p: "This is almost always the node your wallet connects to, not your money, which is safe on the network.", go: "Fix syncing" },
  { href: "/monero-wallet-not-connecting", t: "It will not connect", p: "The wallet reads the blockchain through a Monero node. When the connection fails, the guide walks you through the usual causes.", go: "Fix the connection" },
  { href: "/monero-wallet-not-showing-balance", t: "My balance looks wrong", p: "The usual cause is a restore date set too late. Restore again with an earlier date so the wallet scans far enough back.", go: "Find your balance" },
  { href: "/receive-monero", t: "A payment has not arrived", p: "Make sure your wallet has finished syncing, then check the sender used the right address.", go: "Check a payment" },
  { href: "/back-up-monero-wallet", t: "I forgot my password", p: "Your password only unlocks the copy in this browser. Remove the wallet and bring it back with your recovery words.", go: "Use your recovery words" },
  { href: "/restore-monero-wallet", t: "I want to restore a wallet", p: "Bring an existing wallet back with your 25 recovery words, or follow a view-only wallet to watch without spending.", go: "Restore a wallet" },
  { href: "/restore-mymonero-seed", t: "I used MyMonero", p: "MyMonero shut down in January 2026. Your funds are safe if you have your recovery words, and you can restore them here.", go: "Restore a MyMonero seed" },
  { href: "/monero-phishing-sites", t: "I think I am being scammed", p: "Stop, do not share your recovery words, and learn how look-alike wallet sites and fake helpers work.", go: "Spot the scam", alert: true },
];

export default function SupportPage() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Support", item: absoluteUrl("/support") },
      ] }} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Support</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Support and help</span>{" "}
                  What do you need <mark>help with</mark>?
                </h1>
                <p className={styles.sub}>Most questions have a quick answer. Pick the thing that looks like your problem, and we will point you to the fix. While you sort it out, your money stays safe on the network.</p>
                <div className={styles.ctaRow}>
                  <Link className="btn btn-primary btn-lg" href="#symptoms">Find my problem</Link>
                  <Link className="btn btn-ghost btn-lg" href="/faq">Browse the FAQ</Link>
                </div>
                <p className={styles.micro}>Be careful who you trust with your recovery words. More on that just below.</p>
              </div>
              <figure className={styles.fig}>
                <div className={styles.figBox}><SupportHeroArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>Start from the symptom, not the jargon.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. THE MOST IMPORTANT NOTICE (dark) */}
        <section className={`${styles.sec} ${styles.dark} ${styles.never}`} id="safety" aria-labelledby="neverH">
          <div className={`container-wide ${styles.neverGrid}`}>
            <div>
              <p className="eyebrow">The one rule</p>
              <h2 id="neverH">We will never ask for your recovery words.</h2>
              <p className="lede">No real support person, from any wallet, needs them. <mark>Anyone who asks is trying to steal your money.</mark> Keep your 25 words offline and private.</p>
              <ul className={styles.neverList}>
                <li>Only use the real MonkStash site, and bookmark it so you do not land on a copy.</li>
                <li>Never type your recovery words into a site or app because a message asked you to.</li>
                <li>Be wary of anyone offering to help in a chat or comment who then asks for your words or a payment.</li>
                <li>Download wallet software only from official sources.</li>
              </ul>
              <p style={{ marginTop: "var(--s-5)", marginBottom: 0 }}>Want to see how the fakes work? Read <Link className={styles.inlineLink} href="/monero-phishing-sites">how Monero phishing sites trick people</Link>, or <Link className={styles.inlineLink} href="/monero-seed-phrase">what a seed phrase is</Link>.</p>
            </div>
            <figure className={styles.fig}>
              <div className={`${styles.figBox} ${styles.figDark}`}><NeverAskArt /></div>
              <figcaption className={styles.figCap}><span><b>Figure 2</b></span><span>A request for your words is a no. The words stay on paper.</span></figcaption>
            </figure>
          </div>
        </section>

        {/* 3. SYMPTOMS */}
        <section className={styles.sec} id="symptoms" aria-labelledby="symH">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Common problems</p>
              <h2 id="symH">Pick what looks like your problem.</h2>
              <p className="lede">Each card links to a step-by-step guide. Most fixes take a few minutes, and <mark>none of them need your recovery words typed into a chat</mark>.</p>
            </div>
            <div className={styles.symptoms}>
              {symptoms.map((s, i) => (
                <Link key={s.href} href={s.href} className={`${styles.scard} ${s.alert ? styles.scardAlert : ""}`}>
                  <span className={styles.scardNum} aria-hidden="true">{["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"][i]}</span>
                  <h3>{s.t}</h3>
                  <p>{s.p}</p>
                  <span className={styles.go}>{s.go}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. SYNC IS THE PIPE, NOT THE MONEY */}
        <section className={`${styles.sec} ${styles.alt}`} id="sync" aria-labelledby="syncH">
          <div className={`container-wide ${styles.split}`}>
            <div>
              <p className="eyebrow">Before you worry</p>
              <h2 id="syncH" style={{ fontSize: "clamp(1.9rem, 3.6vw, 3rem)", lineHeight: 1.1, marginBottom: 18 }}>Sync trouble is the pipe, not your money.</h2>
              <div className={styles.body}>
                <p>Your wallet finds your payments by asking a Monero node. If that node is slow or unreachable, your wallet looks stuck or shows the wrong balance. <mark>Your money stays safe on the network</mark> the whole time.</p>
                <p>That is why the first thing to try is almost always the connection. Read <Link className={styles.inlineLink} href="/monero-wallet-not-syncing">how to fix a wallet that will not sync</Link>, or learn <Link className={styles.inlineLink} href="/monero-remote-node">how remote nodes work</Link>.</p>
                <p>A wallet that is syncing for the first time can also just be slow. Giving the wallet roughly when you made it, called the <Link className={styles.inlineLink} href="/monero-restore-height">restore height</Link>, lets it skip ahead.</p>
              </div>
            </div>
            <figure className={styles.fig}>
              <div className={styles.figBox}><PipeArt /></div>
              <figcaption className={styles.figCap}><span><b>Figure 3</b></span><span>Your wallet, a node, and the network. The weak link is usually the connection.</span></figcaption>
            </figure>
          </div>
        </section>

        {/* 5. REACH US */}
        <section className={styles.status} id="contact" aria-labelledby="contactH">
          <div className="container-wide">
            <div className={styles.secHead} style={{ marginBottom: 0 }}>
              <p className="eyebrow">How to reach us</p>
              <h2 id="contactH">Email us. We will never ask for your recovery words.</h2>
              <p className={styles.statusBody}>Check the <Link className={styles.inlineLink} href="/faq">FAQ</Link> and the guides above first, since they cover the common problems. If you are still stuck, email us. We answer by email only: there is no chat or phone line, and we never message you first. Please <mark>ignore anyone claiming to be MonkStash support</mark> in a message or comment.</p>
              <ul className={styles.resList}>
                <li><a href="mailto:support@monkstash.com">support@monkstash.com</a> for help with the wallet or the tools.</li>
                <li><a href="mailto:security@monkstash.com">security@monkstash.com</a> to report a vulnerability privately.</li>
                <li><a href="mailto:hello@monkstash.com">hello@monkstash.com</a> for everything else, including corrections to a guide.</li>
              </ul>
              <div className={styles.statusActions}>
                <Link className="btn btn-clay" href="/faq">Read the FAQ</Link>
                <Link className={styles.inlineLink} href="/about">About MonkStash</Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. RESOURCES + LEARN */}
        <section className={styles.sec} id="resources" aria-labelledby="resH">
          <div className={`container-wide ${styles.split}`}>
            <div>
              <p className="eyebrow">Trustworthy Monero resources</p>
              <h2 id="resH" style={{ fontSize: "clamp(1.9rem, 3.6vw, 3rem)", lineHeight: 1.1, marginBottom: 18 }}>Questions about Monero itself?</h2>
              <p className="lede" style={{ marginBottom: 24 }}>These community-run and official resources are reliable starting points.</p>
              <ul className={styles.resList}>
                <li><a href="https://www.getmonero.org/" rel="noopener">getmonero.org</a>, the official Monero project site.</li>
                <li><a href="https://www.getmonero.org/resources/user-guides/" rel="noopener">Monero user guides</a> for the official wallets.</li>
                <li><a href="https://www.reddit.com/r/monerosupport/" rel="noopener">r/monerosupport</a>, a community help forum.</li>
              </ul>
            </div>
            <div id="learn">
              <p className="eyebrow">Learn the basics</p>
              <h2 style={{ fontSize: "clamp(1.9rem, 3.6vw, 3rem)", lineHeight: 1.1, marginBottom: 18 }}>New to all this?</h2>
              <p className="lede" style={{ marginBottom: 24 }}>Start with <Link className={styles.inlineLink} href="/what-is-monero">what Monero is</Link>, then <Link className={styles.inlineLink} href="/create-monero-wallet">create a wallet</Link> and <Link className={styles.inlineLink} href="/back-up-monero-wallet">back it up</Link>.</p>
              <div className={styles.ctaRow}>
                <Link className="btn btn-primary" href={walletUrl}>Open your wallet</Link>
                <Link className="btn btn-ghost" href="/use-monero">How to use Monero</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
