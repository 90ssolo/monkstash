import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps } from "@/components/article/parts";
import { ChapterHead, DeepDive, FactStrip, UseCases, YoullLearn } from "@/components/pillar/parts";
import { Figure } from "@/components/art/Figure";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { AddressTypesArt, JourneyArt, PaymentClockArt, ProvePaymentArt, TroubleshootArt } from "@/components/art/UseMoneroPillarArt";
import { AddressTypesNarrow, JourneyNarrow, PaymentClockNarrow, ProvePaymentNarrow, TroubleshootNarrow } from "@/components/art/UseMoneroPillarNarrowArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "use-monero",
  section: "guides",
  layout: "pillar",
  kicker: "The complete guide",
  title: "How to Use Monero (XMR): The Complete Guide for 2026",
  seoTitle: "How to Use Monero (XMR): The 2026 Guide",
  h1: { keyword: "How to use Monero", sizzle: "Six steps to private money." },
  summary: "How to use Monero, step by step: set up and back up a wallet, receive and send XMR, understand fees and confirmations, and fix common wallet problems.",
  keyword: "how to use Monero",
  updated: "2026-10-25",
  readingMinutes: 21,
  toc: [
    { id: "journey", label: "How to use Monero: the whole journey" },
    { id: "wallet", label: "How to use a Monero wallet (and back it up)" },
    { id: "get-xmr", label: "How to get your first XMR" },
    { id: "address", label: "What is my Monero address?" },
    { id: "receive", label: "How to receive Monero" },
    { id: "send", label: "How to send Monero" },
    { id: "fees-time", label: "How much it costs and how long it takes" },
    { id: "check", label: "How to check or prove a payment" },
    { id: "problems", label: "Wallet not syncing or showing zero?" },
    { id: "privacy", label: "How to use Monero anonymously" },
    { id: "spend", label: "Where can you spend Monero?" },
  ],
  chapterBlurbs: {
    journey: "Six steps, in order. Three of them you only do once.",
    wallet: "Pick a wallet you control, then write down 25 words.",
    "get-xmr": "The routes that exist, and the test payment that saves you.",
    address: "Primary, subaddress, integrated: which one to share.",
    receive: "Share an address or a QR code, then wait for 10 blocks.",
    send: "Paste, check, confirm. And why there is no undo.",
    "fees-time": "Tiny fees, two-minute blocks, twenty minutes to spend.",
    check: "Look up a transaction, or prove you paid with a signed proof.",
    problems: "Three questions that fix most wallet scares.",
    privacy: "What Monero hides for you, and the habits that cover the rest.",
    spend: "Where XMR is accepted, and your first-day checklist.",
  },
  related: ["what-is-monero", "send-monero", "receive-monero", "monero-seed-phrase", "buy-monero", "monero-phishing-sites"],
  sources: [
    { label: "Monero project: Accepting Monero (at least 10 confirmations before spending)", href: "https://www.getmonero.org/get-started/accepting/" },
    { label: "Moneropedia: Address (95 characters, starting with 4 or 8; integrated addresses are 106)", href: "https://www.getmonero.org/resources/moneropedia/address.html" },
    { label: "Monero docs: Subaddresses", href: "https://docs.getmonero.org/public-address/subaddress/" },
    { label: "Monero docs: Integrated address (address plus an 8-byte payment ID)", href: "https://docs.getmonero.org/public-address/integrated-address/" },
    { label: "Monero source: cryptonote_config.h (120-second block target, 10-block spendable age)", href: "https://raw.githubusercontent.com/monero-project/monero/master/src/cryptonote_config.h" },
    { label: "Monero URI scheme (the format behind payment QR codes)", href: "https://github.com/monero-project/monero/blob/master/docs/URI_SCHEME.md" },
    { label: "Monero user guide: How to prove a payment", href: "https://www.getmonero.org/resources/user-guides/prove-payment.html" },
    { label: "Monero docs: monero-wallet-cli reference (transaction and reserve proofs)", href: "https://docs.getmonero.org/interacting/monero-wallet-cli-reference/" },
    { label: "Monero user guide: Using a remote node (privacy trade-offs)", href: "https://www.getmonero.org/resources/user-guides/remote_node_gui.html" },
    { label: "Monero project: Downloads and how to verify them", href: "https://www.getmonero.org/downloads/" },
    { label: "Monero project: Merchants and exchanges (listings are not endorsements)", href: "https://www.getmonero.org/community/merchants/" },
  ],
  faq: [
    { q: "How do I start using Monero?", a: "Get a wallet you control, write down the 25 recovery words it shows you, and get a small amount of XMR into it. After that, using Monero is three repeating moves: receive by sharing an address, send by pasting someone else's address, and wait for confirmations." },
    { q: "Do I need to download anything to use Monero?", a: "Not necessarily. Desktop and phone wallets are apps you install. A browser wallet such as MonkStash runs on a web page with nothing to download. The trade-off is that a browser wallet depends on the browser and device being kept clean and up to date." },
    { q: "How long does a Monero transaction take?", a: "The recipient's wallet usually sees a payment within seconds. It gets its first confirmation when the next block is found, about two minutes on average, and becomes spendable after 10 confirmations, roughly 20 minutes. Block times vary, so these are averages." },
    { q: "How much does it cost to send Monero?", a: "Fees go to the network, not to a company, and they depend on the size of the transaction in bytes rather than the amount sent. They are usually a small fraction of an XMR. Your wallet shows the exact fee before you confirm, so use that number rather than one from a guide." },
    { q: "Can a Monero transaction be reversed or cancelled?", a: "No. Once a payment is broadcast, nobody can reverse it, and there is no chargeback. That is why you check the address carefully and send a small test amount first when the payment matters." },
    { q: "Why does my Monero wallet show a balance I cannot spend?", a: "Newly received funds, and the change from your own sends, are locked until they have 10 confirmations, about 20 minutes. Your wallet shows them as locked or not yet spendable, and they unlock by themselves." },
    { q: "Can someone see my Monero balance from my address?", a: "No. A Monero address does not reveal its balance or history to anyone looking at the blockchain. Only someone with your private view key can see incoming payments, which is why you share that key only with people you choose." },
    { q: "How do I prove I sent a Monero payment?", a: "Give the recipient (or whoever needs proof) a signed payment proof together with the transaction ID and the recipient's address. Their wallet can check it and show how much that transaction sent to that address. MonkStash, Feather and the official GUI and CLI wallets support this. Avoid sharing the transaction key: with your main address it can reveal your change." },
    { q: "Is it legal to use Monero?", a: "In most countries owning and using Monero is legal, but rules differ by country and some exchanges restrict it in some regions. Check the rules where you live. This is general information, not legal advice." },
  ],
};

