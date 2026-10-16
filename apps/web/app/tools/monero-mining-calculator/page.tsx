import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, walletUrl } from "@/lib/site";
import { MiningCalculator } from "./MiningCalculator";
import { BENCH_URL } from "./cpus";
import styles from "./page.module.css";

const PATH = "/tools/monero-mining-calculator";

export const metadata: Metadata = {
  title: "Monero Mining Calculator (CPU, P2Pool, Solo)",
  description: "Free Monero mining calculator: enter your CPU hashrate and power cost to estimate XMR per day on a pool, P2Pool or solo, from live network difficulty.",
  alternates: { canonical: PATH },
  openGraph: ogFor({ title: "Monero Mining Calculator (CPU, P2Pool, Solo)", description: "Free Monero mining calculator: enter your CPU hashrate and power cost to estimate XMR per day on a pool, P2Pool or solo, from live network difficulty.", path: PATH }),
};

/*
 * Worked example inputs. Difficulty observed from a mainnet node on 15 October 2026; the
 * hashrate is the rounded XMRig benchmark figure for a Ryzen 7 5800X (see ./cpus.ts).
 * Results: share = 12,400 / 5.75 GH/s; XMR a day = share x 720 x 0.602 = 0.00093.
 */
const EX = { difficultyBillions: 690, networkGhs: 5.75, hashrate: 12_400, reward: 0.602, xmrPerDay: 0.00093, daysPerXmr: 1_070, years: 2.9, soloDays: 640, watts: 150, kwhTotal: 3_850 };

const faqs = [
  { q: "How long does it take to mine 1 Monero?", a: `It depends on your hashrate and the network difficulty. With a Ryzen 7 5800X at about ${EX.hashrate.toLocaleString("en-US")} H/s and the difficulty in October 2026, a pool or P2Pool miner would expect to earn 1 XMR in about ${EX.daysPerXmr.toLocaleString("en-US")} days, roughly ${EX.years} years. A CPU twice as fast takes about half as long. The calculator above uses today's live difficulty.` },
  { q: "Is Monero mining profitable?", a: "That depends mostly on what you pay for electricity, and on the XMR price, which nobody can predict. The calculator shows how much electricity each XMR costs you at your power price, so you can compare. Many people mine on hardware they already own because they want to support the network, not as an income." },
  { q: "Can I mine Monero with a GPU or an ASIC?", a: "Monero uses RandomX, a mining algorithm designed for ordinary CPUs. It needs fast memory and large caches, and it runs random programs that general-purpose processors handle well. GPUs can run it but are far less efficient per watt than a modern CPU, and RandomX was built so that specialized ASIC chips gain little advantage." },
  { q: "Does P2Pool earn more than a normal pool?", a: "On average it earns about the same, minus the fee you would otherwise pay: P2Pool charges none. Payouts arrive when P2Pool as a whole finds a Monero block, so they come in uneven amounts. Smaller miners can use the P2Pool mini or nano side chains to get payouts more often." },
  { q: "Should I mine solo?", a: "Only if you accept a lottery. Solo mining pays a full block reward, but only when your own computer finds a block. With a single desktop CPU the expected wait is well over a year, and real waits can be much shorter or much longer. A pool or P2Pool gives the same average with far steadier payouts." },
  { q: "Where do the mined coins go?", a: "To the wallet address you put in your mining software. Use a wallet you control, so no one else holds your coins. P2Pool needs a primary address (starting with 4), not a subaddress. You can create one free in your browser with MonkStash." },
];

const related = [
  { href: "/mine-monero", tag: "Guide", title: "How to mine Monero", body: "Set up XMRig, pick a pool, and start on your own computer." },
  { href: "/monero-p2pool", tag: "Guide", title: "Mine with P2Pool", body: "A decentralized pool with no fee and no account." },
  { href: "/create-monero-wallet", tag: "Guide", title: "Create a Monero wallet", body: "Get an address for payouts that only you control." },
  { href: walletUrl, tag: "Wallet", title: "Open your wallet", body: "Free, in your browser. Your keys stay on your device." },
];

