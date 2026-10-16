import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { ConfirmationTimelineArt } from "@/components/art/MoneroTransactionTimeArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-transaction-time",
  section: "learn",
  kicker: "Timing and confirmations",
  title: "How Long Does a Monero Transaction Take? (Confirmations Explained)",
  seoTitle: "How Long Does a Monero Transaction Take?",
  summary: "How long does a Monero transaction take? It shows up in seconds, confirms in about 2 minutes, and is spendable after 10 confirmations, about 20 minutes.",
  keyword: "how long does a Monero transaction take",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "timeline", label: "A payment from send to spendable" },
    { id: "blocks", label: "Why a block takes about 2 minutes" },
    { id: "ten", label: "Why 10 confirmations" },
    { id: "states", label: "What the states in your wallet mean" },
    { id: "locked", label: "Why part of my balance is locked" },
    { id: "change", label: "Why your own change is locked too" },
    { id: "stuck", label: "What to do if it seems stuck" },
    { id: "merchants", label: "How many confirmations to wait for" },
    { id: "plan", label: "Planning around the wait" },
  ],
  related: ["monero-transaction-fee", "monero-wallet-not-syncing", "receive-monero", "send-monero"],
  faq: [
    { q: "How long does a Monero transaction take?", a: "A Monero payment is usually visible to the receiving wallet within seconds of being sent, gets its first confirmation in about 2 minutes when the next block is found, and becomes spendable after 10 confirmations, roughly 20 minutes. Block times vary, so these are averages." },
    { q: "How many confirmations does Monero need?", a: "A received payment is locked until it has 10 confirmations, which the wallet then counts as spendable. Some exchanges and merchants ask for a different number before they credit a deposit." },
    { q: "Why is my Monero balance locked?", a: "Monero protects against chain reorganizations by holding new funds for 10 blocks before they can be spent. The wallet shows the amount as locked or not yet spendable until then. It will unlock by itself." },
    { q: "Why is my change locked after I send?", a: "The change from a send is a new payment to yourself, and it follows the same 10 block rule. Your wallet shows a lower spendable balance for about 20 minutes after sending." },
    { q: "How long is a Monero block?", a: "The protocol targets one block every 120 seconds, so the average is 2 minutes. Real gaps vary: sometimes seconds, sometimes ten minutes or more, because blocks are found by chance." },
    { q: "My Monero transaction has been pending for an hour. What now?", a: "First check that your wallet is fully synced and connected to a node, because a stale view can look like a stuck payment. Then look the transaction up on a block explorer. If it is in a block, your wallet will catch up. If it is not found anywhere, it may never have been broadcast." },
    { q: "Can I speed up a Monero transaction?", a: "You cannot speed up the 10 block lock. It is part of how funds become spendable. If a send is slow to get into its first block, a higher fee priority can help when blocks are busy, but that is rarely needed." },
    { q: "Is a Monero transaction instant?", a: "It appears fast, but it is not final at once. The payment becomes visible within seconds and is reasonably safe after a confirmation or two, but the funds are not spendable until the 10 block lock passes." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A Monero transaction takes about 20 minutes to become spendable. It usually <mark>shows up in the receiving wallet within seconds</mark>,
        gets its first confirmation in about 2 minutes when the next block is found, and unlocks after 10 confirmations. This guide explains each stage, why the wait exists, and what to do when it looks longer than it should.
      </p>

      <Takeaways items={[
        "The payment appears within seconds, the first confirmation takes about 2 minutes, and funds are spendable after 10 confirmations (about 20 minutes).",
        "The 10 block lock protects you if the chain briefly rearranges. It is a rule of the network, not a setting you can change.",
        "Change from your own send is locked for the same 10 blocks, so your spendable balance dips right after you send.",
        "Most stuck payments are a wallet that has not caught up, not a lost transaction.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        There are three moments, and people often mix them up:
      </p>
      <ol>
        <li><strong>Broadcast.</strong> The sender presses confirm. The transaction spreads across the network and the recipient&apos;s wallet can usually see it within seconds.</li>
        <li><strong>First confirmation.</strong> A miner includes it in a block, which takes about 2 minutes on average.</li>
        <li><strong>Spendable.</strong> Ten blocks later, around 20 minutes on average, the receiver can spend the funds.</li>
      </ol>
      <p>
        So &quot;how long does it take&quot; has two honest answers. To see it, seconds. <mark>To spend it, about 20 minutes</mark>.
      </p>

      <h2 id="timeline">A payment from send to spendable</h2>
      <Figure caption="Each box is one block. Block times average 2 minutes, but any single gap can be much shorter or longer.">
        <ConfirmationTimelineArt />
      </Figure>
      <p>
        The word <strong>confirmation</strong> just means a block has been added on top of your transaction&apos;s block. One block
        on top is one confirmation, two is two, and so on. Each one makes it harder to undo the transaction. If you want to see
        what a transaction contains before it is sent, the fee is part of that story: read{" "}
        <Link href="/monero-transaction-fee">the Monero transaction fee explained</Link>.
      </p>

      <h3>Why it is not instant like a card</h3>
      <p>
        A card payment feels instant because one company approves it and can reverse it later. Monero has no company in the
        middle. Thousands of computers must agree on the order of transactions, and that agreement comes from blocks. The wait
        <mark>is the cost of having nobody in charge</mark>, and it is also what stops anyone from freezing or undoing your payment.
      </p>
      <p>
        For everyday use the delay is short. Paying a friend, topping up a wallet, or moving funds between your own wallets
        all work fine inside a coffee break.
      </p>

      <h2 id="blocks">Why a block takes about 2 minutes</h2>
      <p>
        Monero is built to find one block every two minutes. In the official source code, the target is set at 120 seconds (the
        constant is called <code>DIFFICULTY_TARGET_V2</code> in the{" "}
        <a href="https://github.com/monero-project/monero/blob/master/src/cryptonote_config.h" rel="noopener">Monero repository</a>).
        The network adjusts how hard mining is to hold that pace on average.
      </p>
      <p>
        Blocks are found by chance, so the real gaps are uneven. Looking at a block explorer on 14 October 2026, some consecutive
        blocks arrived about 20 seconds apart, and another gap was about 11 minutes. That is normal. <mark>Two minutes is an
        average, not a promise</mark> for any single block.
      </p>

      <h2 id="ten">Why 10 confirmations</h2>
      <p>
        The chain can occasionally rearrange itself. Two miners may find a block at nearly the same time, and the network briefly
        has two versions of the latest block until it settles on one. That is called a reorganization, or reorg. Transactions in the
        dropped block go back to waiting.
      </p>
      <p>
        <mark>Monero requires newly received funds to wait for 10 blocks</mark> before they can be spent. The source code sets the default
        spendable age at 10 (<code>CRYPTONOTE_DEFAULT_TX_SPENDABLE_AGE</code>). Waiting makes it very unlikely that a reorg could
        remove the payment you are about to build on.
      </p>
      <p>
        This is not a theory. In September 2025, Monero saw an 18 block reorganization, deeper than the lock, which was widely
        reported (see <a href="https://www.theblock.co/post/370628/monero-shaken-by-block-reorg-reviving-tensions-with-qubic" rel="noopener">The Block&apos;s report</a>).
        It was an unusual event, and it is why services handling larger amounts sometimes wait for more than 10 confirmations.
      </p>

      <h2 id="states">What the states in your wallet mean</h2>
      <p>These are the states you will see, and what to do in each. The second column shows the wording MonkStash uses on the activity list; other wallets word these states differently.</p>
      <table>
        <thead><tr><th>State</th><th>What you see</th><th>What it means</th><th>What to do</th></tr></thead>
        <tbody>
          <tr><td>Broadcast</td><td>Waiting to confirm</td><td>Seen by the network, not yet in a block</td><td>Wait. Usually a couple of minutes.</td></tr>
          <tr><td>In a block</td><td>Confirming (1 of 10)</td><td>First confirmation reached</td><td>Wait. Count rises about every 2 minutes.</td></tr>
          <tr><td>Partway</td><td>Confirming (5 of 10)</td><td>Funds still locked</td><td>Wait. They unlock by themselves.</td></tr>
          <tr><td>Done</td><td>The date of the payment</td><td>10 or more confirmations</td><td>You can send or spend them.</td></tr>
          <tr><td>Not found</td><td>Nothing after a long wait</td><td>Not broadcast, or your wallet is behind</td><td>See the stuck section below.</td></tr>
        </tbody>
      </table>

      <h2 id="locked">Why part of my balance is locked</h2>
      <p>
        Wallets split your balance into <strong>total</strong> and <strong>spendable</strong> (sometimes called unlocked). New
        incoming money counts toward total at once but is not spendable until the 10 block lock passes. In MonkStash you will see a
        note saying that the rest becomes spendable once the network has confirmed it, usually in about 20 minutes.
      </p>
      <p>
        If you receive several payments close together, each has its own countdown. The wallet adds each one to your spendable
        balance as its lock ends. If a send fails because the amount is more than your unlocked balance, our guide to{" "}
        <Link href="/monero-unlocked-balance">Monero&apos;s unlocked balance</Link> explains the message and the fix. More on
        receiving is in <Link href="/receive-monero">how to receive Monero</Link>.
      </p>

      <h2 id="change">Why your own change is locked too</h2>
      <p>
        When you send, you almost never spend the exact amount of one payment. A wallet spends a whole payment and sends the
        rest back to you as change. That change is a brand new payment and gets the same 10 block lock.
      </p>
      <p>
        The result is a dip: you hold 5 XMR, send 1, and for about 20 minutes your spendable balance may be far lower than 4,
        because the change is still locked. <mark>It is not lost</mark>. Wait for it to unlock, and plan sends so you do not need the money in
        the meantime. See <Link href="/send-monero">how to send Monero</Link>.
      </p>
      <Callout title="Unlock time is a different thing">
        Monero also has an optional &quot;unlock time&quot; that a sender can set so that funds stay locked until a future block. The
        official documentation warns that it applies to the whole transaction, including change, so you should avoid it unless
        you know why you need it. The ordinary 10 block wait is automatic and has nothing to do with it. See the{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/unlocktime.html" rel="noopener">Monero explanation of unlock time</a>.
      </Callout>

      <h2 id="stuck">What to do if it seems stuck</h2>
      <p>
        Most &quot;stuck&quot; transactions are not stuck. Work through these in order.
      </p>
      <ol>
        <li><strong>Give it 30 minutes.</strong> Blocks can run slow for a while, and 10 of them can take longer than 20 minutes.</li>
        <li><strong>Check that your wallet is synced.</strong> A wallet that has not caught up cannot see new blocks, so the count stops rising. Follow <Link href="/monero-wallet-not-syncing">fixing a wallet that will not sync</Link>.</li>
        <li><strong>Check the node.</strong> If the wallet cannot reach its node, it cannot learn about new blocks. See <Link href="/monero-remote-node">what a remote node is</Link>.</li>
        <li><strong>Look up the transaction.</strong> If you have the transaction ID, search it on a <Link href="/monero-transaction-lookup">block explorer</Link>. If it is in a block, the problem is your wallet&apos;s view, not the network.</li>
        <li><strong>Ask the other side.</strong> If someone sent you money, ask for the transaction ID, and check that they used your correct address.</li>
      </ol>
      <p>
        If a send was never broadcast and does not appear on the network at all, <mark>the funds stay with you and nothing is lost</mark>.
        Reload the wallet, let it sync, and your balance should return to normal.
      </p>

      <h2 id="merchants">How many confirmations to wait for</h2>
      <p>
        The 10 block rule is about when <em>you</em> can spend. When you are the one accepting a payment, you may want more or less
        certainty.
      </p>
      <table>
        <thead><tr><th>Situation</th><th>Reasonable wait</th></tr></thead>
        <tbody>
          <tr><td>Small payment to someone you know</td><td>Seeing it in your wallet may be enough</td></tr>
          <tr><td>You want to spend it again</td><td>10 confirmations (required)</td></tr>
          <tr><td>Larger amount, goods that are hard to take back</td><td>10 confirmations, or more if you want extra safety</td></tr>
          <tr><td>Exchange deposit</td><td>Whatever that exchange states. Check its own page.</td></tr>
        </tbody>
      </table>

      <h2 id="plan">Planning around the wait</h2>
      <p>
        You cannot shorten the lock, but you can work with it. Send a little earlier than you need to. If you plan two sends, expect
        the change from the first to be locked while you prepare the second. If you are moving funds between your own wallets, send
        once and let it finish before you do anything else. And if you are waiting on a payment, keep the wallet open so it can
        see new blocks.
      </p>
      <p>
        New to this? Read <Link href="/use-monero">how to use Monero</Link> from the beginning, or{" "}
        <Link href={walletUrl}>open your wallet</Link> and send a small test payment to feel the timing for yourself.
      </p>
    </>
  );
}
