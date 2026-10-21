import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { NodeInNetworkFigure, StorageFigure } from "@/components/art/RunAMoneroNodeArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "run-a-monero-node",
  section: "learn",
  kicker: "Run your own",
  title: "How to Run a Monero Node (Full or Pruned), Step by Step",
  seoTitle: "How to Run a Monero Node, Step by Step",
  summary: "How to run a Monero node: what it costs in disk and bandwidth, the official download, the monerod command, sync times, and connecting your wallet.",
  keyword: "how to run a monero node",
  updated: "2026-10-21",
  readingMinutes: 12,
  toc: [
    { id: "short", label: "The short version" },
    { id: "why", label: "Why run your own node" },
    { id: "requirements", label: "Requirements" },
    { id: "download", label: "Download and verify" },
    { id: "start", label: "Start monerod" },
    { id: "sync", label: "Sync time" },
    { id: "wallet", label: "Connect your wallet" },
    { id: "public", label: "Running a public node" },
    { id: "pi", label: "Raspberry Pi and small machines" },
    { id: "update", label: "Keeping it updated" },
    { id: "next", label: "What to do next" },
  ],
  related: ["monero-node", "monero-remote-node", "monero-phishing-sites", "monero-wallet-not-connecting", "monero-wallet-not-syncing"],
  faq: [
    { q: "How do I run a Monero node?", a: "Download the official Monero software from getmonero.org and verify it, then start monerod, ideally with the --prune-blockchain flag. Let it sync the blockchain, then point your wallet at your node's address and port." },
    { q: "How much disk space does a Monero node need?", a: "The Monero project's README gave about 280 GB for the full blockchain and about 95 GB for a pruned one as of June 2026. Both grow over time, so leave headroom and prefer an SSD." },
    { q: "What is a pruned Monero node?", a: "A pruned node drops part of the old transaction data to save roughly two thirds of the disk space, yet still validates the chain. It works for wallets the same way. It just cannot serve all historical data to other nodes." },
    { q: "How long does a Monero node take to sync?", a: "The first sync typically takes many hours on a fast SSD and can stretch to days on a slow disk or connection. After that, staying in sync is quick." },
    { q: "Can I run a Monero node on a Raspberry Pi?", a: "Yes, people do, with an SSD for the blockchain. The first sync is slow and the board will be busy for a while. A pruned node on a fast external SSD is the practical choice." },
    { q: "Do I need to open ports to run a node?", a: "Not to use it yourself. Opening the peer port (18080 on mainnet) helps the network but is optional. You only need to expose an RPC port if you want to run a public node for others." },
    { q: "Does running a node make me more private?", a: "It stops a third party from seeing which requests your wallet makes, which is the main privacy gain over a public remote node. It does not change what is on the blockchain." },
    { q: "Can I use my own node from my phone?", a: "Yes, if the phone can reach it. At home that is your local address. Away from home you need to make the node reachable, ideally over a private tunnel, and use its restricted RPC port." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        To run a Monero node, download the official software from getmonero.org, verify it, start <code>monerod</code> (add{" "}
        <code>--prune-blockchain</code> to save disk), wait for the blockchain to sync, then point your wallet at your own
        address. A pruned node needs roughly <mark>95 GB of disk space</mark> and a full node roughly 280 GB, per the Monero
        project&apos;s own README in June 2026. This guide covers why it is worth doing, what you need, and every step.
      </p>

      <Takeaways items={[
        "A node of your own means no outside server sees which payments your wallet is looking for.",
        "A pruned node does the same job for wallets in about a third of the disk space.",
        "Use an SSD. The first sync takes hours to days, depending on disk and connection.",
        "Download only from getmonero.org and verify the file before running it.",
        "For a node others can use, run restricted RPC. Never expose the full RPC to the internet.",
      ]} />

      <h2 id="short">The short version</h2>
      <ol>
        <li>Pick a machine with an SSD and a stable connection.</li>
        <li>Download the official Monero software and verify it.</li>
        <li>Run <code>monerod --prune-blockchain</code> and let it sync.</li>
        <li>Enter your node&apos;s address and port in your wallet.</li>
      </ol>
      <Callout title="Want it done in one command?">
        <Link href="/server">MonkStash Server</Link> does all of this on a Debian or Ubuntu server: it checks the official release
        signature, runs a pruned node, adds HTTPS, a firewall and a status page, and prints the address for your wallet. This guide
        stays useful if you prefer to do each step yourself, or run the node at home.
      </Callout>

      <h2 id="why">Why run your own node</h2>
      <p>
        A wallet needs a <Link href="/monero-node">node</Link> to read the blockchain. Most people borrow one
        run by someone else, a <Link href="/monero-remote-node">remote node</Link>. That is convenient, but the operator
        <mark>can see your IP address and the requests your wallet makes</mark>. The project&apos;s own remote node guide recommends running
        your own node or using one you trust.
      </p>
      <ul>
        <li><strong>Privacy.</strong> Your wallet talks to a machine you control. <mark>No third party sees which outputs it is asking about</mark>.</li>
        <li><strong>Trust.</strong> Your node checks every block against Monero&apos;s rules itself. It does not take anyone else&apos;s word that a transaction is valid.</li>
        <li><strong>Reliability.</strong> Public nodes go offline or get busy. Yours is there when you need it, which avoids many connection errors (see <Link href="/monero-wallet-not-connecting">wallet not connecting</Link>).</li>
        <li><strong>Helping the network.</strong> Every node that stays online and shares blocks makes the network sturdier and gives new nodes a place to sync from.</li>
      </ul>
      <Figure caption="Your wallet talks to your own node. Your node talks to the rest of the network and checks everything it receives.">
        <NodeInNetworkFigure />
      </Figure>
      <p>
        Be honest about the limits. A node protects the link between your wallet and the network. It does not hide the use of
        Monero itself from your internet provider, who can still see you connecting to Monero peers. If that matters, route
        the node through Tor or a VPN you trust.
      </p>

      <h2 id="requirements">Requirements</h2>
      <p>
        The Monero project does not publish a formal minimum for CPU or RAM, so these are common practical choices, not official
        rules. <mark>Disk is the part that matters most</mark>.
      </p>
      <table>
        <thead><tr><th>Resource</th><th>Practical guidance</th></tr></thead>
        <tbody>
          <tr><td>Disk</td><td>SSD strongly preferred. About 95 GB pruned or 280 GB full today, plus headroom for growth</td></tr>
          <tr><td>RAM</td><td>A few GB is workable. More makes the first sync smoother</td></tr>
          <tr><td>CPU</td><td>Any modern multi-core processor. Syncing checks cryptography, so it will be busy at first</td></tr>
          <tr><td>Connection</td><td>Stable, with no tight monthly cap. The first sync downloads the whole chain</td></tr>
          <tr><td>OS</td><td>Windows, macOS or Linux. Linux suits an always-on machine</td></tr>
        </tbody>
      </table>
      <p>
        The disk numbers come from the README in the{" "}
        <a href="https://github.com/monero-project/monero" rel="noopener">monero-project repository</a>, which listed about 280
        GB for the full chain and about 95 GB pruned in June 2026. They change as the chain grows, so check the current README
        before buying a drive.
      </p>
      <h3>Full or pruned</h3>
      <Figure caption="Pruning keeps about a third of the data. Both versions check the chain fully.">
        <StorageFigure />
      </Figure>
      <p>
        The official <a href="https://docs.getmonero.org/interacting/monerod-reference/" rel="noopener">monerod reference</a>{" "}
        says pruning saves about two thirds of disk space without reducing wallet functionality, and recommends turning it on
        for the first sync. For most people, running a node for their own wallet, <mark>pruned is the right choice</mark>. Choose full if you
        want to help other nodes by serving the whole history. If you plan to mine with <Link href="/monero-p2pool">P2Pool</Link>, you need your own node as well.
      </p>

      <h2 id="download">Download and verify</h2>
      <p>
        Get the software only from the official <a href="https://www.getmonero.org/downloads/" rel="noopener">downloads page</a>.
        It includes <code>monerod</code> in the command line bundle. The page tells you to <mark>always verify your downloads</mark>, because a
        corrupted or swapped archive can cost you funds, and it points to the signed hash list for checking.
      </p>
      <ol>
        <li>Download the command line tools for your system, plus the signed hash list the page links.</li>
        <li>Follow the project&apos;s binary verification guide: check the signature on the list, then compare your file&apos;s hash to it.</li>
        <li>Only then unpack and run.</li>
      </ol>
      <p>
        Fake download sites are a real hazard in this space. Our guide to{" "}
        <Link href="/monero-phishing-sites">Monero phishing sites</Link> shows how to spot them and links the verification
        steps in more detail. Your antivirus may flag Monero programs, which the official downloads page also notes; that is not
        a reason to download from somewhere else. Here is <Link href="/monero-gui-virus-warning">how to tell a false alarm from a real
        threat</Link>.
      </p>

      <h2 id="start">Start monerod</h2>
      <p>
        Open a terminal in the folder you unpacked and start the daemon. For your own use, this is enough:
      </p>
      <pre><code>monerod --prune-blockchain --data-dir /path/to/monero-data</code></pre>
      <p>
        <code>--prune-blockchain</code> keeps the database small. The reference notes it should be set on the first sync, since
        enabling it later delays the savings. <code>--data-dir</code> sets where the blockchain is stored, which is useful for
        putting it on a large SSD. To run in the background, add <code>--detach</code>, or set up a service with systemd on Linux;
        the project&apos;s README describes the service files.
      </p>
      <table>
        <thead><tr><th>Port (mainnet)</th><th>Purpose</th><th>Who should reach it</th></tr></thead>
        <tbody>
          <tr><td>18080</td><td>Peer to peer with other nodes</td><td>Anyone, optional to open</td></tr>
          <tr><td>18081</td><td>Full RPC, used by your own wallet</td><td>Local machine only by default</td></tr>
          <tr><td>18089 (common choice)</td><td>Restricted RPC for public use</td><td>Others, if you choose to share</td></tr>
        </tbody>
      </table>
      <p>
        <mark>The default RPC address is local only</mark> (127.0.0.1) because the full RPC grants administrative control. Leave it that way
        unless you know why you are changing it.
      </p>

      <h2 id="sync">Sync time</h2>
      <p>
        The first sync downloads the entire chain and checks every block. How long it takes depends mostly on your disk and
        connection, and the project publishes no fixed figure. Community experience is that an SSD brings it to hours or a day
        or two, while a hard drive can take far longer. Treat that as a rough guide, not a promise.
      </p>
      <ul>
        <li>The daemon prints its progress as it goes. When the height matches the network, it is caught up.</li>
        <li>You can use the wallet only once the node is synced, so keep a remote node set in the meantime.</li>
        <li>Keep the computer awake and the connection steady. Interruptions are safe; the daemon resumes where it stopped.</li>
        <li>After the first sync, staying current takes little work: about one new block every 2 minutes.</li>
      </ul>

      <h2 id="wallet">Connect your wallet</h2>
      <p>
        Give your wallet the node&apos;s address and port. On the same computer that is <code>127.0.0.1</code> and port{" "}
        <code>18081</code>. On another device on your home network it is the computer&apos;s local address, and you will need to
        let the daemon listen on the network, which is an advanced step best done with restricted RPC (see below).
      </p>
      <p>
        In the Monero GUI, the official guide describes Advanced mode, then <strong>Settings, Node</strong>, to choose between a
        local and a remote node and to enter an address and port. Other wallets such as Feather and Cake keep node settings in
        their own settings menus. If it does not connect, see{" "}
        <Link href="/monero-wallet-not-connecting">fixing a wallet that cannot reach its node</Link>.
      </p>
      <Callout title="MonkStash and your own node">
        MonkStash plans to run its own nodes and to let people point the wallet at a node of their own. That is planned, not
        available today, so do not expect a custom node field in the <Link href={walletUrl}>web wallet</Link> yet. You can use any
        wallet that supports custom nodes with the steps above in the meantime.
      </Callout>

      <h2 id="public">Running a public node</h2>
      <p>
        If you want to share your node, add restricted RPC. The reference says <code>--restricted-rpc</code> limits the API to
        view-only commands, and that a node advertised to the network needs the options below, together with an explicit
        acknowledgement that it listens beyond your own machine:
      </p>
      <pre><code>{`monerod --prune-blockchain --public-node --restricted-rpc \\
  --rpc-bind-ip 0.0.0.0 --rpc-bind-port 18089 --confirm-external-bind`}</code></pre>
      <p>
        The README calls restricted RPC a must for a public remote node, and advises running the node on a dedicated, secured
        machine. Before you open a port, understand what you are taking on: bandwidth use, the risk of exposing a home network,
        and being responsible for keeping it updated. If you only want your own wallet to connect, skip this section.
      </p>

      <h2 id="pi">Raspberry Pi and small machines</h2>
      <p>
        People do run nodes on small boards such as a Raspberry Pi. The practical recipe is a <Link href="/monero-pruned-node">pruned node</Link> on a fast SSD, not an
        SD card, a good power supply, and patience for the first sync. The README documents a build on a Raspberry Pi 5B, though it
        gives no official performance figures. Expect the board to be busy for a while, and expect slower results than a laptop.
        A mini PC is often a calmer choice for an always-on node.
      </p>

      <h2 id="update">Keeping it updated</h2>
      <p>
        Monero upgrades its rules through scheduled hard forks, and the project says users and services should run current
        software before each one. A node that is not updated can fall off the network and stop being useful. To stay safe:
      </p>
      <ul>
        <li>Check the official downloads page for new releases from time to time, and read the release notes.</li>
        <li>Verify each download the same way as the first.</li>
        <li>Stop the daemon cleanly, replace the files, and start it again. Your synced data stays.</li>
        <li>Update your wallet too, since a wallet and node that are far apart in version can disagree.</li>
      </ul>

      <h2 id="next">What to do next</h2>
      <p>
        Once your node is synced and your wallet is pointed at it, you have the most private everyday setup Monero offers. If you
        have not made a wallet yet, <Link href="/create-monero-wallet">create one</Link> or{" "}
        <Link href={walletUrl}>open the web wallet</Link> to try things out first. For background, read{" "}
        <Link href="/monero-node">what a Monero node is</Link> and compare it with a{" "}
        <Link href="/monero-remote-node">remote node</Link>. If anything stalls, the{" "}
        <Link href="/monero-wallet-not-syncing">syncing guide</Link> is the place to go.
      </p>
    </>
  );
}
