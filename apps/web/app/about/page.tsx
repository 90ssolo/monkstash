import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { SealArt } from "@/components/home/HomeArt";
import { absoluteUrl, officialProfiles, repoUrl, site, walletUrl } from "@/lib/site";
import { KeysOnDeviceArt, StoryArt, BuildStackArt, StatusArt } from "../_trust/TrustArt";
import styles from "../_trust/trust.module.css";

export const metadata: Metadata = {
  title: "About MonkStash",
  description: "Who makes MonkStash, why it exists, and how a non-custodial Monero web wallet is built so your keys stay yours.",
  alternates: { canonical: "/about" },
  openGraph: ogFor({ title: "About MonkStash", description: "Who makes MonkStash, why it exists, and how a non-custodial Monero web wallet is built so your keys stay yours.", path: "/about" }),
};

const beliefs = [
  { n: "i", t: "Privacy is a normal right", p: "Wanting your money to be your own business is not suspicious. It is how cash always worked, and it should work that way online too." },
  { n: "ii", t: "Accurate before impressive", p: "We do not promise perfect privacy or guaranteed security, because no honest wallet can. We would rather be believed than admired." },
  { n: "iii", t: "Plain words for first-timers", p: "We write for people who have never used a crypto wallet. If a term matters, we explain it in everyday language, once." },
  { n: "iv", t: "Say it when it is unfinished", p: "We explain trade-offs, like what a remote node can see. If something is still being tested, we tell you so up front." },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org", "@type": "AboutPage", name: "About MonkStash", url: absoluteUrl("/about"),
          dateModified: "2026-10-21",
          publisher: { "@type": "Organization", name: site.name, url: site.url, sameAs: [...officialProfiles] },
        },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "About", item: absoluteUrl("/about") },
        ] },
      ]} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">About</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>About MonkStash</span>{" "}
                  A Monero wallet built to be <mark>checked, not taken on faith</mark>.
                </h1>
                <p className={styles.sub}>MonkStash is a free, non-custodial Monero wallet that runs in your browser. We built it to be easy to trust: your keys stay on your device, and we explain what is really happening in plain language.</p>
                <div className={styles.ctaRow}>
                  <Link className="btn btn-primary btn-lg" href={walletUrl}>Open your wallet</Link>
                  <Link className="btn btn-ghost btn-lg" href="#built">See how it is built</Link>
                </div>
                <p className={styles.micro}>Made by the MonkStash team. Early preview, and honest about it.</p>
              </div>
              <figure className={styles.fig}>
                <div className={styles.figBox}><KeysOnDeviceArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>Your keys are made and kept on your device. Our servers hold none.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. WHY IT EXISTS */}
        <section className={styles.sec} id="why">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Why MonkStash exists</p>
              <h2>Monero deserved a friendlier front door.</h2>
              <p className="lede">Getting started with Monero has been harder than it should be. The official tools are powerful but built for technical users, and then <mark>an easy favourite shut its doors</mark>.</p>
            </div>
            <div className={styles.split}>
              <div className={styles.body}>
                <p>In January 2026 MyMonero, one of the most popular easy web wallets, shut down. In its place, look-alike sites appeared that copy real wallets to trick people into handing over their recovery words.</p>
                <p>We wanted a Monero wallet that a beginner can set up in two minutes without giving up control or privacy, and a website that teaches rather than hypes. That is MonkStash: a bright, friendly front door to Monero that <mark>never asks you to trust us with your money</mark>.</p>
                <p>If you used MyMonero, <Link className={styles.inlineLink} href="/mymonero-alternative">here is how to move your funds safely</Link>. If you are new, <Link className={styles.inlineLink} href="/what-is-monero">start with what Monero is</Link>.</p>
              </div>
              <div className={styles.body}>
                <p><b>Who we are.</b> We are the MonkStash team. We keep this site pseudonymous for now, and we will not invent names, credentials, or a history to look bigger than we are.</p>
                <p><b>What that means for you.</b> You should not have to trust a face. Trust the design: the wallet cannot spend your money, and the engine underneath, monero-ts, is open source. Our own code is open source too (BSD-3-Clause), so you can <a className={styles.inlineLink} href={repoUrl} rel="noopener">read it line by line</a>.</p>
              </div>
            </div>
            <div className={styles.stripFig}>
              <figure className={styles.fig}>
                <div className={styles.figBox}><StoryArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 2</b></span><span>Why we built it: a gap opened when a familiar wallet closed.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 3. WHAT WE BELIEVE */}
        <section className={`${styles.sec} ${styles.alt}`} id="believe">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">People like us</p>
              <h2>What we believe</h2>
              <p className="lede">Four short rules we hold ourselves to. If you agree with them, you will probably like it here.</p>
            </div>
            <div className={styles.numGrid}>
              {beliefs.map((b) => (
                <div key={b.n} className={styles.num}>
                  <span className={styles.numI} aria-hidden="true">{b.n}</span>
                  <h3>{b.t}</h3>
                  <p>{b.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. HOW IT IS BUILT (dark) */}
        <section className={`${styles.sec} ${styles.dark}`} id="built">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">How it is built</p>
              <h2>Non-custodial means we could not spend your money if we tried.</h2>
              <p className="lede">Your keys never leave your device. When you create a wallet, your recovery words are generated and encrypted in your browser, <mark>locked with a password you choose</mark>.</p>
            </div>
            <div className={`${styles.split} ${styles.splitRev}`}>
              <figure className={styles.fig}>
                <div className={`${styles.figBox} ${styles.figDark}`}><BuildStackArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 3</b></span><span>Four layers. Only the top two stay on your device.</span></figcaption>
              </figure>
              <div>
                <ul className={styles.buildList}>
                  <li><b>The real Monero code.</b> The wallet uses monero-ts, a WebAssembly build of Monero&apos;s own wallet code, so we are not inventing our own cryptography.</li>
                  <li><b>Keys on your device.</b> Recovery words and keys are encrypted locally and never transmitted. They are never sent to our servers, so we cannot spend your funds, freeze them, or hand them to anyone.</li>
                  <li><b>Open source.</b> The whole MonkStash codebase is public under the BSD-3-Clause license. <a className={styles.inlineLink} href={repoUrl} rel="noopener">Read the code</a>. Open code lets anyone check it; it is not the same as an independent audit.</li>
                  <li><b>No accounts, no tracking on wallet pages.</b> There is no sign-up, and we do not run analytics on the wallet itself.</li>
                  <li><b>A replaceable node connection.</b> The wallet reads the blockchain through a Monero node, and you can point it at your own node in the wallet&apos;s settings. See <Link className={styles.inlineLink} href="/monero-node">what a node does</Link>.</li>
                </ul>
                <p className={styles.buildNote}>It also means backing up your recovery words is your job, so we guide you through it carefully. Read <Link className={styles.inlineLink} href="/create-monero-wallet">how to create a wallet</Link> to see the whole flow, or <Link className={styles.inlineLink} href="/is-monero-safe">how safe Monero is</Link>.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. HONEST STATUS */}
        <section className={styles.status} id="status" aria-labelledby="statusH">
          <div className={`container-wide ${styles.split}`}>
            <div>
              <p className="eyebrow">Honest status</p>
              <h2 id="statusH">Early preview. Not yet independently audited.</h2>
              <p className={styles.statusBody}>MonkStash works with real Monero, but we recommend <mark>using small amounts</mark> until an independent security review is complete. It is step five on the <Link className={styles.inlineLink} href="/donate#roadmap">public roadmap</Link>, after verifiable builds and FCMP++ support, and donations pay for it.</p>
              <p className={styles.statusBody}>The wallet is free. The review and the browser extension depend on the people who use MonkStash, and anyone can count every coin that comes in.</p>
              <div className={styles.statusActions}>
                <Link className="btn btn-clay" href="/donate">See the roadmap and fund the review</Link>
                <Link className={styles.inlineLink} href="/is-monero-safe">Read about the risks</Link>
              </div>
            </div>
            <figure className={styles.fig}>
              <div className={styles.figBox}><StatusArt /></div>
              <figcaption className={styles.figCap}><span><b>Figure 4</b></span><span>Where we are, and what comes next.</span></figcaption>
            </figure>
          </div>
        </section>

        {/* 6. HOW WE WRITE */}
        <section className={styles.sec} id="writing">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">How we write</p>
              <h2>Guides that tell you the trade-offs.</h2>
              <p className="lede">Money and security are serious topics, so the guides on this site follow three habits.</p>
            </div>
            <div className={styles.cards}>
              <article className={styles.card}>
                <h3>Sourced</h3>
                <p>We link to official sources where they help, such as <a className={styles.inlineLink} href="https://www.getmonero.org/" rel="noopener">getmonero.org</a> and <a className={styles.inlineLink} href="https://docs.getmonero.org/" rel="noopener">docs.getmonero.org</a>, even when they compete with us.</p>
              </article>
              <article className={styles.card}>
                <h3>Plain language</h3>
                <p>Short sentences, everyday words, and a plain explanation of any Monero term the first time it appears.</p>
              </article>
              <article className={styles.card}>
                <h3>Honest about limits</h3>
                <p>We say what a node can see, what a web wallet cannot protect you from, and when a hardware wallet is the better choice.</p>
              </article>
            </div>
            <p className={styles.micro} style={{ marginTop: "var(--s-5)" }}>Found something wrong or out of date? Email <a className={styles.inlineLink} href="mailto:hello@monkstash.com">hello@monkstash.com</a> and we will fix it. For wallet problems, see <Link className={styles.inlineLink} href="/support">support</Link>.</p>
          </div>
        </section>

        {/* 6b. HOW WE ARE FUNDED */}
        <section className={styles.sec} id="funding" aria-labelledby="fundingH">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">How we are funded</p>
              <h2 id="fundingH">The wallet is free. Here is how we pay for it.</h2>
              <p className="lede">We never charge a fee on your payments, never see your keys and never sell data. The money comes from three places, and you can see each one.</p>
            </div>
            <div className={styles.cards}>
              <article className={styles.card}>
                <h3>Donations</h3>
                <p>People who find MonkStash useful can <Link className={styles.inlineLink} href="/donate">donate in XMR</Link>. The donation wallet is public: anyone can check every amount that comes in.</p>
              </article>
              <article className={styles.card}>
                <h3>Labelled affiliate links</h3>
                <p>Some guides link to products we recommend anyway, such as hardware wallets. When a link earns us a commission, it says &quot;Affiliate link&quot; right next to it. It costs you nothing, and it never decides what we recommend: products without a programme are judged the same way.</p>
              </article>
              <article className={styles.card}>
                <h3>Services for shops</h3>
                <p>Setting up Monero payments for a shop takes work. We plan to offer paid setup and support for <Link className={styles.inlineLink} href="/business">MonkStash Pay</Link>. The software itself stays free and open source.</p>
              </article>
            </div>
            <p className={styles.micro} style={{ marginTop: "var(--s-5)" }}>Wallet pages never show ads or partner links.</p>
          </div>
        </section>

        {/* 7. SAFETY + CONTACT */}
        <section className={`${styles.sec} ${styles.alt}`} id="contact">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Staying safe and getting help</p>
              <h2>Reach us the right way.</h2>
            </div>
            <div className={styles.safeStrip}>
              <svg viewBox="0 0 56 56" aria-hidden="true">
                <path d="M28 5l18 7v14c0 12-8 21-18 25C18 47 10 38 10 26V12z" fill="#fbeadd" stroke="#b4532a" strokeWidth="2" strokeLinejoin="round" />
                <path d="M20 28l6 6 11-13" fill="none" stroke="#1f4733" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <h3>We will never ask for your recovery words.</h3>
                <p>No real support person from any wallet needs them. Always reach MonkStash through a bookmark you trust, and never type your recovery words into a site because a message asked you to.</p>
                <p>More on this in <Link className={styles.inlineLink} href="/support">support</Link> and the <Link className={styles.inlineLink} href="/faq">FAQ</Link>. To spot fakes, read <Link className={styles.inlineLink} href="/monero-phishing-sites">how Monero phishing sites work</Link>.</p>
              </div>
            </div>
            <div className={styles.contactGrid} style={{ marginTop: "var(--s-6)" }}>
              <Link className={styles.lcard} href="/support">
                <span className={styles.tag}>Help</span>
                <h3>Support</h3>
                <p>Fixes for the common problems, and how to stay safe from scams.</p>
                <span className={styles.go}>Get help</span>
              </Link>
              <Link className={styles.lcard} href="/faq">
                <span className={styles.tag}>Answers</span>
                <h3>FAQ</h3>
                <p>Short, plain answers about MonkStash and Monero.</p>
                <span className={styles.go}>Read the FAQ</span>
              </Link>
              <Link className={styles.lcard} href="/donate">
                <span className={styles.tag}>Back us</span>
                <h3>Fund the next feature</h3>
                <p>Every coin goes to the next feature on the roadmap. Follow every coin that comes in.</p>
                <span className={styles.go}>See the roadmap</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 8. FINAL CTA */}
        <section className={styles.final} aria-labelledby="finalH">
          <div className={`container-wide ${styles.finalGrid}`}>
            <div>
              <h2 id="finalH">Try it with a small amount first.</h2>
              <p>Free, non-custodial, and private by default. No download, no account, and about two minutes to a wallet that is yours alone.</p>
              <div className={styles.ctaRow}>
                <Link className="btn btn-primary btn-lg" href={walletUrl}>Open your wallet</Link>
                <Link className="btn btn-ghost btn-lg" href="/create-monero-wallet">How to create one</Link>
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
