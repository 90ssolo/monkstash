import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { BalanceDecisionFigure } from "@/components/art/MoneroWalletNotShowingBalanceArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-wallet-not-showing-balance",
  section: "guides",
  kicker: "Troubleshooting",
  title: "Monero Wallet Not Showing Balance? Why It Shows Zero",
  seoTitle: "Monero Wallet Not Showing Balance? The Fix",
  summary: "Monero wallet not showing balance? Your funds are not gone. Check syncing, restore height, locked funds, the network and the account, in that order.",
  keyword: "monero wallet not showing balance",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "calm", label: "Your funds have not vanished" },
    { id: "tree", label: "Start with the quick checks" },
    { id: "syncing", label: "The wallet is still syncing" },
    { id: "height", label: "Restore height is too late" },
    { id: "locked", label: "Part of it is locked" },
    { id: "viewonly", label: "A view-only wallet" },
    { id: "wrong", label: "Wrong network, wallet or seed" },
    { id: "account", label: "Another subaddress or account" },
    { id: "sent", label: "It was never sent" },
    { id: "next", label: "What to do next" },
  ],
  related: ["monero-wallet-not-syncing", "check-monero-balance", "restore-monero-wallet", "receive-monero", "monero-wallet-not-connecting", "monero-restore-height", "monero-transaction-time"],
  faq: [
    { q: "Why is my Monero balance zero?", a: "Most often the wallet has not finished scanning, or it was restored with a restore height later than your first payment. Less often the funds are still locked, the wallet is on the wrong network or seed, or the payment was never sent. Your coins are not erased by a zero display." },
    { q: "Why is my Monero balance wrong?", a: "A balance that is too low usually means the scan is incomplete or the restore height is too late. A balance that is too high can happen in a view-only wallet that cannot see what you have spent. Locked change from a recent send also lowers the spendable amount for a while." },
    { q: "Why is part of my Monero balance locked?", a: "Monero holds new funds, including the change from your own sends, until they have about 10 confirmations, roughly 20 minutes. The locked amount releases by itself." },
    { q: "Can Monero funds go missing?", a: "Not from the blockchain. A payment recorded there stays tied to the keys it was sent to. If your wallet shows less than expected, the wallet is not seeing it yet, or you are looking at a different wallet than the one that was paid." },
    { q: "How do I check if a Monero payment was really sent?", a: "Ask the sender for the transaction ID and the transaction key (the proof). Together with your address, these let anyone check the payment to you without revealing anything else. A sender who cannot provide them may not have sent it." },
    { q: "Do I need to rescan my wallet?", a: "Only if the wallet has fully synced and the balance is still wrong. A rescan re-reads the blockchain from your restore height. It takes time but does not put funds at risk." },
    { q: "Is a payment to a subaddress visible in my main balance?", a: "Yes, within the same account. Subaddresses are additional addresses for one wallet. If your wallet has several accounts, each shows its own balance, so check the account selector." },
    { q: "Does a zero balance mean someone stole my Monero?", a: "Not necessarily. A theft would show as an outgoing transaction in your history. If you see no transaction you made, the likely cause is a display or scanning issue, not theft. If you see one you did not make, move to a new wallet with fresh words." },
  ],
  sources: [
    { label: "Monero user guide: Changing the wallet restore height (too high hides transactions)", href: "https://www.getmonero.org/resources/user-guides/change-restore-height.html" },
    { label: "Monero user guide: Making a view-only wallet (balance is wrong without key images)", href: "https://www.getmonero.org/resources/user-guides/view_only.html" },
    { label: "Monero user guide: Proving a payment (transaction ID, transaction key and address)", href: "https://www.getmonero.org/resources/user-guides/prove-payment.html" },
    { label: "Monero docs: Subaddresses and accounts", href: "https://docs.getmonero.org/public-address/subaddress/" },
    { label: "Monero source code: 10-block spendable age and 2-minute block target (cryptonote_config.h)", href: "https://github.com/monero-project/monero/blob/master/src/cryptonote_config.h" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        If your Monero wallet is not showing a balance, or shows zero or less than you expect, your funds have almost certainly
        not disappeared. <mark>A payment recorded on the blockchain stays there;</mark> a wallet showing zero only means this
        wallet is not seeing it yet. The usual causes are an unfinished scan, a restore height set too late, funds that are still
        locked, or looking at the wrong wallet or network. Here is how to find out which, in order.
      </p>

      <Takeaways items={[
        "A zero balance is a display problem until proven otherwise. The blockchain does not forget payments.",
        "The most common cause after a restore is a restore height set after your first payment.",
        "Funds can be locked for about 10 confirmations (roughly 20 minutes). That is normal.",
        "A view-only wallet may show a balance that is too high, because it cannot see what you spent.",
        "If everything checks out, ask the sender for the transaction ID and proof.",
      ]} />

      <h2 id="calm">Your funds have not vanished</h2>
      <p>
        <mark>Monero does not store coins in your wallet</mark>. It stores keys. Your balance is whatever outputs on the blockchain those keys
        can recognize as yours. To find them, the wallet scans blocks through a{" "}
        <Link href="/monero-node">node</Link> and checks each one against your keys. If the scan has not covered
        the right blocks, or the wallet is connected to the wrong network, it reports less than the truth.
      </p>
      <p>
        That is why the same recovery words, entered into a correctly configured wallet, bring the balance back. Nothing was
        destroyed. The work below is about getting your wallet to look in the right place.
      </p>

      <h2 id="tree">Start with the quick checks</h2>
      <p>
        Four questions cover most cases. Answer them in order and stop at the first yes.
      </p>
      <Figure caption="Four questions, each tied to a usual cause. If none applies, check whether the payment was actually sent.">
        <BalanceDecisionFigure />
      </Figure>
      <table>
        <thead><tr><th>Symptom</th><th>Likely cause</th><th>What to do</th></tr></thead>
        <tbody>
          <tr><td>Zero, and a progress bar is moving</td><td>Still scanning</td><td>Wait for it to finish</td></tr>
          <tr><td>Zero or low after a restore</td><td>Restore height too late</td><td>Restore again from an earlier height</td></tr>
          <tr><td>Total shown, spendable lower</td><td>Locked funds</td><td>Wait about 20 minutes</td></tr>
          <tr><td>Balance too high</td><td>View-only wallet, spends not seen</td><td>Import key images or use the full wallet</td></tr>
          <tr><td>Zero, and the address looks unfamiliar</td><td>Wrong seed or network</td><td>Check words, network and first characters of the address</td></tr>
          <tr><td>Zero in one account only</td><td>Payment sits in another account</td><td>Switch accounts</td></tr>
          <tr><td>Nothing at all in history</td><td>Payment not sent</td><td>Ask the sender for proof</td></tr>
        </tbody>
      </table>

      <h2 id="syncing">The wallet is still syncing</h2>
      <p>
        <mark>Until the scan reaches the newest block, your balance is partial</mark>. After a restore, or on a wallet that was closed for a
        while, it may read zero for the first part of the scan, then jump up as the wallet reaches blocks that contain your
        payments. Look for a progress bar, a block counter, or a status such as &quot;synchronizing&quot;. If it is moving, wait.
      </p>
      <p>
        If it is frozen or says it is disconnected, the problem is the connection, not the balance. Start with{" "}
        <Link href="/monero-wallet-not-connecting">why a wallet is not connecting</Link> or{" "}
        <Link href="/monero-wallet-not-syncing">why it is not syncing</Link>, then come back here.
      </p>

      <h2 id="height">Restore height is too late</h2>
      <p>
        <mark>This is the most common cause after restoring from recovery words</mark>. The restore height is the block your wallet starts
        scanning from. If you set it after your first incoming payment, the wallet never reads the blocks that contain that
        payment and reports a balance without it. The money is still there, tied to the same keys.
      </p>
      <Callout title="Too early costs minutes, too late hides funds">
        If you do not know the height, pick an earlier one than you think. A height that is too early only makes the first scan
        longer. A height that is too late hides older payments.
      </Callout>
      <p>
        To fix it, restore again with a lower height, or use your wallet&apos;s rescan option if it has one and let it run to
        the end. Our guides on <Link href="/monero-restore-height">restore height</Link> and{" "}
        <Link href="/restore-monero-wallet">restoring a wallet</Link> cover how to find the right number from a date.
      </p>

      <h2 id="locked">Part of it is locked</h2>
      <p>
        A Monero payment is not spendable the moment it arrives. <mark>It stays locked until it has about 10 confirmations</mark>, which
        takes roughly 20 minutes at one block every 2 minutes. The same lock applies to change: when you send, the leftover from
        the coins you used comes back to you after the same wait. During that time many wallets show a total balance and a
        smaller unlocked or spendable one.
      </p>
      <p>
        This is expected, and it resolves on its own. See{" "}
        <Link href="/monero-transaction-time">how long a Monero transaction takes</Link> for why the wait exists. If funds
        are still locked after an hour, confirm the wallet is connected and fully synced.
      </p>
      <p>
        <strong>Only part of your balance is available to send?</strong> That is the same lock at work: the total includes
        coins that arrived, or came back as change, in the last 10 blocks. A send larger than the unlocked part fails with a
        message like &quot;amount is more than unlocked balance&quot;. Our guide to{" "}
        <Link href="/monero-unlocked-balance">Monero&apos;s unlocked balance</Link> explains the message and how to send what is
        available now.
      </p>

      <h2 id="viewonly">A view-only wallet</h2>
      <p>
        A view-only wallet is built from your address and private view key. It can recognize payments to you but cannot spend,
        and it does not see outgoing payments on its own. That means <mark>its balance can read too high</mark>: it counts everything received
        and misses what the full wallet already spent. To see spends, the view-only wallet needs key images exported from the full
        wallet. Without them, treat the number as incoming only. Details are in{" "}
        <Link href="/monero-view-only-wallet">how a view-only wallet works</Link>.
      </p>
      <p>
        The reverse mistake also happens: expecting a view-only wallet to be able to send. It cannot, and that is by design.
      </p>

      <h2 id="wrong">Wrong network, wallet or seed</h2>
      <p>
        Three look-alike mistakes give a balance of zero:
      </p>
      <ul>
        <li><strong>Wrong network.</strong> A wallet set to stagenet or testnet, or connected to a node on one, will never show real mainnet coins. Check the network setting and the node&apos;s port range.</li>
        <li><strong>Wrong wallet.</strong> You may have created a new wallet instead of restoring, or restored a different one. Compare the first and last characters of your main address with the one you saved.</li>
        <li><strong>Wrong or mistyped words.</strong> Standard wallets use 25 words, and the last is a checksum that catches most typos. A wrong word that still passes gives a valid but empty wallet with an unfamiliar address.</li>
      </ul>
      <p>
        If your words are the 13-word kind from MyMonero, they are a different format. See{" "}
        <Link href="/restore-mymonero-seed">restoring a MyMonero seed</Link>. MonkStash restores 13-word
        MyMonero phrases; after restoring, check that the address matches your old MyMonero address.
      </p>
      <p>
        Moved from Exodus? Exodus ended Monero support in 2025, so its app no longer shows an XMR balance. Your coins are still
        on the blockchain, tied to your Exodus recovery words. See{" "}
        <Link href="/exodus-monero">how to get your Monero back from Exodus</Link>.
      </p>

      <h2 id="account">Another subaddress or account</h2>
      <p>
        A Monero wallet can have many subaddresses. They all belong to the same wallet, so a payment to any subaddress counts in
        the account that owns it. Accounts are a separate layer: some wallets let you create several accounts, each with its own
        balance and its own subaddresses. If you sent to an address made under a different account than the one on screen, your
        main view will show zero while another account holds the funds.
      </p>
      <ul>
        <li>Open the account selector and check each account.</li>
        <li>Look at the full transaction history, not only the account you opened first.</li>
        <li>Check the address the payer used against your address list.</li>
      </ul>
      <p>
        Our guide to <Link href="/receive-monero">receiving Monero</Link> explains subaddresses in plain terms.
      </p>

      <h2 id="sent">It was never sent</h2>
      <p>
        Sometimes the wallet is right. A payment that never left the sender does not exist on the blockchain, so nothing can
        arrive. Monero hides amounts and addresses, so you cannot just look it up the way you might with a public ledger. Instead,
        the sender can give you{" "}
        <a href="https://www.getmonero.org/resources/user-guides/prove-payment.html" rel="noopener">proof</a>.
      </p>
      <ol>
        <li>Ask for the <strong>transaction ID</strong> from their wallet&apos;s history. You can then <Link href="/monero-transaction-lookup">check it on a block explorer</Link>.</li>
        <li>Ask for the <strong>transaction key</strong>, which lets the payment be checked against your address.</li>
        <li>Use a wallet&apos;s check-payment feature, or ask a helper you trust, to confirm that transaction paid your address and how much.</li>
      </ol>
      <p>
        If the proof checks out and the amount appears, the payment is real and your wallet just needs the right scan. If the
        sender cannot produce a transaction ID, the payment may never have been made, or went elsewhere. Monero payments are
        final, so <mark>a wrong address cannot be recalled</mark>.
      </p>
      <Callout kind="warn" title="Never share your recovery words to get a balance fixed">
        A transaction ID and key prove a payment. They do not give anyone access to your funds. Your 25 recovery words or your
        private keys do. Anyone who asks for them while &quot;helping&quot; you is a scammer.
      </Callout>

      <h2 id="next">What to do next</h2>
      <p>
        If you have worked through every section and the balance is still wrong, make sure you can restore with your words in a
        fresh wallet, such as <Link href={walletUrl}>MonkStash</Link>, using an early restore height, and compare the result. Having
        a tested backup is the best protection (see <Link href="/back-up-monero-wallet">backing up your wallet</Link>).
        For anything else, read the <Link href="/faq">FAQ</Link> or visit <Link href="/support">support</Link>, and keep your
        words to yourself.
      </p>
    </>
  );
}
