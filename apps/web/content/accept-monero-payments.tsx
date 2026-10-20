import Link from "next/link";
import { merchant } from "@/lib/merchant";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps } from "@/components/article/parts";
import { ChapterHead, DeepDive, FactStrip, UseCases, YoullLearn } from "@/components/pillar/parts";
import { Figure } from "@/components/art/Figure";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { SaleFlowArt, SaleFlowNarrow, SetupPickerArt, SetupPickerNarrow } from "@/components/art/MerchantArt";
import { PaymentClockArt } from "@/components/art/UseMoneroPillarArt";
import { PaymentClockNarrow } from "@/components/art/UseMoneroPillarNarrowArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "accept-monero-payments",
  section: "guides",
  layout: "pillar",
  kicker: "The merchant guide",
  title: "How to Accept Monero Payments (XMR): The Complete Merchant Guide",
  seoTitle: "How to Accept Monero Payments: Merchant Guide",
  h1: { keyword: "How to accept Monero payments", sizzle: "Get paid privately, with nobody in the middle." },
  summary: "How to accept Monero payments in a shop, online or by invoice: the setups, confirmations, pricing in your currency, refunds and records, with no middleman.",
  keyword: "accept monero payments",
  updated: "2026-10-17",
  readingMinutes: 17,
  toc: [
    { id: "how", label: "How accepting Monero works" },
    { id: "why", label: "Why accept Monero (and the honest downsides)" },
    { id: "setup", label: "Pick your setup" },
    { id: "in-person", label: "Accepting Monero in person" },
    { id: "online", label: "Accepting Monero in an online shop" },
    { id: "no-processor", label: "Accept Monero without a payment processor" },
    { id: "invoices", label: "Invoices and payment links" },
    { id: "final", label: "When is a payment final?" },
    { id: "price", label: "Pricing in your own currency" },
    { id: "refunds", label: "Refunds, overpayments and mistakes" },
    { id: "records", label: "Records, tax and the law" },
  ],
  chapterBlurbs: {
    how: "A fresh address per sale, and money straight into your wallet.",
    why: "No chargebacks, tiny fees, private customers. And three real trade-offs.",
    setup: "Payment links, a till on a tablet, or a checkout for your website.",
    "in-person": "Type a price, the customer scans, the screen turns green.",
    online: "Your own payment server, and a WooCommerce plugin on top.",
    "no-processor": "Wallet to wallet, nobody holding your money. Plus the honest Shopify answer.",
    invoices: "One link per job, priced in euros, paid from any wallet.",
    final: "Seen in seconds, confirmed in 2 minutes, spendable in 20.",
    price: "Hold the rate for the sale, then decide what to keep in XMR.",
    refunds: "No chargebacks means you decide. Here is how to do it well.",
    records: "Export your sales, keep your books, know where the rules apply.",
  },
  related: ["receive-monero", "monero-subaddress", "monero-transaction-time", "monero-view-only-wallet", "is-monero-legal", "monero-transaction-fee"],
  faq: [
    { q: "How do I accept Monero payments?", a: "Give each customer a fresh subaddress and the exact amount, usually as a QR code, and wait for the payment to arrive in your wallet. MonkStash does this with payment links, a browser till for shops, or a self-hosted checkout for websites." },
    { q: "How do I accept Monero on my website?", a: "Use a payment gateway that creates an invoice per order and tells your shop when it is paid. BTCPay Server with its Monero plugin works today. MonkStash Pay, a free, self-hosted option with a view-only wallet, is in testing: its code is open source and it is built and tested on stagenet, but it has not had an independent security review yet." },
    { q: "How long does a Monero payment take for a merchant?", a: "Your wallet sees it within seconds, the first confirmation comes in about 2 minutes, and the money is spendable after 10 blocks, about 20 minutes. Small sums are often accepted as soon as they are seen." },
    { q: "Can a Monero payment be charged back?", a: "No. Once confirmed, a Monero payment cannot be reversed. Refunds are new payments from you to an address the customer gives you." },
    { q: "Do I pay fees to receive Monero?", a: "No. The network fee is paid by the sender and is usually around one or two cents. MonkStash adds no fee." },
    { q: "Can I accept Monero on Shopify?", a: "Not natively. Shopify accepts crypto only through third-party providers, and its help page does not mention Monero (checked 15 October 2026). You can add a manual payment method, send the customer a Monero payment link, and mark the order paid when the XMR arrives." },
    { q: "Can I accept Monero without a payment processor?", a: "Yes. Monero goes straight from the customer's wallet to yours. Give each customer a fresh subaddress and the exact amount as a QR code or payment link, and check your wallet for the payment. No processor ever holds your money." },
    { q: "Is it legal for a business to accept Monero?", a: "In many countries, yes, but rules differ and change. From 2027, regulated exchanges in the EU may not handle privacy coins, which affects converting XMR there. Check with a local adviser." },
  ],
  sources: [
    { label: "Monero project: Accepting Monero (confirmations before spending)", href: "https://www.getmonero.org/get-started/accepting/" },
    { label: "Monero docs: Subaddresses", href: "https://docs.getmonero.org/public-address/subaddress/" },
    { label: "Monero URI scheme (tx_amount, tx_description, recipient_name)", href: "https://github.com/monero-project/monero/blob/master/docs/URI_SCHEME.md" },
    { label: "Monero source: cryptonote_config.h (120-second blocks, 10-block spendable age)", href: "https://raw.githubusercontent.com/monero-project/monero/master/src/cryptonote_config.h" },
    { label: "Monero user guide: How to prove a payment", href: "https://www.getmonero.org/resources/user-guides/prove-payment.html" },
    { label: "Monero project: Merchants and services that accept XMR", href: "https://www.getmonero.org/community/merchants/" },
    { label: "CCS: BTCPay Server Monero plugin proposal and milestones", href: "https://ccs.getmonero.org/proposals/btcpayserver-plugin.html" },
    { label: "monero-integrations/monerowp: the older WooCommerce gateway and its open issues", href: "https://github.com/monero-integrations/monerowp" },
    { label: "Shopify Help Center: Accepting cryptocurrency (third-party providers)", href: "https://help.shopify.com/en/manual/payments/additional-payment-methods/cryptocurrency" },
    { label: "Shopify Help Center: Manual payment methods", href: "https://help.shopify.com/en/manual/payments/manual-payments" },
    { label: "Cointelegraph: EU rules on anonymity-enhancing coins for regulated providers from 2027", href: "https://cointelegraph.com/news/eu-crypto-ban-anonymous-privacy-tokens-2027" },
  ],
};

