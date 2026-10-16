import type { Metadata } from "next";
import { ogFor } from "@/lib/og";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { ArticleCover } from "@/components/art/Covers";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { SaleFlowArt, SaleFlowNarrow, SetupPickerArt, SetupPickerNarrow } from "@/components/art/MerchantArt";
import { articleByPath } from "@/lib/content";
import { merchant } from "@/lib/merchant";
import { absoluteUrl, walletUrl } from "@/lib/site";
import styles from "./business.module.css";

const DESCRIPTION =
  "Accept Monero at your counter or by invoice: payment links and a browser till today, self-hosted shop checkout soon. Free, paid straight to your wallet.";

export const metadata: Metadata = {
  title: "Monero for Business: Links, Till and Checkout",
  description: DESCRIPTION,
  alternates: { canonical: "/business" },
  openGraph: ogFor({ type: "website", title: "MonkStash for business", description: DESCRIPTION, path: "/business" }),
};

type Status = "live" | "coming";
const PRODUCTS: { path: string; name: string; who: string; what: string; status: Status; cta: { href: string; label: string } }[] = [
  {
    path: "/monero-payment-link", name: "Payment links", who: "Freelancers, invoices, one-off sales",
    what: "Type an amount in your currency, share a link or QR. Your wallet marks it paid by itself.",
    status: "live", cta: { href: "/monero-payment-link", label: "How payment links work" },
  },
  {
    path: "/monero-pos", name: "A till for your counter", who: "Cafes, market stalls, shops",
    what: "Turn a tablet into a Monero till: type the price, the customer scans, the screen says Paid.",
    status: "live", cta: { href: "/monero-pos", label: "How the till works" },
  },
  {
    path: "/monero-payment-gateway", name: "Checkout for your website", who: "Online shops and developers",
    what: "MonkStash Pay runs on your own server with a watch-only wallet: invoices, a checkout page and signed webhooks.",
    status: merchant.payRepoUrl ? "live" : "coming", cta: { href: "/monero-payment-gateway", label: "About MonkStash Pay" },
  },
  {
    path: "/monero-woocommerce", name: "WooCommerce plugin", who: "WordPress shops",
    what: "Monero at checkout in WooCommerce, powered by your own MonkStash Pay server.",
    status: merchant.wooPluginUrl ? "live" : "coming", cta: { href: "/monero-woocommerce", label: "About the plugin" },
  },
];

const WHY = [
  { h: "No middleman", p: "Payments go from your customer's wallet straight into yours. Nobody can hold, freeze or reverse them." },
  { h: "No processing fees", p: "MonkStash charges nothing. The only cost is the Monero network fee, usually a cent or two, paid by the sender." },
  { h: "No chargebacks", p: "A confirmed Monero payment is final. You decide refunds, not a card network." },
  { h: "Private for both sides", p: "Your sales are not public, and your customers do not hand over card details or their identity." },
];

const FAQ = [
  { q: "What does MonkStash cost a business?", a: "Nothing. The tools are free. Each payment carries the normal Monero network fee, usually a cent or two, which the customer's wallet pays." },
  { q: "Do I need a server?", a: "Not for payment links or the till: they run in your browser. Only website checkout needs a small server, because a shop must be online when customers pay." },
  { q: "How do I know a payment is really mine?", a: "Every sale gets its own fresh address (a subaddress), so a payment is matched by where it arrived, never by guessing from the amount." },
  { q: "Can staff at the till spend the money?", a: "Not if you run the till on a watch-only wallet. It can see payments arrive but has no key to spend them." },
  { q: "How do I give a refund?", a: "Ask the customer for a Monero address and send the amount back from your wallet. There is no card network in between, so you decide." },
];

function Badge({ status }: { status: Status }) {
  return <span className={status === "live" ? styles.live : styles.coming}>{status === "live" ? "Live" : "Coming soon"}</span>;
}

