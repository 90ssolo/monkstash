import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, walletUrl } from "@/lib/site";
import { QrGenerator } from "./QrGenerator";
import styles from "./page.module.css";

const PATH = "/tools/monero-qr-code-generator";

export const metadata: Metadata = {
  title: "Monero QR Code Generator: Payment Requests",
  description: "Free Monero QR code generator: turn an XMR address, amount and note into a monero: payment URI and QR code. Download PNG or SVG, made in your browser.",
  alternates: { canonical: PATH },
  openGraph: ogFor({ title: "Monero QR Code Generator: Payment Requests", description: "Free Monero QR code generator: turn an XMR address, amount and note into a monero: payment URI and QR code. Download PNG or SVG, made in your browser.", path: PATH }),
};

const faqs = [
  { q: "How do I make a QR code for my Monero address?", a: "Paste your address into the generator above. The QR code appears as soon as the address is valid. Add an amount, a name or a description if you want, then download it as a PNG for screens or an SVG for print. Scan it with your own wallet once to check it before you share it." },
  { q: "What is a monero: URI?", a: "It is a standard way to write a payment request as one line of text: monero: followed by the address, plus optional fields for the amount (tx_amount), a description (tx_description) and the recipient's name (recipient_name). Monero wallets that scan it fill in the payment for the payer, who still reviews and confirms it." },
  { q: "Is a Monero QR code safe to share?", a: "A receiving address only lets people pay you. It does not show your balance or let anyone spend. The catch is reuse: everyone who pays a printed code pays the same address, so the payers' own records (and those of any exchange they paid from) all show that one address and can be matched to each other." },
  { q: "Should I add an amount to the QR code?", a: "Add one for a fixed price, like an invoice or a ticket. Leave it empty for donations or tips, so the payer chooses. The amount is in XMR, so a code with a fixed amount does not follow price changes in your currency." },
  { q: "Does this generator send my address anywhere?", a: "No. The page builds the payment request and draws the QR code with code that runs in your browser. Nothing you type is uploaded, logged or stored by MonkStash. You can disconnect from the internet after the page loads and it still works." },
  { q: "Can every Monero wallet read these QR codes?", a: "Wallets built on Monero's own wallet code read the address and the standard fields. Some wallets only read the address and ignore the amount or description, so state the amount in plain text too when it matters, for example on an invoice." },
];

const related = [
  { href: "/monero-payment-link", tag: "Guide", title: "Monero payment links", body: "A fresh address for every request, shared as a link." },
  { href: "/accept-monero-payments", tag: "Guide", title: "Accept Monero payments", body: "Donations, invoices and a shop till, step by step." },
  { href: "/monero-subaddress", tag: "Learn", title: "Monero subaddresses", body: "Why one wallet can hand out many unlinkable addresses." },
  { href: "/business", tag: "Business", title: "MonkStash for business", body: "Payment links and a till that never reuse an address." },
];

