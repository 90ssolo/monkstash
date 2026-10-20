import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { ExodusAfterRestoreArt, ExodusRestorePathsArt } from "@/components/art/ExodusMoneroArt";
import { walletUrl } from "@/lib/site";

const EXODUS_XMR = "https://www.exodus.com/support/en/articles/10862085-support-for-monero-xmr-has-ended";
const EXODUS_SUNSET = "https://www.exodus.com/support/en/articles/9012045-asset-sunset-faqs";

export const meta: ArticleMeta = {
  slug: "exodus-monero",
  section: "guides",
  kicker: "Leaving Exodus",
  title: "Exodus Dropped Monero: How to Get Your XMR Back",
  seoTitle: "Exodus Monero Ended: How to Get Your XMR Back",
  summary: "Exodus ended Monero support on 18 August 2025, but your XMR is still yours. Restore your 12 Exodus words in another wallet and check the address matches.",
  keyword: "exodus monero",
  updated: "2026-10-15",
  readingMinutes: 8,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "happened", label: "What Exodus changed, and what it did not" },
    { id: "which", label: "Which words do you have?" },
    { id: "restore", label: "Restore your Exodus Monero in MonkStash" },
    { id: "date", label: "Pick a restore date" },
    { id: "check", label: "Check it is really your wallet" },
    { id: "scams", label: "Watch out for fake Exodus support" },
    { id: "alternatives", label: "Exodus Monero alternatives" },
    { id: "next", label: "What to do next" },
  ],
  related: ["restore-monero-wallet", "monero-seed-phrase", "monero-restore-height", "monero-phishing-sites"],
  faq: [
    { q: "Does Exodus still support Monero (XMR)?", a: "No. Exodus's support page says it ended support for Monero on 18 August 2025. The Monero wallet is no longer available in the app, so you cannot view a balance or send XMR with Exodus." },
    { q: "Is my Monero gone now that Exodus removed it?", a: "No. Exodus is a self-custody wallet, so your XMR sits on the Monero network and is controlled by your secret phrase. Exodus says you can still reach it by importing your 12-word secret key or your 25-word Monero mnemonic into a compatible wallet." },
    { q: "Why did my Monero disappear from Exodus?", a: "Exodus removed the Monero wallet from its app when support ended. The coins did not move. Restore the same phrase in a wallet that supports Monero and the balance appears again once it has synced." },
    { q: "Can I use my 12-word Exodus phrase in a Monero wallet?", a: "Yes, in wallets that support Exodus-style BIP39 phrases for Monero. MonkStash and Cake Wallet both do. Most Monero wallets only accept 25-word Monero seeds, so a 12-word phrase will be rejected there." },
    { q: "Where is my Exodus 25-word Monero seed?", a: "Exodus says that Exodus Desktop can show the 25-word Monero mnemonic under Settings, Assets, then Monero Private Keys. If you saved it earlier, it works in almost any Monero wallet. If you do not have it, use your 12-word Exodus phrase instead." },
    { q: "Why is my restored Exodus Monero wallet not syncing?", a: "It probably is syncing, just slowly. Without a date the wallet scans from 26 April 2019, when Exodus added Monero, which takes a while. Enter a date shortly before your first XMR deposit to cut the wait." },
    { q: "Is someone from Exodus support allowed to ask for my secret phrase?", a: "No. Never share your phrase with anyone who contacts you, whatever they call themselves. Exodus itself warns that scammers create fake websites and wallets to steal funds." },
  ],
  sources: [
    { label: "Exodus: Support for Monero (XMR) has ended", href: EXODUS_XMR },
    { label: "Exodus: Asset sunset FAQs", href: EXODUS_SUNSET },
    { label: "Monero documentation: mnemonic seeds", href: "https://docs.getmonero.org/mnemonics/" },
    { label: "Feather Wallet documentation: seed scheme", href: "https://docs.featherwallet.org/guides/seed-scheme" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        Exodus ended Monero support on 18 August 2025, but <mark>your XMR did not go anywhere</mark>. It is still on the Monero
        network, and the 12 words you wrote down for Exodus still open it. Type those words into a wallet that understands Exodus
        phrases, wait for it to sync, and your balance comes back. This guide shows how, step by step, and how to avoid the scams
        aimed at people searching for exactly this.
      </p>

      <Takeaways items={[
        "Exodus says it ended Monero support on 18 August 2025. You can no longer see or send XMR in the Exodus app.",
        "Your coins were never inside Exodus. Your 12-word Exodus phrase, or the 25-word Monero mnemonic from Exodus Desktop, still controls them.",
        "MonkStash restores 12-word Exodus phrases in your browser, for free, and turns them into the standard 25-word Monero seed.",
        "Check the restored address matches an old Exodus receive address before you trust it with more money.",
        "Nobody from Exodus or any wallet will ask for your words. Anyone who does is a scammer.",
      ]} />

      <h2 id="short">The short answer</h2>
      <ol>
        <li>Find your <strong>12-word Exodus secret phrase</strong> (or the 25-word Monero mnemonic, if you saved it).</li>
        <li>Open a wallet that restores Exodus Monero phrases, such as <Link href={walletUrl}>MonkStash</Link> or Cake Wallet.</li>
        <li>Enter the words and a rough date of your first XMR deposit.</li>
        <li>Let it sync, then <mark>check the address matches</mark> the one Exodus used to show you.</li>
      </ol>
      <p>That is it. The rest of this page explains each step and what to do if something looks wrong.</p>

      <h2 id="happened">What Exodus changed, and what it did not</h2>
      <p>
        Exodus&apos;s own support page is clear: <em>&quot;On August 18, 2025, Exodus ended support for Monero (XMR).&quot;</em> The
        Monero wallet is gone from the app, and you can no longer view a balance or send XMR there. Exodus lists Monero alongside
        other coins it dropped on the same day in its <a href={EXODUS_SUNSET} rel="noopener">asset sunset FAQs</a>.
      </p>
      <p>
        What did <strong>not</strong> change is who owns the money. Exodus is a self-custody wallet. It never held your XMR on a
        company server; it only showed you what your phrase controls on the Monero network. That is why Exodus&apos;s{" "}
        <a href={EXODUS_XMR} rel="noopener">Monero support article</a> tells users they can still access remaining XMR by
        importing the Exodus 12-word secret key or the Monero 25-word mnemonic from Exodus Desktop into a compatible wallet.
      </p>
      <p>
        So if you searched &quot;Exodus Monero disappeared&quot;, here is the plain version: <mark>the app stopped showing it, the
        coins stayed put</mark>. If you held XMR on a Trezor through Exodus, Exodus says those funds were not affected either; connect
        the Trezor to a Monero wallet that supports it.
      </p>
      <Figure caption="Two keys, one wallet. Either set of words opens the same XMR on the Monero network.">
        <ExodusRestorePathsArt />
      </Figure>

      <h2 id="which">Which words do you have?</h2>
      <p>Count your words first. The number decides where you can restore.</p>
      <table>
        <thead><tr><th>What you have</th><th>Where it came from</th><th>Where it works</th></tr></thead>
        <tbody>
          <tr><td>12 words</td><td>Your Exodus secret phrase (it covers all your Exodus coins)</td><td>MonkStash, Cake Wallet (choose BIP39, 12 words). Most other Monero wallets reject it.</td></tr>
          <tr><td>25 words</td><td>The Monero mnemonic that Exodus Desktop could show under Monero Private Keys</td><td>Almost any Monero wallet, including MonkStash, Cake Wallet and Feather.</td></tr>
          <tr><td>Neither</td><td>Lost phrase</td><td>Exodus Desktop may still show the 25-word mnemonic if the app is installed and unlocked. See below.</td></tr>
        </tbody>
      </table>
      <p>
        Why are there two? Exodus uses one 12-word BIP39 phrase for every coin. Monero wallets normally use their own 25-word
        format, which the Monero project describes in its <a href="https://docs.getmonero.org/mnemonics/" rel="noopener">mnemonics
        reference</a>. The 12 words can be converted into the 25-word Monero seed of the same wallet, which is what MonkStash and Cake
        Wallet do. Our <Link href="/monero-seed-phrase">guide to the Monero seed phrase</Link> explains the formats in more depth.
      </p>
      <h3>Finding the 25-word mnemonic in Exodus Desktop</h3>
      <p>
        Exodus&apos;s support article says you can view it in Exodus Desktop under <strong>Settings</strong>,{" "}
        <strong>Assets</strong>, the menu, then <strong>Monero Private Keys</strong>, after confirming and entering your password.
        Do this alone, and clear your clipboard afterwards if you copy it. You do not need it if you have the 12 words.
      </p>

      <h2 id="restore">Restore your Exodus Monero in MonkStash</h2>
      <p>
        MonkStash is a free Monero web wallet. <mark>It restores 12-word Exodus phrases directly</mark>, so you do not need Exodus
        Desktop or any converter. The words are turned into keys inside your browser and never sent to us.
      </p>
      <ol>
        <li>Open the <Link href={walletUrl}>MonkStash wallet</Link> from a bookmark or by typing the address yourself.</li>
        <li>Choose <strong>Restore from recovery words</strong>.</li>
        <li>Type your 12 Exodus words in order. MonkStash recognises an Exodus phrase by its length and checks it for typos.</li>
        <li>Enter the approximate date of your first XMR deposit, if you know it (next section).</li>
        <li>Set a password. It locks the wallet on this device only.</li>
        <li>Wait for the sync to finish. Your balance and history appear as it goes.</li>
      </ol>
      <p>
        Behind the scenes, MonkStash uses the same method as Cake Wallet: the BIP39 path <code>m/44&apos;/128&apos;/0&apos;/0/0</code>{" "}
        followed by the standard Monero key reduction. We checked it against Cake Wallet&apos;s published test vectors. The result is
        the normal 25-word Monero seed of the same wallet, and you can view it later in <strong>Settings</strong>. Write that down too:{" "}
        <mark>it works in almost every Monero wallet</mark>, not just the ones that read Exodus phrases.
      </p>
      <p>
        Have the 25-word mnemonic instead? Same steps, just enter 25 words. For general restore tips, see{" "}
        <Link href="/restore-monero-wallet">how to restore a Monero wallet</Link>.
      </p>
      <Callout title="Honest note">
        MonkStash is an early preview and has not yet had an independent security review. If you hold a large amount, restore it,
        check the address, then move a small test amount first. If you used several Exodus portfolios, Exodus warns that other
        wallets may not find the extra accounts; MonkStash restores the main one.
      </Callout>

      <h2 id="date">Pick a restore date</h2>
      <p>
        A Monero wallet has to scan the network block by block to find your payments, because nothing on the network says which
        payments are yours. The <strong>restore date</strong> (or restore height) tells it where to start.
      </p>
      <ul>
        <li><strong>You know roughly when you first got XMR in Exodus:</strong> enter a date a few weeks earlier. Fast and safe.</li>
        <li><strong>You have no idea:</strong> leave it blank. For an Exodus phrase, MonkStash then starts from 26 April 2019, the date Exodus says it first supported Monero, so it cannot miss anything. It just takes longer.</li>
        <li><strong>The balance looks too low:</strong> restore again with an earlier date before assuming anything is missing.</li>
      </ul>
      <p>
        This is also the usual answer to &quot;Exodus Monero not syncing&quot;. Exodus itself will never sync XMR again, and a new
        wallet that starts in 2019 is simply working through years of blocks. The{" "}
        <Link href="/monero-restore-height">restore height guide</Link> and the{" "}
        <Link href="/tools/monero-restore-height-calculator">restore height calculator</Link> help you pick a better start. If it
        truly stalls, follow <Link href="/monero-wallet-not-syncing">fixing a Monero wallet that will not sync</Link>.
      </p>

      <h2 id="check">Check it is really your wallet</h2>
      <p>
        A restore is only finished when you know it is <em>your</em> wallet. Compare the main address MonkStash shows with an old
        Exodus Monero receive address: from a screenshot, an exchange withdrawal record or an old message. Matching first and last
        characters is a good sign; matching the whole address is proof.
      </p>
      <Figure caption="Restore, check, test, then decide whether to move to a fresh wallet.">
        <ExodusAfterRestoreArt />
      </Figure>
      <p>
        Then think about a fresh start. Your Exodus phrase may have lived in a cloud backup, an email or a photo for years. Sending
        your XMR to a brand-new Monero wallet with new words closes that door, and costs only a small network fee. Note that newly
        received funds stay locked for about 20 minutes before you can spend them; our page on the{" "}
        <Link href="/monero-unlocked-balance">Monero unlocked balance</Link> explains why.
      </p>

      <h2 id="scams">Watch out for fake Exodus support</h2>
      <p>
        When a wallet drops a coin, scammers follow the people searching for help. Expect fake &quot;Exodus support&quot; accounts
        replying to posts, look-alike recovery sites in search ads, and messages offering to &quot;migrate&quot; or &quot;unlock&quot;
        your Monero. Exodus&apos;s own sunset FAQ warns: <em>&quot;Scammers often create fake websites or wallets to steal your funds.&quot;</em>
      </p>
      <Callout kind="warn" title="The one rule">
        Your 12 or 25 words are the money. <mark>No real support team will ever ask for them.</mark> Only type them into a wallet you
        reached from a bookmark or an address you typed yourself, never from an ad, a DM or an email link.
      </Callout>
      <p>
        If you already typed your words somewhere you are unsure about, move your funds to a new wallet right away. Our guide on{" "}
        <Link href="/monero-phishing-sites">how to spot a fake Monero wallet site</Link> walks through the checks and the rescue.
      </p>

      <h2 id="alternatives">Exodus Monero alternatives</h2>
      <p>Looking for a new home for your XMR? These options accept what Exodus left you with:</p>
      <table>
        <thead><tr><th>Wallet</th><th>12 Exodus words</th><th>25-word mnemonic</th><th>Good for</th></tr></thead>
        <tbody>
          <tr><td><Link href={walletUrl}>MonkStash</Link></td><td>Yes</td><td>Yes</td><td>A free web wallet in your browser, no install, no account</td></tr>
          <tr><td>Cake Wallet</td><td>Yes (BIP39, 12 words)</td><td>Yes</td><td>The wallet Exodus names in its own guide; mobile and desktop</td></tr>
          <tr><td>Feather</td><td>Not listed (its <a href="https://docs.featherwallet.org/guides/seed-scheme" rel="noopener">seed docs</a> name Polyseed, 14 and 25 words)</td><td>Yes</td><td>Desktop users who want a dedicated Monero app</td></tr>
        </tbody>
      </table>
      <p>
        Exodus points to Cake Wallet as one example and adds that Cake is a third party it cannot vouch for. The same caution applies
        to every wallet, ours included. Compare more options in our <Link href="/monero-wallets">Monero wallets guide</Link>.
      </p>

      <h2 id="next">What to do next</h2>
      <p>
        Count your words, restore in a wallet you reached yourself, and check the address. Your XMR has been waiting the whole time.{" "}
        <Link href={walletUrl}><strong>Restore my Exodus wallet</strong></Link> in MonkStash now, then save the 25-word seed it shows in
        Settings so you are never tied to one app again.
      </p>
    </>
  );
}
