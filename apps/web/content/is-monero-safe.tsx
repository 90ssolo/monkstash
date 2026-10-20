import Link from "next/link";
import type { ArticleMeta } from "@/lib/content";
import { Callout, Takeaways } from "@/components/article/parts";
import { Figure } from "@/components/art/Figure";
import { IlloBrowserKeys } from "@/components/art/Illustrations";

export const meta: ArticleMeta = {
  slug: "is-monero-safe",
  section: "learn",
  kicker: "Safety",
  title: "Is Monero Safe to Use? An Honest Guide",
  summary: "Is Monero safe? The network is mature and well tested, but your safety mostly depends on how you handle your wallet and recovery words. What to watch for.",
  keyword: "is monero safe",
  updated: "2026-10-15",
  readingMinutes: 9,
  toc: [
    { id: "two", label: "Two kinds of safe" },
    { id: "network", label: "Is the network safe?" },
    { id: "privacy", label: "Is your privacy safe?" },
    { id: "you", label: "The risks that are on you" },
    { id: "scams", label: "Common scams to know" },
    { id: "wallet", label: "Choosing a safe wallet" },
    { id: "web", label: "Are web wallets safe?" },
    { id: "habits", label: "Simple habits that protect you" },
    { id: "limits", label: "What no wallet can promise" },
    { id: "next", label: "What to do next" },
  ],
  related: ["is-monero-traceable", "back-up-monero-wallet", "create-monero-wallet", "monero-phishing-sites"],
  faq: [
    { q: "Is Monero safe to buy and hold?", a: "The technology is mature, but the price of any cryptocurrency can rise and fall sharply, so only hold what you can afford to see change in value. Keeping it safe from theft comes down to protecting your recovery words and using a trustworthy wallet." },
    { q: "Is the Monero wallet a virus?", a: "Official Monero software is not a virus. Antivirus tools sometimes flag crypto software by mistake, which is called a false positive. The real danger is downloading a fake wallet from an unofficial source, so always use official sites and check the address bar." },
    { q: "Can Monero be hacked?", a: "The Monero network has a long track record and no known break of its core design. Almost all losses come from people, not the protocol: lost recovery words, fake websites, and harmful software on a device. Protecting those is what keeps you safe." },
    { q: "Is Monero safer than Bitcoin?", a: "They are safe in different ways. Both have strong, long-running networks. Monero adds privacy by default, so your balance and payments are hidden from the public. Bitcoin is more widely supported. Your own habits matter more than the coin." },
    { q: "Is it safe to use a Monero web wallet?", a: "It can be, if the wallet is non-custodial and your keys are created and encrypted in your browser. A web wallet has a different risk profile from a hardware wallet, so use it for everyday amounts and keep large savings in cold storage." },
    { q: "Can someone steal my Monero without my recovery words?", a: "Not from the network itself. Thieves need your recovery words or your wallet files and password. That is why scams focus on tricking you into typing the words or installing harmful software." },
    { q: "Is Monero safe from the government or the police?", a: "Monero is designed so that the public cannot see your balance or payments. It is not a guarantee of anonymity in every situation, since your behavior, exchange records, and device security also matter. See our traceability guide for details." },
  ],
  sources: [
    { label: "Monero source code (GitHub)", href: "https://github.com/monero-project/monero" },
    { label: "The Monero Project: Vulnerability response process (how flaws are reported, fixed and disclosed)", href: "https://github.com/monero-project/meta/blob/master/VULNERABILITY_RESPONSE_PROCESS.md" },
    { label: "Moneropedia: Ring signatures", href: "https://www.getmonero.org/resources/moneropedia/ringsignatures.html" },
    { label: "Moneropedia: Stealth addresses (one-time addresses)", href: "https://www.getmonero.org/resources/moneropedia/stealthaddress.html" },
    { label: "Moneropedia: RingCT (how amounts are hidden)", href: "https://www.getmonero.org/resources/moneropedia/ringCT.html" },
  ],
};

