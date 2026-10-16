import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { ViewKeyPowersArt, ViewKeySeesArt } from "@/components/art/MoneroViewKeyArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-view-key",
  section: "learn",
  kicker: "Keys, explained",
  title: "Monero View Key: What It Is and Is It Safe to Share?",
  seoTitle: "Monero View Key: Is It Safe to Share?",
  summary: "A Monero view key shows the payments coming into your wallet but cannot spend them. See what it reveals, what it hides, and when sharing it is safe.",
  keyword: "monero view key",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "what", label: "What a view key is" },
    { id: "vs-spend", label: "View key vs spend key" },
    { id: "can-see", label: "What a view key can and cannot see" },
    { id: "safe", label: "Is it safe to share your view key?" },
    { id: "uses", label: "When sharing a view key makes sense" },
    { id: "risks", label: "The risks, plainly" },
    { id: "find", label: "How to find your view key" },
    { id: "monkstash", label: "How MonkStash uses view keys" },
    { id: "mistakes", label: "Mix-ups to avoid" },
    { id: "next", label: "What to do next" },
  ],
  related: ["monero-view-only-wallet", "monero-seed-phrase", "is-monero-traceable", "monero-restore-height", "how-monero-works"],
  faq: [
    { q: "What is a Monero view key?", a: "A view key is a private key that lets a wallet see the payments sent to an address. It can recognize incoming money for you. It cannot sign a transaction, so it cannot spend anything." },
    { q: "Is it safe to share my Monero view key?", a: "It cannot be used to steal your money, but it is not harmless. Anyone who has it can see every payment you have received at that address, now and in the future, and you cannot take it back. Share it only with someone you trust to see that history." },
    { q: "Can someone steal my Monero with the view key?", a: "No. Spending needs the private spend key, which the view key cannot produce. The risk of sharing a view key is lost privacy, not lost funds." },
    { q: "What is the difference between the view key and the spend key?", a: "The spend key controls the money: it signs transactions. The view key only recognizes incoming payments. Your 25 recovery words encode the spend key, and the view key is derived from it." },
    { q: "Can a view key show my outgoing transactions?", a: "Not reliably. Official Monero documentation says a view-only wallet has no key images, so it cannot tell which of your outputs have been spent. It shows money in, but its balance can be higher than the real one." },
    { q: "Can I change or revoke a view key I already shared?", a: "No. A view key is permanent for a wallet. To stop someone watching, create a new wallet with new keys and move your funds to it, which costs a normal network fee." },
    { q: "Where do I find my Monero view key?", a: "In the wallet that created it. Monero GUI shows it under Settings, in the seed and keys screen. Feather has a Keys entry in its Wallet menu. Cake Wallet shows it under Seed & Keys. Menu names can change between versions." },
    { q: "Does a view key also cover subaddresses?", a: "A wallet's private view key can recognize payments to the main address and the subaddresses made from the same account. If you share it, assume it reveals all of that account's incoming activity." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A <strong>Monero view key</strong> is a private key that <mark>lets a wallet see the payments sent to an address</mark>, without any
        power to move the money. Share it and the other person can watch what comes in. They cannot spend a single piece of it.
        Whether sharing is <em>safe</em> depends on one thing: how much you mind them seeing your incoming history, because that
        part is permanent.
      </p>

      <Takeaways items={[
        "The view key sees payments arriving at your address. It cannot spend, and it cannot be turned into a spend key.",
        "Sharing it will not cost you money. It costs you privacy, and you cannot undo it.",
        "It does not reliably show money you sent, so a balance computed from a view key can be too high.",
        "Good reasons to share: an accountant, an audit, a public donation wallet. Bad reasons: a stranger, a support chat, a website that promises to 'verify' you.",
      ]} />

      <h2 id="what">What a view key is</h2>
      <p>
        Every Monero wallet is built from two secret keys. The <strong>private spend key</strong> is the one that moves money.
        The <strong>private view key</strong> is the one that notices money. Your 25-word seed is a human-friendly way of writing
        down the spend key, and the view key is worked out from it, as we explain in the{" "}
        <Link href="/monero-seed-phrase">seed phrase guide</Link>.
      </p>
      <p>
        Why does Monero need a view key at all? Because it hides the receiver of every payment. When someone pays you, the
        network records a one-time address that nobody can link to your public address by looking. Only the view key can tell
        &quot;this one-time address belongs to that wallet.&quot; Your wallet uses it constantly to scan the blockchain and find
        what is yours. <mark>That is the whole job</mark>. The mechanics behind it are in{" "}
        <Link href="/how-monero-works">how Monero works</Link>.
      </p>
      <p>
        The <a href="https://www.getmonero.org/resources/moneropedia/viewkey.html" rel="noopener">official Moneropedia</a>{" "}
        describes the same idea: every address has a private view key that can be shared, and sharing it allows access to view
        every incoming transaction for that address.
      </p>

      <h2 id="vs-spend">View key vs spend key</h2>
      <p>
        This is the comparison most people are really searching for. Two keys, two very different powers.
      </p>
      <Figure caption="Two keys, two powers. Only the spend key can move money.">
        <ViewKeyPowersArt />
      </Figure>
      <table>
        <thead><tr><th></th><th>Private view key</th><th>Private spend key</th></tr></thead>
        <tbody>
          <tr><td>What it does</td><td>Recognizes payments sent to you</td><td>Signs transactions that spend your money</td></tr>
          <tr><td>See incoming payments</td><td>Yes</td><td>Yes (it can derive the view key)</td></tr>
          <tr><td>See outgoing payments</td><td>Not reliably</td><td>Yes</td></tr>
          <tr><td>Spend or send</td><td>No</td><td>Yes</td></tr>
          <tr><td>Where it comes from</td><td>Derived from the spend key</td><td>Encoded by your 25 recovery words</td></tr>
          <tr><td>Safe to share</td><td>Only with someone you trust to see your history</td><td>Never</td></tr>
          <tr><td>If it leaks</td><td>Your incoming history is exposed</td><td>Your money can be taken</td></tr>
        </tbody>
      </table>
      <Callout kind="warn" title="Your recovery words are the spend key in disguise">
        <mark>Anyone with your 25 words can spend everything</mark> and also knows the view key. Never confuse &quot;share my view key&quot;
        with &quot;share my seed.&quot; One is a limited window into your history. The other is the whole wallet.
      </Callout>

      <h2 id="can-see">What a view key can and cannot see</h2>
      <p>Be precise here, because a lot of articles are not.</p>
      <h3>What someone with your view key can see</h3>
      <ul>
        <li>Every payment received at the address, with its amount, its date and the block it arrived in.</li>
        <li>The transaction IDs of those payments, so they can look them up on a <Link href="/monero-transaction-lookup">block explorer</Link>.</li>
        <li>New incoming payments as they happen, for as long as they keep watching.</li>
      </ul>
      <h3>What they cannot do</h3>
      <ul>
        <li>Spend, send or move any of your Monero.</li>
        <li>Generate your spend key or your recovery words.</li>
        <li>Make you sign anything, or change anything about your wallet.</li>
      </ul>
      <h3>The outgoing-payments gap</h3>
      <p>
        <mark>A view key does not reliably show the money you spent.</mark> Monero marks an output as spent with a value
        called a key image, and working out a key image needs the spend key. The official docs state it directly: a view-only
        wallet has no key images, so it cannot see outgoing transactions, and it can report a wrong balance as a result. See{" "}
        <a href="https://docs.getmonero.org/cold-storage/offline-transaction-signing/" rel="noopener">Monero&apos;s offline signing documentation</a>.
        We explain key images in plain words in the{" "}
        <Link href="/monero-view-only-wallet">view-only wallet guide</Link>.
      </p>
      <Figure caption="Someone with only the view key sees the money in. The money out stays hidden from them.">
        <ViewKeySeesArt />
      </Figure>
      <p>
        That gap cuts two ways. It is a mild privacy comfort, since your spending is not handed over. It also means a view key
        <mark>is a poor way to prove a balance</mark>: it can only show a ceiling. If you need to prove an exact amount, you need more than
        the view key alone.
      </p>

      <h2 id="safe">Is it safe to share your view key?</h2>
      <p>
        Safe for your funds, yes. Safe for your privacy, only if you chose to. Those are two different questions, and the honest
        answer to the second one is &quot;it depends who is looking.&quot;
      </p>
      <p>
        Think of it as giving someone a read-only login to your bank statement, except that it covers the life of the wallet,
        you cannot change the password, and <mark>you cannot ask for it back</mark>. Once a person has seen your history, they have seen it.
        If your address ever becomes linked to your real name, a person holding the view key can connect you to everything that
        arrived there.
      </p>
      <p>Ask three questions before you share:</p>
      <ol>
        <li><strong>Do I trust this person with my full incoming history?</strong> Including payments I have not made yet.</li>
        <li><strong>Will they store it somewhere safe?</strong> A view key in an email thread or a shared spreadsheet can leak.</li>
        <li><strong>Could I use a fresh wallet instead?</strong> A new wallet for one purpose means you only expose that purpose.</li>
      </ol>

      <h2 id="uses">When sharing a view key makes sense</h2>
      <table>
        <thead><tr><th>Use case</th><th>How the view key helps</th><th>Watch out for</th></tr></thead>
        <tbody>
          <tr><td>Accountant or tax adviser</td><td>They can see what you received without access to your funds</td><td>It will not show your spending, so also give them your own record of payments sent</td></tr>
          <tr><td>Business audit</td><td>An auditor confirms revenue arriving at a shop wallet</td><td>Use a wallet only for the shop, not your personal one</td></tr>
          <tr><td>Donation transparency</td><td>Publish the view key so anyone can check donations that arrived</td><td>Everyone, including strangers, sees every donation</td></tr>
          <tr><td>Your own watch-only wallet</td><td>Check your balance on a device you would not trust with your seed</td><td>The balance can be too high after you spend</td></tr>
          <tr><td>Merchant payment checking</td><td>A server confirms a customer paid, with no ability to spend</td><td>Treat the server as a place where the key could leak</td></tr>
        </tbody>
      </table>
      <p>
        Donation transparency is a clean example: a project publishes the address and the view key, and anyone can verify the
        incoming total. MonkStash plans to do exactly this when donations open on its <Link href="/donate">donate page</Link>. The
        trade-off is real, since donors&apos; payments become visible to the world, which is the point of that choice.
      </p>

      <h2 id="risks">The risks, plainly</h2>
      <ul>
        <li><strong>Permanent.</strong> <mark>A view key cannot be revoked</mark>. The only way to stop someone watching is a new wallet and moving the funds.</li>
        <li><strong>Covers the future too.</strong> It reveals payments you receive tomorrow, not only the ones already there.</li>
        <li><strong>Whole account.</strong> Subaddresses made by the same wallet account are covered, so assume all of that account&apos;s incoming activity is open.</li>
        <li><strong>It travels.</strong> Whoever you give it to can pass it on, or lose it. Their security is now part of your privacy.</li>
        <li><strong>Targeted by scammers.</strong> A fake support agent who asks for your &quot;view key to check the problem&quot; is after your history, and often the next ask is your seed. No real support person needs either.</li>
      </ul>
      <p>
        If you suspect the wrong person has your view key, the fix is not complicated: make a new wallet, send your balance to
        its address, and stop using the old one. This is also a good time to read about{" "}
        <Link href="/monero-phishing-sites">phishing sites</Link>, which often ask for keys.
      </p>

      <h2 id="find">How to find your view key</h2>
      <p>
        You find it in the wallet that holds your seed, and you always need to unlock the wallet first. Menu names change
        between versions, so treat these as signposts, and check the wallet&apos;s own documentation if yours differs.
      </p>
      <table>
        <thead><tr><th>Wallet</th><th>Where to look</th></tr></thead>
        <tbody>
          <tr><td>Monero GUI (official)</td><td>Settings, then the seed and keys screen. You re-enter your password, then copy the secret view key.</td></tr>
          <tr><td>Feather</td><td>The Wallet menu, then Keys.</td></tr>
          <tr><td>Cake Wallet</td><td>Settings, then Seed &amp; Keys, then the Keys tab.</td></tr>
          <tr><td>Monero CLI</td><td>Run the <code>viewkey</code> command inside the wallet.</td></tr>
        </tbody>
      </table>
      <p>
        Copy only the <em>view</em> key (a 64-character string of 0-9 and a-f) and your primary address, which starts with 4.
        Do not copy the spend key. Paste the two into whatever needs them, then clear your clipboard. Official steps are in the{" "}
        <a href="https://www.getmonero.org/resources/user-guides/view_only.html" rel="noopener">Monero view-only wallet user guide</a>.
      </p>

      <h2 id="monkstash">How MonkStash uses view keys</h2>
      <p>
        When you add a watch-only wallet in <Link href={walletUrl}>MonkStash</Link>, you give it your primary address and your
        private view key. That is all it asks for. It uses the view key to scan the blockchain for your incoming payments, in the
        browser, on your device. The wallet is stored encrypted with your password and locks itself when idle.
      </p>
      <p>
        We deliberately tell you, on the dashboard, that a watch-only wallet cannot see money sent out, so the balance may be
        higher than the real one. The form also refuses anything that is not a valid view key and reminds you never to paste a
        seed or spend key into it. Step-by-step instructions are in the{" "}
        <Link href="/monero-view-only-wallet">view-only wallet guide</Link>. For the wider picture of what a node can see
        when your wallet scans, read <Link href="/monero-node">what a Monero node is</Link>.
      </p>
      <Callout title="A fair warning about early software">
        MonkStash is an early preview and has not yet been independently audited. For anything valuable, test with a small
        amount first, and keep your recovery words on paper.
      </Callout>

      <h2 id="mistakes">Mix-ups to avoid</h2>
      <ul>
        <li><strong>Entering your seed where a view key is asked.</strong> Check the field label. A view key is 64 characters, never 25 words.</li>
        <li><strong>Posting your view key in a support chat.</strong> <mark>Real support never needs it</mark>. If someone asks, it is a scam.</li>
        <li><strong>Treating the view-key balance as exact.</strong> It does not subtract what you spent.</li>
        <li><strong>Thinking the view key keeps your transactions private.</strong> Monero&apos;s privacy for the world at large is intact; you chose to open a window for one person. See <Link href="/is-monero-traceable">whether Monero is traceable</Link> for how the default privacy works.</li>
        <li><strong>Reusing one wallet for everything.</strong> If you plan to share a view key, use a wallet for that purpose only.</li>
      </ul>

      <h2 id="next">What to do next</h2>
      <p>
        If you want to watch a wallet without risking it, follow the{" "}
        <Link href="/monero-view-only-wallet">view-only wallet guide</Link>. If you are setting up a watch-only wallet for
        an old address, the{" "}
        <Link href="/monero-restore-height">restore height explainer</Link> shows how to make it scan quickly. And if you
        have never made a wallet, <Link href="/create-monero-wallet">start there</Link>.
      </p>
    </>
  );
}
