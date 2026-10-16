import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { AddressTypesArt, ManyDoorsArt } from "@/components/art/MoneroSubaddressArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-subaddress",
  section: "learn",
  kicker: "Receiving privately",
  title: "Monero Subaddresses: What They Are and When to Use One",
  seoTitle: "Monero Subaddress: What It Is and When to Use It",
  summary: "A Monero subaddress is an extra address from the same wallet that starts with 8. Why use one per payer, and how it differs from integrated addresses.",
  keyword: "monero subaddress",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "why", label: "Why use a different subaddress per payer" },
    { id: "types", label: "Standard, subaddress and integrated addresses" },
    { id: "accounts", label: "Accounts vs subaddresses" },
    { id: "payment-id", label: "What is a Monero payment ID?" },
    { id: "create", label: "How to create one in MonkStash" },
    { id: "how-many", label: "How many can you have" },
    { id: "restore", label: "Restoring and the lookahead window" },
    { id: "limits", label: "What subaddresses do not do" },
  ],
  sources: [
    { label: "Moneropedia: Payment ID (long IDs removed since 0.15)", href: "https://www.getmonero.org/resources/moneropedia/paymentid.html" },
    { label: "Monero documentation: Integrated address (8-byte payment ID, 106 characters)", href: "https://docs.getmonero.org/public-address/integrated-address/" },
    { label: "Monero documentation: Subaddresses", href: "https://docs.getmonero.org/public-address/subaddress/" },
  ],
  related: ["monero-stealth-address", "receive-monero", "monero-view-key", "monero-seed-phrase", "how-monero-works"],
  faq: [
    { q: "What is a Monero subaddress?", a: "A subaddress is an extra receiving address derived from the same wallet and seed. Payments to it arrive in the same balance, but to anyone looking from outside it appears as a different address with no visible link to your others." },
    { q: "Why does my Monero subaddress start with 8?", a: "On the main Monero network, standard addresses start with 4 and subaddresses start with 8. The first character comes from a network byte at the start of the address that marks its type." },
    { q: "What is the difference between a subaddress and an integrated address?", a: "A subaddress is a separate address you create to tell payers apart. An integrated address is a standard address with a short payment ID built in, used mostly by services to match deposits to customers. Individuals are advised to prefer subaddresses." },
    { q: "How many subaddresses can I create?", a: "There is no practical limit. Account and subaddress numbers are 32-bit values, which allows billions. The limit you may notice is how far your wallet scans ahead when you restore from seed." },
    { q: "What is a Monero payment ID?", a: "A payment ID is a short tag that lets a service match an incoming payment to a customer. The long 64-character kind was removed in Monero 0.15. Today the only form is an 8-byte encrypted ID built into an integrated address, and subaddresses do the same job more simply." },
    { q: "Do I need a Monero payment ID?", a: "Almost never. Long payment IDs were removed from Monero in version 0.15. Short 8-byte IDs still exist inside integrated addresses, but a subaddress does the same job without extra fields to forget." },
    { q: "Is a new subaddress for every payment worth the trouble?", a: "It is cheap and helps keep payers from linking each other. For private life, a new one per person or purpose is a good habit. For a shop or an invoice, one per order is common." },
    { q: "If I give two people the same subaddress, can they see each other's payments?", a: "No. They cannot see your wallet. They can only learn that the other exists if they compare notes, or if one of them can see a view key. Different subaddresses make that comparison impossible by looking at the addresses alone." },
    { q: "Are my funds safe if I restore a wallet that used many subaddresses?", a: "Your funds are tied to the seed, not to the addresses. If a restore does not find a payment sent to a subaddress with a high number, it is usually because the wallet only checks a limited window ahead. Ask the wallet to look further, or create the earlier addresses again." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        A Monero subaddress is <mark>an extra receiving address that your wallet creates</mark> from the same seed. Everything sent to it lands in
        the same balance, but each subaddress looks like a separate, unrelated address to the outside world. On the main Monero
        network, a standard address starts with 4 and a subaddress starts with 8. The Monero documentation calls subaddresses the
        default you should use to receive Monero. This guide explains why, how they differ from integrated addresses, and what to
        watch for when you restore.
      </p>

      <Takeaways items={[
        "A subaddress is another door into the same wallet. Money goes to one balance and one recovery phrase.",
        "Give each payer or purpose its own subaddress so they cannot link their payments to each other.",
        "Integrated addresses and payment IDs are mainly for services. Individuals are advised to use subaddresses.",
        "When you restore from seed, a wallet scans only so far ahead for subaddresses. Check your balance if you use many.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        Your wallet starts with one main address. From the same seed it can derive a huge number of subaddresses, each with its own
        public keys. Anyone can pay any of them. The wallet recognises payments to all of them without you doing anything extra, and
        every payment still lands on a one-time <Link href="/monero-stealth-address">stealth address</Link> on the chain.
      </p>
      <Figure caption="One wallet, many doors. Each address is public on its own, and nothing on the chain connects them.">
        <ManyDoorsArt />
      </Figure>

      <h2 id="why">Why use a different subaddress per payer</h2>
      <p>
        Stealth addresses already stop the blockchain from linking your payments. Subaddresses cover a different gap: <mark>the
        people who pay you</mark>. If you give one address to everybody, every payer sees the same address. They cannot see your
        wallet, but they can compare notes, and they can tell that this address is the one you use for everything.
      </p>
      <p>The Monero documentation lists the main reasons to hand out separate subaddresses:</p>
      <ul>
        <li><strong>Knowing what a payment is for.</strong> Each anticipated payment gets its own subaddress, so you can see which invoice or person it belongs to. MonkStash <Link href="/monero-payment-link">payment links</Link> and the <Link href="/accept-monero-payments">merchant tools</Link> do this for you.</li>
        <li><strong>Keeping payers from linking payouts.</strong> If a client pays you every month, giving them a fresh subaddress each time makes it harder for them to link your payouts together.</li>
        <li><strong>No extra fields to forget.</strong> Unlike a payment ID, the subaddress itself carries the information.</li>
      </ul>
      <KeyFact label="A simple habit">
        <mark>One subaddress per person or purpose</mark>. Rent, a client, a shop order, a donation page. It costs nothing and you never have to explain it.
      </KeyFact>

      <h2 id="types">Standard, subaddress and integrated addresses</h2>
      <p>Monero has three address types you will meet on the main network. The first character is a quick way to tell them apart.</p>
      <Figure caption="The three address types and how to spot them.">
        <AddressTypesArt />
      </Figure>
      <table>
        <thead><tr><th>Type</th><th>Looks like</th><th>Best for</th></tr></thead>
        <tbody>
          <tr><td>Standard</td><td>Starts with 4, 95 characters</td><td>Your main address, quick sharing</td></tr>
          <tr><td>Subaddress</td><td>Starts with 8, 95 characters</td><td>Separating payers and purposes</td></tr>
          <tr><td>Integrated</td><td>Starts with 4, 106 characters</td><td>Services that need a payment ID</td></tr>
        </tbody>
      </table>
      <p>
        If you are unsure which kind an address is, paste it into the <Link href="/tools/monero-address-validator">Monero address
        validator</Link> to check that it is well formed. Note that a network byte decides the first character: the documentation gives
        42 for mainnet subaddresses, 18 for standard addresses and 19 for integrated ones, which is why they start with different characters.
      </p>

      <h2 id="accounts">Accounts vs subaddresses</h2>
      <p>
        Wallets organise subaddresses in two levels. Every subaddress has two numbers, an <strong>account index</strong> and a{" "}
        <strong>subaddress index</strong>, both starting at 0. The Monero documentation defines accounts as a wallet-level grouping of
        subaddresses under one label and balance. An account has no address of its own.
      </p>
      <ul>
        <li><strong>Account 0, subaddress 0</strong> is your main address, the standard one.</li>
        <li><strong>Subaddresses within an account</strong> are the extra addresses you hand out.</li>
        <li><strong>Extra accounts</strong> are useful to run separate balances in one wallet, for example personal and business. Many simple wallets show only account 0.</li>
      </ul>
      <p>
        Most people only ever need subaddresses inside the default account. <mark>Accounts add organisation, not privacy</mark>: they all come from
        the same seed and the same view key.
      </p>

      <h2 id="payment-id">What is a Monero payment ID?</h2>
      <p>
        A Monero payment ID is a short tag attached to a payment so a service can match it to a customer. Monero used to allow a long,
        64-character payment ID in a transaction&apos;s extra field. That caused problems: it could link a person&apos;s payments if
        reused, users forgot to add it and needed support, and only one could be attached per transaction. Long payment IDs were
        removed from Monero in version 0.15, so you cannot use them anymore, as the{" "}
        <a href="https://www.getmonero.org/resources/moneropedia/paymentid.html" rel="noopener">Moneropedia entry on payment IDs</a>{" "}
        confirms.
      </p>
      <p>
        What remains is the{" "}
        <a href="https://docs.getmonero.org/public-address/integrated-address/" rel="noopener"><strong>integrated address</strong></a>:
        a standard address with an 8-byte payment ID built in, 106 characters long. The ID is encrypted so outsiders cannot link the payment to the address. Integrated addresses suit businesses
        and automated payment systems. For individuals, the documentation recommends subaddresses, and the 2019 deprecation notice
        warned that integrated addresses could be phased out too and advised services to move to subaddresses.
      </p>
      <p>
        Why do some exchanges still ask for one? Because an exchange often receives every customer&apos;s deposits into one
        wallet, and the payment ID is how its software knows whose deposit is whose. Moving to a subaddress per customer takes
        engineering work, so some services keep the older method.
      </p>
      <Callout title="Sending to an exchange that still asks for a payment ID">
        Some exchanges still give a deposit address and a separate payment ID, or an integrated address. Use exactly what they give you
        and double-check it. Anything sent without a required ID can be hard to recover. This is about sending, not about how you
        receive in your own wallet.
      </Callout>

      <h2 id="create">How to create one in MonkStash</h2>
      <Steps items={[
        { title: "Open and unlock your wallet", body: <>Go to your <Link href={walletUrl}>MonkStash wallet</Link> and unlock it with your password.</> },
        { title: "Find the Receive card on the dashboard", body: "It shows your current address and a QR code." },
        { title: "Choose New address", body: "The wallet derives the next unused subaddress from your seed, on your device." },
        { title: "Copy it and share it with one payer", body: "Pay attention to the first character. A subaddress starts with 8." },
        { title: "Label it somewhere you will find it", body: "Write down who or what it is for. The wallet cannot guess that for you." },
      ]} />
      <p>
        Any payment sent to that address arrives in your normal balance. For the full receiving walkthrough, see{" "}
        <Link href="/receive-monero">how to receive Monero</Link>.
      </p>

      <h2 id="how-many">How many can you have</h2>
      <p>
        There is no practical ceiling. According to the Monero documentation, the account index and the subaddress index are each
        32-bit unsigned integers, so each range holds billions of values. Making a thousand subaddresses does not slow down the
        network, because the chain never sees them, only the one-time addresses made from them.
      </p>
      <p>
        There is a wallet-side limit, though, and it matters most on restore.
      </p>

      <h2 id="restore">Restoring and the lookahead window</h2>
      <p>
        When you restore from your <Link href="/monero-seed-phrase">recovery words</Link>, the wallet does not know how many
        subaddresses you made. It has to guess, so it pre-computes a window of subaddresses and watches for payments to any of them.
        In Monero&apos;s own wallet code, that default window is <mark>50 accounts and 200 subaddresses per account</mark>. Other wallets may use
        different numbers.
      </p>
      <p>
        Most people never hit that limit. It becomes relevant if you created a subaddress far beyond the end of the numbers you have
        used, say number 500 while only a handful exist, and later restore on a new device. A payment to a subaddress outside the
        window may not show up until the wallet looks further.
      </p>
      <ul>
        <li><mark>Create subaddresses in order, without skipping far ahead</mark>.</li>
        <li>After a restore, compare the balance with what you expect. A missing payment to a high-numbered subaddress is a hint about this.</li>
        <li>If a payment is missing, create or reveal the lower-numbered subaddresses again, or restore in a wallet that lets you widen the window.</li>
      </ul>
      <p>
        We recommend testing a restore with a small amount before relying on a large number of subaddresses. The wallet-side
        behaviour of your own tools is the part you should always confirm yourself. For the restore process itself, see{" "}
        <Link href="/restore-monero-wallet">how to restore a Monero wallet</Link>.
      </p>

      <h2 id="limits">What subaddresses do not do</h2>
      <p><mark>Subaddresses are a good habit, not a shield</mark>. Be honest with yourself about what they cannot do.</p>
      <ul>
        <li>
          <strong>They are not separate wallets.</strong> They share one seed and one view key. Anyone with your{" "}
          <Link href="/monero-view-key">view key</Link> can see payments to all of them.
        </li>
        <li>
          <strong>They do not beat a service that records you.</strong> The Monero documentation points out that if you have an account
          with a service, its database links your payouts regardless of how many addresses you use.
        </li>
        <li>
          <strong>They have a known weakness against colluding services.</strong> The documentation describes the Janus attack, where
          colluding services target one address at a time. For perfect unlinkability, it recommends a separate seed, meaning a separate
          wallet.
        </li>
      </ul>
      <p>
        Planned changes to Monero&apos;s addressing, collectively called Carrot, are described by the developers as staying backward
        compatible with existing addresses, so the addresses you use today are expected to keep working. Check the project&apos;s
        announcements before assuming anything about timing.
      </p>
      <p>
        To learn the mechanics behind why your chain history stays private, read{" "}
        <Link href="/monero-stealth-address">Monero stealth addresses</Link>. To set up a wallet and make your first
        subaddress, <Link href={walletUrl}>open MonkStash</Link>. The official page is in the{" "}
        <a href="https://docs.getmonero.org/public-address/subaddress/" rel="noopener">Monero documentation</a>.
      </p>
    </>
  );
}
