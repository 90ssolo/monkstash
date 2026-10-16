import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { IlloRing } from "@/components/art/Illustrations";

export const meta: ArticleMeta = {
  slug: "is-monero-traceable",
  section: "learn",
  kicker: "Privacy",
  title: "Is Monero Traceable? What the Research Actually Says",
  seoTitle: "Is Monero Traceable? What the Research Says",
  summary: "Is Monero traceable? It is built to be hard to trace, but it is not magic. See what blockchain analysis can and cannot do, and how to stay private.",
  keyword: "is monero traceable",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "answer", label: "The honest answer" },
    { id: "onchain", label: "What is hidden on the blockchain" },
    { id: "compare", label: "Bitcoin vs Monero tracing" },
    { id: "history", label: "Where Monero was weaker" },
    { id: "claims", label: "Claims about tracing tools" },
    { id: "metadata", label: "The real leak: metadata" },
    { id: "mistakes", label: "Mistakes that expose you" },
    { id: "protect", label: "How to stay private in practice" },
    { id: "limits", label: "What privacy cannot do" },
    { id: "next", label: "What to do next" },
  ],
  related: ["what-is-monero", "how-monero-works", "monero-vs-bitcoin", "monero-vs-zcash"],
  faq: [
    { q: "Is Monero traceable?", a: "Monero is designed to be far harder to trace than Bitcoin. Sender, receiver, and amount are hidden by default. Research shows older transactions and some wallet mistakes were weaker, but practical risks today mostly come from details outside the blockchain, like your internet address or exchange records." },
    { q: "Can the police or the government trace Monero?", a: "Companies and agencies have claimed to have Monero tracing tools, but the details are rarely public and the claims are hard to verify. Independent research suggests current on-chain tracing is limited. Investigations more often rely on exchange records, internet addresses, and user mistakes than on breaking the cryptography." },
    { q: "Is Monero 100% anonymous?", a: "No system is 100% anonymous. Monero hides on-chain details very well, but your IP address, exchange records, and reused or published addresses can still link activity to you if you are careless." },
    { q: "Is Monero more private than Bitcoin?", a: "Yes. Bitcoin shows senders, receivers, and amounts on a public ledger. Monero hides all three by default. Bitcoin privacy tools exist but are optional and add effort." },
    { q: "Can you trace a Monero transaction on a block explorer?", a: "A block explorer shows that a transaction happened, its fee, and the time. It does not show who sent it, who received it, or how much was sent, unless the parties choose to share proof." },
    { q: "Do exchanges know who I am if I buy Monero?", a: "If an exchange verifies your identity, it knows a real person made that purchase and withdrawal. It generally cannot follow the coins on-chain afterward, but its records are still a link between you and the withdrawal." },
    { q: "How can I make Monero harder to trace?", a: "Use a wallet that keeps your keys on your device, connect through Tor or your own node, use a fresh subaddress for each sender, avoid posting addresses next to your name, and keep your wallet software up to date." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        &quot;Is Monero traceable?&quot; is one of the most searched questions about the coin, and it deserves a careful answer
        rather than a slogan. The short version: <mark>Monero is far harder to trace than Bitcoin</mark>, its privacy holds up well on the
        blockchain itself, and the realistic risks are mostly details around the blockchain and human mistakes. This guide covers
        what is hidden, where Monero was weaker in the past, and what you can do to protect yourself.
      </p>

      <Takeaways items={[
        "On the blockchain, Monero hides sender, receiver, and amount by default.",
        "Older transactions were weaker, and some tracing research applied mainly to those.",
        "The biggest real-world risks are metadata, like your internet address, and user mistakes.",
        "Tor or your own node, fresh subaddresses, and careful habits close most practical gaps.",
      ]} />

      <h2 id="answer">The honest answer</h2>
      <p>
        Monero is built to resist tracing, and it does this well, but <mark>no one can promise perfect anonymity</mark>. Think of it as
        &quot;very hard to trace on-chain&quot; rather than &quot;impossible to link to you.&quot; The blockchain itself reveals
        very little. What can reveal more is everything else: where you bought the coins, how you connect to the network, and what
        you publish yourself.
      </p>
      <p>
        If you are new to the basics, see <Link href="/what-is-monero">what Monero is</Link> first.
      </p>

      <h2 id="onchain">What is hidden on the blockchain</h2>
      <p>Three tools work together on every current Monero transaction:</p>
      <ul>
        <li><strong><Link href="/monero-ring-signatures">Ring signatures</Link></strong> mix your real coin with decoys, so the sender is not obvious.</li>
        <li><strong>Stealth addresses</strong> send each payment to a one-time address, so the receiver cannot be linked.</li>
        <li><strong>RingCT</strong> hides the amount.</li>
      </ul>
      <Figure caption="Ring signatures: the real payment is mixed with decoys, so analysts cannot be sure which one it is.">
        <IlloRing />
      </Figure>
      <p>
        On a Monero <Link href="/monero-transaction-lookup">block explorer</Link>, a transaction shows its hash, fee, and time. It does not show who paid, who received, or how
        much. For a deeper walk-through, read <Link href="/how-monero-works">how Monero works</Link>. If you are comparing privacy coins, see <Link href="/monero-vs-zcash">Monero vs Zcash</Link>.
      </p>

      <h2 id="compare">Bitcoin vs Monero tracing</h2>
      <p>
        Comparing the two makes the difference clear. <mark>Bitcoin is not anonymous, but pseudonymous</mark>: your name is not on the chain,
        yet every address history is public and can be linked to you through exchanges or spending patterns.
      </p>
      <table>
        <thead><tr><th>What an observer sees</th><th>Bitcoin</th><th>Monero</th></tr></thead>
        <tbody>
          <tr><td>Sender</td><td>Visible address</td><td>Hidden among decoys</td></tr>
          <tr><td>Receiver</td><td>Visible address</td><td>Hidden by one-time address</td></tr>
          <tr><td>Amount</td><td>Visible</td><td>Hidden</td></tr>
          <tr><td>Address history</td><td>Fully public</td><td>Not visible</td></tr>
          <tr><td>Privacy effort</td><td>Extra tools, optional</td><td>Built in, no effort</td></tr>
        </tbody>
      </table>
      <p>
        More detail is in <Link href="/monero-vs-bitcoin">Monero vs Bitcoin</Link>.
      </p>

      <h2 id="history">Where Monero was weaker</h2>
      <p>
        Monero was not always this strong. In its early years, <mark>adding decoys was optional</mark>, so some transactions had none and the
        real input was exposed. Two changes helped: RingCT hid amounts and became mandatory in 2017, and the network enforced a
        minimum number of decoys for every transaction. Later upgrades have continued to raise the protection, and the next
        planned one goes further: <Link href="/monero-fcmp">FCMP++</Link> would replace the 16-member rings with a proof over
        every eligible output on the chain, which removes decoy guessing altogether.
      </p>
      <p>
        Academic studies that managed to link some Monero activity <mark>mostly looked at those older transactions</mark> or at specific
        software bugs and unusual behaviors, not the protocol as it works today. The project&apos;s research community
        also publishes its own work, which you can find through the{" "}
        <a href="https://www.getmonero.org/resources/research-lab/" rel="noopener">Monero Research Lab</a>.
      </p>

      <h2 id="claims">Claims about tracing tools</h2>
      <p>
        Every so often a company says it can trace Monero, or a headline says Monero is broken. Both deserve caution. Private
        vendors <mark>rarely publish how their tools work</mark>, so their claims are hard to check. At the same time, no honest person can
        promise that no weakness will ever be found.
      </p>
      <Callout kind="warn" title="Be skeptical of absolute claims">
        Statements that Monero is either perfectly untraceable or fully broken <mark>are both overstated</mark>. The honest picture: real
        weaknesses have been found in the past, many have been fixed, and current on-chain tracing appears limited. Watch for
        updates, and avoid relying on privacy for anything you could not defend legally and safely.
      </Callout>

      <h2 id="metadata">The real leak: metadata</h2>
      <p>
        Metadata means information around a transaction rather than inside it. <mark>This is where privacy usually fails in practice</mark>:
      </p>
      <ul>
        <li><strong>Your internet address (IP).</strong> When your wallet connects to a node, that node can see your address and which transactions you broadcast. <mark>A public remote node operator could log this</mark>.</li>
        <li><strong>The exchange you used.</strong> If you verified your identity to buy XMR, the exchange knows a real name is tied to that withdrawal, even if it cannot follow the coins afterward.</li>
        <li><strong>Timing and behavior.</strong> Patterns in when and how you transact can be compared with other information to guess who you are.</li>
      </ul>
      <p>
        Which node you use matters. Read <Link href="/monero-node">what a Monero node is</Link> and{" "}
        <Link href="/monero-remote-node">how remote nodes work</Link> to see exactly what a node can learn.
      </p>

      <h2 id="mistakes">Mistakes that expose you</h2>
      <ul>
        <li>Posting the same address publicly, next to your name or username, instead of a <Link href="/monero-subaddress">fresh subaddress</Link> for each sender.</li>
        <li>Connecting only to one public node over a normal connection that logs your internet address.</li>
        <li>Moving coins straight from an identity-checked exchange to an address you also use publicly.</li>
        <li>Sharing transaction proofs or view keys carelessly. These can reveal activity you meant to keep private.</li>
        <li>Using an unofficial or fake wallet that leaks your keys. Always check the address bar.</li>
      </ul>

      <h2 id="protect">How to stay private in practice</h2>
      <p>These habits close most of the practical gaps:</p>
      <ol>
        <li><strong>Use a non-custodial wallet.</strong> Your keys stay on your device, not with a company.</li>
        <li><strong>Protect your connection.</strong> Run your own node, or route traffic over Tor.</li>
        <li><strong>Use a fresh subaddress</strong> for each person or purpose.</li>
        <li><strong>Think about where your coins came from</strong> and where they go next.</li>
        <li><strong>Keep software updated,</strong> because privacy fixes arrive in updates.</li>
      </ol>

      <h2 id="limits">What privacy cannot do</h2>
      <p>
        Privacy on the blockchain does not protect you from someone looking over your shoulder, malware on your device, or
        someone who simply asks you where the money went. It also does not change the law where you live. Using private money is
        legal in most places, but you should understand your local rules. This is general information, not legal advice. See{" "}
        <Link href="/is-monero-legal">is Monero legal</Link> and <Link href="/is-monero-safe">is Monero safe</Link>.
      </p>

      <h2 id="next">What to do next</h2>
      <p>
        If you want to put this into practice, <Link href="/create-monero-wallet">create a wallet</Link> that keeps your
        keys on your own device, back up your recovery words, and try a small payment first. Common questions are answered on the{" "}
        <Link href="/faq">FAQ page</Link>.
      </p>
    </>
  );
}
