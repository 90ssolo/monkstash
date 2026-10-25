import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { CopyButton } from "@/components/wallet/CopyButton";
import { StaticQr } from "@/components/StaticQr";
import { absoluteUrl, organizationLd, repoUrl, walletUrl } from "@/lib/site";
import { donate } from "@/lib/donate";
import { LiveJar, RoadmapLadder } from "./Live";
import { HeroArt, GapArt, LadderArt, JarCompareArt, ProofArt, SealArt } from "./Art";
import styles from "./page.module.css";

const TITLE = "Donate to MonkStash: Fund Private Monero Tools";
const DESCRIPTION =
  "MonkStash is free and checkable. Help fund what comes next: FCMP++ support, an independent security review, and the extension and phone apps.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/donate" },
  openGraph: ogFor({ title: TITLE, description: DESCRIPTION, path: "/donate" }),
};

const faqs = [
  { q: "Why donate if the wallet is free?", a: "Free to use is not free to build. FCMP++ support, an independent security review, store releases of the extension and phone apps all cost real money and time. MonkStash has no ads on wallet pages, no tracking and no account fees, so community funding is how the next pieces get built." },
  { q: "Can I check where the money goes?", a: "You can check every coin that comes in: we publish the donation wallet's view key, so anyone can make a view-only copy of the wallet and see every incoming payment. What the money builds is public too. Every change is in the open-source code on GitHub, and the roadmap on this page moves as each item ships." },
  { q: "Is there a funding target?", a: donate.spendingPolicy },
  { q: "Can I donate anonymously?", a: "Yes. Monero is private by default, so a donation does not reveal who you are. Being listed as a founding supporter is optional, and a pseudonym is fine." },
  { q: "Do I get anything in return?", a: "You can be credited as a founding supporter if you want to be. There are no rewards, tokens, discounts or equity, and nothing financial. A donation is a gift to the project, and it cannot be refunded." },
  { q: "Why not run ads instead?", a: "Wallet pages never carry ads or tracking, and that will not change. Community funding is what lets us keep it that way. Privacy-respecting ads may appear on guide pages later, but never next to your wallet." },
];







