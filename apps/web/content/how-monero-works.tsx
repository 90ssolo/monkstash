import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { IlloRing, IlloStealth } from "@/components/art/Illustrations";

export const meta: ArticleMeta = {
  slug: "how-monero-works",
  section: "learn",
  kicker: "How it works",
  title: "How Does Monero Work? The Privacy Explained Simply",
  seoTitle: "How Does Monero Work? Privacy Explained Simply",
  summary: "How does Monero work? Ring signatures, stealth addresses, and hidden amounts hide who paid whom, explained in plain English with no heavy math.",
  keyword: "how does monero work",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "big-picture", label: "The big picture" },
    { id: "blockchain", label: "A shared record that hides details" },
    { id: "keys", label: "Keys and addresses" },
    { id: "sender", label: "Hiding the sender" },
    { id: "receiver", label: "Hiding the receiver" },
    { id: "amount", label: "Hiding the amount" },
    { id: "double-spend", label: "How double spending is stopped" },
    { id: "send-flow", label: "What happens when you send XMR" },
    { id: "nodes", label: "Nodes and wallets" },
    { id: "mining", label: "Where new Monero comes from" },
    { id: "limits", label: "What the design does not cover" },
  ],
  related: ["what-is-monero", "is-monero-traceable", "monero-vs-bitcoin", "monero-ring-signatures"],
  faq: [
    { q: "How does Monero keep transactions private?", a: "It uses three tools together. Ring signatures hide the sender among decoys, stealth addresses hide the receiver with one-time addresses, and RingCT hides the amount while still proving the math adds up." },
    { q: "Does Monero have a public ledger?", a: "Yes. Monero has a public blockchain that anyone can download and check. The difference from Bitcoin is that the entries are hidden. You can see that transactions happened, but not who was involved or how much moved." },
    { q: "Is Monero a blockchain?", a: "Yes. Monero is its own blockchain and cryptocurrency, not a token built on another network. It uses proof of work, like Bitcoin, but with privacy built into every transaction." },
    { q: "What is a ring signature?", a: "A ring signature is a way to sign a payment so that it could have come from any member of a group. Monero mixes your real coin with decoys from the blockchain, so outsiders cannot tell which one was spent." },
    { q: "What is a stealth address?", a: "A stealth address is a one-time address created for a single payment. It means your public Monero address is never shown on the blockchain, and different payments to you cannot be linked together." },
    { q: "How does Monero stop double spending without showing who paid?", a: "Each coin that is spent produces a unique hidden marker called a key image. The network rejects any transaction that repeats a key image, so a coin can only be spent once, without revealing which coin it was." },
    { q: "Who creates new Monero?", a: "Miners do. They compete to add new blocks to the blockchain and earn newly created XMR as a reward, plus transaction fees." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        How does Monero work? Most cryptocurrencies work like a glass ledger. Every payment is written down in public, so anyone can trace where money
        came from and where it went. <mark>Monero keeps the ledger but frosts the glass</mark>. The network can still check that everything is
        valid, while outsiders cannot read the private details. This guide explains how that works, step by step, without heavy
        math.
      </p>

      <Takeaways items={[
        "Monero has a public blockchain, but the entries are hidden by default.",
        "Ring signatures hide the sender, stealth addresses hide the receiver, and RingCT hides the amount.",
        "Hidden markers called key images stop anyone spending the same coin twice.",
        "New Monero is created by mining, on ordinary computer processors.",
      ]} />

      <h2 id="big-picture">The big picture</h2>
      <p>
        Every digital money system must answer one question: how do we know a payment is real, and that the same money was not
        spent twice? Banks answer it with a private database. Bitcoin answers it with a public blockchain that everyone can read.
        Monero also uses a blockchain, but adds cryptography so the answer can be <mark>checked without exposing who paid whom</mark> or how
        much.
      </p>
      <p>
        If you are brand new to the topic, start with <Link href="/what-is-monero">what Monero is</Link>, then come back
        here for the mechanics.
      </p>

      <h2 id="blockchain">A shared record that hides details</h2>
      <p>
        A blockchain is a shared record kept by thousands of computers. New payments are grouped into blocks, and each block links
        to the one before it, forming a chain. Because many computers keep a copy, no single company can change the past.
      </p>
      <p>
        On Bitcoin, each entry shows an address, an amount, and where the money went next. On Monero, each entry still exists and
        can be verified, but <mark>the sender, receiver, and amount are hidden</mark>. The project explains many of these terms in its{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/" rel="noopener">Moneropedia</a>. Because this hiding is on for every
        payment, not opt-in, it works differently from <Link href="/monero-vs-zcash">Zcash&apos;s optional shielded payments</Link>.
      </p>

      <h2 id="keys">Keys and addresses</h2>
      <p>
        When you create a wallet, it makes a set of secret keys. You never see most of this, but it helps to know the pieces:
      </p>
      <ul>
        <li><strong>The spend key</strong> is the master key that lets you move money. Keep it secret.</li>
        <li><strong>The <Link href="/monero-view-key">view key</Link></strong> lets a wallet see incoming payments but not spend them. This is how a watch-only wallet works.</li>
        <li><strong>Your address</strong> is a long public string you share so people can pay you. A standard Monero address is 95 characters long.</li>
        <li><strong>Your recovery words</strong> (also called a seed phrase) are a human-friendly copy of your keys. A standard Monero wallet uses 25 words.</li>
      </ul>
      <p>
        If you want the practical side, see <Link href="/create-monero-wallet">how to create a Monero wallet</Link>.
      </p>

      <h2 id="sender">Hiding the sender: ring signatures</h2>
      <p>
        When you spend Monero, your wallet does not point to your coin alone. It builds a group, called a ring, made of your real
        coin and <mark>several decoys picked from past transactions</mark> on the blockchain. Your payment is signed in a way that proves one
        member of the ring approved it, without showing which one. That is what a <Link href="/monero-ring-signatures">ring signature</Link> does.
      </p>
      <p>
        An everyday comparison: imagine a signed note from a group of people where nobody can tell which person actually signed
        it. The network can confirm the signature is valid, but it cannot point to the real signer.
      </p>
      <p>
        Rings are not the last word. A planned upgrade called FCMP++ would replace them with a proof that your coin is one of
        every eligible output on the chain. It was still in testing in October 2026; our guide to{" "}
        <Link href="/monero-fcmp">FCMP++ and what it changes</Link> follows its progress.
      </p>
      <Figure caption="Ring signatures: your real payment is hidden among decoys. Outsiders cannot tell which member is real.">
        <IlloRing />
      </Figure>

      <h2 id="receiver">Hiding the receiver: stealth addresses</h2>
      <p>
        The address you share is never the address that appears on the blockchain. When someone pays you, their wallet combines
        your public address with fresh randomness to create a new <Link href="/monero-stealth-address">one-time address</Link>, used for that single payment only. The money
        is sent there.
      </p>
      <p>
        <mark>Only your wallet can tell which one-time addresses belong to you</mark>, using your private view key. To everyone else, the
        payments look like they go to unrelated, random addresses. So you can post one address publicly without letting people
        link your payments together.
      </p>
      <Figure caption="Stealth addresses: you share one address, but each payment lands on a different one-time address.">
        <IlloStealth />
      </Figure>
      <Callout title="Subaddresses add a second layer">
        Your wallet can also make many subaddresses, each pointing back to the same wallet. Giving each person or purpose their own
        subaddress helps keep your payments organized and unlinked.
      </Callout>

      <h2 id="amount">Hiding the amount: RingCT</h2>
      <p>
        The last piece hides how much is being sent. Ring Confidential Transactions, or RingCT, became required for all Monero
        transactions in 2017. Amounts are wrapped in a cryptographic seal that the network can check without opening it.
      </p>
      <p>
        The network only needs to be sure of one thing: the amount coming in <mark>equals the amount going out</mark>, plus the fee. RingCT
        proves this, along with a range proof that shows no amount is negative. The result is that nobody can create money out of
        thin air, and nobody can read the amounts.
      </p>

      <h2 id="double-spend">How double spending is stopped</h2>
      <p>
        If the sender is hidden, how does the network stop someone from using the same coin twice? Every real coin that gets
        spent produces <mark>a unique marker called a key image</mark>. It is mathematically tied to the coin but does not reveal which coin it
        came from. The network keeps a list of all key images seen. If a new transaction repeats one, it is rejected.
      </p>
      <p>
        So the network learns that some coin in the ring was spent, and that it can never be spent again, but not which one.
      </p>

      <h2 id="send-flow">What happens when you send XMR</h2>
      <ol>
        <li>You enter the receiver&apos;s address and an amount in your wallet.</li>
        <li>Your wallet creates a one-time address for the receiver and picks decoys to build the ring.</li>
        <li>It hides the amount and signs the transaction with your private keys, on your own device.</li>
        <li>It sends the finished transaction to a Monero node, which shares it with the rest of the network.</li>
        <li>Miners include it in a new block, about every 2 minutes.</li>
        <li>The received coins become spendable after about 10 blocks (roughly 20 minutes).</li>
      </ol>
      <p>
        You never hand over your keys at any step. Learn the practical version in{" "}
        <Link href="/send-monero">how to send Monero</Link>.
      </p>

      <h2 id="nodes">Nodes and wallets</h2>
      <p>
        A node is a computer that stores the blockchain and passes transactions around. A wallet needs a node to find your
        incoming payments and to broadcast the ones you send. You can run your own node or connect to someone else&apos;s, called
        a remote node. A remote node is convenient, but <mark>its operator may see your internet address and when you connect</mark>. Read{" "}
        <Link href="/monero-node">what a Monero node is</Link> and the guide to{" "}
        <Link href="/monero-remote-node">remote nodes</Link> for the trade-offs.
      </p>

      <h2 id="mining">Where new Monero comes from</h2>
      <p>
        New Monero is created through mining. Computers compete to solve a puzzle called RandomX. The winner adds the next block
        and earns a reward of new coins plus the fees from that block. RandomX is designed to work well on ordinary computer
        processors, which keeps mining open to regular people instead of only owners of specialized machines. If you want to try it, there is a <Link href="/mine-monero">step-by-step mining guide</Link>.
      </p>
      <p>
        After the main supply was issued, Monero keeps a small, steady &quot;tail emission&quot; reward. That means miners always
        have a reason to keep securing the network.
      </p>

      <h2 id="limits">What the design does not cover</h2>
      <p>
        The tools above protect what is written on the blockchain. They do not hide everything. Your internet address can be
        seen by the node you connect to, and an exchange that checked your identity knows you withdrew coins. Careless habits,
        like posting your address next to your name, can also link you to payments. These risks are covered honestly in{" "}
        <Link href="/is-monero-traceable">is Monero traceable</Link>.
      </p>
      <p>
        Next steps: if you are ready to try Monero, <Link href="/create-monero-wallet">create a wallet</Link> and start
        with a small amount. For more explainers, browse <Link href="/learn">Learn</Link>.
      </p>
    </>
  );
}
