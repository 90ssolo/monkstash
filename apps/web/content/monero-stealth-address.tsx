import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { OneAddressManyOutputsArt, StealthRecipeArt } from "@/components/art/MoneroStealthAddressArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-stealth-address",
  section: "learn",
  kicker: "Privacy deep dive",
  title: "Monero Stealth Addresses: How One-Time Addresses Protect You",
  seoTitle: "Monero Stealth Address: How It Protects You",
  summary: "A Monero stealth address is a one-time address made for each payment, so your public address never appears on chain. See how it works and why it matters.",
  keyword: "monero stealth address",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "problem", label: "The problem stealth addresses solve" },
    { id: "how", label: "How a one-time address is made" },
    { id: "finding", label: "How your wallet finds your payments" },
    { id: "spending", label: "Spending from a one-time address" },
    { id: "publishing", label: "What it means for publishing an address" },
    { id: "subaddresses", label: "Stealth addresses vs subaddresses" },
    { id: "limits", label: "What stealth addresses do not hide" },
    { id: "wallet", label: "What you do in practice" },
  ],
  related: ["how-monero-works", "monero-ring-signatures", "monero-subaddress", "monero-view-key", "is-monero-traceable"],
  faq: [
    { q: "What is a stealth address in Monero?", a: "A stealth address is a one-time destination created by the sender for a single payment, using the receiver's public address and fresh randomness. It is the address that appears on the blockchain, instead of the receiver's real public address." },
    { q: "Is a Monero stealth address the same as my public address?", a: "No. Your public address is the long string you share. A stealth address is what the sender derives from it for each payment. Your public address itself never appears on the blockchain." },
    { q: "How do I get a stealth address?", a: "You do not make one. Your wallet has a normal address, and the sender's wallet creates the stealth address automatically every time someone pays you." },
    { q: "How does my wallet know a payment is mine?", a: "It scans new outputs and uses your private view key to test whether each one was built for you. Only outputs made from your address pass the test." },
    { q: "Is it safe to post my Monero address publicly?", a: "Your payments do not become visible on chain, because each one goes to a different one-time address. The risk is elsewhere: the person who knows the address is yours can still see what you tell them, and posting one address everywhere links the payers to each other off chain." },
    { q: "Are stealth addresses the same as subaddresses?", a: "No. Stealth addresses are an automatic protocol feature that happens on every payment. Subaddresses are extra addresses you choose to create, mainly to tell payments apart. A payment to a subaddress still lands on a one-time stealth address." },
    { q: "Can someone link two payments sent to the same Monero address?", a: "Not from the blockchain alone. Two payments to the same address land on two different one-time addresses that look unrelated, unless someone has your private view key." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A Monero stealth address is a one-time address that the sender creates for a single payment to you. You share one public
        address, but what appears on the blockchain is a fresh address derived from it, used once and never again. The result is that{" "}
        <mark>your public address never shows up on the chain, and outsiders cannot link your payments together</mark>. This guide
        takes the mechanism apart. For the full picture of how it fits with ring signatures and hidden amounts, start with{" "}
        <Link href="/how-monero-works">how Monero works</Link>.
      </p>

      <Takeaways items={[
        "Your public address is for the sender's wallet to read, not for the blockchain to show.",
        "Each payment goes to its own one-time address, created by the sender.",
        "Your private view key lets your wallet recognise the payments made to you.",
        "Stealth addresses are automatic. Subaddresses are a separate, optional tool you control.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        The Monero project describes stealth addresses this way: the sender generates a new, random one-time address for each
        transaction sent to the recipient. The recipient can publish a single address, yet <mark>each payment lands on a different address</mark> on
        the blockchain that cannot be tied back to the published address or to other payments. Only the sender and the recipient can
        tell where a given payment went.
      </p>

      <h2 id="problem">The problem stealth addresses solve</h2>
      <p>
        On Bitcoin, an address is also a public account number. If you give someone your address, they can look it up and read every
        payment it has ever received. Reusing an address links your payments together, and one slip, like posting it next to your
        name, exposes the full history.
      </p>
      <p>
        Wallet developers on Bitcoin work around this by generating a new address for each payment, which takes care and discipline.
        Monero builds that discipline into the protocol. <mark>You can reuse a Monero address a thousand times</mark>, and the blockchain will show a
        thousand unrelated destinations. The privacy does not depend on you remembering to do anything.
      </p>

      <h2 id="how">How a one-time address is made</h2>
      <p>
        A standard Monero address holds two public keys: a public spend key and a public view key. The{" "}
        <a href="https://docs.getmonero.org/public-address/standard-address/" rel="noopener">address documentation</a> lays out the
        structure: a network byte, the two public keys, and a checksum, encoded as 95 characters. Those two keys are the ingredients
        for stealth addresses.
      </p>
      <p>
        When someone pays you, their wallet does this, in plain terms:
      </p>
      <ol>
        <li>It reads your two public keys from your address.</li>
        <li>It picks a fresh random secret for this transaction. Nobody else can guess it, and it is never reused.</li>
        <li>It mixes that secret with your public view key, then combines the result with your public spend key. This produces a new one-time key that is mathematically tied to you but does not look like you.</li>
        <li>It writes that one-time key into the transaction as the output&apos;s destination, and also publishes a helper value derived from the random secret, so your wallet can later redo the calculation.</li>
      </ol>
      <Figure caption="The four steps in order. Only the first is something you shared. Everything after it is created by the sender and lives on the chain for one payment only.">
        <StealthRecipeArt />
      </Figure>
      <p>
        If you want the exact formulas, the open textbook{" "}
        <a href="https://www.getmonero.org/library/Zero-to-Monero-2-0-0.pdf" rel="noopener">Zero to Monero</a> walks through them. You
        do not need them to use Monero safely.
      </p>

      <h2 id="finding">How your wallet finds your payments</h2>
      <p>
        If the blockchain only shows one-time addresses, how do you know which ones are yours? Your wallet checks. For every new
        output, it takes the helper value published in the transaction and combines it with your private view key. If the output
        was built from your address, <mark>the numbers line up and the wallet marks it as yours</mark>. If not, they do not, and the wallet moves
        on.
      </p>
      <p>
        This is why a wallet has to <em>scan</em> the chain, block by block, to build your balance. Nothing on the chain says
        &quot;this is yours.&quot; Your wallet has to try every output and keep the ones that pass. Starting from the right block
        saves a lot of work; see <Link href="/monero-restore-height">what the restore height is</Link>. A small hint called a
        view tag, added in the August 2022 network upgrade, lets wallets skip most non-matching outputs quickly and speeds up scanning.
      </p>
      <p>
        The private view key does this job on its own, which is why a{" "}
        <Link href="/monero-view-key">view key</Link> can power a watch-only wallet: it recognises your incoming payments but
        cannot spend them.
      </p>
      <Figure caption="One public address, many payers, many different on-chain destinations. Only your wallet can connect them.">
        <OneAddressManyOutputsArt />
      </Figure>

      <h2 id="spending">Spending from a one-time address</h2>
      <p>
        Recognising the payment is not enough, you also need to spend it. The private spend key, combined with the same shared
        secret your wallet just found, produces the secret that controls that one-time output. Nobody can calculate it without your
        spend key, so seeing the one-time address on the chain <mark>gives an outsider no power over the money</mark>.
      </p>
      <p>
        When you do spend, the output joins a ring and its fingerprint becomes a key image, as explained in{" "}
        <Link href="/monero-ring-signatures">Monero ring signatures</Link>. The two features work as a pair: stealth addresses
        <mark>hide where money arrived, rings hide where it left from</mark>.
      </p>

      <h2 id="publishing">What it means for publishing an address</h2>
      <p>
        You can post a Monero address on a website, a donation page, or a profile without handing out your payment history. Because of
        stealth addresses, someone who finds it <Link href="/monero-transaction-lookup">cannot look it up on a block explorer</Link> and see what you received. There is nothing to
        look up: the address never appears on the chain.
      </p>
      <KeyFact label="The rule of thumb">
        <mark>A Monero address is safe to publish for receiving</mark>. The remaining risks are about who you tell, not what the chain shows.
      </KeyFact>
      <p>Keep these edges in mind:</p>
      <ul>
        <li>
          <strong>The payer knows.</strong> Someone who paid you can see that you received it, because they made the payment. If you
          give the same address to many people, each of them knows only their own payments, but they can compare notes off chain.
        </li>
        <li>
          <strong>Posting next to your name links you to the address.</strong> It does not reveal your balance, but it does tell the world
          that this address, and anyone who pays it, is connected to you.
        </li>
        <li>
          <strong>Sharing your view key shares your history.</strong> The view key can recognise incoming payments, so give it only to
          someone you trust.
        </li>
      </ul>
      <p>
        If you want to run a shop, collect from several clients, or separate savings from spending, the better tool is a subaddress.
        That is the next section.
      </p>

      <h2 id="subaddresses">Stealth addresses vs subaddresses</h2>
      <p>
        These are easy to confuse, because both involve &quot;extra addresses.&quot; They solve different problems and operate at
        different layers.
      </p>
      <table>
        <thead><tr><th></th><th>Stealth address</th><th>Subaddress</th></tr></thead>
        <tbody>
          <tr><td>Who creates it</td><td>The sender, per payment</td><td>You, from your wallet</td></tr>
          <tr><td>Purpose</td><td>Hide where money arrived on chain</td><td>Tell payments and payers apart</td></tr>
          <tr><td>Is it shared?</td><td>No. It only exists on the chain</td><td>Yes. You hand it out</td></tr>
          <tr><td>How many</td><td>One per output</td><td>As many as you want</td></tr>
          <tr><td>Optional?</td><td>No, always on</td><td>Yes</td></tr>
        </tbody>
      </table>
      <p>
        Both work together. When someone pays one of your subaddresses, their wallet still creates a one-time stealth address for
        that payment. Read <Link href="/monero-subaddress">what a Monero subaddress is</Link> to see when it is worth making
        extra ones.
      </p>

      <h2 id="limits">What stealth addresses do not hide</h2>
      <p>
        Stealth addresses protect the receiver&apos;s identity on the chain. They are one layer of three, plus separate considerations
        about the network. Here is what they do not cover:
      </p>
      <ul>
        <li>The sender, who is hidden by rings, not by stealth addresses.</li>
        <li>The amount, which is hidden by RingCT.</li>
        <li>What the node you connect to can see about your wallet&apos;s activity, such as your internet address and when you connect.</li>
        <li>What an exchange knows. If you withdrew to your address from a service that checked your ID, the service knows you received that withdrawal.</li>
      </ul>
      <Callout title="Privacy is a stack">
        No single feature makes Monero private. Stealth addresses, rings, and hidden amounts each close a gap, and your habits close
        the rest. <Link href="/is-monero-traceable">Is Monero traceable</Link> gives the honest version of where the gaps are.
      </Callout>

      <h2 id="wallet">What you do in practice</h2>
      <p>
        Nothing, which is the point. There is no &quot;create stealth address&quot; button, because every Monero payment already uses
        one. Copy your address from your wallet, share it, and let senders&apos; wallets handle the rest. The{" "}
        <Link href="/tools/monero-address-validator">address validator</Link> can check that an address is well formed before you send
        to it.
      </p>
      <p>
        Ready to try it? <Link href={walletUrl}>Open a MonkStash wallet</Link> to see your address and receive a small test payment, or
        read <Link href="/receive-monero">how to receive Monero</Link> for the step-by-step version. For the full picture,
        the Monero project&apos;s own{" "}
        <a href="https://web.getmonero.org/resources/moneropedia/stealthaddress.html" rel="noopener">Moneropedia entry</a> is a good
        companion.
      </p>
    </>
  );
}
