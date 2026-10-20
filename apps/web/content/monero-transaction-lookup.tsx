import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { ExplorerSeesFigure, PaymentProofFigure } from "@/components/art/MoneroTransactionLookupArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-transaction-lookup",
  section: "guides",
  kicker: "Check and prove a payment",
  title: "Monero Transaction Lookup: Check or Prove a Payment",
  seoTitle: "Monero Transaction Lookup: Check a Payment",
  summary: "Monero transaction lookup explained: what a block explorer shows, how to check a tx ID, and how to prove a payment with a tx key without losing privacy.",
  keyword: "monero transaction lookup",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "sees", label: "What an explorer can and cannot show" },
    { id: "find", label: "Find a transaction by its ID" },
    { id: "status", label: "Reading the status" },
    { id: "prove", label: "Prove you paid someone" },
    { id: "verify", label: "Verify a payment you received" },
    { id: "privacy", label: "Privacy of using an explorer" },
    { id: "own", label: "Run your own explorer" },
    { id: "missing", label: "When a transaction is missing" },
  ],
  sources: [
    { label: "The Monero Project: Prove a payment (GUI and CLI)", href: "https://www.getmonero.org/resources/user-guides/prove-payment.html" },
    { label: "Monero documentation: monero-wallet-cli reference", href: "https://docs.getmonero.org/interacting/monero-wallet-cli-reference/" },
    { label: "Feather Wallet documentation: Prove a payment", href: "https://docs.featherwallet.org/guides/prove-payment" },
  ],
  related: ["monero-view-key", "monero-view-only-wallet", "monero-transaction-time", "send-monero", "monero-wallet-not-syncing", "run-a-monero-node", "monero-remote-node"],
  faq: [
    { q: "Can you look up a Monero transaction?", a: "Yes, by its transaction ID (also called a tx ID or tx hash) on a block explorer. You will see that it exists, which block it is in, its confirmations and its fee. You will not see the sender, the receiver or the amount, because Monero hides them by default." },
    { q: "Can I see the amount of a Monero transaction on a block explorer?", a: "No. Monero hides amounts, senders and receivers on the blockchain. Only the people involved, using their wallet keys, can see the details of a payment." },
    { q: "How do I prove a Monero payment?", a: "Give the recipient or a third party three items: the transaction ID, the receiving address, and the transaction key for that payment. They check these in a wallet (in the Monero GUI under Advanced, Prove/Check) and see the amount sent to that address and its confirmations. In MonkStash, open the sent payment and choose Prove this payment." },
    { q: "What is a Monero transaction key?", a: "A secret value tied to one specific transaction. Combined with the transaction ID and the receiving address, it lets someone verify that the payment went to that address and how much it was. It does not reveal your wallet or any other transaction." },
    { q: "Where do I find my Monero transaction ID?", a: "In your wallet's transaction history. In MonkStash, tap the payment to open its details and use Copy transaction ID. In the Monero GUI, click the transaction on the History page to expand its details. In Feather, right-click it in the History tab and choose Show details. The ID is 64 letters and numbers." },
    { q: "Is it safe to use a block explorer website?", a: "It is fairly safe for your funds but not private. The site operator can see your IP address and which transaction you looked up. Use Tor, or run your own node and a self-hosted explorer, if that matters." },
    { q: "Can the recipient confirm a payment without a tx key?", a: "Yes. If the recipient has the wallet that received the payment, it shows the incoming transaction after it syncs. A view-only wallet made from the address and view key can see incoming payments too." },
    { q: "Does a payment proof show the funds are still there?", a: "No. The Monero documentation warns that a successful proof shows an amount was directed to an address in that transaction. It does not prove the funds are still spendable by the recipient." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A <strong>Monero transaction lookup</strong> works like on any chain: <mark>paste the transaction ID (tx ID) into a block</mark>
        explorer and it shows whether the payment exists, which block holds it and how many confirmations it has. What it will
        not show is the sender, the receiver or the amount, because Monero hides those by default. To prove a payment, you share
        the tx ID, the receiving address and a transaction key. This guide covers both, and how to do it without leaking your
        privacy.
      </p>

      <Takeaways items={[
        "A Monero block explorer shows that a transaction exists, plus its block, confirmations and fee. It does not show amounts or addresses.",
        "To prove a payment, you share the transaction ID, the receiving address and the transaction key, and the other party checks them in a wallet.",
        "Third-party explorers can see your IP address and what you search for. Use Tor, or run your own explorer.",
        "A payment proof shows an amount was sent. It does not show the funds are still spendable.",
        "Never paste your private spend key or recovery words into any website.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        On Bitcoin an explorer tells you everything about a payment. <mark>On Monero it tells you almost nothing about the people</mark> and
        the amount, on purpose. So there are two different jobs: <strong>checking that a transaction happened</strong> (an
        explorer or your wallet does this) and <strong>proving what it was</strong> (this needs a key that only the sender or
        the receiver has).
      </p>

      <h2 id="sees">What an explorer can and cannot show</h2>
      <p>
        A block explorer reads the public blockchain. For Monero, the public part is limited by design. The popular open-source{" "}
        <a href="https://github.com/moneroexamples/onion-monero-blockchain-explorer" rel="noopener">Onion Monero Blockchain Explorer</a>{" "}
        lists things like ring signatures, ring member details, output indices and total miner fees, because those are the parts
        that are public.
      </p>
      <Figure caption="An explorer can confirm a transaction exists. Who sent it, who got it and how much stay private.">
        <ExplorerSeesFigure />
      </Figure>
      <ul>
        <li><strong>Visible:</strong> the transaction ID, the block it is in, the number of confirmations, the fee, the size and the timestamp.</li>
        <li><strong>Ring members:</strong> the decoy outputs mixed in with the real one. They are listed, but nobody can tell which is real. See <Link href="/monero-ring-signatures">ring signatures</Link>.</li>
        <li><strong>Hidden:</strong> sender, receiver and amount. See <Link href="/is-monero-traceable">is Monero traceable</Link> for why.</li>
      </ul>
      <p>
        If someone tells you a Monero explorer can reveal who paid whom, <mark>they are wrong, or they are selling something</mark>. The
        exceptions are proofs, covered below, which only work when the sender or recipient hands over a secret.
      </p>

      <h2 id="find">Find a transaction by its ID</h2>
      <p>
        Every transaction has an ID, a 64-character string of letters and numbers. You can get it from your own wallet.
      </p>
      <Steps items={[
        { title: "Open your wallet's transaction history", body: "Find the payment in the list. Select it to see the details." },
        { title: "Copy the transaction ID", body: "It is the long string, also called the tx ID or tx hash. Copy all of it." },
        { title: "Paste it into a block explorer's search", body: "The result shows the block, confirmations and fee. A page that says the transaction is in the pool means it is waiting to be mixed into a block." },
      ]} />
      <p>
        One neutral public option is the explorer at{" "}
        <a href="https://xmrchain.net/" rel="noopener">xmrchain.net</a>. It describes itself as having no JavaScript, no cookies,
        no web analytics trackers and no images, and it is open source. Other public explorers exist, and the project&apos;s
        README lists several. Whichever you use, remember the privacy limits below.
      </p>

      <h2 id="status">Reading the status</h2>
      <table>
        <thead><tr><th>What you see</th><th>What it means</th></tr></thead>
        <tbody>
          <tr><td>In the transaction pool</td><td>Broadcast but not yet in a block. Usually resolves in a couple of minutes.</td></tr>
          <tr><td>1 or more confirmations</td><td>In a block. Each new block on top adds one confirmation.</td></tr>
          <tr><td>About 10 confirmations</td><td>The received funds usually become spendable. Monero blocks arrive about every 2 minutes.</td></tr>
          <tr><td>Not found</td><td>A typo, a transaction that never broadcast, or one that was dropped. See below.</td></tr>
        </tbody>
      </table>
      <p>
        For timing detail, read <Link href="/monero-transaction-time">how long a Monero transaction takes</Link>.
      </p>

      <h2 id="prove">Prove you paid someone</h2>
      <p>
        Sometimes you need to show a payment was made, for example to a merchant who says they did not receive it. Monero lets
        the sender do this without revealing their wallet. The{" "}
        <a href="https://www.getmonero.org/resources/user-guides/prove-payment.html" rel="noopener">official prove-payment guide</a>{" "}
        says <mark>you give the other party three pieces of information</mark>: the transaction ID, the recipient&apos;s address and the
        transaction key.
      </p>
      <Figure caption="The three items a sender shares. The verifier checks them in a wallet and sees the amount sent to that address.">
        <PaymentProofFigure />
      </Figure>
      <h3>How to prove a Monero payment, step by step</h3>
      <ol>
        <li><strong>Find the payment.</strong> Open your wallet&apos;s history and select the payment you sent.</li>
        <li><strong>Copy the transaction ID and the address you paid.</strong> Copy each one exactly, all characters.</li>
        <li><strong>Get the transaction key.</strong> In MonkStash, choose <em>Prove this payment</em> in the payment&apos;s details. In the Monero GUI, click <strong>P</strong> on the transaction. In Feather, use <em>Show details</em> and copy the transaction secret key.</li>
        <li><strong>Send the three items to the person checking.</strong> Only to them.</li>
        <li><strong>They check it.</strong> In the Monero GUI they open Advanced, Prove/Check and paste the three items into the Check section. In MonkStash they use <em>Check a payment proof</em>. The result shows the amount sent to that address and how many confirmations it has.</li>
      </ol>
      <h3>Get the transaction key</h3>
      <p>
        In the Monero GUI, per the guide, open the history page, select the transaction and click <strong>P</strong> to get the
        payment proof. In the command line wallet, run:
      </p>
      <pre><code>get_tx_key TXID</code></pre>
      <p>
        The command line wallet only has the key if it was saving transaction keys. If the command returns nothing, the guide says
        to check the setting with <code>set</code> and, if <code>store-tx-info</code> is 0, turn it on with{" "}
        <code>set store-tx-info 1</code>. That only helps for future payments, so <mark>turn it on before you need it</mark>.
      </p>
      <h3>Other kinds of proof</h3>
      <p>
        The command line reference also lists <code>get_tx_proof</code> and <code>check_tx_proof</code>, and{" "}
        <code>get_spend_proof</code>, which proves that you made the payment. The reference notes that the plain transaction
        key approach has been superseded by the spend proof for proving a payment. Which you use depends on whether you want to
        prove an amount went to an address, or prove that you were the spender. Check the{" "}
        <a href="https://docs.getmonero.org/interacting/monero-wallet-cli-reference/" rel="noopener">wallet CLI reference</a>{" "}
        for the exact syntax of your version.
      </p>
      <Callout kind="warn" title="A proof is not a guarantee of funds">
        The Monero documentation says a successful check shows an amount was directed to an address in that transaction. It does
        not prove the funds are still spendable by the recipient. They may be time-locked, already spent or unspendable.
      </Callout>
      <h3>Guard the key</h3>
      <p>
        A transaction key is tied to one payment, so <mark>sharing it does not expose your whole wallet</mark>. But it does let the holder
        confirm that payment, so only send it to the person who needs it. It is a different thing from your{" "}
        <Link href="/monero-view-key">view key</Link>, which shows all incoming payments for a wallet, and from your recovery
        words, which control the funds. Never share those.
      </p>

      <h2 id="verify">Verify a payment you received</h2>
      <p>
        If you are the recipient, you usually do not need an explorer. Your own wallet is the authority.
      </p>
      <ul>
        <li><strong>Check your wallet.</strong> After it syncs, an incoming payment shows with its amount and confirmations. If it does not, see <Link href="/monero-wallet-not-syncing">fixing a wallet that is not syncing</Link>.</li>
        <li><strong>Use a payment proof.</strong> If a sender gives you a tx ID, your address and a key, the guide says the CLI command is <code>check_tx_key TXID TXKEY ADDRESS</code> and the GUI has <strong>Advanced, Prove/Check</strong>. The result shows the amount sent to that address and the confirmations.</li>
        <li><strong>Use a view-only wallet.</strong> A <Link href="/monero-view-only-wallet">view-only wallet</Link> can see incoming payments with no power to spend.</li>
      </ul>
      <p>
        You should also confirm that the address the sender used is really yours. The same guide advises confirming with the
        recipient that an address belongs to them.
      </p>

      <h2 id="privacy">Privacy of using an explorer</h2>
      <p>
        A public explorer is a website, and websites see visitors. When you search for a transaction, the operator can see your
        IP address and the transaction ID you looked up. If that transaction is yours, you have told them you are interested in
        it. They still cannot see the amount or the parties, but the link between you and that payment exists.
      </p>
      <KeyFact label="Rule of thumb">
        Never paste a view key, spend key or recovery words into a website to &quot;check&quot; a payment. If a site needs a
        secret, <mark>do the check in your own wallet instead</mark>.
      </KeyFact>
      <p>
        Some explorers offer features that take your address and view key to list your outputs. That works, but it hands your
        view key to a third party, which then sees every incoming payment to that wallet. Prefer your own wallet or a self-hosted
        explorer for that.
      </p>
      <p>
        If you use a public explorer anyway, reduce the exposure: use Tor Browser, avoid logging in or linking it to your name,
        and do not combine it with other identifying activity. Our guide to{" "}
        <Link href="/monero-remote-node">remote nodes</Link> explains the same trade-off for wallets.
      </p>

      <h2 id="own">Run your own explorer</h2>
      <p>
        For regular lookups, <mark>the best answer is your own tools</mark>. The Onion Monero Blockchain Explorer is open source (BSD-3
        licence) and its README describes building it with CMake or running it with Docker, and pointing it at your local
        blockchain or at a daemon URL. It describes itself as built to avoid JavaScript, image-based tracking and web analytics.
        Run it next to your own <Link href="/run-a-monero-node">Monero node</Link> and no outside server learns what you
        look up.
      </p>
      <p>
        That is more effort than most people need. If you only check an occasional payment, your wallet history is enough, and a
        public explorer over Tor is a reasonable compromise. If you want a wallet to start from,{" "}
        <Link href={walletUrl}>open the MonkStash web wallet</Link>, an early preview that is not yet independently audited.
      </p>

      <h2 id="missing">When a transaction is missing</h2>
      <ul>
        <li><strong>Check the ID.</strong> A single wrong character returns nothing. Copy it again from the wallet.</li>
        <li><strong>Wait a few minutes.</strong> A new transaction can take a short while to appear.</li>
        <li><strong>Check your wallet is synced.</strong> A wallet that is behind may not show a payment yet. See <Link href="/monero-wallet-not-syncing">the syncing guide</Link>.</li>
        <li><strong>Look at your node.</strong> A node that is out of date or on the wrong network can disagree with the explorer.</li>
        <li><strong>Ask for the ID from the sender.</strong> If you never saw it, they can read it from their own history.</li>
      </ul>
      <p>
        If you are still stuck, our <Link href="/support">support page</Link> and <Link href="/faq">FAQ</Link> are the place to
        go. For sending in the first place, see <Link href="/send-monero">how to send Monero</Link>.
      </p>
    </>
  );
}
