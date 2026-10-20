import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, KeyFact, Steps, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { Adaptive } from "@/components/art/WhatIsMoneroNarrowArt";
import { FcmpAnonymitySetArt, FcmpAnonymitySetNarrow, FcmpRoadArt, FcmpRoadNarrow } from "@/components/art/MoneroFcmpArt";
import { walletUrl } from "@/lib/site";

const CHECKED = "checked 2026-10-15";

export const meta: ArticleMeta = {
  slug: "monero-fcmp",
  section: "learn",
  kicker: "The big upgrade",
  title: "FCMP++ and Carrot: What Monero's Biggest Upgrade Changes for You",
  seoTitle: "Monero FCMP++ and Carrot: What Changes for You",
  summary: "Monero FCMP++ replaces rings of 16 with proofs over the whole chain, and Carrot keeps your address. No mainnet date yet. What changes and what to do.",
  keyword: "monero fcmp",
  updated: "2026-10-15",
  readingMinutes: 10,
  toc: [
    { id: "short-answer", label: "The short answer" },
    { id: "status", label: "Where FCMP++ stands today" },
    { id: "sixteen-vs-chain", label: "From 16 to the whole chain" },
    { id: "carrot", label: "Carrot in plain words" },
    { id: "other-changes", label: "Other changes you will notice" },
    { id: "wallets", label: "Will my wallet work after the fork?" },
    { id: "fork-day", label: "What to do on fork day" },
    { id: "next", label: "Next steps" },
  ],
  related: ["monero-ring-signatures", "how-monero-works", "monero-stealth-address", "monero-subaddress"],
  faq: [
    { q: "What is FCMP++ in Monero?", a: "FCMP++ stands for Full-Chain Membership Proofs. It is a proposed upgrade that replaces ring signatures, where a spend hides among 16 outputs, with a proof that the coin being spent is one of all eligible outputs on the chain, without saying which one." },
    { q: "When is the FCMP++ release date on mainnet?", a: "There is none yet. As of 15 October 2026 no mainnet date has been announced on getmonero.org or in the developers' meeting logs we read. A public test network called the beta stressnet forked to its third version on 5 October 2026." },
    { q: "Will my Monero address change with Carrot?", a: "No. The Carrot specification says it keeps backwards compatibility with existing addresses, subaddresses and integrated addresses, and that no wallet key migration is required." },
    { q: "Will my Monero wallet work after the fork?", a: "Only if it is updated. Like every Monero hard fork, wallets and nodes need software that follows the new rules. Your coins and your seed stay the same; the app has to be a version that supports FCMP++." },
    { q: "Do I need to move my XMR before the upgrade?", a: "No. Nothing about the published plans asks holders to move coins. Be suspicious of anyone who tells you to send coins somewhere, or type your seed into a site, to 'upgrade' them. That is a scam pattern." },
    { q: "What is Carrot in Monero?", a: "Carrot is a proposed update to Monero's addressing protocol that ships alongside FCMP++. It keeps today's addresses working, fixes known attacks such as the Janus attack and the burning bug, and gives newly created wallets extra key types, including a full view-only key." },
    { q: "Is the custom unlock time going away?", a: "Yes. The Monero project announced on 10 May 2026 that custom transaction unlock times are set to be deprecated at consensus with FCMP++. Transactions already created keep their unlock times." },
  ],
  sources: [
    { label: "FCMP++ and Carrot stressnet releases (seraphis-migration/monero on GitHub)", href: "https://github.com/seraphis-migration/monero/releases" },
    { label: "Carrot specification (jeffro256/carrot on GitHub)", href: "https://github.com/jeffro256/carrot/blob/master/carrot.md" },
    { label: "Deprecating Monero's Custom Transaction Unlock Time (getmonero.org, 10 May 2026)", href: "https://www.getmonero.org/2026/05/10/deprecating-unlock-time.html" },
    { label: "Monero 0.18.5.3 'Fluorine Fermi' released (getmonero.org, 6 October 2026)", href: "https://www.getmonero.org/2026/10/06/monero-0.18.5.3-released.html" },
    { label: "Monero roadmap (getmonero.org)", href: "https://www.getmonero.org/resources/roadmap/" },
    { label: "Monero technical specifications: ring size", href: "https://docs.getmonero.org/technical-specs/" },
    { label: "OSPEAD: optimal ring signature research (getmonero.org, 5 April 2025)", href: "https://www.getmonero.org/2025/04/05/ospead-optimal-ring-signature-research.html" },
    { label: "FCMP++ Integration Audit (Monero CCS proposal)", href: "https://ccs.getmonero.org/proposals/fcmp++-integration-audit.html" },
    { label: "jeffro256 full-time development 2026 Q1 (Monero CCS proposal)", href: "https://ccs.getmonero.org/proposals/jeffro256-full-time-2026Q1.html" },
    { label: "Monero Research Lab meeting, 30 September 2026 (monero-project/meta #1466)", href: "https://github.com/monero-project/meta/issues/1466" },
    { label: "Monero Research Lab meeting, 7 October 2026 (monero-project/meta #1470)", href: "https://github.com/monero-project/meta/issues/1470" },
    { label: "Feather Wallet ideas page", href: "https://featherwallet.org/ideas/" },
    { label: "Cake Wallet pull request #3530: initial fcmp++-stage build", href: "https://github.com/cake-tech/cake_wallet/pull/3530" },
    { label: "Monerujo issue search for FCMP (m2049r/xmrwallet on GitHub)", href: "https://github.com/m2049r/xmrwallet/issues?q=fcmp" },
    { label: "monero-ts releases (woodser/monero-ts on GitHub)", href: "https://github.com/woodser/monero-ts/releases" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        FCMP++ is the largest change planned for Monero in years. It <mark>replaces rings of 16 with a proof that covers the whole
        chain</mark>, and it arrives together with Carrot, a new addressing protocol that keeps your current address working. Here is
        what is confirmed, what is still being tested, and what you should do (and not do) before and on fork day. Every status
        line on this page was checked against primary sources on 15 October 2026.
      </p>

      <Callout title="The answer in 20 seconds">
        <strong>There is no mainnet date yet</strong>, and <strong>there is nothing you need to do today</strong>. Your coins, seed and
        address stay the same. When a date is announced, you will need to update your wallet app before the fork. What will change:
        your spends hide among every eligible output instead of 16, custom unlock times go away, and newly created wallets gain
        new key types such as a full view-only key.
      </Callout>

      <Takeaways items={[
        "FCMP++ is a proposed upgrade. It is running on a public test network with worthless coins, not on mainnet.",
        "The beta stressnet forked to version 3 on 5 October 2026. No mainnet date has been announced.",
        "Carrot keeps existing addresses and seeds working. No key migration is needed.",
        "On fork day, update your wallet from its official source. Nobody legitimate will ask for your seed or your coins.",
      ]} />

      <h2 id="short-answer">The short answer</h2>
      <p>
        Today every Monero spend uses a <Link href="/monero-ring-signatures">ring signature</Link>: your real coin plus 15 decoys,
        a ring size of 16, as the{" "}
        <a href="https://docs.getmonero.org/technical-specs/" rel="noopener">Monero technical specifications</a> state. The
        developers describe FCMP++ as a proposed upgrade &quot;to replace ring signatures with membership proofs that span the whole
        chain.&quot; Carrot, released alongside it, is described as a proposed upgrade to Monero&apos;s addressing protocol.
      </p>
      <p>
        In plain words: <mark>the crowd you hide in grows from 16 to everyone</mark>, and the way wallets find their payments gets
        safer, without asking you to change your address.
      </p>

      <h2 id="status">Where FCMP++ stands today</h2>
      <p>
        Developers test the upgrade on a <strong>stressnet</strong>: a separate test network that forks off Monero&apos;s testnet, where
        the coins have no value. The release notes on the{" "}
        <a href="https://github.com/seraphis-migration/monero/releases" rel="noopener">seraphis-migration GitHub repository</a> give
        the dates below.
      </p>
      <Figure caption="The public test path so far, from the seraphis-migration release notes. Every step is a test network with worthless coins, not a change to real Monero.">
        <Adaptive wide={<FcmpRoadArt />} narrow={<FcmpRoadNarrow />} />
      </Figure>
      <table>
        <thead><tr><th>Release</th><th>What happened</th></tr></thead>
        <tbody>
          <tr><td>Alpha stressnet</td><td>Forked from testnet on 3 October 2025 at block 2847330</td></tr>
          <tr><td>Beta stressnet v1</td><td>Forked from testnet on 6 May 2026 at block 2997100</td></tr>
          <tr><td>Beta stressnet v2</td><td>Forked on 27 May 2026 at block 3012000 to fix a consensus issue</td></tr>
          <tr><td>Beta stressnet v3</td><td>Released 25 September 2026; forked on 5 October 2026 at block 3102800</td></tr>
        </tbody>
      </table>
      <p>
        The v3 notes call it beta software that &quot;will likely have bugs&quot;, and list hardware wallets, multisig and transaction
        proofs as not yet working. In the{" "}
        <a href="https://github.com/monero-project/meta/issues/1470" rel="noopener">Research Lab meeting of 7 October 2026</a>,
        developers confirmed the fork had happened and discussed fixes still in progress, including one found by an external review.
      </p>
      <p>
        Audits are running in parallel. The{" "}
        <a href="https://ccs.getmonero.org/proposals/fcmp++-integration-audit.html" rel="noopener">FCMP++ integration audit proposal</a>{" "}
        (posted 6 April 2026) splits the review into three phases and showed 0 of 3 milestones complete when we checked. In the{" "}
        <a href="https://github.com/monero-project/meta/issues/1466" rel="noopener">30 September 2026 meeting</a>, the lead integrator
        said phase 2 code was merged and phase 3 code was open for review, with a request for audit quotes for those phases still to
        be drafted.
      </p>
      <KeyFact label="Mainnet date">
        None announced as of 15 October 2026. The getmonero.org roadmap lists full-chain membership proofs under &quot;Coming Soon&quot;
        with no date, and the project&apos;s May 2026 unlock-time post says no fork date had been set.
      </KeyFact>
      <p>
        You will read guesses elsewhere, some of them confident. We do not repeat them. A hard fork date is set by the developers
        when they judge the code and audits ready, and announced through official channels such as getmonero.org. We will update this page when that happens.
      </p>

      <h2 id="sixteen-vs-chain">From 16 to the whole chain</h2>
      <p>
        A ring of 16 is a good hiding place, but a small one. Your wallet picks 15 decoys from past outputs, and an analyst can try
        to guess the real one from clues such as how old each output is. A 2025{" "}
        <a href="https://www.getmonero.org/2025/04/05/ospead-optimal-ring-signature-research.html" rel="noopener">Monero Research Lab
        post</a> estimates that a well-built guessing attack gets the real spend right <mark>about 1 time in 4.2</mark> instead of 1 in
        16, and says full-chain membership proofs &quot;eliminate the weaknesses of the ring signature privacy model.&quot; Our{" "}
        <Link href="/monero-ring-signatures">ring signature guide</Link> puts that number in context.
      </p>
      <p>
        FCMP++ removes the guessing game. Instead of naming 16 candidates, your transaction proves that the coin you spend is{" "}
        <mark>one of all eligible outputs on the chain</mark>, without saying which. There are no decoys to choose, so there is no
        decoy pattern to analyse.
      </p>
      <Figure caption="Left: today a spend hides among 16 outputs. Right: under FCMP++, every eligible output on the chain is a candidate.">
        <Adaptive wide={<FcmpAnonymitySetArt />} narrow={<FcmpAnonymitySetNarrow />} />
      </Figure>
      <table>
        <thead><tr><th></th><th>Today (ring signatures)</th><th>With FCMP++</th></tr></thead>
        <tbody>
          <tr><td>Who could have sent it</td><td>One of 16 ring members</td><td>Any eligible output on the chain</td></tr>
          <tr><td>Decoy selection</td><td>Your wallet picks 15 decoys</td><td>No decoys</td></tr>
          <tr><td>Main weakness</td><td>Statistical guessing from decoy patterns</td><td>The guessing attack on decoys goes away</td></tr>
          <tr><td>Hides receiver and amount</td><td>Yes, via stealth addresses and RingCT</td><td>Yes, unchanged in purpose</td></tr>
          <tr><td>Status</td><td>Live on mainnet</td><td>On the test network only</td></tr>
        </tbody>
      </table>
      <p>
        What stays the same: receivers are still hidden by one-time <Link href="/monero-stealth-address">stealth addresses</Link>, and
        amounts are still hidden. For the full picture of how the three layers fit, see{" "}
        <Link href="/how-monero-works">how Monero works</Link>.
      </p>

      <h2 id="carrot">Carrot in plain words</h2>
      <p>
        Carrot stands for &quot;Cryptonote Address on Rerandomizable-RingCT-Output Transactions.&quot; You will never need that
        name. What matters is what it does for you, according to the{" "}
        <a href="https://github.com/jeffro256/carrot/blob/master/carrot.md" rel="noopener">Carrot specification</a>:
      </p>
      <ul>
        <li>
          <strong>Your address keeps working.</strong> Carrot <mark>keeps backwards compatibility with existing addresses</mark>,
          including <Link href="/monero-subaddress">subaddresses</Link> and integrated addresses. The specification says no wallet key
          migration is required.
        </li>
        <li>
          <strong>Known attacks are closed for every wallet.</strong> It mitigates the Janus attack (a trick to link two of your
          addresses) and the burning bug (a way to make received funds unspendable).
        </li>
        <li>
          <strong>New wallets get new keys.</strong> Wallets created under Carrot get a key hierarchy with a{" "}
          <em>view-all</em> tier (a true view-only wallet that sees incoming payments and spends, so it shows the correct balance, but
          cannot spend) and a <em>generate-address</em> tier (creates receiving addresses without seeing the chain), useful for shop
          tills.
        </li>
      </ul>
      <Callout kind="warn" title="One honest catch">
        The new key tiers are for new wallets only. The specification says existing Monero wallets will not inherit these features.
        Your old wallet keeps working; to get the new tiers you would create a new wallet and move funds when you choose to.
      </Callout>

      <h2 id="other-changes">Other changes you will notice</h2>
      <p>
        <strong>Custom unlock times go away.</strong> On{" "}
        <a href="https://www.getmonero.org/2026/05/10/deprecating-unlock-time.html" rel="noopener">10 May 2026</a> the project
        announced that the custom transaction unlock time is &quot;set to be deprecated at consensus with FCMP++.&quot; The post cites
        security, privacy and fungibility problems, and merchant software that failed to check unlock times. Transactions already
        created keep their unlock times; transactions created after 1 June 2026 with an unlock time past the fork would unlock when
        the fork block arrives. This is separate from the normal short lock on newly received funds, which our guide to{" "}
        <Link href="/monero-unlocked-balance">unlocked balance</Link> explains.
      </p>
      <p>
        <strong>A rescan may be needed.</strong> On the test network, one fork required existing wallets to be &quot;re-scanned from
        restore height.&quot; Whether mainnet will need the same is not decided in anything we read, so keep your{" "}
        <Link href="/monero-restore-height">restore height</Link> written down with your seed.
      </p>

      <h2 id="wallets">Will my wallet work after the fork?</h2>
      <p>
        Only once it ships an FCMP++ version. The table shows what we could verify for each wallet, with the date we checked.
        &quot;No public work found&quot; means we searched the project&apos;s public channels and found nothing, not that nothing is
        happening.
      </p>
      <table>
        <thead><tr><th>Wallet</th><th>What we could verify</th><th>Checked</th></tr></thead>
        <tbody>
          <tr>
            <td>Monero GUI and CLI</td>
            <td>The FCMP++ test builds of the official CLI and GUI are published on the stressnet releases page. The latest mainnet release, 0.18.5.3 (6 October 2026), does not mention FCMP++.</td>
            <td>{CHECKED}</td>
          </tr>
          <tr>
            <td>Feather</td>
            <td>Its ideas page states an aim to release an &quot;FCMP++-ready beta&quot; for testnet. The page is undated, and we found no released FCMP++ build.</td>
            <td>{CHECKED}</td>
          </tr>
          <tr>
            <td>Cake Wallet</td>
            <td>An open pull request, &quot;initial: fcmp++-stage build&quot; (#3530), was opened on 17 August 2026. Not merged when checked.</td>
            <td>{CHECKED}</td>
          </tr>
          <tr>
            <td>Monerujo</td>
            <td>No public FCMP++ work found in its GitHub issue tracker.</td>
            <td>{CHECKED}</td>
          </tr>
          <tr>
            <td>Hardware wallets (Ledger, Trezor)</td>
            <td>Not yet working on the beta v3 stressnet, per its release notes. A Carrot developer&apos;s 2026 funding plan lists outreach to manufacturers. We found no vendor announcement.</td>
            <td>{CHECKED}</td>
          </tr>
          <tr>
            <td>MonkStash</td>
            <td>Not ready yet. Our engine, monero-ts, is built on the Monero 0.18.5 line, and its public releases and issue tracker show no FCMP++ work yet. Getting ready is on our <Link href="/donate">public roadmap</Link>.</td>
            <td>{CHECKED}</td>
          </tr>
        </tbody>
      </table>
      <p>
        We are open about our own row because it matters: a wallet that is not updated cannot send after a hard fork. If MonkStash
        is not ready on fork day, we will say so on the site, and your 25-word seed will restore in any updated Monero wallet.
      </p>

      <h2 id="fork-day">What to do on fork day</h2>
      <p>When the developers announce a date, this is the whole checklist.</p>
      <Steps items={[
        { title: "Check your seed and restore height before the date", body: <>Make sure your 25 words and restore height are written down and readable. This is your way back no matter which app you use.</> },
        { title: "Update your wallet from its official source", body: <>Get the update from the wallet&apos;s own website or app store listing, after the official getmonero.org announcement. Do not follow links in DMs, ads or search results.</> },
        { title: "Ignore anyone offering to upgrade your coins", body: <>A big upgrade is an easy story for scammers: fake &quot;migration&quot; sites, &quot;claim your new coins&quot; offers and support impersonators. No real upgrade asks for your seed or for you to send coins. Our guide to <Link href="/monero-phishing-sites">Monero phishing sites</Link> shows the common tricks.</> },
        { title: "Avoid sending during the switch", body: <>The 7 October 2026 meeting notes that some valid transactions might be dropped at a fork and would need to be made again. Unless it is urgent, wait until your wallet shows it is synced on the new rules.</> },
        { title: "If your app is not ready, wait", body: <>Your coins are on the chain, not in the app. They will be there when your app updates, or you can restore your seed in an updated wallet.</> },
      ]} />

      <h2 id="next">Next steps</h2>
      <p>
        Nothing to do today, except keep your backup safe and learn what is changing. Start with{" "}
        <Link href="/monero-ring-signatures">how ring signatures work</Link> to see what FCMP++ replaces, then{" "}
        <Link href="/monero-stealth-address">stealth addresses</Link> and <Link href="/monero-subaddress">subaddresses</Link>, the
        parts Carrot keeps compatible. If you want a private wallet that runs in your browser while we work on FCMP++ support,{" "}
        <Link href={walletUrl}>open MonkStash</Link>, and follow our progress on the <Link href="/donate">roadmap</Link>.
      </p>
    </>
  );
}