export function Hero() {
  return <Adaptive wide={<SaleFlowArt />} narrow={<SaleFlowNarrow />} />;
}

export function Body() {
  return (
    <>
      <p>
        <strong>To accept Monero payments</strong>, you give each customer a fresh address and an exact amount, they pay from any
        Monero wallet, and the money lands <mark>straight in your own wallet</mark>. No payment processor holds it, no account can be
        frozen, and no customer can claw it back with a chargeback. This guide shows you the three ways to set it up, from a single
        invoice link to a full online checkout, and the details that matter once real money comes in.
      </p>

      <YoullLearn items={[
        <>Which setup fits you: a payment link, a till at the counter, or a checkout on your website</>,
        <>How to price in euros or dollars without losing money to the exchange rate</>,
        <>When a Monero payment is safe to treat as paid, and when to wait</>,
        <>How to handle refunds, overpayments and late payments without a chargeback system</>,
        <>What to keep for your books, and where the rules are changing</>,
      ]} />
      <p>Let&apos;s dive in.</p>

      {/* 1 */}
      <ChapterHead n={1} id="how" title="How accepting Monero works" />
      <p>
        Every Monero wallet can make as many <Link href="/monero-subaddress">subaddresses</Link> as you like. They all pay into the same
        wallet, but nobody outside can link them to each other. That one feature is the whole trick behind accepting Monero well:
        <mark>one fresh address per sale</mark>.
      </p>
      <Steps items={[
        { title: "Set the price", body: <>In XMR, or in your own currency converted at a live rate that is held for the sale.</> },
        { title: "Show a fresh address", body: <>As a QR code, a link or a checkout page. The amount is built into the QR, so the customer does not type it.</> },
        { title: "The customer pays", body: <>From any Monero wallet: Cake, Feather, the official GUI, MonkStash, anything.</> },
        { title: "The sale is marked paid", body: <>Because the address belongs to that sale only, your wallet knows exactly which order the money is for.</> },
      ]} />
      <p>
        That last point is more important than it looks. Some older Monero shop plugins match payments by amount. If two customers
        buy the same €20 item, <mark>one payment can mark both orders as paid</mark>. Matching by address makes that impossible.
      </p>
      <FactStrip items={[
        { value: "0", label: "chargebacks: payments cannot be reversed" },
        { value: "~2 min", label: "to the first confirmation" },
        { value: "~20 min", label: "until the money is spendable" },
        { value: "1 per sale", label: "fresh address, so sales never get confused" },
      ]} />

      {/* 2 */}
      <ChapterHead n={2} id="why" title="Why accept Monero (and the honest downsides)" />
      <p>Card payments are easy to start and expensive to keep. Monero flips that. Here is what you get:</p>
      <UseCases items={[
        { icon: "shield", title: "No chargebacks", body: <>Once a payment confirms, it is final. Nobody can reverse it weeks later.</> },
        { icon: "paid", title: "Fees close to zero", body: <>The network fee is paid by the sender, not you, and is usually around one or two cents. See the <Link href="/tools/monero-fee-calculator">fee calculator</Link>.</> },
        { icon: "save", title: "Nobody can freeze it", body: <>The money is in your wallet, not a processor&apos;s account that can be closed.</> },
        { icon: "world", title: "Customers anywhere", body: <>Anyone with an internet connection can pay you, without a bank or a card.</> },
        { icon: "give", title: "Private for your customers", body: <>Amounts and addresses are hidden on the blockchain, so paying you does not publish their spending.</> },
        { icon: "shop", title: "Private for you", body: <>Competitors cannot add up your sales by watching an address, the way they can with Bitcoin.</> },
      ]} />
      <p>Now the trade-offs, because they are real:</p>
      <ul>
        <li><strong>The price of XMR moves.</strong> If you hold what you earn, its value in euros goes up and down. Chapter 8 covers how to handle that.</li>
        <li><strong>Fewer customers have it.</strong> Monero works best as an extra option next to what you already accept, and for audiences that care about privacy.</li>
        <li><strong>Cashing out is getting harder in some places.</strong> Several large exchanges have dropped XMR. Chapter 10 explains what that means for you.</li>
      </ul>
      <KeyFact label="Who it fits best">
        VPNs and hosting, software and digital goods, freelancers with international clients, privacy-minded communities, and any shop
        tired of chargeback fraud.
      </KeyFact>

      {/* 3 */}
      <ChapterHead n={3} id="setup" title="Pick your setup" />
      <p>
        MonkStash gives you three ways to accept Monero. They share the same rules for prices and confirmations, and in all three
        <mark>the key that can see your sales stays on a device you own</mark>.
      </p>
      <Figure caption="Three setups, one rule: a fresh address per sale, and your sales stay on your devices.">
        <Adaptive wide={<SetupPickerArt />} narrow={<SetupPickerNarrow />} />
      </Figure>
      <table>
        <thead>
          <tr><th>Setup</th><th>Best for</th><th>What you need</th><th>Where the view key lives</th></tr>
        </thead>
        <tbody>
          <tr><td><Link href="/monero-payment-link">Payment links</Link></td><td>Freelancers, creators, one-off invoices</td><td>Just the <Link href={walletUrl}>MonkStash wallet</Link></td><td>Your wallet</td></tr>
          <tr><td><Link href="/monero-pos">Cashier mode</Link></td><td>Shops, cafes, market stalls</td><td>A tablet or phone at the counter</td><td>The till device</td></tr>
          <tr><td><Link href="/monero-payment-gateway">MonkStash Pay</Link></td><td>Online shops and apps (in testing)</td><td>A small server you run (Docker or Node)</td><td>Your server</td></tr>
        </tbody>
      </table>
      <p>
        A <Link href="/monero-view-key">view key</Link> lets software see incoming payments without being able to spend them. That is why
        we use it for tills and shop servers: <mark>if one of them is lost or hacked, your money stays put</mark>.
      </p>

      {/* 4 */}
      <ChapterHead n={4} id="in-person" title="Accepting Monero in person" />
      <p>
        For a counter, use <Link href="/monero-pos">cashier mode</Link> in the MonkStash wallet. It turns a tablet or phone into a till:
        you type a price in your currency, a QR code appears, the customer scans it, and the screen turns green when the payment is seen.
        Each sale gets its own address, and the sales list is kept encrypted on the device.
      </p>
      <p>
        Run the till on a <Link href="/monero-view-only-wallet">watch-only wallet</Link>. It sees payments but cannot spend, so a stolen
        tablet costs you a tablet, not your takings. Leaving the till needs your wallet password, so staff cannot open the wallet itself.
      </p>
      <DeepDive paths={["/monero-pos", "/monero-view-only-wallet"]} />

      {/* 5 */}
      <ChapterHead n={5} id="online" title="Accepting Monero in an online shop" />
      <p>
        An online shop needs something that creates an invoice for every order and tells the shop when it is paid, even when you are
        asleep. That is what <Link href="/monero-payment-gateway">MonkStash Pay</Link> does: a small payment server you run yourself.
        It is an early version: built and tested on stagenet, Monero&apos;s test network, with its{" "}
        <a href={merchant.payRepoUrl} rel="noopener">code open source</a> for anyone to read and self-host. It has not had an independent
        security review yet, so start with small amounts. If you want a mature self-hosted option today, BTCPay Server with its Monero plugin is it.
      </p>
      <ul>
        <li>Your shop asks it for an invoice. It returns a checkout link with a fresh address and a held price.</li>
        <li>The customer pays on that checkout page, which shows the QR code, the exact amount and a live status.</li>
        <li>When the payment confirms, it sends your shop a signed message, and the order completes itself.</li>
      </ul>
      <p>
        It runs on your server with a view-only wallet. <mark>No MonkStash company server is in the middle</mark>, and nothing on it can
        spend your money. On WordPress, the coming <Link href="/monero-woocommerce">WooCommerce plugin</Link> will connect your store to it
        with three settings.
      </p>
      <Callout title="How this compares to what exists">
        BTCPay Server has a community Monero plugin; it is solid but asks you to run BTCPay plus a Monero node. The older WooCommerce
        gateway (monerowp) can check payments through a third-party block explorer using your view key, and several of its issues are
        still open. MonkStash Pay aims for the middle: self-hosted and private, but light enough to run on a small server.
      </Callout>
      <DeepDive paths={["/monero-payment-gateway", "/monero-woocommerce"]} />

      {/* 6 */}
      <ChapterHead n={6} id="no-processor" title="Accept Monero without a payment processor" />
      <p>
        With cards, a processor sits between you and every sale. With Monero <mark>you can skip it entirely</mark>: the
        customer&apos;s wallet pays your wallet, and the money is yours the moment it arrives. All you need is a wallet, a fresh
        address per sale and a way to show it. Our{" "}
        <Link href="/tools/monero-qr-code-generator">Monero QR code generator</Link> turns an address and amount into a code a
        customer can scan.
      </p>
      <p>
        A hosted payment processor can still be convenient, but know the trade-off. It sees your orders and your customers&apos;
        payment details, and a custodial one holds your money before paying you out. Self-hosted options keep that data with
        you: MonkStash payment links and cashier mode today, BTCPay Server with its Monero plugin, and MonkStash Pay once it is
        released.
      </p>
      <h3>Can I accept Monero on Shopify?</h3>
      <p>
        Not natively. Shopify&apos;s{" "}
        <a href="https://help.shopify.com/en/manual/payments/additional-payment-methods/cryptocurrency" rel="noopener">help page on cryptocurrency</a>{" "}
        says crypto is accepted through third-party providers you activate, and Monero is not mentioned on it (checked 15
        October 2026). The workaround that keeps you in control is a{" "}
        <a href="https://help.shopify.com/en/manual/payments/manual-payments" rel="noopener">manual payment method</a>: the order
        is placed as pending, you send the customer a <Link href="/monero-payment-link">Monero payment link</Link>, and you mark
        the order paid when the XMR arrives. It is manual work, so it suits shops with a modest number of Monero orders.
      </p>

      {/* 7 */}
      <ChapterHead n={7} id="invoices" title="Invoices and payment links" />
      <p>
        No shop, just a client who owes you? Make a <Link href="/monero-payment-link">payment link</Link> in the wallet. You set the amount
        (in XMR, or in euros or dollars at a held rate), add a note like &quot;Logo design&quot;, and choose when it expires. The client opens
        the link, sees the price and a QR code, and pays from any wallet. The request is marked paid in your wallet when the money arrives.
      </p>
      <p>
        The details live in the part of the link after the <code>#</code>, which browsers never send to a server. So <mark>MonkStash
        never sees who you invoiced or for how much</mark>. You can also turn a request into a &quot;Pay with Monero&quot; button for your
        website, in plain HTML with no tracking. Need just a code for a printed invoice or a counter sign? Use the{" "}
        <Link href="/tools/monero-qr-code-generator">QR code generator</Link>.
      </p>
      <DeepDive paths={["/monero-payment-link", "/receive-monero"]} />

      {/* 8 */}
      <ChapterHead n={8} id="final" title="When is a payment final?" />
      <p>
        A Monero payment goes through three moments: your wallet sees it within seconds, it gets its first confirmation in the next block
        (about 2 minutes), and after 10 blocks (about 20 minutes) you can spend it.
      </p>
      <Figure caption="The clock of one payment. Block times vary; these are averages.">
        <Adaptive wide={<PaymentClockArt />} narrow={<PaymentClockNarrow />} />
      </Figure>
      <p>
        You do not have to wait 20 minutes to hand over a coffee. How long you wait is a business decision: an unconfirmed payment could
        in theory be double-spent, so the right wait depends on the amount. MonkStash uses three presets:
      </p>
      <table>
        <thead>
          <tr><th>Preset</th><th>Rule</th><th>Good for</th></tr>
        </thead>
        <tbody>
          <tr><td>Quick</td><td>Up to 0.1 XMR: paid when seen. Up to 1 XMR: 1 confirmation. Above: 10</td><td>Cafes, small items at a counter</td></tr>
          <tr><td>Standard</td><td>1 confirmation. Over 5 XMR: 10 confirmations</td><td>Most online orders</td></tr>
          <tr><td>Safe</td><td>10 confirmations, when the coins become spendable</td><td>Expensive goods, anything you cannot take back</td></tr>
        </tbody>
      </table>
      <p>
        Ten confirmations is the usual line, not a guarantee. In September 2025 the network rolled back 18 blocks, deeper than 10, and
        the Monero Research Lab advised waiting longer for large amounts. For a sale you could not afford to lose, wait for more
        confirmations than the Safe preset before you hand over the goods.
      </p>
      <DeepDive paths={["/monero-transaction-time"]} />

      {/* 9 */}
      <ChapterHead n={9} id="price" title="Pricing in your own currency" />
      <p>
        Most shops think in euros or dollars. MonkStash converts your price into XMR at a live rate and <mark>holds that rate for the
        sale</mark>: 15 minutes at a till, 30 minutes for online orders by default, or whatever you choose for a payment link. The rate is
        the middle of several exchanges, so one bad price feed cannot short-change you.
      </p>
      <p>If a payment arrives after the hold ends, it is not marked paid automatically. It is flagged as late, and you decide.</p>
      <p>After that, what you do with the XMR is up to you:</p>
      <ul>
        <li><strong>Keep it</strong> if you want to spend it or save in it, and accept that its value moves.</li>
        <li><strong>Convert some or all of it</strong> on a schedule, so price swings never matter much. See <Link href="/buy-monero">where people trade XMR</Link>.</li>
      </ul>

      {/* 10 */}
      <ChapterHead n={10} id="refunds" title="Refunds, overpayments and mistakes" />
      <p>
        Monero payments cannot be reversed, and they <mark>do not show you who sent them</mark>. So a refund is a new payment from you to
        an address the customer gives you. Good practice:
      </p>
      <ul>
        <li><strong>Ask for a refund address</strong> in writing, and send to exactly that.</li>
        <li><strong>Overpaid?</strong> MonkStash shows the extra amount on the sale. Offer to send it back the same way.</li>
        <li><strong>Underpaid?</strong> The checkout or till asks for the rest, to the same address, so it adds up automatically.</li>
        <li><strong>Need proof?</strong> A customer can prove a payment with the transaction key from their wallet; see <Link href="/monero-transaction-lookup">how to check a transaction</Link>.</li>
      </ul>

      {/* 11 */}
      <ChapterHead n={11} id="records" title="Records, tax and the law" />
      <p>
        Accepting Monero is a sale like any other, and most tax systems treat it that way. Keep the records your accountant needs:
        MonkStash exports your sales, payment requests and wallet history as CSV files, with the price, the rate used, the XMR received
        and the transaction ID. The files are made in your browser and saved to your device.
      </p>
      <p>
        On the rules: from July 2027, regulated exchanges and custodians in the EU may not handle anonymity-enhancing coins like Monero.
        That limits <em>where you can convert</em> XMR in the EU. It does not, on its own, stop a business from receiving payments into
        its own wallet. Our guide to <Link href="/monero-eu-2027">Monero and the EU&apos;s 2027 rules</Link> explains what changes.
        Rules differ by country and change, so check with a local adviser before you start, and read our{" "}
        <Link href="/is-monero-legal">country-by-country guide to whether Monero is legal</Link>.
      </p>
      <Callout kind="warn" title="This is not legal or tax advice">
        We explain how the tools work. For your own situation, especially tax, talk to a professional who knows your country.
      </Callout>
      <DeepDive paths={["/is-monero-legal"]} />
    </>
  );
}
