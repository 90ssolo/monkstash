import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { FeeCalculator } from "@/components/tools/FeeCalculator";
import { absoluteUrl, walletUrl } from "@/lib/site";
import styles from "../monero-address-validator/page.module.css";

const PATH = "/tools/monero-fee-calculator";

export const metadata: Metadata = {
  title: "Monero Fee Calculator: Cost of a Payment Now",
  description: "Free Monero fee calculator: see what an XMR payment costs right now, measured from real transactions in the latest blocks, at every priority.",
  alternates: { canonical: PATH },
  openGraph: ogFor({ title: "Monero Fee Calculator: Cost of a Payment Now", description: "Free Monero fee calculator: see what an XMR payment costs right now, measured from real transactions in the latest blocks, at every priority.", path: PATH }),
};

const faqs = [
  { q: "How much is a Monero transaction fee?", a: "A typical payment, spending one earlier payment and sending to one person, is about 1,500 bytes. At the lowest priority it costs a few hundred-thousandths of an XMR. The calculator above shows today's exact figure, measured from real transactions in the latest blocks." },
  { q: "How is the Monero fee calculated?", a: "The fee is the transaction's size in bytes multiplied by a fee per byte, then rounded up to a small fixed step. The fee per byte comes from the network and depends on the priority you pick. The amount you send does not change the fee." },
  { q: "Does sending more XMR cost a higher fee?", a: "No. Sending 0.1 XMR or 100 XMR costs the same if the transaction has the same shape. What changes the fee is the size of the transaction, mostly how many earlier payments it combines, and the priority." },
  { q: "What do the priority levels mean?", a: "Monero's own wallet names them unimportant, normal, elevated and priority, from cheapest to most expensive. A higher priority pays more per byte so miners include the payment sooner when blocks are full. When the network is quiet, the lowest priority confirms just as fast." },
  { q: "Why is my fee higher than the calculator says?", a: "Your wallet may be combining more earlier payments than you expected, which makes the transaction bigger, or using a higher priority. Some wallets also add a service fee for features like swaps. The network fee itself follows the formula on this page." },
  { q: "Is this calculator private?", a: "Yes. The fee data is measured on our server from a public Monero node and cached, so your visit never reaches the node, and nothing you type here leaves your browser. We do not fetch prices: type one in if you want a figure in your currency." },
];

const related = [
  { href: "/monero-transaction-fee", tag: "Learn", title: "Monero transaction fees explained", body: "Why fees are low, and what the network does with them." },
  { href: "/send-monero", tag: "Guide", title: "How to send Monero", body: "From address to confirmation, step by step." },
  { href: "/monero-transaction-time", tag: "Learn", title: "How long a payment takes", body: "Confirmations, and why 10 of them matter." },
  { href: walletUrl, tag: "Wallet", title: "Open your wallet", body: "Free, in your browser. It shows the exact fee before you send." },
];

export default function FeeCalculatorPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebApplication", name: "Monero Fee Calculator", url: absoluteUrl(PATH), applicationCategory: "FinanceApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
          { "@type": "ListItem", position: 3, name: "Fee calculator", item: absoluteUrl(PATH) },
        ] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO + TOOL */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/tools">Tools</Link><span aria-hidden="true">/</span><span>Fee calculator</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Monero fee calculator</span>{" "}
                  Know the fee <mark>before</mark> you send.
                </h1>
                <p className={styles.sub}>This free Monero fee calculator shows what an XMR payment costs right now. The numbers come from real transactions in the latest blocks, not from a guess.</p>
                <p className={styles.micro}><span>Free.</span><span>Live network data.</span><span>Nothing you type is uploaded.</span></p>
              </div>
              <FeeCalculator />
            </div>
          </div>
        </section>

        {/* 2. HOW THE FEE IS CALCULATED */}
        <section className={`${styles.sec} ${styles.alt}`} id="how">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">The formula</p>
              <h2>How a Monero fee is calculated</h2>
              <p className="lede">Monero charges for <mark>space, not money</mark>. The fee depends on how many bytes your payment takes up in a block, never on how much XMR you send.</p>
            </div>
            <ul className={styles.facts}>
              <li><b>Size in bytes.</b> A typical payment that spends one earlier payment and pays one person is about 1,500 bytes. Each extra earlier payment it combines adds roughly 700 bytes.</li>
              <li><b>Fee per byte.</b> Set by the network for each priority level. Your wallet asks a node for the current rate.</li>
              <li><b>Rounded up.</b> The result is rounded up to a small fixed step, so fees come out as tidy numbers.</li>
            </ul>
            <div className={styles.tablewrap}>
              <table className={styles.mag}>
                <caption>Table 1. Monero&apos;s four priority levels (names from Monero&apos;s own wallet)</caption>
                <thead>
                  <tr><th scope="col">Priority</th><th scope="col">Fee per byte, compared with the lowest</th><th scope="col">When to use it</th></tr>
                </thead>
                <tbody>
                  <tr><th scope="row">Unimportant</th><td className={styles.us}>1×</td><td>Almost always. Most payments use it.</td></tr>
                  <tr><th scope="row">Normal</th><td>4×</td><td>When blocks are busy and you want a better place in line.</td></tr>
                  <tr><th scope="row">Elevated</th><td>16×</td><td>Time-sensitive payments during heavy traffic.</td></tr>
                  <tr><th scope="row">Priority</th><td>200×</td><td>Rarely needed. Pays far more for the front of the line.</td></tr>
                </tbody>
              </table>
            </div>
            <p className="lede" style={{ marginTop: "var(--s-5)" }}>
              The multiples are the network&apos;s own rates at the time of writing; the calculator always uses the live ones. For the
              background, read <Link className={styles.inlineLink} href="/monero-transaction-fee">Monero transaction fees explained</Link>, or the
              complete guide to <Link className={styles.inlineLink} href="/use-monero">using Monero day to day</Link>.
            </p>
          </div>
        </section>

        {/* 3. PAY LESS */}
        <section className={styles.sec} id="pay-less">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Small savings</p>
              <h2>How to pay a lower Monero fee</h2>
              <p className="lede">Fees are already tiny. If you want them even smaller, <mark>three habits</mark> do almost all the work.</p>
            </div>
            <ul className={styles.facts}>
              <li><b>Leave the priority on the lowest setting.</b> When blocks are not full, a higher priority buys you nothing.</li>
              <li><b>Avoid combining many small payments.</b> Each earlier payment your wallet has to combine makes the transaction bigger. If you receive lots of tiny amounts, expect slightly higher fees later.</li>
              <li><b>Check the fee before you confirm.</b> Good wallets show it on the review screen. <Link className={styles.inlineLink} href={walletUrl}>MonkStash</Link> shows the fee and the total before anything is sent.</li>
            </ul>
          </div>
        </section>

        {/* 4. FAQ */}
        <section className={`${styles.sec} ${styles.alt}`} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>Monero fee questions, answered</h2>
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

        {/* 5. RELATED */}
        <section className={styles.sec} id="related">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Keep going</p>
              <h2>Ready to send?</h2>
              <p className="lede">See the exact fee for your own payment by opening a free <Link className={styles.inlineLink} href={walletUrl}>Monero wallet</Link> in your browser. Your keys stay on your device.</p>
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
