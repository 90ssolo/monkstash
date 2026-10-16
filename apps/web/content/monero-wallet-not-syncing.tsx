import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { IlloNode } from "@/components/art/Illustrations";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-wallet-not-syncing",
  section: "guides",
  kicker: "Troubleshooting",
  title: "Monero Wallet Not Syncing? How to Fix It",
  summary: "Monero wallet not syncing or showing the wrong balance? It is almost always a node, connection, or settings problem. Here are the fixes, in order.",
  keyword: "monero wallet not syncing",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "why", label: "Why wallets get stuck" },
    { id: "normal", label: "Is it actually stuck?" },
    { id: "fixes", label: "Fixes, in order" },
    { id: "balance", label: "Synced but balance looks wrong" },
    { id: "missing", label: "A payment is missing" },
    { id: "locked", label: "Funds show as locked" },
    { id: "desktop", label: "Desktop and phone tips" },
    { id: "safe", label: "Are my funds safe?" },
    { id: "web", label: "A web wallet can help" },
    { id: "next", label: "What to do next" },
  ],
  related: ["restore-monero-wallet", "receive-monero", "create-monero-wallet", "monero-restore-height"],
  sources: [
    { label: "Moneropedia: Remote Node", href: "https://www.getmonero.org/resources/moneropedia/remote-node.html" },
    { label: "Monero user guide: how to use a remote node in the GUI wallet", href: "https://www.getmonero.org/resources/user-guides/remote_node_gui.html" },
    { label: "Monero user guide: restoring your wallet (restore height)", href: "https://www.getmonero.org/resources/user-guides/restore_account.html" },
    { label: "monerod reference: sync, ports and node settings", href: "https://docs.getmonero.org/interacting/monerod-reference/" },
  ],
  faq: [
    { q: "Why is my Monero wallet stuck on synchronizing?", a: "The most common cause is the node your wallet connects to being slow, overloaded, or offline. Switching to a different node usually fixes it. A blocked port, an unstable connection, or an old wallet version can also be the cause." },
    { q: "How long should a Monero wallet take to sync?", a: "A web or light wallet with the right restore date usually syncs in seconds to a minute. A full wallet downloading the whole history can take hours the first time. If a light wallet takes much longer than that, something is wrong." },
    { q: "Why is my Monero balance zero after restoring?", a: "Usually the restore height (the date the wallet starts scanning from) is later than your first payment, or the wallet has not finished scanning. Restore again with an earlier date and let the scan finish." },
    { q: "Why is my Monero balance locked?", a: "After a payment or a send, Monero holds funds for about ten blocks, roughly twenty minutes, before they can be spent. Change from your own sends is held the same way. It unlocks by itself." },
    { q: "Why is my incoming Monero payment not showing?", a: "It may not be confirmed yet, your wallet may still be scanning, or the node may be behind. Wait a few minutes, check that you are on the right node and network, and confirm the sender used your correct address." },
    { q: "Do I need to rescan my Monero wallet?", a: "Only if payments are missing or the balance is wrong after a full sync. A rescan makes the wallet re-read the chain from an earlier point. It can take a while but it does not risk your funds." },
    { q: "Can a stuck sync lose my Monero?", a: "No. Your money lives on the network, tied to your keys. A stuck sync only means your wallet cannot currently read the data. With your recovery words you can always restore and see your balance." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A Monero wallet that sits on &quot;synchronizing&quot; forever, or shows a balance that looks wrong, is frustrating but
        usually easy to fix. <mark>Almost every case comes down to the node it talks to</mark>, your connection, or a settings detail. Your
        money is not in danger. Work through the steps below in order and one of them will sort it out.
      </p>

      <Takeaways items={[
        "Most sync problems are the node, not your wallet or your money.",
        "Switching to a different node is the single most effective fix.",
        "A wrong restore date is the usual reason a balance looks too low.",
        "Your funds are safe on the network the whole time.",
      ]} />

      <h2 id="why">Why wallets get stuck</h2>
      <p>
        To show your balance, a Monero wallet has to scan the network for the payments that belong to you. It does that by talking
        to a node, a computer that serves blockchain data. <mark>If that node is slow, overloaded, or offline, your wallet stalls</mark>.
        Nothing is wrong with your money; the wallet just cannot get the data it needs.
      </p>
      <Figure caption="The wallet asks a node for blocks and scans them with your keys. If the node is slow or down, syncing stalls.">
        <IlloNode />
      </Figure>
      <p>
        The wallet also needs to know where to start scanning. <Link href="/monero-restore-height">That starting point is the restore height</Link>, the block from which
        your wallet looks for your payments. A new wallet starts near the present. A restored wallet needs a height at or before
        its first payment.
      </p>

      <h2 id="normal">Is it actually stuck?</h2>
      <p>
        Syncing can look stuck when it is just slow. Before you change anything, check these signs:
      </p>
      <ul>
        <li><strong>The block counter is moving.</strong> If the number of blocks left is going down, even slowly, it is working. Give it time.</li>
        <li><strong>It is the first sync.</strong> A full desktop wallet scanning years of history can take hours. A web or light wallet should be much faster.</li>
        <li><strong>The counter has not moved for several minutes.</strong> That points to a node or connection problem, and the fixes below apply.</li>
      </ul>

      <h2 id="fixes">Fixes, in order</h2>
      <ol>
        <li><strong>Switch to a different node.</strong> <mark>This fixes most cases</mark>. In a desktop wallet, change the remote node in settings. A web wallet like <Link href={walletUrl}>MonkStash</Link> handles this for you and falls back to another node automatically. See <Link href="/monero-remote-node">how to choose a remote node</Link>.</li>
        <li><strong>Check your internet connection.</strong> Monero needs a steady connection. Flaky wifi or a captive portal (like a hotel login page) can stall a sync.</li>
        <li><strong>Turn off a VPN or Tor temporarily.</strong> Some VPN servers and Tor routes are slow or block the connection. Test without them to see if that is the cause.</li>
        <li><strong>Check you are on the right network.</strong> Real XMR needs a mainnet node. A stagenet or testnet node will show an empty wallet.</li>
        <li><strong>Update your wallet.</strong> An old version may not work with the current network. Install the latest from the official source.</li>
        <li><strong>Close it fully and reopen.</strong> A fresh start often clears a stuck connection.</li>
        <li><strong>Check your device clock and storage.</strong> A badly wrong clock can break secure connections, and a full disk can stop a desktop wallet from saving progress.</li>
      </ol>
      <Callout title="On a phone, keep the app open">
        Some mobile wallets pause syncing when the app goes to the background. Keep the wallet open on screen while it catches up.
      </Callout>

      <h2 id="balance">Synced, but the balance looks wrong</h2>
      <p>
        If your wallet finishes syncing but the balance is lower than expected, the usual cause is the restore date being set too
        late, so the wallet never scanned far enough back to find older payments. <mark>Restoring again with an earlier date fixes it</mark>.
        If you do not know the date, use an earlier one: a date that is too early only makes the scan longer, while a date that is
        too late hides funds.
      </p>
      <p>
        See <Link href="/restore-monero-wallet">how to restore a Monero wallet</Link> for the steps, and remember to give
        the scan time to finish before deciding anything is missing.
      </p>

      <h2 id="missing">A payment is missing</h2>
      <p>
        If someone says they paid you and you see nothing, go through these checks:
      </p>
      <ul>
        <li><strong>Confirm the address.</strong> Ask the sender to confirm the exact address they used. A single wrong character sends money elsewhere, and Monero payments cannot be reversed.</li>
        <li><strong>Wait for the first confirmation.</strong> A payment usually appears within a couple of minutes, but a busy network can take longer.</li>
        <li><strong>Check the wallet is fully synced.</strong> A wallet that is behind will not show recent payments yet.</li>
        <li><strong>Check the subaddress.</strong> If you gave out a subaddress, the payment still lands in the same wallet, but make sure you are looking at the right account.</li>
        <li><strong>Ask for a transaction proof.</strong> The sender can provide a <Link href="/monero-transaction-lookup">transaction ID</Link> and proof, which helps pinpoint the payment. See <Link href="/receive-monero">how to receive Monero</Link>.</li>
      </ul>

      <h2 id="locked">Funds show as locked</h2>
      <p>
        Monero holds new funds for about ten blocks, which is roughly twenty minutes, before you can spend them. The same applies
        to the change from your own sends: when you spend part of a balance, the leftover comes back to you after the same wait.
        <mark>This is normal and it unlocks on its own</mark>. If the balance still shows as locked after an hour, check that the wallet is
        fully synced and connected to a working node.
      </p>

      <h2 id="desktop">Desktop and phone tips</h2>
      <p>
        If you use a desktop or full wallet, a few extra things can slow syncing. Run it from a fast disk, since a slow hard drive
        is a common cause of long first syncs. Allow the wallet through your firewall. If you run your own node, make sure it is
        itself fully synced before blaming the wallet. The official{" "}
        <a href="https://docs.getmonero.org/" rel="noopener">Monero documentation</a> lists current options and settings.
      </p>
      <p>
        On a phone, keep the screen on while the first sync runs, and avoid switching between wifi and mobile data mid-sync.
      </p>

      <h2 id="safe">Are my funds safe?</h2>
      <p>
        Yes. <mark>Your Monero is recorded on the network, not on your device</mark>. A stuck sync only means your wallet cannot currently read
        that data. If everything goes wrong, you can always restore with your 25 recovery words and see your balance again. That
        is why <Link href="/back-up-monero-wallet">backing up your recovery words</Link> matters more than any fix on this
        page.
      </p>
      <Callout kind="warn" title="Never share your words to get help">
        <mark>No one fixing a sync problem needs your recovery words</mark>. If a person in a chat or a website asks for them, it is a scam.
      </Callout>

      <h2 id="web">A web wallet avoids most of this</h2>
      <p>
        A lot of sync pain comes from running and maintaining your own node, or from a desktop wallet pointed at a bad one. A web
        wallet connects to a node for you and switches automatically if one is unavailable, so there is usually nothing to
        configure. If syncing has been a recurring headache, <Link href="/create-monero-wallet">creating a web wallet</Link>{" "}
        is a simpler path for everyday use.
      </p>

      <h2 id="next">What to do next</h2>
      <p>
        If you still cannot get unstuck, read <Link href="/monero-node">what a Monero node is</Link> to understand
        what is going on underneath, check our <Link href="/faq">FAQ</Link>, or visit <Link href="/support">support</Link>. Once
        your wallet is working, you can <Link href="/send-monero">send</Link> or receive Monero with confidence.
      </p>
    </>
  );
}
