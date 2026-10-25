import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { ChainWideArt, KeyImageArt, RingOfSixteenArt } from "@/components/art/MoneroRingSignaturesArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-ring-signatures",
  section: "learn",
  kicker: "Privacy deep dive",
  title: "Monero Ring Signatures Explained: Ring Size, Decoys and FCMP++",
  seoTitle: "Monero Ring Signatures Explained: Decoys, FCMP++",
  summary: "Monero ring signatures hide the real sender among 15 decoys, a ring size of 16. See how decoys are picked, what key images do, and what FCMP++ changes.",
  keyword: "monero ring signatures",
  updated: "2026-10-15",
  readingMinutes: 11,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "analogy", label: "An analogy: the signed petition" },
    { id: "ring-size", label: "Ring size: why 16" },
    { id: "decoys", label: "How decoys are chosen" },
    { id: "key-images", label: "Key images stop double spends" },
    { id: "what-hidden", label: "What a ring does and does not hide" },
    { id: "limits", label: "Known limits and research" },
    { id: "fcmp", label: "FCMP++: the planned replacement" },
    { id: "you", label: "What this means for you" },
  ],
  related: ["monero-fcmp", "how-monero-works", "monero-stealth-address", "is-monero-traceable"],
  faq: [
    { q: "What is a ring signature in Monero?", a: "A ring signature is a digital signature that proves one member of a group approved a payment, without showing which member. In Monero the group is your real coin plus decoy coins taken from the blockchain." },
    { q: "What is the Monero ring size?", a: "The ring size is 16: one real input and 15 decoys, until the FCMP++ upgrade replaces rings. It rose from 11 to 16 in the August 2022 network upgrade, and every transaction must use it so that all transactions look alike." },
    { q: "What are decoys in Monero?", a: "Decoys are real outputs from other people's past transactions that your wallet adds to your ring. They are chosen with a statistical model of how old coins usually are when they get spent, so they look like believable spends." },
    { q: "Can someone tell which ring member is real?", a: "Not from the signature itself. Researchers have shown that statistical guessing can sometimes beat random chance, for example by using the age of outputs, which is why Monero keeps improving decoy selection and plans FCMP++." },
    { q: "What is a key image?", a: "A key image is a unique marker produced when a coin is spent. It is tied to the coin but does not reveal which coin it came from. The network rejects any transaction that repeats a key image, which stops double spending." },
    { q: "What is FCMP++?", a: "FCMP++ stands for Full-Chain Membership Proofs. It is a planned upgrade that would replace rings of 16 with a proof that your coin is one of all eligible outputs on the chain. It was in public beta testing in October 2026 and has no announced mainnet date." },
    { q: "Do I need to change any setting to use ring signatures?", a: "No. The ring size is fixed by the network rules, and your wallet builds the ring for you every time you send. There is nothing to configure." },
    { q: "Does a bigger ring always mean more privacy?", a: "Not by itself. A larger ring helps, but privacy also depends on how realistic the decoys are. Poorly chosen decoys can be ruled out by an analyst, which makes a ring effectively smaller than it looks." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        Monero ring signatures are how the network <mark>hides who sent a payment</mark>. When you spend, your wallet mixes your real coin with 15
        decoys taken from the blockchain, a ring size of 16, and signs the transaction so that anyone can verify that one of the 16
        approved it, but no one can see which. This page goes deeper than our{" "}
        <Link href="/how-monero-works">overview of how Monero works</Link>: how the ring is built, what a key image is, where the
        research says rings fall short, and what the planned FCMP++ upgrade changes.
      </p>

      <Takeaways items={[
        "A ring signature proves one of 16 coins approved a payment without revealing which one.",
        "The ring is your real coin plus 15 decoys, chosen by your wallet from past outputs on the chain.",
        "A key image is a hidden fingerprint of the spent coin. Repeating it gets a transaction rejected, which stops double spends.",
        "Rings are strong but not perfect: researchers have measured statistical weaknesses, and FCMP++ is planned to remove them.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        A <mark>ring signature lets a group sign something together while the signature only proves that one member signed</mark>. The
        Monero project describes it as a signature that could have been produced by any member of a group of keys, where it should
        be computationally infeasible to tell which member did it. Monero builds the group on the fly, with no setup and no
        permission from the other members, using outputs that already sit on the public blockchain.
      </p>
      <p>
        Ring signatures cover one job: hiding the <em>sender</em>. Hiding the receiver is the work of{" "}
        <Link href="/monero-stealth-address">stealth addresses</Link>, and hiding the amount is the work of RingCT. The three
        together make a transaction private. This page stays on the first one.
      </p>

      <h2 id="analogy">An analogy: the signed petition</h2>
      <p>
        Picture a petition signed in a room of 16 people. When it comes out, it carries a stamp that says, truthfully, &quot;one of
        the people in this room signed this.&quot; The stamp cannot be forged by an outsider, and it cannot be traced to a person. Now
        imagine that the other 15 people never knew they were in the room. Their names were borrowed from public records, and they
        did nothing.
      </p>
      <p>
        That is close to what a Monero ring is. The 15 decoys are real coins from other people&apos;s past transactions. They do not
        take part and they lose nothing. Their only job is to be plausible, so that you could be any one of the 16.
      </p>
      <Figure caption="A ring of 16: the sender knows which member is real. Everyone else sees sixteen equally valid possibilities.">
        <RingOfSixteenArt />
      </Figure>

      <h2 id="ring-size">Ring size: why 16</h2>
      <p>
        The ring size is the total number of possible signers in a ring. The current figure is <strong>16</strong>, which means the
        real input plus 15 decoys, and it stays 16 until the FCMP++ upgrade replaces rings. The Monero technical documentation states it as &quot;the ring size is 16 (15 decoys).&quot;
      </p>
      <p>
        The number has grown over time. In the early years, users could pick any ring size, including zero decoys, which made some
        transactions easy to trace and weakened everyone else&apos;s decoys. Monero fixed the ring size at 11 in version 0.13.0 so
        that all transactions would look alike, then <mark>raised it from 11 to 16</mark> in the network upgrade of 13 August 2022.
      </p>
      <KeyFact label="Ring size today">
        16 total signers per input: 1 real, 15 decoys, until the FCMP++ upgrade. The network enforces it, so wallets cannot choose a smaller or larger ring.
      </KeyFact>
      <p>
        Why not make it enormous? Every extra ring member adds data to each transaction, which makes it larger, costs more in fees,
        and takes more work for every node to verify. Rings of a few dozen would be possible, but the privacy gain per extra member
        shrinks while the cost keeps growing. That trade-off is one of the reasons the project is working on a different approach
        (see below).
      </p>

      <h2 id="decoys">How decoys are chosen</h2>
      <p>
        You do not pick your decoys. Your wallet does, using a rule that every Monero wallet shares. Per the Monero project&apos;s
        description, the other ring members are selected from the blockchain with a <strong>gamma distribution</strong>. In plain
        words: a statistical curve that makes the wallet more likely to choose recent outputs and less likely to choose very old
        ones, because that matches how real people tend to spend. Most coins are spent soon after they arrive, so a believable decoy
        is usually a young one.
      </p>
      <p>The goal is that your real coin is indistinguishable from the decoys by age. If your real coin was received an hour ago, the wallet should choose decoys of similar ages, not 16 coins that are years apart.</p>
      <table>
        <thead><tr><th>Question</th><th>Answer</th></tr></thead>
        <tbody>
          <tr><td>Who picks the decoys?</td><td>Your wallet, automatically</td></tr>
          <tr><td>Where do they come from?</td><td>Real outputs already on the blockchain</td></tr>
          <tr><td>Do decoy owners know?</td><td>No, and they lose nothing</td></tr>
          <tr><td>Can I choose them?</td><td>No. Custom choices would make your transactions stand out</td></tr>
          <tr><td>Can the same decoy be reused?</td><td>Yes, any output can appear in many rings</td></tr>
        </tbody>
      </table>

      <h2 id="key-images">Key images stop double spends</h2>
      <p>
        Hiding the sender raises a problem. If nobody knows which coin was spent, what stops you from spending the same coin twice
        in two different rings? The answer is the <strong>key image</strong>.
      </p>
      <p>
        When you spend a coin, your wallet produces a key image: a short value calculated from the coin&apos;s secret key. Three
        properties make it work. It is the same every time for the same coin. It is different for every coin. And it does not reveal
        which coin it came from. Each transaction publishes its key images, and nodes keep the full list of all key images ever used.
        <mark>Any new transaction that repeats a key image</mark> on that list is rejected.
      </p>
      <Figure caption="A key image works like a one-time stamp. The same coin always produces the same stamp, so a second spend is caught without anyone learning which coin it was.">
        <KeyImageArt />
      </Figure>
      <p>
        There is a quiet consequence worth knowing. The network learns that one of the 16 ring members is now spent for good, but not
        which one. Ring members that are decoys are not touched, and their real owners can still spend them.
      </p>

      <h2 id="what-hidden">What a ring does and does not hide</h2>
      <p>A ring hides which input in a transaction was yours. It does not hide everything, and it helps to be exact about the edges.</p>
      <table>
        <thead><tr><th>Hidden by the ring</th><th>Not hidden by the ring</th></tr></thead>
        <tbody>
          <tr><td>Which of the 16 inputs is the real one</td><td>That a transaction happened and when</td></tr>
          <tr><td>Which past output you are spending</td><td>The fee and the rough size of the transaction</td></tr>
          <tr><td>A direct link back to your earlier receipts</td><td>Your internet address, if your node connection is not protected</td></tr>
        </tbody>
      </table>
      <p>
        Amounts are hidden by a different tool, and receivers by another. Network-level exposure, such as what a remote node can see,
        is separate again. We cover that honestly in <Link href="/is-monero-traceable">is Monero traceable</Link>.
      </p>

      <h2 id="limits">Known limits and research</h2>
      <p>
        Ring signatures give <em>plausible deniability</em>, not mathematical certainty. The ring is only as strong as its decoys,
        and researchers have studied where it can weaken. Here is a fair summary of what the public record shows.
      </p>
      <ul>
        <li>
          <strong>Early weaknesses were real and have been fixed.</strong> Before ring size was mandatory, rings with few or zero decoys
          let analysts trace spends and then trace the transactions linked to them. The Monero Research Lab&apos;s{" "}
          <a href="https://www.getmonero.org/resources/research-lab/pubs/MRL-0001.pdf" rel="noopener">MRL-0001</a> studied how such
          chains of deduction can spread. A mandatory ring size is the main fix.
        </li>
        <li>
          <strong>Statistical guessing is possible.</strong> The Monero Research Lab project OSPEAD, led by researcher Rucknium, studied
          the decoy selection rule against real spending. The project&apos;s 2025 write-up states that the current decoy algorithm relies
          on data from Monero&apos;s first three years and has changed little since, and that a &quot;MAP Decoder&quot; attack could give
          an adversary <mark>about a 1 in 4.2 chance of guessing the real spend</mark>, instead of 1 in 16. The same post notes that the attacker
          rarely learns whether a guess was right, which limits real-world impact, and that the risk is higher for users with extreme
          threat models. The work has not yet been formally peer reviewed.
        </li>
        <li>
          <strong>Hostile surroundings matter.</strong> If an adversary controls many outputs that end up as decoys, they can rule those
          out and shrink your effective ring. This is one reason a bigger anonymity pool helps every user.
        </li>
      </ul>
      <Callout title="Read this with the right scale">
        A 1 in 4.2 guess is still a guess, not a proof. No published result shows that Monero rings can be broken wholesale. The honest
        conclusion is that <mark>rings of 16 give strong but imperfect protection</mark>, and the project itself says a better design is needed.
      </Callout>
      <p>
        Behaviour counts too. Spending a coin the moment it arrives, or reusing a pattern that is easy to spot, makes your real
        input easier to guess. <mark>The ring helps most when you act like everyone else</mark>.
      </p>

      <h2 id="fcmp">FCMP++: the planned replacement</h2>
      <p>
        FCMP++ (<strong>Full-Chain Membership Proofs</strong>) would replace rings altogether: instead of proving your coin is one
        of 16 outputs, you prove it is one of <em>all</em> eligible outputs on the chain, without saying which, so there would be no
        decoys left to guess. As of 15 October 2026 it is in public testing on a stressnet whose coins have no value, the
        developers&apos;{" "}
        <a href="https://github.com/seraphis-migration/monero/releases" rel="noopener">latest beta release</a> is from September
        2026, and <mark>no mainnet date has been set</mark>, so rings of 16 still protect every transaction on the main network. Our{" "}
        <Link href="/monero-fcmp">guide to FCMP++ and Carrot</Link> covers what it changes for you and what to do when it
        ships.
      </p>
      <Figure caption="Today your coin hides among 16 outputs. Under full-chain membership proofs, the set of candidates is every eligible output.">
        <ChainWideArt />
      </Figure>

      <h2 id="you">What this means for you</h2>
      <p>You do not need to do anything to benefit from ring signatures. A few habits help them do their job:</p>
      <ul>
        <li>Use a current wallet, so it follows the network&apos;s latest rules for ring size and decoys.</li>
        <li>Do not try to customize anything about how a transaction is built. Uniformity is the whole point.</li>
        <li>Remember the other layers. A ring cannot protect you from an exchange that knows your identity, or from an address you posted next to your name.</li>
      </ul>
      <p>
        MonkStash builds transactions with the standard Monero library, so every payment you send from your{" "}
        <Link href={walletUrl}>MonkStash wallet</Link> uses the network&apos;s ring rules without a setting to change. New to all of
        this? <Link href="/what-is-monero">What is Monero</Link> is the gentlest starting point, and{" "}
        <Link href="/monero-vs-bitcoin">Monero vs Bitcoin</Link> shows why the difference matters, while <Link href="/monero-vs-zcash">Monero vs Zcash</Link> compares a different privacy design. Primary sources:{" "}
        <a href="https://docs.getmonero.org/technical-specs/" rel="noopener">the Monero technical specifications</a> and the{" "}
        <a href="https://www.getmonero.org/2025/04/05/ospead-optimal-ring-signature-research.html" rel="noopener">OSPEAD research post</a>.
      </p>
    </>
  );
}
