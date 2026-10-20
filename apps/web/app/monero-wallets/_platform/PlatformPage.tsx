import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroArt, FitArt, StoreArt, ArrowIcon } from "./PlatformArt";
import { PLATFORMS, type PlatformData } from "./types";
import styles from "./platform.module.css";
import { walletUrl } from "@/lib/site";

const NUMERALS = ["i", "ii", "iii", "iv", "v", "vi"];

export function PlatformPage({ data: d }: { data: PlatformData }) {
  const siblings = PLATFORMS.filter((p) => p.key !== d.key);
  const isHardware = d.key === "hardware";

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* 1. HERO */}
        <section className={styles.hero}>
          <div className="container-wide">
            <nav className={styles.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/monero-wallets">Monero wallets</Link><span aria-hidden="true">/</span>
              <span aria-current="page">{d.label}</span>
            </nav>
            <div className={styles.heroGrid}>
              <div>
                <h1 className={styles.h1}>
                  <span className={`eyebrow ${styles.h1Kicker}`}>{d.h1Kicker}</span>{" "}
                  {d.h1Before}<mark>{d.h1Mark}</mark>{d.h1After}
                </h1>
                <p className={styles.sub}>{d.sub}</p>
                <div className={styles.ctaRow}>
                  <Link className="btn btn-primary btn-lg" href="#picks">See the quick picks <ArrowIcon /></Link>
                  <Link className="btn btn-ghost btn-lg" href={walletUrl}>Open MonkStash</Link>
                </div>
                <p className={styles.micro}>
                  Comparing every kind of wallet? See all <Link className={styles.inlineLink} href="/monero-wallets">Monero wallets</Link>. New to the coin? Start with <Link className={styles.inlineLink} href="/what-is-monero">what Monero is</Link>.
                </p>
              </div>
              <figure className={styles.fig}>
                <div className={styles.heroArt}>
                  <HeroArt kind={d.key} {...d.heroFig} />
                </div>
                <figcaption className={styles.figCap}><span><b>Figure 1</b></span><span>{d.heroFigCaption}</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 2. QUICK PICK */}
        <section className={`${styles.sec} ${styles.alt}`} id="picks">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">{d.picks.eyebrow}</p>
              <h2>{d.picks.title}</h2>
              <p className="lede">{d.picks.lede}</p>
            </div>
            <div className={`${styles.pickGrid} ${d.picks.items.length === 2 ? styles.two : ""}`}>
              {d.picks.items.map((p, i) => (
                <article key={p.pick} className={styles.pick}>
                  <span className={styles.pickNum} aria-hidden="true">{NUMERALS[i]}</span>
                  <p className={styles.need}>{p.need}</p>
                  <h3>{p.pick}</h3>
                  <p className={styles.trade}><b>The honest trade-off</b>{p.trade}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. WALLET CARDS */}
        <section className={styles.sec} id="wallets">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">{d.wallets.eyebrow}</p>
              <h2>{d.wallets.title}</h2>
              <p className="lede">{d.wallets.lede}</p>
            </div>
            <div className={`${styles.walletGrid} ${d.wallets.items.length === 3 ? styles.three : ""}`}>
              {d.wallets.items.map((w) => (
                <article key={w.name} className={styles.wcard}>
                  <span className={styles.tag}>{w.kind}</span>
                  <h3>{w.name}</h3>
                  <dl className={styles.facts}>
                    {w.facts.map((f) => (
                      <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>
                    ))}
                  </dl>
                  <p>{w.body}</p>
                  <ul className={styles.points}>
                    {w.points.map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
                  <p className={styles.trade}><b>The honest trade-off</b>{w.trade}</p>
                </article>
              ))}
            </div>
            <p style={{ margin: "34px 0 0", maxWidth: 760, color: "var(--ink-2)" }}>
              We checked these against each project&apos;s own pages and the wallet list at <a className={styles.inlineLink} href="https://www.getmonero.org/downloads/" rel="noopener">getmonero.org/downloads</a>. Apps change, so confirm the current details on the official listing before you install.
            </p>
          </div>
        </section>

        {/* 4. WHERE MONKSTASH FITS */}
        <section className={`${styles.sec} ${styles.alt}`} id="fit">
          <div className="container-wide">
            <div className={styles.fitGrid}>
              <div>
                <div className={styles.secHead}>
                  <p className="eyebrow">{d.fit.eyebrow}</p>
                  <h2>{d.fit.title}</h2>
                  <p className="lede">{d.fit.lede}</p>
                </div>
                <ol className={styles.fitList}>
                  {d.fit.points.map((p, i) => (
                    <li key={p.b}><span className={styles.fitN}>{NUMERALS[i]}</span><div><b>{p.b}</b> {p.t}</div></li>
                  ))}
                </ol>
                <div className="notice notice-warn" style={{ marginTop: "var(--s-5)" }}>
                  <span><strong>Early preview.</strong> {d.fit.notice}</span>
                </div>
                <div className={styles.fitCtas}>
                  {!isHardware && <Link className="btn btn-primary" href={walletUrl}>Open the wallet</Link>}
                  <Link className={styles.inlineLink} href="/create-monero-wallet">How to create a Monero wallet</Link>
                </div>
              </div>
              <figure className={styles.fitFig}>
                <div className={styles.fitArt}><FitArt kind={d.key} {...d.fit.fig} /></div>
                <figcaption className={styles.figCap}><span><b>Figure 2</b></span><span>{d.fit.figCaption}</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 5. COMPARISON TABLE */}
        <section className={styles.sec} id="compare">
          <div className="container-wide">
            <div className={styles.secHead}>
              <p className="eyebrow">{d.compare.eyebrow}</p>
              <h2>{d.compare.title}</h2>
              <p className="lede">{d.compare.lede}</p>
            </div>
            <div className={styles.tablewrap}>
              <table className={styles.mag}>
                <caption>{d.compare.caption}</caption>
                <thead>
                  <tr>
                    <th scope="col">Wallet</th>
                    {d.compare.cols.map((c) => <th key={c} scope="col">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {d.compare.rows.map((r) => (
                    <tr key={r.wallet} className={r.us ? styles.usRow : ""}>
                      <th scope="row">{r.wallet}</th>
                      {r.cells.map((c, i) => <td key={d.compare.cols[i]} data-label={d.compare.cols[i]}>{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tnote}>{d.compare.note}</p>
          </div>
        </section>

        {/* 6. DARK BAND: SAFETY */}
        <section className={`${styles.sec} ${styles.dark}`} id="safety">
          <div className={`container-wide ${styles.darkGrid}`}>
            <div>
              <div className={styles.secHead}>
                <p className="eyebrow">{d.safety.eyebrow}</p>
                <h2>{d.safety.title}</h2>
                <p className="lede">{d.safety.lede}</p>
              </div>
              <ol className={styles.checks}>
                {d.safety.steps.map((s, i) => (
                  <li key={s.b}><span className={styles.cn}>{NUMERALS[i]}</span><div><b>{s.b}</b> {s.t}</div></li>
                ))}
              </ol>
              <p className={styles.darkLinks}>
                <Link className="btn btn-clay" href="/monero-phishing-sites">How Monero phishing sites work</Link>
                <Link href="/monero-seed-phrase">What a seed phrase is</Link>
              </p>
            </div>
            <figure className={styles.checkFig}>
              <StoreArt kind={d.key} {...d.safety.fig} />
              <figcaption className={styles.figCapDark}><span><b>Figure 3</b></span><span>{d.safety.figCaption}</span></figcaption>
            </figure>
          </div>
        </section>

        {/* 7. MORE */}
        <section className={styles.sec} id="more">
          <div className="container-wide">
            <div className={styles.moreGrid}>
              <div>
                <h2>Wallets for other devices</h2>
                <div className={styles.platRow}>
                  {siblings.map((s) => (
                    <Link key={s.key} href={s.path} className={styles.platCard}>
                      <b>{s.label}</b>
                      <span>{s.blurb}</span>
                    </Link>
                  ))}
                </div>
                <p style={{ margin: "22px 0 0", color: "var(--ink-2)" }}>
                  Or see the <Link className={styles.inlineLink} href="/monero-wallets">full Monero wallet comparison</Link>, including web wallets.
                </p>
              </div>
              <div>
                <h2>Before you pick one</h2>
                <ul className={styles.nextList}>
                  <li><Link href="/monero-seed-phrase">What a Monero seed phrase is</Link><span>The words that are your wallet. Know them before you create one.</span></li>
                  <li><Link href="/create-monero-wallet">How to create a Monero wallet</Link><span>Step by step, with the backup done properly.</span></li>
                  <li><Link href="/restore-monero-wallet">How to restore a Monero wallet</Link><span>Moving from another app? Your words work in any compatible wallet.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FAQ */}
        <section className={`${styles.sec} ${styles.alt}`} id="faq">
          <div className={`container-wide ${styles.faqGrid}`}>
            <div className={styles.faqSide}>
              <p className="eyebrow">Questions</p>
              <h2>{d.faqTitle}</h2>
              <p className={styles.faqMore}>More answers live in the <Link className={styles.inlineLink} href="/faq">full FAQ</Link>, or <Link className={styles.inlineLink} href="/support">ask us</Link>.</p>
            </div>
            <div className={styles.faq}>
              {d.faqs.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary><span className={styles.fn}>{i + 1}</span>{f.q}<span className={styles.pm} aria-hidden="true" /></summary>
                  <div className={styles.ans}><p>{f.a}</p></div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 9. FINAL CTA */}
        <section className={styles.final} aria-labelledby="pFinalH">
          <div className={`container-wide ${styles.finalInner}`}>
            <h2 id="pFinalH">{d.final.title}</h2>
            <p>{d.final.body}</p>
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
