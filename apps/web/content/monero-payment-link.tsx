import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { PayLinkArt } from "@/components/art/MerchantArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-payment-link",
  section: "guides",
  kicker: "Invoices",
  title: "Monero Payment Link: Invoice in XMR or EUR, Paid From Any Wallet",
  seoTitle: "Monero Payment Link: Invoice in XMR or EUR",
  summary: "Create a Monero payment link or invoice in seconds: set an amount in XMR or your currency, share the link or QR, and see it marked paid. Private by design.",
  keyword: "monero payment link",
  updated: "2026-10-17",
  readingMinutes: 7,
  toc: [
    { id: "what", label: "What a Monero payment link is" },
    { id: "make", label: "Send a Monero invoice" },
    { id: "payer", label: "What your client sees" },
    { id: "options", label: "Prices, expiry and return links" },
    { id: "button", label: "A Pay with Monero button for your site" },
    { id: "private", label: "Why it stays private" },
    { id: "status", label: "Knowing when you are paid" },
  ],
  related: ["accept-monero-payments", "receive-monero", "monero-subaddress", "monero-transaction-time", "send-monero"],
  faq: [
    { q: "How do I create a Monero payment link?", a: "In the MonkStash wallet, go to Receive, choose Request a payment, enter the amount and what it is for, and tap Create. Copy the link or show the QR code." },
    { q: "How do I send a Monero invoice?", a: "Create a payment link in the MonkStash wallet with the amount (in XMR or your own currency) and a note such as the invoice number, then send the link by email or chat. Your client pays from any Monero wallet, and the request is marked paid when the XMR arrives." },
    { q: "Can the payer use any Monero wallet?", a: "Yes. The link page shows a standard Monero QR code and an Open in my wallet button that work with Cake, Feather, the official wallets and others. They can also copy the address and amount." },
    { q: "Can I invoice in euros or dollars?", a: "Yes. Pick a currency, and the amount is converted to XMR at today's rate and held until the link expires. The client sees both the euro price and the exact XMR amount." },
    { q: "Does MonkStash see my invoices?", a: "No. The details are in the part of the link after the #, which browsers never send to a server. They are read on the payer's device." },
    { q: "What is a monero: link?", a: "The standard Monero payment URI, like monero:ADDRESS?tx_amount=0.25. Wallets read it to fill in the address and amount. MonkStash payment links contain one." },
  ],
  sources: [
    { label: "Monero URI scheme (tx_amount, tx_description, recipient_name)", href: "https://github.com/monero-project/monero/blob/master/docs/URI_SCHEME.md" },
    { label: "Monero wallet RPC: make_uri and parse_uri", href: "https://www.getmonero.org/resources/developer-guides/wallet-rpc.html" },
    { label: "Monero docs: Subaddresses", href: "https://docs.getmonero.org/public-address/subaddress/" },
    { label: "MDN Web Docs: URI fragment (not sent to the server)", href: "https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A <strong>Monero payment link</strong> is the simplest way to send a Monero invoice. You set an amount, add what it is for, and send one
        link. Your client opens it, scans the QR code or taps <em>Open in my wallet</em>, and pays from any Monero wallet. Each link has
        <mark>its own fresh address</mark>, so your wallet marks it paid by itself.
      </p>

      <Takeaways items={[
        "Make a link in seconds in the free MonkStash wallet.",
        "Price it in XMR, or in euros or dollars at a held rate.",
        "Payers use any Monero wallet; nothing to install.",
        "The details stay in the link; MonkStash never sees them.",
      ]} />

      <Figure caption="What your client sees: the price, a QR code, and a way back to you.">
        <PayLinkArt />
      </Figure>

      <h2 id="what">What a Monero payment link is</h2>
      <p>
        Monero has a{" "}
        <a href="https://github.com/monero-project/monero/blob/master/docs/URI_SCHEME.md" rel="noopener">standard way to write a payment request</a>: a <code>monero:</code> link with the address and amount inside, like{" "}
        <code>monero:8...?tx_amount=0.25&amp;tx_description=Logo</code>. Wallets read it to fill in the payment for you. A MonkStash payment
        link wraps that request in a clean page anyone can open in a browser, with the price, a QR code and safety notes.
      </p>

      <h2 id="make">Send a Monero invoice</h2>
      <p>A payment link is your Monero invoice. Making one takes four steps:</p>
      <Steps items={[
        { title: "Open Receive", body: <>In the <Link href={walletUrl}>MonkStash wallet</Link>, go to <em>Receive</em> and choose <em>Request a payment</em>.</> },
        { title: "Set the amount", body: <>In XMR, or pick EUR, USD, GBP and others. Leave it empty for &quot;any amount&quot;.</> },
        { title: "Say what it is for", body: <>A short note such as &quot;Logo design&quot;. It shows on the payment page and in the client&apos;s wallet.</> },
        { title: "Share it", body: <>Copy the link, share it from your phone, or show the QR code.</> },
      ]} />

      <h2 id="payer">What your client sees</h2>
      <ul>
        <li>Who is asking, the price, and the exact XMR amount to send.</li>
        <li>A QR code and an <em>Open in my wallet</em> button that fill everything in.</li>
        <li>The address with a copy button, and the first and last characters to check.</li>
        <li>A clear warning if the link is for the test network, and an <em>expired</em> page if it is past its date.</li>
      </ul>
      <p>
        Payers can use any wallet. The QR code and wallet button contain only the standard Monero request, so every wallet understands
        them.
      </p>

      <h2 id="options">Prices, expiry and return links</h2>
      <table>
        <thead><tr><th>Option</th><th>What it does</th></tr></thead>
        <tbody>
          <tr><td>Currency</td><td>Price in XMR, or in your currency converted at today&apos;s rate (the middle of several exchanges)</td></tr>
          <tr><td>Expiry</td><td>Never, 1 hour, 24 hours, 7 days or 30 days. Prices in your currency default to 24 hours, because the rate is held until then</td></tr>
          <tr><td>Your name or shop</td><td>Shown to the payer, and in their wallet as who they are paying</td></tr>
          <tr><td>Return link</td><td>An https address the payer can go back to afterwards, like your thank-you page</td></tr>
        </tbody>
      </table>
      <p>
        After the expiry, the page tells the client not to pay and to ask you for a new link, so nobody pays at an old rate by accident.
      </p>

      <h2 id="button">A Pay with Monero button for your site</h2>
      <p>
        Every request can become a <strong>Pay with Monero</strong> button: tap <em>Website button</em> and copy the code. It is plain
        HTML, with no scripts and no tracking, and there is a Markdown version for forums and READMEs.
      </p>
      <p>
        Only need a QR code, say for a PDF invoice or a printed sign? The{" "}
        <Link href="/tools/monero-qr-code-generator">Monero QR code generator</Link> makes one from an address and amount.
      </p>
      <Callout title="One button, one address">
        A button always opens the same request and address. That is ideal for a tip jar, donations or a single product. For separate
        orders, make a new request each time, or use <Link href="/monero-payment-gateway">MonkStash Pay</Link> (an early, open-source version in testing), which
        creates a fresh address for every order automatically (with a{" "}
        <Link href="/monero-woocommerce">plugin for WordPress stores</Link>).
      </Callout>

      <h2 id="private">Why it stays private</h2>
      <p>
        Everything about the request lives in the part of the link after the <code>#</code>. Browsers never send that part to a server,
        so <mark>MonkStash cannot see who you invoiced or for how much</mark>. The page reads it on the payer&apos;s device. And because each
        request has its own <Link href="/monero-subaddress">subaddress</Link>, one client cannot see what anyone else paid you.
      </p>

      <h2 id="status">Knowing when you are paid</h2>
      <p>Your request list shows each link&apos;s status as it changes:</p>
      <ul>
        <li><strong>Waiting for payment</strong>, then <strong>Payment arriving</strong> within seconds of the client sending.</li>
        <li><strong>Paid, confirming</strong> as blocks come in, then <strong>Paid</strong> after 10 confirmations, about 20 minutes.</li>
        <li><strong>Partly paid</strong> if less arrived, and <strong>Paid after it expired</strong> if money came late.</li>
      </ul>
      <p>
        Need the records? <strong>Export CSV</strong> gives your accountant every request, its price, rate and transaction ID. More on
        getting paid in the <Link href="/accept-monero-payments">merchant guide</Link>.
      </p>
    </>
  );
}