export function Body() {
  return (
    <>
      <p>
        &quot;Is Monero safe?&quot; is really two questions. One is whether the Monero network and its privacy can be trusted. The
        other is whether your own money is safe while you use it. The honest answer is that <mark>the network is solid</mark>, and most of the
        real risk sits in everyday habits that you fully control. This guide separates the two, names the scams that actually
        happen, and gives you a short list of habits that prevents nearly all of them.
      </p>

      <Takeaways items={[
        "The Monero network is mature and well tested, with no known break of its core design.",
        "Most losses come from user mistakes (lost recovery words, fake sites, malware), not the protocol.",
        "Your recovery words are the one thing to protect above all else. Never type them because someone asked.",
        "A non-custodial wallet, official sources, and a small test payment first cover most of the risk.",
      ]} />

      <h2 id="two">Two kinds of safe</h2>
      <p>
        It helps to separate the technology from the usage. A bank vault can be extremely secure, yet you can still lose money by
        handing your card and PIN to a stranger. Monero is similar. The protocol is strong; <mark>the weak point is usually the person</mark>
        using it. The good news is that the person is also the part you can improve.
      </p>
      <p>
        So when you ask whether Monero is safe, ask two things. Is the network sound? And am I using it in a way that keeps my
        money out of reach of thieves? The first is mostly settled by years of public review. The second is up to you.
      </p>

      <h2 id="network">Is the network safe?</h2>
      <p>
        Monero has run since 2014. It is open source, which means anyone can read the code, and it is reviewed by a large
        community and by independent researchers. The network is run by thousands of{" "}
        <Link href="/monero-node">nodes</Link>, computers that each check every block against the rules, so no
        single company can change the rules or freeze your funds.
      </p>
      <p>
        Over the years, researchers have found weaknesses in older versions or in specific pieces of software, and the project has
        responded with upgrades. Reported flaws in the code go through a{" "}
        <a href="https://github.com/monero-project/meta/blob/master/VULNERABILITY_RESPONSE_PROCESS.md" rel="noopener">public vulnerability response process</a>. That is how healthy open source security works: problems get found, discussed in public, and
        fixed. It is a sign of a living project, not a reason to panic. To see how the design works, read{" "}
        <Link href="/how-monero-works">how Monero works</Link>.
      </p>

      <h2 id="privacy">Is your privacy safe?</h2>
      <p>
        Monero <mark>hides the sender, the receiver, and the amount</mark> of each payment by default. It does this with ring signatures
        (which mix your signature with others), one-time stealth addresses, and hidden amounts. That is a very different design
        from Bitcoin, where everything is public.
      </p>
      <p>
        Strong design is not the same as perfect anonymity. Your privacy can still be weakened by things outside the protocol:
        posting your address publicly next to your name, reusing one address for every sender, using a service that records your
        identity, or connecting to a node over your home internet. We cover this honestly in{" "}
        <Link href="/is-monero-traceable">is Monero traceable</Link>. Treat Monero as a strong privacy tool, not a magic
        invisibility cloak.
      </p>

      <h2 id="you">The risks that are actually on you</h2>
      <ul>
        <li><strong>Losing your recovery words.</strong> <mark>They are the only backup</mark>. Lose them and lose the device, and the money is gone. No company can reset this.</li>
        <li><strong>Fake websites.</strong> Scammers <Link href="/monero-phishing-sites">copy real wallet sites</Link> to trick you into typing your recovery words. No real wallet asks you to verify an existing set of words on a web form.</li>
        <li><strong>Harmful software.</strong> Malware on your computer can read what you type or copy. Keep your device updated and avoid pirated software.</li>
        <li><strong>Fake apps and downloads.</strong> Always download from official sources, and be wary of unofficial app listings.</li>
        <li><strong>Sharing your screen or words.</strong> Anyone who sees or hears your <Link href="/monero-seed-phrase">25 recovery words</Link> can take your money.</li>
      </ul>
      <Callout kind="warn" title="The one rule that prevents most losses">
        <mark>Never type your recovery words</mark> into a website, an app, or a message because something asked you to. Enter them only when
        you are deliberately restoring your own wallet, on a site you reached yourself.
      </Callout>

      <h2 id="scams">Common scams to know</h2>
      <p>
        Scammers go where the money is, and wallet users are targeted often. These patterns repeat, so learning them removes most
        of the danger:
      </p>
      <ul>
        <li><strong>Clone sites and ads.</strong> A paid search ad or a lookalike address leads to a copy of a real wallet. The page asks for your words. Bookmark the real site and use the bookmark.</li>
        <li><strong>Fake support.</strong> Someone in a chat or on social media offers to &quot;fix&quot; your wallet and asks for your words or a remote connection to your computer. Real support never needs your words.</li>
        <li><strong>Fake giveaways and doublers.</strong> Any offer to send back more than you send is a scam. Real money does not double.</li>
        <li><strong>Swapped apps.</strong> A fake app with a similar name and logo appears in a store. Check the developer, reviews, and the link from the official project site.</li>
        <li><strong>Address swapping malware.</strong> Some malware replaces a copied address with the attacker&apos;s. Check the first and last characters of any address before you send.</li>
      </ul>

      <h2 id="wallet">Choosing a safe wallet</h2>
      <p>
        The safest wallets are <mark>non-custodial, which means your keys stay with you</mark> and the company cannot touch your funds. If a
        service holds your coins, you are trusting that service, and you have to ask for permission to move your own money.
      </p>
      <p>
        When you compare wallets, look for open source code, a clear explanation of where keys are stored, a long history, and an
        official download link. Be careful with any wallet that asks for an email or ID just to create it. For larger amounts, a
        hardware wallet adds another layer by keeping the spending key on a separate device. Our{" "}
        <Link href="/create-monero-wallet">create a wallet guide</Link> compares the main types.
      </p>

      <h2 id="web">Are web wallets safe?</h2>
      <p>
        A web wallet runs in your browser. MonkStash is non-custodial: your recovery words are created and encrypted in your
        browser and <mark>never reach our servers</mark>. That removes the biggest risk of a custodial service. A web wallet still has trade-offs
        worth knowing:
      </p>
      <Figure caption="In a non-custodial web wallet, your keys are created and kept encrypted on your own device.">
        <IlloBrowserKeys />
      </Figure>
      <ul>
        <li>It is only as safe as the device and browser it runs on. Malware or a harmful browser extension can see more than a hardware wallet would allow.</li>
        <li>You must reach the real site. A fake copy is the main danger, so use a bookmark.</li>
        <li>It connects to a node, which can see your IP address. That is a privacy trade-off, not a risk to your funds.</li>
      </ul>
      <p>
        For everyday amounts, this is a reasonable balance of safety and convenience. For long-term savings, many people keep
        most of their Monero on a hardware wallet and only a spending amount in a web or mobile wallet.
      </p>

      <h2 id="habits">Simple habits that protect you</h2>
      <ol>
        <li>Write your recovery words on paper and store them safely. See <Link href="/back-up-monero-wallet">how to back up a wallet</Link>.</li>
        <li>Bookmark the real wallet site and use the bookmark, so you do not land on a copy.</li>
        <li>Send a small test payment first to get comfortable before moving larger sums.</li>
        <li>Keep your device and browser updated, and remove extensions you do not use.</li>
        <li>Check the first and last characters of every address before you send.</li>
        <li>Keep big savings in cold storage, and use a web or mobile wallet for day-to-day spending.</li>
      </ol>

      <h2 id="limits">What no wallet can promise</h2>
      <p>
        No honest wallet can promise perfect safety, and you should be wary of any that does. Monero transactions cannot be
        reversed, so <mark>a payment sent to the wrong address or a scammer is gone</mark>. The price of Monero can move a lot. Laws and
        exchange rules can change, which affects where you can buy and sell (see{" "}
        <Link href="/is-monero-legal">is Monero legal</Link>). And privacy depends partly on your own behavior.
      </p>
      <Callout title="Honest summary">
        Monero is a serious, well-reviewed system. Your biggest risks are your <mark>recovery words, fake sites, and your own device</mark>.
        Handle those well and the rest is manageable.
      </Callout>

      <h2 id="next">What to do next</h2>
      <p>
        If you are ready to try it, <Link href="/create-monero-wallet">create a wallet</Link> and back it up before you
        add money, then start with a small amount. If you still have questions, our <Link href="/faq">FAQ</Link> and{" "}
        <Link href="/support">support page</Link> cover the most common ones, and{" "}
        <Link href="/monero-vs-bitcoin">Monero vs Bitcoin</Link> explains how the two compare.
      </p>
    </>
  );
}
