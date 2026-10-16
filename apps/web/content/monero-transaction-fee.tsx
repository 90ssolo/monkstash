import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { FeeBreakdownArt } from "@/components/art/MoneroTransactionFeeArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-transaction-fee",
  section: "learn",
  kicker: "Costs and fees",
  title: "Monero Transaction Fee: How Much It Costs and Why It Is Low",
  seoTitle: "Monero Transaction Fee: Cost and Why It Is Low",
  summary: "The Monero transaction fee is usually a tiny fraction of an XMR, set by transaction size and network use, not the amount sent. How fees and priority work.",
  keyword: "Monero transaction fee",
  updated: "2026-10-14",
  readingMinutes: 9,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "calculated", label: "How the fee is calculated" },
    { id: "typical", label: "What a typical fee looks like" },
    { id: "priority", label: "Fee priority levels" },
    { id: "low", label: "Why the Monero fee is so low" },
    { id: "bitcoin", label: "Monero fees compared with Bitcoin" },
    { id: "who", label: "Who gets the fee" },
    { id: "tail", label: "Fees and tail emission" },
    { id: "see", label: "How to see the fee before you send" },
    { id: "avoid", label: "Mistakes that cost extra" },
  ],
  related: ["monero-transaction-time", "send-monero", "how-monero-works", "monero-vs-bitcoin"],
  faq: [
    { q: "How much is the Monero transaction fee?", a: "Usually a very small fraction of one XMR. On 14 October 2026 a block explorer showed a rate of 0.00000002 XMR per byte, which for a payment of a couple of kilobytes works out to well under a thousandth of an XMR. The exact figure changes with network use, so read it in your wallet before you confirm." },
    { q: "Does the Monero fee depend on how much I send?", a: "No. The fee is based on the size of the transaction in bytes, not on the amount. Sending a small amount and a large amount costs about the same, as long as the transactions are the same size." },
    { q: "Why is the Monero fee so low?", a: "Fees pay for space in a block, and Monero blocks usually have room to spare. The fee rate also adjusts with how busy recent blocks are, so it stays low when demand is low." },
    { q: "Who receives the Monero transaction fee?", a: "The miner who adds your transaction to a block. It does not go to Monero developers, your wallet provider, or an exchange." },
    { q: "Can I pay a higher Monero fee to be faster?", a: "Many wallets offer priority levels that raise the rate per byte. A higher priority makes your transaction more attractive to miners when blocks are busy. When blocks are not full, the usual priority is normally enough." },
    { q: "Is the Monero fee the same for every wallet?", a: "Not exactly. The network sets a minimum rate, and each wallet decides which priority level to use by default. The same payment can cost slightly different fees in different wallets, and different sizes cost different amounts." },
    { q: "Will Monero fees go up in the future?", a: "They can rise when the network is busy, because the rate adjusts with demand. Monero also pays miners a small ongoing block reward called tail emission, which reduces the pressure on fees to be the only incentive." },
    { q: "What happens if I set the fee too low?", a: "Your transaction may wait longer before a miner includes it. Nodes also refuse transactions below the minimum fee, so a wallet will not normally let you send one that is too low." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        The Monero transaction fee is a small payment to the miner who confirms your transaction. It is based on how big your
        transaction is and how busy the network is, <mark>not on how much money you send</mark>. At the time of writing it is typically a tiny
        fraction of one XMR, and your wallet shows the exact figure before you confirm. To see today&apos;s exact number, try our{" "}
        <Link href="/tools/monero-fee-calculator">Monero fee calculator</Link>, which measures it from the latest blocks.
      </p>

      <Takeaways items={[
        "The fee depends on the size of your transaction in bytes and on network use, not on the amount you send.",
        "A higher priority raises the fee per byte. It matters only when blocks are busy.",
        "The fee goes to the miner who includes your transaction, not to a wallet company.",
        "Always read the fee on the review screen. Do not rely on a number from an article, including this one.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        You pay a fee every time you send Monero. It is not a percentage of what you send. It is closer to a postage price: what you
        pay depends on the size of the envelope, not on what is inside it. <mark>Sending 0.1 XMR and sending 100 XMR cost about the same</mark> if
        the transactions are the same size.
      </p>
      <p>
        The fee is taken from your balance <mark>on top of the amount you send</mark>. If you send 1 XMR, the recipient gets 1 XMR and you
        spend slightly more than 1 XMR in total. The wallet shows both numbers on the review step so there are no surprises.
      </p>

      <h2 id="calculated">How the Monero transaction fee is calculated</h2>
      <p>
        Every block has limited room, and every transaction takes up some of it. Monero charges for that space. The fee is the
        size of your transaction (its weight, measured in bytes) multiplied by a price per byte.
      </p>
      <Figure caption="A fee is size times rate. The rate moves with network use and with the priority you pick.">
        <FeeBreakdownArt />
      </Figure>
      <h3>What makes a transaction bigger</h3>
      <p>
        A Monero transaction carries more data than a plain list of &quot;from, to, amount&quot;. It also holds the privacy proofs that
        hide the sender and the amount (see <Link href="/how-monero-works">how Monero works</Link>). So the size depends on:
      </p>
      <ul>
        <li><strong>How many inputs you spend.</strong> A wallet holding many small incoming payments may need to combine several of them to cover a larger send, which makes the transaction bigger.</li>
        <li><strong>How many outputs you create.</strong> Paying one person creates two outputs: one to them and one for your change. Paying several people at once adds more.</li>
        <li><strong>The fixed privacy data.</strong> Ring members and proofs add a roughly steady amount per transaction.</li>
      </ul>
      <p>
        You do not control most of this. The wallet picks the inputs and builds the transaction, then reports the fee it calculated.
      </p>
      <h3>The rate is dynamic</h3>
      <p>
        The price per byte is not a fixed number. Monero adjusts it according to how full recent blocks have been, so the fee
        rises when demand rises and falls back when it passes. Your wallet asks a node for the current rate when it builds the
        transaction. Learn how a wallet gets that information in <Link href="/monero-node">what a Monero node is</Link>.
      </p>

      <h2 id="typical">What a typical Monero fee looks like</h2>
      <p>
        Fees are quoted in XMR, and the dollar value moves with the price of Monero, so a fee in cents today may be a different
        number of cents next year. Here is a concrete snapshot, with the date so you can judge how old it is.
      </p>
      <p>
        On 14 October 2026, the <a href="https://xmrchain.net" rel="noopener">xmrchain.net block explorer</a> listed a fee of
        0.00000002 XMR per byte (20 nanoXMR per byte). Take a payment of about 2,000 bytes. That is a rough size for a standard
        send, and yours may differ. Multiply the two and <mark>the fee is about 0.00004 XMR</mark>. This is an illustration of the arithmetic, not
        a quote.
      </p>
      <h3>A worked example</h3>
      <p>
        Say you hold 2 XMR and send 1 XMR. The wallet builds a transaction that spends your 2 XMR payment, sends 1 XMR to the
        recipient, and returns the rest to you as change. The fee is taken out of that rest. You end up with slightly less than 1
        XMR in change, and the review screen shows the fee and the total (amount plus fee) so you can check the sum yourself.
      </p>
      <p>
        If you instead sent 0.01 XMR from the same payment, the fee would be about the same, because the transaction is the same
        size. That is why very small payments can feel expensive in proportion, and why <mark>one larger payment usually beats several</mark>
        tiny ones.
      </p>
      <Callout title="Why we do not print a dollar figure">
        A fee in dollars would go out of date the day the price of Monero moves. Check the fee in your wallet at the moment you
        send. If it looks far above what you expected, stop and read the review screen again.
      </Callout>

      <h2 id="priority">Monero fee priority levels</h2>
      <p>
        Many wallets let you choose a priority, such as slow, normal, fast, or fastest. Each level multiplies the per-byte rate. A
        higher level makes your transaction more appealing to miners when there is competition for space in a block.
      </p>
      <table>
        <thead><tr><th>Situation</th><th>What priority does</th></tr></thead>
        <tbody>
          <tr><td>Blocks have spare room</td><td>Little or nothing. A normal priority is usually included in the next block or two.</td></tr>
          <tr><td>Blocks are busy</td><td>A higher priority gets picked first. A very low one can wait.</td></tr>
          <tr><td>You are not in a hurry</td><td>A lower priority saves a small amount, with a small risk of waiting longer.</td></tr>
        </tbody>
      </table>
      <p>
        MonkStash currently uses a standard fee level and does not ask you to pick a priority. It shows the resulting fee on the
        review step. For most people, most of the time, that is the right trade. For how long a payment takes once it is sent, read{" "}
        <Link href="/monero-transaction-time">how long a Monero transaction takes</Link>.
      </p>

      <h2 id="low">Why the Monero fee is so low</h2>
      <p>
        Three things keep Monero fees small in everyday use.
      </p>
      <ol>
        <li><strong>Blocks are not usually full.</strong> A fee is a price for scarce space. <mark>When space is not scarce, the price stays near the floor</mark>.</li>
        <li><strong>The rate adjusts to demand.</strong> It does not need an auction to find a fair price. It follows how full recent blocks have been.</li>
        <li><strong>There is a steady miner reward.</strong> Miners earn newly created coins on every block, so fees do not have to carry the whole cost of security (more on this in the tail emission section).</li>
      </ol>
      <p>
        Low is not the same as free. The network still needs miners, and a minimum fee keeps spam from clogging blocks.
      </p>

      <h2 id="bitcoin">Monero fees compared with Bitcoin</h2>
      <p>
        Both networks charge by size and both let the price move with demand. The difference is in how that plays out. Bitcoin
        fees come from an open bidding process, so they can spike sharply when the network is crowded. Monero uses an adjusting rate
        tied to block use, which tends to be calmer. For a wider comparison, see{" "}
        <Link href="/monero-vs-bitcoin">Monero vs Bitcoin</Link>.
      </p>
      <table>
        <thead><tr><th></th><th>Monero</th><th>Bitcoin</th></tr></thead>
        <tbody>
          <tr><td>Charged by</td><td>Transaction size in bytes</td><td>Transaction size in virtual bytes</td></tr>
          <tr><td>Depends on amount sent</td><td>No</td><td>No</td></tr>
          <tr><td>Price set by</td><td>Network rate that adjusts with block use, plus your priority</td><td>Open bidding between senders</td></tr>
          <tr><td>Paid to</td><td>The miner of the block</td><td>The miner of the block</td></tr>
        </tbody>
      </table>
      <p>
        We do not list current fees for Bitcoin here because they change too often to be useful in an article. Look at a live
        source if you want the number for either network today.
      </p>

      <h2 id="who">Who gets the Monero fee</h2>
      <p>
        The miner who finds the block that contains your transaction collects the fee, along with the block reward. Monero miners
        compete to add blocks using an algorithm called RandomX. See <Link href="/how-monero-works">how Monero works</Link> for
        the full picture.
      </p>
      <p>
        <mark>The fee does not go to MonkStash</mark>, an exchange, or any other company in the middle. MonkStash is free to use.
        If you want to help it keep running, the <Link href="/donate">donate page</Link> is the way to do that.
      </p>

      <h2 id="tail">Fees and tail emission</h2>
      <p>
        New Monero is created with every block as a reward for miners. The size of that reward fell gradually until the end of May
        2022. Since then Monero has paid a fixed minimum reward, called tail emission, which the Monero project describes as 0.6 XMR
        or less per block (it can be reduced when blocks are large). You can read the official explanation on{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/tail-emission.html" rel="noopener">getmonero.org</a>.
      </p>
      <p>
        Why this matters for fees: miners will always have some reward, even if fees stay small. Networks that depend only on
        fees must keep them high enough to pay for security. <mark>Monero avoids that by design</mark>, which is one reason low fees are
        sustainable.
      </p>

      <h2 id="see">How to see the fee before you send</h2>
      <p>
        You should never pay a fee you did not see. In MonkStash, the fee is shown on the review step, before anything is sent:
      </p>
      <ol>
        <li>Open your <Link href={walletUrl}>wallet</Link> and choose to send.</li>
        <li>Paste the recipient address and enter the amount. You can check an address with the <Link href="/tools/monero-address-validator">address validator</Link>.</li>
        <li>Press <strong>Review</strong>. The wallet builds the transaction and shows the <strong>Network fee</strong> and the <strong>Total</strong>.</li>
        <li>Confirm only if the numbers look right. Nothing leaves your wallet until you do.</li>
      </ol>
      <p>
        The full walkthrough is in <Link href="/send-monero">how to send Monero</Link>.
      </p>

      <h2 id="avoid">Mistakes that cost extra</h2>
      <ul>
        <li><strong>Many tiny sends.</strong> Each transaction pays its own fee. Fewer, larger sends cost less in total.</li>
        <li><strong>Sending from many small payments.</strong> A wallet made of lots of small incoming amounts needs bigger transactions to spend them. Occasionally consolidating can help, but it also costs a fee, so it is not always worth it.</li>
        <li><strong>Confusing the network fee with an exchange fee.</strong> An exchange often charges its own withdrawal fee on top. That is a separate charge. See <Link href="/buy-monero">how to buy Monero</Link>.</li>
        <li><strong>Trusting a site that asks you to pay a fee to receive funds.</strong> A real Monero fee is paid by the sender when sending. Anyone asking you to pay a &quot;release fee&quot; is running a scam.</li>
      </ul>
      <p>
        Ready to try it? <Link href={walletUrl}>Open a MonkStash wallet</Link>, or learn the basics first in{" "}
        <Link href="/what-is-monero">what Monero is</Link>.
      </p>
    </>
  );
}
