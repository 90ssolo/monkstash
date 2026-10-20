import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways, Steps, KeyFact } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { P2poolPayoutArt, SideChainChoiceArt } from "@/components/art/MoneroP2poolArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-p2pool",
  section: "guides",
  kicker: "Mining",
  title: "P2Pool Monero: How the Decentralized Mining Pool Works",
  seoTitle: "P2Pool Monero: How the Decentralized Pool Works",
  summary: "P2Pool Monero explained: a decentralized mining pool with no operator that pays you straight from the block. Main, mini and nano, setup and privacy.",
  keyword: "p2pool monero",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "what", label: "What P2Pool is" },
    { id: "why", label: "Why it matters for Monero" },
    { id: "chains", label: "Main, mini and nano" },
    { id: "needs", label: "What you need" },
    { id: "setup", label: "Setup, step by step" },
    { id: "payouts", label: "How payouts work" },
    { id: "address", label: "Your payout address is public" },
    { id: "problems", label: "Common problems" },
    { id: "next", label: "What to do next" },
  ],
  related: ["mine-monero", "run-a-monero-node", "monero-subaddress", "monero-pruned-node", "monero-node"],
  faq: [
    { q: "What is P2Pool for Monero?", a: "P2Pool is a decentralized mining pool for Monero. It has no central server and no pool wallet. Miners work together on a separate side chain, and when the pool finds a real Monero block, the reward is split inside that block and paid directly to each miner's wallet." },
    { q: "What is the difference between P2Pool main, mini and nano?", a: "They are three separate side chains. Main is the default. Mini and nano are for smaller miners, because they help you find shares more often. You pick one with a flag when starting P2Pool: --mini or --nano. You cannot use both at once." },
    { q: "Which P2Pool chain should I use?", a: "Use P2Pool's own share time calculator. If your expected time to find a share is more than a day on main, its authors recommend switching to mini or nano." },
    { q: "Do I need to run my own Monero node for P2Pool?", a: "Yes. P2Pool connects to your own synced monerod, with ZMQ publishing turned on. This is part of why it is more decentralized than a normal pool." },
    { q: "Can I use a subaddress with P2Pool?", a: "Yes, with an extra flag. Give your main address with --wallet and the subaddress with --subaddress. A plain address starting with 4 works without it." },
    { q: "Does P2Pool charge a fee?", a: "The project states 0% fee and no payout fee. You still pay the electricity to mine and the normal network fee when you later spend your XMR." },
    { q: "Is P2Pool private?", a: "Not for the payout address. Your wallet address and your mining activity are visible on the P2Pool side chain, and public sites show stats for it. Use a dedicated wallet for mining." },
    { q: "How long until I get paid?", a: "It depends on your hash rate and luck. You need to find a share and then the pool needs to find a Monero block while your share is still in the payout window. For small miners that can take days." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        P2Pool is <mark>a decentralized mining pool for Monero</mark>. There is no pool operator, no central server and no pool wallet:
        miners work together on a small side chain, and when it finds a real Monero block, the reward goes straight to each
        miner&apos;s own wallet. This guide explains how P2Pool works, which of its three chains to choose, what you need to run
        it, and one privacy point you should know before you point your wallet address at it.
      </p>

      <Takeaways items={[
        "P2Pool has no operator, no pool wallet and no fee. The block itself pays your wallet.",
        "Pick main, mini or nano by how often your hardware would find a share. Smaller machines belong on mini or nano.",
        "You need your own synced monerod with ZMQ publishing turned on.",
        "Payout addresses are public on the P2Pool side chain, so use a dedicated mining wallet.",
      ]} />

      <h2 id="what">What P2Pool is</h2>
      <p>
        In a normal mining pool, a company runs a server. Miners send their work to it, it receives the block reward, and later it
        sends each miner a payout. <mark>You have to trust the operator</mark> to count your work honestly and to pay you.
      </p>
      <p>
        The{" "}
        <a href="https://github.com/SChernykh/p2pool" rel="noopener">P2Pool project</a> removes that middle step. It describes
        itself as a decentralized pool with no central server and no pool wallet, where every pool block pays miners directly.
        Each miner runs P2Pool software next to their own Monero node. P2Pool keeps its own small blockchain, called a side chain,
        where miners record <mark>shares</mark>: smaller pieces of proof that they did real mining work.
      </p>
      <Figure caption="Shares build up on the side chain. When one is lucky enough to be a real Monero block, the reward is split inside that block and paid to each miner.">
        <P2poolPayoutArt />
      </Figure>
      <p>
        When a share also meets the difficulty of the main Monero network, it becomes a real Monero block. The reward in that
        block is already divided between the miners whose shares are in a recent window, so every winner is paid from the same
        block, with no one holding the money first.
      </p>

      <h2 id="why">Why it matters for Monero</h2>
      <p>
        Monero stays safe from attacks when mining power is spread across many independent people. If a few large pools control
        most of the power, they could in theory work together against the network, and a pool operator also becomes a place where
        mistakes, outages or pressure can hit everyone at once. The Monero project&apos;s own mining guide{" "}
        <a href="https://www.getmonero.org/resources/user-guides/mine-to-pool.html" rel="noopener">encourages smaller pools</a>{" "}
        for this reason.
      </p>
      <p>
        P2Pool goes further than a small pool. <mark>There is no operator to shut down or lean on</mark>, and every miner builds their own
        block template from their own node. That keeps decisions about which transactions go into a block in the hands of many
        people, which is closer to what Monero is meant to be. For the basics of mining, see{" "}
        <Link href="/mine-monero">how to mine Monero</Link>.
      </p>

      <h2 id="chains">Main, mini and nano</h2>
      <p>
        P2Pool runs three separate side chains. They work the same way but have different share difficulties, which changes how
        often a small miner finds a share. The project&apos;s readme lists them:
      </p>
      <table>
        <thead><tr><th>Chain</th><th>How to select it</th><th>Best for</th></tr></thead>
        <tbody>
          <tr><td>Main</td><td>Default, no flag</td><td>Bigger setups that find shares often enough</td></tr>
          <tr><td>Mini</td><td><code>--mini</code></td><td>Smaller machines that would find shares too rarely on main</td></tr>
          <tr><td>Nano</td><td><code>--nano</code></td><td>The smallest miners</td></tr>
        </tbody>
      </table>
      <p>
        You can run only one chain at a time. The readme notes that mini and nano cannot be combined.
      </p>
      <Figure caption="Smaller miners should pick a smaller chain, so they find shares often enough to be counted.">
        <SideChainChoiceArt />
      </Figure>
      <h3>How to choose</h3>
      <p>
        The project does not give a fixed hash rate cut-off. Its advice is to use the{" "}
        <a href="https://p2pool.io/" rel="noopener">average share time calculator</a> linked from the P2Pool site: enter your
        hash rate and see how long it takes to find a share on the main chain. If that is more than a day, switch to mini or
        nano. Use the calculator with your real benchmark number, not a guess.
      </p>
      <KeyFact label="Why it matters">
        If your shares are too rare, <mark>they may drop out of the payout window</mark> before the pool finds a Monero block, and you
        receive nothing for that work.
      </KeyFact>

      <h2 id="needs">What you need</h2>
      <ul>
        <li><strong>Your own synced Monero node.</strong> P2Pool needs monerod 0.18.0.0 or newer, fully synced. See <Link href="/run-a-monero-node">how to run a Monero node</Link>. If disk space is tight, read about <Link href="/monero-pruned-node">pruned nodes</Link> and check the P2Pool readme for whether one is supported.</li>
        <li><strong>ZMQ publishing on.</strong> Start monerod with <code>--zmq-pub tcp://127.0.0.1:18083</code>, which P2Pool requires.</li>
        <li><strong>A miner.</strong> Commonly XMRig, as covered in the <Link href="/mine-monero">mining guide</Link>.</li>
        <li><strong>A wallet address.</strong> A fresh address in a wallet you control, discussed below.</li>
        <li><strong>Open ports.</strong> For good peer connections, forward the Monero port (18080) and the port of your chosen P2Pool chain. Main uses 37889, mini 37888 and nano 37890.</li>
      </ul>
      <p>
        The readme also recommends flags such as <code>--enforce-dns-checkpointing</code> and <code>--enable-dns-blocklist</code>{" "}
        for monerod, plus <code>--out-peers 32 --in-peers 64</code> if you have enough upload bandwidth (lower numbers for slow
        connections). Check the current readme before you copy any flags, because recommendations change.
      </p>

      <h2 id="setup">Setup, step by step</h2>
      <p>This is the high-level order of operations. Follow the readme for exact commands on your system.</p>
      <Steps items={[
        { title: "Make a fresh mining wallet", body: <>Create a wallet only for mining so your main funds are not linked to it. See the address note below and <Link href="/create-monero-wallet">how to create a Monero wallet</Link>.</> },
        { title: "Start monerod with ZMQ", body: <>Run your node with <code>--zmq-pub tcp://127.0.0.1:18083</code> plus the other flags you chose. Wait for it to fully sync before anything else.</> },
        { title: "Start P2Pool", body: <>Run <code>./p2pool --host 127.0.0.1 --wallet YOUR_ADDRESS</code>, adding <code>--mini</code> or <code>--nano</code> if you picked a smaller chain. The first sync of the side chain takes a few minutes.</> },
        { title: "Point XMRig at P2Pool", body: <>Once P2Pool has synced, set your miner to connect to <code>127.0.0.1:3333</code>. P2Pool acts as a local pool that your miner talks to.</> },
        { title: "Watch for your first share", body: <>Look at the P2Pool console for accepted shares. You can also check progress on a P2Pool observer site by entering your address, though your stats appear only after you have mined at least one share.</> },
      ]} />
      <p>
        As in the{" "}
        <Link href="/mine-monero">main mining guide</Link>: only mine on hardware you own or may use, and download
        P2Pool and XMRig only from their official projects.
      </p>

      <h2 id="payouts">How payouts work</h2>
      <p>
        P2Pool pays by a scheme called PPLNS, pay per last N shares. When the pool finds a Monero block, the reward is divided
        among the miners who have shares in a recent window, in proportion to the difficulty of their shares. The readme says that
        window holds up to 2160 side chain blocks, about 6 hours, and adjusts automatically.
      </p>
      <ul>
        <li><strong>No pending balance.</strong> There is nothing waiting in an account. <mark>You are paid only when a block is found</mark> and your share is still in the window.</li>
        <li><strong>A minimum payout.</strong> The readme gives the smallest possible payout as the block reward divided by 2160, which is about 0.00027 XMR at the current reward. Smaller shares simply do not appear in that block.</li>
        <li><strong>Variance.</strong> Small miners can wait days to a week between payouts, according to the project&apos;s site. That is luck, not a fault.</li>
        <li><strong>Maturity.</strong> A found block needs about 60 blocks (roughly 2 hours) to mature before you can spend the reward.</li>
      </ul>
      <Callout title="Wallets may need to scan carefully">
        P2Pool payouts are created inside the block, and some wallets without P2Pool support may not show them. The project says
        Monero CLI and GUI from v0.18.1.0 onward do. If a payout looks missing, check with a current wallet and make sure the
        scan has reached the block.
      </Callout>
      <p>
        P2Pool states a 0% fee. You still pay your own electricity, and the usual{" "}
        <Link href="/monero-transaction-fee">transaction fee</Link> when you later spend the coins.
      </p>

      <h2 id="address">Your payout address is public</h2>
      <p>
        This is the one thing many guides skip. Because P2Pool&apos;s side chain is public, <mark>the address you mine to is public</mark>
        there too. Anyone can look up that address on a P2Pool observer site and see your shares and the blocks that paid you.
        P2Pool&apos;s own start guide tells you to create a new wallet for mining for this reason.
      </p>
      <h3>Primary address or subaddress</h3>
      <p>
        By default P2Pool mines to a primary address, which starts with 4. According to the readme, you can also use a
        subaddress (which starts with 8): pass your main address with <code>--wallet</code> and the subaddress with{" "}
        <code>--subaddress</code>. See <Link href="/monero-subaddress">what a subaddress is</Link>. A subaddress helps
        keep payouts separate within a wallet, but the wallet itself is still the one you are tied to.
      </p>
      <Callout kind="warn" title="Use a dedicated wallet">
        <mark>Do not mine to the same wallet</mark> you use for private spending. Create a separate one, and treat the payout address as
        public. Moving coins out afterwards is normal Monero spending, but your mining history is still visible on the side chain.
      </Callout>
      <p>
        You can create that wallet in <Link href={walletUrl}>MonkStash</Link>. Validate the address you paste with the{" "}
        <Link href="/tools/monero-address-validator">address validator</Link> before starting, since a typo sends rewards to the
        wrong place.
      </p>

      <h2 id="problems">Common problems</h2>
      <table>
        <thead><tr><th>Symptom</th><th>Likely cause</th></tr></thead>
        <tbody>
          <tr><td>P2Pool cannot connect to monerod</td><td>Node not fully synced, wrong <code>--host</code>, or ZMQ not enabled</td></tr>
          <tr><td>No shares for a long time</td><td>Hash rate too low for the chain; try mini or nano</td></tr>
          <tr><td>Miner is slow</td><td>Huge pages not enabled, or too many threads for your cooling</td></tr>
          <tr><td>Payout not visible in a wallet</td><td>The wallet is not yet synced past the block, or does not support P2Pool payouts</td></tr>
          <tr><td>Few peers</td><td>Ports are not open or forwarded</td></tr>
        </tbody>
      </table>

      <h2 id="next">What to do next</h2>
      <p>
        If you have not started yet, read <Link href="/mine-monero">how to mine Monero</Link> for the costs and
        the safety notes, and decide whether the numbers make sense for you. If you want to learn more about nodes,{" "}
        <Link href="/monero-node">what a Monero node is</Link> is a gentle start. When you are ready,{" "}
        <Link href={walletUrl}>open a wallet</Link> for your payouts. More questions? See the <Link href="/faq">FAQ</Link>.
      </p>
    </>
  );
}
