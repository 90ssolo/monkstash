import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { ChangeLockArt } from "@/components/art/MoneroUnlockedBalanceArt";
import { walletUrl } from "@/lib/site";

const CONFIG = "https://github.com/monero-project/monero/blob/master/src/cryptonote_config.h";
const GUI_TRANSFER = "https://github.com/monero-project/monero-gui/blob/master/pages/Transfer.qml";
const UNLOCK_TIME = "https://www.getmonero.org/resources/moneropedia/unlocktime.html";
const CHANGE = "https://www.getmonero.org/resources/moneropedia/change.html";

export const meta: ArticleMeta = {
  slug: "monero-unlocked-balance",
  section: "guides",
  kicker: "Troubleshooting",
  title: "Monero Unlocked Balance: Why Part of Your XMR Is Locked",
  seoTitle: "Monero Unlocked Balance: Why Your XMR Is Locked",
  summary: "Seeing \"amount is more than unlocked balance\"? New funds and your own change stay locked for 10 blocks, about 20 minutes. Here is why and what to do.",
  keyword: "monero unlocked balance",
  updated: "2026-10-15",
  readingMinutes: 7,
  toc: [
    { id: "answer", label: "The quick answer" },
    { id: "difference", label: "Balance vs unlocked balance" },
    { id: "error", label: "\"Amount is more than unlocked balance\"" },
    { id: "change", label: "The change surprise after sending" },
    { id: "fix", label: "What to do right now" },
    { id: "not-lock", label: "When it is not the lock" },
    { id: "rare", label: "Rare cases: mining and unlock time" },
    { id: "next", label: "Next steps" },
  ],
  related: ["monero-transaction-time", "monero-wallet-not-syncing", "monero-wallet-not-showing-balance", "send-monero"],
  faq: [
    { q: "What does \"amount is more than unlocked balance\" mean in Monero?", a: "You tried to send more than the part of your balance that is spendable right now. Some of your XMR is still inside its 10 block lock, usually because it arrived recently or is change from your last send. Wait about 20 minutes, or send a smaller amount." },
    { q: "What is the difference between balance and unlocked balance in Monero?", a: "Balance is everything the wallet has found, including funds that arrived in the last few blocks. Unlocked balance is the part you can spend now. The gap closes by itself as each payment reaches 10 confirmations." },
    { q: "How long does Monero stay locked?", a: "Ten blocks after the block that included it. With a two minute block target, that is about 20 minutes on average, though slow blocks can stretch it." },
    { q: "Why did my unlocked balance drop after I sent Monero?", a: "Your wallet spent whole earlier payments and sent the leftover back to you as change. That change is a new payment and is locked for 10 blocks like any other, so your spendable balance dips for about 20 minutes." },
    { q: "Can I unlock my Monero faster?", a: "No. The 10 block wait is a network rule, and no wallet setting or fee changes it. You can only wait, or send what is already unlocked." },
    { q: "My balance is locked for hours. Is that normal?", a: "Not for the ordinary lock. Check that your wallet is synced and connected, since a stalled wallet stops counting blocks. Mining rewards and payments with a custom unlock time can stay locked longer." },
    { q: "Does \"Send all\" include locked funds?", a: "No. Send all sweeps the unlocked balance only. In MonkStash it sends everything spendable now, minus the network fee, and leaves locked funds for later." },
  ],
  sources: [
    { label: "Monero source: cryptonote_config.h (spendable age, block target, mining unlock window)", href: CONFIG },
    { label: "Monero GUI source: Transfer page warnings", href: GUI_TRANSFER },
    { label: "Moneropedia: transaction unlock time", href: UNLOCK_TIME },
    { label: "Moneropedia: change", href: CHANGE },
  ],
};

