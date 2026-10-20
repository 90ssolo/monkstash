import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { WhoSeesNoKycArt, WhoSeesNoKycNarrow } from "@/components/art/BuyMoneroWithoutKycArt";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "buy-monero-without-kyc",
  section: "guides",
  kicker: "Get Monero",
  title: "How to Buy Monero Without KYC in 2026 (Honest and Dated)",
  seoTitle: "How to Buy Monero Without KYC (2026)",
  summary: "Buy Monero with no ID check: RetoSwap and Haveno, atomic swaps, instant exchanges and cash, with honest trade-offs, real incidents and dates.",
  keyword: "buy monero no kyc",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "not-anonymous", label: "No KYC does not mean anonymous" },
    { id: "decide", label: "Which route fits your situation" },
    { id: "address-first", label: "First, get a fresh receive address" },
    { id: "haveno", label: "RetoSwap and other Haveno networks" },
    { id: "atomic-swap", label: "Atomic swaps from bitcoin" },
    { id: "instant", label: "Instant exchanges: fast, with a catch" },
    { id: "cash", label: "Cash and in-person trades" },
    { id: "scams", label: "Scams that target no-KYC buyers" },
    { id: "legal", label: "Is it legal?" },
    { id: "next", label: "Next steps" },
  ],
  related: ["buy-monero", "swap-bitcoin-to-monero", "monero-subaddress", "monero-phishing-sites"],
  sources: [
    { label: "Haveno: FAQ (2-of-3 multisig, no-deposit offers up to 1.5 XMR, non-KYC)", href: "https://haveno.exchange/faq/" },
    { label: "Haveno docs: Trade protocol (security deposits and escrow)", href: "https://docs.haveno.exchange/overview/trade-protocol/" },
    { label: "Haveno docs: No-deposit trading", href: "https://docs.haveno.exchange/users/haveno-ui/no-deposit/" },
    { label: "RetoSwap: official site (fees, downloads, payment methods)", href: "https://retoswap.com/" },
    { label: "RetoSwap: Trading Rules", href: "https://retoswap.com/Trading%20Rules.html" },
    { label: "eigenwallet docs: Your first swap", href: "https://docs.eigenwallet.org/getting_started/first_swap" },
    { label: "eigenwallet docs: Refund and punish", href: "https://docs.eigenwallet.org/advanced/refund_punish" },
    { label: "eigenwallet docs: Anti-spam deposit FAQ (beware of fake support)", href: "https://docs.eigenwallet.org/faq/anti_spam_deposit" },
    { label: "Unchained: FixedFloat hacked for $26 million (February 2024)", href: "https://unchainedcrypto.com/crypto-exchange-fixedfloat-hacked-for-26-million-in-bitcoin-ether/" },
    { label: "The Record: German authorities take down eXch (May 2025)", href: "https://therecord.media/exch-cryptocurrency-mixer-germany-takedown" },
    { label: "Monero docs: Subaddresses", href: "https://docs.getmonero.org/public-address/subaddress/" },
    { label: "US Federal Trade Commission: What to know about cryptocurrency and scams", href: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams" },
  ],
  faq: [
    { q: "Can you buy Monero without KYC?", a: "Yes, in many places. Peer-to-peer networks built on Haveno, such as RetoSwap, atomic swaps from bitcoin, some instant exchanges and in-person cash trades can work without an ID check. Laws differ by country, so check yours first." },
    { q: "Is buying Monero without KYC the same as buying it anonymously?", a: "No. Your bank or card issuer still sees the payment, and the person you trade with sees the name you paid from. Monero hides the coins after they move, but the money you used to buy them stays on record." },
    { q: "What is RetoSwap?", a: "RetoSwap is a peer-to-peer trading network that runs on Haveno, open-source software that uses Monero multisig escrow and Tor. You install a desktop app (an Android app also exists) and trade directly with other people, with an arbitrator only if a trade goes wrong." },
    { q: "Do I need Monero to buy Monero on Haveno?", a: "Normally both traders lock a security deposit in XMR. To solve that for newcomers, sellers can create no-deposit offers of up to 1.5 XMR, protected by a passphrase you get from the seller." },
    { q: "Can I swap bitcoin to Monero without KYC?", a: "Yes. eigenwallet (formerly UnstoppableSwap) runs atomic swaps from BTC to XMR with no account, and Haveno networks list BTC offers too. Our guide to swapping bitcoin to Monero compares the routes." },
    { q: "Are instant exchanges safe for buying Monero?", a: "They are convenient, but you hand over your coins first and trust the service to pay out. Services can be hacked, frozen or seized, as the FixedFloat hack in 2024 and the eXch seizure in 2025 showed. Use small amounts and never leave funds sitting there." },
    { q: "Should I use a new address for each trade?", a: "Yes. A fresh subaddress for each trade stops counterparties from noticing that two trades paid the same wallet. It costs nothing and your wallet can make as many as you need." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <strong>Want to buy Monero without handing over your passport?</strong> You still can in 2026. The routes are
        different from a year ago, some of them are slower than an exchange, and{" "}
        <mark>one of them can quietly take your money</mark> if you pick it for the wrong job.
      </p>
      <p>
        This guide walks through every working route we could verify on its own documentation, what each one asks of you,
        and where it can go wrong. Every route carries a &quot;last checked&quot; date, because these services change fast.
        Nothing here is a paid placement, and this is general information, not legal or financial advice.
      </p>

      <Takeaways items={[
        "No KYC means no ID check by the seller. It does not make your bank payment invisible.",
        "Already hold bitcoin? An atomic swap is the cleanest route.",
        "Paying from a bank? A Haveno network such as RetoSwap adds escrow and arbitration.",
        "Use a fresh subaddress for every trade, and start small.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        To buy Monero with no KYC, <mark>trade with a person or a protocol instead of a regulated exchange</mark>. The
        four routes that work today are peer-to-peer networks built on Haveno (RetoSwap is the best known), atomic swaps from
        bitcoin, instant exchanges, and cash trades in person. Each ends the same way: XMR lands at an address in a wallet
        that only you control.
      </p>
      <p>
        If you are happy to show ID, a regulated exchange is simpler. Our{" "}
        <Link href="/buy-monero">complete guide to buying Monero</Link> covers that route and the basics of a first
        purchase.
      </p>

      <h2 id="not-anonymous">No KYC does not mean anonymous</h2>
      <p>
        KYC (&quot;know your customer&quot;) is the ID check that regulated businesses run before they let you trade.
        Skipping it removes one record. It does not remove the others. If you pay by bank transfer, your bank sees who you
        paid and how much. The person on the other side sees the name on your account. RetoSwap&apos;s own{" "}
        <a href="https://retoswap.com/Trading%20Rules.html" rel="noopener">trading rules</a> require that your account
        details match your real bank account, including your full name.
      </p>
      <Figure caption="A no-KYC trade paid from a bank: the chain hides the coins, but the money leg stays on record.">
        <Adaptive wide={<WhoSeesNoKycArt />} narrow={<WhoSeesNoKycNarrow />} />
      </Figure>
      <p>
        So be honest with yourself about the goal. Most people choosing these routes want{" "}
        <mark>to keep a company database from holding their ID next to their crypto</mark>, which is a reasonable privacy
        choice. If you need more than that, the payment method matters more than the platform.
      </p>

      <h2 id="decide">Which route fits your situation</h2>
      <p>Start from what you already have. The table points you to the route that asks the least of you.</p>
      <table>
        <caption>No-KYC routes to Monero by situation (last checked 2026-10-15)</caption>
        <thead><tr><th>Your situation</th><th>Best first route</th><th>Alternative</th><th>Main trade-off</th></tr></thead>
        <tbody>
          <tr><th>You already hold bitcoin</th><td>Atomic swap via eigenwallet</td><td>A BTC offer on RetoSwap</td><td>Desktop app; your app must come online if a swap stalls</td></tr>
          <tr><th>You have cash</th><td>In-person trade, or cash offers on a Haveno network</td><td>Cash by mail on RetoSwap</td><td>Personal safety; slow if mailed</td></tr>
          <tr><th>You have a bank account or card</th><td>Bank transfer on a Haveno network</td><td>A regulated exchange with KYC</td><td>Your bank and the seller see the payment; cards are rarely accepted because they can be charged back</td></tr>
          <tr><th>You need a small amount and hold no XMR</th><td>A no-deposit offer on Haveno (up to 1.5 XMR)</td><td>Get paid in XMR for work</td><td>You need the seller&apos;s passphrase; fewer offers</td></tr>
        </tbody>
      </table>

      <h2 id="address-first">First, get a fresh receive address</h2>
      <p>
        Before any money moves, have somewhere for the XMR to land. Every route below asks for a Monero address, and{" "}
        <mark>the address should belong to a wallet where you hold the keys</mark>.
      </p>
      <Steps items={[
        { title: "Open a wallet you control", body: <p>You can <Link href={walletUrl}>open the MonkStash wallet</Link> in your browser. Your keys are created and stored on your device.</p> },
        { title: "Back up your 25 words", body: <p>On paper, offline. If you skip this, a lost device means lost coins.</p> },
        { title: "Make a new subaddress for this trade", body: <p>A <Link href="/monero-subaddress">subaddress</Link> starts with 8. Use a fresh one per trade so two counterparties cannot tell they paid the same wallet.</p> },
        { title: "Paste it, then check it", body: <p>Compare the first and last six characters after pasting. Clipboard malware swaps addresses.</p> },
      ]} />
      <p>
        The Monero <a href="https://docs.getmonero.org/public-address/subaddress/" rel="noopener">subaddress docs</a>{" "}
        recommend exactly this: a new subaddress for each payout makes it harder for a sender to recognize you as the
        same recipient. MonkStash has no built-in exchange; it simply gives you that address.
      </p>

      <h2 id="haveno">RetoSwap and other Haveno networks</h2>
      <p>
        <strong>Last checked 2026-10-15.</strong> <a href="https://haveno.exchange/" rel="noopener">Haveno</a> is
        open-source software for peer-to-peer trading. It does not run a trading network itself; it says it endorses no
        network, and independent operators run their own. <mark>RetoSwap is the best known</mark> of these and describes
        itself as software you run on your own computer, not a website.
      </p>
      <h3>How a trade works</h3>
      <p>
        Per the Haveno <a href="https://docs.haveno.exchange/overview/trade-protocol/" rel="noopener">trade protocol</a>,
        the seller locks the XMR being sold plus a security deposit, and the buyer locks a security deposit too. The funds
        sit in a 2-of-3 Monero multisig wallet: one key per trader and one for an arbitrator. You pay outside the app (a
        bank transfer, for example), the seller confirms receipt, and the XMR is released. Both deposits go back.
      </p>
      <p>
        If something goes wrong, either side can call the arbitrator. The Haveno{" "}
        <a href="https://haveno.exchange/faq/" rel="noopener">FAQ</a> points out that arbitrators never hold the trade
        funds, because they have only one of three keys.
      </p>
      <h3>The deposit problem, and no-deposit offers</h3>
      <p>
        The catch for newcomers: you need XMR for the deposit before you can buy XMR. Haveno&apos;s answer is{" "}
        <a href="https://docs.haveno.exchange/users/haveno-ui/no-deposit/" rel="noopener">no-deposit offers</a>. A seller
        can waive your deposit on trades of <mark>up to 1.5 XMR</mark> and protect the offer with a passphrase that you ask
        them for. Fewer sellers offer this, because without a deposit they carry the risk.
      </p>
      <h3>RetoSwap specifics</h3>
      <ul>
        <li><strong>Apps:</strong> desktop builds for Windows, macOS and Linux, plus an Android app, all from its site and GitHub, with a public key to verify signatures.</li>
        <li><strong>Fees listed on its site:</strong> 0.1% maker, 0.8% taker for crypto trades, 2% taker for fiat trades.</li>
        <li><strong>Payment methods:</strong> bank transfers such as SEPA and ACH, payment apps, cash by mail or in person, and several coins including BTC.</li>
        <li><strong>Rules to know:</strong> leave the payment reference blank, pay early in the trade window, and never cancel a payment without agreement. Breaking these can cost you a penalty.</li>
      </ul>
      <p>
        <strong>Trade-offs.</strong> It is slower than an exchange: a bank-paid trade waits for your bank. Your account name
        is visible to the seller. And the platform cannot undo a fiat chargeback, which is why sellers are cautious with
        new buyers.
      </p>

      <h2 id="atomic-swap">Atomic swaps from bitcoin</h2>
      <p>
        <strong>Last checked 2026-10-15.</strong> If you already hold BTC, an atomic swap trades it for XMR with{" "}
        <mark>no middleman holding either coin</mark>. The tool most people use is{" "}
        <a href="https://eigenwallet.org/" rel="noopener">eigenwallet</a>, formerly UnstoppableSwap, a desktop app for
        Windows, macOS and Linux. Its docs describe swaps in one direction only: you send bitcoin, a maker sends you
        Monero.
      </p>
      <p>
        Its <a href="https://docs.eigenwallet.org/getting_started/first_swap" rel="noopener">first swap guide</a> suggests
        at least about 0.0003 BTC, with better rates from around 0.003 BTC. Each maker sets its own markup over the market
        rate, and an anti-spam deposit only matters if the swap is refunded.
      </p>
      <p>
        <strong>Trade-off.</strong> If a swap stalls, you must open the app during a refund window to get your bitcoin back.
        The <Link href="/swap-bitcoin-to-monero">bitcoin to Monero swap guide</Link> explains the timings step by step.
      </p>

      <h2 id="instant">Instant exchanges: fast, with a catch</h2>
      <p>
        Instant exchanges let you send one coin to a deposit address and receive XMR minutes later, often with no account.
        They are the fastest route. They are also the only route here where{" "}
        <mark>a company holds your coins mid-trade</mark>, and that is where the risk sits.
      </p>
      <ul>
        <li><strong>Holds and ID requests.</strong> A service can pause a trade, flag your deposit for an anti-money-laundering review, and ask for ID before it pays out or refunds. &quot;No KYC&quot; on the homepage does not always survive that moment. Read the AML section of the terms before you send.</li>
        <li><strong>Hacks.</strong> In February 2024 FixedFloat <a href="https://unchainedcrypto.com/crypto-exchange-fixedfloat-hacked-for-26-million-in-bitcoin-ether/" rel="noopener">lost about $26 million</a> in BTC and ETH. Users first saw stalled transactions while the site sat in maintenance mode.</li>
        <li><strong>Seizures.</strong> On April 30, 2025, German authorities <a href="https://therecord.media/exch-cryptocurrency-mixer-germany-takedown" rel="noopener">took down eXch</a> and seized its servers and crypto, accusing it of money laundering, one day before its operators had planned to close.</li>
      </ul>
      <p>
        The lesson is simple: use an instant exchange only for amounts you could afford to have stuck, and never leave a
        balance there. A service that advertises having no anti-money-laundering checks at all is a seizure risk, not a
        privacy feature.
      </p>

      <h2 id="cash">Cash and in-person trades</h2>
      <p>
        Cash leaves no bank record, which makes it the most private payment. It also brings a different risk: you are
        meeting a stranger with money. RetoSwap lists cash by mail and in-person payment methods, and some people trade locally through community
        groups.
      </p>
      <Callout kind="warn" title="Stay safe when trading in person">
        Meet in a busy public place with cameras, such as a bank lobby or a cafe, in daylight. Bring a friend. Start with a
        small amount. Have the seller send the XMR first, or wait in place until it shows in your wallet. Never invite a
        stranger home, never carry more cash than the trade, and walk away from anyone who pushes you to hurry.
      </Callout>

      <h2 id="scams">Scams that target no-KYC buyers</h2>
      <p>
        People searching for KYC-free Monero are a favorite target, because scammers know they may be reluctant to report a
        loss. Watch for these:
      </p>
      <ul>
        <li><strong>Fake download sites</strong> copying RetoSwap, Haveno or eigenwallet. Get apps from the official site or GitHub, and verify signatures where offered. See our guide to <Link href="/monero-phishing-sites">spotting fake Monero sites</Link>.</li>
        <li><strong>&quot;Support&quot; in your messages.</strong> eigenwallet&apos;s own docs warn about scammers posing as support. Real arbitrators work inside the app.</li>
        <li><strong>Trades moved off-platform.</strong> A seller who asks you to skip escrow is removing your protection.</li>
        <li><strong>Pressure and guarantees.</strong> The US FTC <a href="https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams" rel="noopener">warns</a> that only scammers guarantee profits or demand urgent crypto payments.</li>
      </ul>

      <h2 id="legal">Is it legal?</h2>
      <p>
        In most countries, owning Monero and buying it from another person is legal. What changes is the rules for
        businesses: many must run ID checks, and some regions are tightening them. Our page on{" "}
        <Link href="/is-monero-legal">whether Monero is legal</Link> covers the big picture, and{" "}
        <Link href="/monero-eu-2027">Monero and the EU&apos;s 2027 rules</Link> explains what is coming in Europe.
      </p>
      <KeyFact label="The honest line">
        A KYC-free route is a privacy choice, not a loophole. Tax rules still apply to you, and{" "}
        <mark>local laws apply wherever you trade</mark>. If you are unsure, ask a local professional.
      </KeyFact>

      <h2 id="next">Next steps</h2>
      <ol>
        <li><Link href={walletUrl}>Open your MonkStash wallet</Link> and back up the 25 words.</li>
        <li>Make a fresh subaddress for your first trade.</li>
        <li>Pick the route from the table above, and start with a small amount.</li>
        <li>When it arrives, read <Link href="/receive-monero">how receiving Monero works</Link> so you know when it is spendable.</li>
      </ol>
    </>
  );
}