export default function QrCodeGeneratorPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebApplication", name: "Monero QR Code Generator", url: absoluteUrl(PATH), applicationCategory: "FinanceApplication", operatingSystem: "Any (web browser)", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
          { "@type": "ListItem", position: 3, name: "QR code generator", item: absoluteUrl(PATH) },
        ] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO + TOOL */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/tools">Tools</Link><span aria-hidden="true">/</span><span>QR code generator</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Monero QR code generator</span>{" "}
                  Get paid with <mark>one scan</mark>.
                </h1>
                <p className={styles.sub}>Turn your XMR address into a payment request and a QR code. Add an amount and a note if you like, then download it for a donation page, an invoice or a poster.</p>
                <p className={styles.micro}><span>Free.</span><span>PNG and SVG.</span><span>Nothing is uploaded.</span></p>
              </div>
              <QrGenerator />
            </div>
          </div>
        </section>

        {/* 2. WHAT IS A MONERO URI */}
        <section className={`${styles.sec} ${styles.alt}`} id="uri">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Under the QR code</p>
              <h2>What is a monero: URI?</h2>
              <p className="lede">A QR code is just text in a picture. Here the text is a <mark>monero: URI</mark>, the payment request format Monero&apos;s own wallet reads and writes.</p>
            </div>
            <div className={styles.lookGrid}>
              <div>
                <p className={styles.code}>monero:8Abc...xyz?tx_amount=0.25&amp;tx_description=Invoice%201042&amp;recipient_name=Lena</p>
                <p className="lede" style={{ marginTop: "var(--s-4)", marginBottom: 0 }}>When a wallet scans it, the payment form is filled in. The payer still sees every detail and confirms it, so a QR code can never take money on its own.</p>
              </div>
              <ul className={styles.facts} style={{ marginTop: 0 }}>
                <li><b>Address.</b> Right after monero:, the address the money goes to. This is the only required part.</li>
                <li><b>tx_amount.</b> The amount in XMR, written with a dot, like 0.25.</li>
                <li><b>tx_description.</b> What the payment is for. Spaces and symbols are encoded so every wallet reads them the same way.</li>
                <li><b>recipient_name.</b> Who is asking to be paid, shown to the payer.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. HOW TO USE IT */}
        <section className={styles.sec} id="use">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Put it to work</p>
              <h2>How to use a Monero QR code on a donation page or invoice</h2>
              <p className="lede">The same code works on a screen and on paper. A few small habits make it <mark>easy to trust</mark>.</p>
            </div>
            <ol className={styles.steps}>
              <li><span><b>Use a subaddress made for this purpose.</b> Create a new <Link className={styles.inlineLink} href="/monero-subaddress">subaddress</Link> in your wallet, label it (for example &quot;Website donations&quot;), and paste it above. Payments to it stay separate from your other income.</span></li>
              <li><span><b>Donations: leave the amount empty.</b> Add your project name as the recipient. Download the SVG for print, or the PNG for a web page, and put the address in text next to it.</span></li>
              <li><span><b>Invoices: add the amount and invoice number.</b> Write the amount in plain text on the invoice as well, because a few wallets only read the address.</span></li>
              <li><span><b>Test it.</b> Scan the code with your own wallet before you publish it, and check that the address matches the one your wallet shows.</span></li>
            </ol>
          </div>
        </section>

        {/* 4. STATIC QR VS PAYMENT LINK */}
        <section className={`${styles.sec} ${styles.alt}`} id="compare">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Know the trade-off</p>
              <h2>Static QR code or payment link?</h2>
              <p className="lede">A printed QR code always points to <mark>the same address</mark>. That is fine for a tip jar, but not ideal when each customer should get their own.</p>
            </div>
            <div className={styles.tablewrap}>
              <table className={styles.mag}>
                <caption>Table 1. A static QR code compared with a MonkStash payment link</caption>
                <thead>
                  <tr><th scope="col">Question</th><th scope="col">Static QR code (this tool)</th><th scope="col">Payment link (in the wallet)</th></tr>
                </thead>
                <tbody>
                  <tr><th scope="row">Address</th><td>The same one for every payer</td><td className={styles.us}>A fresh subaddress for each request</td></tr>
                  <tr><th scope="row">Can payments be linked?</th><td>Not on the blockchain, but every payer&apos;s records show the same address</td><td className={styles.us}>Each payer&apos;s records show a different address</td></tr>
                  <tr><th scope="row">Who paid what</th><td>You match payments by amount and time</td><td className={styles.us}>Each request has its own address, so it is clear</td></tr>
                  <tr><th scope="row">Best for</th><td>Donations, tip jars, posters</td><td>Invoices, customers, a shop counter</td></tr>
                  <tr><th scope="row">Needs a wallet open</th><td>No</td><td>Yes, to create each request</td></tr>
                </tbody>
              </table>
            </div>
            <div className={styles.callout}>
              <p><b>Honest warning:</b> a printed QR code reuses one address. Monero&apos;s one-time addresses keep those payments unlinkable on the blockchain itself, but every payer, and every exchange or service they paid from, records the same address. Those records can be matched to each other and to you, and you cannot easily tell which customer paid which amount.</p>
              <p>For a fresh address per customer, use <Link className={styles.inlineLink} href="/monero-payment-link">payment links</Link> in the <Link className={styles.inlineLink} href={walletUrl}>MonkStash wallet</Link>, or see how it works for a shop on the <Link className={styles.inlineLink} href="/business">business page</Link>.</p>
            </div>
          </div>
        </section>

        {/* 5. FAQ */}
        <section className={styles.sec} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>Monero QR code questions, answered</h2>
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
              <h2>Ready to get paid?</h2>
              <p className="lede">Create a free <Link className={styles.inlineLink} href={walletUrl}>Monero wallet</Link> in your browser to make subaddresses and payment links. Your keys stay on your device.</p>
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
