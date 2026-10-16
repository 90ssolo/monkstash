import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { AddressBarFigure, EmergencyFlowFigure, SeedStaysFigure } from "@/components/art/MoneroPhishingSitesArt";
import { walletAddressText, walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-phishing-sites",
  section: "learn",
  kicker: "Stay safe",
  title: "Monero Wallet Phishing: How to Spot a Fake Wallet in 60 Seconds",
  seoTitle: "Monero Wallet Phishing: How to Spot a Fake",
  summary: "Monero wallet phishing explained: how fake wallet sites and apps work, a 60-second check, and what to do if you already typed your seed words.",
  keyword: "monero wallet phishing",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "how", label: "How the scams work" },
    { id: "mymonero", label: "Fake sites after the MyMonero shutdown" },
    { id: "check", label: "The 60-second check" },
    { id: "flags", label: "Red flags checklist" },
    { id: "table", label: "Real wallet versus scam" },
    { id: "downloads", label: "How to verify an official download" },
    { id: "phished", label: "If you already entered your words" },
    { id: "monkstash", label: "How MonkStash helps" },
    { id: "next", label: "What to do next" },
  ],
  related: ["restore-mymonero-seed", "monero-seed-phrase", "is-monero-safe", "back-up-monero-wallet"],
  faq: [
    { q: "Is this Monero wallet real?", a: "Check where you found it. Real wallets are linked from the Monero project's own pages or from a source you trust, and a real wallet never asks you to type your seed words into a website to verify, sync or validate anything. If you are unsure, do not enter any words. Compare the exact address with the project's official page." },
    { q: "How do fake Monero wallets steal money?", a: "They ask for your 25 recovery words, or your private keys, and send them to the scammer. With those words anyone can rebuild your wallet on their own device and send your Monero away. The page or app then shows a convincing screen so you believe nothing went wrong." },
    { q: "Can a wallet ask me to enter my seed to verify it?", a: "No. A real wallet shows you your words once, when you create it, and asks for them again only when you restore on a fresh device. Any site, app, email or support agent asking you to enter or send your words to verify, sync or validate is a scam." },
    { q: "What should I do if I typed my seed into a fake site?", a: "Assume the seed is stolen. Create a new wallet with new words on a clean device, then send all your Monero to its address as quickly as you can. Stop using the old words. A leaked seed cannot be made safe again, and Monero payments cannot be reversed." },
    { q: "Are there fake MyMonero websites?", a: "Scammers target well-known wallet names, and MyMonero users now need somewhere to restore. One forum user reported losing funds on a look-alike MyMonero site (unverified). The real MyMonero site now only says the service has closed. Do not enter your words on any page that claims to be MyMonero." },
    { q: "How do I check a Monero download is genuine?", a: "Monero's official guide has you check a signature on the published list of hashes, then compare the SHA-256 hash of your file against that list. If the hash is not in the verified list, do not run the file. Do this before you open the download." },
    { q: "Can the money be recovered after a phishing scam?", a: "Rarely. Monero transactions are final, and the privacy that protects you also makes tracing a thief very hard. Prevention is the realistic defence: a bookmark, a careful look at the address, and never typing your words into a website." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        Monero wallet phishing is when a fake wallet site, app or support agent tricks you into typing your 25 recovery words, so the
        scammer can empty your wallet. You can protect yourself with one rule and a 60-second routine. The rule:{" "}
        <mark>a real wallet never asks you to enter your words to verify, sync or validate anything.</mark> The routine is below.
      </p>

      <Takeaways items={[
        "Phishing works because it looks like a normal restore screen. The only giveaway is where you came from and what the address says.",
        "Your recovery words belong on paper and inside a wallet you opened from a bookmark. Nowhere else, ever.",
        "A 60-second check (source, address, request, download) catches nearly every fake.",
        "If you typed your words into the wrong place, move everything to a brand new wallet right away. A leaked seed cannot be secured.",
      ]} />

      <h2 id="how">How the scams work</h2>
      <p>
        <mark>There is no clever hacking in most of these cases</mark>. The scammer makes something that looks right, gets you to type the words
        into it, and takes the money using the very same words. They are built to look boring and helpful. The patterns below are
        the ones that security researchers and wallet teams have documented.
      </p>
      <ul>
        <li>
          <strong>Look-alike websites.</strong> A page copies the design of a wallet or of the Monero project&apos;s site and offers
          buttons like &quot;Import wallet&quot; or &quot;Restore&quot;. Every button leads to a box that asks for your words. One
          security site reported a fake that imitated getmonero.org in this way (its report is not strongly sourced, so we do not name
          the domain).
        </li>
        <li>
          <strong>Fake apps.</strong> A researcher documented a fake Android app, &quot;My Monero - XMR&quot;, that copied the look of
          MyMonero&apos;s login screen. It sent whatever keys you typed to a remote database, then showed you a dashboard so you thought
          it had worked. See the write-up by{" "}
          <a href="https://serhack.me/articles/phishing-mymonero-app-android-fake/" rel="noopener">SerHack</a>.
        </li>
        <li>
          <strong>Search ads.</strong> Paid ads can sit above the real result. Security firm Scam Sniffer linked ads on Google and X
          to a wallet-draining service blamed for about $59 million in crypto losses in 2023, and reporting on it is
          summarised by <a href="https://gulfnews.com/your-money/cryptocurrency/scammers-use-google-x-ads-to-steal-59m-in-crypto-from-63000-victims-1.1703425814794" rel="noopener">Gulf News</a>.
          That campaign targeted other crypto sites, but the trick is the same for any wallet name.
        </li>
        <li>
          <strong>Tampered downloads.</strong> In November 2019 the official Monero site briefly served compromised command-line wallet
          files. The project&apos;s{" "}
          <a href="https://getmonero.org/2019/11/19/warning-compromised-binaries.html" rel="noopener">own warning</a> says anyone who
          downloaded in that window should check the hashes and not run files that fail. Reporting at the time said the changed files
          sent wallet seeds to an attacker. It was caught because a user noticed a hash mismatch. This is why verifying a download matters.
        </li>
        <li>
          <strong>&quot;Validate your wallet&quot; messages.</strong> Emails and posts say your wallet needs to be validated, synced
          or upgraded, and send you to a page that asks for your recovery phrase. Security blogs such as{" "}
          <a href="https://blog.gridinsoft.com/crypto-wallet-validation-email-scam/" rel="noopener">GridInsoft</a> describe this as a
          recovery-phrase phishing scam, not a real security check.
        </li>
        <li>
          <strong>Fake support.</strong> You ask for help on social media. An account that looks official replies fast and asks for
          your words to &quot;confirm&quot; you are the owner. Real support never needs your recovery words, for any wallet.
          Former Exodus Monero users are an obvious target now that Exodus has dropped XMR; our guide to{" "}
          <Link href="/exodus-monero">getting your Monero out of Exodus</Link> shows the safe route.
        </li>
        <li>
          <strong>Fake balance checkers.</strong> A site promises to show your Monero balance if you paste your seed or spend
          key. A real balance check never needs either: at most a view key, which cannot spend. See{" "}
          <Link href="/check-monero-balance">how to check a Monero balance safely</Link>.
        </li>
      </ul>
      <p>
        Some of these examples are about other coins, and we say so where they are. The method never changes, because in every
        crypto wallet the words are the money.
      </p>

      <h2 id="mymonero">Fake sites after the MyMonero shutdown</h2>
      <p>
        MyMonero announced its sunset in October 2025 and went offline on 6 January 2026. Its own site now says the service is closed.
        That left a lot of people searching for a place to restore, which is exactly the situation scammers like. We found a forum post
        from a user who says they entered a key on a look-alike MyMonero domain and lost funds. We cannot verify that single report,
        which is why we do not name the domain, but it fits the pattern above.
      </p>
      <p>
        If you are a former MyMonero user, our guide to{" "}
        <Link href="/restore-mymonero-seed">restoring a MyMonero seed</Link> shows exactly where to restore a 25-word or
        13-word phrase and what to avoid. For the bigger picture of what to use now, see the{" "}
        <Link href="/mymonero-alternative">MyMonero alternative</Link> page.
      </p>

      <h2 id="check">The 60-second check</h2>
      <p>Run through these five steps any time you are about to type your words anywhere, including here.</p>
      <ol>
        <li><strong>Where did you come from?</strong> A bookmark you made yourself, or an address you typed? Good. An ad, a message, a post or an email? <mark>Stop and go to a bookmark instead</mark>.</li>
        <li><strong>Read the address.</strong> Letter by letter, from the first character to the first single slash. Look for extra words, swapped letters, odd endings. A padlock only means the connection is encrypted, not that the owner is honest.</li>
        <li><strong>What is it asking for?</strong> You should only ever enter your words when you restore into a fresh wallet that you opened yourself. If a page asks for them to verify, sync, validate, claim, upgrade or fix something, close it.</li>
        <li><strong>Is it a download?</strong> Get it from the project&apos;s official page, and check its hash before opening it (see below).</li>
        <li><strong>Is someone rushing you?</strong> Urgency, prizes, support that finds you first, and requests to move to a private chat are all signs of a scam.</li>
      </ol>
      <Figure caption="The address is the only honest part of the page. A padlock proves the connection is private, not that the site is the one you meant.">
        <AddressBarFigure />
      </Figure>

      <h2 id="flags">Red flags checklist</h2>
      <ul>
        <li>It asks for your 25 words (or private keys) anywhere except a restore screen you opened yourself.</li>
        <li>It claims your wallet needs to be &quot;verified&quot;, &quot;validated&quot;, &quot;synced&quot; or &quot;upgraded&quot;.</li>
        <li>You reached it through an advertisement, a direct message, a comment or a link in an email.</li>
        <li>The address has extra words, different spellings or an unusual ending.</li>
        <li>A &quot;support agent&quot; contacted you first, or asks you to share your screen or your words.</li>
        <li>An app in a store has a copied name and icon, very few reviews, and a support email that does not match the real project.</li>
        <li>It offers to double your Monero, give you free coins, or recover a lost wallet for a fee.</li>
        <li>You cannot find the project&apos;s source code, a clear team, or a documented way to check downloads.</li>
      </ul>
      <Figure caption="Your words are for paper and for a wallet you opened yourself. Every other destination is a trap.">
        <SeedStaysFigure />
      </Figure>

      <h2 id="table">Real wallet versus scam</h2>
      <table>
        <thead><tr><th>Situation</th><th>A real wallet</th><th>A scam</th></tr></thead>
        <tbody>
          <tr><td>Asking for your words</td><td>Shows them once when you create the wallet, and asks only when you restore.</td><td>Asks you to enter them to &quot;verify&quot; or &quot;sync&quot;.</td></tr>
          <tr><td>How you found it</td><td>You opened it from a bookmark or the project&apos;s official page.</td><td>An ad, a message, a post or an unsolicited reply.</td></tr>
          <tr><td>Support</td><td>You contact it through its official site, and it never asks for your words.</td><td>Finds you first and asks for the words or a screen share.</td></tr>
          <tr><td>Tone</td><td>Calm, plain, no countdowns.</td><td>Urgent, with prizes and warnings.</td></tr>
          <tr><td>Downloads</td><td>Published with hashes you can check.</td><td>No way to verify, or a different link every time.</td></tr>
          <tr><td>Password</td><td>Locks the wallet on your own device only.</td><td>May ask for an account, email or a login.</td></tr>
          <tr><td>Source and team</td><td>Open source and an identifiable project.</td><td>Hidden or copied.</td></tr>
        </tbody>
      </table>
      <p>
        If you want a broader look at wallet safety, see{" "}
        <Link href="/is-monero-safe">is Monero safe</Link> and the{" "}
        <Link href="/monero-wallets">Monero wallets guide</Link>.
      </p>

      <h2 id="downloads">How to verify an official download</h2>
      <p>
        If you install software instead of using a browser wallet, you can prove the file is exactly what the project published. The
        Monero project explains this in its{" "}
        <a href="https://docs.getmonero.org/interacting/verify-monero-binaries/" rel="noopener">guide to verifying binaries</a>. In
        simple terms:
      </p>
      <ol>
        <li>Get the project&apos;s signing key and check that its fingerprint matches the one printed in the official guide. If it does not match, stop.</li>
        <li>Download the list of file hashes (a hash is a short fingerprint of a file) and check that the list is signed by that key. A &quot;good signature&quot; means the list is genuine.</li>
        <li>Work out the SHA-256 hash of the file you downloaded, without opening it, and look for it in the verified list.</li>
        <li>No match means do not run the file. Delete it and download again from the official page.</li>
      </ol>
      <p>
        <mark>The signature check is the step that matters</mark>, because it does not depend on which website you got the list from. The official
        guide says the verification should be done before you extract or use the software. This is also what protected people in 2019:
        the compromise was found because a hash did not match.
      </p>

      <h2 id="phished">If you already entered your words</h2>
      <p>
        If you typed your words into something you now doubt, <mark>assume they are stolen.</mark> This is hard to hear, but it is
        the useful way to think about it. A seed phrase cannot be changed or secured after it leaks. The wallet it opens will always
        be reachable by anyone who has the words. You cannot lock it. What you can do is move your money out before the thief does.
      </p>
      <Figure caption="The only fix for a leaked seed is a new seed. Move quickly and do not use the old one again.">
        <EmergencyFlowFigure />
      </Figure>
      <ol>
        <li><strong>Stop typing.</strong> Close the page. Do not enter anything else, and do not follow instructions from anyone offering to help.</li>
        <li><strong>Use a clean device.</strong> If you installed a file from an unofficial source, assume that computer is not safe. Use another device you trust.</li>
        <li><strong>Create a new wallet with new words.</strong> <mark>Do not restore the old phrase</mark>. Write the new words down on paper, and check them. See <Link href="/back-up-monero-wallet">how to back up a Monero wallet</Link>.</li>
        <li><strong>Copy the new address</strong> and check it with the <Link href="/tools/monero-address-validator">address validator</Link>.</li>
        <li><strong>Send everything to the new address.</strong> Restore the old words in a wallet you trust, and move all of the balance to the new wallet in one go. Monero payments take about 20 minutes (10 confirmations) to become spendable, so be patient and keep going.</li>
        <li><strong>Retire the old words.</strong> Never use them again. If you reused the same phrase anywhere else, treat that wallet as compromised too.</li>
      </ol>
      <Callout kind="warn" title="Be realistic about the outcome">
        If the scammer has already moved your money, it cannot be reversed, and Monero is built so that thieves are hard to trace.
        You may still choose to report the site to the browser or the host, and to the official Monero channels, so others are
        warned. Nobody who contacts you offering to recover the funds is legitimate. <mark>That is a second scam</mark>.
      </Callout>

      <h2 id="monkstash">How MonkStash helps</h2>
      <p>
        MonkStash is a free web wallet, and we try to make phishing harder, not easier.
      </p>
      <ul>
        <li><strong>Bookmark it.</strong> Open the <Link href={walletUrl}>wallet</Link> once from this site and check that your address bar says <strong className="mono">{walletAddressText}</strong>, then save it. Use the bookmark from then on.</li>
        <li><strong>We never ask for your words outside the wallet screen.</strong> Not by email, not in a chat, not on a support form. If anyone claiming to be us asks, it is not us.</li>
        <li><strong>Your keys stay on your device.</strong> The words are used locally and encrypted with your password. There are no accounts and no tracking on wallet pages.</li>
        <li><strong>No extension yet.</strong> A <Link href="/monero-chrome-extension">MonkStash browser extension</Link> is planned but not built, so any &quot;MonkStash&quot; extension in a store today is fake.</li>
        <li><strong>The code will be published as open source</strong> after launch, so anyone can read what it does.</li>
      </ul>
      <p>
        MonkStash is an early preview and has not been independently audited. That is another reason to start with a small amount.
        Questions? See the <Link href="/faq">FAQ</Link> or <Link href="/support">support</Link>, and never include your words in a message.
      </p>

      <h2 id="next">What to do next</h2>
      <p>
        Bookmark your wallet today, so you never rely on a search result again. If you are unsure what the recovery words really do,
        read the <Link href="/monero-seed-phrase">Monero seed phrase</Link> explainer. If you used MyMonero, follow the{" "}
        <Link href="/restore-mymonero-seed">restore guide</Link>, and compare your options in the{" "}
        <Link href="/mymonero-alternative">MyMonero alternative</Link> page.
      </p>
    </>
  );
}