export default function BusinessPage() {
  const guides = ["/accept-monero-payments", "/monero-payment-link", "/monero-pos", "/monero-payment-gateway", "/monero-woocommerce"]
    .map((p) => articleByPath(p))
    .filter((a): a is NonNullable<ReturnType<typeof articleByPath>> => !!a);

  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebPage", name: "MonkStash for business", description: DESCRIPTION, url: absoluteUrl("/business") },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Business", item: absoluteUrl("/business") },
        ] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]} />
      <SiteHeader />
      <main id="main">
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Business</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <p className="eyebrow">MonkStash for business</p>
                <h1 className={styles.h1}>Get paid in Monero. <em>Keep every coin.</em></h1>
                <p className={styles.lede}>
                  Payment links and a till for your counter today, with checkout for your website coming soon. <mark>Free, with nobody in the middle</mark>: the money lands in your own wallet, and every sale gets its own address so it is matched automatically.
                </p>
                <div className={styles.ctas}>
                  <Link className="btn btn-primary" href={walletUrl}>Open the wallet</Link>
                  <Link className="btn btn-secondary" href="/accept-monero-payments">Read the merchant guide</Link>
                </div>
              </div>
              <div className={styles.heroArt}><Adaptive wide={<SaleFlowArt />} narrow={<SaleFlowNarrow />} /></div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="tools-h">
          <div className="container-wide">
            <p className="eyebrow">Pick your setup</p>
            <h2 id="tools-h" className={styles.h2}>Four ways to take Monero</h2>
            <ul className={styles.products}>
              {PRODUCTS.map((p) => (
                <li key={p.path} className={styles.product}>
                  <ArticleCover path={p.path} className={styles.productCover} />
                  <div className={styles.productBody}>
                    <div className={styles.productTop}><span className={styles.who}>{p.who}</span><Badge status={p.status} /></div>
                    <h3>{p.name}</h3>
                    <p>{p.what}</p>
                    <Link className={styles.more} href={p.cta.href}>{p.cta.label} <span aria-hidden="true">→</span></Link>
                  </div>
                </li>
              ))}
            </ul>
            <p className={styles.note}>
              Live today in the wallet: payment links and the till. Website checkout and the WooCommerce plugin are built and being tested; they will be published as open-source downloads.
            </p>
            <p className={styles.note}>
              Need one printed code for a sign, a menu or a donation page? Make it with the free <Link href="/tools/monero-qr-code-generator">Monero QR code generator</Link>.
            </p>
          </div>
        </section>

        <section className={`${styles.section} ${styles.tint}`} aria-labelledby="why-h">
          <div className="container-wide">
            <div className={styles.whyGrid}>
              <div>
                <p className="eyebrow">Why Monero</p>
                <h2 id="why-h" className={styles.h2}>What changes when customers pay in Monero</h2>
              </div>
              <dl className={styles.why}>
                {WHY.map((w) => <div key={w.h}><dt>{w.h}</dt><dd>{w.p}</dd></div>)}
              </dl>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="fit-h">
          <div className="container-wide">
            <p className="eyebrow">Which one fits</p>
            <h2 id="fit-h" className={styles.h2}>Three setups, one rule: a fresh address per sale</h2>
            <div className={styles.figure}><Adaptive wide={<SetupPickerArt />} narrow={<SetupPickerNarrow />} /></div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="guides-h">
          <div className="container-wide">
            <p className="eyebrow">Merchant guides</p>
            <h2 id="guides-h" className={styles.h2}>Step by step, from first sale to records</h2>
            <ul className={styles.guides}>
              {guides.map((a) => (
                <li key={a.slug}>
                  <Link href={a.path} className={styles.guide}>
                    <ArticleCover path={a.path} className={styles.guideCover} />
                    <span className={styles.guideKicker}>{a.kicker}</span>
                    <span className={styles.guideTitle}>{a.title}</span>
                    <span className={styles.guideSummary}>{a.summary}</span>
                    <span className={styles.guideFoot}>{a.readingMinutes} min read <span aria-hidden="true">→</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${styles.section} ${styles.tint}`} aria-labelledby="faq-h">
          <div className="container-wide">
            <div className={styles.faqGrid}>
              <div>
                <p className="eyebrow">Questions</p>
                <h2 id="faq-h" className={styles.h2}>What merchants ask first</h2>
              </div>
              <div className={styles.faq}>
                {FAQ.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="cta-h">
          <div className="container-wide">
            <h2 id="cta-h">Take your first Monero payment today.</h2>
            <p>Open the wallet, make a payment link or start the till. No sign-up, nothing to install.</p>
            <div className={styles.ctas}>
              <Link className="btn btn-primary" href={walletUrl}>Open the wallet</Link>
              <Link className={`btn ${styles.ctaGhost}`} href="/monero-pos">See the till</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
