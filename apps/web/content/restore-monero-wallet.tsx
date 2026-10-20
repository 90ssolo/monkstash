import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { IlloBackup, IlloViewKey } from "@/components/art/Illustrations";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "restore-monero-wallet",
  section: "guides",
  kicker: "Get your wallet back",
  title: "How to Restore a Monero Wallet From Seed (Recovery Words)",
  seoTitle: "How to Restore a Monero Wallet From Seed",
  summary: "Restore a Monero wallet from seed: enter your 25 recovery words on any device, set a restore height for a fast sync, and fix a wrong balance.",
  keyword: "restore monero wallet",
  updated: "2026-10-15",
  readingMinutes: 8,
  toc: [
    { id: "when", label: "When you need to restore" },
    { id: "need", label: "What you need" },
    { id: "steps", label: "Restore step by step" },
    { id: "date", label: "The restore date" },
    { id: "wait", label: "What to expect while it syncs" },
    { id: "missing", label: "If some money looks missing" },
    { id: "words", label: "Word count and typo problems" },
    { id: "watch", label: "Watch-only restore" },
    { id: "after", label: "After you restore" },
    { id: "next", label: "What to do next" },
  ],
  related: ["back-up-monero-wallet", "create-monero-wallet", "monero-wallet-not-syncing", "monero-restore-height"],
  faq: [
    { q: "How do I restore a Monero wallet?", a: "Open a Monero wallet, choose the restore option, type your 25 recovery words in order, enter roughly when you made the wallet if you know it, set a new password, and wait for the wallet to scan the network." },
    { q: "Can I restore my wallet on a new device?", a: "Yes. Your recovery words work in any Monero wallet, on any device. That is the whole point of a backup. Enter the 25 words and your money will appear once the wallet finishes checking the network." },
    { q: "Why is my balance taking so long to appear?", a: "The wallet has to scan the network to find your payments. If you know roughly when you first made the wallet, enter that date so it can skip ahead. Without a date it checks the entire history, which takes much longer." },
    { q: "I have my recovery words but a different number of them.", a: "Standard Monero wallets use 25 words. MyMonero used 13 words, and Exodus used a 12-word phrase for all its coins. MonkStash restores all three: the 13 and 12 word phrases are converted in your browser using each wallet's own derivation. A 16-word seed is a Polyseed from Feather or Cake Wallet, which MonkStash cannot restore yet." },
    { q: "Can I restore a 12-word Monero seed?", a: "Usually yes, if it came from Exodus: MonkStash converts it to the matching 25-word wallet in your browser. Ledger and Coinomi turn 12 or 24 words into Monero keys differently, so always check that the restored address matches the one you used before." },
    { q: "Can I restore a 16-word Monero seed?", a: "A 16-word seed is a Polyseed, the default in Feather and Cake Wallet. MonkStash cannot restore Polyseed yet, so restore it in Feather or Cake Wallet. If you want it in MonkStash, send the funds from there to a new MonkStash address." },
    { q: "Do I need my old password to restore?", a: "No. The password only protected the copy on your old device. You set a new password when you restore." },
    { q: "Will restoring on a second device break the first one?", a: "No. The same words can open the wallet on several devices at once. Be careful, though: each extra device is another place that could be lost or stolen." },
    { q: "Can I restore a Monero wallet without the recovery words?", a: "Not in any way we can help with. Without the words, or a saved copy of the wallet file and its password, there is no way to rebuild the wallet, and no one can recover it for you." },
  ],
  sources: [
    { label: "Monero user guide: Restoring a wallet from a mnemonic seed (GUI and CLI)", href: "https://www.getmonero.org/resources/user-guides/restore_account.html" },
    { label: "Monero user guide: Changing the wallet restore height (lower is safer than higher)", href: "https://www.getmonero.org/resources/user-guides/change-restore-height.html" },
    { label: "Monero documentation: Mnemonics (25-word, 13-word MyMonero and 16-word Polyseed)", href: "https://docs.getmonero.org/mnemonics/" },
    { label: "Moneropedia: Mnemonic seed (25 words, the last is a checksum)", href: "https://www.getmonero.org/resources/moneropedia/mnemonicseed.html" },
    { label: "Monero user guide: Making a view-only wallet", href: "https://www.getmonero.org/resources/user-guides/view_only.html" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        If you lose your phone, clear your browser, or simply want to move to a different wallet, <mark>your Monero is not gone</mark>. As long
        as you have your seed, you can bring your wallet back on any device. The seed (also called the recovery words or mnemonic, 25 words in all) is what restores a wallet. This guide walks you through a restore
        in plain language, explains the one setting that decides how fast it goes, and shows what to do when something looks wrong.
      </p>

      <Takeaways items={[
        "Your 25 recovery words restore your wallet on any device. You do not need your old password.",
        "Entering roughly when you made the wallet makes the restore much faster.",
        "If a balance looks low after restoring, the restore date is usually the reason, not lost money.",
        "A watch-only restore lets you check an address without being able to spend from it.",
      ]} />

      <h2 id="when">When you need to restore</h2>
      <p>People restore a wallet for a few common reasons:</p>
      <ul>
        <li>You lost, broke, or replaced your phone or computer.</li>
        <li>You cleared your browser data and the wallet disappeared.</li>
        <li>You forgot your wallet password. <mark>The money is fine, and restoring with your words is the fix</mark>.</li>
        <li>You want to move to a different Monero wallet.</li>
        <li>You want to test that your backup works. This is a smart habit, covered in the <Link href="/back-up-monero-wallet">backup guide</Link>.</li>
      </ul>

      <h2 id="need">What you need</h2>
      <p>
        <mark>You need your 25 recovery words</mark>, written in the right order. That is it. You do not need your old device, your old
        password, or any account. The password only protected the copy on your old device, so you will set a new one during the
        restore. Not sure what kind of phrase you have? The <Link href="/tools/monero-seed-doctor">seed doctor</Link> tells you without asking for the words. If your words came from MyMonero, see <Link href="/restore-mymonero-seed">how to restore a MyMonero seed</Link>. Coming from Exodus? Exodus ended Monero support in August 2025, and if you have its 12 words you can enter them as they are: MonkStash turns them into the standard 25-word seed for the same wallet. Our guide to <Link href="/exodus-monero">getting your Monero back from Exodus</Link> covers the whole move.
      </p>
      <Figure caption="Your written recovery words are all you need to bring a wallet back.">
        <IlloBackup />
      </Figure>
      <Callout kind="warn" title="Only restore in a wallet you trust">
        Type your words only into a wallet you opened yourself from a bookmark or an official source. <Link href="/monero-phishing-sites">A fake site</Link> that asks you to
        &quot;restore&quot; or &quot;verify&quot; your wallet is a common scam, and it will empty your funds as soon as you press
        enter.
      </Callout>

      <h2 id="steps">Restore step by step</h2>
      <ol>
        <li>Open the <Link href={walletUrl}>wallet</Link> and choose <strong>Restore from recovery words</strong>.</li>
        <li>Type your 25 words in order. Check the spelling as you go, and watch for any word the wallet does not recognize.</li>
        <li>If you know roughly when you first created the wallet, enter that date. It is optional, but it makes the next step much faster.</li>
        <li>Set a new password to lock the wallet on this device.</li>
        <li>Wait while the wallet checks the network. Your balance and history appear as it finishes.</li>
        <li>Compare your main address with the one you saved. <mark>If the first and last characters match, the restore is right</mark>.</li>
      </ol>

      <h2 id="date">Why the restore date matters</h2>
      <p>
        Monero hides payment details, so a wallet cannot simply look up a balance. It has to scan the network block by block to
        find the payments that belong to you. A block is a batch of transactions, and a new one arrives about every 2 minutes.
        Telling the wallet roughly when yours started lets it skip everything before that and go straight to the part that matters.
        <mark>Without a date, it starts from the very beginning</mark>, which can take a long time.
      </p>
      <Callout title="When in doubt, pick an earlier date">
        If you are not sure of the date, choose one a little earlier than you think. Starting too early just adds a short wait.
        Starting too late can miss some of your payments until you fix it. The{" "}
        <a href="https://www.getmonero.org/resources/user-guides/restore_account.html" rel="noopener">official Monero restore guide</a> gives
        the same advice.
      </Callout>
      <p>
        Some wallets ask for a block number, <Link href="/monero-restore-height">called the restore height</Link>, instead of a date. Both mean the same thing: where to
        start looking. If you only have a date, a wallet that accepts dates will convert it for you.
      </p>

      <h2 id="wait">What to expect while it syncs</h2>
      <p>
        A restore is not instant. The wallet is doing real work, and the time depends on how far back it needs to look and how fast
        the connection is. A recent wallet may take a minute or two. An old wallet restored from the very beginning can take much
        longer.
      </p>
      <ul>
        <li>Your balance may show zero or a partial amount until the scan reaches the end. This is normal.</li>
        <li>Keep the tab open and the device awake. Closing it pauses progress.</li>
        <li>The wallet talks to a Monero node to read the network. See <Link href="/monero-node">what a Monero node is</Link> if that is new to you.</li>
      </ul>
      <p>
        If the progress seems stuck, try <Link href="/monero-wallet-not-syncing">fixing a wallet that will not sync</Link>.
      </p>

      <h2 id="missing">If some money looks missing</h2>
      <p>
        If your balance is lower than expected after restoring, do not panic. <mark>The usual cause is a restore date set too late</mark>, so
        the wallet has not scanned far enough back to find older payments. Restore again with an earlier date, or let it scan from
        the beginning. Give it time to finish before deciding anything is wrong.
      </p>
      <p>Other things to check, in order:</p>
      <ol>
        <li>Is the sync complete? A partly synced wallet shows a partial balance.</li>
        <li>Did recent payments settle? New Monero needs about 10 confirmations (roughly 20 minutes) before it is spendable.</li>
        <li>Is the address the same as before? If not, a word may be wrong, which brings us to the next section.</li>
      </ol>

      <h2 id="words">Word count and typo problems</h2>
      <p>
        Standard Monero wallets use 25 words, and <mark>the last one is a checksum that catches most typos</mark>. If the wallet says the words
        are invalid, check these common causes:
      </p>
      <table>
        <thead><tr><th>Problem</th><th>What to try</th></tr></thead>
        <tbody>
          <tr><td>A word is misspelled</td><td>Compare each word letter by letter with your paper</td></tr>
          <tr><td>Words are in the wrong order</td><td>Check your numbering, 1 to 25</td></tr>
          <tr><td>You have 24 or 26 words</td><td>One word is missing or doubled; look for it</td></tr>
          <tr><td>You have 13 words</td><td>This was a MyMonero-style phrase; MonkStash restores it (see <Link href="/restore-mymonero-seed">restoring a MyMonero seed</Link>)</td></tr>
          <tr><td>You have 12 words</td><td>Likely an Exodus phrase; MonkStash and Cake Wallet restore it (see <Link href="/exodus-monero">Exodus and Monero</Link>). Ledger and Coinomi derive 12 words differently, so check the address</td></tr>
          <tr><td>You have 16 words</td><td>A Polyseed from Feather or Cake Wallet. MonkStash cannot restore it yet; restore it in Feather or Cake Wallet</td></tr>
          <tr><td>A different language list</td><td>Some wallets let you choose the word list language</td></tr>
        </tbody>
      </table>
      <p>
        A wrong word that still passes the checksum is rare, but it can happen. If a restore works but shows an unfamiliar address,
        recheck every word before assuming the wallet is broken.
      </p>

      <h2 id="watch">Watch-only restore</h2>
      <p>
        If you only want to keep an eye on an address, you can add a <Link href="/monero-view-only-wallet">watch-only wallet</Link> instead, using the address and its private
        view key. It shows incoming payments but cannot spend, which is handy for checking funds on a device you do not fully trust.
      </p>
      <Figure caption="A view key lets a wallet see incoming payments without being able to spend them.">
        <IlloViewKey />
      </Figure>
      <p>
        Keep in mind that a view key is still private information: anyone who has it can see your incoming payments. When you want
        to spend again, restore the full wallet from your recovery words.
      </p>

      <h2 id="after">After you restore</h2>
      <p>
        Once your balance shows up, take a few short steps to get safe again.
      </p>
      <ul>
        <li>Check your backup is still safe and has not been seen by anyone. If your old device was stolen, consider moving your funds to a brand new wallet.</li>
        <li>Make sure the new password is strong and unique.</li>
        <li>Remove the wallet from any device you no longer control.</li>
      </ul>
      <p>
        If your old device was stolen and was unlocked, the thief could have used it. Moving funds to a new wallet with fresh words
        is the safest answer, and it costs only a small network fee.
      </p>

      <h2 id="next">What to do next</h2>
      <p>
        Your wallet is back. If you restored because of a lost device, read{" "}
        <Link href="/back-up-monero-wallet">how to back up a Monero wallet</Link> to make sure the next loss is a non-event.
        If you are new to all this, start with <Link href="/create-monero-wallet">creating a wallet</Link> and{" "}
        <Link href="/what-is-monero">what Monero is</Link>, or <Link href={walletUrl}>open your wallet</Link> to get going.
      </p>
    </>
  );
}
