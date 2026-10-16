import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways, Steps, KeyFact } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { VerifyFlowFigure, SourceDecisionFigure } from "@/components/art/MoneroGuiVirusWarningArt";
import { walletUrl } from "@/lib/site";

export const meta: ArticleMeta = {
  slug: "monero-gui-virus-warning",
  section: "guides",
  kicker: "Antivirus alerts",
  title: "Monero GUI Wallet Virus Warning: Is It Safe? How to Check",
  seoTitle: "Monero GUI Virus Warning: Is It Safe?",
  summary: "Monero GUI wallet virus warning? Antivirus tools often flag official Monero software. Here is why, and how to check your download is the real one.",
  keyword: "monero gui wallet virus",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "short", label: "The short answer" },
    { id: "why", label: "Why antivirus flags Monero software" },
    { id: "history", label: "Why checking still matters" },
    { id: "verify", label: "Verify your download step by step" },
    { id: "mismatch", label: "If the check fails" },
    { id: "elsewhere", label: "If the file came from somewhere else" },
    { id: "exception", label: "What about an exception?" },
    { id: "habits", label: "Staying safe from now on" },
  ],
  related: ["monero-gui-vs-cli", "safest-monero-wallet", "mine-monero"],
  faq: [
    { q: "Is the Monero GUI wallet a virus?", a: "No, the official wallet from getmonero.org is not a virus. The Monero website itself warns that some antivirus and firewall programs may flag its executables as malware. But a file from anywhere else may be a fake, so verify yours with the published hashes." },
    { q: "Why does my antivirus flag Monero?", a: "The Monero FAQ says it likely happens because of the integrated miner, which some antivirus tools wrongly treat as dangerous. Monero is also often associated with cryptojacking malware, which makes detection rules cautious." },
    { q: "Is monerod flagged as a trojan safe?", a: "It can be, if it came from getmonero.org and its SHA-256 hash matches the signed list. If you cannot confirm where it came from or the hash does not match, delete it and download again from the official site." },
    { q: "How do I verify the Monero GUI download?", a: "Download hashes.txt from getmonero.org, check its signature against the Monero release key, then compute the SHA-256 hash of your file and compare it with the matching line. On Windows, the command is certUtil -hashfile followed by the file name and SHA256." },
    { q: "Should I turn off my antivirus to install Monero?", a: "No. Leave protection on. If you verify the file and still want to keep it, add an exception for that one file or folder only." },
    { q: "What if the hash does not match?", a: "Delete the file and do not run it. Download it again from getmonero.org, then check again. If it still fails, stop and ask on an official Monero channel." },
    { q: "I ran a Monero wallet from a link or a forum. What now?", a: "Treat it as malware. Disconnect it from the internet, and if you ever entered a seed into it, create a new wallet on a clean device and move your funds right away." },
    { q: "Do Monero miners get flagged too?", a: "Yes. Mining software is flagged by many antivirus tools because malware often installs miners secretly. A miner you chose to install still deserves a verified download." },
  ],
};

