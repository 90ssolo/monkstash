import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { TwoDoorsFigure, WhichOneFigure } from "@/components/art/MoneroGuiVsCliArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-gui-vs-cli",
  section: "wallets",
  kicker: "Official wallets compared",
  title: "Monero GUI vs CLI: Which Official Wallet Should You Use?",
  seoTitle: "Monero GUI vs CLI: Which Official Wallet?",
  summary: "Monero GUI vs CLI: the GUI is the point-and-click wallet with simple and advanced modes, the CLI suits scripts and servers. Who each fits, side by side.",
  keyword: "Monero GUI vs CLI",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "same", label: "What they have in common" },
    { id: "gui", label: "The Monero GUI" },
    { id: "modes", label: "Simple mode and advanced mode" },
    { id: "cli", label: "The command line wallet" },
    { id: "tasks", label: "Common tasks side by side" },
    { id: "compare", label: "Comparison table" },
    { id: "safe", label: "Download and verify safely" },
    { id: "others", label: "Where Feather and MonkStash fit" },
  ],
  related: ["safest-monero-wallet", "feather-wallet-review", "monero-gui-virus-warning"],
  faq: [
    { q: "What is the difference between the Monero GUI and CLI?", a: "Both are official wallets from the Monero project and work with the same 25-word seed. The GUI has windows and buttons. The CLI, monero-wallet-cli, is operated by typing commands and is suited to servers, scripts and people comfortable in a terminal." },
    { q: "Which is better for beginners, GUI or CLI?", a: "The GUI. It shows your balance and history, and its simple mode handles the node connection for you. Use the CLI only if you are comfortable with a terminal." },
    { q: "Can I use the same wallet in the GUI and the CLI?", a: "Yes. Both read the same kind of wallet and the same 25-word seed, so you can restore a wallet made in one inside the other. Do not open the same wallet file in both at once." },
    { q: "What is simple mode in the Monero GUI?", a: "A guided mode that sets up the node connection for you. The official guide notes that simple mode and simple mode (bootstrap) cannot use a custom remote node. For that you need advanced mode." },
    { q: "How do I run my own node with the Monero GUI?", a: "Switch to advanced mode, then use the option to start a local node in Settings. It downloads and verifies the whole blockchain, which takes time and disk space. A pruned node reduces the space needed." },
    { q: "What is monero-wallet-rpc?", a: "A program that exposes wallet functions through a JSON-RPC interface over HTTP. It is meant for developers who want to automate wallet tasks. It does not store the blockchain, so it needs a node to talk to." },
    { q: "How do I prove a Monero payment?", a: "You need the transaction ID, the recipient address and the transaction key or a payment proof. The GUI has a Prove/Check page under Advanced, and the CLI has get_tx_key, check_tx_key, get_tx_proof and check_tx_proof." },
    { q: "Is the Monero GUI safe to download?", a: "Yes, from getmonero.org, after you verify the download with the published hashes. Some antivirus tools flag Monero programs, which the Monero site acknowledges. Verify the file rather than guess." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <mark>Monero GUI vs CLI comes down to how you like to work.</mark> The GUI is the official wallet with windows, buttons and
        a built-in way to run your own node. The CLI, <code>monero-wallet-cli</code>, is the same kind of wallet operated by
        typing commands, which is what you want on a server or in a script. Both are made by the Monero project and use the same
        25-word seed.
      </p>
      <p>
        <mark>If you are not sure, start with the GUI</mark>. This guide explains both, compares common tasks with the real command names, and
        says where Feather and MonkStash fit.
      </p>

      <Takeaways items={[
        "Both wallets are official, open source and use the same 25-word seed.",
        "The GUI is the right start for almost everyone. It has simple and advanced modes.",
        "The CLI and monero-wallet-rpc are for terminals, servers and automation.",
        "Download from getmonero.org and verify the hash, whichever you pick.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        Pick the GUI if you want to see a balance, click Send and optionally run a node on the same computer. Pick the CLI if you
        already live in a terminal, run a headless machine, or need to drive a wallet from a program. There is no difference in
        the coins, and <mark>no wallet is faster at moving them</mark>.
      </p>
      <Figure caption="Two front doors to the same wallet format and the same network.">
        <TwoDoorsFigure />
      </Figure>

      <h2 id="same">What they have in common</h2>
      <ul>
        <li>Both come from the Monero project and are downloaded from <a href="https://www.getmonero.org/downloads/" rel="noopener">getmonero.org</a>.</li>
        <li>Both use the standard 25-word seed, so <mark>a wallet made in one restores in the other</mark>. See <Link href="/monero-seed-phrase">what the seed is</Link>.</li>
        <li>Both can create view-only wallets and work with supported Ledger and Trezor devices.</li>
        <li>Both need a node to talk to, either your own or a remote one. See <Link href="/monero-node">what a node is</Link>.</li>
      </ul>

      <h2 id="gui">The Monero GUI</h2>
      <p>
        The GUI is the graphical wallet. You get a balance screen, history, settings, and tools for proving
        payments, all in one window. It is the wallet to choose when you want to learn how Monero works or run your own node.
      </p>
      <p>
        It runs on Windows, macOS and Linux. It is larger than Feather and busier on screen, which is the cost of having everything
        in one place. The project lists blockchain pruning as a feature, so a local node can use less disk.
      </p>

      <h2 id="modes">Simple mode and advanced mode</h2>
      <p>
        The GUI has wallet modes. Per the Monero project&apos;s remote node guide, there are two simple modes (simple and simple
        (bootstrap)) and an advanced mode. You can check which one you are in under Settings, then Info, at the wallet mode entry.
      </p>
      <ul>
        <li><strong>Simple modes</strong> keep the node setup out of your way. They do not support a custom remote node, according to the official guide.</li>
        <li><strong>Advanced mode</strong> opens the settings. You can use a custom remote node, start a local node, and use more tools.</li>
      </ul>
      <p>
        To switch, close the wallet in Settings, then use the change wallet mode button on the welcome screen. Which node you use matters:
        the project warns that some public remote nodes are operated by people <mark>trying to weaken user privacy</mark>, and it recommends
        your own node or one you trust. Read the <Link href="/monero-remote-node">remote node guide</Link> for the trade-offs.
      </p>

      <h2 id="cli">The command line wallet</h2>
      <p>
        <code>monero-wallet-cli</code> has no windows. You type commands and read the answers. That sounds harsh, but it is
        <mark>small, scriptable, runs on a server over SSH</mark>, and builds for more systems than the GUI, including FreeBSD.
      </p>
      <p>
        A companion program, <code>monero-wallet-rpc</code>, exposes the wallet through JSON-RPC over HTTP so programs can use it.
        The official docs describe it as meant for developers building thin interfaces or automation. It needs a node because it
        does not store the blockchain, and the docs recommend a login for real use (<code>--rpc-login</code>).
      </p>
      <p>
        Both CLI tools get no hand-holding. A typo in an address is your problem, so check addresses with
        the <Link href="/tools/monero-address-validator">address validator</Link> first.
      </p>

      <h2 id="tasks">Common tasks side by side</h2>
      <p>
        These command names come from the Monero documentation. File paths and addresses are placeholders.
      </p>
      <table>
        <thead><tr><th>Task</th><th>In the GUI</th><th>In monero-wallet-cli</th></tr></thead>
        <tbody>
          <tr>
            <td>Create a wallet</td>
            <td>Create a new wallet on the welcome screen, then write down the seed</td>
            <td><code>monero-wallet-cli --generate-new-wallet /path/to/wallet</code>, then <code>seed</code></td>
          </tr>
          <tr>
            <td>Restore from seed</td>
            <td>Restore a wallet from the welcome screen, with your seed and an optional restore height</td>
            <td><code>--restore-deterministic-wallet</code> with <code>--restore-height</code></td>
          </tr>
          <tr>
            <td>Choose a node</td>
            <td>Settings, Node, in advanced mode</td>
            <td><code>--daemon-address host:port</code></td>
          </tr>
          <tr>
            <td>Send</td>
            <td>The Send page</td>
            <td><code>transfer ADDRESS AMOUNT</code></td>
          </tr>
          <tr>
            <td>See history</td>
            <td>The History page</td>
            <td><code>show_transfers</code></td>
          </tr>
          <tr>
            <td>Prove a payment</td>
            <td>Advanced, then Prove/Check</td>
            <td><code>get_tx_key</code> and <code>check_tx_key</code>, or <code>get_tx_proof</code> and <code>check_tx_proof</code></td>
          </tr>
          <tr>
            <td>View-only wallet</td>
            <td>Restore a wallet from keys, using the address and view key</td>
            <td><code>--generate-from-view-key</code></td>
          </tr>
          <tr>
            <td>Show the view key</td>
            <td>In the wallet&apos;s settings (check the current menu)</td>
            <td><code>viewkey</code></td>
          </tr>
        </tbody>
      </table>
      <Callout title="Proofs are saved at send time">
        A transaction key is kept only on the device that sent the payment. The official docs warn that a successful check shows
        an amount was sent to an address, not that the funds are still spendable. <mark>Save a proof when you need one</mark>, and read the{" "}
        <a href="https://www.getmonero.org/resources/user-guides/prove-payment.html" rel="noopener">official prove-a-payment guide</a>.
      </Callout>
      <p>
        For more on each task, see <Link href="/restore-monero-wallet">restoring a wallet</Link>, <Link href="/monero-view-only-wallet">view-only wallets</Link> and{" "}
        <Link href="/monero-restore-height">restore height</Link>.
      </p>

      <h2 id="compare">Comparison table</h2>
      <table>
        <thead><tr><th></th><th>Monero GUI</th><th>monero-wallet-cli</th></tr></thead>
        <tbody>
          <tr><td>Interface</td><td>Graphical</td><td>Typed commands</td></tr>
          <tr><td>Best for</td><td>Most people, running a node</td><td>Terminal users, servers</td></tr>
          <tr><td>Learning curve</td><td>Moderate</td><td>Steeper</td></tr>
          <tr><td>Own node</td><td>Built in (advanced mode)</td><td>Run monerod yourself</td></tr>
          <tr><td>Automation</td><td>No</td><td>Yes, via monero-wallet-rpc</td></tr>
          <tr><td>Platforms</td><td>Windows, macOS, Linux</td><td>Windows, macOS, Linux, FreeBSD</td></tr>
          <tr><td>Seed</td><td>25 words</td><td>25 words</td></tr>
          <tr><td>Hardware wallets</td><td>Ledger, Trezor (supported models)</td><td>Ledger, Trezor (supported models)</td></tr>
        </tbody>
      </table>
      <Figure caption="A quick chooser. Neither official wallet is more private or more secure by itself.">
        <WhichOneFigure />
      </Figure>

      <h2 id="safe">Download and verify safely</h2>
      <p>
        Fake Monero wallets are common. Go to <a href="https://www.getmonero.org/downloads/" rel="noopener">getmonero.org/downloads</a> by typing it or from a trusted
        bookmark. The site strongly advises verifying the archive hash, calls its GPG-signed hashes file canonical, and links
        verification guides for Windows beginners and for advanced users.
      </p>
      <p>
        The site also notes that some antivirus and firewall software may flag the Monero executables. That is covered in{" "}
        <Link href="/monero-gui-virus-warning">what to do about a Monero GUI virus warning</Link>.
      </p>

      <h2 id="others">Where Feather and MonkStash fit</h2>
      <p>
        <strong>Feather</strong> is a lighter desktop wallet that aims to match the official CLI&apos;s features while being friendlier
        to start with. Read our <Link href="/monero-wallets/feather-wallet-review">Feather wallet review</Link>. Choose it when the GUI feels heavy.
        See <Link href="/monero-wallets/desktop">all desktop options</Link>.
      </p>
      <p>
        <strong>MonkStash</strong> is not a desktop program. It is a free browser wallet for small, everyday amounts, an early
        preview that has not been independently audited. If you want maximum control or a hardware wallet, the official GUI or
        Feather is the better home for savings. <Link href={walletUrl}>Open MonkStash</Link> to try Monero first, then step up when your balance grows.
        Our guide to the <Link href="/monero-wallets/safest-monero-wallet">safest Monero wallet</Link> shows how to match your setup to your amount.
      </p>
    </>
  );
}