export default function DonatePage() {
  const { address, viewKey, contactUrl, supporters, milestones } = donate;

  return (
    <>
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebPage", name: TITLE, description: DESCRIPTION, url: absoluteUrl("/donate"), dateModified: "2026-10-25", publisher: organizationLd },
          { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Support the project", item: absoluteUrl("/donate") },
          ] },
          { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ]}
      />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Support the project</span></nav>
            <div className={styles.heroGrid}>
              <div>
                <p className="eyebrow">Support the project</p>
                <h1 className={styles.h1}>The web wallet is free. <mark>Help us build the rest.</mark></h1>
                <p className={styles.sub}>MonkStash is funded by the people who use it, one feature at a time, and you can check every coin that comes in. No ads on your wallet, no tracking, no account. Just a community that pays for the next step.</p>
                <div className={styles.ctaRow}>
                  <Link className="btn btn-primary btn-lg" href="#roadmap">See the roadmap</Link>
                  <Link className="btn btn-ghost btn-lg" href={walletUrl}>Open the free wallet</Link>
                </div>
                <p className={styles.micro}><span>Paid in XMR.</span><span>Every coin checkable.</span><span>Giving is optional.</span></p>
              </div>
              <figure className={styles.fig}>
                <div className={styles.figBox}><HeroArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>A glass jar: everyone can look in and count.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. THE GAP */}
        <section className={styles.sec} id="gap">
          <div className={`container-wide ${styles.twoCol}`}>
            <div>
              <div className={styles.secHead}>
                <p className="eyebrow">The gap</p>
                <h2>Two things Monero users still do not have.</h2>
              </div>
              <p className={styles.body}>A simple web wallet you can trust, and a good wallet that lives in your browser toolbar. <Link className={styles.inlineLink} href="/mymonero-alternative">MyMonero closed in January 2026</Link>, and look-alike clones took its place in search results. A <Link className={styles.inlineLink} href="/monero-chrome-extension">Monero browser extension</Link> that is actually good has never existed.</p>
              <p className={styles.body}>MonkStash already covers the first. The extension for the second is built and <mark>waiting for store approval</mark>, and the whole thing is something you can verify instead of just believe.</p>
            </div>
            <figure className={styles.fig}>
              <div className={styles.figBox}><GapArt /></div>
              <figcaption className={styles.figCap}><span><b>Figure 2</b></span><span>One door closed, one slot still empty.</span></figcaption>
            </figure>
          </div>
        </section>

        {/* 3. THE GIFT */}
        <section className={`${styles.sec} ${styles.alt}`} id="gift">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">What you already get</p>
              <h2>The gift comes first.</h2>
              <p className="lede">Nobody has to pay to use MonkStash. <mark>Everything below is free today</mark>, and it stays that way.</p>
            </div>
            <div className={styles.giftGrid}>
              <article className={styles.gift}>
                <h3>A free web wallet</h3>
                <p>Create or restore a <Link className={styles.inlineLink} href={walletUrl}>non-custodial Monero wallet</Link> in your browser in about two minutes.</p>
              </article>
              <article className={styles.gift}>
                <h3>Free tools</h3>
                <p>Check an address before you send, with the <Link className={styles.inlineLink} href="/tools/monero-address-validator">address validator</Link> and the rest of the <Link className={styles.inlineLink} href="/tools">tools</Link>.</p>
              </article>
              <article className={styles.gift}>
                <h3>Plain-language guides</h3>
                <p>Clear <Link className={styles.inlineLink} href="/create-monero-wallet">step-by-step guides</Link> and a <Link className={styles.inlineLink} href="/what-is-monero">Monero library</Link> written for real people.</p>
              </article>
              <article className={styles.gift}>
                <h3>Nothing watching</h3>
                <p>No ads on wallet pages, no tracking, and no account. There is no email to hand over and no profile to build.</p>
              </article>
            </div>
          </div>
        </section>

        {/* 4. ROADMAP */}
        <section className={styles.sec} id="roadmap">
          <div className="container-wide">
            <div className={styles.rmHead}>
              <div className={styles.secHead}>
                <p className="eyebrow">The roadmap</p>
                <h2>What we build next, in order.</h2>
                <p className="lede">Each step is a feature you will be able to use. <mark>We build them in order</mark>, and your gift goes to the one at the front of the line. No targets, no countdowns.</p>
                <LiveJar />
              </div>
              <figure className={styles.fig}>
                <div className={styles.figBox}><LadderArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 3</b></span><span>Filled steps are live. The rest are being built or waiting.</span></figcaption>
              </figure>
            </div>
            <RoadmapLadder milestones={milestones} />
          </div>
        </section>

        {/* 5. THE GLASS JAR */}
        <section className={`${styles.sec} ${styles.dark}`} id="glass-jar">
          <div className={`container-wide ${styles.twoCol}`}>
            <div>
              <div className={styles.secHead}>
                <p className="eyebrow">The glass jar</p>
                <h2>Do not trust us. Look inside.</h2>
              </div>
              {viewKey ? (
                <>
                  <p className={styles.body}>This is the <b>view key</b> of the donation wallet. It lets anyone watch the wallet without being able to spend from it. <mark>You can count every donation yourself.</mark></p>
                  <div className={styles.keyBox}>
                    <span className={styles.keyLabel}>Donation wallet view key</span>
                    <code className={styles.mono}>{viewKey}</code>
                    <CopyButton value={viewKey} label="Copy view key" className="btn btn-clay btn-sm" />
                  </div>
                  <ol className={styles.verify}>
                    <li><span>i</span><p>Open any Monero wallet that supports view-only wallets, for example <a href="https://www.getmonero.org/downloads/" rel="noopener">Monero GUI</a> or Feather, or use MonkStash&apos;s watch-only option.</p></li>
                    <li><span>ii</span><p>Create a view-only wallet using the donation address and the view key above.</p></li>
                    <li><span>iii</span><p>Let it sync. Every incoming payment now shows up in your own wallet, checked by you.</p></li>
                  </ol>
                  <p className={styles.caveat}>This shows every donation that comes <b>in</b>. What it pays for shows up in the work itself: every change is public in the <a href={repoUrl} rel="noopener">open-source code</a>, and the roadmap below moves as items ship.</p>
                </>
              ) : (
                <>
                  <p className={styles.body}>Most projects ask you to trust that the money is used well. We would rather give you a way to check. Monero has a tool for it: the <b>view key</b>. <mark>It lets anyone watch a wallet without being able to spend from it.</mark></p>
                  <p className={styles.body}>We will publish the donation wallet&apos;s view key right here when donations open. Then you can create a view-only wallet in any Monero wallet (for example Monero GUI or Feather) or in MonkStash&apos;s watch-only option, and see every incoming payment yourself.</p>
                  <p className={styles.caveat}>A view key shows every donation that comes <b>in</b>. What it pays for shows up in the work itself: the code is public and the roadmap moves as items ship.</p>
                </>
              )}
              <p className={styles.darkLink}>Not sure what a view key is? Read <Link href="/how-monero-works">how Monero works</Link>.</p>
            </div>
            <figure className={styles.fig}>
              <div className={styles.darkBox}><JarCompareArt /></div>
              <figcaption className={`${styles.figCap} ${styles.figCapDark}`}><span><b>Figure 4</b></span><span>Anyone can see the coins. Nobody can take them.</span></figcaption>
            </figure>
          </div>
        </section>

        {/* 6. FOUNDING SUPPORTERS */}
        <section className={styles.sec} id="supporters">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Founding supporters</p>
              <h2>{supporters.length > 0 ? "The people who made this possible." : "Be the first founding supporter."}</h2>
              <p className="lede">Supporters are not customers. They are the people who helped build it before everyone else needed it.</p>
            </div>
            {supporters.length > 0 ? (
              <ul className={styles.wall}>
                {supporters.map((s, i) => (
                  <li key={`${s.name}-${i}`}><b>{s.name}</b>{s.note ? <span>{s.note}</span> : null}</li>
                ))}
              </ul>
            ) : (
              <div className={styles.wallEmpty}>
                <span className={styles.wallEmptyMark} aria-hidden="true">i</span>
                <p>The wall is empty, and the first name is yours to claim. Pseudonyms are welcome, and being listed is entirely optional.</p>
              </div>
            )}
            <div className={styles.proofGrid}>
              <div>
                <h3>How listing works</h3>
                <p>Monero is private, so we cannot see who sent a donation. To be listed, you prove it yourself. After you donate, your wallet can create a <mark>payment proof</mark>. It proves you sent that payment without revealing anything else about your wallet.</p>
                {contactUrl ? (
                  <p>Share the proof and the name you would like shown <a className={styles.inlineLink} href={contactUrl} rel="noopener">here</a>, and we will add you.</p>
                ) : (
                  <p>Email the proof and the name you would like shown to <a className={styles.inlineLink} href="mailto:hello@monkstash.com">hello@monkstash.com</a>, and we will add you.</p>
                )}
              </div>
              <figure className={styles.fig}>
                <div className={styles.figBox}><ProofArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 5</b></span><span>You prove the payment. You reveal nothing else.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 7. HOW TO GIVE */}
        <section className={`${styles.sec} ${styles.alt}`} id="give">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">How to give</p>
              <h2>Send XMR, and the roadmap moves.</h2>
              <p className="lede">Any amount helps. <mark>Give only if you want to</mark>, and only what you will not miss.</p>
            </div>
            {address ? (
              <div className={styles.giveCard}>
                <div className={styles.qrWrap}>
                  <StaticQr value={`monero:${address}`} label="QR code for the MonkStash donation address" size={216} />
                  <span className={styles.qrCap}>Scan with your wallet</span>
                </div>
                <div className={styles.addrCol}>
                  <span className={styles.keyLabelLight}>Donation address (XMR)</span>
                  <code className={styles.monoLight}>{address}</code>
                  <CopyButton value={address} label="Copy address" className="btn btn-primary btn-sm" />
                </div>
              </div>
            ) : (
              <div className={styles.soon}>
                <span className={styles.soonTag}>Donations open soon</span>
                <p>We are setting up the donation wallet and publishing its view key first, so every coin can be checked from day one.</p>
                <p className={styles.soonSub}>Nothing to send yet. Please ignore any address that claims to be ours until it appears on this page.</p>
              </div>
            )}
            <div className={`notice notice-warn ${styles.note}`}>
              <p>{donate.address ? <>Send <b>only XMR</b> to this address. </> : <>When donations open, send <b>only XMR</b>. </>}Crypto donations cannot be refunded. This is a donation: there are no rewards, tokens or equity.</p>
            </div>
          </div>
        </section>

        {/* 8. WHERE THE MONEY GOES */}
        <section className={styles.sec} id="policy">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Where the money goes</p>
              <h2>The rules we hold ourselves to.</h2>
            </div>
            <div className={styles.policyGrid}>
              <article className={styles.policy}>
                <h3>Only this roadmap</h3>
                <p>{donate.spendingPolicy}</p>
              </article>
              <article className={styles.policy}>
                <h3>The work is public</h3>
                <p>Every change to MonkStash is in the <a href={repoUrl} rel="noopener">open-source code</a>. <mark>You can see what your donation built</mark>, line by line.</p>
              </article>
              <article className={styles.policy}>
                <h3>Progress you can watch</h3>
                <p>The roadmap on this page shows what is live, what is being built and what comes next. It changes when the work does.</p>
              </article>
              <article className={styles.policy}>
                <h3>No refunds</h3>
                <p>Monero payments cannot be reversed, so donations cannot be refunded. Please give only what you are happy to give away.</p>
              </article>
            </div>
          </div>
        </section>

        {/* 9. FAQ */}
        <section className={`${styles.sec} ${styles.alt}`} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>About supporting MonkStash</h2>
              <p className={styles.small}>More general questions are on the <Link className={styles.inlineLink} href="/faq">main FAQ</Link>, or ask on the <Link className={styles.inlineLink} href="/support">support page</Link>.</p>
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

        {/* 10. FINAL CTA */}
        <section className={styles.final} aria-labelledby="finalH">
          <div className={`container-wide ${styles.finalGrid}`}>
            <div>
              <h2 id="finalH">Use it for free. Help it grow if you can.</h2>
              <p>The wallet is yours either way. If it earns a place in your life, you can help fund FCMP++ support, the independent security review and the apps that make it better for everyone.</p>
              <div className={styles.ctaRow}>
                <Link className="btn btn-primary btn-lg" href={walletUrl}>Open the free wallet</Link>
                <Link className="btn btn-ghost btn-lg" href="#give">How to give</Link>
              </div>
            </div>
            <SealArt className={styles.finalArt} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
