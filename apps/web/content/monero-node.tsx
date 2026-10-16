import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps } from "@/components/article/parts";
import { ChapterHead, DeepDive, FactStrip, Timeline, UseCases, YoullLearn } from "@/components/pillar/parts";
import { Figure } from "@/components/art/Figure";
import { MiningPathsArt, NodeDecisionArt, WalletNodeSplitArt, WhoSeesWhatArt } from "@/components/art/MoneroNodePillarArt";
import { MiningPathsNarrow, NodeDecisionNarrow, WalletNodeSplitNarrow, WhoSeesWhatNarrow } from "@/components/art/MoneroNodePillarNarrowArt";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-node",
  section: "learn",
  layout: "pillar",
  kicker: "The complete guide",
  title: "Monero Node: Full, Pruned or Remote? The Complete Guide for 2026",
  seoTitle: "Monero Node: Full, Pruned or Remote? (2026)",
  h1: { keyword: "What is a Monero node?", sizzle: "Your own copy of the truth." },
  summary: "What a Monero node does, full vs pruned vs remote, what each one can see, how to run your own, and where mining fits in. Plain English, no hype.",
  keyword: "monero node",
  updated: "2026-10-15",
  readingMinutes: 21,
  toc: [
    { id: "what", label: "What is a Monero node?" },
    { id: "wallet", label: "How your wallet uses a node" },
    { id: "types", label: "Full, pruned, remote and light wallet servers" },
    { id: "need", label: "Do you need your own node?" },
    { id: "requirements", label: "Monero node requirements and ports" },
    { id: "run", label: "How to run a Monero node" },
    { id: "remote", label: "How to choose a safe remote node" },
    { id: "tor", label: "Monero over Tor and I2P" },
    { id: "mining", label: "How Monero mining works" },
    { id: "worth-it", label: "Is Monero mining worth it?" },
    { id: "monkstash", label: "How MonkStash connects today" },
  ],
  chapterBlurbs: {
    what: "The computers that check every rule, and why nobody pays them.",
    wallet: "Your keys stay home. Blocks come in, signed payments go out.",
    types: "Four setups, and exactly what each one can see about you.",
    need: "Most people don't, at first. Here is when you should.",
    requirements: "Disk, memory and the port numbers, with dated sources.",
    run: "Download, verify, start, sync. Plus Raspberry Pi and Docker.",
    remote: "A short checklist for borrowing someone else's node.",
    tor: "Hide your IP address from the node, and what that costs.",
    mining: "RandomX, XMRig, solo, pools and P2Pool, side by side.",
    "worth-it": "No profit promises. The honest questions to ask first.",
    monkstash: "A public node today, your own node later. Same keys either way.",
  },
  related: ["run-a-monero-node", "monero-remote-node", "monero-pruned-node", "mine-monero", "monero-p2pool"],
  sources: [
    { label: "Monero source code and README (blockchain size as of June 2026, Docker, Raspberry Pi)", href: "https://github.com/monero-project/monero" },
    { label: "monerod reference: every flag, default ports, restricted RPC, pruning", href: "https://docs.getmonero.org/interacting/monerod-reference/" },
    { label: "Monero docs: Tor and I2P setup guide for monerod", href: "https://docs.getmonero.org/running-node/monerod-tori2p/" },
    { label: "Anonymity networks in Monero (Tor and I2P, still experimental)", href: "https://github.com/monero-project/monero/blob/master/docs/ANONYMITY_NETWORKS.md" },
    { label: "Moneropedia: Remote node", href: "https://www.getmonero.org/resources/moneropedia/remote-node.html" },
    { label: "Monero FAQ (nodes, remote nodes, pruning)", href: "https://www.getmonero.org/get-started/faq/" },
    { label: "Official downloads and how to verify them", href: "https://www.getmonero.org/downloads/" },
    { label: "Dandelion++ added to Monero (April 2020, shipped in v0.16)", href: "https://www.getmonero.org/2020/04/18/dandelion-implemented.html" },
    { label: "monero-lws, an open-source light wallet server", href: "https://github.com/vtnerd/monero-lws" },
    { label: "Moneropedia: RandomX", href: "https://www.getmonero.org/resources/moneropedia/randomx.html" },
    { label: "getmonero.org: Mining (solo, pools, P2Pool)", href: "https://www.getmonero.org/get-started/mining/" },
    { label: "P2Pool source code and README", href: "https://github.com/SChernykh/p2pool" },
    { label: "XMRig source code and README", href: "https://github.com/xmrig/xmrig" },
    { label: "The Block: Monero shaken by 18-block reorg (September 2025)", href: "https://www.theblock.co/post/370628/monero-shaken-by-block-reorg-reviving-tensions-with-qubic" },
  ],
  faq: [
    { q: "What is a Monero node?", a: "A Monero node is a computer running the official monerod software. It keeps a copy of the blockchain, checks every block and transaction against Monero's rules, passes new transactions to other nodes, and answers requests from wallets. Together, these nodes are the Monero network." },
    { q: "Do I need to run my own Monero node?", a: "No. Most wallets connect to a remote node run by someone else, and that is fine for getting started. Your own node removes the third party, so it makes sense if you hold larger amounts, care a lot about privacy, or want to mine with P2Pool." },
    { q: "Can a remote node steal my Monero?", a: "No. A node never receives your recovery words or your private spend key, so it cannot spend your funds. A remote node can see your IP address and the transactions you broadcast through it, and a badly run node can serve slow or wrong data." },
    { q: "How big is the Monero blockchain?", a: "The Monero project's README gave about 280 GB for the full blockchain and about 95 GB for a pruned one as of June 2026. Both keep growing, so leave room and check the README for the current figure." },
    { q: "What ports does a Monero node use?", a: "On mainnet, monerod uses port 18080 for peer-to-peer traffic and 18081 for RPC by default. Stagenet uses 38080 and 38081, testnet 28080 and 28081. A node you share with others should expose only restricted RPC, which the official Tor guide puts on port 18089." },
    { q: "Do Monero nodes earn rewards?", a: "No. Monero does not pay people for running nodes. Block rewards go to miners. People run nodes for privacy, independence, and to support the network." },
    { q: "Can I run a Monero node on a Raspberry Pi?", a: "Yes. Official Linux builds exist for ARMv7 and ARMv8, and the Monero README documents building on a Raspberry Pi 5B with 64-bit Raspberry Pi OS. Use a pruned node on an SSD, and expect the first sync to be slow." },
    { q: "Is Monero mining profitable?", a: "We don't give financial advice or profit estimates. Whether mining pays depends on your electricity price, your hardware, the network's total hashrate and the XMR price, and all of these change. Many people mine to support decentralization and treat any reward as a bonus." },
  ],
};

