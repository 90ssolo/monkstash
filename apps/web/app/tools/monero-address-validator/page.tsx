import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { AddressValidator } from "@/components/tools/AddressValidator";
import { absoluteUrl, walletUrl } from "@/lib/site";
import { AnatomyArt, PrimaryIcon, SubIcon, IntegratedIcon, CheckpointArt } from "./Art";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Monero Address Validator and Checker",
  description: "Free Monero address validator: paste an XMR address to check its checksum, which network it is on, and whether it is a subaddress.",
  alternates: { canonical: "/tools/monero-address-validator" },
  openGraph: ogFor({ title: "Monero Address Validator and Checker", description: "Free Monero address validator: paste an XMR address to check its checksum, which network it is on, and whether it is a subaddress.", path: "/tools/monero-address-validator" }),
};

const faqs = [
  { q: "How do I check if a Monero address is valid?", a: "Paste the address into the checker above. It tells you right away whether it is a valid Monero address format, which network it belongs to (mainnet, stagenet, or testnet), and whether it is a primary, subaddress, or integrated address. It also flags common mistakes like a wrong network or a missing character." },
  { q: "What does a Monero address look like?", a: "A standard Monero mainnet address is 95 characters long and starts with 4. A subaddress starts with 8. An integrated address, which has a built-in payment ID, is 106 characters. Addresses use letters and numbers but never the characters 0, O, I, or l." },
  { q: "Does this tool verify the checksum?", a: "Yes. It decodes the address and checks its built-in checksum, so a mistyped or missing character is caught, along with the network and address type. What no tool can check is whether the address belongs to the person you mean to pay. Before sending real funds, confirm the full address with them." },
  { q: "Is it safe to paste my address here?", a: "Yes. The check runs entirely in your browser. Your address is not sent to any server, and a receiving address is safe to share anyway: it only lets people pay you, not see your balance." },
];

const related = [
  { href: "/send-monero", tag: "Guide", title: "How to send Monero", body: "The full walkthrough, from address to confirmation." },
  { href: "/receive-monero", tag: "Guide", title: "How to receive Monero", body: "Share an address, or a fresh subaddress for each sender." },
  { href: "/monero-phishing-sites", tag: "Learn", title: "Spot Monero phishing sites", body: "How fake sites and swapped addresses catch people out." },
  { href: walletUrl, tag: "Wallet", title: "Open your wallet", body: "Free, in your browser, ready in about two minutes." },
];

