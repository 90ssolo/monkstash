import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { IlloBackup } from "@/components/art/Illustrations";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "back-up-monero-wallet",
  section: "guides",
  kicker: "Keep your money safe",
  title: "Monero Wallet Backup: How to Back Up Your Recovery Words",
  seoTitle: "Monero Wallet Backup: Save Your Recovery Words",
  summary: "Monero wallet backup made simple: write down your 25 recovery words, store them safely, test the backup, and avoid the mistakes that lose money.",
  keyword: "monero wallet backup",
  updated: "2026-10-15",
  readingMinutes: 8,
  toc: [
    { id: "what", label: "What a backup really is" },
    { id: "why", label: "Why it matters so much" },
    { id: "how", label: "How to write them down" },
    { id: "materials", label: "Paper, metal, or something else?" },
    { id: "store", label: "Where to keep them" },
    { id: "password", label: "Password vs recovery words" },
    { id: "avoid", label: "Mistakes that lose money" },
    { id: "test", label: "Test your backup" },
    { id: "extras", label: "Other things worth saving" },
    { id: "next", label: "What to do next" },
  ],
  related: ["restore-monero-wallet", "create-monero-wallet", "receive-monero", "monero-seed-phrase"],
  faq: [
    { q: "What are recovery words?", a: "Recovery words are a list of 25 words (some wallets call them a seed phrase) that stand for the private keys to your wallet. Anyone who has them can take your Monero, and they are the only way to get your wallet back if you lose your device." },
    { q: "How do I back up a Monero wallet?", a: "Write your 25 recovery words on paper, numbered and in order, then store the paper somewhere safe and private. Then test the backup by restoring it into a fresh wallet and checking that the same address appears." },
    { q: "Can I store my recovery words on my phone or computer?", a: "It is safer not to. A photo, screenshot, notes app, or cloud file can be reached by harmful software or by anyone who gets into your accounts. Writing the words on paper and keeping the paper somewhere safe avoids that." },
    { q: "What if I lose my recovery words?", a: "If you lose both your recovery words and access to your wallet, the money cannot be recovered by anyone, including us. That is why a careful backup matters so much." },
    { q: "Do I need to back up my wallet again after I receive or send money?", a: "No. Your 25 recovery words stay the same for the life of the wallet. You back them up once, and they cover every payment you ever receive, including ones that arrive later." },
    { q: "Is my password a backup?", a: "No. A password only protects the copy of the wallet in one browser. It cannot rebuild the wallet on another device. Only your recovery words can do that." },
    { q: "Should I keep more than one copy?", a: "For anything beyond a small amount, yes. Keep a second copy in a different place so one fire, flood, or theft does not destroy every copy. Just remember that each extra copy is another place someone could find it." },
  ],
  sources: [
    { label: "Moneropedia: Mnemonic seed (25 words, the last is a checksum; a full backup of your funds)", href: "https://www.getmonero.org/resources/moneropedia/mnemonicseed.html" },
    { label: "Monero documentation: Mnemonics (how seeds back up and restore wallets)", href: "https://docs.getmonero.org/mnemonics/" },
    { label: "The Monero Project: FAQ (never back up your seed in the cloud)", href: "https://www.getmonero.org/get-started/faq/" },
    { label: "Monero user guide: Restoring a wallet from a mnemonic seed", href: "https://www.getmonero.org/resources/user-guides/restore_account.html" },
    { label: "Monero user guide: Changing the wallet restore height", href: "https://www.getmonero.org/resources/user-guides/change-restore-height.html" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A Monero wallet backup comes down to one thing: the list of 25 recovery words you get when you make a wallet. They are the single most important thing to protect,
        because they are <mark>the only backup you have</mark>. Nobody can reset them for you, and nobody can recover them if they are gone.
        This guide shows you how to write them down, where to keep them, and how to check that your backup really works, in plain
        language and with no jargon you have to look up.
      </p>

      <Takeaways items={[
        "Your 25 recovery words are the only backup of your wallet. Back them up once and they cover everything.",
        "Write them on paper, numbered and in order. Do not take a photo or save them online.",
        "Anyone who has the words can take your money, so keep them private and never type them into a website you did not open yourself.",
        "Test your backup by restoring it before you put real money in.",
      ]} />

      <h2 id="what">What a backup really is</h2>
      <p>
        Your Monero does not live on your phone or in your browser. It lives on the Monero network. What lives on your device is the
        set of private keys that prove the money is yours. <Link href="/monero-seed-phrase">Your recovery words</Link> are a plain-words version of those keys. If your
        device is lost, broken, or wiped, you type the words into any Monero wallet and your money is there again.
      </p>
      <Figure caption="Write all 25 recovery words on paper, numbered and in order. Never a screenshot.">
        <IlloBackup />
      </Figure>
      <p>
        The 25th word is a{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/mnemonicseed.html" rel="noopener">checksum</a>. It works like a spell-check: it lets the wallet notice if one of the other 24 words was
        written down wrong. It does not replace the other words, so you still need all 25.
      </p>

      <h2 id="why">Why it matters so much</h2>
      <p>
        With a bank, you can forget your password and still get in, because the bank can verify who you are. A self-custody
        wallet works the other way. <mark>There is no company holding a copy</mark>, so there is nobody to ask. That is what makes it
        yours, and it is also why the backup is your job.
      </p>
      <Callout kind="warn" title="There is no support line for this">
        No one can recover your recovery words for you, because no one else has them. If you lose the words and lose access to the
        wallet, <mark>the money is gone for good</mark>. Likewise, anyone who finds your words can spend your money without needing your password.
      </Callout>
      <p>
        Backups also protect you from everyday accidents: a phone that falls in water, a laptop that dies, a browser that gets
        reset. None of those lose your money if the words are safe. To see what happens next, read{" "}
        <Link href="/restore-monero-wallet">how to restore a Monero wallet</Link>.
      </p>

      <h2 id="how">How to write them down</h2>
      <ol>
        <li>Find a quiet, private place. Make sure nobody can see your screen, and that no camera is pointed at it.</li>
        <li>Take a pen (not a pencil, which fades and smudges) and clean paper.</li>
        <li>Write all 25 words in the exact order shown, and number them 1 to 25.</li>
        <li>Read each word back against the screen. Check the spelling letter by letter.</li>
        <li>Confirm the words in the wallet when it asks. This proves your written copy is right.</li>
        <li>Close or hide the screen, and put the paper away before you do anything else.</li>
      </ol>
      <p>
        Write the words in the same language the wallet showed. Do not shorten them to the first few letters unless you fully
        understand how your wallet reads them, since a mistake here is hard to spot later.
      </p>

      <h2 id="materials">Paper, metal, or something else?</h2>
      <p>
        Paper is fine for most people. It costs nothing, needs no power, and cannot be hacked. Its weakness is that fire,
        water, and time can ruin it. Here is how the common choices compare.
      </p>
      <table>
        <thead><tr><th>Option</th><th>Strength</th><th>Weakness</th></tr></thead>
        <tbody>
          <tr><td>Paper and pen</td><td>Free, simple, offline</td><td>Burns, tears, and fades</td></tr>
          <tr><td>Metal plate or stamp</td><td>Survives fire and water</td><td>Costs money; stamping takes care</td></tr>
          <tr><td>Password manager</td><td>Easy to reach</td><td>Online; one breach exposes everything</td></tr>
          <tr><td>Photo or screenshot</td><td>None worth the risk</td><td>Syncs to the cloud and can be stolen</td></tr>
        </tbody>
      </table>
      <p>
        If you hold a meaningful amount, <mark>a metal backup is a sensible upgrade</mark>. Whatever you choose, keep it offline.
      </p>

      <h2 id="store">Where to keep them</h2>
      <p>
        The aim is simple: you can always get to the words, and no one else can. A locked drawer, a home safe, or a safe deposit
        box all work. Think about the kinds of loss that could hit you, such as theft, fire, flooding, or moving house, and ask
        whether one event could take your backup and your device together.
      </p>
      <ul>
        <li>Do not keep the backup in the same bag as the device that holds the wallet.</li>
        <li>For larger amounts, keep a second copy in a different building, such as a trusted family member&apos;s home.</li>
        <li>Make sure someone you trust would know where to look if something happened to you, without handing them the words today.</li>
        <li>Do not label the paper &quot;Monero recovery words.&quot; A plain envelope in a sensible place draws less attention.</li>
      </ul>

      <h2 id="password">Password vs recovery words</h2>
      <p>
        These two get mixed up often. Your password locks the wallet on one browser. <mark>Your recovery words rebuild the wallet</mark>
        anywhere. They are not interchangeable, and having one does not replace the other.
      </p>
      <table>
        <thead><tr><th>&nbsp;</th><th>Password</th><th>Recovery words</th></tr></thead>
        <tbody>
          <tr><td>What it does</td><td>Locks this browser&apos;s copy</td><td>Rebuilds the wallet on any device</td></tr>
          <tr><td>If you forget it</td><td>Restore with your words</td><td>Money is unrecoverable</td></tr>
          <tr><td>If someone finds it</td><td>Useless without your device</td><td>They can spend your money</td></tr>
        </tbody>
      </table>

      <h2 id="avoid">Mistakes that lose people money</h2>
      <ul>
        <li><strong>Taking a screenshot or photo.</strong> Anything on a connected device can be copied by harmful software, and <mark>photos often sync to the cloud on their own</mark>.</li>
        <li><strong>Saving the words in a notes app, email, or cloud drive.</strong> One hacked account then exposes your wallet.</li>
        <li><strong>Typing them into a site because a message asked you to &quot;verify&quot; your wallet.</strong> <mark>No real wallet does this</mark>. It is a scam.</li>
        <li><strong>Sharing them with &quot;support.&quot;</strong> Real support will never ask for your words.</li>
        <li><strong>Writing them from memory later.</strong> Write them as soon as they appear, with the screen in front of you.</li>
        <li><strong>Never testing the backup.</strong> A typo you find on day one costs nothing. A typo you find after a disaster costs everything.</li>
      </ul>
      <p>
        <Link href="/monero-phishing-sites">Fake wallet sites</Link> are a common way people get tricked into giving up their words. Read{" "}
        <Link href="/is-monero-safe">whether Monero is safe</Link> for more on the real risks.
      </p>

      <h2 id="test">Test your backup</h2>
      <p>
        <mark>A backup you have not tested is a guess</mark>. The safest way to be sure is to restore your words into a fresh wallet and check
        that the same address appears. Do this before you deposit any real money.
      </p>
      <ol>
        <li>Note the first and last few characters of your wallet address.</li>
        <li>Open a second browser profile, or a private window, and choose <strong>Restore from recovery words</strong>.</li>
        <li>Type your written words in order, as if you had lost everything.</li>
        <li>Compare the address that appears. If it matches, your backup works.</li>
      </ol>
      <p>
        If it does not match, find the typo now and fix the paper. The full steps are in the{" "}
        <Link href="/restore-monero-wallet">restore guide</Link>.
      </p>

      <h2 id="extras">Other things worth saving</h2>
      <p>
        The recovery words are the only thing you truly need, but a few extra notes make a restore smoother. You can write them on
        the same paper, away from the words if you prefer.
      </p>
      <ul>
        <li><strong>The date you created the wallet.</strong> This lets you restore much faster later, because the wallet can skip older blocks (<Link href="/monero-restore-height">the starting point is called the restore height</Link>).</li>
        <li><strong>The first few characters of your main address.</strong> This helps you confirm a restore worked.</li>
        <li><strong>Which wallet you used.</strong> It helps you or a family member find the right tool.</li>
      </ul>

      <h2 id="next">What to do next</h2>
      <p>
        With your words safely on paper and tested, your wallet is protected against the most common ways of losing money. You
        can now <Link href={walletUrl}>open your wallet</Link> and start using it. If you have not yet made one, follow{" "}
        <Link href="/create-monero-wallet">how to create a Monero wallet</Link>, then learn how to{" "}
        <Link href="/receive-monero">receive Monero</Link>. For a fuller picture of how Monero keeps funds private,
        see <Link href="/how-monero-works">how Monero works</Link>.
      </p>
    </>
  );
}
