import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { BalanceVisibilityArt } from "@/components/art/CheckMoneroBalanceArt";
import { walletUrl } from "@/lib/site";

const VIEWKEY = "https://www.getmonero.org/resources/moneropedia/viewkey.html";
const STEALTH = "https://www.getmonero.org/resources/moneropedia/stealthaddress.html";
const RINGCT = "https://www.getmonero.org/resources/moneropedia/ringCT.html";
const VIEW_ONLY_GUIDE = "https://www.getmonero.org/resources/user-guides/view_only.html";
const PROVE = "https://www.getmonero.org/resources/user-guides/prove-payment.html";
const CARROT = "https://github.com/jeffro256/carrot/blob/master/carrot.md";

export const meta: ArticleMeta = {
  slug: "check-monero-balance",
  section: "guides",
  kicker: "Balance",
  title: "How to Check a Monero Balance (and Why an Address Alone Is Not Enough)",
  seoTitle: "Monero Wallet Balance Check: What Works",
  summary: "You cannot check a Monero balance from an address alone. Here is what works: open the wallet, watch it with the view key, or prove one payment.",
  keyword: "monero wallet balance check",
  updated: "2026-10-15",
  readingMinutes: 8,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "why", label: "Why an address shows nothing" },
    { id: "ways", label: "Three ways that work" },
    { id: "watch", label: "Watch a wallet with its view key" },
    { id: "limits", label: "What a view key cannot show (yet)" },
    { id: "one-payment", label: "Check one payment instead" },
    { id: "scams", label: "Fake balance checkers" },
    { id: "next", label: "Your next step" },
  ],
  related: ["monero-view-only-wallet", "monero-view-key", "monero-transaction-lookup", "monero-stealth-address"],
  faq: [
    { q: "Can I check a Monero wallet balance with just the address?", a: "No. Monero payments go to one-time stealth addresses and the amounts are hidden, so a public address does not appear on the blockchain in a way anyone can add up. To see a balance you need the wallet itself or its private view key." },
    { q: "Is there an XMR wallet balance checker like the ones for Bitcoin?", a: "Not one that works from an address. Block explorers show Monero blocks and transactions, but they cannot tell which payments belong to which address. A site that claims to show a Monero balance from an address alone is mistaken or misleading." },
    { q: "How do I view a Monero wallet without being able to spend from it?", a: "Create a view-only (watch-only) wallet with the primary address and the private view key. It shows incoming payments but holds no spend key, so it cannot move money. MonkStash, Monero GUI and Feather all offer this." },
    { q: "Why is the balance in my view-only wallet too high?", a: "A view-only wallet sees money coming in but cannot reliably tell when it was spent. After any send, it keeps counting the spent funds. Check the balance in the full wallet that holds the recovery words." },
    { q: "Can someone see my Monero balance if I give them my address?", a: "No. Your address lets people pay you, not watch you. Only someone with your private view key can see your incoming payments, and only your recovery words or spend key can move funds." },
    { q: "How can I prove I sent Monero to someone?", a: "Share the transaction ID, the recipient address and the transaction key from your wallet. The recipient or a third party can check the amount that this one transaction sent to that address, without seeing anything else." },
    { q: "Is it safe to enter my seed into a Monero balance checker?", a: "Never. Checking a balance does not need your recovery words. Any site that asks for them can take everything in the wallet." },
  ],
  sources: [
    { label: "Moneropedia: view key", href: VIEWKEY },
    { label: "Moneropedia: stealth address", href: STEALTH },
    { label: "Moneropedia: RingCT", href: RINGCT },
    { label: "Monero user guide: how to make a view-only wallet", href: VIEW_ONLY_GUIDE },
    { label: "Monero user guide: prove a payment", href: PROVE },
    { label: "Carrot specification (full view-only tier)", href: CARROT },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <mark>You cannot look up a Monero balance from an address alone.</mark> That is not a missing feature; it is the privacy
        Monero is built for. To check a balance you need one of three things: the wallet itself, its private view key, or a proof for
        one specific payment. This guide shows each one, what it reveals, and how to avoid the &quot;balance checker&quot; sites that
        exist only to steal recovery words.
      </p>

      <Takeaways items={[
        "A Monero address does not reveal a balance or payments. Block explorers cannot add it up.",
        "The full balance lives in the wallet that holds the recovery words. Open it and let it sync.",
        "To watch without spending, use a view-only wallet with the address and the private view key.",
        "A view-only wallet sees incoming money, not reliably outgoing spends, so its balance can be too high.",
        "Checking a balance never needs your recovery words. A site that asks for them is a scam.",
      ]} />

      <h2 id="short">The short answer</h2>
      <table>
        <thead><tr><th>What you have</th><th>What you can see</th><th>How</th></tr></thead>
        <tbody>
          <tr><td>Only an address</td><td>Nothing about its balance</td><td>No tool can do this, by design</td></tr>
          <tr><td>Address + private view key</td><td>Incoming payments and their amounts</td><td>A view-only (watch-only) wallet</td></tr>
          <tr><td>Recovery words (or spend key)</td><td>The true balance, history, and the power to spend</td><td>Restore or open the wallet</td></tr>
          <tr><td>Tx ID + tx key + address</td><td>The amount of that one payment</td><td>A payment check in a wallet or explorer</td></tr>
        </tbody>
      </table>

      <h2 id="why">Why an address shows nothing</h2>
      <p>
        On Bitcoin, your address appears on the public ledger every time you are paid, with the amount next to it. Anyone can paste
        it into an explorer and read your balance. Monero was designed so that this does not work. Two features do the job:
      </p>
      <ul>
        <li>
          <strong>Stealth addresses.</strong> Every payment goes to a fresh one-time address that only the receiver can link to their
          wallet. Your published address never appears on the chain. See{" "}
          <a href={STEALTH} rel="noopener">the Moneropedia entry</a>, or our plain-words guide to the{" "}
          <Link href="/monero-stealth-address">Monero stealth address</Link>.
        </li>
        <li>
          <strong>RingCT.</strong> Amounts are hidden. According to <a href={RINGCT} rel="noopener">Moneropedia</a>, RingCT is how
          transaction amounts are hidden, and it has been mandatory for all transactions since September 2017.
        </li>
      </ul>
      <p>
        So a &quot;Monero address lookup&quot; on a block explorer finds nothing to show. <mark>Your address lets people pay you, not
        watch you.</mark> That is exactly what you want from private money.
      </p>
      <Figure caption="What each thing you hold lets you see. A balance check never needs the recovery words.">
        <BalanceVisibilityArt />
      </Figure>

      <h2 id="ways">Three ways that work</h2>
      <h3>1. Open the wallet itself</h3>
      <p>
        The simplest way to check your own balance is to open the wallet that holds your recovery words and let it sync. The wallet
        scans the network with your keys, finds every payment to you and every spend from you, and adds them up. If you only have the
        words, restore them; our guide on <Link href="/restore-monero-wallet">how to restore a Monero wallet</Link> covers it.
      </p>
      <p>
        In MonkStash the balance screen also tells you how much is <strong>spendable now</strong>, with a countdown for funds that
        are still locked after a recent payment. If part of your balance is waiting, read{" "}
        <Link href="/monero-unlocked-balance">why part of your Monero is locked</Link>.
      </p>
      <h3>2. Watch it with the view key</h3>
      <p>
        Good for checking a cold wallet, a donation address or a shop till without exposing the spend key. Details in the next section.
      </p>
      <h3>3. Prove one payment</h3>
      <p>
        If you only need to confirm that a specific transfer happened, a transaction key proves it without revealing anything else.
        See <a href="#one-payment">check one payment instead</a>.
      </p>

      <h2 id="watch">Watch a wallet with its view key</h2>
      <p>
        Every Monero wallet has a <strong>private view key</strong>. Moneropedia explains that by sharing it, a person allows{" "}
        <a href={VIEWKEY} rel="noopener">access to view every incoming transaction</a> for that address. Put the address and the view
        key into a <strong>view-only wallet</strong> (also called watch-only) and you get a window onto the wallet that{" "}
        <mark>can watch, but never spend</mark>.
      </p>
      <p>In MonkStash it takes about a minute:</p>
      <ol>
        <li>Open the <Link href={walletUrl}>MonkStash wallet</Link> and choose <strong>Add a watch-only wallet</strong>.</li>
        <li>Paste the primary address (it starts with 4) and the private view key (64 characters).</li>
        <li>MonkStash checks that the view key really belongs to that address, so a mismatched pair is caught before you wait for a sync.</li>
        <li>Add a rough date of the first payment to speed up the scan, set a password, and let it sync.</li>
      </ol>
      <p>
        Everything happens in your browser: there is no account, and the keys are not sent to us. Monero GUI and Feather
        can make view-only wallets too, as the official{" "}
        <a href={VIEW_ONLY_GUIDE} rel="noopener">view-only wallet guide</a> shows. For the full walkthrough, see our{" "}
        <Link href="/monero-view-only-wallet">Monero view-only wallet guide</Link>, and for what the key itself is,{" "}
        <Link href="/monero-view-key">the Monero view key explained</Link>.
      </p>
      <Callout title="Share the view key carefully">
        A view key cannot move money, but it does reveal every incoming payment and amount to whoever holds it. Give it only to people
        or tools you would trust with that history, such as your accountant or your own second device.
      </Callout>

      <h2 id="limits">What a view key cannot show (yet)</h2>
      <p>
        Here is the honest catch. The Monero project&apos;s{" "}
        <a href={VIEW_ONLY_GUIDE} rel="noopener">view-only guide</a> says a view-only wallet can only see incoming transactions; it
        cannot see outgoing ones. Moneropedia adds that the balance shown via a view key should not be relied upon.
      </p>
      <p>
        In practice: if the wallet has ever sent money, the view-only balance stays <strong>too high</strong>, because it still counts
        the spent funds. MonkStash says so on the balance screen of every watch-only wallet. To get the true figure, check in the full
        wallet. (Some wallets can import &quot;key images&quot; from the full wallet to correct it; our view-only guide explains how.)
      </p>
      <p>
        This is planned to improve. The Carrot addressing scheme, part of the planned{" "}
        <Link href="/monero-fcmp">FCMP++ upgrade</Link>, includes a{" "}
        <a href={CARROT} rel="noopener">full view-only tier</a> that its specification says can identify spent outputs and so show
        the correct balance without being able to spend. Until that upgrade is live and your wallet supports it, treat a view-only
        balance as &quot;received so far&quot;, not &quot;what is left&quot;.
      </p>

      <h2 id="one-payment">Check one payment instead</h2>
      <p>
        Often you do not need a balance at all. You need to know whether one payment arrived. Monero has a tool for that: the{" "}
        <strong>transaction key</strong>. The sender takes three things from their wallet (the transaction ID, the recipient&apos;s
        address and the transaction key) and anyone can check how much that one transaction sent to that address. The official{" "}
        <a href={PROVE} rel="noopener">payment proof guide</a> shows the commands, and our{" "}
        <Link href="/monero-transaction-lookup">Monero transaction lookup guide</Link> covers explorers and proofs step by step.
      </p>
      <p>
        It reveals nothing else about either wallet, which makes it the right tool for settling &quot;did you send it?&quot; with an
        exchange, a seller or a friend.
      </p>

      <h2 id="scams">Fake balance checkers</h2>
      <p>
        Search for &quot;XMR wallet balance checker&quot; and you may find sites that promise to show any Monero balance. Since that
        is impossible from an address, many of them ask for more: your recovery words, your private spend key, or a wallet file.{" "}
        <mark>That is the whole scam.</mark> Once you type the words, the site owner can empty the wallet, and Monero payments cannot
        be reversed.
      </p>
      <Callout kind="warn" title="A balance never needs your words">
        Your 25 recovery words (or 13 from MyMonero, or 12 from Exodus) are the wallet. Only type them into a wallet you installed or
        opened yourself to restore it, never into a &quot;checker&quot;, &quot;validator&quot; or &quot;sync&quot; page.
      </Callout>
      <p>
        If you already did, move your funds to a new wallet with new words now. Our guide on{" "}
        <Link href="/monero-phishing-sites">how to spot a fake Monero wallet site</Link> shows how.
      </p>

      <h2 id="next">Your next step</h2>
      <p>
        Want to see a wallet&apos;s incoming payments without risking the funds? <Link href={walletUrl}><strong>Watch a wallet with its
        view key</strong></Link> in MonkStash: free, no account, keys stay in your browser. Want the exact balance? Open the full wallet
        and let it sync. And if the balance looks wrong once it is open, our guide to a{" "}
        <Link href="/monero-wallet-not-showing-balance">Monero wallet not showing a balance</Link> walks through the fixes.
      </p>
    </>
  );
}
