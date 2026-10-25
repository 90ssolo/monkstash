import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { PolyseedAnatomyArt, PolyseedOneWayArt } from "@/components/art/MoneroPolyseedArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-polyseed",
  section: "guides",
  kicker: "Seed formats",
  title: "Monero Polyseed: What a 16-Word Seed Is and How to Restore It",
  seoTitle: "Monero Polyseed: The 16-Word Seed Explained",
  summary: "A 16-word Monero seed is a Polyseed, made by Feather and Cake Wallet. What it stores, which wallets restore it, passphrases, and the one-way 25-word switch.",
  keyword: "monero 16 word seed",
  updated: "2026-10-25",
  readingMinutes: 8,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "inside", label: "What the 16 words hold" },
    { id: "wallets", label: "Which wallets make and restore it" },
    { id: "restore", label: "How to restore a Polyseed" },
    { id: "passphrase", label: "Polyseed passphrases" },
    { id: "convert", label: "Polyseed to 25 words: one way only" },
    { id: "damaged", label: "A word is missing or wrong" },
    { id: "zero", label: "Restored, but the balance is zero" },
    { id: "next", label: "Next steps" },
  ],
  related: ["monero-seed-phrase", "restore-monero-wallet", "back-up-monero-wallet", "feather-wallet-review"],
  sources: [
    { label: "Polyseed specification and reference library (tevador/polyseed)", href: "https://github.com/tevador/polyseed" },
    { label: "Monero documentation: Polyseed mnemonic scheme", href: "https://docs.getmonero.org/mnemonics/polyseed/" },
    { label: "Feather Wallet documentation: Seed scheme (Polyseed, 14 and 25 words, Show 25 word seed)", href: "https://docs.featherwallet.org/guides/seed-scheme" },
    { label: "Feather Wallet documentation: Recovering a damaged Polyseed", href: "https://docs.featherwallet.org/guides/damaged-seed" },
    { label: "Cake Wallet documentation: Monero (Polyseed default, legacy and BIP39 options)", href: "https://docs.cakewallet.com/cryptos/monero" },
  ],
  faq: [
    { q: "My Monero seed has 16 words. What is it?", a: "A 16-word Monero seed is a Polyseed. Feather makes them since version 2.0 and Cake Wallet uses them by default for new Monero wallets. It is a complete backup of your wallet, and it also stores the month the wallet was made, so you do not need a restore height." },
    { q: "Which wallets can restore a 16-word Polyseed?", a: "Feather, Cake Wallet and MonkStash restore Polyseeds directly. If you need a wallet that only reads 25-word seeds, open the Polyseed in Feather and use Wallet, Seed, Show 25 word seed to get the 25-word version of the same wallet." },
    { q: "Can I convert a 25-word seed into a Polyseed?", a: "No. The conversion only goes one way. A Polyseed can be shown as a 25-word seed, but a 25-word seed cannot become a Polyseed, because Polyseed makes the key with a one-way function. To get a Polyseed, create a new Polyseed wallet and send your funds to it." },
    { q: "Do I need a restore height for a Polyseed?", a: "No. The words store the wallet's creation date to within about a month, so the wallet knows where to start scanning on its own." },
    { q: "Is a 16-word seed less secure than a 25-word seed?", a: "Not in practice. Polyseed holds a 150-bit secret and is designed for 128-bit security, the same level as the elliptic curve that Monero keys use, so the curve, not the shorter phrase, sets the limit. What matters far more is that nobody else ever sees your words." },
    { q: "What is a Polyseed passphrase?", a: "An optional extra word or phrase set when the wallet was made. Depending on the wallet it either encrypts the 16 words or works as a seed offset. Either way, the words without the passphrase open a different, empty wallet, so store the passphrase as carefully as the words." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        <strong>Found 16 words where you expected 25?</strong> Nothing is wrong. You have a <strong>Polyseed</strong>, the
        newer Monero seed format that Feather and Cake Wallet use. It backs up your whole wallet in fewer words, and it{" "}
        <mark>remembers when your wallet was born</mark>, so a restore never asks you for a block height.
      </p>
      <p>
        This guide explains what those 16 words hold, which wallets read them, how passphrases work, and the one rule that
        catches people out: you can turn a Polyseed into 25 words, but never the other way round.
      </p>

      <Takeaways items={[
        "16 words = Polyseed. Feather (since 2.0) and Cake Wallet make them by default.",
        "Feather, Cake Wallet and MonkStash restore them directly. No restore height needed.",
        "A Polyseed can be shown as 25 words. A 25-word seed can never become a Polyseed.",
        "If you set a passphrase, the words alone open a different, empty wallet.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        A Monero 16-word seed is a <a href="https://github.com/tevador/polyseed" rel="noopener">Polyseed</a>: a recovery phrase
        that holds your wallet&apos;s secret, the month the wallet was created, a few feature flags and a checksum.{" "}
        <mark>It is a full backup</mark>, exactly like a 25-word seed. To use it, restore it in a wallet that reads Polyseed:
        Feather, Cake Wallet or MonkStash. Write the words down in order, keep them offline, and treat any passphrase you set
        as part of the backup.
      </p>
      <KeyFact label="How to recognise one">
        Exactly 16 words, from the same 2,048-word list that many crypto wallets use. A standard Monero seed has 25 words, a
        MyMonero phrase 13, an old Feather seed 14 and an Exodus phrase 12.
      </KeyFact>
      <p>
        Not sure what you have? The <Link href="/tools/monero-seed-doctor">seed doctor</Link> tells you in two questions,
        without asking for the words.
      </p>

      <h2 id="inside">What the 16 words hold</h2>
      <p>
        Each word stands for 11 bits, so 16 words carry 176 bits. The{" "}
        <a href="https://github.com/tevador/polyseed" rel="noopener">Polyseed specification</a> splits them into four parts.
      </p>
      <Figure caption="Inside a Polyseed: the secret, the wallet's birthday, feature flags and a checksum.">
        <PolyseedAnatomyArt />
      </Figure>
      <ul>
        <li><strong>Your secret (150 bits).</strong> This is the wallet. Everything else is bookkeeping.</li>
        <li><strong>Birthday (10 bits).</strong> The month the wallet was made, with dates from November 2021 to 2107. This is what lets a restore <mark>skip years of blocks</mark> without you looking up a <Link href="/monero-restore-height">restore height</Link>.</li>
        <li><strong>Features (5 bits).</strong> Flags such as &quot;this seed is encrypted with a passphrase&quot;.</li>
        <li><strong>Checksum (11 bits).</strong> Catches any single wrong word, so a typo fails loudly instead of opening the wrong wallet.</li>
      </ul>
      <p>
        Two more details from the specification are useful in real life. In languages written with the Latin alphabet, the
        first four letters of each word are enough to identify it, which helps with smudged handwriting. And a Monero
        Polyseed carries a coin flag, so <mark>it will not validate as a seed for another coin</mark> by accident.
      </p>

      <h2 id="wallets">Which wallets make and restore it</h2>
      <table>
        <caption>Polyseed support by wallet (checked 2026-10-25 against each wallet&apos;s documentation)</caption>
        <thead><tr><th>Wallet</th><th>Makes Polyseeds</th><th>Restores Polyseeds</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><th>Feather</th><td>Yes, default since 2.0</td><td>Yes</td><td>Also restores 14 and 25 word seeds, and can show a Polyseed as 25 words</td></tr>
          <tr><th>Cake Wallet</th><td>Yes, default for new Monero wallets</td><td>Yes</td><td>Legacy 25-word and 12-word BIP39 are options; pick the right seed type when restoring</td></tr>
          <tr><th>MonkStash</th><td>No (makes 25-word seeds)</td><td>Yes, with passphrase</td><td>Reads it in your browser with the same reference library Monero uses</td></tr>
          <tr><th>Monero GUI and CLI</th><td>No</td><td>Check your version</td><td>The official restore guide still describes 25-word seeds; use Feather&apos;s 25-word version to be safe</td></tr>
        </tbody>
      </table>
      <p>
        The <a href="https://docs.getmonero.org/mnemonics/polyseed/" rel="noopener">Monero documentation</a> notes the format
        was adopted by the community ahead of the core wallets, which is why support is uneven.{" "}
        <mark>Count your words before you pick a wallet</mark>, and if a wallet asks for a seed type, choose Polyseed.
      </p>

      <h2 id="restore">How to restore a Polyseed</h2>
      <p>In MonkStash it takes about two minutes, in your browser, and the words never leave your device.</p>
      <Steps items={[
        { title: "Open the wallet and choose Restore", body: <p><Link href={walletUrl}>Open MonkStash</Link>, then choose <strong>Restore from recovery words</strong>.</p> },
        { title: "Enter the 16 words in order", body: <p>MonkStash spots a Polyseed by its length. There is no date to enter: the words carry it.</p> },
        { title: "Add the passphrase, if you set one", body: <p>Open <strong>My seed has a passphrase</strong> and type it exactly, including capitals and spaces. Skip this if you never set one.</p> },
        { title: "Set a wallet password", body: <p>This locks the wallet on this device. It is not your passphrase and not your recovery words.</p> },
        { title: "Check the address", body: <p>Compare the main address with one your old wallet showed. If they match, you are in the right wallet. Then let it sync.</p> },
      ]} />
      <p>
        In <strong>Feather</strong>, choose to restore from seed and enter the 16 words. In <strong>Cake Wallet</strong>,
        restore from your recovery phrase and make sure the seed type is Polyseed, not Legacy. Our{" "}
        <Link href="/restore-monero-wallet">general restore guide</Link> covers 25-word seeds and the restore height those
        need.
      </p>

      <h2 id="passphrase">Polyseed passphrases</h2>
      <p>
        Some wallets let you add a passphrase when you create a Polyseed wallet. It works in one of two ways, and you do not
        need to know which: <mark>you only need the exact passphrase</mark>.
      </p>
      <ul>
        <li><strong>Encrypted seed.</strong> The specification has a flag for a Polyseed encrypted with a passphrase. The words then mean nothing without it.</li>
        <li><strong>Seed offset.</strong> The words stay normal, and the passphrase changes the keys they produce. The <a href="https://docs.getmonero.org/mnemonics/polyseed/" rel="noopener">Monero documentation</a> recommends this method and says most wallets, including the core Monero wallets, do not implement the encryption flag.</li>
      </ul>
      <p>
        MonkStash handles both: it decrypts an encrypted Polyseed with your passphrase, and applies the passphrase as a seed
        offset otherwise, the same way Monero does. If an encrypted Polyseed arrives without its passphrase, MonkStash says so
        instead of guessing.
      </p>
      <Callout kind="warn" title="A wrong passphrase gives no error">
        With a seed offset, a wrong or missing passphrase quietly opens a different, valid, empty wallet. That is by design,
        and it is why you should always check the address after a restore. Store the passphrase separately from the words,
        and make sure someone you trust could find both.
      </Callout>

      <h2 id="convert">Polyseed to 25 words: one way only</h2>
      <p>
        Polyseed runs your words through a one-way key derivation (PBKDF2, 10,000 rounds) to make the wallet&apos;s key. That
        key can be written out as a standard 25-word seed, so{" "}
        <a href="https://docs.featherwallet.org/guides/seed-scheme" rel="noopener">Feather</a> can show you the 25-word version
        of any Polyseed wallet: <strong>Wallet, Seed</strong>, enter your password, then tick <strong>Show 25 word seed</strong>.
      </p>
      <Figure caption="Polyseed to 25 words works. A 25-word seed can never be turned into a Polyseed.">
        <PolyseedOneWayArt />
      </Figure>
      <p>
        The reverse is impossible, because a one-way function cannot be run backwards. If you want a Polyseed for an existing
        25-word wallet, <mark>create a new Polyseed wallet and send your funds to it</mark>. Two things to keep in mind if you
        write down the 25-word version: it does not carry the birthday, so note a restore height with it, and it is a
        second complete backup that needs the same protection as the first.
      </p>

      <h2 id="damaged">A word is missing or wrong</h2>
      <p>
        The checksum catches a single wrong word and can fill in a single missing word whose position you know. For more
        damage, <a href="https://docs.featherwallet.org/guides/damaged-seed" rel="noopener">Feather has a Seed Recovery tool</a>:
        open restore from seed and press <strong>Ctrl + K</strong>, enter the words you know in their positions, leave the
        unknown ones blank, and let it search. Feather warns that every extra unknown word makes the search much slower, and
        the tool needs the word order.
      </p>
      <p>
        Never paste your words into a website or app that offers to &quot;fix&quot; them. Recovery tools that matter run
        offline, on your own computer. Our <Link href="/monero-phishing-sites">phishing guide</Link> shows the tricks used to
        collect seed words.
      </p>

      <h2 id="zero">Restored, but the balance is zero</h2>
      <ol>
        <li><strong>Wait for the sync.</strong> The balance builds up as the wallet scans. Judge it only when it says it is up to date.</li>
        <li><strong>Check the address.</strong> A different address means a different wallet: usually a missing or mistyped passphrase, or the wrong seed type selected in Cake.</li>
        <li><strong>Check the network.</strong> A wallet made on a test network will look empty on the main network.</li>
        <li><strong>Look for other accounts.</strong> Some wallets keep several accounts under one seed.</li>
      </ol>
      <p>
        More causes and fixes are in <Link href="/monero-wallet-not-showing-balance">Monero wallet not showing balance</Link>.
      </p>

      <h2 id="next">Next steps</h2>
      <ul>
        <li>Restore your 16 words in <Link href={walletUrl}>the MonkStash wallet</Link> and check the address.</li>
        <li>Make a proper offline backup with the <Link href="/back-up-monero-wallet">backup guide</Link>.</li>
        <li>Compare every seed format, from 12 to 25 words, in the <Link href="/monero-seed-phrase">Monero seed phrase guide</Link>.</li>
      </ul>
    </>
  );
}
