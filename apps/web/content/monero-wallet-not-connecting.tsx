import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { ConnectDiagnosisFigure } from "@/components/art/MoneroWalletNotConnectingArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-wallet-not-connecting",
  section: "guides",
  kicker: "Troubleshooting",
  title: "Monero Wallet Not Connecting to Daemon? Fixes by Symptom",
  seoTitle: "Monero Wallet Not Connecting? Fixes by Symptom",
  summary: "Monero wallet not connecting to daemon? Most cases are a down node, a wrong port or network, or an SSL mismatch. Fix it in minutes, step by step.",
  keyword: "monero wallet not connecting to daemon",
  updated: "2026-10-14",
  readingMinutes: 10,
  toc: [
    { id: "meaning", label: "What the error means" },
    { id: "flow", label: "Find the cause fast" },
    { id: "node", label: "The node is down or busy" },
    { id: "port", label: "Wrong port or network" },
    { id: "ssl", label: "SSL and https mismatch" },
    { id: "blockers", label: "Firewall, VPN and Tor" },
    { id: "local", label: "Your own daemon is still syncing" },
    { id: "restricted", label: "Restricted RPC" },
    { id: "clock", label: "Date, time and old software" },
    { id: "wallets", label: "Wallet by wallet" },
    { id: "next", label: "What to do next" },
  ],
  related: ["monero-wallet-not-syncing", "monero-remote-node", "monero-node", "run-a-monero-node", "monero-wallet-not-showing-balance"],
  faq: [
    { q: "What does \"failed to connect to daemon\" mean?", a: "Your wallet could not reach the Monero node (the daemon, usually monerod) it is set to use. The node may be offline, the address or port may be wrong, or something on your device or network is blocking the connection. Your funds are not affected." },
    { q: "Why is my Monero GUI not connecting?", a: "The usual causes are a remote node that is down or overloaded, a wrong address or port in Settings, a local daemon that has not started or has not finished syncing, or a VPN or firewall in the way. Try a different remote node first." },
    { q: "What port does a Monero node use?", a: "On mainnet, the default peer-to-peer port is 18080 and the default RPC port is 18081. Public remote nodes often use 18089 for their restricted RPC. Stagenet uses 38080 and 38081 by default, and testnet uses 28080 and 28081." },
    { q: "Can a wrong network cause a connection error?", a: "Yes. A mainnet wallet cannot use a stagenet or testnet node, and the reverse. Match the network on both sides, and check the port range as a quick hint." },
    { q: "Should I turn on SSL for a remote node?", a: "Only if the node operator says it supports SSL on that port. Turning SSL on for a plain http node, or off for an https one, is a common cause of connection errors." },
    { q: "Does a connection error put my Monero at risk?", a: "No. Your coins live on the blockchain, tied to your keys. A connection error only means the wallet cannot read the network right now. Your recovery words can always restore the wallet." },
    { q: "Do I need to update my wallet to connect?", a: "Sometimes. Monero upgrades its rules through scheduled hard forks, and wallets and nodes need current software to keep working. If a node refuses an old wallet, update from the official source." },
    { q: "Is it safe to use any public node I find?", a: "A public node can see your IP address and which requests your wallet makes, even though it cannot spend your funds. Prefer a node you trust, use Tor where possible, or run your own." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        If your Monero wallet is not connecting to its daemon (the node it reads the network from), the cause is almost always one
        of a short list: the node is down or busy, the address, port or network is wrong, SSL is switched on or off by mistake, or
        something on your device or network is blocking the link. <mark>Your funds are not at risk.</mark> This page starts with
        the symptom and walks through the fixes in the order that finds the cause fastest.
      </p>

      <Takeaways items={[
        "A connection error means the wallet cannot reach its node. Your coins are untouched.",
        "Try a different node first. It separates a bad node from a bad setup in under a minute.",
        "Match the network on both sides: mainnet nodes use 18081 or 18089, stagenet nodes use 38081 or 38089.",
        "SSL must match the node. Plain http nodes need it off, https nodes need it on.",
        "This page is about not connecting. If it connects but stalls, see the syncing guide instead.",
      ]} />

      <h2 id="meaning">What the error means</h2>
      <p>
        <mark>A Monero wallet does not hold your coins</mark>. It holds keys, and it reads the blockchain through a{" "}
        <Link href="/monero-node">node</Link>. In older wallet software the node program is called the daemon, and
        the file is <code>monerod</code>. When a wallet says &quot;failed to connect to daemon&quot;, &quot;disconnected&quot;, or
        &quot;no connection to node&quot;, it tried to open that link and failed.
      </p>
      <p>
        That is a different problem from a wallet that connects but never finishes catching up. If the status shows a block counter
        that moves slowly or freezes, read <Link href="/monero-wallet-not-syncing">why a Monero wallet is not syncing</Link>.
        This page covers the step before that: getting a connection at all.
      </p>

      <h2 id="flow">Find the cause fast</h2>
      <p>
        Two quick checks split most cases in half. First, confirm that ordinary websites load on the same device. Second, point
        the wallet at a different public node. If the new node connects, <mark>the first one was the problem</mark> and you are done.
      </p>
      <Figure caption="Rule out your internet first, then swap the node. The remaining causes are settings, a blocker, or old software.">
        <ConnectDiagnosisFigure />
      </Figure>

      <table>
        <thead><tr><th>What you see</th><th>Most likely cause</th><th>Go to</th></tr></thead>
        <tbody>
          <tr><td>Worked yesterday, fails today</td><td>Node offline or overloaded</td><td>The node is down or busy</td></tr>
          <tr><td>Never connected since setup</td><td>Wrong address, port or network</td><td>Wrong port or network</td></tr>
          <tr><td>Fails only on one network or one device</td><td>VPN, firewall, Tor or captive portal</td><td>Firewall, VPN and Tor</td></tr>
          <tr><td>Own node, wallet shows disconnected</td><td>Daemon not running or still syncing</td><td>Your own daemon</td></tr>
          <tr><td>Connects, but sends or balance fail</td><td>Restricted RPC or wrong node type</td><td>Restricted RPC</td></tr>
          <tr><td>Started failing around a network upgrade</td><td>Outdated wallet or node</td><td>Date, time and old software</td></tr>
        </tbody>
      </table>

      <h2 id="node">The node is down or busy</h2>
      <p>
        Public remote nodes are run by volunteers. They go offline for maintenance, run out of connections when many wallets use
        them at once, or fall behind the network. <mark>This is the most common reason for a connection error</mark>, and the fix is to use
        another node.
      </p>
      <ol>
        <li>Open the wallet&apos;s node or network settings.</li>
        <li>Choose a different remote node. A directory such as <a href="https://monero.fail/" rel="noopener">monero.fail</a> lists public nodes and checks their health, with options for Tor and I2P.</li>
        <li>Save, then wait a few seconds for the status to change.</li>
      </ol>
      <p>
        Keep a second node noted down so you are not stuck if your usual one disappears. If you rely on a wallet daily, our guide
        to <Link href="/monero-remote-node">choosing a remote node</Link> explains what to look for.
      </p>
      <Callout kind="warn" title="Every public node can see something">
        A node you do not run can see your IP address and the requests your wallet sends. It cannot spend your coins. monero.fail
        itself warns that some public nodes may be run by parties who monitor users and recommends Tor or your own node. Treat a
        random node as a convenience, not as a private one.
      </Callout>

      <h2 id="port">Wrong port or network</h2>
      <p>
        A node is reached by an address plus a port. Wallets fail quietly when either is off by a digit, or when you point a real
        mainnet wallet at a test network. Monero runs three separate networks, each with its own default ports:
      </p>
      <table>
        <thead><tr><th>Network</th><th>Peer port</th><th>Default RPC port</th><th>Used for</th></tr></thead>
        <tbody>
          <tr><td>Mainnet</td><td>18080</td><td>18081</td><td>Real XMR</td></tr>
          <tr><td>Stagenet</td><td>38080</td><td>38081</td><td>Testing with worthless coins</td></tr>
          <tr><td>Testnet</td><td>28080</td><td>28081</td><td>Developer testing</td></tr>
        </tbody>
      </table>
      <p>
        The ports in the table are the defaults from the official{" "}
        <a href="https://docs.getmonero.org/interacting/monerod-reference/" rel="noopener">monerod reference</a>. Public remote
        nodes frequently publish a separate restricted port instead, and 18089 is a common choice on mainnet (the same pattern is
        used on stagenet with 38089). If a node&apos;s own page lists a port, use that one over the default.
      </p>
      <p>Check these in order:</p>
      <ul>
        <li><strong>Address.</strong> No spaces, no stray <code>http://</code> unless the wallet asks for the full URL, and no copied trailing slash.</li>
        <li><strong>Port.</strong> A number in the 18000 range for mainnet. A 38000 or 28000 port means you picked a test node.</li>
        <li><strong>Network.</strong> Your wallet and the node must both be mainnet. A mainnet wallet pointed at stagenet will not work, and a stagenet wallet will never show real coins.</li>
        <li><strong>Node type.</strong> A node on your own network may allow only local connections. Behind a router, the address must be reachable from where the wallet runs.</li>
      </ul>

      <h2 id="ssl">SSL and https mismatch</h2>
      <p>
        Some nodes accept encrypted connections (SSL, shown as https). Others accept only plain connections. The wallet&apos;s SSL
        setting <mark>has to agree with the node</mark>. Turn SSL on for a node that needs it, and leave it off for one that does not. A
        mismatch gives the same generic connection error as a dead node, so it is easy to misread.
      </p>
      <p>
        Cake Wallet&apos;s documentation advises enabling SSL only when the node operator says to or you know the node uses it,
        and notes that a node on a local network can fail when the SSL toggle is on by mistake. The same logic applies in other
        wallets: if the address and port look right and it still fails, check this setting before anything else.
      </p>
      <Callout title="A self-signed certificate is not the same as a broken node">
        Some home nodes use a certificate that wallets do not recognize. Wallets often have an option to accept it for a node you
        control. Only use that on your own node, never on a stranger&apos;s.
      </Callout>

      <h2 id="blockers">Firewall, VPN and Tor</h2>
      <p>
        If the node works for other people but not for you, <mark>the block is on your side</mark>. Test each of these in turn, switching it
        off briefly to see whether the wallet connects:
      </p>
      <ul>
        <li><strong>VPN.</strong> Some VPN servers block or throttle crypto traffic. Try another server or turn the VPN off for the test.</li>
        <li><strong>Tor.</strong> A wallet set to use Tor needs a working Tor connection, and a node that supports it. A clearnet node will not respond through an onion setting, and the reverse.</li>
        <li><strong>Firewall or antivirus.</strong> Allow the wallet (and <code>monerod</code> if you run it) to make outgoing connections. Security software sometimes flags Monero programs, a point the official downloads page also mentions.</li>
        <li><strong>Captive portals.</strong> Hotel, airport and cafe wifi may need a login page before any app can reach the internet.</li>
        <li><strong>Router or corporate network.</strong> Some networks block uncommon ports. Switching to mobile data is a quick test.</li>
      </ul>

      <h2 id="local">Your own daemon is still syncing</h2>
      <p>
        If you run your own node, the wallet can only use it once it is up. Check that <code>monerod</code> is running, that it
        listens on the address and port the wallet uses (the default RPC address is local only), and that it has caught up with
        the network. A freshly started node can take a long time on its first run, and a wallet connected to a node that is far
        behind will show old data or fail.
      </p>
      <p>
        If the node is not synced yet, you can point the wallet at a remote node in the meantime and switch back later. For
        setting up and maintaining your own node, see <Link href="/run-a-monero-node">how to run a Monero node</Link>.
      </p>

      <h2 id="restricted">Restricted RPC</h2>
      <p>
        A node can expose two kinds of RPC access. The full version gives complete control of the node and listens on the local
        machine only by default. The restricted version is limited to the safe commands a wallet needs, and is what public nodes
        should offer. The official docs describe the restricted option as limiting the API to view-only commands. If a wallet
        connects but certain actions fail, you may have the wrong one:
      </p>
      <ul>
        <li>For a wallet on another machine, use the node&apos;s restricted address and port, not the local-only one.</li>
        <li>If you run the node, bind the restricted port for outside access rather than opening the full one to your network.</li>
        <li><mark>Never expose the full, unrestricted RPC to the internet</mark>.</li>
      </ul>

      <h2 id="clock">Date, time and old software</h2>
      <p>
        Two quiet causes are worth a minute. A badly wrong system clock can break encrypted connections, so make sure automatic
        date and time is on. And old software can stop working after a network upgrade: Monero changes its rules through
        scheduled hard forks, and the project says users and services should run current software before each one. A wallet or
        node that is many versions old may be refused by the network. Update from the official{" "}
        <a href="https://www.getmonero.org/downloads/" rel="noopener">downloads page</a>, and verify the file as it describes.
      </p>

      <h2 id="wallets">Wallet by wallet</h2>
      <h3>Monero GUI</h3>
      <p>
        According to the official remote node guide, custom remote nodes need Advanced mode. In <strong>Settings, then Node</strong>,
        choose <strong>Remote Node</strong>, enter the address and port, add a username and password only if the node needs them,
        and press <strong>Connect</strong>. For your own node, choose the local option and make sure <code>monerod</code> is running.
        Menu wording can shift between versions, so use this as a guide, not a script.
      </p>
      <h3>Monero CLI wallet</h3>
      <p>
        Start the wallet with <code>--daemon-address host:port</code>. Add <code>--stagenet</code> or <code>--testnet</code> only
        when the daemon is on that network, and leave both off for mainnet. The CLI reference says the default daemon port is
        18081 when you do not set one.
      </p>
      <h3>Feather</h3>
      <p>
        Feather&apos;s documentation says it connects to a random node from a curated list unless you change it, and that you
        can manage nodes under <strong>Settings, Network, Nodes</strong>. If one node fails, pick another from the list.
      </p>
      <h3>Cake Wallet</h3>
      <p>
        Cake Wallet&apos;s documentation places node management under <strong>Nodes</strong> in its settings, and says you can
        also tap the sync status bar on the home screen. Add a node with the plus button, set address, port and SSL to match the
        node, and tick &quot;Trusted&quot; only for your own node.
      </p>
      <h3>MonkStash</h3>
      <p>
        <Link href={walletUrl}>MonkStash</Link> connects through its own node connection automatically, so there is no address or
        port to type. If the connection fails, the dashboard shows <strong>Sync stopped</strong> with a <strong>Retry</strong>{" "}
        button. Press Retry once; the cause is usually a node that was briefly unavailable. If it keeps failing, check your internet
        and any VPN, then try again. Your recovery words are untouched, and you can restore on another device any time (see{" "}
        <Link href="/restore-monero-wallet">restoring a wallet</Link>). MonkStash is an early preview and has not yet been
        independently audited.
      </p>

      <h2 id="next">What to do next</h2>
      <p>
        Once the wallet connects, give it a moment to scan. If the balance then looks wrong, read{" "}
        <Link href="/monero-wallet-not-showing-balance">why a Monero balance shows zero</Link>. To understand what you
        were connecting to, see <Link href="/monero-node">what a Monero node is</Link>, and if you want a connection
        that depends on no one else, <Link href="/run-a-monero-node">run your own</Link>. Still stuck? Visit{" "}
        <Link href="/support">support</Link> or the <Link href="/faq">FAQ</Link>, and never share your recovery words with
        anyone who offers help.
      </p>
    </>
  );
}
