import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { TillArt } from "@/components/art/MerchantArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-pos",
  section: "guides",
  kicker: "For shops and cafes",
  title: "Monero POS: Accept XMR at Your Counter with a Free Browser Till",
  seoTitle: "Monero Point of Sale (POS): Free Browser Till",
  summary: "A free Monero point of sale in your browser: type a price in your currency, the customer scans, the screen turns green. No server, no account, no app store.",
  keyword: "monero point of sale",
  updated: "2026-10-17",
  readingMinutes: 8,
  toc: [
    { id: "what", label: "What cashier mode is" },
    { id: "setup", label: "Set up your till in 5 minutes" },
    { id: "sale", label: "Taking a payment" },
    { id: "when", label: "When to hand over the goods" },
    { id: "messy", label: "Underpaid, late or cancelled sales" },
    { id: "safe", label: "Keeping the till safe" },
    { id: "close", label: "End of the day" },
  ],
  related: ["accept-monero-payments", "monero-view-only-wallet", "monero-transaction-time", "monero-subaddress", "receive-monero"],
  faq: [
    { q: "Is there a free Monero POS?", a: "Yes. MonkStash cashier mode is a free point of sale that runs in the browser of any tablet or phone. There is nothing to install and no account to create." },
    { q: "Do I need a server for a Monero point of sale?", a: "No. Cashier mode runs entirely on the device at your counter, using your own wallet. It connects to a Monero node to see payments, like any wallet." },
    { q: "How long does a Monero payment take at a till?", a: "The till sees a payment within seconds. Small sums can be accepted right away; larger ones can wait for the first confirmation, about 2 minutes. You choose the rule." },
    { q: "Can staff steal from a Monero till?", a: "Not if you run the till on a watch-only wallet. It can see payments but cannot spend, and leaving cashier mode needs the wallet password." },
    { q: "Can I price in euros or dollars?", a: "Yes. Type the price in your currency; the till converts it to XMR at a live rate and holds that rate for 15 minutes per sale." },
  ],
  sources: [
    { label: "Monero project: Accepting Monero (merchant tools, QR codes, 10 confirmations before spending)", href: "https://www.getmonero.org/get-started/accepting/" },
    { label: "Monero user guide: Making a view-only wallet (cannot spend)", href: "https://www.getmonero.org/resources/user-guides/view_only.html" },
    { label: "Monero docs: Subaddresses", href: "https://docs.getmonero.org/public-address/subaddress/" },
    { label: "Monero source code: 10-block spendable age and 2-minute block target (cryptonote_config.h)", href: "https://github.com/monero-project/monero/blob/master/src/cryptonote_config.h" },
    { label: "MDN Web Docs: Screen Wake Lock API (keeping the screen on)", href: "https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A <strong>Monero point of sale</strong> does not need special hardware or a monthly fee. <mark>Cashier mode</mark> in the free
        MonkStash wallet turns any tablet or phone into a till: type the price, the customer scans a QR code with their wallet, and the
        screen turns green when the payment arrives. It runs in the browser, keeps your sales on the device, and works with a wallet that
        cannot spend, so a stolen tablet never costs you your takings.
      </p>

      <Takeaways items={[
        "Free, in the browser: nothing to install, no account, no server.",
        "Prices in your currency, converted at a live rate held for 15 minutes.",
        "A fresh address per sale, so every payment matches the right sale.",
        "Run it on a watch-only wallet: it sees payments but cannot spend.",
      ]} />

      <Figure caption="Type the price, the customer scans, the screen turns green.">
        <TillArt />
      </Figure>

      <h2 id="what">What cashier mode is</h2>
      <p>
        Cashier mode is a full-screen till inside the <Link href={walletUrl}>MonkStash web wallet</Link>. It is built for the counter: a
        big number pad, a big QR code, a countdown while the price is held, and an unmistakable green <strong>Paid</strong> screen.
      </p>
      <p>
        Behind the scenes, each sale gets its own <Link href="/monero-subaddress">subaddress</Link> with the exact amount in the QR code.
        That is why the till always knows which sale a payment belongs to, even if two customers buy the same thing at the same time.
      </p>

      <h2 id="setup">Set up your till in 5 minutes</h2>
      <Steps items={[
        { title: "Make a watch-only copy of your shop wallet", body: <>On the till device, open the wallet and choose <em>Add a watch-only wallet</em>. Enter your shop wallet&apos;s address and private view key. Your seed stays at home. See <Link href="/monero-view-only-wallet">how watch-only wallets work</Link>.</> },
        { title: "Open cashier mode", body: <>Go to <em>Receive</em> and tap <em>Open cashier mode</em>.</> },
        { title: "Set it up once", body: <>Your shop name (shown in the customer&apos;s wallet), your currency, and when a sale counts as paid.</> },
        { title: "Do a test sale", body: <>Charge a small amount and pay it from your own phone, so you see the whole flow before the first customer.</> },
      ]} />

      <h2 id="sale">Taking a payment</h2>
      <ol>
        <li>Type the price on the keypad. The till shows roughly how much XMR that is.</li>
        <li>Add a reference if you like, such as &quot;Table 4&quot;.</li>
        <li>Tap <strong>Charge</strong>. A QR code appears with the exact amount, and the price is held for 15 minutes.</li>
        <li>The customer scans and pays. Within seconds the till sees it.</li>
        <li>When your rule is met, the screen turns green. Tap <strong>New sale</strong>.</li>
      </ol>
      <p>
        If a payment needs a confirmation or two, you do not have to wait at the counter. Tap <em>Next sale</em>; the earlier one keeps
        updating in the <em>Sales</em> list.
      </p>

      <h2 id="when">When to hand over the goods</h2>
      <p>
        A payment is seen in seconds, confirmed in about 2 minutes, and{" "}
        <a href="https://www.getmonero.org/get-started/accepting/" rel="noopener">spendable after about 20</a>. You choose how long to wait, by amount:
      </p>
      <table>
        <thead><tr><th>Preset</th><th>Rule</th></tr></thead>
        <tbody>
          <tr><td>Quick (default for tills)</td><td>Up to 0.1 XMR: paid when seen. Up to 1 XMR: 1 confirmation. Above: 10</td></tr>
          <tr><td>Standard</td><td>1 confirmation. Over 5 XMR: 10 confirmations</td></tr>
          <tr><td>Safe</td><td>10 confirmations, about 20 minutes</td></tr>
        </tbody>
      </table>
      <p>
        Accepting a coffee as soon as it is seen is a small, sensible risk. For a laptop, wait. More on timing in{" "}
        <Link href="/monero-transaction-time">how long Monero transactions take</Link>.
      </p>

      <h2 id="messy">Underpaid, late or cancelled sales</h2>
      <ul>
        <li><strong>Underpaid:</strong> the till shows how much is still owed, and the QR code asks for the rest, to the same address.</li>
        <li><strong>Overpaid:</strong> the Paid screen says how much extra arrived, so you can offer it back.</li>
        <li><strong>Paid after the price hold ended:</strong> the till does not mark it paid on its own. You choose <em>Accept as paid</em> or <em>Needs refund</em>.</li>
        <li><strong>Cancelled, then paid anyway:</strong> the sale is flagged for review instead of hiding behind &quot;Cancelled&quot;.</li>
      </ul>
      <p>For a refund, ask the customer for an address: Monero does not show you who sent a payment.</p>

      <h2 id="safe">Keeping the till safe</h2>
      <ul>
        <li><strong>Watch-only on the till.</strong> It sees payments but has no spend key. Losing the tablet loses the tablet, not your money.</li>
        <li><strong>Password to leave.</strong> Exiting cashier mode asks for the wallet password, so staff cannot open the wallet itself.</li>
        <li><strong>Stays awake, stays open.</strong> The screen is kept on (where the browser allows it), and a watch-only till does not lock itself between customers.</li>
        <li><strong>Private by design.</strong> The sales list is encrypted on the device. No MonkStash server sees your sales.</li>
      </ul>
      <Callout kind="warn" title="Do not run the till on your main wallet">
        A full wallet works, but it can spend, and it locks itself after a few idle minutes to protect you. Use a watch-only copy at the
        counter, and keep the full wallet somewhere safe.
      </Callout>

      <h2 id="close">End of the day</h2>
      <p>
        The <em>Sales</em> list groups sales by day with totals in your currency and in XMR. Tap <strong>Export CSV</strong> for a file
        your accountant can open: time, reference, price, rate, XMR received and transaction ID for every sale. The file is created on the
        device and saved there, so keep it somewhere safe.
      </p>
      <KeyFact label="Also selling online?">
        Send a <Link href="/monero-payment-link">payment link</Link> for one-off orders today. Website checkout is in testing:{" "}
        <Link href="/monero-payment-gateway">MonkStash Pay</Link> and a{" "}
        <Link href="/monero-woocommerce">Monero plugin for WooCommerce shops</Link> are built and tested on stagenet, and their code is open source, but they are early versions. Start with the full{" "}
        <Link href="/accept-monero-payments">merchant guide</Link>.
      </KeyFact>
    </>
  );
}
