import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways, KeyFact } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { CakeKeysAndSwapArt, CakeAppsArt } from "@/components/art/CakeWalletReviewArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "cake-wallet-review",
  section: "wallets",
  kicker: "Wallet review",
  title: "Cake Wallet Review: Monero Features, Safety and Trade-offs",
  seoTitle: "Cake Wallet Review: Monero Features and Safety",
  summary: "Cake Wallet review: an open source, non-custodial wallet for Monero and other coins on Android, iOS and desktop. Features, swaps, MyMonero and who it fits.",
  keyword: "Cake Wallet review",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "what", label: "What Cake Wallet is" },
    { id: "monero", label: "Cake Wallet vs Monero.com" },
    { id: "strengths", label: "What Cake Wallet does well" },
    { id: "seeds", label: "Seed formats" },
    { id: "privacy", label: "Tor, nodes and hardware wallets" },
    { id: "swaps", label: "Built-in swaps and buying" },
    { id: "mymonero", label: "Cake Wallet and MyMonero" },
    { id: "safe", label: "Is Cake Wallet safe?" },
    { id: "tradeoffs", label: "Trade-offs" },
    { id: "compare", label: "Cake Wallet vs MonkStash" },
    { id: "who", label: "Who should use Cake Wallet" },
    { id: "sources", label: "Sources checked" },
  ],
  related: ["feather-wallet-review", "safest-monero-wallet", "restore-mymonero-seed", "monero-light-wallet"],
  faq: [
    { q: "Is Cake Wallet safe?", a: "Cake Wallet is open source (MIT license) and non-custodial, so your keys stay on your device. That is a good foundation, but no wallet is risk free. Install it only from the official site or store listings, back up your seed on paper, and note that built-in swaps involve third-party providers. MonkStash has not audited Cake Wallet." },
    { q: "Is Cake Wallet non-custodial?", a: "Yes. Cake Wallet and its Monero.com app describe themselves as non-custodial, meaning you hold your own keys and seed. The swap and buy features use outside providers, and those providers have their own rules." },
    { q: "Does Cake Wallet support Monero?", a: "Yes. Monero is the coin Cake Wallet started with, and it sits alongside Bitcoin, Ethereum, Litecoin and many others. Cake Labs also makes Monero.com, a separate Monero-only app." },
    { q: "Is Cake Wallet the same as Monero.com?", a: "They are two apps from the same company, Cake Labs. Cake Wallet supports many coins. Monero.com is limited to Monero and is available on Android and iOS." },
    { q: "What happened to MyMonero and Cake Wallet?", a: "MyMonero announced in October 2025 that it would shut down and hand stewardship of its users to Cake Wallet. The service went offline on 6 January 2026. Cake's guide tells users to restore their 25-word MyMonero seed in Cake Wallet as the Legacy seed type." },
    { q: "Does Cake Wallet support the 13-word MyMonero seed?", a: "We could not verify it. Cake's migration guide and the stewardship announcement only describe 25-word seeds. If you have a 13-word phrase, follow our MyMonero restore guide rather than assuming it will work." },
    { q: "Does Cake Wallet work with a Ledger?", a: "Cake's documentation lists Ledger devices for Monero, connected by Bluetooth or USB (iOS supports Bluetooth only). The Monero project's downloads page also lists Cake Wallet as compatible with Ledger. Cake's docs additionally list Trezor, which the Monero page does not, so check before relying on it." },
    { q: "Does Cake Wallet use Tor?", a: "The app has a Tor-only connection setting, and its Monero node proxy is described as compatible with Tor and i2p. Check the settings in your version to see exactly what it covers." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        Cake Wallet is a <mark>free, open source, non-custodial wallet</mark> from Cake Labs that handles Monero along with Bitcoin, Ethereum,
        Litecoin and many other coins. It runs on Android, iOS and Linux, with macOS builds listed in its repository. This Cake
        Wallet review covers its Monero features, the built-in swaps, its role as the successor steward of MyMonero, and who should
        choose it over a Monero-only or browser wallet like MonkStash.
      </p>

      <Callout title="Disclosure">
        MonkStash makes a Monero wallet too, so we are not a neutral party. This review is based on Cake Wallet&apos;s official
        documentation, its source repository and other public information, not on paid placement, and we received nothing from its
        developers. We did not run a hands-on test. Facts were last checked on 15 October 2026, and apps change quickly, so
        confirm anything important with the sources linked below.
      </Callout>

      <Takeaways items={[
        "Cake Wallet is open source (MIT), non-custodial and multi-coin, made by Cake Labs. Monero.com is its Monero-only sibling.",
        "Strengths: phone-first design, many coins in one app, Ledger support for Monero, Tor option, custom nodes.",
        "Watch for: built-in swaps use third-party providers, and seeds come in several formats.",
        "MyMonero users: restore your 25-word seed as the Legacy type. We could not verify 13-word support.",
      ]} />

      <h2 id="what">What Cake Wallet is</h2>
      <p>
        Cake Wallet describes itself as an open source, non-custodial, private multi-currency wallet. Its{" "}
        <a href="https://github.com/cake-tech/cake_wallet" rel="noopener">code is on GitHub</a> under the MIT license, with the
        copyright held by Cake Labs LLC. Its own site says it began as the first Monero wallet for iOS, and Monero is still listed
        first among the coins it supports.
      </p>
      <p>
        <strong>Platforms.</strong> The Cake site lists iOS (App Store), Android (Google Play, an APK and Accrescent) and Linux.
        The repository README says Android, iOS, macOS and Linux, with F-Droid and the Mac App Store among the channels. Cake&apos;s
        MyMonero migration guide adds that Windows desktop builds are currently paused. Availability shifts, so use the
        official site to see what is offered today.
      </p>
      <p>
        <strong>Coins.</strong> Besides Monero, the site lists Bitcoin (including Lightning), Litecoin, Ethereum, Solana, Tron,
        Zcash, Dogecoin and others, plus stablecoins. If you hold only Monero, that breadth is extra surface you do not need. If
        you hold several coins, it saves you from running several apps.
      </p>

      <Figure caption="Three different shapes: a multi-coin app, a Monero-only app from the same company, and a Monero-only browser wallet.">
        <CakeAppsArt />
      </Figure>

      <h2 id="monero">Cake Wallet vs Monero.com</h2>
      <p>
        Monero.com is a separate app from Cake Labs, built for Monero only. Its site lists Android, iOS and an APK on GitHub, says
        it is non-custodial, supports subaddresses and accounts, and lets you connect to remote nodes of your choice, including
        your own. It also includes the same built-in exchange feature. If you search for &quot;monero.com wallet,&quot; that is
        the app you want, and the address is worth double-checking, because look-alike sites exist for every wallet name.
      </p>
      <p>
        Which one to pick is simple. <mark>Want one app for several coins?</mark> Cake Wallet. Want Monero and nothing else? Monero.com, or one
        of the other wallets in our <Link href="/monero-wallets">Monero wallet comparison</Link>.
      </p>

      <h2 id="strengths">What Cake Wallet does well</h2>
      <ul>
        <li><strong>Mobile first.</strong> It is one of the best-known Monero options on iPhone, as our <Link href="/monero-wallets/iphone">iPhone wallet page</Link> notes, and it also covers Android.</li>
        <li><strong>Non-custodial and open source.</strong> The README says &quot;Your keys, your coins,&quot; and you can read the code.</li>
        <li><strong>Monero conveniences.</strong> Subaddresses, accounts, restore height settings, batch sending and multiple wallets are listed in the README.</li>
        <li><strong>Custom nodes.</strong> You can point it at a node you choose, which matters for privacy. See <Link href="/monero-remote-node">using a remote node</Link>.</li>
        <li><strong>Sync on your device.</strong> Cake&apos;s migration guide says it syncs on the device rather than sending your view key to a server.</li>
        <li><strong>Hardware and air-gapped options.</strong> More below.</li>
      </ul>

      <h2 id="seeds">Seed formats</h2>
      <p>
        New Monero wallets in Cake default to <strong>Polyseed</strong>, a 16-word format. It can also restore a classic{" "}
        <strong>Legacy 25-word</strong> Monero seed: Cake&apos;s guide tells users to switch the seed type from Polyseed (16 words)
        to Legacy (25 words) when restoring. Its announcement also mentions a 12-word BIP 39 seed option that can be shared across
        other currencies.
      </p>
      <p>
        The practical lesson: <mark>write down which type you used, not just the words</mark>. Entering words with the wrong seed type selected
        will fail or give you the wrong wallet, and our <Link href="/restore-monero-wallet">restore guide</Link>{" "}
        shows how to check. MonkStash uses 25-word seeds, which Cake can restore as Legacy. A Cake Polyseed would need a wallet
        that reads Polyseed, so check before you move it.
      </p>

      <h2 id="privacy">Tor, nodes and hardware wallets</h2>
      <p>
        <strong>Tor.</strong> The README lists &quot;Tor-only connections&quot; as a privacy setting and says its Monero node
        proxies are compatible with Tor and i2p. It does not say how much of the app that covers, so open the settings in your
        version.
      </p>
      <p>
        <strong>Nodes.</strong> Like most light-style wallets, Cake asks a Monero node about the network while scanning on your
        device, so <mark>the node does not get your keys</mark>. It can still see your connection unless you use Tor or your own node. Read{" "}
        <Link href="/monero-node">what a node is</Link> for the details.
      </p>
      <p>
        <strong>Hardware wallets.</strong> Cake&apos;s documentation lists Monero support for Ledger and Trezor. It connects over
        Bluetooth or USB (on iOS only Bluetooth), and the wallet opens in a mode tied to the device. The Monero project&apos;s
        downloads page lists Cake Wallet and Monero.com as Ledger-compatible but names Trezor only for other wallets. Those two
        sources disagree, so <mark>check both before you buy a device</mark> for this. It also lists an air-gapped signing app called Cupcake.
        Our <Link href="/monero-wallets/hardware">hardware wallet page</Link> explains the options.
      </p>
      <KeyFact label="Check before you buy">Hardware support changes by device, firmware and coin. Confirm the exact pairing in the current docs.</KeyFact>

      <h2 id="swaps">Built-in swaps and buying</h2>
      <p>
        Cake includes an exchange feature for swapping one coin for another, plus options to buy and sell with fiat. Cake says third
        parties set the rates and fees, and you see them in the quote before you confirm. Its documentation names providers such
        as ChangeNOW, Exolix, Trocador and others for swaps.
      </p>
      <p>
        What this means in practice:
      </p>
      <ul>
        <li>A swap is carried out by an outside company, not by Cake. Cake&apos;s docs say it never holds the swap funds and cannot reverse a completed swap on its own.</li>
        <li>Cake states that using the wallet itself needs no account. Identity checks (KYC) in the docs belong to fiat buy and sell providers, not to the wallet. Each swap provider has its own terms, so read them for larger amounts.</li>
        <li>Your keys never leave your device, but <mark>the provider still sees the deposit and the destination you give it</mark>.</li>
      </ul>
      <Figure caption="Sending Monero from a wallet keeps you in control of the keys. A swap adds a provider, and its rules apply.">
        <CakeKeysAndSwapArt />
      </Figure>
      <p>
        If you only want to buy Monero, our <Link href="/buy-monero">guide to buying Monero</Link> compares routes.
        If you simply want to hold it, you can ignore the swap screens entirely.
      </p>

      <h2 id="mymonero">Cake Wallet and MyMonero</h2>
      <p>
        On 6 October 2025, MyMonero announced it would sunset its service and entrust Cake Wallet with stewardship of its users and
        systems. The MyMonero service went offline on 6 January 2026, and the announcement said its server data, including view
        keys and transaction history, would be destroyed within 30 days. It also said <mark>Cake Wallet would not receive view keys</mark>,
        addresses or transaction history.
      </p>
      <p>The announcement gave three paths:</p>
      <ol>
        <li>Export your 25-word seed from MyMonero and restore it in Cake Wallet.</li>
        <li>Create a new Polyseed wallet in Cake and send your funds to it.</li>
        <li>Use a 12-word BIP 39 seed that can hold several currencies.</li>
      </ol>
      <p>
        In Cake&apos;s migration guide, a MyMonero restore means choosing Monero, entering the 25 words, switching the seed type to
        Legacy (25 words), setting a restore date or height near when you started, and waiting for the sync.
      </p>
      <Callout kind="warn" title="Thirteen-word MyMonero seeds">
        Neither the announcement nor the migration guide mentions 13-word MyMonero phrases. <mark>We could not confirm that Cake Wallet</mark>
        restores them directly, so we do not claim it. If that is your situation, read{" "}
        <Link href="/restore-mymonero-seed">how to restore a MyMonero seed</Link>. MonkStash restores 13-word MyMonero
        phrases in your browser. Only enter a seed into an app you reached from an official link.
      </Callout>
      <p>
        If you are leaving MyMonero and want options, see our <Link href="/mymonero-alternative">MyMonero alternative</Link> page.
        Cake Wallet is one reasonable destination, and it is the one MyMonero itself pointed people to.
      </p>

      <h2 id="safe">Is Cake Wallet safe?</h2>
      <p>
        Cake Wallet is <mark>non-custodial and open source, which are the right foundations</mark>. The risks are the usual ones: a fake app or
        site, a phone with malware, a lost seed, and, if you use swaps, the terms of third-party providers. Install from the
        official site or a store listing you have checked (<a href="https://cakewallet.com/" rel="noopener">cakewallet.com</a>),
        back up your seed on paper, and start with a small amount. Cake&apos;s site also describes how to check an Android APK
        against its signing certificate hash. We have not audited it. For why this matters, see{" "}
        <Link href="/monero-phishing-sites">how to spot fake Monero sites</Link>.
      </p>

      <h2 id="tradeoffs">Trade-offs</h2>
      <table>
        <thead><tr><th>Pros</th><th>Cons</th></tr></thead>
        <tbody>
          <tr><td>Open source (MIT) and non-custodial</td><td>Many coins and features you may not need</td></tr>
          <tr><td>Android, iOS and Linux apps</td><td>Desktop availability varies; Windows builds are paused</td></tr>
          <tr><td>Polyseed and Legacy 25-word restore</td><td>Seed types are easy to mix up</td></tr>
          <tr><td>Custom nodes and a Tor option</td><td>Not a Monero-only experience (Monero.com is)</td></tr>
          <tr><td>Ledger support for Monero</td><td>Docs and Monero project differ on Trezor</td></tr>
          <tr><td>Built-in swaps and buying</td><td>Third-party providers with their own terms</td></tr>
        </tbody>
      </table>

      <h2 id="compare">Cake Wallet vs MonkStash</h2>
      <table>
        <thead><tr><th>Feature</th><th>Cake Wallet</th><th>MonkStash</th></tr></thead>
        <tbody>
          <tr><td>Type</td><td>Mobile and desktop apps</td><td>Web wallet in a browser</td></tr>
          <tr><td>Coins</td><td>Many, including Monero</td><td>Monero only</td></tr>
          <tr><td>Install needed</td><td>Yes (store or download)</td><td>No</td></tr>
          <tr><td>Account or email</td><td>No account for the wallet</td><td>No</td></tr>
          <tr><td>Seed words</td><td>16 (Polyseed) or 25 (Legacy)</td><td>25</td></tr>
          <tr><td>Hardware wallet</td><td>Yes, per Cake&apos;s docs</td><td>Not supported</td></tr>
          <tr><td>Built-in swaps</td><td>Yes, via third parties</td><td>No</td></tr>
          <tr><td>Open source</td><td>MIT</td><td>Built on open source monero-ts</td></tr>
          <tr><td>Independent audit</td><td>Check the project</td><td>Not yet (early preview)</td></tr>
        </tbody>
      </table>

      <h2 id="who">Who should use Cake Wallet</h2>
      <p><strong>Pick Cake Wallet instead of MonkStash if:</strong></p>
      <ul>
        <li>You want an app on your phone, including an iPhone, with the option to hold other coins.</li>
        <li>You want to use a Ledger with a mobile wallet.</li>
        <li>You are a former MyMonero user with a 25-word seed, and want the wallet MyMonero pointed to.</li>
        <li>You want swaps in the same app, and accept third-party providers.</li>
      </ul>
      <p><strong>Pick MonkStash instead if</strong> you want to start in a couple of minutes with nothing to install, or you prefer a Monero-only tool with no exchange features. Many people use both: a phone app for daily use and a hardware wallet for savings. For a wider view see the <Link href="/monero-wallets/android">Android</Link> and <Link href="/monero-wallets">wallet comparison</Link> pages, or <Link href={walletUrl}>open MonkStash</Link> with a small amount while it is an early preview.
      </p>

      <h2 id="sources">Sources checked</h2>
      <p>
        <a href="https://cakewallet.com/" rel="noopener">cakewallet.com</a>, the{" "}
        <a href="https://github.com/cake-tech/cake_wallet" rel="noopener">Cake Wallet repository</a>,{" "}
        <a href="https://monero.com/" rel="noopener">monero.com</a>, the{" "}
        <a href="https://blog.cakewallet.com/announcing-mymoneros-sunset-and-stewardship-transition-to-cake-wallet/" rel="noopener">MyMonero stewardship announcement</a>,{" "}
        <a href="https://docs.cakewallet.com/tutorials/mymonero/" rel="noopener">Cake&apos;s MyMonero guide</a>, and the Monero project&apos;s{" "}
        <a href="https://www.getmonero.org/downloads/" rel="noopener">downloads page</a>, all checked on 15 October 2026.
      </p>
    </>
  );
}