export default function AddressValidatorPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebApplication", name: "Monero Address Validator", url: absoluteUrl("/tools/monero-address-validator"), applicationCategory: "UtilitiesApplication", operatingSystem: "Any (web browser)", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
          { "@type": "ListItem", position: 3, name: "Address validator", item: absoluteUrl("/tools/monero-address-validator") },
        ] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO + TOOL */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/tools">Tools</Link><span aria-hidden="true">/</span><span>Address validator</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Monero address validator</span>{" "}
                  Catch the typo <mark>before</mark> it costs you.
                </h1>
                <p className={styles.sub}>Use this free Monero address validator to check an address format in your browser. See the network and address type, and catch common mistakes before you send.</p>
                <p className={styles.micro}><span>Free.</span><span>Runs in your browser.</span><span>Nothing is uploaded.</span></p>
              </div>
              <AddressValidator />
            </div>
          </div>
        </section>

        {/* 2. WHAT AN ADDRESS LOOKS LIKE */}
        <section className={`${styles.sec} ${styles.alt}`} id="anatomy">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Know it by sight</p>
              <h2>What a Monero address looks like</h2>
              <p className="lede">A Monero address is a long string of letters and numbers that people use to send you XMR. Once you know the shape, a wrong one stands out.</p>
            </div>
            <div className={styles.lookGrid}>
              <figure className={styles.fig}>
                <div className={styles.figBox}><AnatomyArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>An address is a short prefix, two public keys and a checksum.</span></figcaption>
              </figure>
              <div>
                <p className="lede" style={{ marginBottom: 0 }}>Here is what the checker looks at, instantly, without sending anything to a server.</p>
                <ul className={styles.facts}>
                  <li><b>Format and length.</b> A standard address is <mark>95 characters</mark>. An integrated address is 106.</li>
                  <li><b>Network.</b> Whether it is mainnet, stagenet, or testnet, so you do not send real funds to a test address.</li>
                  <li><b>Type.</b> Whether it is a primary address, a subaddress, or an integrated address.</li>
                  <li><b>Common mistakes.</b> Wrong characters, a wrong network prefix, or a truncated address. Addresses never use 0, O, I, or l.</li>
                </ul>
              </div>
            </div>
            <div className={styles.tablewrap}>
              <table className={styles.mag}>
                <caption>Table 1. The first character tells you the network and type</caption>
                <thead>
                  <tr><th scope="col">Network</th><th scope="col">Primary starts with</th><th scope="col">Subaddress starts with</th></tr>
                </thead>
                <tbody>
                  <tr><th scope="row">Mainnet (real money)</th><td className={styles.us}>4</td><td className={styles.us}>8</td></tr>
                  <tr><th scope="row">Stagenet (practice)</th><td>5</td><td>7</td></tr>
                  <tr><th scope="row">Testnet (developers)</th><td>9 or A</td><td>B</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. THREE TYPES */}
        <section className={styles.sec} id="types">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Three kinds</p>
              <h2>The three kinds of Monero address</h2>
              <p className="lede">They all point at the same wallet. What changes is how <mark>private and how specific</mark> each one is.</p>
            </div>
            <div className={styles.typeGrid}>
              <article className={styles.type}>
                <PrimaryIcon />
                <span className={styles.typeTag}>Starts with 4</span>
                <h3>Primary address</h3>
                <p>Your main wallet address. It starts with <code>4</code> on mainnet and is 95 characters long.</p>
              </article>
              <article className={styles.type}>
                <SubIcon />
                <span className={styles.typeTag}>Starts with 8</span>
                <h3>Subaddress</h3>
                <p>An extra address that belongs to the same wallet. Give each sender a different one and <mark>their payments are not linked</mark> to each other.</p>
                <p>See <Link className={styles.inlineLink} href="/receive-monero">how to receive Monero</Link>.</p>
              </article>
              <article className={styles.type}>
                <IntegratedIcon />
                <span className={styles.typeTag}>106 characters</span>
                <h3>Integrated address</h3>
                <p>A primary address with a payment ID built in. Some services use it to tell one customer&apos;s payment from another&apos;s.</p>
              </article>
            </div>
          </div>
        </section>

        {/* 4. BEFORE YOU SEND (dark) */}
        <section className={`${styles.sec} ${styles.dark}`} id="before-you-send">
          <div className={`container-wide ${styles.checkGrid}`}>
            <div>
              <div className={styles.secHead} style={{ marginBottom: 28 }}>
                <p className="eyebrow">Before you send</p>
                <h2>A valid result is a strong sign. Not a promise.</h2>
                <p className="lede">This checker catches typos, not swaps: a valid address can still be the wrong one. Monero payments cannot be reversed, so take <mark>thirty seconds</mark> and run through these.</p>
              </div>
              <ol className={styles.checks}>
                <li><span className={styles.num}>i</span><div><b>Validate it here</b><p>Make sure it shows a valid format on the network you mean to use. Real money means mainnet.</p></div></li>
                <li><span className={styles.num}>ii</span><div><b>Compare the ends</b><p>Check the first and last few characters against what the recipient gave you, ideally through a second channel.</p></div></li>
                <li><span className={styles.num}>iii</span><div><b>Paste, never type</b><p>Copy and paste the address. Typing 95 characters by hand is how mistakes happen.</p></div></li>
                <li><span className={styles.num}>iv</span><div><b>Send a small test first</b><p>For a large payment, send a little and confirm it arrived before sending the rest.</p></div></li>
              </ol>
              <p className={styles.darkNote}>For the full walkthrough, read <Link href="/send-monero">how to send Monero</Link>. Worried about fake sites? See <Link href="/monero-phishing-sites">Monero phishing sites</Link>.</p>
            </div>
            <figure className={styles.darkFig}>
              <CheckpointArt />
              <figcaption><b>Figure 2</b>Pause at each step. A mistake caught early costs nothing.</figcaption>
            </figure>
          </div>
        </section>

        {/* 5. FAQ */}
        <section className={styles.sec} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>Monero address questions, answered</h2>
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
              <h2>Ready to send or receive?</h2>
              <p className="lede">Need an address of your own? You can <Link className={styles.inlineLink} href={walletUrl}>create a Monero wallet</Link> in about two minutes. It is free and non-custodial, so your keys stay on your device. New to Monero? Start with <Link className={styles.inlineLink} href="/what-is-monero">what Monero is</Link>, then the full guide to <Link className={styles.inlineLink} href="/use-monero">using Monero safely</Link>.</p>
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
