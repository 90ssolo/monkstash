import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps } from "@/components/article/parts";
import { ChapterHead, DeepDive, FactStrip, Timeline, UseCases, YoullLearn } from "@/components/pillar/parts";
import { Figure } from "@/components/art/Figure";
import { EmissionShapeArt, HiddenVsLeakArt, LedgerContrastArt, ThreeSecretsArt } from "@/components/art/WhatIsMoneroArt";
import { Adaptive, EmissionShapeNarrow, HiddenVsLeakNarrow, LedgerContrastNarrow, ThreeSecretsNarrow } from "@/components/art/WhatIsMoneroNarrowArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "what-is-monero",
  section: "learn",
  layout: "pillar",
  kicker: "The complete guide",
  title: "What Is Monero (XMR)? The Complete Guide for 2026",
  seoTitle: "What Is Monero (XMR)? The 2026 Guide",
  h1: { keyword: "What is Monero (XMR)?", sizzle: "Money with the curtains closed." },
  summary: "What is Monero? A plain-English guide to XMR: how it hides who paid, who got paid and how much, how it compares to Bitcoin, and how to start safely.",
  keyword: "what is monero",
  updated: "2026-10-15",
  readingMinutes: 22,
  toc: [
    { id: "plain-english", label: "Monero in plain English" },
    { id: "uses", label: "What Monero is used for" },
    { id: "how-it-hides", label: "How Monero hides a payment" },
    { id: "every-coin-equal", label: "Why every coin is equal" },
    { id: "traceable", label: "Can Monero be traced?" },
    { id: "compared", label: "Monero vs Bitcoin, Ethereum and Zcash" },
    { id: "supply", label: "Mining, supply and who runs it" },
    { id: "history", label: "A short history of Monero" },
    { id: "today", label: "Is Monero dead? Where it stands" },
    { id: "safe-legal", label: "Is Monero safe and legal?" },
    { id: "start", label: "How to start using Monero" },
  ],
  chapterBlurbs: {
    "plain-english": "What it is, where it came from, and why people choose it.",
    uses: "Private savings, payments, donations and more.",
    "how-it-hides": "Three tools for three secrets: who paid, who got paid, how much.",
    "every-coin-equal": "No visible history means no tainted coins.",
    traceable: "What the blockchain hides, and what is still your job.",
    compared: "Private by default, versus public or private by choice.",
    history: "From a 2014 launch to rings of 16, in eleven milestones.",
    today: "Harder to buy in places, still busy where it counts.",
    supply: "Mining on ordinary computers, and a small reward that never ends.",
    "safe-legal": "The real risks are scams and lost words, not the code.",
    start: "A wallet, a backup, then your first XMR. In that order.",
  },
  related: ["how-monero-works", "is-monero-traceable", "create-monero-wallet", "monero-vs-bitcoin"],
  sources: [
    { label: "The Monero Project, official website (getmonero.org)", href: "https://www.getmonero.org/" },
    { label: "Moneropedia: Ring signatures", href: "https://www.getmonero.org/resources/moneropedia/ringsignatures.html" },
    { label: "Moneropedia: Stealth addresses", href: "https://www.getmonero.org/resources/moneropedia/stealthaddress.html" },
    { label: "Moneropedia: RingCT (introduced January 2017, mandatory since September 2017)", href: "https://www.getmonero.org/resources/moneropedia/ringCT.html" },
    { label: "Moneropedia: Fungibility", href: "https://www.getmonero.org/resources/moneropedia/fungibility.html" },
    { label: "Moneropedia: Tail emission (began end of May 2022, 0.6 XMR per block)", href: "https://www.getmonero.org/resources/moneropedia/tail-emission.html" },
    { label: "Moneropedia: RandomX", href: "https://www.getmonero.org/resources/moneropedia/randomx.html" },
    { label: "RandomX source code and design notes", href: "https://github.com/tevador/RandomX" },
    { label: "Monero Research Lab", href: "https://www.getmonero.org/resources/research-lab/" },
    { label: "Monero source code (GitHub)", href: "https://github.com/monero-project/monero" },
    { label: "Community Crowdfunding System (CCS)", href: "https://ccs.getmonero.org/" },
    { label: "Monero network upgrade schedule (README, dates of every upgrade)", href: "https://github.com/monero-project/monero#scheduled-softwarenetwork-upgrades" },
    { label: "FCMP++ and Carrot stressnet releases (v0.19.0.0-beta.3.0, September 2026)", href: "https://github.com/seraphis-migration/monero/releases" },
    { label: "The Block: Binance to delist Monero (February 2024)", href: "https://www.theblock.co/post/276176/binance-delisting-monero" },
  ],
  faq: [
    { q: "What is Monero in simple terms?", a: "Monero is digital money that works over the internet without a bank. Unlike most cryptocurrencies, it hides who sent a payment, who received it, and how much was sent, so your financial life is not public by default." },
    { q: "What does XMR stand for?", a: "XMR is the ticker symbol for Monero, in the same way BTC is the ticker for Bitcoin. The word monero means coin in Esperanto." },
    { q: "Is Monero anonymous?", a: "Monero is designed to be far harder to trace than most cryptocurrencies, but no system is perfectly anonymous. Details outside the blockchain, such as your IP address or the exchange where you bought, can still reveal information if you are careless." },
    { q: "Is Monero legal?", a: "In most countries it is legal to own and use Monero. Some regulated exchanges have delisted it in some regions, which affects where you can buy it, not whether you can hold it. Rules differ by country and change over time. This is general information, not legal advice." },
    { q: "Who created Monero?", a: "Monero launched in April 2014, building on the CryptoNote technology first used by Bytecoin. It has been developed since then by a community of volunteers and researchers, funded by public donations rather than by a company." },
    { q: "Can Monero be mined on a normal computer?", a: "Yes. Monero uses the RandomX algorithm, which is designed to run well on ordinary computer processors, so you do not need specialized mining machines." },
    { q: "How is Monero different from Bitcoin?", a: "Bitcoin keeps a public ledger where anyone can follow the money between addresses. Monero hides the sender, receiver and amount of every transaction by default. Bitcoin is accepted in more places; Monero is built for privacy." },
    { q: "Is Monero dead?", a: "No. Several large exchanges have delisted it since 2024, which makes it harder to buy in some places, but the network keeps producing blocks about every two minutes and development continues in public. Its biggest upgrade, FCMP++, was in public beta testing in October 2026, with no mainnet date set yet." },
    { q: "Is Monero a good investment?", a: "We do not give investment advice. Monero's price can move sharply in both directions. This guide explains what Monero is and how it works, so you can make your own decisions. Never put in more than you can afford to lose." },
  ],
};

