import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways, KeyFact } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { SecurityLadderFigure, OfflineSigningFigure } from "@/components/art/SafestMoneroWalletArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "safest-monero-wallet",
  section: "wallets",
  kicker: "Security, honestly",
  title: "Safest Monero Wallet: Match Your Setup to Your Amount",
  seoTitle: "Safest Monero Wallet: Match It to Your Amount",
  summary: "The safest Monero wallet depends on how much you hold and who you worry about. A ladder from web wallet to hardware and offline signing, by amount.",
  keyword: "safest monero wallet",
  updated: "2026-10-15",
  readingMinutes: 11,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "safe", label: "What makes a wallet safe" },
    { id: "ladder", label: "The security ladder" },
    { id: "hardware", label: "Rung 1: hardware wallet" },
    { id: "offline", label: "Rung 2: offline signing" },
    { id: "desktop", label: "Rung 3: desktop and your own node" },
    { id: "everyday", label: "Rungs 4 and 5: mobile and web" },
    { id: "match", label: "Match your amount to your setup" },
    { id: "habits", label: "Habits that matter more than the wallet" },
    { id: "monkstash", label: "Where MonkStash fits" },
  ],
  related: ["feather-wallet-review", "monero-gui-vs-cli", "cake-wallet-review"],
  faq: [
    { q: "What is the safest Monero wallet?", a: "There is no single safest wallet. For savings, a hardware wallet paired with the official Monero GUI or Feather, ideally using your own node, is the setup most people trust. For small everyday amounts, a mobile or web wallet is a reasonable trade of safety for convenience." },
    { q: "What is the most secure Monero wallet for large amounts?", a: "A hardware wallet used with a desktop companion wallet keeps your keys on a separate device. Advanced users can also use offline transaction signing, which the Monero documentation describes, though it says a hardware wallet is generally the better choice." },
    { q: "Is a hardware wallet the best Monero cold storage?", a: "For most people, yes. The Monero project lists support for Ledger Nano S, S Plus and X, and Trezor Model T, Safe 3 and Safe 5, through companion wallets. Check the current list and your firmware version before you buy." },
    { q: "Is the official Monero GUI the safest wallet?", a: "It is the project's own wallet and the reference most others are measured against, and it lets you run your own node. That makes it a strong choice, but safety also depends on verifying your download, the health of your computer, and how you store the seed." },
    { q: "Are web wallets safe for Monero?", a: "A non-custodial web wallet can be reasonable for small amounts, because the keys are made and kept on your device. It is only as safe as your browser and computer, so keep savings elsewhere." },
    { q: "Is a mobile Monero wallet safe?", a: "Mobile wallets are good for spending. A phone is easy to lose and large app surfaces can be attacked, so keep the balance modest and back up your seed on paper." },
    { q: "Does running my own node make a wallet safer?", a: "It makes it more private and removes trust in someone else's node. The Monero project warns that some public remote nodes are run by people trying to harm user privacy. It does not protect you from malware on your own device." },
    { q: "How do I keep a Monero wallet safe from phishing?", a: "Download only from the project's own site, verify the download, bookmark the address, and never type your seed into a website or app that asks you to verify or restore. No real support agent will ask for it." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        The <mark>safest Monero wallet is the one that matches how much you hold and who you are protecting it from</mark>.
        For savings that is usually a hardware wallet paired with the official Monero GUI or Feather. For pocket money, a mobile or
        web wallet is a sensible trade of safety for convenience. Anyone who names one wallet as the safest for everyone is
        selling something.
      </p>
      <p>
        This guide lays out the options as a ladder, from the easiest to the strongest, and shows which rung fits which amount.
        MonkStash makes a browser wallet, so we sit on the bottom rung. We say that plainly, and we point you to the better
        choice when your amount calls for it.
      </p>

      <Takeaways items={[
        "Safety depends on your amount and your threat model, not on a brand name.",
        "For savings, keep the keys on a separate hardware device and use your own node if you can.",
        "Offline signing is an advanced option, and the Monero docs themselves say a hardware wallet is generally better.",
        "Mobile and web wallets are fine for spending money, not for a life-changing sum.",
        "Most losses come from phishing and lost seeds, not broken cryptography.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        If you want a rule of thumb: the more you could not bear to lose, <mark>the further the keys should sit from the internet</mark>.
        A browser wallet keeps them in a browser. A phone keeps them on a phone. A hardware wallet keeps them on a device built to
        do nothing else. An offline signing setup keeps them on a computer that never goes online.
      </p>
      <p>
        Each step up costs more time and money. That is the point of the ladder: pick the lowest rung that you are comfortable
        losing everything on, then climb as your balance grows.
      </p>

      <h2 id="safe">What actually makes a wallet safe</h2>
      <p>
        Before ranking wallets, it helps to know what you are looking for. These six things matter more than any logo.
      </p>
      <h3>Open source code you can inspect</h3>
      <p>
        A wallet handles the secret that controls your money. If the code is public, many people can read it and spot problems.
        Closed source does not mean unsafe, but you are taking the maker at their word. The official Monero wallets, Feather and
        Cake Wallet publish their source code.
      </p>
      <h3>Builds you can verify</h3>
      <p>
        The Monero project signs the list of official download hashes, and its repository includes a Guix-based setup for
        reproducible builds, so independent builders can check that a binary matches the source. For you, the practical step is
        simpler: verify the download. Our <Link href="/monero-gui-virus-warning">guide to antivirus warnings on Monero software</Link> walks
        through it.
      </p>
      <h3>Your own node</h3>
      <p>
        A wallet asks a node about the network. If you use someone else&apos;s, they can see your IP address and when you check.
        The Monero project&apos;s own guide warns that some publicly advertised remote nodes are run by malicious actors and
        recommends running your own or using one you trust. See <Link href="/run-a-monero-node">how to run a Monero node</Link>.
      </p>
      <h3>A seed that is backed up and private</h3>
      <p>
        Your <Link href="/monero-seed-phrase">25-word seed</Link> is the wallet. <mark>Lose it and the money is gone</mark>. Show it to
        anyone and the money is theirs. Paper, kept somewhere safe, beats any screenshot or cloud note.
      </p>
      <h3>Phishing defence</h3>
      <p>
        Fake wallet sites and trojan installers <mark>take far more money than any technical flaw</mark>. Start from the official site, never
        from an ad. Read <Link href="/monero-phishing-sites">how Monero phishing sites work</Link> once and you will spot most of them.
      </p>
      <h3>A clean device</h3>
      <p>
        Malware on your computer or phone can read a wallet that is open on it. <mark>A wallet cannot be safer than the device it runs on</mark>,
        which is the whole reason hardware wallets exist.
      </p>

      <h2 id="ladder">The security ladder</h2>
      <p>
        Here are the five common setups, ordered from most protection at the top to most convenience at the bottom.
      </p>
      <Figure caption="Higher rungs keep the keys further from the internet. Lower rungs are quicker to use.">
        <SecurityLadderFigure />
      </Figure>

      <h2 id="hardware">Rung 1: a hardware wallet with the GUI or Feather</h2>
      <p>
        A hardware wallet is a small device that holds your keys and signs transactions on the device itself. Your computer asks
        the device to sign, and the keys never leave it. A hacked laptop cannot simply copy them.
      </p>
      <p>
        Monero support is narrower than for Bitcoin. The Monero project&apos;s downloads page lists Ledger Nano S, Nano S Plus and
        Nano X, and Trezor Model T, Safe 3 and Safe 5, each with companion wallets and a minimum firmware version. You use the device
        together with the official Monero GUI or CLI, or Feather. Our <Link href="/monero-wallets/hardware">hardware wallet page</Link> has the
        full table and the catches, including that Trezor warns its Monero backup may not restore in another brand&apos;s wallet.
      </p>
      <Callout kind="warn" title="Buy it from the maker or a listed reseller">
        A discounted device from a marketplace seller is how tampered hardware reaches buyers. Let the device create the recovery
        words itself, and reject one that arrives opened or with words already filled in.
      </Callout>
      <p>
        Trade-offs: it costs money, setup takes an evening, and you depend on a companion wallet for syncing and the screen.
        For anything you plan to hold for a long time, that is a fair price.
      </p>

      <h2 id="offline">Rung 2: offline signing for advanced users</h2>
      <p>
        Offline signing, sometimes called air-gapped cold storage, goes further. The spend key lives on a computer that never
        connects to the internet. An online computer holds only a view-only wallet, which can see incoming payments but cannot spend.
      </p>
      <p>
        The official Monero documentation describes the flow with the command line wallet. The online view-only wallet creates an
        unsigned transaction file. You carry it on removable media to the offline machine, which signs it with <code>sign_transfer</code>. You
        carry the signed file back and the online wallet broadcasts it with <code>submit_transfer</code>. Feather also lists offline signing with
        animated QR codes in its documentation.
      </p>
      <Figure caption="The spend key never touches an online machine. Only files cross the gap.">
        <OfflineSigningFigure />
      </Figure>
      <Callout title="The docs themselves say hardware is usually better">
        The Monero offline signing page states that this is not necessarily the recommended cold storage setup and that it is
        generally better to use a hardware wallet such as a Trezor or Ledger. The air gap only helps if you keep it: the offline
        machine must not go online while it holds wallets, and updating it means reinstalling. Read the{" "}
        <a href="https://docs.getmonero.org/cold-storage/offline-transaction-signing/" rel="noopener">official offline signing guide</a> before you try it.
      </Callout>
      <p>
        This rung suits people who enjoy the process and understand it. One mistake, such as plugging a used USB drive into the
        wrong machine, can undo the benefit. If you are not sure, rung 1 is the better choice.
      </p>

      <h2 id="desktop">Rung 3: a desktop wallet with your own node</h2>
      <p>
        The official <Link href="/monero-wallets/desktop">desktop wallets</Link> give you the most control. The Monero GUI can run a node on your own computer, so no one else
        learns which payments you look up. The keys live in an encrypted wallet file on your computer, protected by your
        password and by the health of the machine.
      </p>
      <p>
        This is a good home for a medium balance, and the natural companion to a hardware wallet on the rung above. Full syncing takes
        time and disk space; a pruned node shrinks that, covered in <Link href="/monero-pruned-node">what a pruned node is</Link>.
      </p>

      <h2 id="everyday">Rungs 4 and 5: mobile and web wallets</h2>
      <p>
        Phones and browsers are where most people actually spend. They are convenient, always at hand, and good enough for money
        you would shrug off losing.
      </p>
      <h3>Mobile wallets</h3>
      <p>
        Cake Wallet (open source, multi-coin) and Monerujo (open source, Monero only, Android) are widely used. A phone is easy to
        lose and carries many apps, so keep the balance modest. See our <Link href="/monero-wallets/android">Android</Link> and <Link href="/monero-wallets/iphone">iPhone</Link> pages.
      </p>
      <h3>Web wallets</h3>
      <p>
        A non-custodial web wallet makes and encrypts your keys in the browser, so nothing is sent to a server. The
        risks are a fake look-alike site, a compromised browser or extension, and a lost seed. It is the quickest way to start
        <mark>and the weakest place for savings</mark>.
      </p>

      <h2 id="match">Match your amount to your setup</h2>
      <p>
        We are deliberately not giving dollar thresholds, because what hurts to lose differs for everyone. Use this as a guide:
      </p>
      <table>
        <thead><tr><th>What you hold</th><th>A reasonable setup</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td>Money you would shrug off losing</td><td>A web or mobile wallet</td><td>Quick to start, low stakes if something goes wrong</td></tr>
          <tr><td>Regular spending money</td><td>A mobile wallet, or a desktop wallet you keep clean</td><td>Convenient, with the seed backed up on paper</td></tr>
          <tr><td>Savings you check now and then</td><td>Hardware wallet with the GUI or Feather</td><td>Keys stay off your computer</td></tr>
          <tr><td>Savings for years</td><td>Hardware wallet, backup tested, your own node</td><td>Strong protection without a node you do not control</td></tr>
          <tr><td>A very large sum, and you know the tools</td><td>Hardware wallet or offline signing, plus a separate spending wallet</td><td>Smallest exposure, at the cost of effort</td></tr>
        </tbody>
      </table>
      <KeyFact label="A pattern that works">
        Keep two wallets: a small one for spending and <mark>a hardware wallet for savings</mark>. Their seeds are separate, so a problem in one never touches the other.
      </KeyFact>

      <h2 id="habits">Habits that matter more than the wallet</h2>
      <ol>
        <li><strong>Verify what you download.</strong> Compare the SHA-256 hash with the project&apos;s signed list. Do it once, every time.</li>
        <li><strong>Write the seed on paper.</strong> Make two copies and keep them apart. Practise a restore with a small amount.</li>
        <li><strong>Never type the seed into a website that asks you to verify.</strong> It is a theft in progress.</li>
        <li><strong>Bookmark the wallet address.</strong> Do not reach it from ads, search results or messages.</li>
        <li><strong>Keep the device updated and clean.</strong> Install apps and browser extensions sparingly on the machine that holds a wallet.</li>
        <li><strong>Send a test amount first.</strong> Confirm it lands before you move the rest.</li>
        <li><strong>Check the address before you send.</strong> Our <Link href="/tools/monero-address-validator">address validator</Link> catches malformed ones.</li>
      </ol>

      <h2 id="monkstash">Where MonkStash fits</h2>
      <p>
        <Link href={walletUrl}>MonkStash</Link> is a free, non-custodial browser wallet. Keys are created and encrypted on your device
        with your password, and nothing is sent to our servers. It is also an <strong>early preview and has not been independently audited</strong>.
        It does not connect to a hardware wallet today.
      </p>
      <p>
        So it belongs on the bottom rung, for small everyday amounts. If you hold more, use a hardware wallet with the Monero GUI
        or Feather, and keep a small MonkStash wallet beside it for spending. Our <Link href="/monero-wallets">wallet comparison</Link> shows the full field,
        and you can compare the desktop options in our <Link href="/monero-wallets/feather-wallet-review">Feather review</Link> and{" "}
        <Link href="/monero-wallets/monero-gui-vs-cli">GUI versus CLI</Link> guide.
      </p>
    </>
  );
}