export default function MiningCalculatorPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebApplication", name: "Monero Mining Calculator", url: absoluteUrl(PATH), applicationCategory: "UtilitiesApplication", operatingSystem: "Any (web browser)", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
          { "@type": "ListItem", position: 3, name: "Mining calculator", item: absoluteUrl(PATH) },
        ] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO + TOOL */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/tools">Tools</Link><span aria-hidden="true">/</span><span>Mining calculator</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Monero mining calculator</span>{" "}
                  See what your CPU <mark>can really</mark> mine.
                </h1>
                <p className={styles.sub}>Enter your hashrate and power cost. This free Monero mining calculator estimates XMR per day on a pool or P2Pool, or your wait for a block when mining solo, from the live network difficulty.</p>
                <p className={styles.micro}><span>Free.</span><span>Live difficulty.</span><span>Nothing you type is uploaded.</span></p>
              </div>
              <MiningCalculator />
            </div>
          </div>
        </section>

        {/* 2. HOW IT WORKS */}
        <section className={`${styles.sec} ${styles.alt}`} id="how">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">The math</p>
              <h2>How the Monero mining calculator works</h2>
              <p className="lede">Mining is a share of a fixed prize. Monero makes <mark>one block every two minutes</mark>, about 720 a day, and your expected cut is your share of all the work being done.</p>
            </div>
            <ul className={styles.facts}>
              <li><b>Network hashrate = difficulty / 120.</b> Difficulty is how many hashes the network expects per block, and a block is targeted every 120 seconds.</li>
              <li><b>Your share = your hashrate / network hashrate.</b> At 10,000 H/s against several billion, it is a tiny fraction.</li>
              <li><b>XMR a day = share × 720 blocks × block reward × (1 − pool fee).</b> The reward is the newest block&apos;s: the 0.6 XMR tail emission plus that block&apos;s fees.</li>
              <li><b>Solo: expected days per block = network hashrate / your hashrate / 720.</b> An average wait, not a promise.</li>
            </ul>
            <div className={styles.callout}>
              <p><b>These are estimates.</b> Difficulty moves with every block as miners join and leave. Pool and P2Pool payouts vary with luck in the short term, and solo results vary enormously. Nothing here predicts the XMR price, and nothing here is financial advice.</p>
            </div>
          </div>
        </section>

        {/* 3. WORKED EXAMPLE */}
        <section className={styles.sec} id="example">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Worked example</p>
              <h2>How long does it take to mine 1 Monero?</h2>
              <p className="lede">With one popular desktop CPU and the difficulty in October 2026: <mark>about {EX.years} years</mark> on a pool or P2Pool. Here is the arithmetic, so you can redo it for your own machine.</p>
            </div>
            <div className={styles.tablewrap}>
              <table className={styles.mag}>
                <caption>Table 1. One Ryzen 7 5800X, mining on P2Pool (0% fee), 15 October 2026</caption>
                <thead>
                  <tr><th scope="col">Step</th><th scope="col">Value</th><th scope="col">Where it comes from</th></tr>
                </thead>
                <tbody>
                  <tr><th scope="row">Your hashrate</th><td>{EX.hashrate.toLocaleString("en-US")} H/s</td><td>Rounded <a className={styles.inlineLink} href={BENCH_URL} target="_blank" rel="noopener noreferrer">XMRig benchmark</a> figure</td></tr>
                  <tr><th scope="row">Network difficulty</th><td>about {EX.difficultyBillions} billion</td><td>Read from a mainnet node</td></tr>
                  <tr><th scope="row">Network hashrate</th><td>about {EX.networkGhs} GH/s</td><td>Difficulty / 120</td></tr>
                  <tr><th scope="row">Block reward</th><td>about {EX.reward} XMR</td><td>0.6 XMR tail emission plus fees</td></tr>
                  <tr><th scope="row">XMR a day</th><td>about {EX.xmrPerDay} XMR</td><td>Share × 720 × reward</td></tr>
                  <tr><th scope="row">Time to 1 XMR</th><td className={styles.us}>about {EX.daysPerXmr.toLocaleString("en-US")} days</td><td>1 / XMR a day</td></tr>
                  <tr><th scope="row">Solo, one block</th><td>about {EX.soloDays} days on average</td><td>Network hashrate / yours / 720</td></tr>
                </tbody>
              </table>
            </div>
            <p className="lede" style={{ marginTop: "var(--s-5)" }}>
              Power adds up over that time. If the whole computer draws {EX.watts} W at the wall (measure yours with a plug-in meter), {EX.daysPerXmr.toLocaleString("en-US")} days
              uses about {EX.kwhTotal.toLocaleString("en-US")} kWh. Multiply by your price per kWh to see what 1 XMR costs you in electricity.
            </p>
          </div>
        </section>

        {/* 4. WHY CPU */}
        <section className={`${styles.sec} ${styles.alt}`} id="cpu">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">RandomX</p>
              <h2>Why Monero is mined on CPUs</h2>
              <p className="lede">Since 2019 Monero has used RandomX, an algorithm <mark>built for ordinary processors</mark>, so anyone with a computer can take part.</p>
            </div>
            <ul className={styles.facts}>
              <li><b>It runs random programs.</b> Each hash executes freshly generated code, the kind of work general-purpose CPUs are built for.</li>
              <li><b>It needs memory and cache.</b> Fast mode uses a dataset of over 2 GB, and each mining thread works best with 2 MB of L3 cache. That is why CPUs with large caches lead the benchmark list.</li>
              <li><b>Specialized chips gain little.</b> GPUs can run RandomX but are far less efficient per watt, and RandomX was designed so that ASICs have little advantage. Read the <a className={styles.inlineLink} href="https://github.com/tevador/RandomX" target="_blank" rel="noopener noreferrer">RandomX design notes</a> for the details.</li>
              <li><b>Settings matter.</b> Enabling huge pages in XMRig and running dual-channel memory often raise hashrate noticeably. Check yours with XMRig&apos;s built-in benchmark.</li>
            </ul>
            <p className="lede" style={{ marginTop: "var(--s-5)" }}>
              Ready to start? Follow the step-by-step guide to <Link className={styles.inlineLink} href="/mine-monero">mining Monero</Link>, or set up <Link className={styles.inlineLink} href="/monero-p2pool">P2Pool</Link> for payouts with no pool fee.
            </p>
          </div>
        </section>

        {/* 5. FAQ */}
        <section className={styles.sec} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>Monero mining questions, answered</h2>
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
              <h2>Send your payouts somewhere safe</h2>
              <p className="lede">Mined coins go to the address you choose. <Link className={styles.inlineLink} href="/create-monero-wallet">Create a Monero wallet</Link> that only you control, free in your browser.</p>
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
