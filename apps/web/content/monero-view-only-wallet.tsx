import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { ViewOnlyInArt, ViewOnlySeesArt } from "@/components/art/MoneroViewOnlyWalletArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-view-only-wallet",
  section: "guides",
  kicker: "Watch without spending",
  title: "Monero View Only Wallet: How to Create One (and What It Shows)",
  seoTitle: "Monero View Only Wallet: How to Create One",
  summary: "Create a Monero view only wallet with your address and private view key. See incoming payments without spending, and learn why the balance can be wrong.",
  keyword: "monero view only wallet",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "what", label: "What a view-only wallet is" },
    { id: "need", label: "What you need first" },
    { id: "monkstash", label: "Create one in MonkStash" },
    { id: "others", label: "Create one in other wallets" },
    { id: "shows", label: "What you will see" },
    { id: "key-images", label: "Key images and the wrong balance" },
    { id: "fix", label: "How to get a correct balance" },
    { id: "use", label: "Good uses" },
    { id: "safety", label: "Staying safe" },
    { id: "trouble", label: "If something looks off" },
  ],
  related: ["monero-view-key", "monero-restore-height", "restore-monero-wallet", "monero-wallet-not-showing-balance", "monero-seed-phrase"],
  faq: [
    { q: "What is a Monero view only wallet?", a: "It is a wallet made from your address and private view key, with no spend key or recovery words. It can see payments coming in, but it cannot send or spend anything." },
    { q: "How do I create a Monero view only wallet?", a: "Copy your primary address and private view key from your main wallet, choose the watch-only or restore-from-keys option in a wallet, paste both, leave the spend key empty, and set a restore date. In MonkStash the option is called Add a watch-only wallet." },
    { q: "Why does my view-only wallet show the wrong balance?", a: "A view-only wallet cannot recognize money you have already spent, because that needs key images, which only the spend key can produce. So it adds up everything you received and the balance reads too high after any spend." },
    { q: "What is a key image in Monero?", a: "A key image is a unique fingerprint of an output that appears on the blockchain when that output is spent. The network uses it to stop the same money being spent twice. Only the owner of the spend key can work out which key image belongs to which of their outputs." },
    { q: "Can a view only wallet send Monero?", a: "No. It has no spend key. Some setups can build an unsigned transaction on a view-only wallet and sign it on a separate offline wallet, but the view-only wallet itself can never sign." },
    { q: "Is it safe to put my view key into a wallet website?", a: "Your funds are safe because a view key cannot spend. Your privacy is at stake, since whoever holds the key can see your incoming payments. Use a wallet you trust, and prefer one that keeps the key encrypted on your own device." },
    { q: "Does a view only wallet need to sync?", a: "Yes. It scans the blockchain to find your incoming payments just like a full wallet, so it needs a node connection and a restore height. A restore date that is too late will miss payments." },
    { q: "Can I turn a view-only wallet into a full wallet?", a: "No. The spend key is missing, and it cannot be recovered from the view key. To spend, restore the full wallet from your 25 recovery words." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A <strong>Monero view only wallet</strong> (also called a watch-only wallet) is a copy of your wallet that can see
        <mark>payments arriving but cannot spend</mark>. You build it from your primary address and your private view key, and nothing else.
        It is the safe way to keep an eye on a balance from a phone, a shared computer or a browser you do not fully trust. The
        catch is that its balance can read too high after you have spent, and this guide shows why and what to do about it.
      </p>

      <Takeaways items={[
        "You need two things: your primary address (starts with 4) and your private view key (64 characters).",
        "A view-only wallet cannot spend, so a thief who finds it takes nothing but your privacy.",
        "It does not see money you sent, so the balance can be higher than the truth until you import key images from the full wallet.",
        "Set the restore date at or before your first payment, or older payments will be missed.",
      ]} />

      <h2 id="what">What a view-only wallet is</h2>
      <p>
        Your Monero wallet is made of two private keys. One signs transactions (the spend key). One recognizes payments (the view
        key). A view-only wallet keeps only the second. If the difference is new to you, the{" "}
        <Link href="/monero-view-key">view key explainer</Link> covers it from scratch.
      </p>
      <Figure caption="Two things go in. The recovery words and the spend key never do.">
        <ViewOnlyInArt />
      </Figure>
      <p>
        Because the spend key never enters the wallet, <mark>nothing that happens in it can move your money</mark>. That is what makes it
        useful. It is also why it behaves a little differently from a normal wallet, which we cover below.
      </p>

      <h2 id="need">What you need first</h2>
      <ul>
        <li><strong>Your primary address.</strong> It starts with the number 4 and is 95 characters long. Not a subaddress, which starts with 8.</li>
        <li><strong>Your private view key.</strong> A 64-character string of the digits 0-9 and letters a-f. Find it in the wallet that holds your seed.</li>
        <li><strong>A rough date for when the wallet first received money.</strong> This sets the restore height so the scan starts in the right place. See <Link href="/monero-restore-height">what a restore height is</Link>.</li>
      </ul>
      <Callout kind="warn" title="Paste the view key, never the seed">
        A real view key is a short string of letters and numbers. If a site asks for your 25 words to &quot;set up a watch-only
        wallet,&quot; leave. Watch-only never needs them.
      </Callout>

      <h2 id="monkstash">Create one in MonkStash</h2>
      <ol>
        <li>Open the <Link href={walletUrl}>MonkStash wallet</Link> and choose <strong>Add a watch-only wallet</strong>.</li>
        <li>In your main wallet, copy your <strong>primary address</strong>. Paste it into the address box. The hint under it tells you whether it looks right.</li>
        <li>Copy your <strong>private view key</strong> from the same wallet and paste it into the view key box. MonkStash checks it is 64 characters of 0-9 and a-f.</li>
        <li>Enter the date you first received money to that wallet. If you are unsure, pick a date earlier than you think.</li>
        <li>Continue, then set a wallet password. The key is encrypted with it and stays on your device.</li>
        <li>Wait while the wallet scans. Incoming payments appear as it reaches them.</li>
      </ol>
      <p>
        MonkStash will reject a subaddress, because a watch-only wallet needs the primary one, and will run the address through
        its checksum before it accepts it. If you want to double check an address on its own, use the{" "}
        <Link href="/tools/monero-address-validator">address validator</Link>.
      </p>
      <p>
        Two honest notes. MonkStash is an early preview that has not been independently audited, so try it with a small wallet
        before you rely on it. And your watch-only wallet does not sync between devices: add it again on each device where you
        want it.
      </p>

      <h2 id="others">Create one in other wallets</h2>
      <p>
        The idea is the same everywhere: give the wallet your address and view key, leave the spend key blank. Names and menus
        vary, so check your wallet&apos;s own documentation.
      </p>
      <table>
        <thead><tr><th>Wallet</th><th>How</th></tr></thead>
        <tbody>
          <tr>
            <td>Monero GUI (from an existing wallet)</td>
            <td>Open the wallet, then Settings, Wallet, Create a view-only wallet. It is saved in the same folder and uses the same password.</td>
          </tr>
          <tr>
            <td>Monero GUI (from keys)</td>
            <td>Main menu, Restore wallet from keys or mnemonic seed, choose Restore from keys, enter the address and view key, leave the spend key blank, and set a creation date or restore height.</td>
          </tr>
          <tr>
            <td>Monero CLI</td>
            <td>Run <code>monero-wallet-cli --generate-from-view-key wallet-name</code>, then paste the address and the view key when asked.</td>
          </tr>
        </tbody>
      </table>
      <p>
        These steps follow the official{" "}
        <a href="https://www.getmonero.org/resources/user-guides/view_only.html" rel="noopener">Monero view-only wallet guide</a>.
        For other wallets such as <Link href="/monero-wallets/feather-wallet-review">Feather</Link> or{" "}
        <Link href="/monero-wallets/cake-wallet-review">Cake Wallet</Link>, look for a restore-from-keys or view-only option in their
        own docs, since support and wording can differ.
      </p>

      <h2 id="shows">What you will see</h2>
      <ul>
        <li>Every payment received at the address, with its amount and date.</li>
        <li>New payments as they arrive, after the network has confirmed them. New money usually becomes spendable after <Link href="/monero-transaction-time">about 10 confirmations</Link>, roughly 20 minutes.</li>
        <li>A balance, which comes with a catch. Read on.</li>
      </ul>
      <p>
        What you will <em>not</em> see is money you sent. That is not a bug in the wallet you chose. It is how Monero works.
      </p>

      <h2 id="key-images">Key images and the wrong balance</h2>
      <p>
        <mark>A view-only wallet adds up everything you received and cannot subtract what you spent.</mark> Here is why, in
        plain words.
      </p>
      <p>
        When you spend a piece of Monero, the network needs a way to stop you spending that same piece twice. It does this with a
        <strong> key image</strong>: a unique fingerprint of the piece being spent, published on the blockchain when you spend
        it. If the same fingerprint ever appears again, the network rejects the transaction. The{" "}
        <a href="https://docs.getmonero.org/cryptography/asymmetric/key-image/" rel="noopener">Monero docs on key images</a>{" "}
        describe how each key image comes from the output&apos;s one-time private key.
      </p>
      <p>
        The trick is that ring signatures hide which output you spent. So from the outside, nobody can look at a spend and say
        &quot;that was this wallet&apos;s money.&quot; Only you can, because only you can work out the key image for each
        output you own, and that needs the <em>spend</em> key. <mark>A view-only wallet has the view key alone</mark>. It knows what arrived,
        but it cannot compute the fingerprints, so it cannot tell which arrivals were later spent.
      </p>
      <Figure caption="Received money is visible. Spent money is not, so the number shown is a ceiling.">
        <ViewOnlySeesArt />
      </Figure>
      <p>
        The official docs say the same: because a view-only wallet does not have key images, it cannot see outgoing transactions
        (see <a href="https://docs.getmonero.org/cold-storage/offline-transaction-signing/" rel="noopener">offline transaction signing</a>).
        The GUI user guide adds that its balance is wrong until the key images are imported.
      </p>
      <Callout title="Rule of thumb">
        If you have never spent from the wallet, <mark>a view-only balance is right</mark>. Once you have spent, treat it as the most the
        wallet could hold, never as a figure to rely on.
      </Callout>

      <h2 id="fix">How to get a correct balance</h2>
      <p>
        The fix is to <mark>hand the view-only wallet the key images</mark> from the full wallet. The full wallet exports them to a file, and
        the view-only wallet imports it. In the Monero command line wallet this uses two commands:{" "}
        <code>export_key_images</code> on the full wallet and <code>import_key_images</code> on the view-only one. Monero GUI has
        equivalent options in its wallet settings; check the version you use. Each new spend needs a fresh export, because the
        old file does not include it.
      </p>
      <p>
        The command line reference lists both in the{" "}
        <a href="https://docs.getmonero.org/interacting/monero-wallet-cli-reference/" rel="noopener">monero-wallet-cli reference</a>.
        Two limits to know: a view-only wallet made from a hardware wallet does not support importing key images, and MonkStash
        does not offer a key image import today, so <mark>treat a MonkStash watch-only balance as a ceiling</mark>.
      </p>
      <p>
        If you do not spend from the wallet you are watching, none of this matters. And if you need an exact balance, the
        simplest answer is to open the full wallet and read it there.
      </p>

      <h2 id="use">Good uses</h2>
      <ul>
        <li><strong>Check a balance on a risky device.</strong> A borrowed laptop, a work PC, a phone you are testing. Nothing there can spend.</li>
        <li><strong>Watch a receiving wallet.</strong> A shop or donation wallet whose keys live safely elsewhere, with only the view key online. That is how our <Link href="/monero-pos">Monero till</Link> and <Link href="/monero-payment-gateway">self-hosted payment gateway</Link> work.</li>
        <li><strong>Hand an accountant access.</strong> They see what came in, with no ability to touch it.</li>
        <li><strong>Test a wallet before trusting it.</strong> Import the view key of your main wallet first to see how a new app behaves, then decide.</li>
        <li><strong>Cold storage.</strong> Keep the spend key on an offline computer and the view-only copy online to see deposits.</li>
      </ul>

      <h2 id="safety">Staying safe</h2>
      <ul>
        <li><strong>Funds are safe, privacy is not.</strong> A watch-only wallet cannot lose your money, but its key shows your incoming history to anyone who gets it. See <Link href="/monero-view-key">whether sharing a view key is safe</Link>.</li>
        <li><strong>Use a wallet you trust for the key.</strong> Open it from a bookmark, never from a link in a message. See <Link href="/monero-phishing-sites">Monero phishing sites</Link>.</li>
        <li><strong>Never type your seed to set one up.</strong> Watch-only does not need it.</li>
        <li><strong>Remember what a node sees.</strong> The node you connect to can see that your wallet is asking about the blockchain, not what you own. More in <Link href="/monero-remote-node">remote nodes</Link>.</li>
        <li><strong>Remove it when done.</strong> If you add it to a shared device, delete the wallet afterward.</li>
      </ul>

      <h2 id="trouble">If something looks off</h2>
      <table>
        <thead><tr><th>Problem</th><th>Most likely cause</th><th>What to try</th></tr></thead>
        <tbody>
          <tr><td>Balance is higher than your full wallet</td><td>You have spent, and the view-only wallet cannot see it</td><td>Import key images, or read the real number in the full wallet</td></tr>
          <tr><td>Balance is zero or too low</td><td>Restore date set too late, or the sync is not finished</td><td>Wait for the scan, then re-add with an earlier date</td></tr>
          <tr><td>Address is rejected</td><td>You pasted a subaddress or a mistyped address</td><td>Use the primary address, starting with 4</td></tr>
          <tr><td>View key is rejected</td><td>It is not 64 characters of 0-9 and a-f</td><td>Copy the <em>view</em> key again, not the spend key</td></tr>
          <tr><td>It will not connect</td><td>Node trouble</td><td>See <Link href="/monero-wallet-not-connecting">the connection fix guide</Link></td></tr>
          <tr><td>Balance never appears</td><td>Several possible causes</td><td>See <Link href="/monero-wallet-not-showing-balance">the balance fix guide</Link></td></tr>
        </tbody>
      </table>
      <p>
        When you are ready to spend again, restore the full wallet from your recovery words with the{" "}
        <Link href="/restore-monero-wallet">restore guide</Link>.
      </p>
    </>
  );
}
