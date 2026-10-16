import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { IlloStealth } from "@/components/art/Illustrations";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "receive-monero",
  section: "guides",
  kicker: "Step by step",
  title: "How to Receive Monero (XMR): Addresses, QR Codes and Privacy",
  seoTitle: "How to Receive Monero (XMR): Address and QR",
  summary: "To receive Monero, share an address from your wallet. Learn the steps, why a fresh address per sender helps your privacy, and when the money is really yours.",
  keyword: "how to receive monero",
  updated: "2026-10-15",
  readingMinutes: 8,
  toc: [
    { id: "basics", label: "The basics" },
    { id: "steps", label: "How to receive, step by step" },
    { id: "types", label: "Address types explained" },
    { id: "subaddress", label: "Use a fresh address per sender" },
    { id: "private", label: "What the sender can see" },
    { id: "confirm", label: "When is the money mine?" },
    { id: "payment-id", label: "Do you need a payment ID?" },
    { id: "safety", label: "Stay safe when sharing" },
    { id: "trouble", label: "If a payment does not show up" },
    { id: "next", label: "What to do next" },
  ],
  related: ["send-monero", "back-up-monero-wallet", "create-monero-wallet", "monero-subaddress"],
  faq: [
    { q: "How do I receive Monero?", a: "Open your wallet, go to the Receive screen, and copy your address or show its QR code. Send that to the person paying you. The payment appears in your wallet after the network confirms it." },
    { q: "What is a Monero address?", a: "A Monero address is a string of letters and numbers, starting with 4, that people use to send you XMR. Your wallet can also create extra addresses, called subaddresses, that all belong to you." },
    { q: "Can someone see my balance if I give them my address?", a: "No. Giving out your address only lets people send to you. They cannot see your balance or your other payments from the address alone." },
    { q: "Do I need a payment ID?", a: "Usually not. A fresh subaddress for each sender does the same job more privately. Some exchanges still ask for a payment ID, so follow their instructions when they do." },
    { q: "How long does it take to receive Monero?", a: "A payment usually shows up within about 2 minutes and is fully spendable after about 10 confirmations, roughly 20 minutes." },
    { q: "Can I reuse the same Monero address?", a: "Yes, it works. Monero does not publicly link payments to the same address the way many other coins do, but a fresh subaddress per sender still gives cleaner records and a small extra privacy benefit." },
    { q: "Does the sender need to be online when I receive?", a: "No. Once they send, the payment is on the network. Your wallet picks it up the next time it syncs, even if the sender has gone offline." },
  ],
  sources: [
    { label: "Monero docs: Subaddresses (a new one for each payer)", href: "https://docs.getmonero.org/public-address/subaddress/" },
    { label: "Monero docs: Integrated addresses (a payment ID built into the address)", href: "https://docs.getmonero.org/public-address/integrated-address/" },
    { label: "Moneropedia: Stealth addresses (one-time addresses)", href: "https://www.getmonero.org/resources/moneropedia/stealthaddress.html" },
    { label: "Moneropedia: Payment ID (long payment IDs removed in 0.15)", href: "https://www.getmonero.org/resources/moneropedia/paymentid.html" },
    { label: "Monero project: Accepting Monero (10 confirmations before spending)", href: "https://www.getmonero.org/get-started/accepting/" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <mark>Receiving Monero is simple</mark>: you give the sender an address from your wallet, and the money arrives there. The small extra
        step that protects your privacy is using a different address for each person. This guide covers the whole thing in plain
        language, from copying your first address to knowing when a payment is truly yours, so you can get paid without second-guessing.
      </p>

      <Takeaways items={[
        "Share an address from your wallet, and senders pay to it. You never share your recovery words.",
        "Your address alone does not reveal your balance or history.",
        "A fresh address per sender keeps your payments from being linked.",
        "Money usually appears within minutes and is fully spendable after about 20.",
      ]} />

      <h2 id="basics">The basics</h2>
      <p>
        Your wallet has a main address, a long string that starts with 4. Anyone can send Monero to it. Handing out your address is
        safe: <mark>it only lets people pay you, not see your funds</mark>. Your wallet also shows a QR code of the address, which is the easiest
        way to receive on a phone, since the sender just scans it with their camera.
      </p>
      <p>
        Think of an address like an email address for money. People can write to it, but <mark>they cannot read your inbox</mark>. If you do not
        have a wallet yet, <Link href="/create-monero-wallet">create one first</Link>.
      </p>

      <h2 id="steps">How to receive, step by step</h2>
      <ol>
        <li>Open your <Link href={walletUrl}>wallet</Link> and go to the Receive tab.</li>
        <li>Create a fresh subaddress for this sender if you want to keep payments separate (recommended).</li>
        <li>Copy the address, or show the QR code for the sender to scan.</li>
        <li>Send it to the person paying you. They paste or scan it into their own wallet.</li>
        <li>Wait a few minutes. The payment appears in your wallet once the network confirms it.</li>
      </ol>
      <p>
        Make sure your wallet is synced so it can see new payments. If it falls behind, the payment is still safe on the network,
        and it shows up once the wallet catches up.
      </p>

      <h2 id="types">Address types explained</h2>
      <p>
        You may see a few kinds of Monero address. They all lead to your wallet, but they have different uses.
      </p>
      <table>
        <thead><tr><th>Type</th><th>Starts with</th><th>Used for</th></tr></thead>
        <tbody>
          <tr><td>Main address</td><td>4</td><td>Your wallet&apos;s primary address</td></tr>
          <tr><td>Subaddress</td><td>8</td><td>Extra addresses for different senders or purposes</td></tr>
          <tr><td>Integrated address</td><td>4 (longer)</td><td>A main address with a payment ID built in</td></tr>
        </tbody>
      </table>
      <p>
        For most people, a main address plus subaddresses is all you ever need.
      </p>

      <h2 id="subaddress">Use a fresh address for each sender</h2>
      <p>
        Your wallet can create extra addresses, called <Link href="/monero-subaddress">subaddresses</Link>, that all belong to you. <mark>Giving each person a different one</mark> is a
        small habit with a real benefit: it keeps your payments organized and avoids tying different senders to a single public
        address. It also makes bookkeeping easier, since you can tell at a glance which address a payment came through.
      </p>
      <Callout title="One wallet, many addresses">
        Every subaddress lands in the same wallet and the same balance. You are not creating separate wallets, just separate
        doorways into the one you already have.
      </Callout>

      <h2 id="private">What the sender can see</h2>
      <p>
        Monero uses{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/stealthaddress.html" rel="noopener">one-time addresses</a> behind the scenes. When someone pays you, the network records a unique, single-use
        destination for that payment, so outsiders looking at the blockchain cannot tell which public address received it. Apart
        from the sender, only you, with your wallet&apos;s keys, can recognize the payment as yours.
      </p>
      <Figure caption="Each payment goes to a one-time address that only the receiver can recognize.">
        <IlloStealth />
      </Figure>
      <p>
        So <mark>the sender knows the address you gave them, and nothing more</mark>. They cannot see your balance, your other payments, or
        where you spend. To learn why, see <Link href="/how-monero-works">how Monero works</Link>. No system is magic, so
        remember that privacy can still leak through how you behave, such as posting an address publicly next to your name.
      </p>

      <h2 id="confirm">When is the money really mine?</h2>
      <p>
        A payment usually shows up within a couple of minutes, then needs a short time to settle. New Monero needs about 10
        confirmations, <mark>roughly 20 minutes, before it is fully spendable</mark>. For small amounts, seeing it arrive is usually enough. For
        larger amounts, wait for it to confirm before you treat it as done.
      </p>
      <ul>
        <li><strong>Pending:</strong> your wallet has seen the payment but no block includes it yet.</li>
        <li><strong>Confirmed:</strong> a block includes it. Each new block adds another confirmation.</li>
        <li><strong>Unlocked:</strong> after <Link href="/monero-transaction-time">about 10 confirmations</Link>, you can spend it.</li>
      </ul>

      <h2 id="payment-id">Do you need a payment ID?</h2>
      <p>
        Older Monero payments used a separate payment ID to tell customers apart on a shared address. <mark>This is mostly obsolete</mark>.
        Subaddresses do the same job better and more privately. You may still meet a payment ID when you deposit into an exchange
        that asks for one. In that case, follow the exchange&apos;s instructions exactly, because a missing ID can delay your
        deposit. For receiving into your own wallet, you can ignore payment IDs.
      </p>

      <h2 id="safety">Stay safe when sharing</h2>
      <p>
        Sharing your address is safe. What is not safe is anything that asks for more than the address.
      </p>
      <Callout kind="warn" title="Never share your recovery words or private keys">
        <mark>A sender only needs your address</mark>. Anyone asking for your <Link href="/monero-seed-phrase">25 recovery words</Link>, your password, or your spend key, even to
        &quot;confirm&quot; or &quot;release&quot; a payment, is trying to steal from you.
      </Callout>
      <ul>
        <li>Copy your address from your own wallet each time, rather than from an old message.</li>
        <li>Be wary of anyone who sends you a small payment and then asks you to pay a fee to claim more. This is a scam.</li>
        <li>If you publish an address publicly, such as for donations, use a dedicated subaddress for it.</li>
      </ul>

      <h2 id="trouble">If a payment does not show up</h2>
      <p>
        First, make sure your wallet has finished syncing, since a wallet that is behind will not show recent payments. If it still
        does not appear, work through these checks:
      </p>
      <ol>
        <li>Ask the sender for the transaction ID and <Link href="/monero-transaction-lookup">confirm their payment went through</Link>.</li>
        <li>Check they used the exact address you gave them, not an older or mistyped one.</li>
        <li>Wait a few more minutes. Busy periods can delay confirmation.</li>
        <li>If you restored the wallet, check the restore date was not set too late.</li>
      </ol>
      <p>
        A stuck or slow sync is the most common cause, and{" "}
        <Link href="/monero-wallet-not-syncing">fixing a wallet that will not sync</Link> covers that in detail.
      </p>

      <h2 id="next">What to do next</h2>
      <p>
        Once money arrives, the best next step is to make sure it is safe. Back up your recovery words if you have not already, using{" "}
        <Link href="/back-up-monero-wallet">this backup guide</Link>. When you are ready to spend, the other half of the
        picture is <Link href="/send-monero">sending Monero</Link>. Need a refresher on the basics? Read{" "}
        <Link href="/what-is-monero">what Monero is</Link>. Getting paid for work or sales? See{" "}
        <Link href="/accept-monero-payments">how to accept Monero payments</Link>.
      </p>
    </>
  );
}
