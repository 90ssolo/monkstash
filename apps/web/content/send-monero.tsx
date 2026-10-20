import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "send-monero",
  section: "guides",
  kicker: "Step by step",
  title: "How to Send Monero (XMR) Safely: A Step-by-Step Guide",
  seoTitle: "How to Send Monero (XMR) Safely: Step by Step",
  summary: "How to send Monero in about a minute: the exact steps, what the network fee is, how long a payment takes, and how to avoid costly mistakes.",
  keyword: "how to send monero",
  updated: "2026-10-15",
  readingMinutes: 8,
  toc: [
    { id: "before", label: "Before you send" },
    { id: "steps", label: "How to send, step by step" },
    { id: "address", label: "Checking the address" },
    { id: "fee", label: "What is the network fee?" },
    { id: "time", label: "How long it takes" },
    { id: "locked", label: "Why some money is locked" },
    { id: "exchange", label: "Sending to an exchange" },
    { id: "mistakes", label: "Avoid these mistakes" },
    { id: "after", label: "After you send" },
    { id: "next", label: "What to do next" },
  ],
  related: ["receive-monero", "create-monero-wallet", "monero-wallet-not-syncing", "monero-transaction-fee"],
  sources: [
    { label: "Moneropedia: Address", href: "https://www.getmonero.org/resources/moneropedia/address.html" },
    { label: "Moneropedia: Transaction Unlock Time", href: "https://www.getmonero.org/resources/moneropedia/unlocktime.html" },
    { label: "Monero user guide: how to prove a payment", href: "https://www.getmonero.org/resources/user-guides/prove-payment.html" },
    { label: "Monero FAQ (getmonero.org)", href: "https://www.getmonero.org/get-started/faq/" },
  ],
  faq: [
    { q: "How do I send Monero?", a: "Open your wallet, go to the Send screen, paste the recipient's address, enter the amount, review the fee, and confirm. Your wallet then sends the payment to the network and gives you a transaction ID." },
    { q: "How much does it cost to send Monero?", a: "The network fee is usually a tiny fraction of a cent to a few cents. It depends on how busy the network is and the size of your transaction, not on how much you send, so sending a large amount does not cost more in fees." },
    { q: "How long does it take to send Monero?", a: "A payment usually gets its first confirmation in about 2 minutes. Many services wait for 10 confirmations, about 20 minutes, before treating it as final." },
    { q: "Can I cancel a Monero transaction?", a: "No. Once a Monero payment is sent to the network, it cannot be reversed or cancelled. Always check the address before you confirm." },
    { q: "Why can I not spend all of my balance?", a: "Money you just received is locked for about 10 confirmations (roughly 20 minutes). Change from your own recent payments is locked the same way. The locked part becomes spendable on its own." },
    { q: "What happens if I send to the wrong address?", a: "The money goes to whoever controls that address, and there is no way to take it back. If it was a real person you know, you can ask them to return it, but nobody can force that." },
    { q: "Can I send a tiny amount as a test first?", a: "Yes, and it is a good habit with a new address. The fee is small, so a test payment costs very little and confirms the address works before you send the full amount." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        Once your wallet is set up and synced, sending Monero is quick. The important part is not the clicking. It is checking the
        details, because <mark>a Monero payment cannot be undone</mark>. This guide takes you through the whole process in plain language: what
        to check before you press send, how the fee and timing work, and the small habits that keep you from losing money to a
        typo or a scam.
      </p>

      <Takeaways items={[
        "You need the recipient's address, the amount, and a synced wallet with spendable funds.",
        "The network fee is usually a few cents or less, no matter how much you send.",
        "Payments get a first confirmation in about 2 minutes and are treated as final after about 20.",
        "Monero payments cannot be reversed, so double-check the address every time.",
      ]} />

      <h2 id="before">Before you send</h2>
      <p>
        Run through this short list first. <mark>It takes thirty seconds and prevents most problems</mark>.
      </p>
      <ul>
        <li><strong>Your wallet has finished syncing.</strong> Until it does, the balance can be wrong. If it is stuck, see <Link href="/monero-wallet-not-syncing">fixing a wallet that will not sync</Link>.</li>
        <li><strong>You have spendable funds.</strong> Recent deposits may still be locked (more on that below).</li>
        <li><strong>You have the right address.</strong> The recipient gets it from their own wallet. See <Link href="/receive-monero">how to receive Monero</Link>.</li>
        <li><strong>You are on the real wallet.</strong> Use a bookmark, not a link from a message or an ad.</li>
      </ul>

      <h2 id="steps">How to send, step by step</h2>
      <ol>
        <li>Open your <Link href={walletUrl}>wallet</Link> and unlock it with your password.</li>
        <li>Go to the Send tab.</li>
        <li>Paste the recipient&apos;s address. Your wallet checks that the format is valid.</li>
        <li>Enter the amount in XMR. Your spendable balance is shown so you do not go over.</li>
        <li>Review the details. The wallet shows the network fee and the total before you confirm.</li>
        <li>Compare the first and last few characters of the address with what the recipient gave you.</li>
        <li>Confirm. Your payment is sent to the network, and you get a transaction ID you can keep as a receipt.</li>
      </ol>
      <p>
        The recipient does not need to be online. The payment is recorded on the network and appears in their wallet next time it
        syncs.
      </p>

      <h2 id="address">Checking the address</h2>
      <p>
        A Monero address is a long string of letters and numbers. A standard main address starts with 4, and a <Link href="/monero-subaddress">subaddress</Link> (an extra
        address a wallet creates for the same account) starts with 8. Both are normal and both are fine to send to. Some payments
        also use an integrated address, which has a payment ID built in.
      </p>
      <p>
        Because addresses are long, <mark>nobody can check them by eye all the way through</mark>. The practical habit is:
      </p>
      <ol>
        <li>Copy and paste the address rather than typing it.</li>
        <li>Check the first six and last six characters against the original.</li>
        <li>For a large payment, send a small test amount first and wait for the recipient to confirm it arrived.</li>
      </ol>
      <Callout kind="warn" title="Watch out for address-swapping malware">
        Some harmful programs quietly replace a copied crypto address with the attacker&apos;s own. Always look at the address
        after you paste it and compare the ends. This is the best defense, and it works.
      </Callout>

      <h2 id="fee">What is the network fee?</h2>
      <p>
        Every Monero transaction pays a <Link href="/monero-transaction-fee">small fee</Link> to the miners who process it. It is usually a tiny fraction of a cent to a few
        cents. The fee depends on how busy the network is and the size of your transaction, <mark>not on the amount you send</mark>. So sending
        10 XMR costs about the same in fees as sending 0.1 XMR. Your wallet estimates the fee and shows it before you confirm.
      </p>
      <p>
        That fee goes to the network, not to the wallet. <mark>MonkStash does not add a fee of its own on top</mark>. Fees can rise a little
        when the network is busy, so if the number looks surprising, wait and try again later.
      </p>

      <h2 id="time">How long it takes</h2>
      <p>
        A new block is added about every 2 minutes, so your payment usually gets its first confirmation in a couple of minutes.
        Each new block on top adds another confirmation. Many exchanges and services wait for <Link href="/monero-transaction-time">10 confirmations</Link>, roughly 20 minutes,
        before they treat the payment as final. For a small purchase, <mark>the first confirmation is often enough</mark>.
      </p>
      <table>
        <thead><tr><th>Stage</th><th>Typical time</th><th>What it means</th></tr></thead>
        <tbody>
          <tr><td>Sent</td><td>Instant</td><td>Your wallet has broadcast the payment</td></tr>
          <tr><td>First confirmation</td><td>About 2 minutes</td><td>A block now includes your payment</td></tr>
          <tr><td>Fully settled</td><td>About 20 minutes (10 confirmations)</td><td>Most services treat it as final</td></tr>
        </tbody>
      </table>

      <h2 id="locked">Why some money is locked</h2>
      <p>
        You may notice that part of your balance cannot be spent right after a payment. Monero locks newly received funds for
        about 10 confirmations (roughly 20 minutes). It also locks the &quot;change&quot; that comes back to you when you send.
        Change is what is left over, like getting coins back after paying with a larger note.
      </p>
      <p>
        This is normal. <mark>The locked amount unlocks by itself as blocks arrive</mark>. If you want to send several payments in a row, you
        may need to wait between them, or send them together if the wallet allows.
      </p>

      <h2 id="exchange">Sending to an exchange or a shop</h2>
      <p>
        Most of the time you paste an address and send, but some destinations have extra rules. Check these before you send:
      </p>
      <ul>
        <li><strong>Use the deposit address they give you.</strong> Do not reuse an old one without checking it is still valid.</li>
        <li><strong>Watch for a payment ID or memo.</strong> A few services still ask for one. Skipping it can delay or lose a deposit.</li>
        <li><strong>Check the minimum.</strong> Deposits below a service&apos;s minimum may not be credited.</li>
        <li><strong>Wait for their confirmations.</strong> A service may need 10 confirmations before showing your balance.</li>
      </ul>

      <h2 id="mistakes">Avoid these mistakes</h2>
      <Callout kind="warn" title="Monero payments are final">
        <mark>There is no cancel button and no chargeback</mark>. If you send to the wrong address, the money is gone. Check the first and last
        few characters of the address match what the recipient gave you, every time.
      </Callout>
      <ul>
        <li>Sending before the wallet has synced, so the balance is wrong.</li>
        <li>Typing an address by hand instead of pasting it.</li>
        <li>Ignoring an address-format warning from your wallet.</li>
        <li>Sending to an address from an email, chat, or website you cannot verify.</li>
        <li>Trusting a stranger who promises to &quot;double&quot; your Monero. That is always a scam.</li>
      </ul>

      <h2 id="after">After you send</h2>
      <p>
        Save the transaction ID. It is your receipt, and it lets you <Link href="/monero-transaction-lookup">look up the payment status</Link> if the recipient asks. Because
        Monero hides amounts and addresses on the public network, a transaction ID on its own does not let strangers see the
        details of your payment. If you need to prove a payment to someone, your wallet may be able to produce a proof. To
        understand why Monero works this way, read <Link href="/is-monero-traceable">whether Monero is traceable</Link>.
      </p>
      <p>
        If the payment has not appeared after a while, check that your wallet and the recipient&apos;s wallet are both synced
        before assuming anything is wrong.
      </p>

      <h2 id="next">What to do next</h2>
      <p>
        You now know how to send safely. The other half of the picture is{" "}
        <Link href="/receive-monero">receiving Monero</Link>. If you do not have a wallet yet, start with{" "}
        <Link href="/create-monero-wallet">creating one</Link>, and read the{" "}
        <Link href="/faq">FAQ</Link> if you have more questions.
      </p>
    </>
  );
}