export function Hero() {
  return <Adaptive wide={<LedgerContrastArt />} narrow={<LedgerContrastNarrow />} />;
}

export function Body() {
  return (
    <>
      <p>
        <strong>What is Monero?</strong> Monero (XMR) is digital cash with the curtains closed. You can send it to anyone,
        anywhere, in about two minutes, and the public record only proves the payment was valid. It does not show{" "}
        <mark>who paid, who got paid, or how much</mark>. That one difference changes what money on the internet can be.
      </p>
      <p>This is the complete guide, written for people who have never touched crypto and for people who have.</p>

      <YoullLearn items={[
        <>What Monero is, where it came from, and why people pick it over Bitcoin</>,
        <>The three tools that hide every payment, explained without math</>,
        <>What Monero <em>cannot</em> hide, and the simple habits that cover the gaps</>,
        <>How mining, supply and funding work when no company is in charge</>,
        <>How to get your first wallet and your first XMR safely</>,
      ]} />
      <p>Let&apos;s get started.</p>

      {/* 1 */}
      <ChapterHead n={1} id="plain-english" title="Monero in plain English" />
      <p>
        Think about paying with a banknote. The shop gets the money. Nobody else learns your name, your balance, or what you
        bought. Now think about paying with most cryptocurrencies. Every payment is written into a public book that anyone on
        earth can read forever. Learn one address, and you can often follow the money from there.
      </p>
      <p>
        Monero brings the banknote feeling online. It still keeps a shared record, a <strong>blockchain</strong>, so nobody can
        spend the same coin twice or create coins out of thin air. But the entries are written so that{" "}
        <mark>only the people involved can read them</mark>. Everyone else sees that valid payments happened, and nothing more.
      </p>
      <KeyFact label="The one-line answer">
        Monero is a cryptocurrency that is <mark>private by default</mark>: every transaction hides the sender, the receiver and
        the amount, with no setting to forget and no opt-in.
      </KeyFact>
      <h3>Where it came from</h3>
      <p>
        Monero launched in April 2014, building on the CryptoNote technology first used by an earlier coin called Bytecoin. The
        name means &quot;coin&quot; in Esperanto, and the ticker is <strong>XMR</strong>. There was no company and no sale to
        investors. Since then it has been built in the open by volunteers, researchers and developers, and its{" "}
        <a href="https://github.com/monero-project/monero" rel="noopener">source code</a> is public for anyone to inspect.
      </p>
      <FactStrip items={[
        { value: "2014", label: "Launched" },
        { value: "~2 min", label: "Per block" },
        { value: "16", label: "Possible signers per payment" },
        { value: "0.6 XMR", label: "Block reward, forever" },
        { value: "Always on", label: "Privacy" },
      ]} />

      {/* 2 */}
      <ChapterHead n={2} id="uses" title="What Monero is used for" />
      <p>
        Monero is money, so people use it for what money is for. The difference is who gets to watch. Here is what that privacy
        is good for in everyday life:
      </p>
      <UseCases items={[
        { icon: "save", title: "Keep savings private", body: "Nobody who learns your address can look up your balance or your history." },
        { icon: "paid", title: "Get paid without a public client list", body: "Freelancers and shops accept payments without publishing who paid them, or how much." },
        { icon: "give", title: "Donate without being watched", body: "Support journalists, activists or open-source projects without landing on a public list." },
        { icon: "world", title: "Send money across borders", body: "Pay anyone, anywhere, in about two minutes, any day of the year, for a small network fee." },
        { icon: "shop", title: "Pay where it is accepted", body: "Some merchants and online services take XMR directly. Others use payment processors." },
        { icon: "shield", title: "Stay off a thief\u2019s radar", body: "A public balance advertises what you hold. A private one does not." },
      ]} />
      <p>
        None of that is exotic. It is the privacy you already expect from cash and from your bank statement. Monero just{" "}
        <mark>keeps it when money moves online</mark>. When you are ready to try it, <Link href="/use-monero">how to use Monero</Link>{" "}
        walks through your first payment.
      </p>

      {/* 3 */}
      <ChapterHead n={3} id="how-it-hides" title="How Monero hides a payment" />
      <p>
        Every payment has three secrets: <strong>who paid</strong>, <strong>who got paid</strong> and <strong>how much</strong>.
        Monero uses a different tool for each one, and it uses all three on every transaction.
      </p>
      <Figure caption="One payment, three secrets, three tools. Monero applies all of them to every transaction, automatically.">
        <Adaptive wide={<ThreeSecretsArt />} narrow={<ThreeSecretsNarrow />} />
      </Figure>
      <h3>Ring signatures hide who paid</h3>
      <p>
        When you spend, your wallet signs the payment together with <mark>15 decoys</mark> pulled from the blockchain, for a ring
        of 16. Anyone can check that one member of the ring signed. Nobody can tell which one. A special tag called a key image
        still stops the same coin from being spent twice. The{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/ringsignatures.html" rel="noopener">Moneropedia entry</a> has
        the formal version.
      </p>
      <h3>Stealth addresses hide who got paid</h3>
      <p>
        You can share one public address with the whole world, but it never appears on the blockchain. Every payment to you lands
        at a <mark>brand-new one-time address</mark> that only your wallet can recognize. Two payments to the same person look
        completely unrelated. For separate public addresses per customer or per site, Monero also has{" "}
        <Link href="/monero-subaddress">subaddresses</Link>.
      </p>
      <h3>RingCT hides how much</h3>
      <p>
        Ring Confidential Transactions encrypt every amount while still letting the network prove that no money was created from
        nothing. They were introduced in January 2017 and have been{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/ringCT.html" rel="noopener">mandatory for every transaction since September 2017</a>.
      </p>
      <Callout title="One more layer: your connection">
        Monero nodes also pass new transactions along in a way designed to hide which computer first sent them, so watching the
        network is less useful for linking a payment to an IP address. Your choice of <Link href="/monero-node">node</Link> still
        matters, which chapter 5 covers.
      </Callout>
      <h3>And the key that only reads</h3>
      <p>
        Privacy does not mean secrecy from yourself or your accountant. Every wallet has a{" "}
        <Link href="/monero-view-key">view key</Link> that shows incoming payments without being able to spend. You can share it
        with an auditor, or use it to watch a wallet from a second device.
      </p>
      <DeepDive paths={["/how-monero-works", "/monero-ring-signatures", "/monero-stealth-address"]} />

      {/* 4 */}
      <ChapterHead n={4} id="every-coin-equal" title="Why every coin is equal" />
      <p>
        A dollar bill is worth a dollar no matter whose pocket it passed through. That property is called{" "}
        <strong>fungibility</strong>, and most cryptocurrencies quietly lack it. On a public ledger every coin carries its full
        history. If a coin once touched an address someone dislikes, an exchange can freeze it, and the person who got it three
        payments later pays the price.
      </p>
      <p>
        Monero coins have <mark>no visible history to judge</mark>. One XMR is interchangeable with any other XMR, which is
        exactly how money is supposed to work. The{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/fungibility.html" rel="noopener">Monero project calls fungibility</a>{" "}
        one of its core goals, and it follows directly from the three tools in chapter 3.
      </p>

      {/* 5 */}
      <ChapterHead n={5} id="traceable" title="Can Monero be traced?" />
      <p>
        Short answer: the blockchain itself is very hard to trace, and the honest risks sit around it. Blockchain analysis
        companies advertise Monero tools, and researchers have found weaknesses in the past, which were fixed by later upgrades
        such as larger rings. Monero&apos;s own <a href="https://www.getmonero.org/resources/research-lab/" rel="noopener">Research Lab</a>{" "}
        publishes this work in the open.
      </p>
      <Figure caption="Monero protects what is on the chain. What happens around it, such as where you bought and what you post, is up to you.">
        <Adaptive wide={<HiddenVsLeakArt />} narrow={<HiddenVsLeakNarrow />} />
      </Figure>
      <p>Most real-world privacy failures happen off the chain. The fixes are simple habits:</p>
      <ul>
        <li><strong>Mind your connection.</strong> A remote node sees your IP address. Use one you trust, run your own, or connect over Tor.</li>
        <li><strong>Remember exchange records.</strong> If you bought on an exchange that verified your ID, that exchange knows what it sold you.</li>
        <li><strong>Don&apos;t post what you want kept.</strong> An address or a screenshot shared publicly is public.</li>
      </ul>
      <p>
        The next big upgrade, known as FCMP++, is designed to replace rings of 16 with proofs over the whole set of past outputs,
        which would make the decoy question disappear. Until it ships, rings remain the protection in use. See{" "}
        <Link href="/monero-fcmp">what FCMP++ changes</Link> for the current status.
      </p>
      <DeepDive paths={["/is-monero-traceable"]} />

      {/* 6 */}
      <ChapterHead n={6} id="compared" title="Monero vs Bitcoin, Ethereum and Zcash" />
      <p>
        Bitcoin proved that money could move without banks. Monero asks a second question: should everyone be able to watch it
        move? Ethereum added programmable money, still on a public ledger. Zcash answers the privacy question differently again.
      </p>
      <table>
        <caption>Monero and the coins it is most often compared with</caption>
        <thead><tr><th>&nbsp;</th><th>Monero (XMR)</th><th>Bitcoin (BTC)</th><th>Ethereum (ETH)</th><th>Zcash (ZEC)</th></tr></thead>
        <tbody>
          <tr><th>Privacy</th><td>On for everyone, always</td><td>Public ledger</td><td>Public ledger</td><td>Optional: each payment is transparent or shielded</td></tr>
          <tr><th>What outsiders see</th><td>Valid payments, nothing else</td><td>Addresses, amounts, full history</td><td>Addresses, amounts, contract activity</td><td>Depends on the payment type</td></tr>
          <tr><th>Block time</th><td>About 2 minutes</td><td>About 10 minutes</td><td>About 12 seconds</td><td>About 75 seconds</td></tr>
          <tr><th>Mining</th><td>Ordinary CPUs (RandomX)</td><td>Specialized ASIC machines</td><td>None: proof of stake since 2022</td><td>Specialized ASIC machines</td></tr>
          <tr><th>Supply</th><td>Small permanent tail reward</td><td>Capped at 21 million</td><td>No fixed cap</td><td>Capped at 21 million</td></tr>
          <tr><th>Where to buy</th><td>Fewer exchanges</td><td>Almost everywhere</td><td>Almost everywhere</td><td>Many exchanges</td></tr>
        </tbody>
      </table>
      <p>
        The key difference with Zcash is <mark>default versus optional</mark>. When privacy is optional and most people skip it,
        the few private payments stand out. On Monero everyone hides in the same crowd. We go deeper in{" "}
        <Link href="/monero-vs-zcash">how Monero and Zcash compare</Link>.
      </p>
      <p>
        Ethereum is a different kind of project: a platform for apps and tokens, where every balance and contract call is public.
        Monero does one job, private payments, and is built entirely around it.
      </p>
      <DeepDive paths={["/monero-vs-bitcoin", "/monero-vs-zcash"]} />

      {/* 7 */}
      <ChapterHead n={7} id="supply" title="Mining, supply and who runs it" />
      <h3>Mining on ordinary computers</h3>
      <p>
        New XMR is created by miners, the computers that bundle transactions into blocks about every two minutes. Monero uses{" "}
        <a href="https://github.com/tevador/RandomX" rel="noopener">RandomX</a>, an algorithm built to run well on regular
        processors and to resist specialized chips. The aim is to keep mining open to ordinary people rather than a few
        warehouse operators. If you want to try, start with <Link href="/mine-monero">our mining guide</Link> and{" "}
        <Link href="/monero-p2pool">P2Pool</Link>, a decentralized way to mine together.
      </p>
      <h3>A small reward that never ends</h3>
      <p>
        Most of Monero&apos;s supply was issued in its first years. Since June 2022 (block 2,641,623), the network has paid a fixed{" "}
        <mark>0.6 XMR per block</mark>, forever. This &quot;tail emission&quot; keeps miners paid to secure the network even when
        fees are tiny, and because the reward is fixed, it adds a shrinking percentage to the supply each year.
      </p>
      <Figure caption="The shape of Monero's supply: fast early issuance, then a small fixed tail from June 2022. A sketch, not to scale.">
        <Adaptive wide={<EmissionShapeArt />} narrow={<EmissionShapeNarrow />} />
      </Figure>
      <h3>No company in charge</h3>
      <p>
        No firm owns Monero, and no one can reverse a payment or freeze an account. Development is funded by donations through the{" "}
        <a href="https://ccs.getmonero.org/" rel="noopener">Community Crowdfunding System</a>, research happens in public, and
        anyone can run a <Link href="/monero-node">Monero node</Link> to check every rule for themselves.
      </p>
      <DeepDive paths={["/mine-monero", "/monero-node"]} label="Go deeper (nodes and mining)" />

      {/* 8 */}
      <ChapterHead n={8} id="history" title="A short history of Monero" />
      <p>
        Monero improves through scheduled network upgrades. Each one is announced in advance, and the{" "}
        <a href="https://github.com/monero-project/monero#scheduled-softwarenetwork-upgrades" rel="noopener">full schedule is public</a>.
        The milestones that matter most:
      </p>
      <Timeline items={[
        { when: "Apr 2014", title: "Launch", body: "Monero goes live, building on CryptoNote, with no company and no presale." },
        { when: "Mar 2016", title: "Two-minute blocks", body: "Block time is set to about 120 seconds, where it remains today." },
        { when: "Jan 2017", title: "Hidden amounts arrive", body: "RingCT goes live. From September 2017 it is required for every transaction." },
        { when: "Oct 2018", title: "Bulletproofs", body: "A new proof system makes transactions much smaller and fees much lower." },
        { when: "Nov 2019", title: "RandomX mining", body: "Mining switches to RandomX, built for ordinary computer processors." },
        { when: "Oct 2020", title: "CLSAG signatures", body: "Smaller, faster ring signatures cut transaction size again." },
        { when: "June 2022", title: "Tail emission begins", body: "The block reward settles at 0.6 XMR, permanently." },
        { when: "Aug 2022", title: "Rings of 16", body: "Every payment now hides among 16 possible signers. Bulletproofs+ and view tags make transactions lighter and wallet syncing faster." },
        { when: "Feb 2024", title: "Binance delists XMR", body: "The largest exchange drops Monero, part of a wider wave of delistings in some regions." },
        { when: "Jan 2026", title: "MyMonero closes", body: "The long-running web wallet shuts down, and phishing clones move in." },
        { when: "Next", title: "FCMP++", body: "A planned upgrade that would replace rings with proofs over the whole chain. No date has been set.", upcoming: true },
      ]} />

      {/* 9 */}
      <ChapterHead n={9} id="today" title="Is Monero dead? Where it stands" />
      <p>
        No. But the honest answer has two sides. Since 2024, several large exchanges have removed Monero, some worldwide and some
        only in certain regions. That makes it <mark>harder to buy in some places</mark>, and it is the main reason people ask.
      </p>
      <p>
        Meanwhile the network itself has not missed a beat. Blocks keep arriving about every two minutes, the{" "}
        <a href="https://github.com/monero-project/monero" rel="noopener">code</a> keeps changing in public, and the FCMP++
        upgrade is in public testing: its developers{" "}
        <a href="https://github.com/seraphis-migration/monero/releases" rel="noopener">published a third beta test network</a>{" "}
        in September 2026, with no mainnet date set as of 15 October 2026. Our guide to{" "}
        <Link href="/monero-fcmp">FCMP++ and what it changes for you</Link> tracks it. Community-funded work is listed openly on the{" "}
        <a href="https://ccs.getmonero.org/" rel="noopener">CCS</a>. Ways to get XMR have shifted toward peer-to-peer trades and
        swap services, which our <Link href="/buy-monero">buying guide</Link> covers.
      </p>
      <Callout title="Is Monero a good investment?">
        We don&apos;t give investment advice. This guide explains what Monero is and how it works. Its price can swing hard in
        both directions, so never put in more than you can afford to lose.
      </Callout>

      {/* 10 */}
      <ChapterHead n={10} id="safe-legal" title="Is Monero safe and legal?" />
      <p>
        Monero&apos;s cryptography has been studied and attacked in public for over a decade. The risks that actually cost people
        money are more ordinary:
      </p>
      <ul>
        <li><strong>Fake wallet sites.</strong> Since MyMonero closed in January 2026, clones of it have been <Link href="/monero-phishing-sites">phishing for recovery words</Link>.</li>
        <li><strong>Lost recovery words.</strong> There is no support desk. If your <Link href="/monero-seed-phrase">seed phrase</Link> is gone and your device fails, so is the money.</li>
        <li><strong>Price swings.</strong> XMR can rise or fall quickly. This is not financial advice.</li>
      </ul>
      <p>
        On the legal side, owning and using Monero is legal in most countries. Some regulated exchanges have delisted it in
        certain regions, which changes <em>where you can buy</em>, not whether you can hold it. Rules differ and change, so check
        where you live. This is general information, not legal advice.
      </p>
      <DeepDive paths={["/is-monero-safe", "/is-monero-legal"]} />

      {/* 11 */}
      <ChapterHead n={11} id="start" title="How to start using Monero" />
      <p>Getting started takes three steps, in this order:</p>
      <Steps items={[
        { title: "Get a wallet you control", body: <p>A non-custodial wallet keeps your keys on your own device. <Link href={walletUrl}>MonkStash</Link> runs in your browser with nothing to install; see <Link href="/monero-wallets">the best Monero wallets</Link> for desktop, phone and hardware options.</p> },
        { title: "Write down your 25 recovery words", body: <p>On paper, offline, somewhere safe. They are your money. Our <Link href="/monero-seed-phrase">seed phrase guide</Link> shows how to store them.</p> },
        { title: "Get your first XMR", body: <p>Receive it from someone, or <Link href="/buy-monero">buy a small amount</Link> while you learn. Then follow <Link href="/use-monero">how to use Monero</Link> for your first send and receive.</p> },
      ]} />
      <p>
        Ready? You can <Link href="/create-monero-wallet">create a Monero wallet in about two minutes</Link>. Your recovery words
        are generated and encrypted on your device, and they never touch a server.
      </p>
      <DeepDive paths={["/create-monero-wallet", "/use-monero", "/buy-monero"]} label="Your next three reads" />
    </>
  );
}