export function Body() {
  return (
    <>
      <p>
        If your Monero wallet says <strong>&quot;Amount is more than unlocked balance&quot;</strong>, nothing is wrong with your money.
        Part of it is simply <mark>waiting out a 10 block lock, about 20 minutes</mark>. Funds you just received and the change from your
        own last send both sit in that lock. This page explains the difference between balance and unlocked balance, why the error
        often appears right after you send, and what to do about it.
      </p>

      <KeyFact label="The rule">
        Every new output in your wallet, received funds and your own change alike, is locked for <strong>10 blocks</strong> before it can
        be spent. At Monero&apos;s 2 minute block target, that is <strong>about 20 minutes</strong>.
      </KeyFact>

      <Takeaways items={[
        "Balance counts everything. Unlocked balance counts what you can spend this minute.",
        "The error means you asked to send more than the unlocked part. It clears by itself.",
        "Sending locks your change, so your spendable balance drops by more than you sent, for about 20 minutes.",
        "If funds stay locked for hours, check sync and connection first.",
      ]} />

      <h2 id="answer">The quick answer</h2>
      <p>
        The Monero source code sets how old a payment must be before it can be spent:{" "}
        <code>CRYPTONOTE_DEFAULT_TX_SPENDABLE_AGE</code> is <strong>10</strong> blocks, and the block target{" "}
        <code>DIFFICULTY_TARGET_V2</code> is <strong>120 seconds</strong> (see{" "}
        <a href={CONFIG} rel="noopener">cryptonote_config.h</a>). Multiply them and you get the familiar 20 minutes. Blocks arrive
        by chance, so some locks end sooner and some take longer.
      </p>
      <p>
        If you want the full story of confirmations, from broadcast to spendable, read{" "}
        <Link href="/monero-transaction-time">how long a Monero transaction takes</Link>. This page is about the lock itself and the
        error it causes.
      </p>

      <h2 id="difference">Balance vs unlocked balance</h2>
      <p>Wallets show two numbers, and they name them differently:</p>
      <table>
        <thead><tr><th>Wallet</th><th>Everything</th><th>What you can spend now</th></tr></thead>
        <tbody>
          <tr><td>Monero CLI</td><td>Balance</td><td>Unlocked balance</td></tr>
          <tr><td>Monero GUI</td><td>Total balance</td><td>&quot;Spendable funds&quot; on the send page</td></tr>
          <tr><td><Link href={walletUrl}>MonkStash</Link></td><td>Balance</td><td>&quot;Spendable now&quot;, with a countdown for the rest</td></tr>
        </tbody>
      </table>
      <p>
        The &quot;locked balance&quot; is just the gap between the two. It is not frozen, flagged or held by anyone. It is the network
        making sure a payment is buried under enough blocks that a short chain reorganization cannot undo it before you build on it.{" "}
        <mark>It unlocks on its own</mark>, with no action from you.
      </p>

      <h2 id="error">&quot;Amount is more than unlocked balance&quot;</h2>
      <p>
        That exact sentence comes from the official Monero GUI: its send page shows it when the total you entered is higher than your
        unlocked balance (see the <a href={GUI_TRANSFER} rel="noopener">GUI source</a>). The command line wallet says it differently,
        for example <code>Not enough money in unlocked balance</code>. Other wallets may simply grey out the send button or say
        &quot;insufficient funds&quot;.
      </p>
      <p>Two details trip people up:</p>
      <ul>
        <li><strong>The fee counts too.</strong> You need the amount <em>plus</em> the network fee in unlocked funds. Sending your exact unlocked balance will fail; use Send all instead (below).</li>
        <li><strong>Recent deposits count only toward the total.</strong> An exchange withdrawal that landed ten minutes ago shows up in your balance but not in what you can spend.</li>
      </ul>

      <h2 id="change">The change surprise after sending</h2>
      <p>
        This is the case that confuses almost everyone. Your wallet does not hold one pile of XMR. It holds separate payments, called
        outputs, and it must spend each one whole. Moneropedia&apos;s entry on <a href={CHANGE} rel="noopener">change</a> describes it:
        the part you do not send comes back to you as a new output.
      </p>
      <Figure caption="Send 1 XMR and about 1 XMR of change comes back locked. For 20 minutes you can spend 3 XMR, not 4.">
        <ChangeLockArt />
      </Figure>
      <p>
        Say you hold two payments, 3 XMR and 2 XMR. You send 1 XMR. The wallet spends the whole 2 XMR output: 1 goes to the
        recipient, and about 1 comes back to you as change. That change is brand new, so it is locked for 10 blocks. Right after the
        send, your total is about 4 XMR, but <mark>only 3 XMR is spendable</mark>. Try to send 3.5 and you get the error.
      </p>
      <p>
        It can be more dramatic. If all your XMR sits in one big output, any send locks nearly your whole balance for about 20 minutes.
        That is normal. Plan your sends so you are not relying on change you just created.
      </p>

      <h2 id="fix">What to do right now</h2>
      <ol>
        <li><strong>Wait about 20 minutes.</strong> Keep the wallet open and connected so it can see new blocks. In MonkStash the countdown tells you roughly how long is left.</li>
        <li><strong>Send less.</strong> Lower the amount to fit inside the unlocked balance, leaving room for the fee.</li>
        <li><strong>Use Send all for the spendable part.</strong> In MonkStash, Send all sends everything spendable now minus the fee, and leaves locked funds alone. The CLI equivalent, <code>sweep_all</code>, also sends only the unlocked balance.</li>
        <li><strong>Need to pay twice?</strong> If your wallet supports several recipients in one send, use that instead of two sends in a row, so the second payment does not wait on change from the first.</li>
      </ol>
      <Callout title="You cannot speed it up">
        No fee, setting or support ticket shortens the 10 block lock. Any site or person offering to &quot;unlock&quot; your Monero for
        a fee, or asking for your recovery words to do it, is running a scam.
      </Callout>

      <h2 id="not-lock">When it is not the lock</h2>
      <p>If an hour has passed and the spendable figure still has not caught up, look elsewhere:</p>
      <table>
        <thead><tr><th>What you see</th><th>Likely cause</th><th>Fix</th></tr></thead>
        <tbody>
          <tr><td>Countdown or confirmations stopped moving</td><td>Wallet not synced or not connected to a node</td><td><Link href="/monero-wallet-not-syncing">Fix a wallet that will not sync</Link></td></tr>
          <tr><td>Total is lower than expected, not just the spendable part</td><td>Restore height set too late, so older payments were skipped</td><td>Restore with an earlier date; see the <Link href="/monero-restore-height">restore height guide</Link></td></tr>
          <tr><td>Balance shows zero or is missing a payment</td><td>Still scanning, wrong wallet, or the payment never arrived</td><td><Link href="/monero-wallet-not-showing-balance">Wallet not showing balance</Link></td></tr>
          <tr><td>Send is impossible in a watch-only wallet</td><td>It has no spend key</td><td>Send from the full wallet</td></tr>
        </tbody>
      </table>

      <h2 id="rare">Rare cases: mining and unlock time</h2>
      <p>
        <strong>Mining rewards</strong> wait longer. The same config file sets <code>CRYPTONOTE_MINED_MONEY_UNLOCK_WINDOW</code> to 60
        blocks, about two hours, for newly mined coins. If you <Link href="/mine-monero">mine Monero</Link> or use P2Pool, expect that.
      </p>
      <p>
        <strong>A custom unlock time</strong> is a separate, optional feature: a sender can lock a payment until a future block.
        Moneropedia&apos;s <a href={UNLOCK_TIME} rel="noopener">unlock time entry</a> says the lock is per transaction, so the
        sender&apos;s change is locked too, that the feature is rarely used, and that it is set to be deprecated with the FCMP++
        upgrade. If one payment stays locked far beyond 20 minutes while everything else unlocks, ask the sender whether they set one.
      </p>

      <h2 id="next">Next steps</h2>
      <p>
        Most of the time the fix is a coffee break. If you want a wallet that shows you exactly what is <strong>spendable now</strong>{" "}
        and counts down the rest, <Link href={walletUrl}>open MonkStash</Link>: free, no account, and your keys stay in your browser.
        Planning a payment? Our guide on <Link href="/send-monero">how to send Monero</Link> covers fees, addresses and timing.
      </p>
    </>
  );
}
