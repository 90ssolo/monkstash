import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, repoUrl, walletUrl } from "@/lib/site";
import {
  HeroArt, SpectrumArt, CheckArt, ArrowIcon,
  TypeWeb, TypePhone, TypeDesktop, TypeHardware,
  ChTry, ChPay, ChSave, ChControl, ChMove,
  PfKey, PfCode, PfNoAccount,
} from "./Art";
import { ClusterLibrary } from "@/components/pillar/ClusterLibrary";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Best Monero Wallets (Honest 2026 Comparison)",
  description: "Compare the best Monero wallets: web, mobile, desktop, and hardware. See who each one fits, who holds your keys, and how to choose without getting scammed.",
  alternates: { canonical: "/monero-wallets" },
  openGraph: ogFor({ title: "Best Monero Wallets (Honest 2026 Comparison)", description: "Compare the best Monero wallets: web, mobile, desktop, and hardware. See who each one fits, who holds your keys, and how to choose without getting scammed.", path: "/monero-wallets" }),
};

const faqs = [
  { q: "What is the best Monero wallet for beginners?", a: "For a first wallet, pick one that is non-custodial and simple to set up. A browser wallet like MonkStash is the fastest way to start, and Cake Wallet is a popular mobile option. Whichever you choose, write down your recovery words on paper and start with a small amount." },
  { q: "What is the best Monero wallet for Android?", a: "Monerujo is an open source, Monero-only Android wallet, and Cake Wallet is a widely used mobile wallet that also supports other coins. Download only from the official website or a store listing you have verified." },
  { q: "What is the best Monero wallet for iPhone?", a: "Cake Wallet is the best-known Monero option on iOS. You can also use a browser wallet like MonkStash in Safari without installing anything. Check that you are on the official site or the official app listing before you create a wallet." },
  { q: "Is a web Monero wallet safe?", a: "It can be, if it is non-custodial: your keys are created and encrypted in your browser and never sent to a server. The main risks are fake look-alike sites and losing your recovery words. Use a bookmark you trust, and keep large amounts in a hardware wallet." },
  { q: "Which Monero wallet is non-custodial?", a: "MonkStash, Cake Wallet, Monerujo, Feather, the official Monero GUI and CLI, and hardware wallets used with a companion app are all non-custodial, meaning you hold the keys. An account on an exchange is custodial: the exchange holds the keys, not you." },
  { q: "What is the safest way to store Monero long term?", a: "A hardware wallet such as a Ledger or Trezor, used with a companion wallet, is widely recommended for larger or long-term amounts because the keys stay on a separate device. Keep your recovery words offline and backed up in more than one safe place." },
  { q: "Can I use more than one Monero wallet?", a: "Yes. Many people keep a small spending wallet on their phone or in the browser and savings in a hardware wallet. You can restore the same recovery words in a different compatible wallet if you ever need to switch." },
];

const chooser = [
  { href: "#type-web", Icon: ChTry, need: "I want to try Monero today", fit: "A browser wallet", body: "No install and no sign-up. Keep the amount small and see how it feels." },
  { href: "#type-phone", Icon: ChPay, need: "I pay and get paid on my phone", fit: "A mobile wallet", body: "Monerujo on Android if you want Monero only, or Cake Wallet if you want other coins too." },
  { href: "#type-hardware", Icon: ChSave, need: "I am saving a lot, or for years", fit: "A hardware wallet", body: "Keep the big balance on a separate device, and a small spending wallet on the side." },
  { href: "#type-desktop", Icon: ChControl, need: "I want control, or my own node", fit: "A desktop wallet", body: "Feather or the official GUI, with the option to connect to your own node." },
  { href: "/mymonero-alternative", Icon: ChMove, need: "I left MyMonero", fit: "Any wallet that can restore", body: "Your recovery words work elsewhere. Here is how to move without landing on a clone." },
];

