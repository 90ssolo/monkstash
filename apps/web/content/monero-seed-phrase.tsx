import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps } from "@/components/article/parts";
import { ChapterHead, DeepDive, FactStrip, UseCases, YoullLearn } from "@/components/pillar/parts";
import { Figure } from "@/components/art/Figure";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { KeyPowerArt, LostSeedArt, RestoreHeightArt, SeedTreeArt, WordCountArt } from "@/components/art/SeedPhrasePillarArt";
import { KeyPowerNarrow, LostSeedNarrow, RestoreHeightNarrow, SeedTreeNarrow, WordCountNarrow } from "@/components/art/SeedPhrasePillarNarrowArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-seed-phrase",
  section: "learn",
  layout: "pillar",
  kicker: "The complete guide",
  title: "Monero Seed Phrase (25 Words): The Complete Guide for 2026",
  seoTitle: "Monero Seed Phrase (25 Words): The 2026 Guide",
  h1: { keyword: "Monero seed phrase", sizzle: "Twenty-five words. Your whole wallet." },
  summary: "Your Monero seed phrase is 25 words that hold your whole wallet. Learn what they are, how to store them, restore with them and keep them from thieves.",
  keyword: "Monero seed phrase",
  updated: "2026-10-15",
  readingMinutes: 21,
  toc: [
    { id: "what", label: "What is a Monero seed phrase?" },
    { id: "why-25", label: "Why 25 words? The word list and checksum" },
    { id: "formats", label: "25, 16, 14, 13 or 12 words: which seed?" },
    { id: "keys", label: "Seed vs keys: spend key, view key, address" },
    { id: "store", label: "How to store your seed phrase safely" },
    { id: "passphrase", label: "Does Monero have a seed passphrase?" },
    { id: "restore", label: "Restoring from your seed (and restore height)" },
    { id: "check", label: "How to check your seed is correct" },
    { id: "lost", label: "Lost your seed? What can be recovered" },
    { id: "scams", label: "Seed phrase scams: who may ask for it" },
    { id: "exposed", label: "What to do if your seed is exposed" },
  ],
  chapterBlurbs: {
    what: "Twenty-five ordinary words that are your wallet, on any device.",
    "why-25": "24 words carry the secret. The 25th catches your typos.",
    formats: "Count your words before you restore. The number tells you a lot.",
    keys: "One seed, two private keys, one address. What each can do.",
    store: "Paper or metal, offline, in two places. Never a photo.",
    passphrase: "An optional extra word that changes the wallet. Powerful, and unforgiving.",
    restore: "Any compatible wallet can rebuild yours. Start the scan early enough.",
    check: "Three ways to know your backup works before you need it.",
    lost: "What you still have decides what is possible.",
    scams: "Nobody legitimate ever asks for your words. Nobody.",
    exposed: "Move the money to a new wallet. A password change will not help.",
  },
  related: ["back-up-monero-wallet", "restore-monero-wallet", "create-monero-wallet", "monero-phishing-sites", "restore-mymonero-seed"],
  sources: [
    { label: "Monero documentation: Legacy (25-word) mnemonic scheme, word list, checksum and seed offset", href: "https://docs.getmonero.org/mnemonics/legacy/" },
    { label: "Monero documentation: Polyseed (16-word) mnemonic scheme", href: "https://docs.getmonero.org/mnemonics/polyseed/" },
    { label: "Monero documentation: MyMonero (13-word) mnemonic scheme", href: "https://docs.getmonero.org/mnemonics/mymonero/" },
    { label: "Moneropedia: Mnemonic seed (words map to the private spend key; view key is a hash of it)", href: "https://www.getmonero.org/resources/moneropedia/mnemonicseed.html" },
    { label: "Moneropedia: Spend key", href: "https://www.getmonero.org/resources/moneropedia/spendkey.html" },
    { label: "Moneropedia: View key", href: "https://www.getmonero.org/resources/moneropedia/viewkey.html" },
    { label: "Moneropedia: Account (spend key, view key and seed)", href: "https://www.getmonero.org/resources/moneropedia/account.html" },
    { label: "Monero user guide: Restoring a wallet from a 25-word seed (GUI and CLI)", href: "https://www.getmonero.org/resources/user-guides/restore_account.html" },
    { label: "Monero user guide: Restoring a wallet from its private keys", href: "https://www.getmonero.org/resources/user-guides/restore_from_keys.html" },
    { label: "Monero user guide: Making a view-only wallet", href: "https://www.getmonero.org/resources/user-guides/view_only.html" },
    { label: "Polyseed specification and source code (tevador)", href: "https://github.com/tevador/polyseed" },
    { label: "Feather Wallet documentation: Seed scheme (Polyseed, 25-word conversion)", href: "https://docs.featherwallet.org/guides/seed-scheme" },
    { label: "Cake Wallet documentation: Monero seed types", href: "https://docs.cakewallet.com/cryptos/monero" },
    { label: "Cake Wallet and MyMonero: MyMonero sunset on 6 January 2026", href: "https://blog.cakewallet.com/announcing-mymoneros-sunset-and-stewardship-transition-to-cake-wallet/" },
    { label: "BIP39: the Bitcoin mnemonic standard (2,048-word list, 12 to 24 words)", href: "https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki" },
  ],
  faq: [
    { q: "What is a Monero seed phrase?", a: "It is a list of 25 ordinary words that encodes the secret behind your wallet. Anyone who has the words can open the wallet and spend the money, and anyone who loses them (and every device that holds the wallet) loses access for good. Treat the words as the wallet itself." },
    { q: "How many words is a Monero seed?", a: "The standard Monero seed has 25 words: 24 that encode your secret and a 25th checksum word that catches typing mistakes. Feather and Cake Wallet use a 16-word format called Polyseed, and the old MyMonero service used 13 words. Count your words before you restore." },
    { q: "My Monero seed has 12 words. Why?", a: "A 12-word phrase for Monero usually comes from Exodus, which used one phrase for all coins, or from Cake Wallet's optional BIP39-style seed. It is not the standard 25-word format. MonkStash converts Exodus 12-word phrases; check that the restored address matches the one you used before." },
    { q: "My Monero seed has 16 words. Why?", a: "A 16-word seed is a Polyseed, the default in Feather and Cake Wallet. It stores the wallet's creation date inside the words. Restore it in Feather or Cake Wallet; MonkStash cannot restore Polyseed yet." },
    { q: "Can I use my Monero seed in a Bitcoin wallet?", a: "No. Standard Monero seeds are not BIP39 phrases. They use a different 1,626-word list and a different way of turning words into keys, so a Bitcoin wallet cannot read them. Always restore in a Monero wallet you trust." },
    { q: "Is the seed phrase the same as the private key?", a: "For a standard 25-word seed, yes in effect: the words are your private spend key written in a human-friendly form. Your private view key is derived from the spend key by hashing it, so the 25 words give you both keys and your address." },
    { q: "Can I recover a Monero wallet without the seed phrase?", a: "Sometimes. If the wallet still opens on one of your devices, you can show the words again and write them down. If you saved your private spend key, you can restore from keys. With only the address and view key you can watch incoming payments but never spend. With none of these, the money cannot be recovered." },
    { q: "Is the 25th word a passphrase?", a: "No. In Monero the 25th word is a checksum, calculated from the other 24. It is not a secret extra word. Monero does support an optional seed offset passphrase, but that is something you type separately when you restore, and not every wallet offers it." },
    { q: "What do I do if someone sees my seed phrase?", a: "Assume the money is at risk. Create a new wallet with a fresh seed, back it up, and send everything from the old wallet to the new one as soon as you can. Changing a wallet password does not help, because the old words still work without it." },
    { q: "Does anyone legitimate ever ask for my seed phrase?", a: "No. Not support staff, not a wallet developer, not an exchange, not a giveaway. Anyone who asks for your words is trying to take your money." },
  ],
};

