import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { IlloBrowserKeys, IlloBackup } from "@/components/art/Illustrations";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "create-monero-wallet",
  section: "guides",
  kicker: "Step by step",
  title: "How to Create a Monero Wallet Online (Full 2026 Guide)",
  seoTitle: "How to Create a Monero Wallet Online (2026)",
  summary: "Create a Monero wallet online in about two minutes: the exact steps, how to back up your recovery words safely, and how to receive your first payment.",
  keyword: "create monero wallet",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "what-you-need", label: "What you need" },
    { id: "options", label: "Create, restore, or watch-only" },
    { id: "steps", label: "Create a wallet, step by step" },
    { id: "recovery-words", label: "What your recovery words are" },
    { id: "backup", label: "Back them up safely" },
    { id: "password", label: "Password vs recovery words" },
    { id: "2fa", label: "Optional: add a code" },
    { id: "receive", label: "Receive your first XMR" },
    { id: "which-wallet", label: "Web, desktop, or hardware?" },
    { id: "mistakes", label: "Common mistakes to avoid" },
    { id: "next", label: "What to do next" },
  ],
  related: ["back-up-monero-wallet", "is-monero-web-wallet-safe", "receive-monero", "monero-seed-phrase"],
  faq: [
    { q: "Is it safe to create a Monero wallet online?", a: "It is safe when the wallet is non-custodial, meaning your recovery words are created and encrypted in your browser and never sent to a server. The main risks are losing your recovery words and fake websites, so back up your words offline and always check the address bar before entering anything." },
    { q: "Do I need to download anything to create a Monero wallet?", a: "No. A web wallet like MonkStash runs in your browser. There is nothing to install and no blockchain to download. It connects to a Monero node to find your payments and broadcast the ones you send." },
    { q: "How many words is a Monero recovery phrase?", a: "A standard Monero wallet uses 25 words. The 25th word is a checksum that helps catch mistakes. Some older services, such as the now-closed MyMonero, used 13 words." },
    { q: "Is creating a Monero wallet free?", a: "Yes. Creating and using a MonkStash wallet is free. You only pay the small Monero network fee when you send a payment, usually a few cents or less, and that goes to the network, not to us." },
    { q: "Can I create a Monero wallet on my phone?", a: "Yes. Because MonkStash runs in the browser, you can create a wallet on a phone, tablet, or computer. Just make sure you write your recovery words on paper, not in a notes app." },
    { q: "Do I need to give an email or ID to create a wallet?", a: "No. There is no sign-up, no email, and no identity check to create a MonkStash wallet. Creating a wallet is different from buying Monero, which may involve identity checks depending on where you buy." },
    { q: "What happens if I lose my recovery words?", a: "If you lose both your recovery words and access to the device holding the wallet, the money cannot be recovered by anyone, including us. This is why backing up the 25 words carefully is the most important step." },
  ],
  sources: [
    { label: "Moneropedia: Mnemonic seed (25 words, the last is a checksum)", href: "https://www.getmonero.org/resources/moneropedia/mnemonicseed.html" },
    { label: "Monero documentation: Mnemonics (25-word, 13-word MyMonero and 16-word Polyseed)", href: "https://docs.getmonero.org/mnemonics/" },
    { label: "Monero docs: Subaddresses (a new one for each payer)", href: "https://docs.getmonero.org/public-address/subaddress/" },
    { label: "The Monero Project: Downloads (desktop, mobile and hardware wallets)", href: "https://www.getmonero.org/downloads/" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        You can <mark>create a Monero wallet online in about two minutes</mark>, and it is the first step to holding and using XMR. The clicking is the
        easy part. What matters is understanding what you are creating and backing it up properly, because a Monero wallet puts you
        in full control, <mark>with no company to reset things if they go wrong</mark>. This guide walks through the whole process in plain
        language, using <Link href={walletUrl}>MonkStash</Link>, a free non-custodial web wallet, and explains the why behind each
        step so you are not just clicking blindly.
      </p>

      <Takeaways items={[
        "A Monero wallet is created entirely in your browser. No sign-up, no download, no identity check.",
        "You get 25 recovery words. They are the only backup, so write them on paper, never a screenshot.",
        "Your password protects the copy in this browser. Your recovery words restore the wallet anywhere.",
        "Nothing you enter is sent to a server in a non-custodial wallet. Your keys stay on your device.",
      ]} />

      <Figure caption="Your wallet runs in the browser and keeps your keys encrypted on your device.">
        <IlloBrowserKeys />
      </Figure>

      <h2 id="what-you-need">What you need before you start</h2>
      <p>You do not need much, but a few minutes of preparation prevents the most common mistakes:</p>
      <ul>
        <li><strong>A pen and paper.</strong> You will write down 25 words. Paper, not your phone or computer.</li>
        <li><strong>A private moment.</strong> No one looking over your shoulder, and no cameras pointed at your screen.</li>
        <li><strong>The correct website.</strong> Check the address bar. <Link href="/monero-phishing-sites">Fake sites that copy real wallets</Link> are the most common way people lose Monero, and they are built to look identical.</li>
      </ul>
      <Callout kind="warn" title="A wallet never asks you to verify existing words">
        If any site or message asks you to type in recovery words you already have to &quot;verify&quot; or &quot;sync&quot; a
        wallet, it is a scam. You only ever enter existing words when you deliberately restore your own wallet.
      </Callout>

      <h2 id="options">Create, restore, or watch-only</h2>
      <p>When you open the wallet, you get three choices. This guide covers the first, but it helps to know all three:</p>
      <ul>
        <li><strong>Create a new wallet.</strong> Generates a brand new wallet and a fresh set of 25 recovery words. Choose this if you are starting from scratch.</li>
        <li><strong>Restore from recovery words.</strong> Brings back an existing wallet using its 25 words. Use this if you already have a Monero wallet elsewhere. See <Link href="/restore-monero-wallet">how to restore a wallet</Link>, or, if your XMR was in Exodus, <Link href="/exodus-monero">how to move your Monero out of Exodus</Link>.</li>
        <li><strong>Add a <Link href="/monero-view-only-wallet">watch-only wallet</Link>.</strong> Follows an address using its view key, so you can see incoming payments without being able to spend. Useful for monitoring, and the private way to <Link href="/check-monero-balance">check a Monero balance</Link> without spending rights.</li>
      </ul>

      <h2 id="steps">Create a wallet, step by step</h2>
      <ol>
        <li>Open the <Link href={walletUrl}>wallet</Link> and choose <strong>Create a new wallet</strong>.</li>
        <li>The wallet generates your 25 recovery words in your browser, using Monero&apos;s own cryptography. They are never sent anywhere.</li>
        <li>Reveal the words only when you are somewhere private, then write them down. We cover how to do this safely in the next section.</li>
        <li>Confirm a few of the words. This is not busywork: <mark>it proves your written copy is correct</mark> before you rely on it.</li>
        <li>Set a password to lock the wallet in this browser.</li>
        <li>You land on the dashboard, where your address and QR code are ready to receive XMR.</li>
      </ol>
      <p>
        That is the entire process. The whole thing usually takes less time than making a coffee, and there is no waiting for a
        blockchain to download because the wallet reads the chain through a Monero node. You do not need a browser add-on either: if
        you went looking for one, here is <Link href="/monero-chrome-extension">what exists for Monero in Chrome</Link> and why the
        web wallet works without it.
      </p>

      <h2 id="recovery-words">What your recovery words actually are</h2>
      <p>
        Your Monero does not live on your phone or in your browser. It lives on the Monero network. What lives on your device is
        the set of private keys that prove the money is yours. Your 25 recovery words (some wallets call them a <Link href="/monero-seed-phrase">seed phrase</Link>) are a
        plain-words version of those keys. <mark>Anyone who has the words controls the money</mark>, and they are the only way to rebuild the
        wallet if your device is lost. The 25th word is a checksum, a built-in spell-check that helps catch a mistake in the other
        24.
      </p>

      <h2 id="backup">Back up your recovery words safely</h2>
      <p>
        This is the single most important step, so it is worth doing properly. <mark>A good backup is on paper, in order</mark>, and stored
        somewhere only you can reach.
      </p>
      <Figure caption="Write all 25 recovery words on paper, numbered and in order. Never a screenshot.">
        <IlloBackup />
      </Figure>
      <ul>
        <li>Write all 25 words on paper, numbered 1 to 25, in the exact order shown.</li>
        <li>Double-check the spelling. One wrong word can make the whole backup fail.</li>
        <li>Do not screenshot, photograph, or save them in a notes app, email, or cloud drive. Anything on a connected device can be stolen by harmful software.</li>
        <li>Store the paper somewhere safe. For larger amounts, keep a second copy in a different location, or stamp the words into metal so fire and water cannot destroy them.</li>
      </ul>
      <p>
        For the full version of this, including how to test that your backup actually works, see{" "}
        <Link href="/back-up-monero-wallet">how to back up a Monero wallet</Link>.
      </p>

      <h2 id="password">Password vs recovery words: the key difference</h2>
      <p>
        People often confuse these two, and the difference matters. Your <strong>password</strong> encrypts the copy of the wallet
        stored in this browser, so someone with access to your device still cannot open it. Your <strong>recovery words</strong>
        rebuild the wallet from scratch on any device. <mark>If you forget the password, you do not lose your money</mark>: you remove the
        wallet and restore it with your recovery words. If you lose the recovery words, no password can help, and the money is gone.
      </p>
      <table>
        <thead><tr><th>&nbsp;</th><th>Password</th><th>Recovery words</th></tr></thead>
        <tbody>
          <tr><td>Protects</td><td>This browser&apos;s copy</td><td>The whole wallet, anywhere</td></tr>
          <tr><td>If lost</td><td>Restore from recovery words</td><td>Money is unrecoverable</td></tr>
          <tr><td>Share it?</td><td>Never</td><td>Never</td></tr>
        </tbody>
      </table>

      <h2 id="2fa">Optional: add an authenticator code</h2>
      <p>
        MonkStash lets you add a 6-digit code from an authenticator app as a second step when you unlock the wallet on this device.
        It is optional and adds a little friction for a little extra protection on your device. It does not protect your recovery
        words if someone else gets hold of them, so it is a convenience layer, not a replacement for keeping your words safe.
      </p>

      <h2 id="receive">Receive your first XMR</h2>
      <p>
        On the dashboard you will see your address and a QR code. Share this address, or a <Link href="/monero-subaddress">fresh subaddress</Link>, with whoever is paying
        you. Generating a <mark>new subaddress for each sender</mark> keeps your payments from being linked together, which is good for your
        privacy. Payments usually appear within a couple of minutes and are fully settled after about twenty. For the details, see{" "}
        <Link href="/receive-monero">how to receive Monero</Link>.
      </p>

      <h2 id="which-wallet">Web, desktop, mobile, or hardware wallet?</h2>
      <p>
        A web wallet is the fastest way to start, but it is not the only option. Here is how the main types compare so you can pick
        the right tool for the amount you are holding. The Monero project keeps a{" "}
        <a href="https://www.getmonero.org/downloads/" rel="noopener">list of wallets of each type</a>.
      </p>
      <table>
        <thead><tr><th>Type</th><th>Setup</th><th>Best for</th></tr></thead>
        <tbody>
          <tr><td>Web wallet (MonkStash)</td><td>About 2 minutes, nothing to install</td><td>Getting started and everyday amounts</td></tr>
          <tr><td>Desktop wallet</td><td>Download and sync, more control</td><td>Power users who run their own node</td></tr>
          <tr><td>Mobile wallet</td><td>App install</td><td>Spending on the go</td></tr>
          <tr><td>Hardware wallet</td><td>Buy a device, pair a companion app</td><td>Long-term savings</td></tr>
        </tbody>
      </table>
      <p>A common setup is a web or mobile wallet for spending money, and <mark>a hardware wallet for long-term savings</mark>.</p>

      <h2 id="mistakes">Common mistakes to avoid</h2>
      <ul>
        <li><strong>Saving recovery words digitally.</strong> Screenshots and notes apps are the most common way wallets get drained.</li>
        <li><strong>Landing on a fake site.</strong> Bookmark the real wallet and use the bookmark, rather than clicking links or ads.</li>
        <li><strong>Skipping the backup check.</strong> Confirm your written words before you put real money in.</li>
        <li><strong>Starting with a large amount.</strong> Send a small test payment first to get comfortable with the flow.</li>
      </ul>

      <h2 id="next">What to do next</h2>
      <p>
        Once your wallet is set up and backed up, you are ready to use it. If you are new to Monero, it is worth understanding{" "}
        <Link href="/what-is-monero">what makes it different</Link> and{" "}
        <Link href="/is-monero-safe">whether it is safe</Link>. When you are ready to move money, read{" "}
        <Link href="/send-monero">how to send Monero</Link>, and always start with a small amount.
      </p>
    </>
  );
}