const walletCards = [
  {
    name: "MonkStash", kind: "Web", platforms: "Any modern browser", best: "Getting started fast, everyday use",
    trade: "Not the place for a life-changing sum. Pair it with a hardware wallet for that.",
    body: "A free Monero wallet that runs in your browser. Your keys are created and encrypted on your device and never sent to our servers, and there is no account or email to sign up for. It is built for people who want to get started in a couple of minutes and use Monero day to day without installing anything.",
    us: true,
  },
  {
    name: "Cake Wallet", kind: "Mobile", platforms: "Android and iOS", best: "Phone users and multi-coin holders",
    trade: "It supports other coins too. If you want Monero and nothing else, a Monero-only app keeps things simpler.",
    body: "A popular, open source mobile wallet with a polished interface. It supports several coins besides Monero, which is handy if you hold more than one.",
  },
  {
    name: "Monerujo", kind: "Mobile", platforms: "Android only", best: "Monero-only on Android",
    trade: "Android only, so iPhone users should look elsewhere.",
    body: "An open source wallet made only for Monero on Android. It is a good fit if you want a focused app on your phone and no extra coins to think about.",
  },
  {
    name: "Feather", kind: "Desktop", platforms: "Computer", best: "A light, fast computer wallet",
    trade: "Desktop only, and not the Monero project&apos;s official wallet.",
    body: "A lightweight, open source desktop wallet known for starting quickly and being friendly to privacy-minded users. It is a solid choice for a computer if you find the official wallet heavy, and it works with hardware wallets.",
  },
  {
    name: "Monero GUI and CLI", kind: "Desktop", platforms: "Windows, macOS, Linux", best: "Maximum control, own node",
    trade: "Bigger, slower to sync, and less beginner-friendly.",
    body: "The official wallet from the Monero project, downloaded from getmonero.org, in a graphical version (GUI) and a command line version (CLI). It gives you the most control, including running your own full node, and is the reference most other wallets are measured against. Always verify the download as the site explains.",
  },
  {
    name: "Ledger and Trezor", kind: "Hardware", platforms: "Used with a companion wallet", best: "Large or long-term savings",
    trade: "Costs money and takes more effort to set up. Check each maker's current Monero support before you buy, since it can change.",
    body: "These devices can hold Monero keys, and you use them together with a companion wallet such as the official GUI or Feather. Because the keys stay on the device, a hacked computer cannot simply copy them. This is the setup we suggest for savings you do not plan to touch often.",
  },
];

const tableRows = [
  { wallet: "MonkStash", type: "Web", best: "Getting started fast, everyday use", keys: "Yes", us: true },
  { wallet: "Cake Wallet", type: "Mobile (Android, iOS)", best: "Phone users, multi-coin holders", keys: "Yes" },
  { wallet: "Monerujo", type: "Mobile (Android)", best: "Monero-only on Android", keys: "Yes" },
  { wallet: "Feather", type: "Desktop", best: "A light, fast computer wallet", keys: "Yes" },
  { wallet: "Monero GUI and CLI", type: "Desktop", best: "Maximum control, own node", keys: "Yes" },
  { wallet: "Ledger or Trezor", type: "Hardware, with a companion wallet", best: "Large or long-term savings", keys: "Yes, on the device" },
  { wallet: "Exchange account", type: "Custodial", best: "Trading, not storage", keys: "No", warn: true },
];

const itemList = walletCards.map((w, i) => ({
  "@type": "ListItem",
  position: i + 1,
  name: `${w.name} (${w.kind.toLowerCase()})`,
}));

