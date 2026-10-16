import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { IlloNode } from "@/components/art/Illustrations";

export const meta: ArticleMeta = {
  slug: "monero-remote-node",
  section: "guides",
  kicker: "Nodes",
  title: "Monero Remote Nodes: How to Choose and Use One Safely",
  seoTitle: "Monero Remote Node: How to Choose One Safely",
  summary: "A Monero remote node lets your wallet work without downloading the blockchain. Here is how to pick a reliable one, connect, and keep your privacy.",
  keyword: "monero remote node",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "what", label: "What a remote node is" },
    { id: "when", label: "When a remote node makes sense" },
    { id: "choose", label: "How to choose one" },
    { id: "connect", label: "How to connect" },
    { id: "privacy", label: "What a remote node can see" },
    { id: "tor", label: "Using Tor for more privacy" },
    { id: "compare", label: "Remote node vs your own node" },
    { id: "trouble", label: "If a node misbehaves" },
    { id: "easier", label: "The easier path" },
  ],
  related: ["monero-node", "monero-wallet-not-syncing", "create-monero-wallet", "monero-light-wallet"],
  sources: [
    { label: "Moneropedia: Remote Node", href: "https://www.getmonero.org/resources/moneropedia/remote-node.html" },
    { label: "Monero user guide: how to use a remote node in the GUI wallet", href: "https://www.getmonero.org/resources/user-guides/remote_node_gui.html" },
    { label: "monerod reference: ports, restricted RPC and public node flags", href: "https://docs.getmonero.org/interacting/monerod-reference/" },
  ],
  faq: [
    { q: "What is a Monero remote node?", a: "A remote node is a Monero node run by someone else that your wallet connects to for blockchain data. It saves you from downloading and storing the whole blockchain yourself." },
    { q: "Are public Monero remote nodes safe?", a: "A remote node cannot touch your keys or funds. The main trade-off is that it can see your IP address and the transactions you broadcast. Using a node over Tor, or running your own, reduces this." },
    { q: "What is the default port for a Monero remote node?", a: "Public nodes commonly use port 18081 for the restricted RPC that wallets connect to. Some use other ports, so use the exact address and port listed by the node operator." },
    { q: "How do I find a Monero remote node?", a: "Community-maintained lists of public nodes exist, and many wallets include a built-in list. Prefer nodes with good uptime, and test a few. Use a node on the correct network: mainnet for real XMR." },
    { q: "Can a remote node see my balance?", a: "No. The node does not receive your private keys, so it cannot decode which outputs are yours or what your balance is. It does see the requests your wallet makes and your IP address." },
    { q: "Should I use a remote node over Tor?", a: "If hiding your IP address from the node matters to you, yes. Tor adds some delay, so connections can be slower. Make sure you use an address from a node that supports it." },
    { q: "Why does my wallet keep losing its remote node?", a: "Public nodes can go offline, get overloaded, or change address. Switching to another node usually fixes it. A wallet that rotates nodes automatically avoids the problem." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A remote node is what <mark>lets a Monero wallet work in seconds instead of hours</mark>. Rather than downloading the entire blockchain,
        your wallet asks a node that someone else already runs. This guide covers when that is a good idea, how to pick a reliable
        one, how to connect, and what you are actually giving away when you do. It is honest about the privacy trade-offs, because
        they matter.
      </p>

      <Takeaways items={[
        "A remote node serves blockchain data so you do not have to download it.",
        "Choose one with good uptime, on the right network, and switch if it is slow or stuck.",
        "A remote node sees your IP address but never your keys or funds.",
        "Connecting over Tor, or running your own node, improves privacy.",
      ]} />

      <h2 id="what">What a remote node is</h2>
      <p>
        A <Link href="/monero-node">node</Link> stores the Monero blockchain and serves it to wallets. A remote
        node is simply one that someone else runs and allows others to connect to. Your wallet uses it to find your payments and
        to send transactions. <mark>Your keys stay on your device the whole time</mark>.
      </p>
      <Figure caption="The node supplies blockchain data and relays your transactions. Your wallet keeps the keys.">
        <IlloNode />
      </Figure>

      <h2 id="when">When a remote node makes sense</h2>
      <p>
        A remote node is a good choice for most everyday users. It makes sense when:
      </p>
      <ul>
        <li>You want to start right away and not wait for a blockchain download.</li>
        <li>Your device has limited storage, such as a phone or a small laptop.</li>
        <li>You are using a web or <Link href="/monero-light-wallet">light wallet</Link>, which is designed around remote nodes.</li>
        <li>You are testing with small amounts and do not need maximum privacy.</li>
      </ul>
      <p>
        It makes less sense <mark>if you are holding a large amount</mark>, if you are in a situation where your IP address being linked to
        your wallet is a serious problem, or if you simply want to depend on nobody else. In those cases, consider running your
        own node.
      </p>

      <h2 id="choose">How to choose one</h2>
      <p>Not all remote nodes are equal. A good one is:</p>
      <ul>
        <li><strong>Reliable.</strong> High uptime means your wallet is not left waiting. If a node is slow or unreachable, pick another.</li>
        <li><strong>On the right network.</strong> Use a mainnet node for real Monero, and a stagenet or testnet node only for testing. Mixing them up shows a confusing empty balance.</li>
        <li><strong>Up to date.</strong> A node running an old version may fall out of step with the network after an upgrade.</li>
        <li><strong>Reasonably trusted.</strong> <mark>You are sharing your IP and broadcasting through it</mark>, so prefer a node run by someone or a project you have some reason to trust.</li>
        <li><strong>Reachable the way you need.</strong> If you want to use Tor, choose a node that offers an onion address.</li>
      </ul>
      <p>
        It is fine to try a few. If one works well, keep it. If it keeps stalling, move on.
      </p>

      <h2 id="connect">How to connect</h2>
      <p>
        In a desktop wallet, you enter the node&apos;s address and port in the settings, usually under a node or daemon section.
        Public nodes commonly use port 18081 for wallet connections, but always use the exact address and port given by the node
        operator or list. Community lists of public nodes exist if you need one.
      </p>
      <ol>
        <li>Open your wallet&apos;s settings and find the node or daemon section.</li>
        <li>Choose to connect to a remote node, and enter the address and port.</li>
        <li>Save, then wait for the wallet to connect and show the current block height.</li>
        <li>If the wallet does not connect, try a different node before changing anything else.</li>
      </ol>
      <p>
        If payments are not showing up or the wallet is stuck, <mark>changing the node is the first thing to try</mark>. See{" "}
        <Link href="/monero-wallet-not-syncing">fixing a wallet that will not sync</Link> for the full checklist.
      </p>

      <h2 id="privacy">What a remote node can see</h2>
      <p>
        A remote node cannot see your balance, your history, or your keys, and <mark>it cannot spend your money</mark>. It can see your IP
        address, the fact that your wallet is connecting, and the transactions you send through it. A node run by a bad actor
        could, in theory, try to guess which transactions come from which IP address.
      </p>
      <p>
        This is <mark>a privacy cost, not a security cost</mark> for your funds. For many people it is acceptable. For others it is not, and
        that is a personal call.
      </p>
      <Callout kind="warn" title="Only your own node is fully private">
        Any remote node, however trustworthy, is still a third party that sees your connection. For the strongest privacy, running
        your own node is the only way to avoid that entirely.
      </Callout>

      <h2 id="tor">Using Tor for more privacy</h2>
      <p>
        Tor is a network that hides your real IP address by sending your traffic through several relays. If you connect to a
        remote node over Tor, the node sees a Tor address instead of yours. Some nodes publish an onion address for this purpose.
        Some wallets support it in their settings.
      </p>
      <p>
        Tor has trade-offs: it is slower, and a poor connection can make syncing feel stuck. If you hit problems, test without it
        to see whether it is the cause. Only use onion addresses you got from a source you trust.
      </p>

      <h2 id="compare">Remote node vs your own node</h2>
      <table>
        <thead><tr><th>&nbsp;</th><th>Remote node</th><th>Your own node</th></tr></thead>
        <tbody>
          <tr><td>Time to start</td><td>Seconds</td><td>Hours to days</td></tr>
          <tr><td>Storage</td><td>None</td><td>Large</td></tr>
          <tr><td>Node sees your IP</td><td>Yes (unless using Tor)</td><td>No third party</td></tr>
          <tr><td>Reliability</td><td>Depends on the operator</td><td>Depends on you</td></tr>
          <tr><td>Cost</td><td>Free to use</td><td>Hardware and bandwidth</td></tr>
        </tbody>
      </table>
      <p>
        Neither option is wrong. Many people start with a remote node, then run their own once they hold more or care more about
        privacy. The official <a href="https://docs.getmonero.org/" rel="noopener">Monero documentation</a> explains how to set up
        your own.
      </p>

      <h2 id="trouble">If a node misbehaves</h2>
      <p>
        Public nodes are run by volunteers, so they come and go. If your wallet loses its connection, shows an old height, or
        fails to send, the usual fix is to switch to another node. <mark>A node cannot steal your Monero</mark>, so the worst outcome from a
        bad one is slow or stalled behavior. If the same problem follows you across several nodes, the cause is probably your own
        connection, VPN, or wallet version.
      </p>

      <h2 id="easier">The easier path</h2>
      <p>
        If choosing and managing nodes sounds like a chore, a web wallet does it for you. MonkStash connects to a node on your
        behalf and automatically switches to another if one is unavailable, so there is nothing to configure. You can{" "}
        <Link href="/create-monero-wallet">create a wallet</Link> and start without ever touching node settings. If you want
        to understand more first, read <Link href="/monero-node">what a Monero node is</Link> or browse our{" "}
        <Link href="/learn">guides</Link>.
      </p>
    </>
  );
}
