import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, walletUrl } from "@/lib/site";
import { KeysOnDeviceArt } from "../_trust/TrustArt";
import trust from "../_trust/trust.module.css";
import styles from "./privacy.module.css";

const UPDATED = "2026-10-16";
const UPDATED_TEXT = "16 October 2026";
const DESCRIPTION =
  "What MonkStash can and cannot see: no accounts, no cookies, no tracking. Your keys never leave your device. Here is exactly what passes through our server.";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: ogFor({ type: "website", title: "MonkStash privacy policy", description: DESCRIPTION, path: "/privacy" }),
};

/** The data map. Every row must match the code: check it whenever storage or a server route changes. */
const MAP: { what: string; where: string; who: string }[] = [
  { what: "Recovery words and private keys", where: "Your browser, encrypted with your wallet password", who: "Only you" },
  { what: "2FA secret and your own node's address", where: "Your browser, encrypted with your wallet password", who: "Only you" },
  { what: "Contacts, payment requests and sync progress", where: "Your browser, encrypted with a key from your wallet", who: "Only you, while the wallet is unlocked" },
  { what: "Wallet name, main address, restore height, whether 2FA is on", where: "Your browser, not encrypted, so the lock screen can show which wallet it is", who: "Anyone who can open this browser profile" },
  { what: "Sync requests and transactions you send", where: "Pass through our relay to a Monero node, unless you use your own node", who: "Our relay and the node, briefly" },
  { what: "Your IP address", where: "Held in our server's memory for up to one minute, to stop floods", who: "Our server, never written to disk" },
  { what: "Emails you send us", where: "Our inbox", who: "The MonkStash team" },
];