export function Body() {
  return (
    <>
      <p>
        If your antivirus flagged the Monero GUI wallet or <code>monerod</code>, take a breath. <mark>A virus warning on
        Monero software is common and does not by itself mean the file is malicious.</mark> The Monero website says antivirus
        programs may flag its programs as malware. What matters is whether your copy is the genuine one, and you can prove that in
        about five minutes.
      </p>
      <p>
        This guide explains why the alerts happen, shows how to verify your download step by step, and says what to do if the
        file turns out not to be the real thing. It does not ask you to switch off your antivirus. Please do not.
      </p>

      <Takeaways items={[
        "Antivirus tools often flag Monero software. The Monero site acknowledges this.",
        "Where the file came from, and whether its hash matches, tells you more than the alert does.",
        "Verify with the signed hashes on getmonero.org. Do not trust the file name or a download page you reached from an ad.",
        "Never turn your antivirus off. If you must allow a file, allow only that one verified file.",
        "A file from anywhere other than the official site should be treated as malware.",
      ]} />

      <h2 id="short">The short answer</h2>
      <p>
        The official Monero downloads page says that some antiviruses and firewalls may flag the Monero executables and archives as
        malware, and it strongly advises you to <mark>verify the hash of the archive you download</mark>. It also notes that a corrupted archive could result in lost funds.
      </p>
      <p>
        So there are two possibilities. Either the file is genuine and the alert is a false positive, or the file is not genuine
        and the alert is right. You cannot tell which from the alert. <mark>You can tell by verifying the download</mark>.
      </p>

      <h2 id="why">Why antivirus flags Monero software</h2>
      <p>
        The Monero FAQ describes antivirus tools that warn about, or even silently remove, the GUI wallet or the daemon. It gives
        the likely cause as the integrated miner: some antivirus programs wrongly judge the miner to be dangerous and act to remove
        it. The FAQ adds that the problem is being discussed.
      </p>
      <p>
        There is a second reason, one we can only describe in general terms. Malware that secretly mines Monero on someone
        else&apos;s computer, called cryptojacking, has been around for years. Security tools learn to distrust anything that
        looks like it. A real wallet shares enough code and behaviour with that malware to trip some detection rules.
      </p>
      <Callout title="A miner you chose is a different thing">
        Mining on purpose is legitimate. Mining tools are flagged for the same reasons, so the same rule holds: download from the
        project, verify it. See <Link href="/mine-monero">how to mine Monero</Link> for the safe route.
      </Callout>

      <h2 id="history">Why checking still matters</h2>
      <p>
        If false alarms are common, it is tempting to wave every alert away. That is exactly what an attacker hopes for. The
        official site has been targeted before.
      </p>
      <p>
        On November 19, 2019, the Monero project warned that the binaries of the command line wallet downloaded from its website had been
        compromised and a malicious version was being served. The affected downloads were made on Monday, November 18, between
        2:30 AM and 4:30 PM UTC. The problem came to light after a GitHub issue reported mismatched hashes. The project told people to
        <mark>compare hashes, delete anything that did not match</mark>, and never run the compromised binaries. Press coverage at the time
        reported the altered files were built to steal seeds.
      </p>
      <KeyFact label="The lesson">
        A user's hash check exposed a real compromise. Hash checks work because <mark>the check does not rely on any one download page</mark>.
      </KeyFact>
      <p>
        Both things are true: antivirus often cries wolf about Monero, and real tampered copies have existed. Verification is how you
        tell them apart.
      </p>

      <h2 id="verify">Verify your download step by step</h2>
      <p>
        You are going to check two things: that the list of hashes is genuinely from the Monero project, and that your file&apos;s
        hash appears on it. Start at <a href="https://www.getmonero.org/downloads/" rel="noopener">getmonero.org/downloads</a>, typed by hand or from a trusted bookmark.
      </p>
      <Figure caption="Check the signed list, hash your file, compare. A match settles it.">
        <VerifyFlowFigure />
      </Figure>
      <Steps items={[
        { title: "Get the files from the official site", body: <p>Download your wallet and the signed hash list, <code>hashes.txt</code>, from getmonero.org. If your antivirus has already removed the wallet, download it again from the same page.</p> },
        { title: "Get the release key and check its fingerprint", body: <p>The official guides use the signing key of binaryFate, published in the Monero repository. The fingerprint shown in the guide is <code>81AC 591F E9C4 B65C 5806 AFC3 F0AF 4D46 2A0B DF92</code>. If the fingerprint on your screen differs, stop.</p> },
        { title: "Check the signature on hashes.txt", body: <p>Beginners on Windows can use Kleopatra from Gpg4win. On the command line, <code>gpg --verify hashes.txt</code> should report a good signature from binaryFate. A bad signature means delete the file and fetch it again.</p> },
        { title: "Hash your downloaded file", body: <p>On Windows, in a command prompt in the folder with the file: <code>certUtil -hashfile FILENAME SHA256</code>. On Linux or macOS the guide uses <code>shasum -a 256 FILENAME</code>.</p> },
        { title: "Compare", body: <p>Find your file&apos;s name in <code>hashes.txt</code>. The long string next to it must equal the one you just generated, ignoring spaces. They match, the file is the real one.</p> },
      ]} />
      <p>
        Follow the official guides rather than only this summary:
        the <a href="https://www.getmonero.org/resources/user-guides/verification-windows-beginner.html" rel="noopener">beginner guide for Windows</a> and the{" "}
        <a href="https://www.getmonero.org/resources/user-guides/verification-allos-advanced.html" rel="noopener">advanced guide for all systems</a>.
      </p>
      <Callout title="What a match means">
        A match proves your copy is identical to what the Monero project signed. It does not prove your computer is clean. Keep
        the system updated and see <Link href="/is-monero-safe">whether Monero is safe</Link> for the wider picture.
      </Callout>

      <h2 id="mismatch">If the check fails</h2>
      <ol>
        <li>Do not open or run the file.</li>
        <li>Delete it, and delete the hash list too.</li>
        <li>Download both again from getmonero.org, typing the address yourself.</li>
        <li>Check again. A single character off means a mismatch, so compare carefully.</li>
        <li>If it still fails, stop and ask in an official Monero community channel, and describe exactly what you did.</li>
      </ol>
      <p>
        A mismatch is more often a cut-off download than an attack, so one clean retry is normal. Still, never use a file that did
        not pass.
      </p>

      <h2 id="elsewhere">If the file came from somewhere else</h2>
      <p>
        If you got the wallet or daemon from an ad, a search result you cannot vouch for, a forum, a chat message, a torrent or a
        mirror, <strong>treat it as malicious</strong>, even if it never produced an alert. The antivirus alert may be the only thing that
        saved you. Fake wallets are the main way Monero users lose money, as covered in{" "}
        <Link href="/monero-phishing-sites">how Monero phishing sites work</Link>.
      </p>
      <Figure caption="The source of the file decides your next step.">
        <SourceDecisionFigure />
      </Figure>
      <h3>If you ran it, act in this order</h3>
      <ol>
        <li>Disconnect the device from the internet and stop the program.</li>
        <li>Ask yourself one question: did I create or restore a wallet in it, or type a seed anywhere? If you did, assume that seed is exposed.</li>
        <li>On a clean device, such as another computer or a freshly reset phone, create a brand new wallet with a new seed from an official source.</li>
        <li><mark>Send everything from the exposed wallet to the new one</mark>. Do this quickly, because anyone holding the seed can do the same.</li>
        <li>Scan the original machine with your security tool, and consider reinstalling the operating system before using it for money.</li>
        <li>Change passwords for any accounts you used on that machine.</li>
      </ol>
      <p>
        If you never entered a seed and never opened a wallet, your funds are most likely unaffected, but clean the machine anyway.
        Our guide to <Link href="/restore-monero-wallet">restoring a wallet</Link> shows how to bring a wallet back on a clean device.
      </p>

      <h2 id="exception">What about an exception?</h2>
      <p>
        <strong>Do not turn off your antivirus.</strong> Switching protection off leaves you open to everything else on the
        internet while you do it, and many people forget to switch it back on.
      </p>
      <p>
        The Monero FAQ suggests that once you have verified the software, you can add an exception so the antivirus stops removing
        it. If you do, keep it narrow: allow one verified file or one folder that holds only verified Monero files, not a whole
        drive and not the Downloads folder. <mark>Do it only after the hash matched</mark>. Every antivirus tool words this differently, so
        check your product&apos;s own help page.
      </p>
      <p>
        If you would rather not deal with this at all, a browser wallet has no installer to be flagged. <Link href={walletUrl}>MonkStash</Link> is a
        free, non-custodial browser wallet for small amounts. It is an early preview and has not been independently audited.
      </p>

      <h2 id="habits">Staying safe from now on</h2>
      <ul>
        <li>Reach the Monero site by bookmark. Never from a promoted result.</li>
        <li>Verify every wallet, daemon and miner download, including updates.</li>
        <li>Keep your seed on paper, and never type it into a website that asks you to prove ownership.</li>
        <li>Use a hardware wallet for savings. See the <Link href="/monero-wallets/safest-monero-wallet">safest Monero wallet</Link> guide.</li>
        <li>Choose between the graphical and command line wallets with our <Link href="/monero-wallets/monero-gui-vs-cli">GUI versus CLI</Link> comparison.</li>
      </ul>
    </>
  );
}
