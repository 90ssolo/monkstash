import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways, KeyFact } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { FeatherKeysArt, FeatherTorModesArt } from "@/components/art/FeatherWalletReviewArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "feather-wallet-review",
  section: "wallets",
  kicker: "Wallet review",
  title: "Feather Wallet Review: Features, Safety and Who It Fits",
  seoTitle: "Feather Wallet Review: Features and Safety",
  summary: "Feather wallet review: a free, open source Monero desktop wallet with Tor, Polyseed and Ledger and Trezor support. Features, trade-offs and who it fits.",
  keyword: "Feather wallet review",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "what", label: "What Feather is" },
    { id: "strengths", label: "What Feather does well" },
    { id: "seeds", label: "Polyseed and other seed words" },
    { id: "tor", label: "Tor and node choice" },
    { id: "hardware", label: "Hardware wallets, coin control and multisig" },
    { id: "download", label: "How to download Feather safely" },
    { id: "safe", label: "Is Feather wallet safe?" },
    { id: "tradeoffs", label: "Trade-offs" },
    { id: "compare", label: "Feather vs Monero GUI vs MonkStash" },
    { id: "who", label: "Who should use Feather" },
    { id: "sources", label: "Sources checked" },
  ],
  related: ["monero-gui-vs-cli", "cake-wallet-review", "safest-monero-wallet", "restore-monero-wallet"],
  faq: [
    { q: "Is Feather wallet safe?", a: "Feather is free, open source software that keeps your keys on your own computer, and it publishes signed releases and build instructions. No wallet is risk free. Download it only from the official site, verify the signature, and keep large amounts on a hardware wallet. MonkStash has not audited Feather, and this review does not replace your own checks." },
    { q: "Is Feather wallet the official Monero wallet?", a: "No. The official wallets from the Monero project are the GUI and the CLI. Feather is an independent open source desktop wallet that the official downloads page lists among third-party wallets." },
    { q: "What is the difference between Feather and the Monero GUI?", a: "The GUI is the official wallet and includes a local node manager. Feather is smaller and faster to start, has Tor built in, and creates Polyseed wallets by default. Feather's own comparison table lists no local node manager and no multisig yet." },
    { q: "Does Feather wallet support Polyseed?", a: "Yes. Polyseed is the default seed type in Feather, and the documentation says it can also restore 14 and 25 word seeds." },
    { q: "Does Feather work with Ledger and Trezor?", a: "Yes. Feather's documentation lists Ledger Nano S, S Plus and X, and Trezor Model T and Safe 3. The Monero project's downloads page lists the same families and also names the Trezor Safe 5. Check firmware requirements before you buy." },
    { q: "Does Feather have a mobile app?", a: "No. The Feather site lists Linux, Tails, Windows and macOS only. For a phone, look at other wallets, or use a browser wallet." },
    { q: "Does Feather use Tor by default?", a: "Feather ships with a Tor binary and, by default, sends its traffic over Tor except for wallet synchronization, which is heavy and slow over Tor. You can change the mode in the network settings." },
    { q: "Can I run my own node with Feather?", a: "You can connect Feather to a node you run. Feather detects a local node on the default port but does not install or manage one for you, unlike the official GUI." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        Feather is a <mark>free, open source Monero desktop wallet</mark> for Linux, Tails, Windows and macOS. It is small, quick to start, has
        Tor built in, and works with Ledger and Trezor devices. This Feather wallet review covers what it does well, where it
        falls short, how to download it safely, and who should pick it over the official Monero GUI or a browser wallet like
        MonkStash.
      </p>

      <Callout title="Disclosure">
        MonkStash makes a Monero wallet too, so we are not a neutral party. This review is based on Feather&apos;s official
        documentation, its source repository and other public information, not on paid placement, and we received nothing from its
        developers. We did not run a hands-on test. Facts were last checked on 15 October 2026, and features change, so confirm
        anything important with the sources linked below.
      </Callout>

      <Takeaways items={[
        "Feather is a desktop-only, open source (BSD-3-Clause) Monero wallet. It is not the official Monero wallet.",
        "Strengths: fast start, Tor built in, Polyseed by default, Ledger and Trezor support, strong coin control.",
        "Gaps: no phone app, no multisig yet, no local node manager (you bring your own node if you want one).",
        "Choose it if you use a computer, want Tor, or use a hardware wallet. Choose MonkStash if you want nothing to install.",
      ]} />

      <h2 id="what">What Feather is</h2>
      <p>
        Feather is a desktop wallet written in C++ with the Qt toolkit. Its site describes it as beginner friendly while also
        serving advanced users, with a feature set &quot;on par with the official CLI,&quot; and its{" "}
        <a href="https://github.com/feather-wallet/feather" rel="noopener">source code is public on GitHub</a> under the
        BSD-3-Clause license. The Monero project&apos;s own{" "}
        <a href="https://www.getmonero.org/downloads/" rel="noopener">downloads page</a> lists Feather among third-party wallets,
        and notes that those wallets are not managed by the Monero core team.
      </p>
      <p>
        The Feather site does not name a company or a person behind the project, so we will not either. What you can check is the
        public repository, its release history and the signing key described below. That is a reason to be careful with the
        download, not a reason to dismiss the software.
      </p>
      <p>
        Feather is a &quot;local synchronization&quot; wallet. It connects to a Monero node, then scans the blockchain on your
        computer using your keys, <mark>so the node does not receive your keys</mark>. If that sounds new, read{" "}
        <Link href="/monero-node">what a Monero node is</Link> and{" "}
        <Link href="/monero-light-wallet">how light wallets work</Link>.
      </p>

      <h2 id="strengths">What Feather does well</h2>
      <ul>
        <li><strong>Quick and light.</strong> Feather aims to be small and fast, and it runs on modest machines, virtual machines and live systems such as Tails.</li>
        <li><strong>Tor built in.</strong> <mark>Tor ships inside the release</mark>, so there is nothing extra to install. More on this below.</li>
        <li><strong>Hardware wallet support.</strong> It works with supported Ledger and Trezor models.</li>
        <li><strong>Serious coin control.</strong> You can freeze and thaw outputs, pick which outputs to spend, label them, split outputs and sweep.</li>
        <li><strong>Offline signing.</strong> Feather supports signing on an offline machine, and its documentation says it is the only one of the three desktop wallets it compares that supports animated QR codes for this.</li>
        <li><strong>View-only wallets.</strong> You can watch a wallet without being able to spend, which helps on a machine you trust less. See <Link href="/monero-view-only-wallet">view-only wallets</Link>.</li>
        <li><strong>Sensible defaults.</strong> The site says it ships with defaults that can be tightened for high-threat use.</li>
      </ul>

      <Figure caption="Where the keys live. On its own, Feather holds them encrypted on your computer. With a hardware wallet, they stay on the device.">
        <FeatherKeysArt />
      </Figure>

      <h2 id="seeds">Polyseed and other seed words</h2>
      <p>
        New Feather wallets use <strong>Polyseed</strong> by default, a newer 16-word seed format. Feather&apos;s documentation also
        says it can restore 14 and 25 word seeds. The 25-word format is the classic Monero seed that the official GUI and CLI
        use, so you can bring a standard wallet into Feather. It also has a guide for recovering a damaged Polyseed.
      </p>
      <p>
        One practical point: <mark>count your words before you move between wallets</mark>. A 16-word Polyseed and a 25-word seed are different
        formats, and not every wallet reads both. Our <Link href="/monero-seed-phrase">seed phrase guide</Link> and the{" "}
        <Link href="/restore-monero-wallet">restore guide</Link> explain the difference. MonkStash uses 25-word seeds, which
        Feather can restore.
      </p>
      <Callout kind="warn" title="Thirteen-word MyMonero seeds">
        Feather&apos;s documentation lists Polyseed plus 14 and 25 word seeds and does not mention 13-word MyMonero seeds. If you have one,
        see <Link href="/restore-mymonero-seed">how to restore a MyMonero seed</Link> instead of guessing.
      </Callout>

      <h2 id="tor">Tor and node choice</h2>
      <p>
        Feather bundles a Tor binary. If it does not find a Tor daemon already running on the usual port, it starts its own copy.
        The documentation describes three modes: never over Tor, Tor for everything except wallet synchronization (the default),
        and always over Tor. The default leaves out synchronization because it moves a lot of data and is very slow over Tor.
      </p>
      <Figure caption="Feather's three Tor modes, paraphrased from its documentation. The default keeps wallet sync off Tor to stay fast.">
        <FeatherTorModesArt />
      </Figure>
      <p>
        On Tails and Whonix, or when started with torsocks, everything goes through Tor regardless of settings. Traffic to a local
        node is never sent over Tor.
      </p>
      <p>
        For nodes, Feather has a built-in list run by its team and trusted community members and picks one at random by default.
        You can type in a custom remote node, or point it at a node on your own machine. Feather detects a local node but does not
        run one for you. A remote node <mark>can see that your IP address is asking questions</mark> even though it never gets your keys, which
        is why the Tor option and your own node both matter. We explain the trade-offs in{" "}
        <Link href="/monero-remote-node">using a remote node</Link>.
      </p>

      <h2 id="hardware">Hardware wallets, coin control and multisig</h2>
      <p>
        Feather&apos;s feature table lists <strong>Ledger Nano S, S Plus and X</strong> and{" "}
        <strong>Trezor Model T and Safe 3</strong>. The Monero project&apos;s downloads page lists the same families for Feather and
        also names the Trezor Safe 5, with minimum firmware versions. Always check the current requirements before you buy a
        device. Our <Link href="/monero-wallets/hardware">hardware wallet page</Link> has the wider picture.
      </p>
      <p>
        <strong>Coin control</strong> is <mark>one of Feather&apos;s clear advantages</mark>. The documentation lists freeze and thaw, sweeping
        single or multiple outputs, output splitting, manual input selection and coin labeling. Several of these are listed as
        Feather-only compared with the official GUI.
      </p>
      <p>
        <strong>Multisig</strong> is marked &quot;not yet&quot; for Feather and available only in the CLI. If you need a shared
        wallet that needs several signers, Feather is not the tool today.
      </p>

      <h2 id="download">How to download Feather safely</h2>
      <p>
        Search results for any Monero wallet include look-alike sites. Feather publishes the same checks you should do for any
        wallet, and they take a few minutes:
      </p>
      <ol>
        <li>Go to the address you trust from a bookmark or from the Monero project&apos;s downloads page, not from an ad. Read the address bar.</li>
        <li>Download the build for your system. The site offers Linux (AppImage, standalone and Flatpak), Windows (installer or standalone) and macOS (Intel and Apple Silicon), plus the source.</li>
        <li>Download the matching PGP signature. Every download has one, and there is a GPG-signed list of hashes.</li>
        <li>Get the release signing key from the project repository or the official site, then compare its fingerprint with the one in <a href="https://docs.featherwallet.org/guides/release-signing-key" rel="noopener">Feather&apos;s signing key guide</a> and the other places it lists.</li>
        <li>Verify the signature before you run the file. If anything does not match, stop and do not open it.</li>
      </ol>
      <p>
        The repository also describes release builds you can reproduce yourself with Guix (a build system), and a separate
        repository of signed attestations. That lets technical readers confirm that the published binary matches the source,
        which very few wallets offer. Most people will not do this, and <mark>checking the signature is the practical step</mark>.
      </p>
      <KeyFact label="Rule of thumb"><mark>Never type recovery words</mark> into a program or site you reached through an ad or a message.</KeyFact>

      <h2 id="safe">Is Feather wallet safe?</h2>
      <p>
        Feather is non-custodial: it keeps your keys on your computer, and the code is public so others can inspect it. It
        publishes signed releases and build instructions. Those are good signs, but they are not an audit, and we have not
        audited it. Treat the answer as &quot;<mark>reasonable if you download and verify it properly</mark>.&quot;
      </p>
      <p>
        The bigger risks are not in the code. A computer with malware can steal wallet files, and a fake download can steal a
        seed. For anything you cannot afford to lose, use Feather with a hardware wallet, and back up your seed on paper. See{" "}
        <Link href="/back-up-monero-wallet">how to back up a Monero wallet</Link> and{" "}
        <Link href="/monero-phishing-sites">how to spot fake Monero sites</Link>.
      </p>

      <h2 id="tradeoffs">Trade-offs</h2>
      <table>
        <thead><tr><th>Pros</th><th>Cons</th></tr></thead>
        <tbody>
          <tr><td>Free and open source (BSD-3-Clause)</td><td>Desktop only: no phone app</td></tr>
          <tr><td>Tor included and on by default for most traffic</td><td>Not the official Monero wallet</td></tr>
          <tr><td>Polyseed by default, restores 14 and 25 word seeds</td><td>No multisig yet</td></tr>
          <tr><td>Ledger and Trezor support</td><td>No local node manager; your own node takes extra setup</td></tr>
          <tr><td>Detailed coin control and offline signing</td><td>Needs an install and a signature check to download safely</td></tr>
          <tr><td>Signed releases and Guix build instructions</td><td>Maintainers are not named on the site</td></tr>
        </tbody>
      </table>

      <h2 id="compare">Feather vs Monero GUI vs MonkStash</h2>
      <p>
        These three overlap less than they seem. Feather and the GUI are installed programs for a computer. MonkStash runs in a
        browser tab, so it asks nothing of your machine but also gives you fewer controls.
      </p>
      <table>
        <thead><tr><th>Feature</th><th>Feather</th><th>Monero GUI</th><th>MonkStash</th></tr></thead>
        <tbody>
          <tr><td>Type</td><td>Desktop app</td><td>Desktop app (official)</td><td>Web wallet</td></tr>
          <tr><td>Install needed</td><td>Yes</td><td>Yes</td><td>No</td></tr>
          <tr><td>Seed words</td><td>16 (Polyseed); restores 14 and 25</td><td>25</td><td>25</td></tr>
          <tr><td>Tor built in</td><td>Yes</td><td>No (proxy supported)</td><td>No</td></tr>
          <tr><td>Hardware wallets</td><td>Ledger, Trezor</td><td>Ledger, Trezor</td><td>Not supported</td></tr>
          <tr><td>Coin control</td><td>Extensive</td><td>Partial</td><td>Not offered</td></tr>
          <tr><td>Local node manager</td><td>No</td><td>Yes</td><td>No (uses a node you pick)</td></tr>
          <tr><td>Multisig</td><td>Not yet</td><td>Not in GUI (CLI only)</td><td>No</td></tr>
          <tr><td>Independent audit</td><td>Check the project</td><td>Check the project</td><td>Not yet (early preview)</td></tr>
        </tbody>
      </table>
      <p>
        The GUI and Feather columns come from Feather&apos;s own comparison table and the Monero downloads page, so treat them as
        a snapshot. The MonkStash column is ours. Our <Link href="/monero-wallets/desktop">desktop wallets page</Link> compares
        more options, and the <Link href="/monero-wallets/monero-gui-vs-cli">GUI vs CLI guide</Link> covers the official pair.
      </p>

      <h2 id="who">Who should use Feather</h2>
      <p><strong>Pick Feather instead of MonkStash if:</strong></p>
      <ul>
        <li>You use a computer and want Tor built in.</li>
        <li>You own, or plan to buy, a Ledger or Trezor and want a companion wallet for it.</li>
        <li>You want detailed coin control, labels or offline signing.</li>
        <li>You want a wallet whose code and release builds you can verify yourself.</li>
      </ul>
      <p><strong>Pick MonkStash instead if:</strong></p>
      <ul>
        <li>You want to start in a couple of minutes with nothing to install, including on a computer you do not own.</li>
        <li>You are trying Monero with a small amount and do not need advanced controls.</li>
      </ul>
      <p><strong>Pick something else if</strong> you want a phone app (see <Link href="/monero-wallets/android">Android</Link> and <Link href="/monero-wallets/iphone">iPhone</Link> options), or a full node managed for you, in which case the official GUI fits better. Many people use two wallets: Feather or a hardware wallet for savings, and a small browser wallet for everyday use. The <Link href="/monero-wallets">full wallet comparison</Link> and our guide to the <Link href="/monero-wallets/safest-monero-wallet">safest Monero wallet</Link> help you decide.
      </p>
      <p>
        Want to try the browser route? <Link href={walletUrl}>Open MonkStash</Link>, and keep it to small amounts while it is an
        early preview.
      </p>

      <h2 id="sources">Sources checked</h2>
      <p>
        Official Feather site and documentation (<a href="https://featherwallet.org/" rel="noopener">featherwallet.org</a>,{" "}
        <a href="https://docs.featherwallet.org/guides/features" rel="noopener">features comparison</a>), the{" "}
        <a href="https://github.com/feather-wallet/feather" rel="noopener">Feather repository</a>, and the Monero project&apos;s{" "}
        <a href="https://www.getmonero.org/downloads/" rel="noopener">downloads page</a>, all checked on 15 October 2026.
      </p>
    </>
  );
}
