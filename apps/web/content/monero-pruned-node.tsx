import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, PullQuote, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { PruneRoutesFigure, PruningStripesFigure } from "@/components/art/MoneroPrunedNodeArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-pruned-node",
  section: "learn",
  kicker: "Smaller node, same job",
  title: "Monero Pruned Node: What It Is and When to Use One",
  seoTitle: "Monero Pruned Node: What It Is, When to Use It",
  summary: "A Monero pruned node saves about two thirds of disk space (roughly 95 GB vs 280 GB) and still works with wallets. Flags, trade-offs and how to convert.",
  keyword: "monero pruned node",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "removes", label: "What pruning removes and keeps" },
    { id: "storage", label: "Storage numbers" },
    { id: "wallets", label: "Can a pruned node serve wallets" },
    { id: "flags", label: "The flags: prune and sync-pruned-blocks" },
    { id: "full", label: "When to choose a full node" },
    { id: "convert", label: "How to convert" },
    { id: "choose", label: "Which one to pick" },
  ],
  related: ["run-a-monero-node", "monero-node", "monero-remote-node", "monero-light-wallet", "monero-wallet-not-syncing", "monero-ring-signatures"],
  faq: [
    { q: "What is a Monero pruned node?", a: "A node that drops about 7/8 of the prunable transaction data (mostly ring signature material) and keeps the rest. The Monero documentation says it saves about two thirds of disk space without degrading wallet functionality, while keeping the full transaction history." },
    { q: "How big is a pruned Monero blockchain?", a: "The Monero project's README gave about 95 GB for a pruned blockchain and about 280 GB for the full one as of June 2026. Both numbers grow over time, so check the README before you buy a drive." },
    { q: "How do I prune the Monero blockchain?", a: "On a new node, start monerod with the --prune-blockchain option from the first sync. On an existing full node, use the monero-blockchain-prune tool, which needs enough disk space for both the full and pruned copies while it works." },
    { q: "Can a pruned node serve wallets?", a: "Yes. The Monero documentation says pruning does not degrade functionality, and a wallet connects to a pruned node the same way. The node simply cannot serve all historical data to other peers." },
    { q: "Does a pruned node still verify transactions?", a: "A pruned node checks new blocks and transactions like a full node, per the Monero README, which says it otherwise works the same. Pruning removes stored data for old transactions, not the validation of the chain." },
    { q: "What does --sync-pruned-blocks do?", a: "The monerod reference describes it as accepting pruned blocks instead of pruning yourself, which should save network transfer when used with --prune-blockchain. If you want to check everything yourself, you may prefer to leave it off." },
    { q: "Can I turn a pruned node back into a full node?", a: "The official documentation describes no way to un-prune. To get a full node again, you would delete the pruned data and sync again from the beginning without the prune option." },
    { q: "Should I run a full node instead?", a: "Choose a full node if you have the disk space and want to help new nodes sync by serving the entire history. A pruned node contributes less to that (up to one eighth, per the docs) but still relays blocks and transactions." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A <strong>Monero pruned node</strong> is a node that throws away part of the old transaction data to save disk space,
        while still checking the chain and working with your wallet. The Monero project&apos;s README listed about{" "}
        <mark>95 GB for a pruned blockchain versus about 280 GB for a full one</mark> in June 2026. For most people who run a
        node for their own wallet, pruned is the sensible choice. This guide explains what is kept, what is lost and how to
        switch.
      </p>

      <Takeaways items={[
        "Pruning drops most of the old ring signature data and saves about two thirds of the disk space.",
        "A pruned node works with wallets the same way a full node does.",
        "Turn pruning on from the first sync. Adding it later does not shrink the file straight away.",
        "A pruned node helps new nodes sync less than a full node does, up to one eighth as much, but still relays blocks and transactions.",
        "There is no official un-prune. Going back to a full node means syncing again.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        If you want a node for your own wallet and do not need to serve the whole history to others, <mark>run it pruned</mark>. It is the
        same job in a third of the space. If you have plenty of disk and want to be a full resource for the network, run a full
        node. You can do the full setup in <Link href="/run-a-monero-node">how to run a Monero node</Link>, which covers
        downloads, verification and ports. This page is about the pruned part.
      </p>

      <h2 id="removes">What pruning removes and keeps</h2>
      <p>
        Monero transactions carry a lot of data that proves they are valid, mostly ring signature material (see{" "}
        <Link href="/monero-ring-signatures">ring signatures</Link>). A node needs that data to check a transaction when
        it first arrives. Years later, it is mostly useful for one thing: helping a brand new node sync from scratch.
      </p>
      <p>
        Pruning takes advantage of that. According to the{" "}
        <a href="https://getmonero.org/2019/02/01/pruning.html" rel="noopener">Monero announcement of pruning</a>, a pruned node
        keeps a random 1/8 of the prunable transaction data, and that kept share is what it uses to help other nodes. The
        official <a href="https://www.getmonero.org/resources/moneropedia/pruning.html" rel="noopener">glossary</a> describes it
        as <mark>saving 2/3 of storage space</mark> while keeping the full transaction history.
      </p>
      <Figure caption="A pruned node keeps the always-needed data plus one stripe in eight of the prunable data. Different nodes keep different stripes.">
        <PruningStripesFigure />
      </Figure>
      <ul>
        <li><strong>Kept:</strong> block headers and the non-prunable data of every transaction, so the chain history is intact, plus a random one-eighth stripe of the prunable data.</li>
        <li><strong>Dropped:</strong> the other seven eighths of the prunable data.</li>
        <li><strong>Why it is safe:</strong> the network as a whole still holds every stripe, because different nodes keep different ones.</li>
      </ul>

      <h2 id="storage">Storage numbers</h2>
      <p>
        These figures come from the README in the{" "}
        <a href="https://github.com/monero-project/monero" rel="noopener">monero-project repository</a>, dated June 2026:
      </p>
      <table>
        <thead><tr><th>Node type</th><th>Approx. disk use</th></tr></thead>
        <tbody>
          <tr><td>Full</td><td>About 280 GB</td></tr>
          <tr><td>Pruned</td><td>About 95 GB</td></tr>
        </tbody>
      </table>
      <p>
        That is roughly a third, which matches the two-thirds saving in the docs. For comparison, the 2019 announcement
        described a chain of about 65 GB and a pruned node of about 25 GB, so the chain has grown a lot. Plan for growth, use an
        SSD, and check the README for the latest numbers. The first sync also needs working space beyond the final size.
      </p>
      <KeyFact label="One number">
        About 95 GB pruned vs about 280 GB full, per the Monero README in June 2026. Leave headroom, because both keep growing.
      </KeyFact>

      <h2 id="wallets">Can a pruned node serve wallets</h2>
      <p>
        Yes. The <a href="https://docs.getmonero.org/interacting/monerod-reference/" rel="noopener">monerod reference</a> says
        pruning saves 2/3 of disk space &quot;w/o degrading functionality,&quot; and the README says a pruned node can only serve
        part of the historical chain data to other peers but otherwise works the same as a full node. Your wallet uses the same
        connection, the same port and the same steps. <mark>It does not notice the difference</mark>.
      </p>
      <PullQuote cite="Monero monerod reference">
        Pruning saves 2/3 of disk space w/o degrading functionality.
      </PullQuote>
      <p>
        This also means <mark>a pruned node is a good base for a private setup</mark>. Pointing a wallet at your own node avoids telling a
        third party which payments it is looking for, the main drawback of a{" "}
        <Link href="/monero-remote-node">remote node</Link>. If you do not want to run any node, a{" "}
        <Link href="/monero-light-wallet">light wallet</Link> is a different trade-off.
      </p>
      <Callout title="MonkStash and your own node">
        MonkStash&apos;s <Link href={walletUrl}>web wallet</Link> does not yet let you enter a custom node. That is planned. In
        the meantime, other wallets that support custom nodes will work with your pruned node. See our <Link href="/monero-wallets">wallet comparison</Link>.
      </Callout>

      <h2 id="flags">The flags: prune and sync-pruned-blocks</h2>
      <p>
        There are two options to know, both described in the monerod reference.
      </p>
      <h3>--prune-blockchain</h3>
      <pre><code>monerod --prune-blockchain</code></pre>
      <p>
        The reference says that for maximum effect, <mark>it should be used already on the first sync</mark>. If you add it later, past data
        is only pruned logically, without shrinking the file size, and the gain is delayed. It also states the trade-off: you
        contribute less to the peer to peer network in helping new nodes sync, up to 1/8 of normal contribution, while still
        being useful for relaying new transactions and blocks.
      </p>
      <h3>--sync-pruned-blocks</h3>
      <pre><code>monerod --prune-blockchain --sync-pruned-blocks</code></pre>
      <p>
        The reference describes this as accepting pruned blocks instead of pruning yourself, which should save network transfer
        when used with <code>--prune-blockchain</code>. As we read it, this means you take pruned blocks from peers rather than
        downloading everything and pruning it locally. That saves bandwidth. If you prefer to process the full data yourself
        before it is discarded, leave it off. Check the reference for your version before relying on it.
      </p>

      <h2 id="full">When to choose a full node</h2>
      <ul>
        <li><strong>You have the space and want to help.</strong> A full node can serve the whole history to nodes that are syncing.</li>
        <li><strong>You run infrastructure for others.</strong> Block explorers, payment services and public nodes often want complete data.</li>
        <li><strong>You want maximum independence.</strong> A full node keeps everything locally, with no reliance on other nodes&apos; stripes for old data.</li>
        <li><strong>Disk is not the limit.</strong> If you already own a large SSD, the extra 185 GB or so may cost you nothing.</li>
      </ul>
      <p>
        If instead you are on a small laptop, a mini PC or a Raspberry Pi, the pruned node is the practical option, as the node
        guide says.
      </p>

      <h2 id="convert">How to convert</h2>
      <Figure caption="Choose pruning on the first sync. Converting later works but needs extra space, and going back needs a fresh sync.">
        <PruneRoutesFigure />
      </Figure>
      <h3>Starting new</h3>
      <p>
        Start <code>monerod</code> with <code>--prune-blockchain</code> on the first sync. Nothing else is needed.
      </p>
      <h3>Converting an existing full node</h3>
      <p>
        The monerod reference says that if you already have an unpruned blockchain, see the{" "}
        <code>monero-blockchain-prune</code> tool. The README adds that pruning an existing chain temporarily needs enough
        disk space for both the full and pruned blockchains. So you need free space at least equal to the pruned result while it
        runs. Stop the daemon first, and read the tool&apos;s help text for the exact options before you run it.
      </p>
      <h3>Going back to full</h3>
      <p>
        The official documentation describes no reverse tool, so we treat pruning as one-way. To get a full node again,
        delete the pruned database and sync from the start without <code>--prune-blockchain</code>. That takes hours or days, so
        choose carefully. See the <Link href="/run-a-monero-node">node guide</Link> for sync times and the{" "}
        <Link href="/monero-wallet-not-syncing">syncing guide</Link> if your wallet gets stuck meanwhile.
      </p>

      <h2 id="choose">Which one to pick</h2>
      <table>
        <thead><tr><th>You are</th><th>Pick</th></tr></thead>
        <tbody>
          <tr><td>Running a node for your own wallet</td><td>Pruned</td></tr>
          <tr><td>On a Pi, mini PC or small disk</td><td>Pruned</td></tr>
          <tr><td>Wanting to give new nodes a full history to sync from</td><td>Full</td></tr>
          <tr><td>Running a service that needs complete data</td><td>Full</td></tr>
        </tbody>
      </table>
      <p>
        Whichever you choose, running your own node beats borrowing one. Get the basics in{" "}
        <Link href="/monero-node">what a Monero node is</Link>, then follow{" "}
        <Link href="/run-a-monero-node">the setup guide</Link>.
      </p>
    </>
  );
}
