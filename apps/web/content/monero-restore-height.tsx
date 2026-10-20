import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { RestoreHeightMistakesArt, RestoreHeightTimelineArt } from "@/components/art/MoneroRestoreHeightArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-restore-height",
  section: "learn",
  kicker: "Restoring, explained",
  title: "Monero Restore Height: What It Is and What to Use",
  seoTitle: "Monero Restore Height: What It Is, What to Use",
  summary: "Monero restore height is the block where your wallet starts scanning. Pick one at or before your first payment, or your balance may come up short.",
  keyword: "monero restore height",
  updated: "2026-10-14",
  readingMinutes: 9,
  toc: [
    { id: "what", label: "What restore height is" },
    { id: "which", label: "What restore height should you use?" },
    { id: "formula", label: "Restore height from a date" },
    { id: "example", label: "A worked example" },
    { id: "wrong", label: "Too high, too low, or just right" },
    { id: "monkstash", label: "How MonkStash handles it" },
    { id: "restoring", label: "Setting it when you restore" },
    { id: "balance", label: "If your balance looks wrong" },
    { id: "tool", label: "A restore height finder" },
    { id: "next", label: "What to do next" },
  ],
  related: ["restore-monero-wallet", "monero-view-only-wallet", "monero-seed-phrase", "monero-wallet-not-syncing", "monero-wallet-not-showing-balance"],
  faq: [
    { q: "What is a Monero restore height?", a: "It is the block number where a wallet starts looking for your payments when you restore it. Everything before that block is skipped. The official Monero guide says the ideal value is the block that holds your first incoming transaction." },
    { q: "What restore height should I use?", a: "Use the block of your first incoming payment, or a little earlier. If you only know a date, enter that date, or one a few days before it. When unsure, go lower, because a lower height only costs time." },
    { q: "How do I get a restore height from a date?", a: "Count the days between the date and today, multiply by about 720 (a block arrives roughly every 2 minutes), and subtract that from the current chain height. Then subtract a safety margin. Or enter the date directly where a wallet accepts one." },
    { q: "What happens if my restore height is too high?", a: "The wallet skips payments that arrived before it, so your balance is too low and your history is incomplete. Your money is not gone. Restore again with a lower height and it will appear." },
    { q: "What happens if my restore height is too low?", a: "Nothing bad. The wallet just scans blocks that hold none of your payments, so the first sync is slower than it needed to be." },
    { q: "Do I need a restore height for a brand new wallet?", a: "No. A new wallet cannot have older payments, so it starts from the current block. MonkStash sets this for you when you create a wallet." },
    { q: "Why is my restored Monero balance zero?", a: "Often because the sync has not finished, or the restore height is later than your first payment. Wait for the scan to finish, then try a lower height or an earlier date." },
    { q: "Can I find my restore height later?", a: "A restored wallet shows the height or date you entered. If you did not note it, a block explorer can show the block of your first transaction, or you can pick a safe date before you first used the wallet." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <strong>Monero restore height</strong> is the block number where your wallet starts scanning the blockchain for your
        payments. <mark>Set it at or just before your first payment</mark> and the restore is fast and complete. Set it too high and your
        wallet skips money that is really yours, so the balance comes up short. Set it too low and the only cost is time.
      </p>

      <Takeaways items={[
        "Restore height is where the search starts, not where your money is. It is a starting line, not a balance.",
        "Aim for the block of your first incoming payment, or a few days earlier. When unsure, go lower.",
        "Too high misses funds until you fix it. Too low only makes the first sync slower.",
        "A new wallet needs no restore height. It matters when you restore, or when you add a watch-only wallet.",
      ]} />

      <h2 id="what">What restore height is</h2>
      <p>
        Monero hides who got paid, so <mark>a wallet cannot look up your balance</mark>. It has to read the blockchain block by block, using
        your private view key to spot the payments meant for you. A new block arrives roughly every 2 minutes (the{" "}
        <a href="https://docs.getmonero.org/technical-specs/" rel="noopener">Monero technical specification</a> gives a 2 minute
        target), and the chain has been growing since April 2014, so a full read from the start is long.
      </p>
      <p>
        The restore height tells the wallet where to begin. The official{" "}
        <a href="https://www.getmonero.org/resources/user-guides/restore_account.html" rel="noopener">Monero restore guide</a>{" "}
        describes it as the setting that says at which block height the wallet should start scanning for your transactions.
        Blocks before it are never looked at. Only have a date? Use the <Link href="/tools/monero-restore-height-calculator">restore height calculator</Link>. The chain is over 3.7 million blocks long as of October 2026, which is why skipping
        most of it matters.
      </p>
      <Figure caption="The wallet skips everything left of the flag and scans everything right of it.">
        <RestoreHeightTimelineArt />
      </Figure>

      <h2 id="which">What restore height should you use?</h2>
      <p>
        The best value is the height of the <mark>block that contains your first incoming payment</mark>. The official guide says exactly
        that. In practice you usually do not know it, so use the nearest thing you do know, and lean earlier.
      </p>
      <table>
        <thead><tr><th>What you remember</th><th>What to enter</th></tr></thead>
        <tbody>
          <tr><td>The block or transaction ID of your first payment</td><td>That block height, or a little lower. A block explorer shows the height for any transaction.</td></tr>
          <tr><td>The date you first received Monero</td><td>That date, or a week before it. Wallets that accept dates will convert it.</td></tr>
          <tr><td>About when you made the wallet</td><td>A date a few weeks before that.</td></tr>
          <tr><td>You made it this year but cannot say when</td><td>1 January of this year.</td></tr>
          <tr><td>No idea at all</td><td>Leave it empty or use 0, and accept a slow first sync.</td></tr>
        </tbody>
      </table>
      <Callout title="Why lower is safer">
        The cost of starting early is a few extra minutes. The cost of starting late is a balance that looks wrong. Those are not
        symmetric, so <mark>when in doubt, go lower</mark>. The official guide gives the same advice.
      </Callout>

      <h2 id="formula">Restore height from a date</h2>
      <p>
        Many wallets, including MonkStash, ask for a date and do the conversion for you. If one asks for a number, here is how to
        work it out. Search for &quot;monero restore height calculator&quot; and you will find third-party tools that use the same
        idea. The method needs only one fact: Monero makes about <strong>720 blocks a day</strong> (24 hours times 30 blocks an
        hour, at one block per 2 minutes).
      </p>
      <h3>Counting back from today (best for recent dates)</h3>
      <p>
        <mark>restore height ≈ current height - (days ago × 720) - a safety margin</mark>
      </p>
      <p>
        Look up the current chain height on any block explorer. Count the days between your date and today. Multiply by 720 and
        subtract the result. Then subtract a margin (we suggest at least 10,000 blocks, about two weeks) because real block
        times drift a little around the 2 minute target, and <mark>a height that is too high is the dangerous mistake</mark>.
      </p>
      <h3>Counting forward from launch (rough, for old dates)</h3>
      <p>
        <mark>restore height ≈ days since 18 April 2014 × 720</mark>
      </p>
      <p>
        Monero went live on 18 April 2014, so counting forward from there works as a quick estimate. It lands low for most
        dates, because blocks came faster early in the chain&apos;s life (the specification notes a 1 minute target before an
        early hard fork). A low answer is the safe side, so use it when nothing better is on hand. A block explorer lets you check
        the true height for any date in seconds.
      </p>

      <h2 id="example">A worked example</h2>
      <p>
        Say you made your wallet and got your first payment on <strong>1 January 2025</strong>, and today is 14 October 2026. The
        chain height is about 3,784,000 (a block explorer showed roughly 3.78 million in mid October 2026; check a live one
        before you do this).
      </p>
      <ol>
        <li>Days between 1 January 2025 and 14 October 2026: 365 + 286 = <strong>651 days</strong>.</li>
        <li>Blocks in that time: 651 × 720 = <strong>468,720</strong>.</li>
        <li>Height at that date, roughly: 3,784,000 - 468,720 = <strong>about 3,315,000</strong>.</li>
        <li>Subtract a safety margin of 10,000: <strong>about 3,305,000</strong>. Round down to <strong>3,300,000</strong>.</li>
      </ol>
      <p>
        Enter 3,300,000 and the wallet skips about 3.3 million blocks and scans only the last ~480,000. If you use{" "}
        <strong>1 December 2024</strong> instead, the result is lower and still safe. If you are very unsure, the date field is
        easier than the number.
      </p>
      <Callout title="This is an estimate, not a lookup">
        The formula gives a safe starting point, not the exact block of a date. To find an exact height, search a block explorer
        for your first transaction and read its block number.
      </Callout>

      <h2 id="wrong">Too high, too low, or just right</h2>
      <Figure caption="Starting early is harmless. Starting after your first payment skips money that is yours.">
        <RestoreHeightMistakesArt />
      </Figure>
      <table>
        <thead><tr><th>Restore height</th><th>What happens</th><th>Fix</th></tr></thead>
        <tbody>
          <tr><td>At or just before your first payment</td><td>Complete balance, quickest sync</td><td>Nothing to do</td></tr>
          <tr><td>Far too low</td><td>Correct balance, slower first sync</td><td>Nothing to do. Next time pick a later height.</td></tr>
          <tr><td>Too high</td><td>Balance too low, history incomplete, payments missing</td><td>Restore again with a lower height or earlier date</td></tr>
          <tr><td>Empty or 0</td><td>Scans the whole chain, correct but slow</td><td>Wait, or restore again with a date</td></tr>
        </tbody>
      </table>
      <p>
        The official guide spells out the stakes: above your first payment, &quot;your balance will be wrong&quot;; too low, the
        sync just takes longer. <mark>Your funds are not affected either way</mark>, because the coins live on the blockchain, not in the
        wallet.
      </p>

      <h2 id="monkstash">How MonkStash handles it</h2>
      <ul>
        <li><strong>Creating a wallet.</strong> MonkStash sets the restore height to the network&apos;s current height automatically. A brand new wallet has no older payments, so there is nothing to look for earlier. If it cannot reach a node, it uses an offline estimate that is built to err early.</li>
        <li><strong>Restoring or adding a watch-only wallet.</strong> You enter the approximate date you first made the wallet. MonkStash converts it to a height. Leave it empty and it checks the whole history.</li>
        <li><strong>Checking it.</strong> The restore height is listed in your wallet info on the dashboard, so you can see what a restore used.</li>
      </ul>
      <p>
        You may notice two phases in the first sync. First comes a one-time catch-up where the wallet fetches the chain&apos;s
        block index up to the restore height (nothing of yours is scanned yet; it usually takes about a minute). Then the real
        scan runs from the restore height to the newest block. Both are normal. See{" "}
        <Link href="/monero-wallet-not-syncing">fixing a wallet that will not sync</Link> if either stalls.
      </p>

      <h2 id="restoring">Setting it when you restore</h2>
      <ol>
        <li>Work out your date or height using the table above.</li>
        <li>Open the <Link href={walletUrl}>MonkStash wallet</Link> and choose <strong>Restore from recovery words</strong>. For a watch-only wallet, choose <strong>Add a watch-only wallet</strong>.</li>
        <li>Enter the recovery words (or address and view key) and fill the date field: the question about when you first made the wallet.</li>
        <li>Set a password and wait for the scan to finish before judging the balance.</li>
      </ol>
      <p>
        The full process, including word-count problems and what to do after, is in the{" "}
        <Link href="/restore-monero-wallet">restore guide</Link>. Other wallets use the same idea. Monero GUI, for
        example, accepts either a creation date or a restore height when you restore from keys or a seed, and the official
        restore guide says you can use either a block number or a date.
      </p>
      <Callout kind="warn" title="Newer seed types can carry the date for you">
        Some seed formats, such as Polyseed, store the wallet&apos;s creation date inside the words, so no separate restore
        height is needed. The standard 25-word seed does not, which is why you have to supply one. See the{" "}
        <Link href="/monero-seed-phrase">seed phrase guide</Link>.
      </Callout>

      <h2 id="balance">If your balance looks wrong</h2>
      <p>Work through these in order:</p>
      <ol>
        <li><strong>Is the sync finished?</strong> A scan in progress shows a partial or zero balance. Wait for it to complete.</li>
        <li><strong>Are recent payments still locked?</strong> New Monero needs about 10 confirmations, roughly 20 minutes, before it can be spent.</li>
        <li><strong>Was the restore height too high?</strong> If your balance is lower than you expect and the sync is done, restore again with an earlier date, a few weeks or months before your first payment.</li>
        <li><strong>Is it the right wallet?</strong> Compare the first and last characters of the address with the one you saved. A wrong word can produce a different wallet.</li>
        <li><strong>Is it a watch-only wallet?</strong> Those can show too <em>much</em> after you spend. See the <Link href="/monero-view-only-wallet">view-only wallet guide</Link>.</li>
      </ol>
      <p>
        Still stuck? Read{" "}
        <Link href="/monero-wallet-not-showing-balance">wallet not showing balance</Link>, which covers the other causes.
      </p>

      <h2 id="tool">A restore height finder</h2>
      <p>
        A date-to-height converter is coming to our <Link href="/tools">tools</Link> page. Until it is there, the date field in
        the wallet and the formula above do the same job. Third-party calculators exist too; treat any of them as an estimate and
        keep a safety margin.
      </p>

      <h2 id="next">What to do next</h2>
      <p>
        If you are restoring now, follow <Link href="/restore-monero-wallet">how to restore a Monero wallet</Link> and
        keep your date a little early. If you want to understand where the number comes from, read{" "}
        <Link href="/how-monero-works">how Monero works</Link>. And once your balance is back, write down your restore
        date next to your recovery words. It saves a lot of guessing next time. See the{" "}
        <Link href="/back-up-monero-wallet">backup guide</Link>.
      </p>
    </>
  );
}
