import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { SellP2pStepsArt } from "@/components/art/SellMoneroArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "sell-monero",
  section: "guides",
  kicker: "Cash out",
  title: "How to Sell Monero (XMR) for Cash, Bank Transfer or Bitcoin",
  seoTitle: "How to Sell Monero (XMR) and Cash Out",
  summary: "How to sell Monero: peer-to-peer for bank transfer or cash, swaps to bitcoin, exchanges that still take XMR, plus the records, taxes and scams to know.",
  keyword: "how to sell monero",
  updated: "2026-10-25",
  readingMinutes: 10,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "decide", label: "Which route fits you" },
    { id: "before", label: "Before you sell anything" },
    { id: "p2p", label: "Sell peer to peer on RetoSwap" },
    { id: "bitcoin", label: "Sell Monero for bitcoin" },
    { id: "exchange", label: "Sell on a regulated exchange" },
    { id: "instant", label: "Instant exchanges" },
    { id: "cash", label: "Cash in person and ATMs" },
    { id: "records", label: "Keep proof of every payment" },
    { id: "taxes", label: "Taxes" },
    { id: "scams", label: "Scams that target sellers" },
    { id: "next", label: "Next steps" },
  ],
  related: ["buy-monero", "swap-bitcoin-to-monero", "why-monero-delisted", "monero-transaction-lookup"],
  sources: [
    { label: "RetoSwap: official site (payment methods, fees, downloads)", href: "https://retoswap.com/" },
    { label: "RetoSwap: Trading Rules (account names must match)", href: "https://retoswap.com/Trading%20Rules.html" },
    { label: "Haveno docs: Trade protocol (2-of-3 multisig escrow)", href: "https://docs.haveno.exchange/overview/trade-protocol/" },
    { label: "Haveno docs: Account limits", href: "https://docs.haveno.exchange/overview/account-limits/" },
    { label: "Haveno docs: Payment methods and chargeback risk", href: "https://docs.haveno.exchange/overview/payment-methods/overview/" },
    { label: "Haveno docs: Dispute resolution", href: "https://docs.haveno.exchange/overview/dispute-resolution/" },
    { label: "eigenwallet docs (the app is always the taker: BTC to XMR)", href: "https://docs.eigenwallet.org/" },
    { label: "BasicSwap DEX: FAQ", href: "https://basicswapdex.com/faq" },
    { label: "Kraken: Support for Monero (XMR) in Europe", href: "https://support.kraken.com/hc/en-us/articles/support-for-monero-xmr-in-europe" },
    { label: "Kraken: UK Monero (XMR) conversion FAQ", href: "https://support.kraken.com/gb/articles/uk-monero-xmr-conversion-faq" },
    { label: "Kraken: Notice of delisting XMR in Canada", href: "https://support.kraken.com/articles/notice-of-delisting-xmr-canada" },
    { label: "The Record: German authorities take down eXch (May 2025)", href: "https://therecord.media/exch-cryptocurrency-mixer-germany-takedown" },
    { label: "Lamassu: Monero en route to Lamassu ATMs (September 2021)", href: "https://blog.lamassu.is/monero-en-route-to-lamassu-atms/" },
    { label: "Monero: How to prove a payment (tx key)", href: "https://www.getmonero.org/resources/user-guides/prove-payment.html" },
    { label: "IRS: Digital assets", href: "https://www.irs.gov/filing/digital-assets" },
    { label: "HMRC Cryptoassets Manual: CRYPTO22100 (disposals)", href: "https://www.gov.uk/hmrc-internal-manuals/cryptoassets-manual/crypto22100" },
  ],
  faq: [
    { q: "How do I sell Monero?", a: "Pick a route, then send XMR from your own wallet. The main routes are a peer-to-peer trade on a Haveno network such as RetoSwap (paid by bank transfer, cash or another coin), a sale for bitcoin, a regulated exchange that still accepts XMR deposits where you live, or an instant exchange. Start with a small amount and keep the transaction ID and key." },
    { q: "Can I sell Monero for cash?", a: "Yes. Haveno networks such as RetoSwap list cash in person and cash by mail, and you can trade face to face with someone you trust. Meet in a public place, count the money before you send, and start small." },
    { q: "How do I get Monero into my bank account?", a: "Either sell peer to peer and have the buyer pay you by bank transfer, or deposit XMR at a regulated exchange that still supports it where you live, sell it there and withdraw. Exchanges ask for ID; peer-to-peer buyers see the name on your bank account." },
    { q: "Can I swap Monero to bitcoin with an atomic swap?", a: "Not in eigenwallet: its app only takes the bitcoin to Monero side. BasicSwap DEX lists swaps in both directions, and Haveno networks have XMR for BTC offers held in escrow. Instant exchanges also convert XMR to BTC, but they hold your coins during the swap." },
    { q: "Do I pay tax when I sell Monero?", a: "In many countries, yes. The US IRS treats digital asset income as taxable and sales are reported, and the UK's HMRC counts selling tokens or swapping them for another token as a disposal for Capital Gains Tax. Rules differ by country; check yours or ask a tax adviser." },
    { q: "Which payment methods are risky when selling Monero?", a: "Reversible ones. The buyer can claw back a PayPal, Venmo or Cash App payment, or a card payment, after you have released the XMR, and the crypto cannot be recovered. Haveno's docs flag PayPal as high chargeback risk. Prefer cash in person or methods that are hard to reverse." },
    { q: "Can I sell Monero anonymously?", a: "Not fully. A peer-to-peer buyer sees the name on your bank account, an exchange holds your ID, and your bank sees incoming payments. Monero keeps your on-chain history private, but the money you receive is still on record. Selling for cash in person leaves the fewest records." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <strong>Ready to turn some Monero back into money you can spend at the shop?</strong> It is doable in 2026, but the
        easy button many people remember is gone: several big exchanges have{" "}
        <Link href="/why-monero-delisted">delisted XMR</Link>. The routes that remain work fine if you{" "}
        <mark>pick the one that matches what you want to receive</mark>, and know where each one can bite.
      </p>
      <p>
        This guide covers every route we could check on its own documentation, with the date we checked it. Nothing here is
        a paid placement, and it is general information, not financial, legal or tax advice.
      </p>

      <Takeaways items={[
        "Want a bank transfer or cash without an exchange account? Sell peer to peer on RetoSwap.",
        "Want bitcoin? Haveno, BasicSwap or an instant exchange. eigenwallet only goes the other way.",
        "Never release XMR for a payment that can be reversed, and check the payer's name matches.",
        "Keep the transaction ID and key for every sale, and check how your country taxes it.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        To sell Monero, send XMR from your own wallet to a buyer, a trading protocol or an exchange, and receive money or
        another coin in return. <mark>For cash or a bank transfer without an exchange account</mark>, sell peer to peer on a
        Haveno network such as RetoSwap, where your XMR waits in escrow until you confirm the buyer paid. For bitcoin, use a
        Haveno BTC offer, BasicSwap or an instant exchange. If you are happy to show ID, a regulated exchange that still
        accepts XMR deposits in your country is the simplest path to your bank.
      </p>

      <h2 id="decide">Which route fits you</h2>
      <table>
        <caption>Ways to sell Monero by what you want to receive (checked 2026-10-25)</caption>
        <thead><tr><th>You want</th><th>Best first route</th><th>Alternative</th><th>Main trade-off</th></tr></thead>
        <tbody>
          <tr><th>Money in your bank, no exchange account</th><td>Bank transfer offer on RetoSwap</td><td>A trusted person</td><td>The buyer sees your account name; fees up to 2% for the buyer taking a fiat offer</td></tr>
          <tr><th>Money in your bank, simplest</th><td>A regulated exchange that takes XMR where you live</td><td>Sell for BTC, then sell the BTC</td><td>ID check; not available in the EEA, UK or Canada on Kraken</td></tr>
          <tr><th>Cash</th><td>Face to face, or cash offers on RetoSwap</td><td>A two-way ATM, if one near you sells XMR</td><td>Personal safety; ATMs that buy XMR are rare</td></tr>
          <tr><th>Bitcoin or stablecoins</th><td>XMR for BTC offers on a Haveno network</td><td>BasicSwap DEX, or an instant exchange</td><td>Escrow wait, or custody risk with instant exchanges</td></tr>
        </tbody>
      </table>

      <h2 id="before">Before you sell anything</h2>
      <Steps items={[
        { title: "Make sure your XMR is spendable", body: <p>Coins you just received unlock after 10 blocks, about 20 minutes. If part of your balance is locked, <Link href="/monero-unlocked-balance">this is why</Link>.</p> },
        { title: "Send a small test first", body: <p>Whatever the route, move a small amount first and see it arrive before you send the rest.</p> },
        { title: "Check the receiving address twice", body: <p>Compare the first and last six characters after pasting. Clipboard malware swaps addresses, and a Monero payment <mark>cannot be pulled back</mark>.</p> },
        { title: "Write down what you paid for it", body: <p>If your country taxes gains, you need the purchase price and date. Do it now, while you can still find them.</p> },
      ]} />
      <p>
        You can send from any wallet where you hold the keys. In <Link href={walletUrl}>MonkStash</Link>, the send screen
        asks for your password on every payment and shows the fee before you confirm. Our{" "}
        <Link href="/send-monero">guide to sending Monero</Link> walks through it.
      </p>

      <h2 id="p2p">Sell peer to peer on RetoSwap</h2>
      <p>
        <a href="https://retoswap.com/" rel="noopener">RetoSwap</a> is the best-known network running Haveno, open-source
        software for peer-to-peer trading over Tor. You install it on your computer, post or take an offer, and get paid by
        the method you choose: bank transfers such as SEPA, ACH or Zelle, payment apps, cash in person or by mail, or another
        coin. It runs no ID check.
      </p>
      <Figure caption="A peer-to-peer sale: your XMR waits in escrow until you confirm the payment arrived.">
        <SellP2pStepsArt />
      </Figure>
      <p>
        Per the Haveno <a href="https://docs.haveno.exchange/overview/trade-protocol/" rel="noopener">trade protocol</a>, you
        lock the XMR you sell plus a security deposit, the buyer locks a deposit too, and everything sits in a 2-of-3 multisig
        wallet held by you, the buyer and an arbitrator. The buyer pays you outside the app. Once you confirm, the XMR goes to
        the buyer and both deposits come back. If a trade goes wrong, the{" "}
        <a href="https://docs.haveno.exchange/overview/dispute-resolution/" rel="noopener">dispute process</a> starts in the
        trade chat and moves to an arbitrator, who usually replies within 12 hours.
      </p>
      <KeyFact label="Fees on RetoSwap (checked 2026-10-25)">
        0.1% for the person who posts an offer (the maker). The person who takes it pays 0.8% for crypto trades and 2% for
        fiat trades. Posting your own sell offer is the cheapest way to sell.
      </KeyFact>
      <p>
        Two rules protect you as a seller. First, RetoSwap&apos;s{" "}
        <a href="https://retoswap.com/Trading%20Rules.html" rel="noopener">trading rules</a> require payment accounts in the
        trader&apos;s full real name, and say <mark>never accept a payment whose name or account differs</mark> from the
        trade. Open a dispute instead. Second, the{" "}
        <a href="https://docs.haveno.exchange/overview/payment-methods/overview/" rel="noopener">payment method docs</a> warn
        that some methods can be charged back long after you release the XMR. PayPal is marked high risk; Venmo and Cash App
        are easy to reverse too.
      </p>
      <Callout kind="warn" title="Confirm only what you can see">
        Confirm a payment only when the money is in your own account, from the name in the trade. A screenshot, an email
        that looks like it is from your bank, or a &quot;pending&quot; notice is not a payment.
      </Callout>

      <h2 id="bitcoin">Sell Monero for bitcoin</h2>
      <p>
        Going from XMR to BTC is less tidy than the other direction. <mark>eigenwallet only does bitcoin to Monero</mark>: its
        docs say the app always takes the side that has bitcoin. What works for XMR to BTC today:
      </p>
      <ul>
        <li><strong>Haveno networks.</strong> RetoSwap lists XMR for BTC offers, in the same escrow as above, at the crypto fee rates.</li>
        <li><strong>BasicSwap DEX.</strong> A decentralised exchange with atomic swaps in both directions and no protocol fee, only network fees. Your app must stay online for the swap, which usually takes tens of minutes. Check the live order book for XMR sellers&apos; liquidity before you rely on it.</li>
        <li><strong>Instant exchanges.</strong> Fast and simple, but they hold your coins while they swap (see below).</li>
      </ul>
      <p>
        Our guide to <Link href="/swap-bitcoin-to-monero">swapping bitcoin and Monero</Link> compares these in more depth.
      </p>

      <h2 id="exchange">Sell on a regulated exchange</h2>
      <p>
        If you are fine with an ID check, an exchange is the most direct path to your bank: deposit XMR, sell it, withdraw.
        The catch is finding one that still takes XMR where you live. Kraken, for example, no longer supports it in the{" "}
        <a href="https://support.kraken.com/hc/en-us/articles/support-for-monero-xmr-in-europe" rel="noopener">EEA</a>, the{" "}
        <a href="https://support.kraken.com/gb/articles/uk-monero-xmr-conversion-faq" rel="noopener">United Kingdom</a> or{" "}
        <a href="https://support.kraken.com/articles/notice-of-delisting-xmr-canada" rel="noopener">Canada</a>, and it does not
        publish a list of regions where deposits still work. <mark>Check in your own account before you send</mark>: an
        exchange that cannot credit a deposit may take a long time to return it.
      </p>
      <p>
        Keep in mind what you give up. The exchange knows who you are, sees the XMR you deposit and can ask where it came
        from. Withdraw your money promptly rather than leaving it there.
      </p>

      <h2 id="instant">Instant exchanges</h2>
      <p>
        Instant exchanges swap XMR to bitcoin or stablecoins in minutes, usually without an account. You send your coins first
        and trust the service to pay out. Many reserve the right to hold a swap for checks, and services can be hacked or
        seized: German authorities{" "}
        <a href="https://therecord.media/exch-cryptocurrency-mixer-germany-takedown" rel="noopener">took down eXch in 2025</a>{" "}
        and seized its servers and funds. If you use one, swap small amounts, never leave funds there, and compare the rate you
        are quoted with the market, because fees are often hidden in it.
      </p>

      <h2 id="cash">Cash in person and ATMs</h2>
      <p>
        Selling to someone face to face leaves the fewest records and has no chargeback risk. Meet somewhere public, count the
        cash before you send, and start with a small trade. Haveno networks list face-to-face offers if you do not know a
        buyer.
      </p>
      <p>
        Crypto ATMs that buy XMR exist but are rare. Lamassu{" "}
        <a href="https://blog.lamassu.is/monero-en-route-to-lamassu-atms/" rel="noopener">announced XMR support in 2021</a>, but
        each operator decides whether to switch it on, and we could not verify how many machines do today. ATM fees are
        typically far higher than other routes.
      </p>

      <h2 id="records">Keep proof of every payment</h2>
      <p>
        If a buyer says the XMR never arrived, you need to prove it did. Save the transaction ID, the address you paid and the{" "}
        <strong>transaction key</strong>. Anyone can check the three together, as the Monero{" "}
        <a href="https://www.getmonero.org/resources/user-guides/prove-payment.html" rel="noopener">prove-payment guide</a>{" "}
        shows, without seeing anything else in your wallet. Our{" "}
        <Link href="/monero-transaction-lookup">transaction lookup guide</Link> explains how.
      </p>
      <p>
        Records help at tax time too. MonkStash lets you add a private note to each payment and export a CSV of your history
        with each payment&apos;s value in your currency on its day.
      </p>

      <h2 id="taxes">Taxes</h2>
      <p>
        In many countries, selling Monero is a taxable event. The US IRS says{" "}
        <a href="https://www.irs.gov/filing/digital-assets" rel="noopener">income from digital assets is taxable</a> and sales
        are reported on Form 8949. The UK&apos;s HMRC counts{" "}
        <a href="https://www.gov.uk/hmrc-internal-manuals/cryptoassets-manual/crypto22100" rel="noopener">selling tokens for money, or swapping them for another token</a>,
        as a disposal for Capital Gains Tax. That includes swapping XMR for bitcoin. Rules differ by country, so check yours
        or ask a tax adviser. This is not tax advice.
      </p>

      <h2 id="scams">Scams that target sellers</h2>
      <ul>
        <li><strong>Chargebacks.</strong> The buyer pays with a reversible method, receives your XMR, then reverses the payment. Avoid PayPal, card and app payments with strangers.</li>
        <li><strong>Third-party payments.</strong> The money arrives from a name that is not your buyer&apos;s, often stolen from someone else. When the real owner reports it, your bank takes it back. This is why the names must match.</li>
        <li><strong>Fake payment proof.</strong> Edited screenshots and fake bank emails. Check your actual account.</li>
        <li><strong>&quot;Support&quot; that asks for your seed.</strong> No exchange, protocol or buyer ever needs your recovery words. Our <Link href="/monero-phishing-sites">phishing guide</Link> covers the tricks.</li>
      </ul>

      <h2 id="next">Next steps</h2>
      <ul>
        <li>Open your wallet and check what is spendable: <Link href={walletUrl}>open MonkStash</Link>.</li>
        <li>Learn how to <Link href="/send-monero">send Monero safely</Link> before your first sale.</li>
        <li>Changing your mind later? <Link href="/buy-monero">How to buy Monero</Link> covers the way back in.</li>
      </ul>
    </>
  );
}