export default function WalletsPage() {
  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Best Monero Wallets",
          url: absoluteUrl("/monero-wallets"),
          description: "A plain-language comparison of Monero wallet types and popular options.",
          dateModified: "2026-10-17",
          mainEntity: { "@type": "ItemList", itemListElement: itemList },
        },
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Best Monero wallets, compared honestly",
          description: "Compare Monero wallets by type, who holds your keys, and who each one fits.",
          mainEntityOfPage: absoluteUrl("/monero-wallets"),
          author: { "@type": "Organization", name: "MonkStash" }, publisher: { "@type": "Organization", name: "MonkStash" }, image: absoluteUrl("/opengraph-image"),
          dateModified: "2026-10-17",
        },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Wallets", item: absoluteUrl("/monero-wallets") },
        ] },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ]} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Wallets</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}><span className={`eyebrow ${styles.h1Kicker}`}>The best Monero wallets, compared</span>{" "}Pick the right Monero wallet in <mark>two minutes</mark>.</h1>
                <p className={styles.sub}>There is no single best Monero wallet, only the best one for what you want to do. Search for one and you will find real wallets, exchange accounts, and look-alike sites built to steal recovery words. Here is the honest version, with the trade-offs said out loud.</p>
                <div className={styles.ctaRow}>
                  <Link className="btn btn-primary btn-lg" href="#chooser">Find my wallet <ArrowIcon /></Link>
                  <Link className="btn btn-ghost btn-lg" href={walletUrl}>Open MonkStash</Link>
                </div>
                <p className={styles.micro}>New to the coin itself? Start with <Link className={styles.inlineLink} href="/what-is-monero">what Monero is</Link> and <Link className={styles.inlineLink} href="/monero-vs-bitcoin">how it differs from Bitcoin</Link>, then come back.</p>
              </div>
              <figure className={styles.fig}>
                <div className={styles.heroArt}><HeroArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>The four kinds of Monero wallet. MonkStash is the browser one.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. CHOOSER */}
        <section className={`${styles.sec} ${styles.alt}`} id="chooser">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Start with what you need</p>
              <h2>Which of these sounds like you?</h2>
              <p className="lede">Skip the feature lists. Pick the sentence that fits your life and we will point you to the kind of wallet that suits it.</p>
            </div>
            <div className={styles.chooseGrid}>
              {chooser.map(({ href, Icon, need, fit, body }) => (
                <Link key={need} href={href} className={styles.choose}>
                  <Icon className={styles.chooseIc} />
                  <h3>{need}</h3>
                  <span className={styles.fit}>{fit}</span>
                  <p>{body}</p>
                  <span className={styles.go}>See why</span>
                </Link>
              ))}
            </div>
            <nav className={styles.byPlatform} aria-label="Monero wallets by platform">
              <span className={styles.byLabel}>By platform</span>
              <Link href="/monero-wallets/android">Android</Link>
              <Link href="/monero-wallets/iphone">iPhone</Link>
              <Link href="/monero-wallets/desktop">Desktop</Link>
              <Link href="/monero-wallets/hardware">Hardware</Link>
            </nav>
            <nav className={styles.byPlatform} aria-label="In-depth wallet guides">
              <span className={styles.byLabel}>In depth</span>
              <Link href="/monero-wallets/safest-monero-wallet">Safest wallet</Link>
              <Link href="/monero-wallets/feather-wallet-review">Feather review</Link>
              <Link href="/monero-wallets/cake-wallet-review">Cake Wallet review</Link>
              <Link href="/monero-wallets/monero-gui-vs-cli">GUI vs CLI</Link>
            </nav>
            <p className={styles.twoNote}>Not sure? Many people use two: a small everyday wallet and a hardware wallet for savings. Because every wallet can restore from your recovery words, switching later is not a trap, as long as the words are safely backed up. <Link className={styles.inlineLink} href="/back-up-monero-wallet">Here is how to back up your wallet</Link>.</p>
          </div>
        </section>

        {/* 3. FOUR TYPES */}
        <section className={styles.sec} id="types">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">The four types</p>
              <h2>The type matters more than the brand.</h2>
              <p className="lede">Almost every wallet falls into one of four types. The type decides <mark>where your keys live</mark> and how convenient the wallet is. Your keys are the secret that lets you spend your money, so where they live is the whole game.</p>
            </div>

            <figure className={styles.specFig}>
              <div className={styles.specArt}><SpectrumArt /></div>
              <figcaption className={styles.figCap}><span><b>Figure 2</b></span><span>Easier to start on the left, stronger protection toward the top. A general guide, not a lab result.</span></figcaption>
            </figure>

            <div className={styles.typeGrid}>
              <article className={styles.type} id="type-web">
                <div className={styles.typeIll}><TypeWeb /></div>
                <span className={styles.num}>i</span>
                <h3>Web wallets</h3>
                <p>They run in your browser, so there is nothing to install. That makes them the quickest way to start. A good one is non-custodial, which means your keys are created and encrypted on your device.</p>
                <p className={styles.who}><b>Who it is for</b>People trying Monero, and everyday amounts.</p>
                <p className={styles.trade}><b>The trade-off</b>Only as safe as the device and browser you use.</p>
              </article>
              <article className={styles.type} id="type-phone">
                <div className={styles.typeIll}><TypePhone /></div>
                <span className={styles.num}>ii</span>
                <h3>Mobile wallets</h3>
                <p>Apps for Android or iPhone. They suit paying and receiving on the go, and your phone is always with you, which is handy.</p>
                <p className={styles.who}><b>Who it is for</b>People who pay and get paid from their phone.</p>
                <p className={styles.trade}><b>The trade-off</b>A phone can be lost or infected, so keep the balance modest.</p>
              </article>
              <article className={styles.type} id="type-desktop">
                <div className={styles.typeIll}><TypeDesktop /></div>
                <span className={styles.num}>iii</span>
                <h3>Desktop wallets</h3>
                <p>They run on Windows, macOS, or Linux. They give you more control, including choosing your own node (the server your wallet asks about the network), and suit people who want to learn how Monero works in more depth. <Link className={styles.inlineLink} href="/monero-node">What is a node?</Link></p>
                <p className={styles.who}><b>Who it is for</b>People who want control and privacy on a computer.</p>
                <p className={styles.trade}><b>The trade-off</b>More to learn than a browser wallet.</p>
              </article>
              <article className={styles.type} id="type-hardware">
                <div className={styles.typeIll}><TypeHardware /></div>
                <span className={styles.num}>iv</span>
                <h3>Hardware wallets</h3>
                <p>They keep your keys on a dedicated device that signs transactions without exposing the keys to your computer. They are the strongest option for large or long-term amounts.</p>
                <p className={styles.who}><b>Who it is for</b>Anyone holding a lot, or holding for years.</p>
                <p className={styles.trade}><b>The trade-off</b>They cost money and take more effort to set up.</p>
              </article>
            </div>
          </div>
        </section>

        {/* 4. NAMED WALLETS */}
        <section className={`${styles.sec} ${styles.alt}`} id="wallets">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Wallets worth knowing</p>
              <h2>Six honest options, none ranked.</h2>
              <p className="lede">These are widely used, non-custodial options. We have not ranked them from best to worst, because the right pick depends on your device and goal. MonkStash is one of them, and we say plainly where it does not fit.</p>
            </div>
            <div className={styles.walletGrid}>
              {walletCards.map((w) => (
                <article key={w.name} className={`${styles.wcard} ${w.us ? styles.wcardUs : ""}`}>
                  <div className={styles.wtop}>
                    <span className={styles.tag}>{w.kind}</span>
                    {w.us && <span className={styles.ours}>That is us</span>}
                  </div>
                  <h3>{w.name}</h3>
                  <dl className={styles.facts}>
                    <div><dt>Platforms</dt><dd>{w.platforms}</dd></div>
                    <div><dt>Best for</dt><dd>{w.best}</dd></div>
                  </dl>
                  <p>{w.body}</p>
                  <p className={styles.trade}><b>The honest trade-off</b>{w.trade}</p>
                  {w.us && (
                    <p className={styles.wlinks}>
                      <Link className="btn btn-primary" href={walletUrl}>Open the wallet</Link>
                      <Link className={styles.inlineLink} href="/create-monero-wallet">How to create a Monero wallet</Link>
                    </p>
                  )}
                </article>
              ))}
            </div>
            <p className={styles.twoNote}>Looking for a replacement for the retired MyMonero? See our <Link className={styles.inlineLink} href="/mymonero-alternative">MyMonero alternative</Link> page.</p>
          </div>
        </section>

        {/* 5. COMPARISON TABLE */}
        <section className={styles.sec} id="compare">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Monero wallet comparison</p>
              <h2>All of them, side by side.</h2>
              <p className="lede">One glance, seven rows. The last row is the one to be careful with: an exchange account is not a wallet you control.</p>
            </div>
            <div className={styles.tablewrap}>
              <table className={styles.mag}>
                <caption>Table 1. Monero wallets at a glance</caption>
                <thead>
                  <tr>
                    <th scope="col">Wallet</th>
                    <th scope="col">Type</th>
                    <th scope="col">Best for</th>
                    <th scope="col">Keys held by you</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={r.wallet} className={`${r.us ? styles.usRow : ""} ${r.warn ? styles.warnRow : ""}`}>
                      <th scope="row">{r.wallet}</th>
                      <td data-label="Type">{r.type}</td>
                      <td data-label="Best for">{r.best}</td>
                      <td data-label="Keys held by you">{r.keys}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tnote}>An exchange account is custodial: the company holds the keys, so you are trusting it to stay solvent and online. <mark>Fine for trading, a poor place for long-term holdings.</mark></p>
          </div>
        </section>

        {/* 6. DARK BAND: FAKE WALLETS */}
        <section className={`${styles.sec} ${styles.dark}`} id="avoid-fakes">
          <div className={`container-wide ${styles.darkGrid}`}>
            <div>
              <div className={styles.secHead}>
                <p className="eyebrow">Before you click anything</p>
                <h2>How to avoid fake wallets</h2>
                <p className="lede">Since MyMonero shut down, look-alike sites have copied real wallets to collect recovery words. A few habits keep you out of that trap. <mark>Reach wallets through official links and bookmarks, not ads or messages.</mark></p>
              </div>
              <ol className={styles.checks}>
                <li><span className={styles.cn}>i</span><div><b>Go to official sources only.</b> Download wallets from the project&apos;s own website or a store listing you have verified. The official Monero wallet lives at <a href="https://www.getmonero.org/downloads/" rel="noopener">getmonero.org</a>, and the site explains how to verify the download.</div></li>
                <li><span className={styles.cn}>ii</span><div><b>Never share your recovery words.</b> No real wallet, support agent, or exchange will ever ask for them. Anyone who has them can take your funds, and Monero transactions cannot be reversed.</div></li>
                <li><span className={styles.cn}>iii</span><div><b>Read the address bar.</b> If you reached a wallet from an ad or a message, close it and use your bookmark instead.</div></li>
                <li><span className={styles.cn}>iv</span><div><b>Check the address before you send.</b> Paste it, then verify it. You can check its format with the free <Link href="/tools/monero-address-validator">Monero address validator</Link>.</div></li>
                <li><span className={styles.cn}>v</span><div><b>Do not leave savings on an exchange.</b> It holds the keys, not you. Fine for trading, a poor place for long-term holdings.</div></li>
              </ol>
              <p className={styles.darkLinks}>
                <Link className="btn btn-clay" href="/mymonero-alternative">The MyMonero clone problem</Link>
                <Link href="/is-monero-safe">Is Monero safe?</Link>
              </p>
            </div>
            <figure className={styles.checkFig}>
              <CheckArt />
              <figcaption className={styles.figCapDark}><span><b>Figure 3</b></span><span>The same wallet name can sit behind two very different addresses.</span></figcaption>
            </figure>
          </div>
        </section>

        {/* 7. WHY WE BUILT IT */}
        <section className={styles.sec} id="why">
          <div className="container-wide">
            <div className={styles.whyGrid}>
              <div className={styles.secHead}>
                <p className="eyebrow">Why we built MonkStash</p>
                <h2>A wallet you can start in two minutes and still trust.</h2>
                <p className="lede">We wanted the quick start of a web app without handing anyone your keys. So MonkStash runs in your browser, costs nothing, and asks for no email. <mark>It is one honest option among several</mark>, and for big savings we point you to a hardware wallet.</p>
                <div className="notice notice-warn" style={{ marginTop: "var(--s-5)" }}>
                  <span><strong>Early preview.</strong> MonkStash works with real Monero, but we recommend small amounts until our public security review is complete.</span>
                </div>
              </div>
              <div className={styles.proofCol}>
                <div className={styles.proofItem}><PfKey /><div><b>Non-custodial</b><p>Your keys are created and encrypted on your device and never sent to our servers.</p></div></div>
                <div className={styles.proofItem}><PfCode /><div><b>Open source</b><p>Built on monero-ts, and our own code is open source too (BSD-3-Clause). <a href={repoUrl} rel="noopener">Read the code</a> instead of taking our word.</p></div></div>
                <div className={styles.proofItem}><PfNoAccount /><div><b>No account</b><p>No email and no sign-up. A browser wallet means no install either.</p></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* 7b. THE LIBRARY: every guide in this hub */}
        <section className={styles.sec} id="library">
          <div className="container-wide">
            <ClusterLibrary pillar="wallets" eyebrow="The wallet library" title="Every wallet guide we have written" intro="Platform picks, in-depth reviews and safety checks. Each one answers a single question in depth." />
          </div>
        </section>

        {/* 8. FAQ */}
        <section className={`${styles.sec} ${styles.alt}`} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>Best Monero wallet questions, answered</h2>
              <p className={styles.faqMore}>More answers live in the <Link className={styles.inlineLink} href="/faq">full FAQ</Link>, or <Link className={styles.inlineLink} href="/support">ask us</Link>.</p>
            </div>
            <div className={styles.faq}>
              {faqs.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary><span className={styles.fn}>{i + 1}</span>{f.q}<span className={styles.pm} aria-hidden="true" /></summary>
                  <div className={styles.ans}><p>{f.a}</p></div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FINAL CTA */}
        <section className={styles.final} aria-labelledby="wFinalH">
          <div className={`container-wide ${styles.finalInner}`}>
            <h2 id="wFinalH">A sensible next step</h2>
            <p>If you want to try Monero today, the simplest route is a small browser wallet. It takes about two minutes, costs nothing, and your keys stay on your device. Write the recovery words on paper, send a small test amount, and build from there.</p>
            <div className={styles.ctaRow}>
              <Link className="btn btn-primary btn-lg" href={walletUrl}>Create a Monero wallet</Link>
              <Link className="btn btn-ghost btn-lg" href="/create-monero-wallet">Read the step-by-step guide</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
