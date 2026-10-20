import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, walletUrl } from "@/lib/site";
import { GateArt, LocalArt } from "./Art";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Monero Tools",
  description: "Free Monero tools that run in your browser: check an address, identify a recovery phrase, find a restore height, see the fee now, make a payment QR code and estimate mining earnings.",
  alternates: { canonical: "/tools" },
  openGraph: ogFor({ title: "Monero Tools", description: "Free Monero tools that run in your browser: check an address, identify a recovery phrase, find a restore height, see the fee now, make a payment QR code and estimate mining earnings.", path: "/tools" }),
};

export default function ToolsPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: "Monero Tools", url: absoluteUrl("/tools"), dateModified: "2026-10-20" },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Tools", item: absoluteUrl("/tools") },
        ] },
      ]} />
      <SiteHeader />
      <main id="main">
        {/* 1. HERO */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Tools</span></nav>
            <div className={`${styles.heroGrid}`} style={{ marginTop: 36 }}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>Free Monero tools</span>{" "}
                  Small tools that save you from <mark>big mistakes</mark>.
                </h1>
                <p className={styles.sub}>Monero payments cannot be undone, so a wrong address is an expensive mistake. These free Monero tools run in your browser and catch the slip before it costs you. The address validator and restore height calculator send nothing anywhere; the fee calculator loads live block data, but what you type stays in the page. There is nothing to sign up for.</p>
                <div className={styles.ctaRow}>
                  <Link className="btn btn-primary btn-lg" href="/tools/monero-address-validator">Check an address</Link>
                  <Link className="btn btn-ghost btn-lg" href="#tools">See all three tools</Link>
                </div>
                <p className={styles.micro}><span>Free.</span><span>Runs in your browser.</span><span>No account.</span></p>
              </div>
              <figure className={styles.fig}>
                <div className={styles.figBox}><GateArt /></div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>A check between the paste and the send stops a typo before it moves money.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. LIVE TOOL */}
        <section className={styles.sec} id="tools">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">Ready now</p>
              <h2>Know an address is right before you hit send.</h2>
            </div>
            <article className={styles.feature}>
              <div className={styles.featureBody}>
                <span className={styles.live}>Live</span>
                <h3>Monero address validator</h3>
                <p>Paste any address and see in a blink whether it <mark>looks like a real Monero address</mark>, which network it is for, and what type it is.</p>
                <ul className={styles.ticks}>
                  <li>Format, length and network in one glance</li>
                  <li>Primary, subaddress or integrated address</li>
                  <li>Plain-words reasons when something is off</li>
                </ul>
                <Link className="btn btn-primary btn-lg" href="/tools/monero-address-validator">Open the validator</Link>
              </div>
              <div className={styles.previewWrap} aria-hidden="true">
                <div className={styles.preview}>
                  <span className={styles.pvLabel}>Paste a Monero address</span>
                  <div className={styles.pvSeg}><span className={styles.on}>Mainnet</span><span>Stagenet</span><span>Testnet</span></div>
                  <div className={styles.pvInput}>4AdU…example…Kc9p</div>
                  <div className={styles.pvResult}>
                    <span className={styles.pvBadge}>Valid format</span>
                    <span className={styles.pvMeta}>Primary address</span>
                    <span className={styles.pvMeta}>Mainnet</span>
                  </div>
                </div>
                <p className={styles.pvCap}>A preview of the result. The real tool is one click away.</p>
              </div>
            </article>

            <article className={styles.feature} style={{ marginTop: 28 }}>
              <div className={styles.featureBody}>
                <span className={styles.live}>Live</span>
                <h3>Monero restore height calculator</h3>
                <p>Pick a date and get the block height to restore from, or turn a height back into a date. It starts <mark>7 days early</mark> so the scan cannot miss a payment.</p>
                <ul className={styles.ticks}>
                  <li>Date to block height, with a copy button</li>
                  <li>Block height back to an approximate date</li>
                  <li>Uses real block timestamps, including the pre-2016 blocks</li>
                </ul>
                <Link className="btn btn-primary btn-lg" href="/tools/monero-restore-height-calculator">Open the calculator</Link>
              </div>
              <div className={styles.previewWrap} aria-hidden="true">
                <div className={styles.preview}>
                  <span className={styles.pvLabel}>Date of your first payment</span>
                  <div className={styles.pvInput}>2019-03-15</div>
                  <div className={styles.pvResult}>
                    <span className={styles.pvBadge}>Restore height</span>
                    <span className={styles.pvMeta}>Block height with a 7 day margin</span>
                  </div>
                </div>
                <p className={styles.pvCap}>A preview of the result. The real tool is one click away.</p>
              </div>
            </article>

            <article className={styles.feature} style={{ marginTop: 28 }}>
              <div className={styles.featureBody}>
                <span className={styles.live}>Live</span>
                <h3>Monero seed doctor</h3>
                <p>25, 16, 13, 12 or 24 words? Find out what your recovery phrase is and where it restores, <mark>without typing a single word of it</mark>.</p>
                <ul className={styles.ticks}>
                  <li>Every Monero phrase format, by word count and app</li>
                  <li>Where it restores, including honestly whether MonkStash can</li>
                  <li>Why a restore can show 0, and a safe restore height</li>
                </ul>
                <Link className="btn btn-primary btn-lg" href="/tools/monero-seed-doctor">Open the seed doctor</Link>
              </div>
              <div className={styles.previewWrap} aria-hidden="true">
                <div className={styles.preview}>
                  <span className={styles.pvLabel}>How many words does your backup have?</span>
                  <div className={styles.pvSeg}><span>25</span><span className={styles.on}>16</span><span>13</span><span>12</span></div>
                  <div className={styles.pvResult}>
                    <span className={styles.pvBadge}>A 16-word Polyseed</span>
                    <span className={styles.pvMeta}>Restores in Feather and Cake Wallet</span>
                  </div>
                </div>
                <p className={styles.pvCap}>A preview of the result. The real tool is one click away.</p>
              </div>
            </article>

            <article className={styles.feature} style={{ marginTop: 28 }}>
              <div className={styles.featureBody}>
                <span className={styles.live}>Live</span>
                <h3>Monero fee calculator</h3>
                <p>See what a payment costs right now, at every priority. The numbers are <mark>measured from real transactions</mark> in the latest blocks, not guessed.</p>
                <ul className={styles.ticks}>
                  <li>Live fee per byte for all four priorities</li>
                  <li>Real transaction sizes, by how many payments you combine</li>
                  <li>Optional: type a price to see it in your currency</li>
                </ul>
                <Link className="btn btn-primary btn-lg" href="/tools/monero-fee-calculator">Open the fee calculator</Link>
              </div>
              <div className={styles.previewWrap} aria-hidden="true">
                <div className={styles.preview}>
                  <span className={styles.pvLabel}>Priority</span>
                  <div className={styles.pvSeg}><span className={styles.on}>Unimportant</span><span>Normal</span><span>Elevated</span></div>
                  <div className={styles.pvResult}>
                    <span className={styles.pvBadge}>Estimated fee</span>
                    <span className={styles.pvMeta}>Measured from the latest blocks</span>
                  </div>
                </div>
                <p className={styles.pvCap}>A preview of the result. The real tool is one click away.</p>
              </div>
            </article>

            <article className={styles.feature} style={{ marginTop: 28 }}>
              <div className={styles.featureBody}>
                <span className={styles.live}>Live</span>
                <h3>Monero QR code generator</h3>
                <p>Turn an address into a payment QR code and a <mark>standard monero: link</mark>, with an amount and a note if you like. Made in your browser, nothing uploaded.</p>
                <ul className={styles.ticks}>
                  <li>Works with any Monero wallet that scans QR codes</li>
                  <li>Download as PNG or SVG for a sign, invoice or donation page</li>
                  <li>Address checked before the code is made</li>
                </ul>
                <Link className="btn btn-primary btn-lg" href="/tools/monero-qr-code-generator">Make a QR code</Link>
              </div>
              <div className={styles.previewWrap} aria-hidden="true">
                <div className={styles.preview}>
                  <span className={styles.pvLabel}>Amount (optional)</span>
                  <div className={styles.pvInput}>0.25 XMR</div>
                  <div className={styles.pvResult}>
                    <span className={styles.pvBadge}>monero:4…?tx_amount=0.25</span>
                    <span className={styles.pvMeta}>Plus a QR code to download</span>
                  </div>
                </div>
                <p className={styles.pvCap}>A preview of the result. The real tool is one click away.</p>
              </div>
            </article>

            <article className={styles.feature} style={{ marginTop: 28 }}>
              <div className={styles.featureBody}>
                <span className={styles.live}>Live</span>
                <h3>Monero mining calculator</h3>
                <p>What would your computer earn mining Monero? Enter your hashrate, power and electricity price. <mark>Network difficulty is live</mark>, the result is an honest estimate.</p>
                <ul className={styles.ticks}>
                  <li>XMR per day and per month, after pool fees</li>
                  <li>Electricity cost, in your own currency</li>
                  <li>Solo: the expected wait to find a block</li>
                </ul>
                <Link className="btn btn-primary btn-lg" href="/tools/monero-mining-calculator">Open the calculator</Link>
              </div>
              <div className={styles.previewWrap} aria-hidden="true">
                <div className={styles.preview}>
                  <span className={styles.pvLabel}>Your hashrate</span>
                  <div className={styles.pvInput}>8,000 H/s</div>
                  <div className={styles.pvResult}>
                    <span className={styles.pvBadge}>XMR per day</span>
                    <span className={styles.pvMeta}>From live network difficulty</span>
                  </div>
                </div>
                <p className={styles.pvCap}>A preview of the result. The real tool is one click away.</p>
              </div>
            </article>
          </div>
        </section>

        {/* 3. WHY (dark) */}
        <section className={`${styles.sec} ${styles.dark}`} id="why">
          <div className={`container-wide ${styles.whyGrid}`}>
            <div>
              <div className={styles.secHead} style={{ marginBottom: 0 }}>
                <p className="eyebrow">Why these tools</p>
                <h2>Monero payments cannot be undone. So check first.</h2>
                <p>There is no bank to call and no chargeback. The only safe moment to catch a mistake is <mark>before the money moves</mark>. Each tool here covers one place people trip.</p>
              </div>
              <ol className={styles.whyList}>
                <li><span className={styles.num}>i</span><div><b>They run on your device</b><p>The address check and the restore height lookup happen in the page, and nothing is sent anywhere. The fee calculator fetches recent block data from our server; what you type is never sent.</p></div></li>
                <li><span className={styles.num}>ii</span><div><b>They explain, not just answer</b><p>You get the reason in plain words, so you learn what to look for next time.</p></div></li>
                <li><span className={styles.num}>iii</span><div><b>They are honest about limits</b><p>The validator checks the checksum, so typos are caught, and says plainly what it cannot know: whether the address belongs to the person you mean to pay.</p></div></li>
              </ol>
            </div>
            <figure className={styles.whyFig}>
              <LocalArt />
              <figcaption><b>Figure 2</b>The address check stays in your browser tab.</figcaption>
            </figure>
          </div>
        </section>

        {/* 4. NEXT */}
        <section className={styles.next}>
          <div className={`container-wide ${styles.nextRow}`}>
            <p>Need a wallet to go with the address? It takes about two minutes.</p>
            <div className={styles.ctaRow} style={{ marginBottom: 0 }}>
              <Link className="btn btn-primary btn-lg" href={walletUrl}>Open wallet</Link>
              <Link className="btn btn-ghost btn-lg" href="/send-monero">How to send Monero</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