const TOC = [
  { id: "short", label: "The short version" },
  { id: "map", label: "Where your data lives" },
  { id: "device", label: "On your device" },
  { id: "server", label: "What our server sees" },
  { id: "links", label: "Payment links" },
  { id: "tracking", label: "Cookies and tracking" },
  { id: "email", label: "When you email us" },
  { id: "others", label: "Other services" },
  { id: "choices", label: "Your choices" },
  { id: "changes", label: "Changes and contact" },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebPage", name: "MonkStash privacy policy", description: DESCRIPTION, url: absoluteUrl("/privacy"), dateModified: UPDATED },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Privacy policy", item: absoluteUrl("/privacy") },
        ] },
      ]} />
      <SiteHeader />
      <main id="main">
        <section className={trust.hero}>
          <div className="container-wide">
            <nav className={trust.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Privacy policy</span>
            </nav>
            <div className={trust.heroGrid}>
              <div>
                <h1 className={trust.h1}>
                  <span className={`eyebrow ${trust.h1Kicker}`}>Privacy policy</span>{" "}
                  Built to know <mark>almost nothing</mark> about you.
                </h1>
                <p className={trust.sub}>
                  No accounts, no cookies, no tracking. Your keys are made and kept on your device. This page lists everything that does reach us, and why, in plain language.
                </p>
                <p className={trust.micro}>Last updated <time dateTime={UPDATED}>{UPDATED_TEXT}</time>.</p>
              </div>
              <figure className={trust.fig}>
                <div className={trust.figBox}><KeysOnDeviceArt /></div>
                <figcaption className={trust.figCap}><span><b>Figure 1</b></span><span>Your keys stay with you. Our servers hold none.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <div className={`container-wide ${styles.layout}`}>
          <nav className={styles.toc} aria-label="On this page">
            <p className={styles.tocHead}>On this page</p>
            <ol>
              {TOC.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>)}
            </ol>
          </nav>

          <div className={styles.doc}>
            <section id="short" aria-labelledby="short-h">
              <h2 id="short-h">The short version</h2>
              <ul className={styles.short}>
                <li><strong>We never get your keys.</strong> Your recovery words and private keys are created in your browser and stay there, encrypted with your password. We cannot see them, and we cannot move your money.</li>
                <li><strong>No accounts.</strong> There is no sign-up, no email address and no profile. We do not know who uses MonkStash.</li>
                <li><strong>No cookies and no tracking.</strong> We use no analytics, no ads and no third-party scripts. Nothing follows you around the web.</li>
                <li><strong>One honest exception.</strong> To sync, your wallet talks to the Monero network through our relay. The relay sees your IP address and what your wallet asks the network for, never your keys or your balance. You can skip it by connecting your own node.</li>
              </ul>
            </section>

            <section id="map" aria-labelledby="map-h">
              <h2 id="map-h">Where your data lives</h2>
              <p>Everything MonkStash touches, where it is kept, and who can see it.</p>
              <table className={styles.table}>
                <thead>
                  <tr><th scope="col">What</th><th scope="col">Where it is kept</th><th scope="col">Who can see it</th></tr>
                </thead>
                <tbody>
                  {MAP.map((r) => <tr key={r.what}><td>{r.what}</td><td>{r.where}</td><td>{r.who}</td></tr>)}
                </tbody>
              </table>
            </section>

            <section id="device" aria-labelledby="device-h">
              <h2 id="device-h">What stays on your device</h2>
              <p>
                The wallet runs in your browser. When you create or restore a wallet, the recovery words and keys are made on your device and saved in your browser&apos;s storage, <mark>encrypted with the wallet password you choose</mark>. That password never leaves your device either, so we have no way to reset it or to open your wallet.
              </p>
              <p>
                A few details are saved without encryption: the wallet&apos;s name, its main address, its restore height, when it was created, and whether 2FA is turned on. The lock screen needs them to show you which wallet it is before you type your password. They cannot be used to spend, but anyone who can open your browser profile could read them.
              </p>
              <p>
                Using <em>Remove wallet</em> deletes all of this from the device. Two display preferences (whether amounts are hidden, and whether you bookmarked the wallet) stay until you clear your browser&apos;s site data. Your money is not affected: it lives on the Monero network, and your recovery words bring it back. See <Link className={trust.inlineLink} href="/back-up-monero-wallet">how to back up a Monero wallet</Link>.
              </p>
            </section>

            <section id="server" aria-labelledby="server-h">
              <h2 id="server-h">What our server sees</h2>
              <h3>The node relay</h3>
              <p>
                A wallet has to read the Monero blockchain through a Monero node. Most public nodes cannot be reached directly from a web page, so by default your wallet&apos;s requests pass through our relay on their way to a node.
              </p>
              <p>
                The relay sees your IP address, which blocks and outputs your wallet asks about, and, when you send, the finished transaction on its way to the network. Your wallet checks the blocks for your payments on your own device, so the relay never learns your balance, your addresses or your keys. A Monero transaction hides its amount and its receiver, but the relay could tell that your IP address sent one. <mark>We do not log any of this.</mark> The node at the other end sees the same requests, coming from our server instead of from you.
              </p>
              <p>
                For full privacy, connect your wallet to <Link className={trust.inlineLink} href="/run-a-monero-node">your own node</Link> in Settings. Then your wallet skips our relay entirely. Learn more about <Link className={trust.inlineLink} href="/monero-remote-node">what a remote node can see</Link>.
              </p>
              <h3>Prices, names and network numbers</h3>
              <p>
                To show values in your currency, the wallet asks our server for the current Monero price. That request carries no wallet data. Our server collects prices from public exchange feeds and the European Central Bank, so your browser never contacts them.
              </p>
              <p>
                When you send to a name such as an OpenAlias address, our server looks the name up through a DNS service (Cloudflare&apos;s, by default). The DNS service sees our server, not you, and we see only the name, not who is paying or how much. The fee calculator, mining calculator and donation page get network numbers from our server in the same way.
              </p>
              <h3>Floods and errors</h3>
              <p>
                To stop anyone from overloading the site, our server counts requests per IP address in one-minute windows. The counts are kept in memory only and forgotten after a minute. Our web server keeps no access logs. When something breaks, the server records the error, such as a node that did not answer, without your IP address.
              </p>
            </section>

            <section id="links" aria-labelledby="links-h">
              <h2 id="links-h">Payment links</h2>
              <p>
                A MonkStash payment link keeps the address, amount and note after the <code>#</code> sign. Browsers never send that part of a link to a server, so <mark>opening a payment link tells us nothing about the payment</mark>. Your browser reads it and draws the QR code on its own.
              </p>
              <p>
                <Link className={trust.inlineLink} href="/monero-payment-gateway">MonkStash Pay</Link>, the checkout for websites, runs on the merchant&apos;s own server. Invoices and orders stay with the merchant. We receive nothing from it.
              </p>
            </section>

            <section id="tracking" aria-labelledby="tracking-h">
              <h2 id="tracking-h">Cookies and tracking</h2>
              <p>
                MonkStash sets no cookies. There is no analytics, no advertising, no fingerprinting and no social media widgets. Our pages load scripts, fonts and images only from our own server, and our security settings tell your browser to refuse anything else.
              </p>
              <p>
                If we add visitor statistics later, they will be cookie-free counts of page views on the article pages only, never on the wallet. We will update this page before that happens.
              </p>
            </section>

            <section id="email" aria-labelledby="email-h">
              <h2 id="email-h">When you email us</h2>
              <p>
                Mail to our addresses passes through Cloudflare&apos;s email forwarding service to the team&apos;s inbox. We use what you write only to answer you, and we delete it when it is no longer needed. Never put your recovery words in an email: we will never ask for them, and anyone who does is a scammer.
              </p>
              <p>
                If you send a donation and ask to be listed as a supporter, we publish only the name you give us.
              </p>
            </section>

            <section id="others" aria-labelledby="others-h">
              <h2 id="others-h">Other services involved</h2>
              <ul>
                <li><strong>Monero nodes.</strong> The relay forwards wallet requests to public Monero nodes run by others. They see our server&apos;s address, not yours.</li>
                <li><strong>Our hosting company.</strong> The site runs on a server we rent and manage ourselves. The hosting company provides the machine and the network connection.</li>
                <li><strong>Cloudflare.</strong> Forwards our email, and answers name lookups for OpenAlias as described above.</li>
              </ul>
              <p>We do not sell, rent or share data with anyone, and we have none to sell.</p>
            </section>

            <section id="choices" aria-labelledby="choices-h">
              <h2 id="choices-h">Your choices</h2>
              <ul>
                <li>Connect your own node, so no wallet traffic reaches us.</li>
                <li>Use a view-only wallet on shared devices, so the browser never holds a key that can spend.</li>
                <li>Remove the wallet from a browser at any time. Keep your recovery words safe so you can bring it back.</li>
                <li>Use a VPN or Tor if you do not want our relay or a node to see your IP address.</li>
              </ul>
              <p>
                Wherever you live, you can ask what we hold about you or ask us to delete it. Apart from emails you have sent us, there is nothing we could link to you.
              </p>
            </section>

            <section id="changes" aria-labelledby="changes-h">
              <h2 id="changes-h">Changes and contact</h2>
              <p>
                When this policy changes, we update the date at the top of the page. Questions about privacy go to <a className={trust.inlineLink} href="mailto:hello@monkstash.com">hello@monkstash.com</a>. To report a security problem privately, write to <a className={trust.inlineLink} href="mailto:security@monkstash.com">security@monkstash.com</a>.
              </p>
              <div className={styles.next}>
                <Link className="btn btn-primary" href={walletUrl}>Open the wallet</Link>
                <Link className="btn btn-secondary" href="/about">How MonkStash is built</Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
