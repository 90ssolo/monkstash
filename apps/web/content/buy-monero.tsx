import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps } from "@/components/article/parts";
import { ChapterHead, DeepDive, FactStrip, YoullLearn } from "@/components/pillar/parts";
import { Figure } from "@/components/art/Figure";
import { BuyPathArt, ConfirmTimelineArt, FeeStackArt, RouteChooserArt, WhoKnowsArt } from "@/components/art/BuyMoneroPillarArt";
import { BuyPathNarrow, ConfirmTimelineNarrow, FeeStackNarrow, RouteChooserNarrow, WhoKnowsNarrow } from "@/components/art/BuyMoneroPillarNarrowArt";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";

export const meta: ArticleMeta = {
  slug: "buy-monero",
  section: "guides",
  layout: "pillar",
  kicker: "The complete guide",
  title: "How to Buy Monero (XMR): The Complete Guide for 2026",
  seoTitle: "How and Where to Buy Monero (XMR) in 2026",
  h1: { keyword: "How to buy Monero (XMR)", sizzle: "Buy it anywhere. Keep it yours." },
  summary: "How to buy Monero safely: six ways to get XMR, ID checks, fees, the scams to avoid, and how to move your coins into a wallet you control.",
  keyword: "how to buy monero",
  updated: "2026-10-15",
  readingMinutes: 21,
  toc: [
    { id: "short-answer", label: "How to buy Monero: the short answer" },
    { id: "ways", label: "Where to buy Monero: 6 ways to get XMR" },
    { id: "choose", label: "Which way should you choose?" },
    { id: "step-by-step", label: "How to buy Monero step by step" },
    { id: "payment", label: "Card, PayPal, bank transfer or cash?" },
    { id: "fees", label: "Fees and the hidden price spread" },
    { id: "kyc", label: "Can you buy Monero without KYC?" },
    { id: "why-hard", label: "Why can't I buy Monero? Delistings explained" },
    { id: "scams", label: "Scams and red flags when buying XMR" },
    { id: "privacy", label: "How to keep your privacy after you buy" },
    { id: "next", label: "After your first XMR" },
  ],
  chapterBlurbs: {
    "short-answer": "Wallet first, small amount, withdraw, check. That is the whole method.",
    ways: "Exchanges, people, swaps, ATMs, earning and mining, with honest trade-offs.",
    choose: "Six quick questions that point you to the right route.",
    "step-by-step": "Your first purchase, from empty wallet to spendable XMR.",
    payment: "Which payment methods can be reversed, and why sellers care.",
    fees: "The price you see is rarely the price you pay. Here is where it goes.",
    kyc: "What ID checks are, why businesses run them, and the privacy trade-off.",
    "why-hard": "Why big exchanges dropped XMR, and what it means for you.",
    scams: "Fake sites, “send first” tricks and impersonators. How to spot them.",
    privacy: "What the seller still knows, and the habits that protect the rest.",
    next: "Back up, learn to send, and keep your stash quietly yours.",
  },
  related: ["create-monero-wallet", "receive-monero", "is-monero-legal", "monero-phishing-sites"],
  sources: [
    { label: "The Monero Project: FAQ, including how to get Monero", href: "https://www.getmonero.org/get-started/faq/" },
    { label: "Moneropedia: Address (95 characters, starting with 4 or 8)", href: "https://www.getmonero.org/resources/moneropedia/address.html" },
    { label: "Monero docs: Subaddresses (a new one for each payout)", href: "https://docs.getmonero.org/public-address/subaddress/" },
    { label: "Feather Wallet docs: Balance (outputs locked for 10 blocks)", href: "https://docs.featherwallet.org/guides/balance" },
    { label: "The Monero Project: Mining (solo, pools and P2Pool)", href: "https://www.getmonero.org/get-started/mining/" },
    { label: "Moneropedia: Fungibility", href: "https://www.getmonero.org/resources/moneropedia/fungibility.html" },
    { label: "The Block: Binance to delist Monero on February 20, 2024", href: "https://www.theblock.co/post/276176/binance-delisting-monero" },
    { label: "Kraken: Support for Monero (XMR) in Europe (EEA trading halted 31 October 2024)", href: "https://support.kraken.com/hc/en-us/articles/support-for-monero-xmr-in-europe" },
    { label: "Kraken: Notice of delisting XMR in Canada (trading disabled 2 September 2025)", href: "https://support.kraken.com/articles/notice-of-delisting-xmr-canada" },
    { label: "US Federal Trade Commission: What to know about cryptocurrency and scams", href: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams" },
    { label: "US Federal Trade Commission: Losses to Bitcoin ATM scams (September 2024)", href: "https://www.ftc.gov/news-events/news/press-releases/2024/09/new-ftc-data-shows-massive-increase-losses-bitcoin-atm-scams" },
    { label: "UK Financial Conduct Authority: Cryptoasset businesses and money laundering rules", href: "https://www.fca.org.uk/firms/financial-crime/cryptoassets-aml-ctf-regime" },
  ],
  faq: [
    { q: "How do I buy Monero?", a: "Set up a wallet you control first. Then buy a small amount through an exchange that lists XMR, a peer-to-peer trade, a swap from another coin, or a crypto ATM that sells it. Withdraw the XMR to your own wallet, check the address before you confirm, and wait about 20 minutes for it to become spendable." },
    { q: "Where can I buy or get Monero?", a: "Monero is sold on some cryptocurrency exchanges, by individuals on peer-to-peer marketplaces, through swap services that convert other coins into XMR, and at some crypto ATMs. What is available depends on your country, because several large exchanges have stopped listing it. You can also earn XMR or mine it." },
    { q: "How can I get Monero without buying it?", a: "You can earn it by accepting XMR for goods or work, mine it with an ordinary computer processor, or swap another coin you already hold into XMR. Earning is often the most private route, because the only other party is the person paying you." },
    { q: "Can I buy Monero without KYC?", a: "Some routes, such as peer-to-peer trades, some swap services, mining and being paid in XMR, may not involve an identity check, depending on the service, the amount and the law where you live. Regulated businesses in many countries are legally required to check ID. Our dated guide to buying Monero without KYC lists the routes. This is general information, not legal advice." },
    { q: "Why can't I buy Monero on my exchange?", a: "Several large exchanges have removed Monero, some worldwide and some only in certain regions. Binance, for example, delisted it on February 20, 2024. These are business and compliance decisions about listing. They change where you can buy XMR, not whether you can hold it." },
    { q: "Can I buy Monero with a credit card or PayPal?", a: "Sometimes. Some exchanges and marketplaces accept cards, and some peer-to-peer sellers accept online payment apps. Because card and app payments can often be disputed or reversed, many sellers charge more for them or refuse them. Compare the final amount of XMR you receive before you pay." },
    { q: "Is it legal to buy Monero?", a: "In most countries owning Monero is legal, and buying it from a seller that follows local rules is generally allowed. Rules differ by country and change over time, so check where you live. This is general information, not legal advice." },
    { q: "Should I leave my Monero on the exchange?", a: "It is safer to withdraw it to a wallet where you hold the recovery words. While coins sit on an exchange, the exchange controls them. Once they are in your own wallet, only your keys can move them." },
    { q: "How long does it take to receive Monero after I buy?", a: "Once the seller sends it, the payment usually shows as pending in your wallet within minutes. Each new block, about every 2 minutes, adds a confirmation, and after 10 blocks, roughly 20 minutes, the coins become spendable. The seller's own processing time comes on top." },
    { q: "Can I buy Monero with cash?", a: "Yes, in some places. Options include meeting a seller in person through a peer-to-peer marketplace, or a crypto ATM that sells XMR. Meet in a safe public place, start small, and never use a machine because someone on the phone told you to." },
  ],
};

export function Hero() {
  return <Adaptive wide={<BuyPathArt />} narrow={<BuyPathNarrow />} />;
}

export function Body() {
  return (
    <>
      <p>
        <strong>How to buy Monero?</strong> Get a wallet you control, buy a small amount from an exchange, a person or a swap
        service, then withdraw it straight to your own address. That is the whole method. The details matter, though, because
        Monero is <mark>harder to find than most coins</mark> and the people selling it are not all honest.
      </p>
      <p>
        Buying is not the only way to get Monero, either. You can also swap another coin for it, earn it, or mine it, and
        this guide covers where to get Monero by each of those routes too.
      </p>
      <p>
        This is the complete guide. It covers every way to get XMR, what each one costs you in money and in privacy, and how
        to get through your first purchase without a mistake. We don&apos;t name or rank any exchange or service; this is
        general information, not financial or legal advice.
      </p>

      <YoullLearn items={[
        <>The six ways to get XMR, and the honest trade-offs of each</>,
        <>A step-by-step first purchase that ends with coins only you can move</>,
        <>What ID checks (KYC) are, and why some places ask and others don&apos;t</>,
        <>Why Monero vanished from some big exchanges, and what that changes</>,
        <>The scams that target buyers, and how to keep your privacy afterward</>,
      ]} />
      <p>Let&apos;s get started.</p>

      {/* 1 */}
      <ChapterHead n={1} id="short-answer" title="How to buy Monero: the short answer" />
      <p>
        Buying Monero is like buying any foreign currency. Someone has it, you pay them, they hand it over. The one big
        difference: <mark>you should hold it yourself</mark>, not leave it with whoever sold it to you.
      </p>
      <p>Here is the method in four lines:</p>
      <ol>
        <li><strong>Wallet first.</strong> <Link href="/create-monero-wallet">Create a Monero wallet</Link> and write down its 25 recovery words before you spend a cent.</li>
        <li><strong>Start small.</strong> Your first purchase is a test of the route, not an investment.</li>
        <li><strong>Withdraw to your own address.</strong> Coins on an exchange are the exchange&apos;s to control.</li>
        <li><strong>Check, then wait.</strong> Verify the address before you confirm, then give it about 20 minutes to become spendable.</li>
      </ol>
      <FactStrip items={[
        { value: "6", label: "Ways to get XMR" },
        { value: "25", label: "Words in your backup" },
        { value: "95", label: "Characters in an address" },
        { value: "~20 min", label: "Until it is spendable" },
        { value: "None", label: "Chargebacks on XMR" },
      ]} />
      <KeyFact label="The one rule that matters most">
        Whatever route you use, <mark>finish in a wallet where you hold the keys</mark>. Until then, you own a promise, not
        the coins.
      </KeyFact>

      {/* 2 */}
      <ChapterHead n={2} id="ways" title="Where to buy Monero: 6 ways to get XMR" />
      <p>
        The Monero project&apos;s own <a href="https://www.getmonero.org/get-started/faq/" rel="noopener">FAQ</a> puts it
        simply: you can get Monero from an exchange or from an individual, or mine it yourself. In practice that splits into
        six routes. Each one asks something different of you.
      </p>
      <h3>1. A cryptocurrency exchange</h3>
      <p>
        You sign up, verify your identity, deposit money from a bank or card, and buy XMR at the market price. It is the most
        familiar route. The catch: fewer exchanges list Monero than before, and{" "}
        <mark>the exchange knows exactly who bought what</mark>.
      </p>
      <h3>2. A peer-to-peer trade</h3>
      <p>
        On a peer-to-peer (P2P) marketplace you buy directly from another person. Many offer escrow: the coins are locked
        until the seller confirms your payment. P2P trades accept more payment methods, including cash in person, but quality
        varies from seller to seller and scammers work these markets.
      </p>
      <h3>3. A swap from another coin</h3>
      <p>
        If you already hold bitcoin or another coin, a swap service converts it into XMR, often without an account. Some
        swaps are atomic swaps, where software enforces both sides of the trade so neither person has to trust the other.
        Swaps are fast, but rates differ a lot, and fake swap sites are common. Our guide on{" "}
        <Link href="/swap-bitcoin-to-monero">how to swap bitcoin to Monero</Link> walks through the options and their risks.
      </p>
      <h3>4. A crypto ATM</h3>
      <p>
        Some crypto ATMs sell XMR for cash. You scan your own wallet&apos;s QR code and feed in banknotes. It is quick and
        simple, but fees can be steep, ID rules vary by country, and these machines are a favorite tool of scammers (more in
        chapter 9).
      </p>
      <h3>5. Earning it</h3>
      <p>
        Sell goods, do freelance work, or accept tips in XMR. No exchange is involved at all: you{" "}
        <Link href="/receive-monero">share a receive address</Link> and get paid. For many people this is the most private way
        to get Monero, because the only other party is the person paying you.
      </p>
      <h3>6. Mining it</h3>
      <p>
        Monero is mined with ordinary computer processors. The project&apos;s{" "}
        <a href="https://www.getmonero.org/get-started/mining/" rel="noopener">mining page</a> warns that solo mining with
        modest hardware can take months to find a block, and encourages <Link href="/monero-p2pool">P2Pool</Link>, a
        decentralized pool with frequent payouts and no fee. Mining earns you small amounts slowly, and electricity is the
        real cost. Our <Link href="/mine-monero">mining guide</Link> runs the numbers.
      </p>
      <table>
        <caption>Six ways to get Monero, compared</caption>
        <thead><tr><th>Route</th><th>How it works</th><th>ID checks</th><th>Speed</th><th>Main trade-off</th></tr></thead>
        <tbody>
          <tr><th>Exchange</th><td>Buy with bank or card money</td><td>Usually required</td><td>Fast once verified</td><td>Fewer listings; your identity is tied to the purchase</td></tr>
          <tr><th>Peer to peer</th><td>Buy from a person, often with escrow</td><td>Varies by platform and amount</td><td>Minutes to hours</td><td>Seller quality varies; scams target newcomers</td></tr>
          <tr><th>Swap service</th><td>Trade another coin for XMR</td><td>Varies by service</td><td>Usually minutes</td><td>Spreads differ; fake sites copy real ones</td></tr>
          <tr><th>Crypto ATM</th><td>Feed cash into a machine</td><td>Varies by country and amount</td><td>Minutes</td><td>Fees can be high; few machines sell XMR</td></tr>
          <tr><th>Earning</th><td>Get paid in XMR for goods or work</td><td>None from a seller</td><td>As fast as you get paid</td><td>You need something to sell</td></tr>
          <tr><th>Mining</th><td>Your computer helps secure the network</td><td>None from a seller</td><td>Slow, small amounts</td><td>Hardware and electricity costs</td></tr>
        </tbody>
      </table>
      <p>
        These are general patterns, not promises. Terms change often, so read a service&apos;s current rules before you use it.
      </p>

      {/* 3 */}
      <ChapterHead n={3} id="choose" title="Which way should you choose?" />
      <p>
        <mark>There is no single best route</mark>. The right one depends on what you already hold, how you want to pay, and
        how much privacy you want to trade for convenience. Six quick questions narrow it down:
      </p>
      <Figure caption="Start with the first question that fits you. Whatever the route, the coins should end up in your own wallet.">
        <Adaptive wide={<RouteChooserArt />} narrow={<RouteChooserNarrow />} />
      </Figure>
      <p>
        Two tips for a first purchase. Pick the route where <mark>a mistake costs you the least</mark>, which usually means
        a small amount through something you already understand. And don&apos;t let a stranger choose for you. People who
        message you with a &quot;better&quot; route are the main source of trouble in chapter 9.
      </p>

      {/* 4 */}
      <ChapterHead n={4} id="step-by-step" title="How to buy Monero step by step" />
      <p>
        This is the order that keeps you safe, whichever route you picked. Each step takes a couple of minutes, and the first
        two happen before any money moves.
      </p>
      <Steps items={[
        { title: "Create your wallet", body: <p>Use a non-custodial wallet, one where the keys live on your device. You can <Link href="/create-monero-wallet">create one in your browser</Link> in about two minutes, or compare <Link href="/monero-wallets">other Monero wallets</Link>.</p> },
        { title: "Write down your 25 recovery words", body: <p>On paper, offline. If you lose your device, these words are the only way back to your coins. The <Link href="/back-up-monero-wallet">backup guide</Link> shows how to store them.</p> },
        { title: "Choose a route and start small", body: <p>Buy a small amount first. If something goes wrong, you learn the lesson cheaply.</p> },
        { title: "Copy your receive address", body: <p>Open your wallet&apos;s Receive screen. A fresh <Link href="/monero-subaddress">subaddress</Link> for each purchase is a good habit (chapter 10 explains why).</p> },
        { title: "Paste it and check it", body: <p>A Monero address is 95 characters long and starts with a 4 or an 8. Compare the first and last six characters after pasting. Our <Link href="/tools/monero-address-validator">address validator</Link> checks the format for you.</p> },
        { title: "Withdraw, then wait", body: <p>Confirm the withdrawal and give it time. The payment appears as pending first, then becomes spendable after 10 confirmations.</p> },
        { title: "Check it arrived, then do the rest", body: <p>Once the test amount is in your wallet, repeat for the larger amount if you want one.</p> },
      ]} />
      <h3>How long until your Monero arrives</h3>
      <p>
        Monero adds a block about every two minutes. Every received output is{" "}
        <a href="https://docs.featherwallet.org/guides/balance" rel="noopener">locked for 10 blocks</a> by a network rule, so
        a payment is <mark>spendable after roughly 20 minutes</mark>. Exchanges add their own processing time before they
        send.
      </p>
      <Figure caption="After a seller sends, your wallet usually shows the payment within minutes. It becomes spendable after 10 blocks.">
        <Adaptive wide={<ConfirmTimelineArt />} narrow={<ConfirmTimelineNarrow />} />
      </Figure>
      <p>
        Nothing showing up after the seller says it sent? First make sure your wallet has finished syncing. Then ask the
        seller for the transaction ID; our <Link href="/monero-transaction-time">guide to Monero transaction times</Link>{" "}
        covers what is normal.
      </p>

      {/* 5 */}
      <ChapterHead n={5} id="payment" title="Card, PayPal, bank transfer or cash?" />
      <p>
        How you pay shapes everything else: the fee, the speed, and whether a seller will even accept you. The key question
        sellers ask is simple: <mark>can this payment be taken back?</mark>
      </p>
      <p>
        A Monero payment cannot be reversed. A card payment often can, through a chargeback. That mismatch is why many
        peer-to-peer sellers avoid reversible methods, or charge more for them. They are protecting themselves from buyers
        who pay, receive XMR, and then dispute the payment.
      </p>
      <table>
        <caption>Common ways to pay for XMR</caption>
        <thead><tr><th>Payment</th><th>Where you will see it</th><th>Can the payer reverse it?</th><th>Watch out for</th></tr></thead>
        <tbody>
          <tr><th>Bank transfer</th><td>Exchanges, some P2P sellers</td><td>Usually hard once it clears</td><td>Slower; your bank sees who you paid</td></tr>
          <tr><th>Debit or credit card</th><td>Some exchanges and marketplaces</td><td>Often, through a chargeback</td><td>Higher fees; card issuers may block crypto buys</td></tr>
          <tr><th>Online payment apps</th><td>Some P2P sellers</td><td>Often, through disputes</td><td>Many sellers refuse them or charge extra</td></tr>
          <tr><th>Cash</th><td>In-person P2P, crypto ATMs</td><td>No</td><td>Personal safety; ATM fees</td></tr>
          <tr><th>Another coin</th><td>Swap services, some exchanges</td><td>No</td><td>Rates and fake swap sites</td></tr>
        </tbody>
      </table>
      <h3>Can you buy Monero with PayPal?</h3>
      <p>
        Not directly in most cases. If a payment app offers crypto, check its list of supported coins rather than assuming
        XMR is there. Some peer-to-peer sellers accept payment apps, usually at a higher price because of the dispute risk.
      </p>
      <h3>Buying Monero with cash</h3>
      <p>
        Cash keeps your bank out of it, but it brings a different risk: meeting a stranger. Meet in a busy public place, bring
        a friend, start small, and use the marketplace&apos;s escrow so the coins are locked before any cash changes
        hands.
      </p>

      {/* 6 */}
      <ChapterHead n={6} id="fees" title="Fees and the hidden price spread" />
      <p>
        The price you see is rarely the price you pay. Between your money and your wallet sit up to five separate costs, and
        the biggest one is often <mark>the one nobody labels as a fee</mark>.
      </p>
      <Figure caption="Each step can take a slice. The Monero network fee is usually the smallest; the spread is easy to miss.">
        <Adaptive wide={<FeeStackArt />} narrow={<FeeStackNarrow />} />
      </Figure>
      <ul>
        <li><strong>Payment method fee.</strong> Cards and instant methods usually cost more than bank transfers.</li>
        <li><strong>Trading fee.</strong> A percentage the exchange or marketplace takes on each trade.</li>
        <li><strong>The spread.</strong> The gap between the market price and the price you are quoted. &quot;Zero fee&quot; services often earn here instead.</li>
        <li><strong>Withdrawal fee.</strong> A charge for sending XMR out to your wallet. It can be a fixed amount, which hurts small purchases most.</li>
        <li><strong>Network fee.</strong> What Monero miners get to include your transaction. It is dynamic but normally tiny; see <Link href="/monero-transaction-fee">Monero transaction fees</Link>.</li>
      </ul>
      <p>
        The fix is simple: <mark>compare the final XMR amount</mark> that will land in your wallet, after every fee, for the
        same amount of money. That one number tells you more than any advertised rate.
      </p>

      {/* 7 */}
      <ChapterHead n={7} id="kyc" title="Can you buy Monero without KYC?" />
      <p>
        KYC stands for &quot;know your customer.&quot; It means a business checks who you are, usually with an ID document,
        sometimes with a selfie or proof of address. For regulated crypto businesses it is often a legal duty. In the UK, for
        example,{" "}
        <a href="https://www.fca.org.uk/firms/financial-crime/cryptoassets-aml-ctf-regime" rel="noopener">cryptoasset businesses must register with the FCA</a>{" "}
        and follow money laundering rules. Many other countries have similar rules.
      </p>
      <h3>The privacy trade-off</h3>
      <p>
        KYC does not break Monero&apos;s privacy on the blockchain. But it creates a record off the chain: this person bought
        this much XMR, on this date, and withdrew it to this address. That record is kept by the business and can be shared
        where the law requires it, or exposed in a data breach. That is the honest trade-off: <mark>convenience in exchange
        for a paper trail</mark>.
      </p>
      <h3>Is there a way to buy Monero without ID?</h3>
      <p>
        Sometimes. Some peer-to-peer trades and swap services, earning XMR and mining may not involve an ID check, depending
        on the platform, the amount and the law where you live. Fully anonymous buying is rarer than people think, though: a
        P2P seller sees your payment details and a cash seller sees your face. Routes and terms change often, so we keep a
        separate, dated guide on{" "}
        <Link href="/buy-monero-without-kyc">how to buy Monero without KYC</Link> with each route checked on its own docs.
      </p>
      <Callout title="Follow the law where you live">
        Privacy is legal and reasonable. Breaking reporting or tax rules is not. This chapter explains what KYC is; it is not
        advice on avoiding legal obligations. This is general information, not legal advice.
      </Callout>

      {/* 8 */}
      <ChapterHead n={8} id="why-hard" title="Why can't I buy Monero? Delistings explained" />
      <p>
        If your usual exchange has no XMR, you are not imagining it. Several large exchanges have removed Monero in recent
        years, some worldwide and some only in certain regions. The best-known case:{" "}
        <a href="https://www.theblock.co/post/276176/binance-delisting-monero" rel="noopener">Binance delisted XMR on February 20, 2024</a>,
        saying it periodically reviews every asset it lists. Regional removals followed: Kraken{" "}
        <a href="https://support.kraken.com/hc/en-us/articles/support-for-monero-xmr-in-europe" rel="noopener">halted XMR trading and deposits in the EEA on 31 October 2024</a>,
        and{" "}
        <a href="https://support.kraken.com/articles/notice-of-delisting-xmr-canada" rel="noopener">disabled XMR trading in Canada on 2 September 2025</a>.
      </p>
      <p>
        The reason is compliance. Regulated exchanges are expected to monitor where funds come from and go to, and Monero
        hides senders, receivers and amounts by design. Some exchanges decided listing it wasn&apos;t worth the work. These
        are <mark>business decisions about listing</mark>, not a verdict on the coin, and they don&apos;t touch XMR already
        in your own wallet. If your exchange dropped it, a{" "}
        <Link href="/swap-bitcoin-to-monero">bitcoin to Monero swap</Link> is the usual way around it. For every major
        delisting with its date and source, see <Link href="/why-monero-delisted">why Monero was delisted</Link>.
      </p>
      <h3>Is it legal to buy Monero?</h3>
      <p>
        In most countries owning Monero is legal, and delistings are about what businesses may offer, not what individuals
        may hold. Rules differ by country and change over time, so <mark>check the rules where you live</mark>. This is general
        information, not legal advice.
      </p>
      <DeepDive paths={["/is-monero-legal"]} />

      {/* 9 */}
      <ChapterHead n={9} id="scams" title="Scams and red flags when buying XMR" />
      <Callout kind="warn" title="Monero payments cannot be reversed">
        Send XMR, or cash for XMR, to a scammer and there is no chargeback and no bank to call. The best protection is to slow
        down and check every step before you pay.
      </Callout>
      <p>
        Buyers are targeted because they are new and in a hurry. The US Federal Trade Commission&apos;s{" "}
        <a href="https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-and-scams" rel="noopener">guide to crypto scams</a>{" "}
        puts the core rule plainly: no legitimate business will demand crypto from you in advance, and{" "}
        <mark>only scammers guarantee profits</mark>. Here are the patterns to know.
      </p>
      <h3>Peer-to-peer tricks</h3>
      <ul>
        <li><strong>&quot;Send first&quot; outside escrow.</strong> A seller asks you to pay before the coins are locked, or to move the trade off the platform to &quot;save fees.&quot; That removes your protection. Say no.</li>
        <li><strong>Fake proof.</strong> Screenshots of payments or of &quot;sent&quot; transactions are easy to fake. Only your own wallet balance counts.</li>
        <li><strong>Pressure.</strong> Countdown timers, &quot;last chance&quot; prices and anger when you ask questions are signals to walk away.</li>
      </ul>
      <h3>Fake sites and fake support</h3>
      <ul>
        <li><strong>Lookalike swap and exchange sites.</strong> They copy real designs and buy search ads. Type addresses yourself or use a bookmark.</li>
        <li><strong>Fake wallets.</strong> Since MyMonero closed in January 2026, clones of it have been collecting recovery words. Our <Link href="/monero-phishing-sites">guide to Monero phishing sites</Link> shows how to spot them.</li>
        <li><strong>Impersonators.</strong> &quot;Support&quot; that contacts you first, on any app, is not support. Nobody legitimate will ever ask for your 25 words.</li>
        <li><strong>Swapped addresses.</strong> Some malware replaces a copied address with the attacker&apos;s. That is why step 5 says to check the address after you paste it.</li>
      </ul>
      <h3>ATM and investment scams</h3>
      <p>
        If someone on the phone tells you to take cash to a crypto ATM, it is a scam. The FTC reports that{" "}
        <a href="https://www.ftc.gov/news-events/news/press-releases/2024/09/new-ftc-data-shows-massive-increase-losses-bitcoin-atm-scams" rel="noopener">losses to crypto ATM scams grew nearly tenfold from 2020 to 2023</a>,
        mostly from people impersonating governments, businesses and tech support. Victims scan a QR code the scammer gives
        them, and the money goes straight to the scammer. At an ATM, <mark>only ever scan your own wallet&apos;s code</mark>.
      </p>
      <p>
        The same goes for &quot;investment managers&quot; who promise to grow your XMR, and for anyone you met online who
        suggests buying it. Monero&apos;s price can fall as well as rise. Only buy what you can afford to lose.
      </p>
      <DeepDive paths={["/monero-phishing-sites", "/is-monero-safe"]} label="Stay safe" />

      {/* 10 */}
      <ChapterHead n={10} id="privacy" title="How to keep your privacy after you buy" />
      <p>
        Here is the part most buying guides skip. Monero hides your payments on the blockchain, but{" "}
        <mark>the seller keeps its own records</mark>. Knowing who knows what lets you protect the rest.
      </p>
      <Figure caption="The withdrawal itself is private on chain. The seller's records are not yours to erase, so choose where you buy with that in mind.">
        <Adaptive wide={<WhoKnowsArt />} narrow={<WhoKnowsNarrow />} />
      </Figure>
      <h3>Habits that help</h3>
      <ul>
        <li><strong>Withdraw promptly.</strong> Coins left on an exchange can be frozen, lost in a hack, or caught up in a delisting.</li>
        <li>
          <strong>Use a new subaddress for each purchase.</strong> The{" "}
          <a href="https://docs.getmonero.org/public-address/subaddress/" rel="noopener">Monero docs recommend</a> a fresh
          subaddress for each payout, so a service can&apos;t easily tell that later payments go to the same person. A seller
          that knows your identity can still link your own purchases in its database.
        </li>
        <li><strong>Mind your connection.</strong> A remote node can see your IP address and which transactions you broadcast, though not your keys or balance. Read about <Link href="/monero-remote-node">remote nodes</Link> or run your own.</li>
        <li><strong>Don&apos;t post what you want kept.</strong> An address or a screenshot shared in public is public.</li>
      </ul>
      <p>
        Once XMR leaves the seller, it is just XMR. Monero is designed so that every coin is interchangeable with every other,
        a property the project calls{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/fungibility.html" rel="noopener">fungibility</a>. There is
        no visible history for anyone to judge. For the full picture of what can and can&apos;t be traced, read{" "}
        <Link href="/is-monero-traceable">whether Monero can be traced</Link>.
      </p>
      <Callout title="An honest note about MonkStash">
        MonkStash creates and encrypts your keys on your device, and they never go to a server. Today it reaches the network
        through our relay server, which forwards requests to public Monero nodes. The relay can see your IP address and those
        requests, and the nodes see the requests and any transaction you broadcast. Neither sees your keys or your balance.
      </Callout>

      {/* 11 */}
      <ChapterHead n={11} id="next" title="After your first XMR" />
      <p>
        Your Monero is in your wallet, and only your keys can move it. That is the point of the whole exercise. Three things
        to do next:
      </p>
      <Steps items={[
        { title: "Double-check your backup", body: <p>Make sure your 25 words are written correctly and stored offline. The <Link href="/monero-seed-phrase">seed phrase guide</Link> covers the details.</p> },
        { title: "Learn to send", body: <p>Try a small payment to yourself or a friend with <Link href="/send-monero">how to send Monero</Link>, then read <Link href="/use-monero">how to use Monero</Link> for everyday habits.</p> },
        { title: "Understand what you hold", body: <p>New to all this? <Link href="/what-is-monero">What is Monero</Link> explains how it hides every payment, in plain English.</p> },
      ]} />
      <p>
        Haven&apos;t set up a wallet yet? <Link href="/create-monero-wallet">Create your Monero wallet</Link> first. It takes
        about two minutes, your recovery words are generated on your device, and <mark>you are ready before you buy</mark>.
      </p>
      <DeepDive paths={["/create-monero-wallet", "/receive-monero", "/what-is-monero"]} label="Your next three reads" />
    </>
  );
}