export function Hero() {
  return <Adaptive wide={<JourneyArt />} narrow={<JourneyNarrow />} />;
}

export function Body() {
  return (
    <>
      <p>
        <strong>How to use Monero</strong> comes down to six steps: get a wallet, back up its 25 words, get some XMR, then
        receive, send and wait for confirmations. The first three happen once. After that, Monero works like{" "}
        <mark>cash you can hand over the internet</mark>: you share an address, someone pays it, and twenty minutes later the
        money is fully yours to spend.
      </p>
      <p>
        This guide walks the whole path, from an empty screen to a payment you can prove. It also covers the parts most guides
        skip: which address to share, why your balance sometimes looks frozen, and what to do when a wallet will not sync.
      </p>

      <YoullLearn items={[
        <>How to set up a wallet and a backup that will actually save you</>,
        <>Which Monero address to share, and why it changes your privacy</>,
        <>How to receive and send XMR without the classic beginner mistakes</>,
        <>What fees cost, how long payments take, and how to prove you paid</>,
        <>How to fix a wallet that will not sync, connect or show your balance</>,
      ]} />
      <p>Let&apos;s get started.</p>

      {/* 1 */}
      <ChapterHead n={1} id="journey" title="How to use Monero: the whole journey" />
      <p>
        If you have used a banking app, you already know most of what Monero asks of you. You have a balance, an address people
        pay into (like an account number), and a send button. Three things are different, and they are worth knowing before you
        touch any money.
      </p>
      <ul>
        <li><strong>You are the bank.</strong> Nobody can freeze your wallet, and nobody can reset it for you. Your 25 recovery words are the only spare key.</li>
        <li><strong>Payments are final.</strong> There is no chargeback and no support line that can pull money back.</li>
        <li><strong>Privacy is the default.</strong> The blockchain hides who paid, who got paid and how much. You do not switch anything on.</li>
      </ul>
      <p>
        That last point is why people choose Monero in the first place. If you want the background first, our guide to{" "}
        <Link href="/what-is-monero">what Monero is and how it hides payments</Link> covers it in plain English. You do not need
        it to follow this guide, any more than you need to understand card networks to pay with a card.
      </p>
      <p>
        The map at the top of this page shows the whole journey. Steps 1 to 3 happen once. Step 2, the backup, is the one that
        cannot wait: once a device is lost, it is too late to write the words down. It gets its own section in the next
        chapter.
      </p>
      <p>Here are the numbers worth remembering. Every one of them comes up again later in this guide.</p>
      <FactStrip items={[
        { value: "~2 min", label: "Average time per block" },
        { value: "10", label: "Confirmations before you can spend" },
        { value: "~20 min", label: "Until received XMR is spendable" },
        { value: "4 or 8", label: "First character of an address" },
        { value: "25", label: "Recovery words to write down" },
      ]} />

      {/* 2 */}
      <ChapterHead n={2} id="wallet" title="How to use a Monero wallet (and back it up)" />
      <p>
        A Monero wallet does not hold coins the way a purse holds cash. The coins live on the blockchain. The wallet holds the{" "}
        <mark>keys that prove the coins are yours</mark>, shows your balance, and builds payments. That is why the most important
        question about any wallet is simple: who has the keys?
      </p>
      <p>
        Pick a <strong>non-custodial</strong> wallet, meaning the keys are created and kept on your own device. A custodial
        service (an exchange account, for example) holds the keys for you, which also means it can freeze, lose or limit your
        money.
      </p>
      <table>
        <caption>The four common kinds of Monero wallet</caption>
        <thead><tr><th>Kind</th><th>Good for</th><th>Trade-off</th></tr></thead>
        <tbody>
          <tr><th>Desktop wallet</th><td>Larger amounts and full control, including running your own node</td><td>Install and first sync take time and disk space</td></tr>
          <tr><th>Phone wallet</th><td>Everyday payments on the go</td><td>A phone can be lost, stolen or infected, so the backup matters</td></tr>
          <tr><th>Browser wallet</th><td>Starting with nothing to install</td><td>Depends on a clean, up-to-date browser and device</td></tr>
          <tr><th>Hardware wallet</th><td>Long-term savings</td><td>Costs money and adds setup steps</td></tr>
        </tbody>
      </table>
      <p>
        Our <Link href="/monero-wallets">comparison of the best Monero wallets</Link> goes through the options. The official GUI
        and CLI wallets come from the{" "}
        <a href="https://www.getmonero.org/downloads/" rel="noopener">getmonero.org downloads page</a>, which also explains how to
        verify the file before you run it. Whatever you choose, reach the site from a bookmark or a link you trust.
      </p>
      <p>
        If you would rather start with nothing to install, you can{" "}
        <Link href="/create-monero-wallet">create a Monero wallet in your browser</Link> with MonkStash. It is free and
        non-custodial: your keys are generated and encrypted on your device and never sent to a server. You set a wallet
        password, and you can add an authenticator app code (TOTP) and auto-lock.
      </p>
      <Callout title="Honest trade-offs for MonkStash">
        It is an early preview and has not been independently audited, so start with a small amount. It reaches the network through
        our relay to public nodes for now (chapter 10 explains who can see what). The browser extension is planned but not
        available, and phone support is still being tested. For larger sums, a hardware or
        well-established desktop wallet may suit you better.
      </Callout>
      <h3>Back up your 25 words before anything else</h3>
      <p>
        When you create a wallet, it shows you 25 recovery words. Write them on paper, in order, with a pen. This is the most
        important two minutes of the whole process. If your device dies, is lost or gets wiped, those words rebuild the wallet
        on any device. <mark>Nobody can reset them for you.</mark>
      </p>
      <ul>
        <li>Keep them offline. No photo, no screenshot, no cloud note.</li>
        <li>Keep a second copy in a different place.</li>
        <li>Never type them into a site you reached from an ad, an email or a direct message.</li>
      </ul>
      <p>
        Your wallet password is a different thing. It only unlocks the wallet on one device. The words are the wallet itself.
        Before you trust a wallet with real money, prove the backup works by{" "}
        <Link href="/restore-monero-wallet">restoring it from the words</Link> on a second device or a fresh browser profile.
      </p>
      <DeepDive paths={["/create-monero-wallet", "/monero-seed-phrase", "/back-up-monero-wallet"]} />

      {/* 3 */}
      <ChapterHead n={3} id="get-xmr" title="How to get your first XMR" />
      <p>
        This step depends most on where you live, because the places that sell Monero differ by country and change over time.
        The main routes are:
      </p>
      <ul>
        <li><strong>Exchanges.</strong> You pay with a card or bank transfer, then withdraw to your own wallet. Most ask for identity verification.</li>
        <li><strong>Peer-to-peer marketplaces.</strong> You buy directly from another person. More private, but you need to choose who you trade with carefully.</li>
        <li><strong>Swap services.</strong> You send another cryptocurrency and receive XMR at your address. Fees and limits vary.</li>
        <li><strong>Earning it.</strong> Freelancers and sellers can ask to be paid in XMR.</li>
      </ul>
      <p>
        Our <Link href="/buy-monero">guide to buying Monero</Link> compares these routes and the risks of each. Whichever you
        pick, the order of operations is the same: create your wallet, back it up, then copy your receiving address into the
        exchange or service.
      </p>
      <KeyFact label="The habit that saves people">
        Send a <mark>small test amount first</mark>. Wait for it to arrive in your own wallet, then send the rest. It costs one
        extra network fee and catches every wrong address before it matters.
      </KeyFact>
      <p>
        One more thing to expect: an exchange may ask for more than 10 confirmations before it credits a deposit, and it may hold
        a withdrawal for its own checks. That waiting is the exchange&apos;s policy, not the Monero network.
      </p>
      <DeepDive paths={["/buy-monero", "/is-monero-legal"]} />

      {/* 4 */}
      <ChapterHead n={4} id="address" title="What is my Monero address?" />
      <p>
        Your address is what you give people so they can pay you. A standard Monero address is a{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/address.html" rel="noopener">string of 95 characters starting with a 4 or an 8</a>.
        It is safe to share: <mark>an address cannot be used to take money from you</mark>, and nobody can look up its balance
        on the blockchain.
      </p>
      <p>
        Here is the part most new users miss. Monero has three kinds of address, and they all pay into the same wallet. Which one
        you share changes how much the people paying you can learn about each other.
      </p>
      <Figure caption="Three kinds of Monero address. All of them pay into the same wallet and the same balance.">
        <Adaptive wide={<AddressTypesArt />} narrow={<AddressTypesNarrow />} />
      </Figure>
      <table>
        <caption>Primary address, subaddress and integrated address compared</caption>
        <thead><tr><th>&nbsp;</th><th>Primary address</th><th>Subaddress</th><th>Integrated address</th></tr></thead>
        <tbody>
          <tr><th>Starts with</th><td>4</td><td>8</td><td>A longer address with a payment ID inside</td></tr>
          <tr><th>Length</th><td>95 characters</td><td>95 characters</td><td>106 characters</td></tr>
          <tr><th>How many</th><td>One per wallet</td><td>As many as you need</td><td>One per payment ID</td></tr>
          <tr><th>Best for</th><td>Backups and your own records</td><td>Everyday use: one per payer or purpose</td><td>Shops and exchanges sorting deposits</td></tr>
          <tr><th>Can payers link it to you?</th><td>Anyone who has it knows it is you</td><td>Two payers cannot tell they paid the same wallet</td><td>Shares the primary address underneath</td></tr>
        </tbody>
      </table>
      <h3>Why subaddresses are the everyday choice</h3>
      <p>
        If you give the same address to your employer, a friend and a client, any two of them could compare notes and learn they
        paid the same person. Give each one its own subaddress and they cannot. The{" "}
        <a href="https://docs.getmonero.org/public-address/subaddress/" rel="noopener">Monero documentation</a> suggests exactly
        this: generate a new subaddress for each payer. Your wallet still sees every payment, because all subaddresses come from
        the same keys.
      </p>
      <p>
        Integrated addresses are mostly for businesses. They bundle your address with an{" "}
        <a href="https://docs.getmonero.org/public-address/integrated-address/" rel="noopener">8-byte payment ID</a>, so a shop
        or exchange can match each payment to an order or customer. The same docs recommend subaddresses for individuals. If an
        exchange gives you an integrated address for a deposit, copy it exactly as shown.
      </p>
      <p>
        Before you send to any address, you can paste it into our free{" "}
        <Link href="/tools/monero-address-validator">Monero address validator</Link>. It checks that the address is well formed
        and tells you which kind it is.
      </p>
      <Callout title="Free tool: check an address before you pay">
        The <Link href="/tools/monero-address-validator">address validator</Link> runs in your browser and catches typos and
        truncated pastes. It cannot tell you who owns an address, so still compare the first and last characters with the
        person you are paying.
      </Callout>
      <DeepDive paths={["/monero-subaddress", "/monero-view-key"]} />

      {/* 5 */}
      <ChapterHead n={5} id="receive" title="How to receive Monero" />
      <p>
        Receiving is the easy half. You never need to be online when someone pays you. You only need to give them an address,
        and your wallet <mark>finds the payment the next time it syncs</mark>.
      </p>
      <Steps items={[
        { title: "Open your wallet and find the receive screen", body: <p>Most wallets call it Receive. In <Link href={walletUrl}>the MonkStash wallet</Link> it is the receive card on the dashboard, with your address and a QR code.</p> },
        { title: "Make a fresh subaddress for this payer", body: <p>Use the new address button. One subaddress per person or purpose keeps payers from linking each other.</p> },
        { title: "Share it as text or as a QR code", body: <p>Copy the text, or let the sender scan the QR code with their wallet. Either way, ask them to check the first and last characters.</p> },
        { title: "Wait for the payment and its confirmations", body: <p>It usually appears within seconds as unconfirmed. It becomes spendable after 10 confirmations, about 20 minutes.</p> },
      ]} />
      <h3>What a Monero QR code contains</h3>
      <p>
        A Monero QR code is your address, written in a standard format that starts with <code>monero:</code>. The{" "}
        <a href="https://github.com/monero-project/monero/blob/master/docs/URI_SCHEME.md" rel="noopener">Monero URI scheme</a>{" "}
        can also carry an amount and a short description, which is how shops show a ready-to-pay code at checkout. The sender
        scans it and their wallet fills in the details. Scanning only reads the code. It never gives anyone access to your
        wallet.
      </p>
      <p>
        Two details trip up beginners. First, your wallet must be synced to see a new payment, so if nothing shows up, check the
        sync status before you worry. Second, a payment can appear while still locked. That is normal, and chapter 7 explains the
        wait.
      </p>
      <DeepDive paths={["/receive-monero"]} />

      {/* 6 */}
      <ChapterHead n={6} id="send" title="How to send Monero" />
      <p>
        Sending takes about a minute. Your wallet builds and signs the payment on your own device, hides it among decoys, and
        hands it to the network. You only see four moves:
      </p>
      <Steps items={[
        { title: "Paste or scan the recipient's address", body: <p>Copy it from the person or shop you are paying, or scan their QR code. Never type an address by hand.</p> },
        { title: "Enter the amount", body: <p>If you scanned a code with an amount in it, the wallet may fill it in. Check it against what you agreed.</p> },
        { title: "Review the fee and the total", body: <p>A good wallet shows the network fee before you commit. MonkStash shows the fee and the total on a review screen.</p> },
        { title: "Confirm, and keep the transaction ID", body: <p>After sending, your wallet shows a transaction ID (tx ID). Keep it until the recipient confirms they have the money.</p> },
      ]} />
      <Callout kind="warn" title="There is no undo">
        Monero payments cannot be reversed or charged back. A wrong address, a fake checkout page or a scammer means the money is
        gone. Compare the first and last few characters of the address on both ends, and send a small test first when the
        amount matters.
      </Callout>
      <h3>Why your balance drops more than you sent</h3>
      <p>
        Monero spends whole earlier payments, like paying with a banknote. If you pay 0.3 XMR from a 1 XMR payment you received,
        the leftover comes back to you as <strong>change</strong>. That change is a new payment to yourself, so it follows the
        same 10-confirmation lock. For about 20 minutes after a send, your spendable balance can look lower than you expect.{" "}
        <mark>It unlocks by itself.</mark>
      </p>
      <h3>Sending to an exchange or a shop</h3>
      <p>
        Use exactly the address the service shows you for this deposit or this order, including any integrated address. Some
        services create a fresh address per order and stop watching it after a time limit, so pay promptly and pay the amount
        shown.
      </p>
      <DeepDive paths={["/send-monero"]} />

      {/* 7 */}
      <ChapterHead n={7} id="fees-time" title="How much it costs and how long it takes" />
      <h3>Monero fees: small, and based on size</h3>
      <p>
        Every Monero payment pays a fee to the miners who add it to a block. No company takes a cut. The fee depends on the{" "}
        <mark>size of the transaction in bytes, not the amount you send</mark>, and on how busy the network is. Sending 0.01 XMR
        and sending 100 XMR cost about the same, as long as the transactions are a similar size.
      </p>
      <p>
        In practice the fee is usually a tiny fraction of one XMR. Many wallets let you choose a priority level: a higher priority
        pays more per byte and matters only when blocks are busy. Because the rate moves, always read the fee your wallet shows
        on the review screen rather than a number printed in a guide.
      </p>
      <h3>How long a Monero payment takes</h3>
      <p>
        Monero targets one block every two minutes. The setting is{" "}
        <a href="https://raw.githubusercontent.com/monero-project/monero/master/src/cryptonote_config.h" rel="noopener">120 seconds in the source code</a>.
        A payment moves through four stages:
      </p>
      <Figure caption="One payment, four moments. The 10-block wait applies to money you are about to spend, not to seeing it arrive.">
        <Adaptive wide={<PaymentClockArt />} narrow={<PaymentClockNarrow />} />
      </Figure>
      <p>
        That 10-block rule is built into the protocol: the same source file sets the spendable age to 10 blocks, and the{" "}
        <a href="https://www.getmonero.org/get-started/accepting/" rel="noopener">Monero project&apos;s guide for merchants</a>{" "}
        says you need at least 10 confirmations before you can spend the funds. It protects everyone against the chain briefly
        reorganizing. So &quot;how long does it take?&quot; has two honest answers: <mark>seconds to see it, about 20 minutes to
        spend it</mark>.
      </p>
      <Callout title="Blocks arrive by chance">
        Two minutes is an average. Sometimes a block comes in seconds, sometimes it takes ten minutes or more. If a payment has not
        confirmed after a while, it is usually just waiting for the next block.
      </Callout>
      <DeepDive paths={["/monero-transaction-fee", "/monero-transaction-time"]} />

      {/* 8 */}
      <ChapterHead n={8} id="check" title="How to check or prove a payment" />
      <p>
        On Bitcoin you can paste an address into a block explorer and watch its balance. On Monero you cannot, and that is the
        point. A block explorer can show that a transaction exists, which block it landed in, how many confirmations it has and
        what fee it paid. It cannot show <mark>who sent it, who received it or how much</mark>.
      </p>
      <h3>Check your own payments</h3>
      <p>
        The simplest check is your wallet&apos;s history. MonkStash lists each payment with its confirmation count (for example,
        &quot;Confirming (4 of 10)&quot;) and lets you copy its transaction ID. Paste that ID into a block explorer to see the
        block and confirmations from an independent source.
      </p>
      <p>
        To let someone else watch your incoming payments without being able to spend, such as an accountant, Monero has a{" "}
        <Link href="/monero-view-key">private view key</Link>. A <Link href="/monero-view-only-wallet">view-only wallet</Link>{" "}
        built from it sees what comes in. Share it only with people you trust, because it reveals your incoming history.
      </p>
      <h3>Prove that you paid someone</h3>
      <p>
        Say a seller claims your payment never arrived. You can prove it with three pieces of information: the transaction ID, the recipient&apos;s address and a{" "}
        <strong>signed payment proof</strong>. Older guides, including the{" "}
        <a href="https://www.getmonero.org/resources/user-guides/prove-payment.html" rel="noopener">official prove-payment guide</a>, use
        the transaction key instead, but a flaw <a href="https://github.com/monero-project/monero/issues/11586" rel="noopener">reported in October 2026</a> showed that the key plus your main address reveals your change. A signed
        proof does the same job without that leak.
      </p>
      <Figure caption="A payment proof shows one payment to one address. It reveals nothing else about your wallet.">
        <Adaptive wide={<ProvePaymentArt />} narrow={<ProvePaymentNarrow />} />
      </Figure>
      <p>
        In MonkStash, open the payment and choose Prove this payment. In the official GUI wallet, use Advanced, Prove/Check, and
        the other person checks it in the same place. In the CLI wallet the commands are <code>get_tx_proof</code> and{" "}
        <code>check_tx_proof</code>, and the wallet must be set to save transaction details before you send. One limit is worth knowing: the{" "}
        <a href="https://docs.getmonero.org/interacting/monero-wallet-cli-reference/" rel="noopener">CLI reference</a> notes that
        a proof shows funds were sent to an address, not that they are still unspent. For proving a balance, the CLI has a
        separate reserve proof.
      </p>
      <DeepDive paths={["/monero-transaction-lookup", "/monero-view-only-wallet"]} />

      {/* 9 */}
      <ChapterHead n={9} id="problems" title="Wallet not syncing or showing zero?" />
      <p>
        Few things are as alarming as opening your wallet and seeing 0 XMR. Take a breath. On Monero the money lives on the
        blockchain, not in the app, so a wrong balance almost always means <mark>the wallet has not finished looking</mark>. Work
        through three questions in order.
      </p>
      <Figure caption="Most balance scares have one of three causes. Ask the questions in this order.">
        <Adaptive wide={<TroubleshootArt />} narrow={<TroubleshootNarrow />} />
      </Figure>
      <h3>1. Is the wallet connected?</h3>
      <p>
        Your wallet needs a <Link href="/monero-node">Monero node</Link> to read the blockchain. If it says disconnected, or
        cannot reach the daemon, the usual causes are a node that is down, a wrong port or address, or a wallet pointed at the
        wrong network (mainnet versus a test network). Switching to another node fixes most cases.
      </p>
      <h3>2. Is it fully synced?</h3>
      <p>
        A wallet scans every block since its restore height for payments that belong to you. A fresh restore can take a while,
        and a phone or browser wallet scanning a long history is slower than a desktop. If the blocks-remaining count keeps
        falling, wait. If it never moves, the node is the usual suspect.
      </p>
      <h3>3. Synced, but still zero?</h3>
      <p>
        Then check three things. Was the wallet restored with a{" "}
        <Link href="/monero-restore-height">restore height</Link> later than your first payment? If so, it skipped them; restore
        again with an earlier height. Are the funds just locked for the 10-block wait? And is this the right wallet, network and
        account? Different recovery words open a different wallet, so make sure these are the words of the wallet that was paid.
      </p>
      <DeepDive paths={["/monero-wallet-not-syncing", "/monero-wallet-not-connecting", "/monero-wallet-not-showing-balance"]} label="Fix it, step by step" />

      {/* 10 */}
      <ChapterHead n={10} id="privacy" title="How to use Monero anonymously" />
      <p>
        Honest answer first: nothing makes you perfectly anonymous. But Monero gets you much closer than most money, and it does
        the hard part automatically. Every payment hides the sender, the receiver and the amount on the blockchain. What is left
        is <mark>what happens around the blockchain</mark>, and that is where your habits come in.
      </p>
      <h3>Know what your node can see</h3>
      <p>
        If you use someone else&apos;s node, it sees your IP address and the transactions your wallet broadcasts through it,
        though not your keys or your balance. The{" "}
        <a href="https://www.getmonero.org/resources/user-guides/remote_node_gui.html" rel="noopener">Monero remote node guide</a>{" "}
        warns that some public nodes are run to try to link IP addresses to transactions. Its recommendation, in order: run your
        own node, use a remote node you trust, and prefer Tor or I2P connections when privacy matters most.
      </p>
      <p>
        MonkStash currently reaches the network through our relay server, which forwards requests to public nodes. The relay
        can see your IP address, and the nodes see the requests and transactions you broadcast; neither sees your keys. Our
        guides to{" "}
        <Link href="/monero-remote-node">remote node privacy</Link> and{" "}
        <Link href="/run-a-monero-node">running your own node</Link> explain the options.
      </p>
      <h3>Six habits that cover the gaps</h3>
      <ul>
        <li><strong>Use a fresh subaddress per payer.</strong> It stops payers from linking you.</li>
        <li><strong>Remember where you bought.</strong> An exchange that checked your ID knows it sold you XMR and where it sent it.</li>
        <li><strong>Do not post addresses or screenshots</strong> you want kept private. Public is public.</li>
        <li><strong>Share your view key rarely.</strong> It reveals every incoming payment.</li>
        <li><strong>Mind your connection.</strong> A trusted node, your own node, or Tor.</li>
        <li><strong>Talk less about amounts.</strong> What you say leaks more than any blockchain.</li>
      </ul>
      <Callout kind="warn" title="The scam that targets new users">
        Fake wallet sites copy real ones and ask for your 25 words. Since MyMonero closed in January 2026, clones of it have been
        a common trap. No real wallet, exchange or support person will ever ask for your words. Read{" "}
        <Link href="/monero-phishing-sites">how to spot a Monero phishing site</Link> before you search for a wallet.
      </Callout>
      <DeepDive paths={["/is-monero-traceable", "/monero-remote-node", "/monero-phishing-sites"]} />

      {/* 11 */}
      <ChapterHead n={11} id="spend" title="Where can you spend Monero?" />
      <p>
        Monero is money, so what you can do with it depends on who accepts it. Acceptance is smaller than for Bitcoin and it
        changes over time, but the uses are real:
      </p>
      <UseCases items={[
        { icon: "shop", title: "Shops that list XMR", body: "Some online stores and services take Monero at checkout, directly or through a payment processor." },
        { icon: "paid", title: "Pay people directly", body: "Freelancers, sellers and friends can be paid with nothing but an address." },
        { icon: "give", title: "Donate quietly", body: "Many open-source projects and creators publish a Monero address for donations." },
        { icon: "world", title: "Send across borders", body: "Same rules, any day, any country, for a small network fee." },
        { icon: "shield", title: "Pay without a card number", body: "A payment needs only the recipient's address. No card details to leak." },
        { icon: "save", title: "Keep a private balance", body: "Nobody can look up your address to see what you hold." },
      ]} />
      <p>
        To find places, the Monero project keeps a{" "}
        <a href="https://www.getmonero.org/community/merchants/" rel="noopener">list of merchant directories</a>, and says
        plainly that its listings are not endorsements. <mark>Treat an unfamiliar seller with care</mark>: payments cannot be
        reversed, so check reviews from independent sources, send exactly the amount the checkout shows, and to exactly the
        address it shows.
      </p>
      <p>
        On the other side of the counter? Our <Link href="/accept-monero-payments">guide to accepting Monero payments</Link> covers
        payment links, a till for your shop and a checkout for your website.
      </p>
      <h3>Your first-day checklist</h3>
      <p>Do this once, with a small amount, and you will have a tested wallet before the amounts matter.</p>
      <Steps items={[
        { title: "Open a wallet from a source you trust", body: <p>From a bookmark or a link you typed, never from an ad. You can <Link href={walletUrl}>open MonkStash</Link> in your browser.</p> },
        { title: "Write down the 25 words, and store two copies", body: <p>On paper, numbered, offline, in two places.</p> },
        { title: "Receive a small test amount", body: <p>Share a fresh subaddress and wait for the 10 confirmations.</p> },
        { title: "Send a tiny amount onward", body: <p>Proves that sending works and teaches you what the fee looks like.</p> },
        { title: "Restore from your words on a second device", body: <p>If the balance matches, your backup works. Only then move larger amounts, in stages.</p> },
      ]} />
      <p>
        That is the whole of it. Six steps, three of them done once, and a checklist that proves each one works. When you are
        ready, <Link href="/create-monero-wallet">create your Monero wallet</Link> and start with step 1. If you get stuck, the{" "}
        <Link href="/faq">FAQ</Link> and <Link href="/support">support page</Link> are there to help.
      </p>
      <DeepDive paths={["/create-monero-wallet", "/receive-monero", "/send-monero"]} label="Your next three reads" />
    </>
  );
}
