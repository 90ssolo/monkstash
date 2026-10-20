import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import {
  ArrowIcon, HeroArt, TensionArt, DefArt,
  UseGlobe, UseHeart, UseShield, UseCart, UseInbox, UseHome,
  CompareBitArt, RingDiagram, StealthDiagram, RingctDiagram,
  PersonaSeedling, PersonaDoor, PersonaShield, PersonaDevices,
  StepChoose, StepBackup, StepSendReceive, ClockIcon, ShieldCheckIcon,
  ProofNonCustodial, ProofOpenSource, ProofNoAccounts, ProofNoTracking,
  FaqArt, SealArt,
} from "@/components/home/HomeArt";
import { absoluteUrl, repoUrl, site, walletUrl } from "@/lib/site";
import { ClusterLinks, PILLAR_COUNT_TEXT, PillarIndex } from "@/components/pillar/ClusterLibrary";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: { absolute: "Monero Web Wallet: Free, Private, No Download | MonkStash" },
  description:
    "A free Monero web wallet that runs in your browser. Create or restore an XMR wallet in two minutes: no download, no account, keys stay on your device.",
  alternates: { canonical: "/" },
  openGraph: ogFor({ title: "Monero Web Wallet: Free, Private, No Download | MonkStash", description: "A free Monero web wallet that runs in your browser. Create or restore an XMR wallet in two minutes: no download, no account, keys stay on your device.", path: "/" }),
};

const faqs = [
  { q: "Is MonkStash safe?", a: "Your keys never leave your device and are locked with your password. The wallet is non-custodial and built on the open-source monero-ts engine, so we can't touch your funds. MonkStash's own code is open source too (BSD-3-Clause), so anyone can read it. It has not had an independent security review yet, so start with small amounts. As always, the biggest risk is your own backup, so keep your recovery words safe." },
  { q: "Is it really free?", a: "Yes. Creating and using a MonkStash wallet is free. You only ever pay the small standard Monero network fee when you send, which goes to the network, not to us." },
  { q: "Do you store my keys or recovery phrase?", a: "No. They are created and encrypted on your device. We never receive, store, or back them up. That also means only you can recover your wallet, so your backup matters." },
  { q: "What is a seed phrase?", a: "It is a list of 25 words that is the master key to your wallet. Anyone with those words can access your funds, so write them down and keep them offline and private." },
  { q: "Can I use MonkStash on my phone?", a: "MonkStash is built to run in your phone browser too, with nothing to install. Mobile browsers are still being tested, so start with small amounts. Your wallet lives in the browser where you created it; on a new device, restore it with your recovery words." },
  { q: "What happened to MyMonero?", a: "It shut down in January 2026. Your funds are safe if you have your recovery words. You can restore them in MonkStash, but watch out for fake MyMonero sites." },
  { q: "Do I need to download or install anything?", a: "No. MonkStash runs in the browser. A Chrome extension is planned, but you can use the full wallet today without it." },
  { q: "Is Monero legal?", a: "In most countries, yes. Monero is a privacy-focused cryptocurrency. Rules vary by country, so check your local regulations." },
];

/** FAQ answers that carry a visible highlight. The plain text above feeds the FAQPage schema. */
const faqHighlight: Record<number, string> = {
  0: "we can't touch your funds",
  2: "only you can recover your wallet",
  5: "watch out for fake MyMonero sites",
};