export function Hero() {
  return <Adaptive wide={<WalletNodeSplitArt />} narrow={<WalletNodeSplitNarrow />} />;
}

export function Body() {
  return (
    <>
      <p>
        <strong>What is a Monero node?</strong> It is a computer that keeps its own copy of the Monero blockchain and checks
        every block against the rules, so nobody has to take anyone&apos;s word for anything. Every Monero wallet talks to a
        node. The only question is <mark>whose node, and what it can see</mark>. Get that right, and you know exactly how
        private your setup really is.
      </p>
      <p>This is the complete guide, for people who just want their wallet to work and for people who want to run the whole stack themselves.</p>

      <YoullLearn items={[
        <>What a node does, and why your wallet cannot work without one</>,
        <>Full, pruned, remote and light wallet servers, and <em>exactly</em> what each one can see</>,
        <>Whether you need your own node, and what it takes in disk, ports and patience</>,
        <>How to pick a safe remote node, and how Tor and I2P fit in</>,
        <>How mining works with RandomX, XMRig and P2Pool, without the profit hype</>,
      ]} />
      <p>Let&apos;s get started.</p>

      {/* 1 */}
      <ChapterHead n={1} id="what" title="What is a Monero node?" />
      <p>
        A Monero node is a computer running <code>monerod</code>, the official Monero software. It downloads every block since
        2014, checks each one, and keeps the result. When a new block or transaction arrives, the node tests it against
        Monero&apos;s rules before passing it on. Anything that breaks a rule is simply dropped.
      </p>
      <p>
        No node is in charge. Thousands of them each <mark>check the work for themselves</mark>, and together they are the
        network. That is why nobody can quietly print extra XMR or reverse your payment: they would have to convince every
        honest node to accept a broken block, and the nodes don&apos;t negotiate.
      </p>
      <KeyFact label="The one-line answer">
        A Monero node is the software that stores and verifies the blockchain. Your wallet <mark>asks a node for data</mark> and
        hands it signed payments to send. Your keys never leave your device.
      </KeyFact>
      <h3>Nodes are not paid</h3>
      <p>
        People often search for &quot;Monero node rewards&quot;. There are none. Monero has no staking and does not pay anyone
        to run a node. New coins go to <a href="#mining">miners</a>. People run nodes for privacy, for independence, and because
        a network with more honest nodes is harder to attack.
      </p>

      {/* 2 */}
      <ChapterHead n={2} id="wallet" title="How your wallet uses a node" />
      <p>
        Your wallet holds your keys, not the blockchain. That split is the whole design. The wallet does two jobs that need
        the network, and a node helps with both:
      </p>
      <ul>
        <li><strong>Finding your payments.</strong> Monero hides who each payment is for, so your wallet downloads blocks and scans them itself, using your private view key. Only your keys can tell which outputs are yours.</li>
        <li><strong>Sending payments.</strong> Your wallet builds and signs the transaction on your device, then gives the finished, encrypted transaction to a node to pass along.</li>
      </ul>
      <p>
        The diagram at the top of this page shows the split. Because the scan happens on your side, a regular node does not learn your balance or which payments are yours. What
        it does see is the connection itself: <mark>your IP address and the transactions you send</mark> through it. The{" "}
        <a href="https://www.getmonero.org/get-started/faq/" rel="noopener">Monero FAQ</a> says it plainly: a remote node
        operator can see which IP address a transaction comes from.
      </p>
      <h3>What happens after a node gets your payment</h3>
      <p>
        Once a node has your transaction, it spreads it to the rest of the network using Dandelion++, which Monero added in
        version 0.16 in 2020. It{" "}
        <a href="https://www.getmonero.org/2020/04/18/dandelion-implemented.html" rel="noopener">changes how transactions travel</a>{" "}
        so that it is much harder for someone watching the network to link a payment to the computer that first sent it.
        Dandelion++ protects you from distant observers. It does not hide you from the node you handed the payment to.
      </p>

      {/* 3 */}
      <ChapterHead n={3} id="types" title="Full, pruned, remote and light wallet servers" />
      <p>
        You will see four setups mentioned in wallet settings and forums. They differ in who runs the computer and in{" "}
        <mark>how much that computer learns about you</mark>.
      </p>
      <table>
        <caption>The four ways a wallet gets blockchain data</caption>
        <thead><tr><th>&nbsp;</th><th>Full node</th><th>Pruned node</th><th>Remote node</th><th>Light wallet server</th></tr></thead>
        <tbody>
          <tr><th>Who runs it</th><td>You</td><td>You</td><td>Someone else</td><td>Someone else, or you</td></tr>
          <tr><th>Disk on your side</th><td>About 280 GB</td><td>About 95 GB</td><td>None</td><td>None</td></tr>
          <tr><th>Checks the rules itself</th><td>Yes</td><td>Yes</td><td>Yes, but you trust its answers</td><td>Yes, but you trust its answers</td></tr>
          <tr><th>Sees your IP address</th><td>No outside party</td><td>No outside party</td><td>Yes, unless you use Tor</td><td>Yes, unless you use Tor</td></tr>
          <tr><th>Sees payments to you</th><td>No</td><td>No</td><td>No</td><td>Yes, it holds your view key</td></tr>
          <tr><th>Can spend your money</th><td>No</td><td>No</td><td>No</td><td>No</td></tr>
        </tbody>
      </table>
      <p>Disk figures are from the Monero README as of June 2026, and both keep growing.</p>
      <h3>Full node</h3>
      <p>
        The standard setup: the complete blockchain, checked by you. It can also help new nodes catch up by serving them old
        blocks.
      </p>
      <h3>Pruned node</h3>
      <p>
        Still a node that checks every rule, but it throws away most of the old data it no longer needs. The{" "}
        <a href="https://docs.getmonero.org/interacting/monerod-reference/" rel="noopener">monerod reference</a> says pruning{" "}
        <mark>saves two thirds of the disk space</mark> without degrading functionality. The one trade-off: it can only serve
        part of the history to other nodes. For your own wallet, it works the same.
      </p>
      <h3>Remote node</h3>
      <p>
        A node someone else runs and lets wallets connect to. It is the reason a phone or web wallet can open in seconds. Your
        keys stay with you, but the operator can link transactions to your IP address, and{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/remote-node.html" rel="noopener">Moneropedia</a> warns that
        public remote nodes can be risky for privacy. Chapter 7 shows how to choose one well.
      </p>
      <h3>Light wallet server</h3>
      <p>
        This is the model the old MyMonero service used. Instead of your wallet scanning blocks, you give a server your private
        view key and it scans for you. Open-source servers such as{" "}
        <a href="https://github.com/vtnerd/monero-lws" rel="noopener">monero-lws</a> store view keys and scan continuously. That
        is fast, but a view key reveals{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/viewkey.html" rel="noopener">every incoming payment</a> to
        whoever holds it. The server still cannot spend, because it never gets your spend key.
      </p>
      <Figure caption="What each setup can see. Only a light wallet server learns your incoming payments, and none of them can spend.">
        <Adaptive wide={<WhoSeesWhatArt />} narrow={<WhoSeesWhatNarrow />} />
      </Figure>
      <DeepDive paths={["/monero-pruned-node", "/monero-light-wallet"]} />

      {/* 4 */}
      <ChapterHead n={4} id="need" title="Do you need your own Monero node?" />
      <p>
        Short answer: not to get started. The Monero community&apos;s own advice is that{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/remote-node.html" rel="noopener">running your own node</a> gives
        the most privacy, and that is true. But it takes disk space, an always-on machine and a first sync that can last hours or
        days. For a new user with a small balance, <mark>a remote node is a reasonable start</mark>, and you can move to your own
        later without changing wallets or recovery words.
      </p>
      <Figure caption="A rough guide. Your situation can change, and moving from a remote node to your own needs no new wallet.">
        <Adaptive wide={<NodeDecisionArt />} narrow={<NodeDecisionNarrow />} />
      </Figure>
      <h3>What your own node gets you</h3>
      <UseCases items={[
        { icon: "shield", title: "No middleman sees your IP", body: "Your wallet talks only to your machine. No outside operator logs your connections." },
        { icon: "save", title: "Less trust for larger amounts", body: "Your node checks every block itself, so you never rely on someone else's answers." },
        { icon: "paid", title: "Verify payments yourself", body: "Shops and freelancers can confirm incoming payments against their own copy of the chain." },
        { icon: "world", title: "A stronger network", body: "Every honest node is one more independent check. A full node also helps new nodes sync." },
      ]} />
      <p>
        One honest caveat from the{" "}
        <a href="https://www.getmonero.org/get-started/faq/" rel="noopener">official FAQ</a>: running a node is not dangerous,
        but your internet provider can see that you are running one. If that matters where you live, read chapter 8 on Tor
        and I2P first.
      </p>

      {/* 5 */}
      <ChapterHead n={5} id="requirements" title="Monero node requirements and ports" />
      <p>
        The most searched question about running a node is how big it is. Here are the numbers, with the date they were
        published, because they grow every day.
      </p>
      <FactStrip items={[
        { value: "~280 GB", label: "Full blockchain (June 2026)" },
        { value: "~95 GB", label: "Pruned blockchain (June 2026)" },
        { value: "2/3", label: "Disk saved by pruning" },
        { value: "18080", label: "Peer-to-peer port" },
        { value: "18081", label: "RPC port for wallets" },
      ]} />
      <p>
        The sizes come from the <a href="https://github.com/monero-project/monero" rel="noopener">Monero README</a>, which keeps
        the current figure. For comparison, the{" "}
        <a href="https://www.getmonero.org/get-started/faq/" rel="noopener">FAQ</a> listed about 225 GB full and 86 GB pruned in
        2024, so plan for <mark>steady growth, not a fixed size</mark>.
      </p>
      <h3>Hardware</h3>
      <ul>
        <li><strong>Disk.</strong> Fit the blockchain plus room to grow. The official FAQ warns that the first sync can take a long time on an old hard drive, which is why people use an SSD.</li>
        <li><strong>Processor and memory.</strong> Any modern 64-bit computer can run a node. Small ARM boards work too, more slowly.</li>
        <li><strong>Connection.</strong> A node uploads and downloads data all the time. Check that your internet plan has no tight data cap.</li>
        <li><strong>Uptime.</strong> Your wallet can only use the node while it is on and synced.</li>
      </ul>
      <h3>Which ports does a Monero node use?</h3>
      <p>
        The defaults are in the <a href="https://docs.getmonero.org/interacting/monerod-reference/" rel="noopener">monerod reference</a>.
        You don&apos;t need to open any of them to use the node yourself on the same machine or home network.
      </p>
      <table>
        <caption>Monero node ports and what they are for</caption>
        <thead><tr><th>Port</th><th>What it is</th><th>Open it to the internet?</th></tr></thead>
        <tbody>
          <tr><th>18080</th><td>Peer-to-peer traffic with other nodes (mainnet)</td><td>Optional. It helps the network, it is not needed for your wallet.</td></tr>
          <tr><th>18081</th><td>Full RPC, where wallets connect (mainnet)</td><td>No. Keep it local.</td></tr>
          <tr><th>18089</th><td>Restricted RPC, the port the official Tor guide uses for wallets</td><td>Only if you share the node, and only in restricted mode.</td></tr>
          <tr><th>38080 / 38081</th><td>Stagenet peer-to-peer and RPC, for testing</td><td>Only for testing.</td></tr>
          <tr><th>28080 / 28081</th><td>Testnet peer-to-peer and RPC</td><td>Only for testing.</td></tr>
        </tbody>
      </table>
      <Callout kind="warn" title="Never expose the full RPC">
        Restricted mode limits the RPC to view-only commands and, in the words of the monerod reference, does not return
        privacy-sensitive data. The project&apos;s README calls it a must for anyone hosting a public node.
      </Callout>
      <DeepDive paths={["/monero-pruned-node"]} />

      {/* 6 */}
      <ChapterHead n={6} id="run" title="How to run a Monero node" />
      <p>
        Running a node is not hard. It is mostly waiting. Here is the whole process in five steps, and the{" "}
        <Link href="/run-a-monero-node">step-by-step node guide</Link> has every command.
      </p>
      <Steps items={[
        { title: "Download from getmonero.org, then verify", body: <p>Get the CLI or GUI from the <a href="https://www.getmonero.org/downloads/" rel="noopener">official downloads page</a> and check its SHA256 hash against the signed list, as the page tells you to. Fake Monero downloads exist, so <Link href="/monero-phishing-sites">phishing sites</Link> are a real risk.</p> },
        { title: "Start monerod, pruned if disk is tight", body: <p>Run <code>monerod</code>. Add <code>--prune-blockchain</code> on the very first start, which the reference says gives the best result.</p> },
        { title: "Let it sync", body: <p>The first sync downloads and checks every block since 2014. Expect hours on a fast SSD and longer on slow disks or connections. After that, staying in sync is quick.</p> },
        { title: "Point your wallet at it", body: <p>On the same machine, the wallet finds it at <code>127.0.0.1:18081</code>. From another device on your network, use the node&apos;s local address.</p> },
        { title: "Keep it running and updated", body: <p>Run it as a service so it starts with the computer. The <a href="https://docs.getmonero.org/" rel="noopener">official docs</a> include a systemd guide for Linux.</p> },
      ]} />
      <h3>Raspberry Pi, home servers and Docker</h3>
      <p>
        You don&apos;t need a big machine. The downloads page lists official Linux builds for <strong>ARMv7 and ARMv8</strong>,
        which is what boards like the Raspberry Pi use, and the{" "}
        <a href="https://github.com/monero-project/monero" rel="noopener">README</a> documents building Monero on a Raspberry
        Pi 5B running 64-bit Raspberry Pi OS. On small boards, <mark>a pruned node on an external SSD</mark> is the practical
        choice, and the first sync will be slow.
      </p>
      <p>
        The README also has a section on building and running <code>monerod</code> with <strong>Docker</strong>, which suits a
        home server or NAS that already runs containers. We could not find an official NAS app, so treat any one-click package
        as third-party software and check who publishes it.
      </p>
      <h3>Sharing your node with others</h3>
      <p>
        If you want to run a public node, the reference spells out the rules: the <code>--public-node</code> flag requires{" "}
        <code>--restricted-rpc</code>, an explicit <code>--rpc-bind-ip</code> and <code>--confirm-external-bind</code>. That is
        deliberate friction, so nobody exposes their node by accident.
      </p>
      <DeepDive paths={["/run-a-monero-node"]} />

      {/* 7 */}
      <ChapterHead n={7} id="remote" title="How to choose a safe remote node" />
      <p>
        A remote node cannot take your money. The risks are about privacy and reliability: a stranger logging your IP address,
        or a slow or misbehaving node that makes your wallet look broken. A few habits <mark>cut most of that risk</mark>:
      </p>
      <ul>
        <li><strong>Start with your wallet&apos;s built-in node list.</strong> Those nodes come from developers you already chose to trust. A random &quot;node list&quot; page from search results is a source you know nothing about.</li>
        <li><strong>Prefer an onion address if you use Tor.</strong> The node then sees a Tor address instead of your home IP.</li>
        <li><strong>Pick a node you have a reason to trust.</strong> A friend&apos;s node, or one run by a project you already rely on, beats an anonymous one.</li>
        <li><strong>Never mark someone else&apos;s node as trusted.</strong> Monero&apos;s wallet software has a &quot;trusted daemon&quot; option. The official Tor guide uses it only for a node you control, and so should you.</li>
        <li><strong>Switch if it acts up.</strong> A stuck sync or an old block height usually means a bad node. Trying another one fixes most cases.</li>
      </ul>
      <Callout title="Most sync problems are node problems">
        If your wallet sits on &quot;synchronizing&quot; or shows an old balance, suspect the node before the wallet. Our{" "}
        <Link href="/monero-wallet-not-syncing">sync troubleshooting guide</Link> and the{" "}
        <Link href="/monero-wallet-not-connecting">connection guide</Link> walk through the checks in order.
      </Callout>
      <DeepDive paths={["/monero-remote-node"]} />

      {/* 8 */}
      <ChapterHead n={8} id="tor" title="Monero over Tor and I2P" />
      <p>
        If you use a remote node but don&apos;t want it to see your IP address, route your wallet through Tor. If you run your
        own node, you can go further. Monero has built-in support for both <strong>Tor and I2P</strong>, which the project&apos;s{" "}
        <a href="https://github.com/monero-project/monero/blob/master/docs/ANONYMITY_NETWORKS.md" rel="noopener">anonymity networks document</a>{" "}
        still describes as experimental.
      </p>
      <h3>What it can do</h3>
      <ul>
        <li><strong>Send your own transactions privately.</strong> With <code>--tx-proxy</code>, your node sends transactions you create only to peers on Tor or I2P. If none are reachable, it holds them rather than falling back to the open internet.</li>
        <li><strong>Let your wallet reach your node from anywhere.</strong> The <a href="https://docs.getmonero.org/running-node/monerod-tori2p/" rel="noopener">official Tor and I2P guide</a> sets up an onion and I2P address for your node&apos;s RPC, so your phone can connect from outside without opening ports.</li>
        <li><strong>Accept connections from other private nodes</strong> with <code>--anonymous-inbound</code>.</li>
      </ul>
      <h3>What it cannot do</h3>
      <p>
        The project is unusually candid about the limits. Your node <mark>cannot sync the blockchain over Tor or I2P</mark>{" "}
        hidden services; syncing still happens over the regular internet, or through a proxy. Starting your node only when you
        want to send a payment can let your internet provider link you to that payment, so a node that runs all the time is
        better. And reusing one Tor connection for several transactions lets the operator of that hidden service guess they
        came from the same place.
      </p>
      <Callout title="The honest trade-off">
        Tor makes connections slower, and a poor circuit can make a sync look stuck. It is worth it when hiding your IP
        address matters more than speed.
      </Callout>

      {/* 9 */}
      <ChapterHead n={9} id="mining" title="How Monero mining works" />
      <p>
        Nodes check blocks. Miners make them. About every two minutes, one miner finds the next block, collects the fees inside
        it plus the fixed <strong>0.6 XMR</strong> tail reward, and every node checks the result. Mining is what makes rewriting
        history expensive.
      </p>
      <h3>RandomX: mining built for ordinary computers</h3>
      <p>
        Since November 30, 2019, Monero has used{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/randomx.html" rel="noopener">RandomX</a>, a proof-of-work
        algorithm written by Monero contributors and <mark>optimized for regular CPUs</mark>. Its goal is to discourage
        specialized mining chips, so the people securing the network look more like the people using it. The official{" "}
        <a href="https://www.getmonero.org/get-started/mining/" rel="noopener">mining page</a> notes that CPUs are much more
        efficient than GPUs for Monero.
      </p>
      <h3>Solo, pool or P2Pool</h3>
      <p>
        There are three ways to take part, and they differ in who holds your rewards and how often you get paid:
      </p>
      <Figure caption="Three ways to mine Monero. P2Pool keeps the pool-style steady payouts without an operator holding your coins.">
        <Adaptive wide={<MiningPathsArt />} narrow={<MiningPathsNarrow />} />
      </Figure>
      <ul>
        <li><strong>Solo.</strong> You mine against your own node and keep the whole block when you find one. The official page is blunt: depending on your hashrate, it might take months. The GUI and CLI wallets can solo mine on a CPU, and the <code>--start-mining</code> flag needs a primary address.</li>
        <li><strong>A mining pool.</strong> Many miners share the work and the operator pays out smaller, steadier amounts, minus a fee. Monero&apos;s mining page warns that too much hashrate on one pool is dangerous for the network.</li>
        <li><strong>P2Pool.</strong> A pool with no operator. <a href="https://github.com/SChernykh/p2pool" rel="noopener">P2Pool</a> runs its own side chain, charges a 0% fee, and pays every miner directly from the blocks it finds. It needs your own synced node started with <code>--zmq-pub</code>, and it runs three separate side chains: main, mini and nano.</li>
      </ul>
      <h3>XMRig, the miner most people use</h3>
      <p>
        To mine on a pool or P2Pool, you need separate mining software. <a href="https://github.com/xmrig/xmrig" rel="noopener">XMRig</a>{" "}
        is the open-source miner most guides use. It supports RandomX on CPUs and also works with GPUs. Its default developer
        donation is 1%, which you can change in its settings. Fake miners carrying malware are an easy trap, so{" "}
        <mark>download XMRig only from its official project</mark>, never from a link in a forum post or a video description.
      </p>
      <Callout kind="warn" title="Use a separate wallet for P2Pool">
        Wallet addresses are public on P2Pool, and its README recommends a new wallet for mining. Keep mining income apart from
        the wallet you use for everything else.
      </Callout>
      <DeepDive paths={["/mine-monero", "/monero-p2pool"]} />

      {/* 10 */}
      <ChapterHead n={10} id="worth-it" title="Is Monero mining worth it?" />
      <p>
        This is one of the most searched mining questions, and we will not answer it with a number. Nobody can honestly tell you
        what your machine will earn next month, and this is not financial advice. What we can give you is{" "}
        <mark>the questions that decide it</mark>:
      </p>
      <ul>
        <li><strong>What do you pay for electricity?</strong> Mining turns power into a lottery ticket. The power bill is certain; the reward is not.</li>
        <li><strong>What hardware do you already own?</strong> Buying machines to mine is a bet. Using a computer you already have is a different calculation, though it still adds to your power bill and to wear on the machine.</li>
        <li><strong>How much hashrate is the network running?</strong> Your share of rewards shrinks as more people mine, and the total changes all the time.</li>
        <li><strong>What will XMR be worth?</strong> Nobody knows. Price can move sharply in both directions.</li>
      </ul>
      <p>
        Mining calculators can turn those inputs into an estimate, but they only reflect today&apos;s inputs. Many people mine
        for a different reason: <strong>decentralization</strong>. Every independent miner, especially on P2Pool or solo, makes
        it harder for any one group to dominate. That risk is real. In 2025 an outside project called Qubic paid its users to
        mine Monero and claimed a majority of the hashrate for a period, and in September 2025 the network went through an{" "}
        <a href="https://www.theblock.co/post/370628/monero-shaken-by-block-reorg-reviving-tensions-with-qubic" rel="noopener">18-block reorganization</a>,
        though who caused it was never established.
      </p>
      <h3>A short history for nodes and miners</h3>
      <Timeline items={[
        { when: "Mar 2016", title: "Two-minute blocks", body: "The block time settles at about 120 seconds, where it is today." },
        { when: "Nov 2019", title: "RandomX", body: "Mining switches to an algorithm built for ordinary CPUs." },
        { when: "May 2020", title: "Dandelion++", body: "Version 0.16 makes it much harder to link a transaction to the IP address that sent it." },
        { when: "June 2022", title: "Tail emission", body: "The block reward settles at 0.6 XMR, so miners are always paid." },
        { when: "Aug 2022", title: "Rings of 16 and view tags", body: "Bulletproofs+ and view tags make transactions lighter and wallet syncing faster." },
        { when: "Sep 2025", title: "An 18-block reorg", body: "A deep chain reorganization renews the focus on decentralized mining." },
        { when: "Next", title: "FCMP++", body: "A planned upgrade that would replace rings with proofs over the whole chain. No date has been set.", upcoming: true },
      ]} />
      <Callout title="Mine only on hardware you own">
        Running a miner on a computer you don&apos;t own or pay for, such as a work laptop or a school lab, can break rules and
        laws. Mining on your own equipment is legal in most places, but rules differ. This is general information, not legal advice.
      </Callout>

      {/* 11 */}
      <ChapterHead n={11} id="monkstash" title="How MonkStash connects today" />
      <p>
        MonkStash is a web wallet, so it needs a node like any other wallet. Here is exactly how it works today, with nothing
        rounded up.
      </p>
      <p>
        Your keys are created and encrypted in your browser, and your wallet scans blocks on your own device. To reach the
        network, MonkStash <mark>relays your wallet&apos;s node requests</mark> through its own server to a public remote node,
        and tries the next node on its list if one is down. The relay only allows the requests a wallet needs: reading blocks,
        checking the network, and sending a finished transaction.
      </p>
      <ul>
        <li><strong>What our relay sees:</strong> your IP address and your wallet&apos;s requests to the node.</li>
        <li><strong>What the public node sees:</strong> those requests and the transactions you broadcast.</li>
        <li><strong>What neither one sees:</strong> your recovery words, your keys or your balance. Neither can spend your money.</li>
      </ul>
      <p>
        That is the same trade-off as any wallet on a remote node, and it is the right moment to be honest about it. A
        MonkStash-run node is planned, and the wallet was built so that switching nodes is a configuration change, not a new
        wallet. If you <Link href="/run-a-monero-node">run your own node</Link>, you can already <mark>point MonkStash straight at
        it</mark> under Node connection in the wallet&apos;s settings. Your browser then talks to your node directly and our relay
        is not involved at all. The node needs HTTPS (or must run on the same computer) and has to allow this site with{" "}
        <code>--rpc-access-control-origins</code>; the wallet shows the exact steps. A desktop wallet on your own node is another
        strong setup, and our <Link href="/monero-wallets">wallet comparison</Link> can help you pick one.
      </p>
      <p>
        For everyone else, you can <Link href="/create-monero-wallet">create a Monero wallet in a couple of minutes</Link>, or
        open <Link href={walletUrl}>MonkStash</Link> and restore one you already have.
      </p>
      <DeepDive paths={["/create-monero-wallet", "/monero-remote-node", "/run-a-monero-node"]} label="Your next three reads" />
    </>
  );
}
