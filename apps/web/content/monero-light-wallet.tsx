import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { ThreeModelsArt } from "@/components/art/MoneroLightWalletArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-light-wallet",
  section: "learn",
  kicker: "Wallet types",
  title: "Monero Light Wallet: What It Is and How It Differs From a Remote Node",
  seoTitle: "Monero Light Wallet vs Remote Node, Explained",
  summary: "A Monero light wallet lets a server scan the chain for you using your view key. Compare it with full node and remote node wallets on privacy and trust.",
  keyword: "Monero light wallet",
  updated: "2026-10-14",
  readingMinutes: 9,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "problem", label: "The problem every wallet has to solve" },
    { id: "models", label: "The three wallet models" },
    { id: "lws", label: "How a light wallet server works" },
    { id: "remote", label: "Remote node wallets are different" },
    { id: "compare", label: "Side by side comparison" },
    { id: "monkstash", label: "Where MonkStash fits" },
    { id: "choose", label: "How to choose" },
    { id: "safe", label: "Using a light wallet more safely" },
  ],
  related: ["monero-node", "monero-remote-node", "monero-view-key", "run-a-monero-node", "is-monero-web-wallet-safe"],
  faq: [
    { q: "What is a Monero light wallet?", a: "A light wallet hands the heavy work of finding your payments to a server. You give the server your private view key, it scans the blockchain for you, and your wallet only downloads the results. Your spend key stays on your device." },
    { q: "Is a light wallet the same as a remote node wallet?", a: "No. A remote node wallet downloads blocks from someone's node and does the scanning itself, so the node never receives your keys. A light wallet server wallet gives the server your view key so the server can scan for you." },
    { q: "Can a light wallet server steal my Monero?", a: "No. A view key lets someone see incoming payments, but not spend them. The spend key never leaves your device. The server can, however, see the payments your wallet receives, and may be able to work out some of your spends, which is a real privacy cost." },
    { q: "What is monero-lws?", a: "Monero LWS is an open source light wallet server, written to be compatible with the MyMonero API. It stores the view keys that clients send it and scans the chain in the background. It is a separate project from the core Monero software." },
    { q: "Is MonkStash a light wallet?", a: "Not in the light wallet server sense. MonkStash keeps your view key in your browser and does the scanning there. It connects to a Monero node to read blocks, like a remote node wallet." },
    { q: "Is a light wallet faster than a remote node wallet?", a: "Usually the first sync is faster, because the server has already been scanning and can answer quickly. The trade is that you share your view key with whoever runs it." },
    { q: "Was MyMonero a light wallet?", a: "Yes. MyMonero used a light wallet server design, and its own materials described the view key as the thing sent to its server. MyMonero shut down on 6 January 2026." },
    { q: "Which Monero wallet type is the most private?", a: "A wallet connected to your own full node, because no third party sees your requests. Next is a remote node wallet that scans locally. A light wallet server is the least private, because the server holds your view key." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A Monero light wallet is a wallet that <mark>lets a server do the slow part of the work</mark>. You give the server your private view
        key, it scans the blockchain for payments that belong to you, and your wallet just downloads the answer. It is quick, but
        the server can see your incoming payments. A remote node wallet, like MonkStash, works differently and does not share
        your view key.
      </p>

      <Takeaways items={[
        "A light wallet server scans the chain for you using your view key. That is fast, and it means the server can see your incoming payments.",
        "A remote node wallet downloads blocks and scans them itself, so the node never receives your keys.",
        "Neither a light wallet server nor a remote node can spend your money. The spend key stays with you.",
        "MonkStash is not a light wallet server design. Your view key stays in your browser.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        &quot;Light wallet&quot; is used loosely, so people mean different things by it. In Monero there are really three ways a wallet
        can find your money, and they differ in who learns what. The version that most people mean by &quot;Monero light wallet&quot; is the
        one where <mark>a server holds your view key and scans for you</mark>. That is what MyMonero did.
      </p>
      <p>
        If you came here wondering whether a light wallet is safe, the honest answer is: <mark>it cannot steal your coins</mark>, but it knows
        your incoming payment history. Whether that matters depends on what you are protecting.
      </p>

      <h2 id="problem">The problem every wallet has to solve</h2>
      <p>
        Monero hides who paid whom, so there is no public list that says &quot;this address owns that coin&quot;. To find your money, a
        wallet has to go through the blocks and test each new output with your private view key. If the key fits, the payment is
        yours. This is the scan, and it is why a new or restored wallet needs time to sync. See{" "}
        <Link href="/monero-restore-height">restore height</Link> for how to shorten the scan, and{" "}
        <Link href="/monero-view-key">what a view key is</Link> for what the key can and cannot do.
      </p>
      <p>
        The question that separates the three wallet models is simple: <strong>who does the scanning, and where does the view key
        live?</strong>
      </p>

      <h2 id="models">The three wallet models</h2>
      <Figure caption="The same job, three ways. The difference is where the view key goes.">
        <ThreeModelsArt />
      </Figure>
      <h3>1. Full node wallet</h3>
      <p>
        Your wallet connects to a Monero node that you run yourself, on your own computer or server. The node holds a full copy of
        the blockchain. Nobody else sees your requests. This is the most private option and the most demanding: it needs disk space,
        bandwidth, and time. See <Link href="/run-a-monero-node">how to run a Monero node</Link>.
      </p>
      <h3>2. Remote node wallet</h3>
      <p>
        Your wallet connects to a node run by someone else. It downloads the blocks and scans them itself, on your device. The node
        never receives your keys. It can see that your device is connecting, and the requests it makes, so you still trust it with
        some metadata (for example your IP address). Read{" "}
        <Link href="/monero-remote-node">how remote nodes work</Link> for the details.
      </p>
      <h3>3. Light wallet server wallet</h3>
      <p>
        Your wallet sends your view key to a light wallet server. The server scans the chain on your behalf, keeps track of your
        incoming payments, and answers your wallet when it asks. Your wallet still builds and signs transactions locally, so the
        spend key stays with you.
      </p>

      <h2 id="lws">How a Monero light wallet server works</h2>
      <p>
        The open source project for this is <a href="https://github.com/vtnerd/monero-lws" rel="noopener">monero-lws</a>, a light
        wallet server written to be compatible with the MyMonero API. Per its repository, clients send their view key through a
        REST API, the server stores those keys in a database, and it scans the chain in the background for incoming
        transactions. It talks to a normal Monero node (<code>monerod</code>) to read blocks. It is released under the BSD-3-Clause
        licence and is not part of the core Monero software.
      </p>
      <h3>What the server can and cannot do</h3>
      <ul>
        <li><strong>It can</strong> see the payments your wallet receives, with their amounts, for as long as it holds your key, including past ones.</li>
        <li><strong>It cannot</strong> spend your funds. Spending needs the spend key, which stays on your device.</li>
        <li><strong>It may be able to</strong> link your wallet to your IP address and to the times you check in.</li>
      </ul>
      <p>
        Privacy Guides summarised the trade in one line: the view key &quot;does grant the server operator the ability to see all your
        transactions&quot; but not to spend them (
        <a href="https://www.privacyguides.org/news/2025/11/24/magic-grants-releases-monero-light-wallet-app-for-android/" rel="noopener">source</a>
        ). That is why the safest way to use a light wallet is <mark>to run the server yourself</mark>, or to point it at one run by someone you trust.
      </p>
      <p>
        The same view key rule explains a common surprise: nobody can look up a Monero balance from an address alone. Our guide
        on <Link href="/check-monero-balance">how to check a Monero balance</Link> shows the private ways to do it.
      </p>
      <Callout title="MyMonero and the end of the big hosted option">
        MyMonero was the best known light wallet server wallet. It shut down on 6 January 2026, and
        search results for its name are now crowded with phishing copies. If you are looking for it, read{" "}
        <Link href="/monero-phishing-sites">how to spot Monero phishing sites</Link> and, if you have its words,{" "}
        <Link href="/restore-mymonero-seed">restoring a MyMonero seed</Link>.
      </Callout>

      <h2 id="remote">Remote node wallets are different</h2>
      <p>
        This is the confusion that trips people up. A remote node and a light wallet server both involve someone else&apos;s
        computer, but they receive very different things.
      </p>
      <ul>
        <li>A <strong>remote node</strong> serves public blockchain data to anyone. Your wallet fetches blocks and finds your payments on your side. The node does not hold or see your view key.</li>
        <li>A <strong>light wallet server</strong> is given your view key and does the finding for you.</li>
      </ul>
      <p>
        The remote node approach is slower, because your device has to scan the blocks. The upside is that <mark>you gave away no key</mark>.
        Monero&apos;s own wallets use this approach when pointed at a remote node, and so does MonkStash.
      </p>

      <h3>What a remote node can still learn</h3>
      <p>
        Not sharing a key does not make a remote node blind. The node sees your IP address unless you hide it, sees when you
        connect, and sees the transaction you ask it to relay when you send. It does not learn your view key, your balance, or
        which outputs are yours, because the wallet fetches blocks and checks them locally. If your threat model includes the node
        operator, connect through a network that hides your IP, or run your own node.
      </p>
      <p>
        A light wallet server learns more. Because it holds the view key, it can match every incoming payment to your wallet on its
        own, and it can keep that record as long as it likes.
      </p>

      <h2 id="compare">Side by side comparison</h2>
      <table>
        <thead><tr><th></th><th>Full node wallet</th><th>Remote node wallet</th><th>Light wallet server</th></tr></thead>
        <tbody>
          <tr><td>Who scans the chain</td><td>Your wallet, using your own node</td><td>Your wallet</td><td>The server</td></tr>
          <tr><td>Who holds your view key</td><td>Only you</td><td>Only you</td><td>You and the server</td></tr>
          <tr><td>Can it spend your funds</td><td>No one but you</td><td>No one but you</td><td>No one but you</td></tr>
          <tr><td>What a third party learns</td><td>Nothing</td><td>Your IP and requests (the node)</td><td>Your incoming payments, plus your IP</td></tr>
          <tr><td>First sync speed</td><td>Slow, plus waiting for the node to sync</td><td>Moderate; depends on restore height</td><td>Fastest</td></tr>
          <tr><td>Storage on your device</td><td>The full chain on your node machine</td><td>Little</td><td>Little</td></tr>
          <tr><td>Trust needed</td><td>Yourself</td><td>The node, for metadata</td><td>The server, for your history</td></tr>
          <tr><td>Best for</td><td>Maximum privacy</td><td>Everyday use without a node</td><td>Low power devices, trusted server</td></tr>
        </tbody>
      </table>
      <p>
        Storage numbers change as the chain grows, so we do not quote one. Check the current size on{" "}
        <a href="https://www.getmonero.org/downloads/" rel="noopener">getmonero.org</a> before you plan a full node.
      </p>

      <h2 id="monkstash">Where MonkStash fits</h2>
      <p>
        MonkStash is a remote node wallet, not a light wallet server wallet. Your recovery words and keys are created and encrypted
        on your device, and the wallet scans blocks in your browser. It connects to a Monero node to read the chain. <mark>No
        MonkStash server ever receives your view key</mark>, because there is no MonkStash server that scans for you. It runs in an
        ordinary browser tab, so there is no <Link href="/monero-chrome-extension">browser extension</Link> to install first.
      </p>
      <p>
        The cost of that choice is time. A restored wallet has to scan, which is why a restore height speeds things up (see{" "}
        <Link href="/restore-monero-wallet">restoring a wallet</Link>). The node you connect to can see your IP and
        request pattern, which is an honest trade-off we explain in{" "}
        <Link href="/monero-node">what a Monero node is</Link>. When we add the option to use your own node, that
        becomes a configuration change, not a different wallet.
      </p>
      <p>
        You can see how it compares with others on the <Link href="/monero-wallets">Monero wallets</Link> page, or read about{" "}
        <Link href="/mymonero-alternative">replacing MyMonero</Link>.
      </p>

      <h2 id="choose">How to choose</h2>
      <ul>
        <li><strong>You want the strongest privacy:</strong> run your own node and connect a wallet to it.</li>
        <li><strong>You want a simple wallet with no key handed over:</strong> use a remote node wallet.</li>
        <li><strong>You use a weak device and trust the server operator:</strong> a light wallet server can be reasonable, ideally one you or someone close to you runs.</li>
        <li><strong>You do not know the operator:</strong> do not give your view key to a public light wallet server for a wallet that holds anything significant.</li>
      </ul>

      <h2 id="safe">Using a light wallet more safely</h2>
      <ol>
        <li>Use a fresh wallet for the light wallet, not your main savings wallet.</li>
        <li>Prefer a server you run, or one run by someone you can name.</li>
        <li>Remember that <mark>handing over a view key is not undoable</mark>. The server may keep your history even if you stop using the wallet.</li>
        <li>Never type your recovery words into a website that is not the wallet you set up. See <Link href="/monero-seed-phrase">what a Monero seed phrase is</Link>.</li>
      </ol>
      <p>
        Want a wallet that keeps the view key with you? <Link href={walletUrl}>Open a MonkStash wallet</Link>, and read{" "}
        <Link href="/is-monero-safe">whether Monero is safe</Link> for the wider picture.
      </p>
    </>
  );
}
