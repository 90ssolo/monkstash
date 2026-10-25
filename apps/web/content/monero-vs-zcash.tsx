import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { DefaultVsOptionalFigure, HowTheyHideFigure } from "@/components/art/MoneroVsZcashArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-vs-zcash",
  section: "learn",
  kicker: "Privacy coins compared",
  title: "Monero vs Zcash: Privacy, Technology and Trade-offs",
  seoTitle: "Monero vs Zcash: Privacy, Tech and Trade-offs",
  summary: "Monero vs Zcash compared fairly: default vs optional privacy, ring signatures vs zk-SNARKs, supply, mining, wallets and exchanges, with sources.",
  keyword: "monero vs zcash",
  updated: "2026-10-15",
  readingMinutes: 11,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "default", label: "Default vs optional privacy" },
    { id: "crypto", label: "How each one hides a payment" },
    { id: "trust", label: "Trusted setup and bugs" },
    { id: "supply", label: "Supply and emission" },
    { id: "mining", label: "Mining" },
    { id: "access", label: "Wallets and exchanges" },
    { id: "table", label: "Side by side" },
    { id: "choose", label: "Which one fits you" },
  ],
  related: ["is-monero-traceable", "monero-vs-bitcoin", "monero-ring-signatures", "monero-stealth-address", "monero-eu-2027", "is-monero-legal"],
  faq: [
    { q: "Which is more private, Monero or Zcash?", a: "It depends on how Zcash is used. A fully shielded Zcash transaction hides sender, receiver and amount using zero-knowledge proofs. Monero hides all three on every transaction by default, so there is no choice to get wrong. In practice, Monero's strength is that everyone is in the same crowd, and Zcash's strength is a strong proof system when people actually use shielded addresses." },
    { q: "Is Zcash private by default?", a: "No. Zcash has both transparent addresses, which work like Bitcoin and are public, and shielded addresses, which are private. Whether a given payment is private depends on which type of address each side uses." },
    { q: "What is the difference between shielded and transparent Zcash?", a: "Transparent addresses and the amounts sent to and from them are publicly visible. Shielded addresses use zero-knowledge proofs, so the transaction data is encrypted but the network can still verify it. Fees are visible either way, according to Zcash's own documentation." },
    { q: "Does Zcash have a trusted setup?", a: "Older Zcash shielded pools (Sprout and Sapling) relied on trusted setup ceremonies. The Orchard pool, introduced with the NU5 upgrade, uses the Halo proving system and removed that need, according to the Zcash project. Monero's cryptography does not use a trusted setup." },
    { q: "Which has a fixed supply?", a: "Zcash has a fixed maximum supply of 21 million ZEC, with block rewards that halve over time. Monero has no maximum supply: after its main emission ended, it pays a permanent tail emission of 0.6 XMR or less per block." },
    { q: "Can I mine Monero and Zcash at home?", a: "Monero's RandomX algorithm is designed for ordinary CPUs, so home mining is possible, though not always profitable. Zcash uses proof-of-work with the Equihash algorithm, which is generally mined with specialised hardware." },
    { q: "Is Monero or Zcash easier to buy?", a: "It changes over time and by country. Some regulated exchanges have removed privacy coins and others still list them. Check the current coin list of any exchange you plan to use, and read our note on legal status." },
    { q: "Can one wallet hold both?", a: "Generally not. They are separate networks with different address formats and wallet software. Some multi-coin wallets support both, but you hold each coin separately, and a Monero address will not work for Zcash." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <strong>Monero vs Zcash</strong> <mark>comes down to one design choice</mark>. Monero hides the sender, receiver and amount of every
        transaction by default. Zcash offers strong zero-knowledge privacy too, but only when you use its shielded addresses; its
        transparent addresses are public, like Bitcoin. Both are real privacy coins with serious engineering behind them. This
        guide compares them fairly, including where Zcash is ahead and where it costs you something.
      </p>

      <Takeaways items={[
        "Monero is private on every transaction. Zcash is private only when both sides use shielded addresses.",
        "Monero hides payments inside a crowd of decoys. Zcash proves a payment is valid without revealing it, using zero-knowledge proofs.",
        "Zcash has a fixed 21 million supply. Monero has a small permanent tail emission instead.",
        "Monero is mined on ordinary CPUs. Zcash mining is proof-of-work and generally uses specialised machines.",
        "Neither is risk-free. Both have had to fix serious problems, and both have trade-offs you should know.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        If you want privacy without having to think about it, Monero is built for that: <mark>there is no transparent mode to fall back</mark>
        into by accident. If you value a mathematically elegant proof system and the option to move between public and private
        funds, Zcash is built for that. Neither is a strict upgrade over the other. They answer the same question in different ways.
      </p>
      <p>
        This is a technical comparison, not financial advice, and we make no prediction about either coin&apos;s price. We build
        a <Link href={walletUrl}>Monero wallet</Link>, so we have an obvious interest. We have tried to be accurate about Zcash
        and to cite its own project pages where we can.
      </p>

      <h2 id="default">Default vs optional privacy</h2>
      <p>
        This is the biggest practical difference. <mark>On Monero, privacy is the only mode</mark>. Every transaction uses the same privacy
        tools, so there are no transparent transactions to stand out from.
      </p>
      <p>
        Zcash has two kinds of address. Zcash&apos;s own documentation says transparent addresses &quot;work similarly to Bitcoin
        addresses and do not offer privacy,&quot; while shielded addresses use zero-knowledge proofs so the data is encrypted yet
        still verifiable by the network. Transaction fees are visible either way.
      </p>
      <Figure caption="On Monero every row is hidden the same way. On Zcash, a mix of public and shielded rows lets an observer focus on the visible ones.">
        <DefaultVsOptionalFigure />
      </Figure>
      <p>
        Why does that matter? Privacy systems work best when many people use them. On Zcash, a payment that goes from a
        transparent address into the shielded pool, or back out, <mark>leaks information at the edges</mark>, such as the amount and timing.
        Keeping everything shielded avoids that, but it relies on your wallet, your exchange and the person you pay all supporting
        shielded addresses.
      </p>
      <h3>How much of Zcash is shielded?</h3>
      <p>
        Usage has grown. <a href="https://www.theblock.co/amp/post/383546/zcashs-shielded-supply-holds-firm-at-23-privacy-adoption-sticky" rel="noopener">The Block reported</a>{" "}
        on 26 December 2025 that about 23% of Zcash&apos;s supply sat in shielded addresses, up from roughly 8% at the start of 2025.
        That figure measures coins held, not the share of transactions, and trackers use different methods, so treat it as a
        rough guide. <mark>On Monero the equivalent number is simply 100%</mark>, because there is no other kind.
      </p>
      <KeyFact label="Why it matters">
        A private payment is only as private as the crowd around it. On Monero the crowd is everyone. On Zcash the crowd is
        whoever chose a shielded address.
      </KeyFact>

      <h2 id="crypto">How each one hides a payment</h2>
      <p>
        The two coins use different cryptography to reach a similar goal. Here it is in plain words.
      </p>
      <h3>Monero: hide in a crowd</h3>
      <p>
        Monero combines three tools. <Link href="/monero-ring-signatures">Ring signatures</Link> mix your real input with
        decoys from the blockchain, so, as the Monero project puts it, no outside observer can tell which of the possible signers
        is the real one. <Link href="/monero-stealth-address">Stealth addresses</Link> give the receiver a fresh one-time
        address for each payment. RingCT hides the amount. The coin&apos;s{" "}
        <Link href="/is-monero-traceable">traceability story</Link> is built on all three working together.
      </p>
      <h3>Zcash: prove it without showing it</h3>
      <p>
        A shielded Zcash transaction keeps its details private and attaches a zero-knowledge proof (a zk-SNARK). Nodes check the
        proof and learn that the transaction follows the rules, such as no coins created from nothing, without learning who paid
        whom or how much. It is a different philosophy: instead of blending into a crowd, <mark>the details are never published at all</mark>.
      </p>
      <Figure caption="Monero blends the real payment into a ring of decoys. Zcash keeps the details private and publishes a proof that they are valid.">
        <HowTheyHideFigure />
      </Figure>
      <p>
        Each approach has trade-offs. Zcash&apos;s proofs hide more data in principle, but the system is more complex, and generating
        proofs can take more computing work. Monero&apos;s approach has been simpler to reason about, but relies on the
        crowd being large and on careful wallet behaviour, and its transactions are larger than a basic Bitcoin transaction. A
        Monero upgrade called FCMP++ is planned to enlarge the anonymity crowd; check the Monero project for its current status.
      </p>

      <h2 id="trust">Trusted setup and bugs</h2>
      <p>
        You will see two worries in this debate: the trusted setup, and the bugs that any privacy system can have.
      </p>
      <h3>The trusted setup, and what changed</h3>
      <p>
        Early Zcash shielded pools needed a one-time setup ceremony to generate public parameters. If the secret material from
        such a ceremony were ever kept, someone could in theory forge proofs. The Zcash project&apos;s{" "}
        <a href="https://z.cash/upgrade/nu5/" rel="noopener">NU5 upgrade page</a> says the move to the Halo proving system
        removes the need for the trusted setup, and the Orchard shielded pool was added in that upgrade. So the old criticism no
        longer applies to Orchard. The older Sprout and Sapling pools were created under the earlier ceremonies. <mark>Monero does not use a trusted setup at all</mark>.
      </p>
      <h3>Bugs happen on both sides</h3>
      <p>
        Complex cryptography is hard to get right. In 2026, Zcash had a notable example. Researcher Taylor Hornby found a flaw in
        the Orchard circuit on 29 May 2026 that could have allowed counterfeit coins to be created undetectably. The authors of
        the <a href="https://forum.zcashcommunity.com/t/the-orchard-counterfeiting-vulnerability-and-next-steps/56015" rel="noopener">disclosure post</a>{" "}
        said exploitation seemed unlikely, but also that privacy means no one can cryptographically prove it never happened.
        A fix shipped within days, and the <a href="https://z.cash/upgrade/nu6-3/" rel="noopener">NU6.3 &quot;Ironwood&quot; upgrade</a>,
        activated on 28 July 2026, added a new shielded pool and restricted the original Orchard pool, so supply can be checked
        going forward.
      </p>
      <p>
        We do not mention this to score a point. The response shows a mature, open process. But it also shows the particular
        risk of shielded systems: when the amounts are hidden, <mark>an inflation bug is harder to detect</mark>. Monero has had its own
        bugs and fixes over the years, and its hidden amounts carry the same theoretical concern. It is a trade-off of the whole
        category, so favour projects that publish audits and respond openly.
      </p>
      <Callout title="Check the date on anything you read about Zcash">
        The Zcash shielded pools changed in 2026. Guides written before mid-2026 may describe Orchard as the main pool. Look at
        the project&apos;s current upgrade pages for the latest.
      </Callout>

      <h2 id="supply">Supply and emission</h2>
      <p>
        Zcash has a hard cap. Its FAQ says that, just like Bitcoin, it has a fixed supply of 21 million coins. Block rewards
        shrink over time until the cap is reached.
      </p>
      <p>
        Monero has no hard cap. After its main emission curve ended in 2022, it pays a permanent{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/tail-emission.html" rel="noopener">tail emission</a> of 0.6
        XMR or less per block. The project&apos;s reasoning is that miners need a steady reward to keep securing the network
        even once fees are small. The result is very mild inflation that falls as a percentage over time, rather than a fixed
        ceiling. Which you prefer is a values question about sound money versus long-term security funding. Both are
        defensible.
      </p>

      <h2 id="mining">Mining</h2>
      <p>
        Both are proof-of-work coins, but they take different stances on hardware. Monero uses{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/randomx.html" rel="noopener">RandomX</a>, adopted in release
        0.15 and designed so that ordinary CPUs are competitive and specialised ASIC machines are less useful. Zcash uses the
        Equihash proof-of-work algorithm, and in practice it is mined with dedicated hardware. If you want to try mining either
        one, see our guide to <Link href="/mine-monero">how to mine Monero</Link>, or <Link href="/monero-p2pool">how P2Pool works</Link> for Monero.
      </p>

      <h2 id="access">Wallets and exchanges</h2>
      <p>
        On wallets, the main thing to check is that you are using shielded addresses on Zcash. The Zcash project&apos;s own
        advice is to use a wallet that is shielded by default. On Monero there is nothing to check, because every wallet is
        private by design. Our <Link href="/monero-wallets">Monero wallet comparison</Link> covers the options.
      </p>
      <p>
        On exchanges, both coins have faced pressure. Some regulated exchanges have dropped privacy coins, and listings change
        over time and vary by country, so we do not list venues here. Check the current list of any exchange you plan to use.
        See <Link href="/is-monero-legal">is Monero legal</Link> for the wider picture and{" "}
        <Link href="/buy-monero">how to buy Monero</Link> for practical options.
      </p>

      <h2 id="table">Side by side</h2>
      <table>
        <thead><tr><th>Feature</th><th>Monero (XMR)</th><th>Zcash (ZEC)</th></tr></thead>
        <tbody>
          <tr><td>Privacy</td><td>On for every transaction</td><td>Optional: transparent or shielded</td></tr>
          <tr><td>Hiding method</td><td>Ring signatures, stealth addresses, RingCT</td><td>Zero-knowledge proofs (zk-SNARKs)</td></tr>
          <tr><td>Trusted setup</td><td>None</td><td>Older pools yes. Orchard (Halo) removed it</td></tr>
          <tr><td>Maximum supply</td><td>None, tail emission of 0.6 XMR or less per block</td><td>21 million ZEC</td></tr>
          <tr><td>Mining</td><td>RandomX, CPU friendly</td><td>Equihash, specialised hardware</td></tr>
          <tr><td>Fees visible</td><td>Yes</td><td>Yes</td></tr>
          <tr><td>Risk if you slip</td><td>Little, privacy is automatic</td><td>Using a transparent address makes that payment public</td></tr>
        </tbody>
      </table>

      <h2 id="choose">Which one fits you</h2>
      <ul>
        <li><strong>You want privacy to be automatic.</strong> Monero. There is no mode to get wrong, and it takes no extra steps.</li>
        <li><strong>You want a fixed supply and the option to move between public and private.</strong> Zcash fits better.</li>
        <li><strong>You value a proof system with no trusted setup.</strong> Both qualify now: Monero never had one, and Zcash&apos;s Orchard removed it.</li>
        <li><strong>You will pay businesses and friends who only support one coin.</strong> Use whichever they support.</li>
      </ul>
      <p>
        If Monero is your choice, read <Link href="/what-is-monero">what Monero is</Link>, then{" "}
        <Link href="/create-monero-wallet">create a wallet</Link> or try the{" "}
        <Link href={walletUrl}>MonkStash web wallet</Link> (an early preview, not yet independently audited, so start small). For a
        comparison with the other big coin, see <Link href="/monero-vs-bitcoin">Monero vs Bitcoin</Link>.
      </p>
    </>
  );
}