export function Hero() {
  return <Adaptive wide={<SeedTreeArt />} narrow={<SeedTreeNarrow />} />;
}

export function Body() {
  return (
    <>
      <p>
        <strong>Your Monero seed phrase</strong> is 25 ordinary words that are your wallet. Not a password for it, not a
        backup of some account somewhere: the wallet itself. Whoever holds the words can open it on any device and spend
        from it. Whoever loses them, along with every device that held the wallet, <mark>loses the money for good</mark>.
      </p>
      <p>
        That sounds heavy. It is also the best news in this guide, because it means no bank, no company and no support desk
        stands between you and your money. Get these 25 words right once, and you are in full control for life.
      </p>

      <YoullLearn items={[
        <>What the 25 words are, and why the last one is different</>,
        <>How to tell a 25-word seed from a 16-word Polyseed, a 13-word MyMonero phrase or a 12-word Exodus phrase</>,
        <>How the seed relates to your spend key, view key and address</>,
        <>How to store your words so that you can always get them back and nobody else can</>,
        <>What to do if your seed is lost, exposed or asked for by a stranger</>,
      ]} />
      <p>Let&apos;s get started.</p>

      {/* 1 */}
      <ChapterHead n={1} id="what" title="What is a Monero seed phrase?" />
      <p>
        Under the hood, a Monero wallet is a pair of secret numbers called <strong>keys</strong>. Each is 256 bits long. Written
        out, a key is 64 random-looking characters, which is hopeless to copy by hand without a mistake.
      </p>
      <p>
        A seed phrase is a friendlier way to write the same secret. Instead of a wall of characters, you get 25 words from a
        fixed list, in a fixed order. The words and the key are <mark>two spellings of the same number</mark>, and a wallet can
        turn one into the other in an instant. The{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/mnemonicseed.html" rel="noopener">Monero glossary</a> puts it
        plainly: the phrase has all the information needed to view and spend your funds.
      </p>
      <KeyFact label="The one-line answer">
        A Monero seed phrase is 25 words that encode your wallet&apos;s private spend key. With them, <mark>any Monero wallet
        can rebuild yours</mark>, on any device, at any time.
      </KeyFact>
      <p>
        You will see the same thing under several names: <strong>seed</strong>, <strong>mnemonic seed</strong>,{" "}
        <strong>recovery phrase</strong> and <strong>recovery words</strong>. They all mean the 25 words. MonkStash calls them
        recovery words on screen.
      </p>
      <h3>What the words let you do</h3>
      <UseCases items={[
        { icon: "save", title: "Survive a lost or broken device", body: "Phones die and browsers get cleared. The words bring the wallet back." },
        { icon: "world", title: "Open your wallet anywhere", body: "Restore the same wallet on a laptop, a phone or a second browser." },
        { icon: "shield", title: "Switch apps without asking", body: "No account to migrate. Any wallet that reads your format opens it." },
        { icon: "give", title: "Plan for your family", body: "A sealed copy in the right place lets someone you trust reach the funds." },
      ]} />
      <p>
        The flip side is the reason this guide exists. The words work for <em>anyone</em> who has them, and nobody can reset
        them, freeze them or reverse a payment made with them.
      </p>

      {/* 2 */}
      <ChapterHead n={2} id="why-25" title="Why 25 words? The word list and checksum" />
      <p>
        The 25 words are really 24 plus one. According to the{" "}
        <a href="https://docs.getmonero.org/mnemonics/legacy/" rel="noopener">Monero documentation</a>, the first 24 words carry
        the seed and <mark>the last word is a checksum</mark>. The wallet works it out from the first three letters of each of the
        other 24 words, then picks one of those 24 words as the 25th.
      </p>
      <p>
        That is why the official{" "}
        <a href="https://www.getmonero.org/resources/user-guides/restore_account.html" rel="noopener">restore guide</a> warns that
        some words may repeat. The 25th word is always a copy of one of the first 24. It is not a mistake on your paper.
      </p>
      <FactStrip items={[
        { value: "25", label: "Words in a standard seed" },
        { value: "1,626", label: "Words on the list" },
        { value: "12", label: "Languages available" },
        { value: "1", label: "Checksum word" },
        { value: "Nobody", label: "Who may ask for it" },
      ]} />
      <h3>The Monero seed word list</h3>
      <p>
        Every word comes from a fixed list of 1,626 words, chosen at random by your wallet. The list exists in 12 languages,
        including English, Spanish, German, French, Russian, Japanese and Chinese, and the English list is public in the{" "}
        <a href="https://github.com/monero-project/monero/blob/master/src/mnemonics/english.h" rel="noopener">Monero source code</a>.
        On the English list, no two words share the same first three letters, which makes a sloppy handwritten word easier to
        identify. Still write every word out in full.
      </p>
      <h3>What the checksum does for you</h3>
      <p>
        If you copy a word wrong, skip one or swap two, the final word usually stops matching and the wallet refuses the phrase
        instead of quietly opening an empty wallet. Think of it as <mark>a spell checker for your money</mark>.
      </p>
      <p>
        It has a limit. The checksum catches most slips, not every one. If a restore succeeds but shows an address you do not
        recognize, recheck every word against your paper before you assume anything else. Chapter 8 covers how to check.
      </p>
      <Callout title="Not a Bitcoin phrase">
        Bitcoin and many other coins use a standard called{" "}
        <a href="https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki" rel="noopener">BIP39</a>: a 2,048-word list and
        phrases of 12 to 24 words. A standard Monero seed uses neither. A Bitcoin wallet cannot read it, so never paste your
        words into one to &quot;see if it works&quot;.
      </Callout>

      {/* 3 */}
      <ChapterHead n={3} id="formats" title="25, 16, 14, 13 or 12 words: which seed?" />
      <p>
        The 25-word seed is the standard, and most Monero wallets use it. But the{" "}
        <a href="https://docs.getmonero.org/mnemonics/" rel="noopener">Monero documentation</a> lists three formats, and some wallets
        add a fourth. The quickest way to know yours is to <mark>count the words</mark>.
      </p>
      <Figure caption="The number of words tells you the format, and the format tells you which wallets can restore it.">
        <Adaptive wide={<WordCountArt />} narrow={<WordCountNarrow />} />
      </Figure>
      <table>
        <caption>Monero seed formats: which wallets create and restore each (checked 15 October 2026)</caption>
        <thead><tr><th>Words</th><th>Format</th><th>Created by</th><th>Restored by</th><th>Restore date</th></tr></thead>
        <tbody>
          <tr><th>25</th><td>Standard (also called legacy)</td><td>Monero GUI and CLI, MonkStash, Cake Wallet (Legacy option), and most other Monero wallets</td><td>Almost every Monero wallet, including MonkStash, Feather and Cake Wallet</td><td>Not stored: write the date down</td></tr>
          <tr><th>16</th><td>Polyseed</td><td>Feather and Cake Wallet, by default</td><td>Feather and Cake Wallet. MonkStash cannot restore it yet</td><td>Built into the words</td></tr>
          <tr><th>14</th><td>Old Feather seed</td><td>Feather before version 2.0, no longer created</td><td>Feather</td><td>Handled by Feather</td></tr>
          <tr><th>13</th><td>MyMonero</td><td>The MyMonero web wallet, closed on 6 January 2026</td><td>MonkStash</td><td>Not stored</td></tr>
          <tr><th>12</th><td>Exodus phrase, or a BIP39-style option in Cake Wallet</td><td>Exodus (one phrase for all coins; Monero support ended in 2025), Cake Wallet as an option</td><td>MonkStash for Exodus phrases; Cake&apos;s option only in wallets that support it</td><td>Depends on the wallet</td></tr>
        </tbody>
      </table>
      <h3>16 words: Polyseed</h3>
      <p>
        <a href="https://github.com/tevador/polyseed" rel="noopener">Polyseed</a> is a newer format with 16 words. Its big idea
        is that the words also store the wallet&apos;s creation date, to within about a month, so a wallet{" "}
        <mark>never has to ask you for a restore height</mark>. Feather&apos;s documentation says it uses Polyseed for its 16-word seeds,
        and{" "}
        <a href="https://docs.cakewallet.com/cryptos/monero" rel="noopener">Cake Wallet&apos;s documentation</a> says new Monero
        wallets there use it by default.
      </p>
      <p>
        The catch is compatibility. Not every wallet reads Polyseed, and the conversion only goes one way.{" "}
        <a href="https://docs.featherwallet.org/guides/seed-scheme" rel="noopener">Feather explains</a> that a Polyseed wallet can
        show you its 25-word equivalent, but a 25-word wallet can never become a Polyseed one, because Polyseed runs the words
        through a one-way step to make the key. MonkStash cannot restore a Polyseed directly yet, so a Polyseed owner would
        restore here with that 25-word version, or keep the wallet in Feather or Cake Wallet.
      </p>
      <h3>14 words: an old Feather seed</h3>
      <p>
        Before Polyseed, Feather made its own 14-word seeds. Its{" "}
        <a href="https://docs.featherwallet.org/guides/seed-scheme" rel="noopener">seed documentation</a> says versions before
        2.0.0 used them, and that current Feather can still restore 14 and 25 word seeds. If you have 14 words, restore them in
        Feather; from there you can move the funds anywhere.
      </p>
      <h3>13 words: MyMonero</h3>
      <p>
        The old MyMonero web wallet used a shorter phrase: 12 words plus a checksum. According to the{" "}
        <a href="https://docs.getmonero.org/mnemonics/mymonero/" rel="noopener">Monero documentation</a>, it turns words into keys
        differently from the 25-word format, so a wallet must support it specifically. MyMonero shut down in January 2026, and
        MonkStash restores 13-word phrases in your browser using MyMonero&apos;s own key derivation. Our{" "}
        <Link href="/restore-mymonero-seed">guide to restoring a MyMonero seed</Link> walks through it.
      </p>
      <h3>12 words: usually Exodus</h3>
      <p>
        Exodus used one 12-word phrase for every coin in the app, Monero included, until it ended Monero support in 2025.
        MonkStash converts an Exodus 12-word phrase into the matching 25-word Monero wallet in your browser. Our guide to{" "}
        <Link href="/exodus-monero">getting your Monero back from Exodus</Link> walks through it, including how to check you
        landed on the right address.
      </p>
      <Callout kind="warn" title="12 or 24 words? Slow down">
        A 12- or 24-word phrase is usually a Bitcoin-style phrase from a different kind of wallet, or the recovery phrase of a
        hardware device. Cake Wallet can also create a 12-word Monero seed, which only works in wallets that support that option.
        If you are not sure what made your phrase, find out before you type it anywhere. Hardware wallets have their own rules,
        covered in <Link href="/monero-wallets/hardware">our hardware wallet guide</Link>.
      </Callout>

      {/* 4 */}
      <ChapterHead n={4} id="keys" title="Seed vs keys: spend key, view key, address" />
      <p>
        A Monero wallet, or account, is built on{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/account.html" rel="noopener">two key pairs</a>: a spend key and
        a view key. Each has a private half you guard and a public half you can share. Your seed sits above all of them.
      </p>
      <ul>
        <li><strong>The seed is the private spend key.</strong> For a standard seed, the 25 words are{" "}
          <a href="https://www.getmonero.org/resources/moneropedia/spendkey.html" rel="noopener">another way of writing your private spend key</a>,
          the key that signs payments.</li>
        <li><strong>The view key comes from the spend key.</strong> Your wallet makes the private view key by hashing the spend
          key. One secret produces the other, so <mark>the 25 words cover everything</mark>.</li>
        <li><strong>The address comes from the public halves.</strong> The public spend key and public view key together form
          your primary address, the one that starts with a 4.</li>
      </ul>
      <p>
        Every arrow runs one way. Nobody can work backwards from your address to your keys, or from your view key to your spend
        key.
      </p>
      <Figure caption="Four secrets, four levels of power. Only the address is safe to give to anyone.">
        <Adaptive wide={<KeyPowerArt />} narrow={<KeyPowerNarrow />} />
      </Figure>
      <h3>The view key: a window, not a door</h3>
      <p>
        The private view key lets a wallet find payments coming in, but it cannot spend them. Give a wallet your address plus
        your view key and you get a <Link href="/monero-view-only-wallet">view-only wallet</Link>: handy for watching a balance
        on a device you do not fully trust, or for showing income to an accountant. MonkStash can import one as a watch-only
        wallet.
      </p>
      <p>
        Two honest limits. The{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/viewkey.html" rel="noopener">Moneropedia view key entry</a> notes
        that outgoing payments cannot be reliably seen with it, so <mark>a view-only balance can be wrong</mark> once you have
        spent. And a view key still reveals every payment you receive, so it is private information too.
      </p>
      <h3>Restoring from keys instead of words</h3>
      <p>
        Wallets such as the Monero GUI and CLI can also{" "}
        <a href="https://www.getmonero.org/resources/user-guides/restore_from_keys.html" rel="noopener">restore from keys</a>:
        your address, private view key and private spend key. It works, but 64-character keys are much harder to copy by hand
        than 25 words. For most people, the words are the better backup.
      </p>
      <DeepDive paths={["/monero-view-key", "/monero-view-only-wallet"]} />

      {/* 5 */}
      <ChapterHead n={5} id="store" title="How to store your seed phrase safely" />
      <p>
        The goal sounds simple: you can always get the words back, and nobody else can. Those two aims pull in opposite
        directions. More copies make loss less likely and theft more likely. Good storage is a balance, and for most people the
        balance looks like this:
      </p>
      <Steps items={[
        { title: "Write the words by hand, on paper", body: <p>Use a pen, number them 1 to 25, and write each word in full. Check the spelling against the screen, word by word.</p> },
        { title: "Add the date you made the wallet", body: <p>Not secret, but very useful. A date is all you need for a fast restore later (chapter 7).</p> },
        { title: "Make a second copy, and keep it somewhere else", body: <p>A home safe plus a trusted relative&apos;s home, or a bank deposit box. One fire, flood or burglary should never end your access.</p> },
        { title: "Test that the words work", body: <p>Before you put real money in, prove the paper restores the right wallet. Chapter 8 shows how.</p> },
      ]} />
      <h3>Paper or metal?</h3>
      <p>
        Paper is cheap, offline and easy to check. Its weakness is water and fire. A stamped or engraved{" "}
        <strong>metal plate</strong> survives both, which makes it <mark>worth it for larger amounts</mark>. Whichever you choose,
        keep it out of sight and away from anything labeled &quot;crypto&quot;.
      </p>
      <h3>What never to do</h3>
      <ul>
        <li><strong>Screenshots and photos.</strong> They sync to cloud albums and linger in backups and recycle bins for years.</li>
        <li><strong>Email, chat apps and cloud notes.</strong> Anyone who breaks into that account gets your money too.</li>
        <li><strong>Typing it into websites,</strong> including &quot;check&quot;, &quot;sync&quot; or &quot;validate&quot; pages. That is how phishing works.</li>
        <li><strong>Splitting it into halves</strong> kept in different places. It doubles the ways to lose it, and homemade schemes are easy to get wrong.</li>
        <li><strong>A single copy.</strong> One copy in one drawer is one accident away from gone.</li>
      </ul>
      <h3>The words vs the wallet file</h3>
      <p>
        Desktop wallets such as the Monero GUI also save a wallet file, often with a <code>.keys</code> file beside it. That
        file holds your keys, encrypted with your wallet password, and the{" "}
        <a href="https://www.getmonero.org/resources/user-guides/restore_from_keys.html" rel="noopener">official guide</a>{" "}
        notes you can read your keys back out of it if you know the password. It is a handy extra, but it is not a substitute
        for the words: lose the password or the disk, and the file is useless. MonkStash keeps its encrypted copy inside your
        browser instead, so the same rule applies. <mark>The 25 words are the backup</mark>; everything else is convenience.
      </p>
      <h3>Password managers: an honest take</h3>
      <p>
        A password manager encrypts what you put in it, which is a big step up from a screenshot. The trade-off is that your
        whole wallet then depends on one master password and a device connected to the internet. If malware sits on that device,
        both the vault and your seed are exposed. For most people <mark>an offline paper or metal copy is the main backup</mark>,
        and a password manager is at most an extra.
      </p>
      <p>
        One more thing to plan for: the people you leave behind. A sealed copy with simple instructions, kept where a trusted
        person will find it, means your money does not vanish with you.
      </p>
      <DeepDive paths={["/back-up-monero-wallet"]} />

      {/* 6 */}
      <ChapterHead n={6} id="passphrase" title="Does Monero have a seed passphrase?" />
      <p>
        Yes, as an option. Standard Monero seeds support a <strong>seed offset</strong>, also called a seed passphrase. The{" "}
        <a href="https://docs.getmonero.org/mnemonics/legacy/" rel="noopener">documentation</a> describes it as hashing a
        passphrase you choose and adding the result to the wallet&apos;s keys, then subtracting it again when you restore with
        the same passphrase.
      </p>
      <p>
        The effect: <mark>the 25 words alone open a different wallet</mark> from the one that holds your money. That protects you
        if someone finds the paper. But a wrong passphrase does not produce an error. It simply opens another valid wallet,
        which looks empty. Forget the passphrase and nobody can help you.
      </p>
      <h3>Which wallets support it</h3>
      <p>
        The Monero GUI and CLI both ask for an optional &quot;seed offset passphrase&quot; when you{" "}
        <a href="https://www.getmonero.org/resources/user-guides/restore_account.html" rel="noopener">restore from a seed</a>.
        Cake Wallet offers a seed passphrase under its advanced settings, and the{" "}
        <a href="https://docs.getmonero.org/mnemonics/polyseed/" rel="noopener">Polyseed documentation</a> recommends seed offsets
        for Polyseed wallets. MonkStash does not offer a seed passphrase today.
      </p>
      <h3>Three things people mix up</h3>
      <table>
        <caption>Wallet password, seed passphrase and 2FA code compared</caption>
        <thead><tr><th>&nbsp;</th><th>What it protects</th><th>If you forget it</th></tr></thead>
        <tbody>
          <tr><th>Wallet password</th><td>The wallet on this one device. It encrypts your keys locally.</td><td>Restore from your 25 words and set a new one</td></tr>
          <tr><th>Seed passphrase</th><td>The wallet itself. It changes which wallet the words open.</td><td>The money is lost</td></tr>
          <tr><th>2FA code (MonkStash, optional)</th><td>Unlocking the wallet on this device</td><td>Restore from your 25 words</td></tr>
        </tbody>
      </table>
      <Callout kind="warn" title="Only use a passphrase you will never lose">
        Store it separately from your words, and test a restore with a small amount first. Wallets do not all handle passphrases
        the same way, so restore with the wallet you set it up in, or test the other wallet before you rely on it.
      </Callout>

      {/* 7 */}
      <ChapterHead n={7} id="restore" title="Restoring from your seed (and restore height)" />
      <p>
        Restoring is the moment your backup pays off. You open a Monero wallet, choose to restore, type the 25 words and set a new
        password. The wallet rebuilds your keys in seconds. Then it has to <mark>find your payments on the blockchain</mark>,
        and that part takes longer.
      </p>
      <p>The short version:</p>
      <ol>
        <li>Open a wallet you trust, from a bookmark or an official download, never from an ad or a link in a message.</li>
        <li>Choose restore from seed (in MonkStash, &quot;Restore from recovery words&quot;).</li>
        <li>Type the words in order. If you use a seed passphrase, enter it when asked.</li>
        <li>Give the date you made the wallet, or a restore height.</li>
        <li>Set a new wallet password and wait for the scan to finish.</li>
      </ol>
      <h3>What the restore height is</h3>
      <p>
        Monero hides who got paid, so your wallet cannot just look up your balance. It reads the blockchain block by block and
        checks which payments are yours. The <strong>restore height</strong> is the block where that scan starts. A 25-word seed
        does not remember when it was made, which is why the date on your paper matters.
      </p>
      <Figure caption="Where the scan starts decides what the wallet finds. Too high is the usual cause of a missing balance.">
        <Adaptive wide={<RestoreHeightArt />} narrow={<RestoreHeightNarrow />} />
      </Figure>
      <p>
        The{" "}
        <a href="https://www.getmonero.org/resources/user-guides/restore_account.html" rel="noopener">official guide</a> says to
        use the block that included your first incoming payment, and to pick a lower number if you are unsure. Lower only makes
        the first sync slower. Higher can hide money. So a balance that looks short after a restore is almost always{" "}
        <mark>a height set too high, not money gone</mark>. Rescan from an earlier date and it reappears.
      </p>
      <p>
        In MonkStash you enter the approximate date you made the wallet, and it converts that to a height for you. Leave it empty
        and it scans the whole history. Your words never leave your browser while it does.
      </p>
      <DeepDive paths={["/restore-monero-wallet", "/monero-restore-height"]} />

      {/* 8 */}
      <ChapterHead n={8} id="check" title="How to check your seed is correct" />
      <p>
        A backup you have never tested is a hope, not a backup. The good news: checking takes a few minutes, and the best time to
        do it is <mark>before you put money in</mark>.
      </p>
      <Steps items={[
        { title: "Count and read back", body: <p>Twenty-five words, numbered, each spelled in full. Read them back against the screen one more time. MonkStash also asks for three of your words before it finishes creating a wallet, to catch a bad copy early.</p> },
        { title: "Restore once from the paper", body: <p>Before funding the wallet, restore it from your written copy in a wallet you trust. If the words were copied wrong, the checksum will usually refuse them.</p> },
        { title: "Compare the address", body: <p>The restored wallet must show the same primary address as before. Compare the first and last several characters carefully. A different address means a wrong word, wrong order or a different format.</p> },
      ]} />
      <p>
        If the address does not match, do not fund that wallet. Find the mistake while the original is still open in front of
        you, or create a fresh wallet and back it up again.
      </p>
      <Callout kind="warn" title="There is no safe online seed checker">
        Any website that offers to check, validate or convert a seed phrase is collecting seed phrases. A real check happens
        inside a wallet you trust. Our <Link href="/tools/monero-address-validator">address validator</Link> checks addresses,
        which are public, and never asks for words.
      </Callout>

      {/* 9 */}
      <ChapterHead n={9} id="lost" title="Lost your seed? What can be recovered" />
      <p>
        First, do not panic, and do not delete anything. Whether you can recover depends entirely on <mark>what you still have</mark>.
      </p>
      <Figure caption="Check these in order. The first one that applies to you is your way back.">
        <Adaptive wide={<LostSeedArt />} narrow={<LostSeedNarrow />} />
      </Figure>
      <ul>
        <li><strong>The wallet still opens on a device.</strong> You are probably fine. Many wallets can show the seed again
          from their settings once you enter the wallet password. Write the words down today, then test them. MonkStash does not
          show your words again after setup today, which is why it checks your copy while you create the wallet.</li>
        <li><strong>You saved your private spend key.</strong> The spend key is the seed in another form, so you can{" "}
          <a href="https://www.getmonero.org/resources/user-guides/restore_from_keys.html" rel="noopener">restore from keys</a>{" "}
          and then write down the words the restored wallet shows.</li>
        <li><strong>Only the address and view key.</strong> You can build a view-only wallet and watch money arrive, but you can
          never spend it. Nothing can turn a view key into a spend key.</li>
        <li><strong>None of these.</strong> The money is still on the blockchain, but nobody can move it again. There is no reset
          and no support desk.</li>
      </ul>
      <h3>Missing just one word?</h3>
      <p>
        If only the 25th word is missing, it can be calculated from the other 24, because it is a checksum. A missing word among
        the first 24 is harder: there are 1,626 candidates for that spot, and finding the right one means testing which candidate
        opens your wallet. Be extremely wary of any &quot;recovery service&quot; that asks for your other words.
      </p>
      <h3>Forgot your password, not your seed?</h3>
      <p>
        That is the easy case. A wallet password only protects the copy on one device. With your 25 words you can restore the
        wallet and set a new password. MonkStash passwords cannot be reset for the same reason: the words are the real way back.
      </p>

      {/* 10 */}
      <ChapterHead n={10} id="scams" title="Seed phrase scams: who may ask for it" />
      <p>
        A seed is only ever typed into a wallet you chose to open, to restore it. Nobody else has a reason to see it. Most Monero
        losses do not come from broken cryptography. They come from <mark>someone being talked into typing their words</mark>.
      </p>
      <ul>
        <li><strong>Fake wallet sites.</strong> Clones copy a real wallet&apos;s look, buy ads or rank in search, and wait for your words. Since MyMonero closed in January 2026, its name has been a favorite.</li>
        <li><strong>Fake support.</strong> Real support never asks for your seed. A helpful stranger in your messages who needs it &quot;to fix the sync&quot; is a thief.</li>
        <li><strong>Validation and airdrop pages.</strong> &quot;Verify your wallet&quot;, &quot;claim your reward&quot;, &quot;sync your node&quot;: all of them end with a box for your words.</li>
        <li><strong>Seed generator websites.</strong> A site that makes a seed for you can keep a copy. Let your own wallet create it, on your own device.</li>
        <li><strong>Pre-filled seeds.</strong> Never use words someone else chose for you, including a phrase printed on a card in a box.</li>
      </ul>
      <p>
        The defense is a habit: open your wallet from a bookmark you made yourself, and treat every request for your words as an
        attack, whoever it seems to come from. Our guide on{" "}
        <Link href="/monero-phishing-sites">spotting fake Monero wallet sites</Link> shows a 60-second check.
      </p>
      <KeyFact label="The rule with no exceptions">
        Nobody legitimate will ever ask for your 25 words. Not support, not a developer, not an exchange, not MonkStash.
      </KeyFact>

      {/* 11 */}
      <ChapterHead n={11} id="exposed" title="What to do if your seed is exposed" />
      <p>
        Maybe you photographed it, typed it into the wrong site, or someone saw the paper. Do not wait to find out whether anyone
        used it. Act as if they will, and <mark>move the money first</mark>.
      </p>
      <Steps items={[
        { title: "Create a brand-new wallet", body: <p>It gets a new seed, so your old words give no access to it. Back up the new words properly before anything else.</p> },
        { title: "Send everything to the new address", body: <p>Move your full balance from the old wallet to the new one. It costs a small <Link href="/monero-transaction-fee">network fee</Link>, and it is worth every bit.</p> },
        { title: "Retire the old words", body: <p>Stop using the old wallet. A new password does not help, because the words work without it.</p> },
        { title: "Clean up the exposed copy", body: <p>Delete the photo and empty the trash, or destroy the paper. Then check how it happened so it does not happen twice.</p> },
      ]} />
      <p>
        If only your <Link href="/monero-view-key">view key</Link> leaked, your money is safe, but your incoming payments are
        visible to whoever has it. Moving to a new wallet ends that too.
      </p>
      <p>
        You can do step 1 by <Link href={walletUrl}>opening a MonkStash wallet</Link> in your browser. Your 25 words are generated
        and encrypted on your own device and never sent to a server. MonkStash is an early preview that has not been
        independently audited, so start with a small amount. If you want to see what to expect first, read{" "}
        <Link href="/create-monero-wallet">how to create a Monero wallet</Link>.
      </p>
      <DeepDive paths={["/create-monero-wallet", "/back-up-monero-wallet", "/restore-monero-wallet"]} label="Your next three reads" />
    </>
  );
}
