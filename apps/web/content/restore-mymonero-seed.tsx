import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { PhraseLengthsFigure, SafeVersusCloneFigure } from "@/components/art/RestoreMymoneroSeedArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "restore-mymonero-seed",
  section: "guides",
  kicker: "Former MyMonero users",
  title: "How to Restore a MyMonero Seed (13 or 25 Words) After the Shutdown",
  seoTitle: "How to Restore a MyMonero Seed (13 or 25 Words)",
  summary: "Restore a MyMonero seed after the shutdown: your money is still on the Monero network, and MonkStash restores both 13-word and 25-word phrases.",
  keyword: "restore mymonero seed",
  updated: "2026-10-15",
  readingMinutes: 11,
  toc: [
    { id: "happened", label: "What happened to MyMonero" },
    { id: "which", label: "Which phrase do you have?" },
    { id: "twentyfive", label: "Restore your phrase with MonkStash" },
    { id: "height", label: "Restore height in plain words" },
    { id: "thirteen", label: "If you have 13 words" },
    { id: "table", label: "Where to restore your phrase today" },
    { id: "scams", label: "Avoid the clone sites" },
    { id: "after", label: "After your balance appears" },
    { id: "next", label: "What to do next" },
  ],
  related: ["restore-monero-wallet", "monero-phishing-sites", "monero-seed-phrase", "use-monero"],
  faq: [
    { q: "Where do I restore my MyMonero wallet now that it has shut down?", a: "MyMonero's own site points users to Cake Wallet and its guide for restoring a Monero seed phrase. Any wallet that supports your phrase type also works, because the words open the wallet, not the app. If you have 25 words, MonkStash, Cake Wallet and Feather can all restore them. If you have 13 words, MonkStash restores those too." },
    { q: "Is my money lost because MyMonero closed?", a: "No. Your Monero is recorded on the Monero network, not on MyMonero's servers. MyMonero said that users keep control of their funds through their seed phrase, and that only access to its servers (to view a balance or send) ended on 6 January 2026." },
    { q: "What is a MyMonero 13 word seed?", a: "It is a MyMonero-style recovery phrase of 13 words: 12 words that carry the seed plus one checksum word. The Monero documentation lists it as a separate mnemonic type from the standard 25-word phrase, and it derives keys differently." },
    { q: "Can I restore a MyMonero 13 word seed in Cake Wallet?", a: "Sources disagree. Cake Wallet's app store listing says it supports it, but Cake's own MyMonero guide only covers 25-word phrases, and one user on Cake's forum reported that a 13-word phrase would not restore. Test with the wallet first, and compare the address it shows with the one you remember." },
    { q: "Does MonkStash support MyMonero 13-word seeds?", a: "Yes. MonkStash restores 13-word MyMonero phrases in your browser, using MyMonero's own way of turning the words into keys. We checked it against published MyMonero test phrases, and the wallet engine refuses to open if the address does not match the keys. Support is new, so compare the address with your old MyMonero address before you move money." },
    { q: "How do I tell if my phrase is 13 or 25 words?", a: "Count the words. Thirteen words is a MyMonero-style phrase. Twenty-five words is the standard Monero phrase that most wallets use. Twelve or 24 words is usually not Monero at all, but a phrase from a different kind of wallet." },
    { q: "What is a restore height and do I need one?", a: "A restore height is the point in the Monero network's history where a wallet starts looking for your payments. You do not strictly need one, but an approximate date makes the restore much faster. Pick a date a little before your first payment." },
    { q: "Why do search results for MyMonero look suspicious?", a: "Scammers know that former MyMonero users are searching for a place to restore their wallet. Fake sites that ask for your words are a known risk. Only restore in a wallet you reached from a bookmark or an official source." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        You can still restore a MyMonero seed, and <mark>your money is not stuck</mark>. Your Monero lives on the Monero network, and your recovery
        phrase is the key that opens it in any wallet that understands that type of phrase. If you have <strong>25 words</strong>, you
        can restore them today in MonkStash, Cake Wallet or Feather. If you have <strong>13 words</strong>, the older MyMonero format,{" "}
        <mark>MonkStash restores those too</mark>, right in your browser. Either way, be extra careful about where you type them.
      </p>

      <Takeaways items={[
        "MyMonero closed on 6 January 2026. The service is gone, but the money is on the Monero network and your words still open it.",
        "Count your words. 25 words restores in most Monero wallets, including MonkStash. 13 words is an older MyMonero format that fewer wallets read.",
        "MonkStash restores 13-word MyMonero phrases in your browser. Support is new, so check the address matches your old one.",
        "Never type your words into a site you found through an ad, a search result you did not verify, or a message. Use a bookmark.",
      ]} />

      <h2 id="happened">What happened to MyMonero</h2>
      <p>
        MyMonero was a popular web wallet that relied on its own servers to find your payments and show your balance. In October 2025 it announced that it would sunset its wallet service. According to the
        announcement, which Cake Wallet republished on its blog, the service would go offline on <strong>Tuesday 6 January
        2026</strong>, and MyMonero would permanently destroy its data by 6 February 2026. The announcement also named Cake Wallet as
        the project&apos;s stewardship partner and its migration path. You can read it at the{" "}
        <a href="https://blog.cakewallet.com/announcing-mymoneros-sunset-and-stewardship-transition-to-cake-wallet/" rel="noopener">Cake Wallet announcement</a>.
      </p>
      <p>
        The key point is what the shutdown did and did not change. After that date you could no longer use MyMonero&apos;s servers to
        view a balance or send a transaction. Your funds did not move or disappear, because they were never stored on those servers.
        The announcement itself says that your seed phrase <mark>will always work with any Monero wallet</mark>. MyMonero&apos;s website now says the
        service has closed and points to Cake Wallet&apos;s guide for restoring from a seed phrase.
      </p>
      <p>
        If you want the wider picture of the choices you have now, our guide to a{" "}
        <Link href="/mymonero-alternative">MyMonero alternative</Link> compares them.
      </p>
      <Figure caption="The money lives on the network. Your words are the key, and the key does not care which app you turn it in.">
        <PhraseLengthsFigure />
      </Figure>

      <h2 id="which">Which phrase do you have?</h2>
      <p>
        Before you open any wallet, count the words on your paper or in your password manager. The number tells you where you can
        restore.
      </p>
      <table>
        <thead><tr><th>Words</th><th>What it usually is</th><th>What to do</th></tr></thead>
        <tbody>
          <tr><td>25</td><td>The standard Monero phrase (called legacy). 24 words plus a checksum word. MyMonero could also show you one of these.</td><td>Restore in MonkStash, Cake Wallet or Feather. Read the next section.</td></tr>
          <tr><td>13</td><td>A MyMonero-style phrase. 12 words plus a checksum word.</td><td>Restore in MonkStash. Read the next section, then &quot;If you have 13 words&quot; below.</td></tr>
          <tr><td>16</td><td>A Polyseed, a newer Monero format.</td><td>Not a MyMonero phrase, but Cake Wallet and Feather can restore it.</td></tr>
          <tr><td>12 or 24</td><td>Almost certainly not Monero. Usually from a Bitcoin or Ethereum wallet.</td><td>Do not enter it in a Monero wallet. Find the wallet it belongs to.</td></tr>
        </tbody>
      </table>
      <p>
        The Monero project documents the three Monero phrase types in its{" "}
        <a href="https://docs.getmonero.org/mnemonics/" rel="noopener">mnemonics reference</a>: legacy (25 words), MyMonero (13
        words) and Polyseed (16 words). <mark>The 13th word of a MyMonero phrase is a checksum</mark>, which is how a wallet notices a typo.
      </p>
      <p>
        If you are still unsure what a seed phrase is, start with our explainer on the{" "}
        <Link href="/monero-seed-phrase">Monero seed phrase</Link>.
      </p>

      <h2 id="twentyfive">Restore your phrase with MonkStash</h2>
      <p>
        MonkStash restores both MyMonero phrase types: the standard 25 words and the older 13 words. Your words are used on your own
        device to rebuild the wallet, and they are never sent to a server. Here is the whole restore, step by step:
      </p>
      <ol>
        <li>Open MonkStash from a bookmark you made yourself, or type the address straight into your browser. Go to the <Link href={walletUrl}>wallet</Link>.</li>
        <li>Choose <strong>Restore from recovery words</strong>.</li>
        <li>Type your 25 words, or your 13 MyMonero words, in order. The last word is a checksum, so a typo is usually caught right away.</li>
        <li>Enter roughly when you first used MyMonero, if you know it (more on this below). It is optional, but it saves a lot of waiting.</li>
        <li>Set a new password. It locks the wallet on this device only. It is not part of your phrase.</li>
        <li>Wait while the wallet scans the network. Your balance and history appear as it finishes.</li>
        <li>Compare the main address with the one you remember from MyMonero. If it matches, you are done.</li>
      </ol>
      <p>
        You can run the address through our{" "}
        <Link href="/tools/monero-address-validator">Monero address validator</Link> to confirm that it is well formed. For a longer
        walkthrough, including what to do if the balance looks low, see{" "}
        <Link href="/restore-monero-wallet">how to restore a Monero wallet</Link>.
      </p>
      <Callout title="Honest note on MonkStash">
        MonkStash is an early preview and has not been independently audited, and 13-word support is brand new. If you hold a large
        amount, confirm the address matches first, then send a small test amount before moving everything.
      </Callout>

      <h2 id="height">Restore height in plain words</h2>
      <p>
        Monero hides the details of payments, so a wallet cannot simply look up your balance. It has to scan the network block by
        block to find the payments that belong to you. The <strong>restore height</strong> is just the block where you tell it to
        start. A wallet that starts at the beginning of Monero&apos;s history will find everything but take a long time. A wallet that
        starts too late may miss older payments and show a balance that is too low.
      </p>
      <ul>
        <li>If you remember roughly when you first used MyMonero, pick a date a month or two earlier. That is safe and fast.</li>
        <li>If you do not remember, start from the beginning and be patient.</li>
        <li>If the balance looks low afterwards, restore again with an earlier date before you assume anything is missing.</li>
      </ul>
      <p>
        Cake Wallet&apos;s own MyMonero guide gives the same advice: pick a date close to when you started using MyMonero so syncing
        stays fast without missing transactions.
      </p>

      <h2 id="thirteen">If you have 13 words</h2>
      <p>
        Good news: <mark>MonkStash restores 13-word MyMonero phrases</mark>. Many wallets cannot, so here is why the format is
        different, how we handle it, and what to check.
      </p>
      <h3>Why 13 words is different</h3>
      <p>
        According to the Monero documentation, the MyMonero scheme is the 13-word version of the legacy scheme: the first 12 words
        carry the seed and the 13th is a checksum. The seed is shorter, so the private keys are worked out from it in a different
        way. That is why a wallet that only knows the standard 25-word format rejects it, or worse, would build a different wallet
        from the same words.
      </p>
      <h3>How MonkStash restores it</h3>
      <ul>
        <li><strong>In your browser, nowhere else.</strong> The words are decoded and turned into keys on your device, using the same steps MyMonero used. Nothing is uploaded.</li>
        <li><strong>Tested against MyMonero&apos;s own results.</strong> We checked our conversion against three published MyMonero phrases whose keys and addresses were produced by MyMonero (the <a href="https://github.com/moneroexamples/mymonero-keys" rel="noopener">moneroexamples test cases</a>). Every key and address matches.</li>
        <li><strong>A built-in safety check.</strong> The wallet engine refuses to open a wallet if the address does not belong to the keys, so a mistake cannot quietly give you the wrong wallet.</li>
        <li><strong>Typos are caught.</strong> The 13th word is a checksum. If a word is misspelled or out of order, you get a clear message instead of an empty wallet.</li>
      </ul>
      <Callout title="Check this one thing">
        After the restore, compare the main address with the one you remember from MyMonero (an old screenshot, an exchange
        withdrawal record or an email receipt helps). If it matches, it is your wallet. If it does not, do not send money to it, and{" "}
        <Link href="/support">tell us</Link>.
      </Callout>
      <h3>Other wallets</h3>
      <ul>
        <li>
          <strong>Cake Wallet.</strong> MyMonero names Cake Wallet as its successor. Cake&apos;s{" "}
          <a href="https://docs.cakewallet.com/tutorials/mymonero/" rel="noopener">MyMonero guide</a> covers 25-word phrases only.
          Cake&apos;s app store listing says it supports restoring from a MyMonero 13-word seed, but one user on Cake&apos;s forum reported
          that a 13-word phrase would not restore. Those two statements disagree, so <mark>treat 13-word support in Cake as unconfirmed</mark>{" "}
          until you have tried it yourself. Our <Link href="/monero-wallets/cake-wallet-review">Cake Wallet review</Link> covers the
          rest of the app.
        </li>
        <li>
          <strong>Feather Wallet.</strong> Feather&apos;s{" "}
          <a href="https://docs.featherwallet.org/guides/seed-scheme" rel="noopener">seed documentation</a> says it restores Polyseeds
          (16 words) and 14-word and 25-word seeds. It does not list the 13-word MyMonero format. More in our{" "}
          <Link href="/monero-wallets/feather-wallet-review">Feather wallet review</Link>.
        </li>
        <li>
          <strong>Official Monero wallets.</strong> The Monero documentation lists the 13-word type but does not say which wallets
          read it. The official software is built around the 25-word format.
        </li>
      </ul>
      <h3>You do not need a converter</h3>
      <p>
        You may see offline tools that turn a MyMonero phrase into a 25-word one. With a wallet that reads 13 words directly, you
        can skip that step entirely, along with its risks.
      </p>
      <Callout kind="warn" title="Do not hand the words to anyone to convert">
        A converter that runs on someone else&apos;s server sees your words. Anyone who sees them can take your money. Someone offering
        to &quot;fix&quot; a 13-word phrase for you is a scammer until proven otherwise.
      </Callout>

      <h2 id="table">Where to restore your phrase today</h2>
      <table>
        <thead><tr><th>Your phrase</th><th>Where to restore it today</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>25 words</td><td><Link href={walletUrl}>MonkStash</Link></td><td>Free web wallet, early preview, keys stay on your device.</td></tr>
          <tr><td>25 words</td><td>Cake Wallet (choose &quot;Legacy (25 words)&quot;)</td><td>MyMonero&apos;s named successor. Its guide covers exactly this case.</td></tr>
          <tr><td>25 words</td><td>Feather Wallet</td><td>Desktop wallet. Restores 25-word seeds.</td></tr>
          <tr><td>13 words</td><td><Link href={walletUrl}>MonkStash</Link></td><td>Restores MyMonero 13-word phrases in your browser. New, so compare the address with your old one.</td></tr>
          <tr><td>16 words</td><td>Cake Wallet or Feather</td><td>A Polyseed, not a MyMonero phrase.</td></tr>
          <tr><td>12 or 24 words</td><td>Not a Monero wallet</td><td>Find the wallet it belongs to.</td></tr>
        </tbody>
      </table>
      <p>
        This table reflects public documentation at the time of writing. Wallets change, so check the project&apos;s current guide
        before you commit a large balance. Our <Link href="/monero-wallets">Monero wallets guide</Link> covers the other options.
      </p>

      <h2 id="scams">Avoid the clone sites</h2>
      <p>
        When a well-known wallet shuts down, scammers go where its users are going: search results. A person typing &quot;restore
        MyMonero wallet&quot; into a search box is looking for exactly one thing, and a convincing look-alike page that asks for the
        words is the cheapest way to take it. Fake wallet sites and apps that steal keys are not new: a researcher documented a fake
        Android app that copied MyMonero&apos;s look and sent the keys typed into it to an attacker&apos;s database (see{" "}
        <a href="https://serhack.me/articles/phishing-mymonero-app-android-fake/" rel="noopener">SerHack&apos;s write-up</a>).
      </p>
      <Figure caption="Same words, two outcomes. The only difference is how you got to the page.">
        <SafeVersusCloneFigure />
      </Figure>
      <p>Follow these rules every time:</p>
      <ol>
        <li><strong>Never type your words into a site you reached from an ad, a message, a post or an email.</strong> Search ads can be paid for by anyone.</li>
        <li><strong>Use a bookmark.</strong> Get to the wallet once from an official source, check the address carefully, then bookmark it and use only the bookmark.</li>
        <li><strong>Read the domain, letter by letter.</strong> Extra words, swapped letters and odd endings are the classic tricks.</li>
        <li><strong>Be suspicious of anything asking you to &quot;verify&quot; or &quot;sync&quot; your wallet.</strong> A real wallet restores from your words once, locally, and never needs them again.</li>
        <li><strong>Ignore offers of help in comments and direct messages.</strong> <mark>Nobody legitimate will ask for your words</mark>.</li>
      </ol>
      <p>
        For a full routine you can run in 60 seconds, read{" "}
        <Link href="/monero-phishing-sites">how to spot a fake Monero wallet</Link>. If you already entered your words on a
        site you are unsure about, treat them as compromised and move your funds to a new wallet right away. That page shows how.
      </p>

      <h2 id="after">After your balance appears</h2>
      <ul>
        <li><strong>Write the words down again, on paper</strong>, and store them somewhere safe. See <Link href="/back-up-monero-wallet">how to back up a Monero wallet</Link>.</li>
        <li><strong>Consider a fresh wallet.</strong> If your old phrase lived in a password manager, an email draft or a photo, sending your funds to a brand-new wallet with new words closes that door. It costs only a small network fee.</li>
        <li><strong>Keep the old phrase out of sight.</strong> Once the funds have moved, the old phrase can be destroyed.</li>
      </ul>

      <h2 id="next">What to do next</h2>
      <p>
        Count your words, restore in a wallet you reached yourself, and compare the address. If you are new to Monero after
        MyMonero, <Link href="/use-monero">how to use Monero</Link> is a good next read. When you are ready,{" "}
        <Link href={walletUrl}>open a wallet</Link>. If something does not match, ask us through <Link href="/support">support</Link>{" "}
        and never share your words while you do.
      </p>
    </>
  );
}
