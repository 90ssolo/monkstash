import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways, Steps, KeyFact } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { MiningFlowArt, MiningBalanceArt } from "@/components/art/HowToMineMoneroArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "mine-monero",
  section: "guides",
  kicker: "Mining",
  title: "How to Mine Monero: A Plain Guide to RandomX and XMRig",
  seoTitle: "How to Mine Monero: RandomX and XMRig Guide",
  summary: "How to mine Monero with a regular CPU: what RandomX is, the honest costs, solo, pool and P2Pool options, and where your mined XMR is paid.",
  keyword: "how to mine monero",
  updated: "2026-10-15",
  readingMinutes: 11,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "randomx", label: "Why Monero suits CPUs" },
    { id: "economics", label: "The honest economics" },
    { id: "options", label: "Solo, pool or P2Pool" },
    { id: "xmrig", label: "XMRig, the common miner" },
    { id: "setup", label: "Setup, step by step" },
    { id: "payout", label: "Where the mined XMR goes" },
    { id: "hardware", label: "Heat, noise and hardware wear" },
    { id: "legal", label: "Legal and safety notes" },
    { id: "next", label: "What to do next" },
  ],
  related: ["monero-p2pool", "run-a-monero-node", "monero-node", "monero-pruned-node", "create-monero-wallet"],
  faq: [
    { q: "Can you still mine Monero with a CPU?", a: "Yes. Monero uses an algorithm called RandomX that was built for ordinary CPUs and to resist specialised mining chips. A normal desktop processor can take part, though a single machine is a tiny share of the whole network." },
    { q: "How long does it take to mine 1 Monero?", a: "With one ordinary computer, usually years. At a network hash rate of about 5.76 GH/s (15 October 2026), a 10 kH/s machine earns about 0.00075 XMR a day on average, so roughly 3.6 years per XMR before fees and electricity. Your own numbers will differ." },
    { q: "Is Monero mining profitable?", a: "It depends on your electricity price, your hardware and the price of XMR on the day you sell, so nobody can promise it. Many home miners earn less than their power costs. Work it out with your own numbers before you start." },
    { q: "How do I mine Monero on my own computer?", a: "Create a wallet and copy its address, pick where to point your miner (a pool, P2Pool or your own node), install a miner such as XMRig from its official project page, enter your address, and start it. Then watch temperatures." },
    { q: "What is the best way to mine Monero?", a: "There is no single best way. P2Pool is the most decentralised and pays you directly. A pool gives smaller, steadier payouts. Solo mining is a lottery that only suits large setups. Pick by how much hash power you have and how much you care about decentralisation." },
    { q: "What is XMRig?", a: "XMRig is a free, open-source miner program that supports RandomX and other algorithms. It is the miner the Monero project's own pool-mining guide is written around. Download it only from its official project page." },
    { q: "Why does my antivirus flag my miner?", a: "Miner programs are also used by malware that runs on computers without permission, so security tools often flag them even when you installed one yourself. Get it from the official source, check the signature or hash, and add a targeted exclusion for that one file if you are sure. Do not turn antivirus off." },
    { q: "Where does the mined Monero go?", a: "To the wallet address you put in your miner or pool. You do not need an account anywhere. A MonkStash address or subaddress works, with the caveats about P2Pool in our P2Pool guide." },
    { q: "Is it legal to mine Monero?", a: "In most places, mining on your own hardware with your own electricity is legal, but rules vary and tax can apply. Using someone else's computer or server without permission (cryptojacking) is illegal and harmful. Check your local law." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        You can <mark>mine Monero with an ordinary desktop or laptop processor</mark>, because Monero&apos;s mining algorithm, RandomX, was
        built for CPUs. To start, you point a miner program at a pool, at <Link href="/monero-p2pool">P2Pool</Link>, or at
        your own node, and tell it which wallet address to pay. Whether that makes money is a separate question, and for most
        home setups the honest answer is &quot;probably not much&quot;. This guide shows how mining works, what it really
        costs, and how to do it safely on hardware you own.
      </p>

      <Takeaways items={[
        "Monero mining uses the RandomX algorithm, which is designed to run well on regular CPUs.",
        "You pay for electricity and wear every hour. Rewards depend on luck, network size and the XMR price, so no profit is guaranteed.",
        "Three ways to mine: solo with your own node, a pool, or P2Pool. Pick by your hash power and your view on decentralisation.",
        "Only mine on hardware you own or have written permission to use. Installing miners on other people's machines is illegal.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        Mining is how new Monero blocks get created. Computers around the world race to solve a puzzle, and the winner of each
        race adds the next block and receives the block reward. Your CPU does the guessing, a miner program manages it, and the
        reward is paid to the wallet address you set.
      </p>
      <Figure caption="Your CPU does the work. The reward, if a block is found, goes to the address you set.">
        <MiningFlowArt />
      </Figure>
      <p>
        <mark>You do not need to buy special hardware to try it</mark>. You do need to accept that one home computer is a very small part of
        the network, so your income will be small and uneven. Treat it as a way to support the network and learn how it works,
        not as a salary.
      </p>

      <h2 id="randomx">Why Monero suits CPUs</h2>
      <p>
        Most big coins are mined on specialised chips (ASICs) that outclass a normal computer many times over. Monero chose a
        different path. The{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/randomx.html" rel="noopener">Monero project describes RandomX</a>{" "}
        as a proof-of-work algorithm adopted from release 0.15, optimised for CPUs, with the goal of discouraging specialised
        hardware so mining stays spread across many people.
      </p>
      <p>
        In plain terms, RandomX makes the computer run random programs and use a lot of memory, which is exactly what a general
        purpose CPU is good at and a single-purpose chip is not. That is why <mark>an everyday CPU is the right tool for
        Monero</mark>, and why a graphics card is not the obvious upgrade it is for some other coins.
      </p>

      <h2 id="economics">The honest economics</h2>
      <p>
        Before you install anything, do the sums. <mark>You pay for every hour the machine runs</mark>. You earn only when the pool, P2Pool or
        your own node finds a block, and your share depends on how much of the network&apos;s total power is yours.
      </p>
      <Figure caption="Costs are certain. Rewards are not. Compare them with your own numbers.">
        <MiningBalanceArt />
      </Figure>
      <h3>What a block pays</h3>
      <p>
        Monero has a permanent minimum reward called{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/tail-emission.html" rel="noopener">tail emission</a>. Since the
        June 2022 (block 2,641,623), block rewards are <mark>fixed at 0.6 XMR or less per block</mark> (less when block size penalties apply). That means
        miners will keep being paid, but it also caps what any one block is worth. A new block arrives about every 2 minutes, and
        that reward is shared among everyone who contributed to the winning work.
      </p>
      <h3>How to estimate your own result</h3>
      <ol>
        <li>Find your miner&apos;s hash rate by running its built-in benchmark. Use the number it reports, not a number from a forum.</li>
        <li>Find your power draw at the wall with a plug-in meter, and your electricity price per kWh from a bill.</li>
        <li>Enter both into our <Link href="/tools/monero-mining-calculator">Monero mining calculator</Link> along with the current network hash rate and XMR price.</li>
        <li>Subtract your electricity cost from the estimated reward. <mark>If the answer is negative, mining is costing you money</mark>.</li>
      </ol>
      <h3>How long does it take to mine 1 Monero?</h3>
      <p>
        With one ordinary computer, usually years. Here is a worked example. On 15 October 2026 the{" "}
        <a href="https://xmrchain.net/" rel="noopener">xmrchain.net explorer</a> showed a network hash rate of about 5.76 GH/s.
        Take a machine that mines at 10 kH/s (an example figure; benchmark your own).
      </p>
      <ol>
        <li><strong>Your share of the network:</strong> 10,000 H/s divided by 5,756,000,000 H/s is about 0.00017%.</li>
        <li><strong>XMR mined per day by everyone:</strong> about 720 blocks (one every 2 minutes) times 0.6 XMR is 432 XMR.</li>
        <li><strong>Your expected share:</strong> 432 times 0.0000017 is about 0.00075 XMR a day.</li>
        <li><strong>Time to 1 XMR:</strong> 1 divided by 0.00075 is roughly 1,330 days, or about 3.6 years.</li>
      </ol>
      <p>
        That is an average, before pool fees and electricity, and it shifts whenever the network hash rate changes. Put in your
        own numbers with the <Link href="/tools/monero-mining-calculator">mining calculator</Link>.
      </p>
      <KeyFact label="The one rule">
        Never mine on the assumption that it will pay for itself. Decide whether you would still do it at zero profit.
      </KeyFact>
      <p>
        If the goal is just to own some Monero, <Link href="/buy-monero">buying it</Link> is usually simpler and
        cheaper than mining it.
      </p>

      <h2 id="options">Solo, pool or P2Pool</h2>
      <p>
        There are three common ways to point your miner. They differ in how often you are paid, who controls the money, and how
        much they help the network.
      </p>
      <table>
        <thead><tr><th>Method</th><th>Payouts</th><th>Trade-off</th></tr></thead>
        <tbody>
          <tr><td>Solo with your own node</td><td>Rare and large, if you ever find a block</td><td>A lottery. A small machine may go very long without a payout. Most decentralised, and you need a synced node.</td></tr>
          <tr><td>A centralised pool</td><td>Frequent and small, set by the pool</td><td>Smooth income, but the pool operator sets rules and fees, holds your balance until payout, and large pools concentrate network power.</td></tr>
          <tr><td>P2Pool</td><td>Paid directly in the block, when the pool finds one</td><td>No operator and no fee, but you run your own node and the payout address is public on its side chain.</td></tr>
        </tbody>
      </table>
      <h3>Solo mining with monerod</h3>
      <p>
        The Monero daemon, monerod, can mine by itself. Once it is fully synced, you run the{" "}
        <code>start_mining</code> command in its console with your address, and optionally a thread count. According to the{" "}
        <a href="https://docs.getmonero.org/interacting/monerod-reference/" rel="noopener">monerod reference</a>, the syntax is{" "}
        <code>start_mining &lt;addr&gt; [&lt;threads&gt;]</code>, and the block reward goes to that address. <code>stop_mining</code>{" "}
        stops it. The matching start-up option, <code>--start-mining</code>, must be given a primary address, not a subaddress.
      </p>
      <p>
        Solo mining only makes sense if you already run a node (see <Link href="/run-a-monero-node">how to run a Monero node</Link>)
        and accept very uneven results.
      </p>
      <h3>Centralised pools</h3>
      <p>
        A pool combines many miners and splits each reward by contribution, so payouts are small but regular. The Monero project
        notes that{" "}
        <a href="https://www.getmonero.org/resources/user-guides/mine-to-pool.html" rel="noopener">smaller pools help keep the network decentralised</a>,
        and that miners lose no revenue by choosing one. If you use a pool, pick a smaller one, read its payout rules, and check
        its minimum payout and fees yourself.
      </p>
      <h3>P2Pool</h3>
      <p>
        P2Pool is a pool with no central operator. It is <mark>the best fit if you care about decentralisation</mark> and are willing to run a
        node. Read the full <Link href="/monero-p2pool">P2Pool Monero guide</Link>.
      </p>

      <h2 id="xmrig">XMRig, the common miner</h2>
      <p>
        <a href="https://xmrig.com/" rel="noopener">XMRig</a> is a free, open-source (GPL-3.0) miner that supports RandomX on
        CPUs, and it is the program the Monero project&apos;s pool guide is built around. Its project page lists official binaries
        for Windows, Linux, macOS and FreeBSD, and instructions to build it from source.
      </p>
      <p>
        One detail to know: XMRig has a developer donation setting. The{" "}
        <a href="https://github.com/xmrig/xmrig" rel="noopener">project page</a> says the default is 1%, described as one minute
        in every 100, and that you can change it with the <code>donate-level</code> option. It is your choice; check the
        setting and set it to what you are comfortable with.
      </p>
      <Callout kind="warn" title="Download from the official source only">
        Fake miner downloads are <mark>a common way to spread malware</mark>. Get XMRig only from its official project page or GitHub
        releases, never from a link in a video, chat group or ad. Check the release&apos;s signature or published hash before
        you run it. We do not link to downloads here on purpose.
      </Callout>

      <h2 id="setup">Setup, step by step</h2>
      <p>This is the high-level path. Each step has its own detailed instructions on the official pages linked above.</p>
      <Steps items={[
        { title: "Create a wallet for your mining payouts", body: <>Make a wallet and save its recovery words offline. See <Link href="/create-monero-wallet">how to create a Monero wallet</Link>. Using a separate wallet or a subaddress keeps mining income apart from your other funds.</> },
        { title: "Choose where the work goes", body: <>Decide between solo, a pool or P2Pool using the table above. For P2Pool or solo you need a synced node first.</> },
        { title: "Get the miner from the official page", body: <>Download XMRig from its project page or GitHub releases, verify the signature or hash, and unpack it in its own folder.</> },
        { title: "Enter your address and destination", body: <>In the miner&apos;s config, set the pool or P2Pool address and your wallet address. Some pools need the algorithm set to <code>rx/0</code> if they do not announce it.</> },
        { title: "Allow large memory pages if you can", body: <>RandomX runs faster with huge pages, which need a system setting that differs on Windows and Linux. The miner&apos;s documentation explains it. Some tuning needs administrator rights.</> },
        { title: "Start small and watch the temperature", body: <>Run it, read the hash rate it reports, and monitor your CPU temperature for the first hour. Lower the thread count if it runs hot or the computer feels slow.</> },
      ]} />
      <Callout title="If your antivirus flags the miner">
        Mining software looks the same as malware that runs without permission, so security tools often flag it. If you installed
        it yourself from the official page and verified it, you can add a narrow exclusion for that one folder or file. Do not
        switch your antivirus off. The official wallet gets flagged for the same reason; see{" "}
        <Link href="/monero-gui-virus-warning">how to check a Monero GUI virus warning</Link>.
      </Callout>

      <h2 id="payout">Where the mined XMR goes</h2>
      <p>
        Mined coins are paid to the wallet address you enter in the miner or pool. There is no account to create. Because mined
        coins start as new coins from a block reward, they take longer to unlock: the Monero project says found blocks take
        about 60 blocks (roughly 2 hours) to mature.
      </p>
      <p>
        You can receive mining payouts in a <Link href={walletUrl}>MonkStash wallet</Link>. Give the miner your main address or a
        subaddress, and your balance will show once the wallet has scanned the payout. For solo mining with{" "}
        <code>--start-mining</code>, use a primary address. For P2Pool, follow the address rules in the{" "}
        <Link href="/monero-p2pool">P2Pool guide</Link>, since payouts are visible there. Not sure what a subaddress is?
        See <Link href="/monero-subaddress">Monero subaddresses</Link>.
      </p>

      <h2 id="hardware">Heat, noise and hardware wear</h2>
      <p>
        Mining keeps your CPU near full load all day, which is very different from normal use. Expect these effects:
      </p>
      <ul>
        <li><strong>Heat.</strong> Check temperatures. Poor airflow or a thin laptop can overheat, and that shortens a machine&apos;s life.</li>
        <li><strong>Noise.</strong> Fans spin up and stay up. A spare desktop in another room is far more pleasant than your daily laptop.</li>
        <li><strong>Power.</strong> The cost of electricity is the biggest bill, and it is easy to underestimate. Measure it at the wall.</li>
        <li><strong>Slowdowns.</strong> A fully loaded CPU makes everything else sluggish. Cap threads (for example, leave one or two free).</li>
      </ul>
      <p>
        A laptop on battery or in a bag is a poor miner. A desktop with good cooling that you can leave alone is a better
        choice, but even then, run it supervised until you trust the temperatures.
      </p>

      <h2 id="legal">Legal and safety notes</h2>
      <Callout kind="warn" title="Only mine on hardware you own or may use">
        Installing a miner on someone else&apos;s computer, phone or server without their clear permission is called cryptojacking.
        <mark>It is illegal in most places</mark>, it harms the victim through slow machines and higher bills, and it is not acceptable
        however it is explained. Use only hardware you own, or have written permission to use, including at work or school.
      </Callout>
      <p>
        In many places, mining with your own hardware is legal, but laws, electricity rules and tax treatment of mined coins
        differ. Read <Link href="/is-monero-legal">whether Monero is legal</Link> and check your own jurisdiction. If you
        mine at a rented or shared space, ask the owner first.
      </p>
      <p>
        Keep your wallet safe too. Never type your recovery words into a miner, a pool website or a calculator. A miner only needs
        your public address, never your seed. See <Link href="/monero-phishing-sites">Monero phishing sites</Link> for common
        traps.
      </p>

      <h2 id="next">What to do next</h2>
      <p>
        If you decide to go ahead, set up a wallet first, then read the <Link href="/monero-p2pool">P2Pool guide</Link> to
        see if decentralised mining suits you, or learn how to{" "}
        <Link href="/run-a-monero-node">run your own node</Link>. You can{" "}
        <Link href={walletUrl}>open a MonkStash wallet</Link> to receive payouts, and the{" "}
        <Link href="/tools/monero-address-validator">address validator</Link> helps check the address you paste into your miner.
        For more questions, see the <Link href="/faq">FAQ</Link>.
      </p>
    </>
  );
}