function FaqAnswer({ index, text }: { index: number; text: string }) {
  const hl = faqHighlight[index];
  if (!hl || !text.includes(hl)) return <p>{text}</p>;
  const [before, after] = text.split(hl);
  return <p>{before}<mark>{hl}</mark>{after}</p>;
}

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: site.name,
            url: absoluteUrl("/"),
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any (modern web browser)",
            description: site.description,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      <SiteHeader />
      <main id="main">
        {/* Shared symbols (comparison table checkmark) */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
          <defs>
            <symbol id="chk" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
              <path d="M4.6 8.3l2.3 2.3 4.5-4.9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </symbol>
          </defs>
        </svg>

        {/* 1. HERO */}
        <section className={styles.hero} id="top">
          <div className={`container-wide ${styles.heroGrid}`}>
            <div>
              <h1 className={styles.h1}>
                <span className={`eyebrow ${styles.h1Kicker}`}>Free Monero web wallet</span>{" "}
                Spend, send, and save like it&apos;s <mark>nobody&apos;s business</mark>.
              </h1>
              <p className={styles.sub}>MonkStash is a free Monero web wallet for money that stays yours. Pay anyone, hold what you save, and give what you want, with no bank, no company, and no stranger watching over your shoulder. Open it in your browser in about two minutes.</p>
              <div className={styles.ctaRow}>
                <Link className="btn btn-primary btn-lg" href={walletUrl}>Open wallet <ArrowIcon /></Link>
                <Link className="btn btn-ghost btn-lg" href="#uses">See what you can do</Link>
              </div>
              <p className={styles.micro}><span>Free to use.</span><span>Runs in your browser.</span><span>Yours in two minutes.</span></p>
            </div>
            <figure className={styles.fig}>
              <div className={styles.heroArt}><HeroArt /></div>
              <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>Your keys are made, locked and kept on your device.</span></figcaption>
            </figure>
          </div>
        </section>

        {/* 2. STATS */}
        <section className={styles.stats} aria-label="MonkStash at a glance">
          <div className={`container-wide ${styles.statsGrid}`}>
            <div className={styles.stat}><span className={styles.statN}>100<em>%</em></span><span className={styles.statL}>non-custodial</span></div>
            <div className={styles.stat}><span className={styles.statN}>0</span><span className={styles.statL}>accounts or email</span></div>
            <div className={styles.stat}><span className={styles.statN}>25</span><span className={styles.statL}>word standard seed</span></div>
            <div className={styles.stat}><span className={styles.statN}>Open</span><span className={styles.statL}>source engine</span></div>
          </div>
        </section>

        {/* 3. TENSION */}
        <section className={`${styles.sec} ${styles.dark}`} id="problem">
          <div className={`container-wide ${styles.tensionGrid}`}>
            <div>
              <div className={styles.secHead}>
                <p className="eyebrow">The quiet problem</p>
                <h2>Ordinary money talks. About you.</h2>
                <p className="lede">Every card tap, bank transfer, and tap-to-pay leaves a trail. What you bought, where, when, and for how much, all logged and owned by someone who is not you. It gets scored, sold, and remembered. You feel it every time an ad knows <mark>a little too much</mark>.</p>
              </div>
              <p className={styles.pull}>Cash never did that. Monero does not either.</p>
            </div>
            <figure className={styles.tensionArt}><TensionArt /></figure>
          </div>
        </section>

        {/* 4. WHAT MONERO IS */}
        <section className={styles.sec} id="what">
          <div className="container-wide">
            <div className={styles.aboutGrid}>
              <div>
                <div className={`${styles.secHead} ${styles.aboutHead}`}>
                  <p className="eyebrow">The idea</p>
                  <h2>Monero is cash for the internet.</h2>
                </div>
                <p className={styles.aboutBody}>Hand someone a banknote and it is done. No name on it, no record of it, no one standing in the middle. Monero is that, online. You can send it anywhere in the world in minutes, and the payment carries <mark>no trail of who paid, who got paid, or how much</mark> changed hands. It is money that behaves the way money used to, before every penny had your name stapled to it.</p>
              </div>
              <aside className={styles.defbox} aria-label="Quick definition">
                <span className={styles.defTerm}>Monero</span>
                <span className={styles.defPos}>noun, private digital cash</span>
                <ol>
                  <li>Sends like a message, settles like cash.</li>
                  <li>No public record of who paid or how much.</li>
                  <li>Open, global, and yours to hold.</li>
                </ol>
                <div className={styles.defArt}><DefArt /></div>
              </aside>
            </div>
          </div>
        </section>

        {/* 4b. WHAT IS A MONERO WEB WALLET (primary keyword, snippet-ready answer) */}
        <section className={`${styles.sec} ${styles.wwSec}`} id="web-wallet" aria-labelledby="wwH">
          <div className="container-wide">
            <div className={styles.aboutGrid}>
              <div>
                <div className={styles.secHead}>
                  <p className="eyebrow">How you hold it</p>
                  <h2 id="wwH">What is a Monero web wallet?</h2>
                </div>
                <p className="lede">A Monero web wallet is a wallet for Monero (XMR) that you open in your web browser instead of installing an app. <mark>Your keys are created and locked on your own device</mark>, and the wallet asks a Monero node to find your payments, so there is no software and no blockchain to download.</p>
                <h3 className={styles.wwH3}>How MonkStash works, in three lines</h3>
                <ol className={styles.wwSteps}>
                  <li><b>Your browser makes the keys.</b> Your 25 recovery words are created right on your device.</li>
                  <li><b>Your password locks them.</b> They are encrypted before they are saved in this browser, and never sent to us.</li>
                  <li><b>A node finds your payments.</b> It sends blockchain data to your wallet, which works out your balance on your device.</li>
                </ol>
                <p className={styles.useNext}>Not sure a web wallet is right for you? <Link className={styles.inlineLink} href="/monero-wallets">Compare every kind of Monero wallet</Link>.</p>
              </div>
              <aside className={styles.defbox} aria-label="Also known as">
                <span className={styles.defTerm}>Monero web wallet</span>
                <span className={styles.defPos}>also called an online Monero wallet, XMR web wallet, or Monero browser wallet</span>
                <ol>
                  <li>Nothing to install or download.</li>
                  <li>Non-custodial: you hold the keys.</li>
                  <li>Best for everyday amounts. For large savings, use a hardware wallet.</li>
                </ol>
              </aside>
            </div>
          </div>
        </section>

        {/* 5. WHAT YOU CAN DO */}
        <section className={`${styles.sec} ${styles.alt}`} id="uses">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">What you can do with it</p>
              <h2>Money that actually does what you want.</h2>
              <p className="lede">This is the part that matters. Here is what a private wallet lets you do, starting today.</p>
            </div>
            <div className={styles.useGrid}>
              <article className={styles.use}><UseGlobe /><h3>Pay anyone, anywhere</h3><p>Send money across the world in minutes. No bank hours, no middleman, and no form asking why.</p></article>
              <article className={styles.use}><UseHeart /><h3>Back who you believe in</h3><p>Tip a creator, support a cause, or help a friend, without it showing up on a statement for anyone to read.</p></article>
              <article className={styles.use}><UseShield /><h3>Save out of sight</h3><p>Hold your money where no company or government can freeze it, and no one can peek at the balance.</p></article>
              <article className={styles.use}><UseCart /><h3>Shop without becoming a profile</h3><p>Buy what you need online without handing one more data broker a file with your name on it.</p></article>
              <article className={styles.use}><UseInbox /><h3>Get paid, privately</h3><p>Take payment for your work straight into your wallet, with nobody skimming or snooping in between.</p></article>
              <article className={styles.use}><UseHome /><h3>Send help home</h3><p>Move money to family abroad quickly, without big fees taking a bite or a trail following it.</p></article>
            </div>
            <p className={styles.useNext}>New to all this? <Link className={styles.inlineLink} href="#what">Start with what Monero is</Link>, or <Link className={styles.inlineLink} href={walletUrl}>just open a wallet</Link>.</p>
          </div>
        </section>

        {/* 6. HOW THE MAGIC WORKS */}
        <section className={`${styles.sec} ${styles.dark}`} id="privacy">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">The clever part</p>
              <h2>How Monero makes a payment vanish from view</h2>
              <p className="lede">You do not need to understand the trick to use it, but it is a good one. Every Monero payment <mark>hides three things</mark>.</p>
            </div>

            <div className={styles.compareBit}>
              <div>
                <h3>Most crypto is an open book. Monero is not.</h3>
                <p>On a coin like Bitcoin, anyone can read who paid whom and how much, forever. Monero closes the book on the details that give you away.</p>
              </div>
              <CompareBitArt />
            </div>

            <div className={styles.privCards}>
              <article className={styles.pcard}>
                <span className={styles.pcardQ}>Hides who sent it</span>
                <h3>Ring signatures</h3>
                <span className={styles.pcardTech}>Who sent it</span>
                <div className={styles.diag}><RingDiagram /></div>
                <p>Your signature gets mixed in with a group of others. To an outsider, <mark>any one of them could have sent it</mark>. It is like signing a letter in a crowd of identical signatures.</p>
              </article>
              <article className={styles.pcard}>
                <span className={styles.pcardQ}>Hides who received it</span>
                <h3>Stealth addresses</h3>
                <span className={styles.pcardTech}>Who received it</span>
                <div className={styles.diag}><StealthDiagram /></div>
                <p>Every payment goes to a <mark>brand-new one-time address</mark>. Your real address never shows up on the blockchain, so no one can add up what you own.</p>
              </article>
              <article className={styles.pcard}>
                <span className={styles.pcardQ}>Hides how much</span>
                <h3>RingCT</h3>
                <span className={styles.pcardTech}>How much was sent</span>
                <div className={styles.diag}><RingctDiagram /></div>
                <p>The amount is <mark>hidden with math</mark>. The network can confirm the payment is valid without ever seeing the number.</p>
              </article>
            </div>

            <div className={styles.privClose}>
              <p>You never touch any of this. MonkStash does it for you on every single payment.</p>
              <Link className="btn btn-clay" href="/how-monero-works">Learn how Monero works</Link>
            </div>
          </div>
        </section>

        {/* 7. PEOPLE LIKE US */}
        <section className={`${styles.sec} ${styles.alt}`} id="who">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">People like us</p>
              <h2>For people who think their money is their own business.</h2>
              <p className="lede">You are in good company. MonkStash is for people who would rather keep things to themselves, for all kinds of good reasons.</p>
            </div>
            <div className={styles.personaGrid}>
              <article className={styles.persona}>
                <PersonaSeedling role="img" aria-label="Seedling" />
                <h3>Curious and careful</h3>
                <p>You are new to this and want to try private money without a tangle of setup. You can start in minutes.</p>
              </article>
              <article className={styles.persona}>
                <PersonaDoor role="img" aria-label="Arrow from an old door to a new one" />
                <h3>Starting over</h3>
                <p>MyMonero closed in 2026. Bring your wallet back somewhere safe, and <mark>skip the fake clone sites</mark>.</p>
              </article>
              <article className={styles.persona}>
                <PersonaShield role="img" aria-label="Shield with a keyhole" />
                <h3>Private on principle</h3>
                <p>You do not have something to hide. You have a life that is simply nobody else&apos;s business.</p>
              </article>
              <article className={styles.persona}>
                <PersonaDevices role="img" aria-label="Phone and laptop" />
                <h3>Everywhere at once</h3>
                <p>You live between a phone and a laptop. Open MonkStash in any browser, and bring your wallet back with your recovery words wherever you are.</p>
              </article>
            </div>
          </div>
        </section>

        {/* 8. YOUR FIRST MOVE */}
        <section className={styles.sec} id="how">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Your first move</p>
              <h2>You are two minutes from your own private wallet.</h2>
              <p className="lede">No download, no extension, no waiting. It all happens right here in your browser.</p>
            </div>
            <div className={styles.steps}>
              <article className={styles.step}>
                <span className={styles.stepNum}>i</span>
                <div className={styles.stepIll}><StepChoose /></div>
                <h3>Create or restore</h3>
                <p>Start fresh, or bring your old wallet back with your recovery words. Either way it happens <mark>right on your device</mark>, so you are in control from the very first tap.</p>
              </article>
              <article className={styles.step}>
                <span className={styles.stepNum}>ii</span>
                <div className={styles.stepIll}><StepBackup /></div>
                <h3>Back up and lock</h3>
                <p>Jot down your 25 recovery words and keep them somewhere safe. They are the master key to your money. Then lock the wallet with a password, and add a 2FA code for <mark>a second lock on the door</mark>.</p>
              </article>
              <article className={styles.step}>
                <span className={styles.stepNum}>iii</span>
                <div className={styles.stepIll}><StepSendReceive /></div>
                <h3>Send and receive</h3>
                <p>Share your address or QR code and the money lands straight in your wallet. Your balance and history appear once it syncs. <mark>That is it, you are using Monero</mark>.</p>
              </article>
            </div>
            <div className={styles.timeNote}>
              <ClockIcon />
              <span>Most people finish all three steps in about two minutes. Syncing the first time can take a little longer, and the wallet shows its progress.</span>
            </div>
          </div>
        </section>

        {/* 9. COMPARE */}
        <section className={styles.sec} id="compare">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Which wallet fits</p>
              <h2>Web, mobile, desktop, or hardware?</h2>
              <p className="lede">There is no single best Monero wallet, only the one that fits how you live. Here is the honest version.</p>
            </div>
            <div className={styles.tablewrap}>
              <table className={styles.mag}>
                <caption>Table 1. Four kinds of Monero wallet, side by side</caption>
                <thead>
                  <tr>
                    <th scope="col">What you care about</th>
                    <th scope="col" className={styles.us}>MonkStash (web)</th>
                    <th scope="col">Mobile app</th>
                    <th scope="col">Desktop</th>
                    <th scope="col">Hardware</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Setup time</th>
                    <td className={styles.us} data-label="MonkStash (web)">About 2 minutes</td>
                    <td data-label="Mobile app">5 to 10 min</td>
                    <td data-label="Desktop">10 to 20 min</td>
                    <td data-label="Hardware">20 to 40 min</td>
                  </tr>
                  <tr>
                    <th scope="row">Install needed</th>
                    <td className={styles.us} data-label="MonkStash (web)">Nothing</td>
                    <td data-label="Mobile app">App download</td>
                    <td data-label="Desktop">Program download</td>
                    <td data-label="Hardware">Device + app</td>
                  </tr>
                  <tr>
                    <th scope="row">Keys stay on your device</th>
                    <td className={styles.us} data-label="MonkStash (web)"><span className={styles.yes}><svg aria-hidden="true"><use href="#chk" /></svg>Yes</span></td>
                    <td data-label="Mobile app"><span className={styles.yes}><svg className={styles.chkForest} aria-hidden="true"><use href="#chk" /></svg>Yes</span></td>
                    <td data-label="Desktop"><span className={styles.yes}><svg className={styles.chkForest} aria-hidden="true"><use href="#chk" /></svg>Yes</span></td>
                    <td data-label="Hardware"><span className={styles.yes}><svg className={styles.chkClay} aria-hidden="true"><use href="#chk" /></svg>Yes (most secure)</span></td>
                  </tr>
                  <tr>
                    <th scope="row">Works on any device</th>
                    <td className={styles.us} data-label="MonkStash (web)"><span className={styles.yes}><svg aria-hidden="true"><use href="#chk" /></svg>Yes</span></td>
                    <td data-label="Mobile app">Phone only</td>
                    <td data-label="Desktop">Computer only</td>
                    <td data-label="Hardware">Needs the device</td>
                  </tr>
                  <tr>
                    <th scope="row">Best for</th>
                    <td className={styles.us} data-label="MonkStash (web)">Fast access anywhere</td>
                    <td data-label="Mobile app">Payments on the go</td>
                    <td data-label="Desktop">Power users</td>
                    <td data-label="Hardware">Large, long-term savings</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.tnote}>
              <ShieldCheckIcon />
              <p>MonkStash keeps your keys on your device just like the others, with <mark>nothing to install</mark>. For large, long-term savings, a hardware wallet is still the gold standard. <Link className={styles.inlineLink} href="/monero-wallets">See all wallets compared</Link></p>
            </div>
          </div>
        </section>

        {/* 10. THE QUIET PROOF */}
        <section className={`${styles.sec} ${styles.alt}`} id="trust">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">The fine print, honestly</p>
              <h2>No catch. Here is the proof.</h2>
              <p className="lede">Those promises only hold because of how MonkStash is built. The short version:</p>
            </div>
            <div className={styles.proofGrid}>
              <div className={styles.proofItem}>
                <ProofNonCustodial />
                <b>Non-custodial</b>
                <p>Your keys live on your device, locked with your password. We could not move your money if we tried.</p>
              </div>
              <div className={styles.proofItem}>
                <ProofOpenSource />
                <b>Open source</b>
                <p>The engine is monero-ts, and our own code is open source too (BSD-3-Clause), so you can check it instead of taking our word. <a href={repoUrl} rel="noopener">Read the code</a>. Open code is not an audit: the independent review is still on the roadmap.</p>
              </div>
              <div className={styles.proofItem}>
                <ProofNoAccounts />
                <b>No accounts</b>
                <p>No email, no sign-up, no KYC. There is nothing about you for us to store or lose.</p>
              </div>
              <div className={styles.proofItem}>
                <ProofNoTracking />
                <b>No tracking</b>
                <p>Zero analytics and zero third-party scripts on any wallet page.</p>
              </div>
            </div>
            <div className={styles.fix}>
              <p>The one caveat, said plainly: to find your payments, your wallet asks a Monero node through our relay server. The relay can see your IP address and those requests, and the node sees the requests, but <mark>neither ever sees your keys or your seed</mark>. Run your own node? Connect MonkStash to it in the wallet&apos;s settings, and no one else is in the loop.</p>
              <Link href="/is-monero-safe">Read the full threat model</Link>
            </div>
          </div>
        </section>

        {/* 11. THE COMPLETE GUIDES (pillar hubs) */}
        <section className={`${styles.sec} ${styles.alt}`} id="learn">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">The library</p>
              <h2>Learn Monero the easy way</h2>
              <p className="lede">{PILLAR_COUNT_TEXT} complete guides, written for real people, not just experts. Start with the one that answers your question.</p>
            </div>
            <PillarIndex />
            <div className={styles.startHere}>
              <h3>New to web wallets? Start here.</h3>
              <ClusterLinks pillar="web-wallet" />
            </div>
          </div>
        </section>

        {/* 11b. HELP BUILD THE REST */}
        <section className={styles.help} id="support-us" aria-labelledby="helpH">
          <div className={`container-wide ${styles.helpInner}`}>
            <p className="eyebrow">Help build the rest</p>
            <h2 id="helpH">The web wallet is free. Help us build what is missing.</h2>
            <p className={styles.helpBody}>MyMonero is gone, and there is still no good Monero browser extension. MonkStash is funded by the people who use it, one milestone at a time, and you can <mark>check every coin that comes in</mark>.</p>
            <div className={styles.helpActions}>
              <Link className="btn btn-ghost" href="/donate">See the roadmap</Link>
              <Link className={styles.inlineLink} href="/donate#roadmap">How the glass jar works</Link>
            </div>
          </div>
        </section>

        {/* 12. FAQ */}
        <section className={styles.sec} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>Monero wallet questions, answered</h2>
              <FaqArt />
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

        {/* 13. FINAL CTA */}
        <section className={styles.final} aria-labelledby="finalH">
          <div className={`container-wide ${styles.finalGrid}`}>
            <div>
              <h2 id="finalH">Your money, your business. Start now.</h2>
              <p>Free, non-custodial, and private by default. No download, no account, and about two minutes to a wallet that is finally yours alone.</p>
              <div className={`${styles.ctaRow}`}>
                <Link className="btn btn-primary btn-lg" href={walletUrl}>Open wallet</Link>
                <Link className="btn btn-ghost btn-lg" href="#how">See how it works</Link>
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
