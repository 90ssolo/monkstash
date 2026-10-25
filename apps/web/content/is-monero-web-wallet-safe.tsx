import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { WebWalletFlowArt, WebWalletTypesArt } from "@/components/art/WebWalletSafeArt";
import { repoUrl, walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "is-monero-web-wallet-safe",
  section: "learn",
  kicker: "Threat model",
  title: "Is a Monero Web Wallet Safe? An Honest Threat Model",
  seoTitle: "Is a Monero Web Wallet Safe? Honest Answer",
  summary: "Is a Monero web wallet safe? It depends on who holds your keys and who serves the code. Every real risk, what protects you, and what nothing can fix.",
  keyword: "is monero web wallet safe",
  updated: "2026-10-25",
  readingMinutes: 9,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "kinds", label: "Three kinds of web wallet" },
    { id: "who-sees", label: "Who sees what in MonkStash" },
    { id: "threats", label: "The threats, one by one" },
    { id: "code", label: "The big one: the code your browser runs" },
    { id: "cannot", label: "What no web wallet can fix" },
    { id: "checklist", label: "A five-minute safety checklist" },
    { id: "when-not", label: "When to use something else" },
    { id: "next", label: "Next steps" },
  ],
  related: ["monero-light-wallet", "monero-phishing-sites", "safest-monero-wallet", "back-up-monero-wallet"],
  sources: [
    { label: "OWASP Password Storage Cheat Sheet (PBKDF2-HMAC-SHA256 work factor)", href: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" },
    { label: "MDN: Content Security Policy (CSP)", href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP" },
    { label: "MDN: Same-origin policy (storage is separated by origin)", href: "https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy" },
    { label: "monero-ts: the official Monero code compiled to WebAssembly", href: "https://github.com/woodser/monero-ts" },
    { label: "Moneropedia: View key", href: "https://www.getmonero.org/resources/moneropedia/viewkey.html" },
    { label: "Reproducible Builds: definition and why it matters", href: "https://reproducible-builds.org/docs/definition/" },
    { label: "MonkStash source code (BSD-3-Clause)", href: "https://github.com/90ssolo/monkstash" },
  ],
  faq: [
    { q: "Is a Monero web wallet safe?", a: "A non-custodial web wallet that keeps your keys in your browser can be safe for everyday amounts. The real risks are a compromised website serving bad code, phishing clones, malware on your device and a lost backup. For large savings, a hardware wallet or a desktop wallet with your own node is safer." },
    { q: "Can MonkStash steal my Monero?", a: "Not from what it stores: your keys are created and encrypted in your browser and never reach our server. The honest caveat is that a web wallet's code is delivered by its server, so if that server were ever compromised it could serve bad code. That is why our builds are reproducible and checkable, and why we say to start with small amounts until an independent audit is done." },
    { q: "Does a web wallet see my balance?", a: "It depends on the kind. A light wallet server holds your view key and can see your incoming payments. MonkStash scans blocks in your browser, so our relay sees which blocks your wallet asks for and your IP address, but not your keys or your balance." },
    { q: "What happens if I clear my browser data?", a: "The encrypted wallet stored in that browser is deleted. Your money is not: it stays on the Monero network, and your 25 recovery words restore the wallet anywhere. Without the words, it is gone, so back them up before you receive anything." },
    { q: "Is a browser extension wallet safer than a web wallet?", a: "Partly. An extension's code is installed once instead of loaded on every visit, which removes the risk of a server swapping the code between visits. But extensions update themselves, and fake store listings are a real problem, so install only from the official link." },
    { q: "How much Monero should I keep in a web wallet?", a: "Treat it like the cash in your pocket: amounts you would be upset but not ruined to lose. Keep long-term savings on a hardware wallet or in a desktop wallet you control." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <strong>Is it safe to keep Monero in a web wallet?</strong> It is the right question to ask, and most answers online
        are either marketing or copy-pasted warnings. Here is ours, written by people who build one, with{" "}
        <mark>every risk we know about, including the ones we cannot fix</mark>.
      </p>
      <p>
        We use MonkStash as the worked example because we can show you exactly how it handles each threat. The same
        questions apply to any web wallet you are considering.
      </p>

      <Takeaways items={[
        "The first question is who holds your keys. If it is a company, it can spend your money.",
        "A well-built web wallet keeps both keys in your browser. The node only sees requests.",
        "The biggest web-specific risk is the code itself: the server delivers it on every visit.",
        "Fine for everyday amounts. Keep savings on hardware or a desktop wallet with your own node.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        A Monero web wallet is safe enough for everyday amounts <mark>if it is non-custodial and keeps your keys on your
        device</mark>, if you reach it at its real address, and if your recovery words are backed up offline. Its weak spots
        are different from a desktop wallet&apos;s: the website delivers the wallet&apos;s code each time you open it, the
        browser is a busy place, and look-alike sites are everywhere. For large savings, use a hardware wallet or a desktop
        wallet with your own node.
      </p>

      <h2 id="kinds">Three kinds of web wallet</h2>
      <p>&quot;Web wallet&quot; covers three very different designs. Find out which one you are using before anything else.</p>
      <Figure caption="Who holds what. Only the last design keeps both keys on your device.">
        <WebWalletTypesArt />
      </Figure>
      <ul>
        <li><strong>Custodial.</strong> An exchange-style account. The company holds the keys, so it can freeze, lose or spend your coins. Convenient, but it is their wallet, not yours.</li>
        <li><strong>Light wallet server.</strong> You keep your spend key, but you give a server your <Link href="/monero-view-key">view key</Link> so it can find your payments for you. It cannot spend, but <mark>it can see every payment you receive</mark>. MyMonero worked this way. Our <Link href="/monero-light-wallet">light wallet guide</Link> explains the trade-off.</li>
        <li><strong>Local scan.</strong> Both keys stay in your browser, and the wallet downloads blocks and checks them for your payments itself. MonkStash works this way, using <a href="https://github.com/woodser/monero-ts" rel="noopener">monero-ts</a>, the official Monero code compiled to run in a browser.</li>
      </ul>

      <h2 id="who-sees">Who sees what in MonkStash</h2>
      <Figure caption="Your keys never leave your browser. The relay and the node see requests, not money.">
        <WebWalletFlowArt />
      </Figure>
      <p>
        Your recovery words and keys are created in your browser and encrypted with your wallet password before they are
        stored there. To find your payments, the wallet reads blocks through a Monero node. Most public nodes cannot be
        reached directly from a web page, so by default those requests pass through our relay. As our{" "}
        <Link href="/privacy">privacy policy</Link> states, <mark>the relay sees your IP address and which blocks and outputs
        your wallet asks about</mark>, and the transactions you send on their way to the network. It never sees your keys or
        your balance. Connect your own node in Settings and the relay drops out.
      </p>
      <KeyFact label="How your keys are locked">
        PBKDF2-SHA256 with 600,000 rounds turns your password into a key, and AES-256-GCM encrypts your wallet with it,
        through the browser&apos;s built-in Web Crypto. The round count follows the OWASP recommendation for this algorithm.
      </KeyFact>

      <h2 id="threats">The threats, one by one</h2>
      <table>
        <caption>Threats to a Monero web wallet, and how MonkStash handles each (checked 2026-10-25)</caption>
        <thead><tr><th>Threat</th><th>What could happen</th><th>What protects you</th><th>What is left</th></tr></thead>
        <tbody>
          <tr><th>Fake wallet site</th><td>You type your words into a clone and lose everything</td><td>One official address, wallet.monkstash.com; a bookmark; the wallet asks for recovery words only to restore a wallet or sweep another one in</td><td>You must check the address bar. See our <Link href="/monero-phishing-sites">phishing guide</Link></td></tr>
          <tr><th>Someone steals the stored wallet</th><td>They copy your browser&apos;s encrypted wallet</td><td>Strong encryption with your password; optional 2FA code on your device</td><td>A weak password can be guessed offline. Use a long one</td></tr>
          <tr><th>Someone uses your unlocked device</th><td>They send your money</td><td>Every payment asks for your password; auto-lock after 10 minutes idle, or soon after you leave the tab</td><td>A device left unlocked with the wallet open</td></tr>
          <tr><th>Clipboard malware</th><td>It swaps the address you paste</td><td>A look-alike alarm marks addresses that start and end like one you used but differ in the middle</td><td>Check the address before you confirm</td></tr>
          <tr><th>Injected or third-party scripts</th><td>A script on the page reads your data</td><td>A strict Content Security Policy on wallet pages: only scripts with a fresh per-request nonce, no third-party code, no framing</td><td>A malicious browser extension can still read pages. Keep extensions few</td></tr>
          <tr><th>Content pages reading wallet storage</th><td>A bug on a guide page reaches the wallet</td><td>The wallet lives on its own origin, so the browser keeps its storage apart from the content site</td><td>None known</td></tr>
          <tr><th>Relay or node spying</th><td>They link your IP address to your wallet activity</td><td>Keys and balance never leave your device; the relay keeps IP addresses in memory for a minute and no access logs</td><td>Your IP is visible to the relay. Use your own node, a VPN or Tor</td></tr>
          <tr><th>Losing the browser data</th><td>Clearing site data or a lost phone deletes the stored wallet</td><td>Backup confirmation at setup, a security checkup and a printable emergency kit</td><td>Without your 25 words, nobody can restore it</td></tr>
        </tbody>
      </table>

      <h2 id="code">The big one: the code your browser runs</h2>
      <p>
        Here is the risk that is special to web wallets, and the one most sites do not mention. A desktop wallet is installed
        once. <mark>A web wallet&apos;s code is sent by its server every time you open it.</mark> If that server were broken
        into, or its operator forced to, it could send a version that copies your words when you unlock. Encryption does not
        help against your own wallet&apos;s code turning on you.
      </p>
      <p>Nobody can make that risk zero. What a web wallet can do is make it visible and hard to hide:</p>
      <ul>
        <li><strong>Open source.</strong> Every line is <a href={repoUrl} rel="noopener">public</a>, so anyone can read what the wallet is supposed to do.</li>
        <li><strong>Reproducible builds.</strong> The same source always produces byte-identical files. The live site publishes a fingerprint of every file, and anyone can <Link href="/verify">rebuild it and compare</Link>, or run the one-minute checker. A swapped file would show up.</li>
        <li><strong>No inline code on wallet pages.</strong> Every script the wallet runs is a file in that published build, so the check covers all of them.</li>
        <li><strong>The extension option.</strong> The <Link href="/monero-chrome-extension">browser extension</Link> installs the code once and shows its fingerprint in Settings, so it is not reloaded from our server on every visit. Its updates are a risk of their own, which is why each release lists its fingerprints.</li>
      </ul>
      <Callout kind="warn" title="Not audited yet">
        MonkStash has not had an independent security audit. Open code and checkable builds are not the same as a review by
        specialists. Until that review is done and published, use amounts you could afford to lose.
      </Callout>

      <h2 id="cannot">What no web wallet can fix</h2>
      <ul>
        <li><strong>Malware on your device.</strong> If your computer or phone is compromised, any wallet on it is exposed: web, desktop or mobile. A <Link href="/monero-wallets/hardware">hardware wallet</Link> is the answer to this one.</li>
        <li><strong>Your recovery words in the wrong hands.</strong> Anyone with the words owns the wallet. A real wallet asks for them only when you restore.</li>
        <li><strong>A lost backup.</strong> Non-custodial means nobody can reset it for you, us included.</li>
        <li><strong>Mistyped payments.</strong> Monero payments cannot be reversed. Check, send a small test, then send the rest.</li>
      </ul>

      <h2 id="checklist">A five-minute safety checklist</h2>
      <ol>
        <li>Open the wallet from a bookmark, and check the address bar says <strong>wallet.monkstash.com</strong>.</li>
        <li>Write your 25 words on paper, confirm them, and store them offline. The <Link href="/back-up-monero-wallet">backup guide</Link> shows how.</li>
        <li>Use a long wallet password, and turn on the 2FA code in Settings if you like.</li>
        <li>Remove browser extensions you do not need, or use a separate browser profile for the wallet.</li>
        <li>Start with a small amount, send a test payment, and run the security checkup in the wallet.</li>
      </ol>
      <p>
        For more privacy from the network, connect your own node. Our guide to{" "}
        <Link href="/run-a-monero-node">running a Monero node</Link> covers it.
      </p>

      <h2 id="when-not">When to use something else</h2>
      <p>
        A web wallet is for convenience: paying, getting paid, checking a balance from any device. If you hold an amount that
        would hurt to lose, <mark>move it to a wallet built for savings</mark>. Our{" "}
        <Link href="/monero-wallets/safest-monero-wallet">safest Monero wallet guide</Link> matches the setup to the amount,
        from a web wallet for pocket money to a hardware wallet and offline signing for savings. For the bigger picture, see{" "}
        <Link href="/is-monero-safe">is Monero safe?</Link>
      </p>

      <h2 id="next">Next steps</h2>
      <ul>
        <li>Try it with a small amount: <Link href={walletUrl}>open MonkStash</Link>.</li>
        <li>Check the build yourself on the <Link href="/verify">verify page</Link>.</li>
        <li>Learn to spot fakes in <Link href="/monero-phishing-sites">how to spot a fake Monero wallet</Link>.</li>
      </ul>
    </>
  );
}
