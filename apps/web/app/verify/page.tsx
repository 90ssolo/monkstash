import Link from "next/link";
import { ogFor } from "@/lib/og";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { absoluteUrl, repoUrl, walletAbsoluteUrl, walletUrl } from "@/lib/site";
import { BuildStackArt } from "../_trust/TrustArt";
import trust from "../_trust/trust.module.css";
import styles from "../privacy/privacy.module.css";
import { LiveBuild } from "./LiveBuild";

const UPDATED = "2026-10-20";
const UPDATED_TEXT = "20 October 2026";
const DESCRIPTION =
  "Check that the MonkStash wallet your browser loads is exactly the open-source code on GitHub: rebuild it yourself and compare fingerprints, or run the one-minute checker.";

export const metadata: Metadata = {
  title: "Verify the MonkStash build",
  description: DESCRIPTION,
  alternates: { canonical: "/verify" },
  openGraph: ogFor({ type: "website", title: "Verify the MonkStash build", description: DESCRIPTION, path: "/verify" }),
};

const TOC = [
  { id: "short", label: "The short version" },
  { id: "live", label: "The build you are using" },
  { id: "how", label: "How the check works" },
  { id: "limits", label: "What it does not prove" },
];

const walletOrigin = new URL(walletAbsoluteUrl).origin;

export default function VerifyPage() {
  return (
    <>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebPage", name: "Verify the MonkStash build", description: DESCRIPTION, url: absoluteUrl("/verify"), dateModified: UPDATED },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Verify the build", item: absoluteUrl("/verify") },
        ] },
      ]} />
      <SiteHeader />
      <main id="main">
        <section className={trust.hero}>
          <div className="container-wide">
            <nav className={trust.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Verify the build</span>
            </nav>
            <div className={trust.heroGrid}>
              <div>
                <h1 className={trust.h1}>
                  <span className={`eyebrow ${trust.h1Kicker}`}>Verify the build</span>{" "}
                  Don&apos;t trust us. <mark>Check the code</mark> your browser runs.
                </h1>
                <p className={trust.sub}>
                  The wallet is open source. Anyone can rebuild it from GitHub and get the same files, byte for byte, that this site sends to your browser.
                </p>
                <p className={trust.micro}>Last updated <time dateTime={UPDATED}>{UPDATED_TEXT}</time>.</p>
              </div>
              <figure className={trust.fig}>
                <div className={trust.figBox}><BuildStackArt /></div>
                <figcaption className={trust.figCap}><span><b>Figure 1</b></span><span>Same source, same build, same files.</span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <div className={`container-wide ${styles.layout}`}>
          <nav className={styles.toc} aria-label="On this page">
            <p className={styles.tocHead}>On this page</p>
            <ol>
              {TOC.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>)}
            </ol>
          </nav>

          <div className={styles.doc}>
            <section id="short" aria-labelledby="short-h">
              <h2 id="short-h">The short version</h2>
              <ul className={styles.short}>
                <li><strong>Every release has a fingerprint.</strong> It is a SHA-256 over every file a browser can download from this site: the wallet&apos;s code and the Monero engine it runs.</li>
                <li><strong>You can rebuild it.</strong> The same commit, built with the same pinned tools, gives the same fingerprint. If yours matches ours, the site is serving exactly the published code.</li>
                <li><strong>The wallet shows it too.</strong> Open Settings in the wallet to see the build you are using, with a link back here.</li>
                <li><strong>It has limits</strong>, listed below. We would rather you know them than assume more.</li>
              </ul>
            </section>

            <section id="live" aria-labelledby="live-h">
              <h2 id="live-h">The build you are using</h2>
              <LiveBuild repoUrl={repoUrl} walletOrigin={walletOrigin} />
            </section>

            <section id="how" aria-labelledby="how-h">
              <h2 id="how-h">How the check works</h2>
              <p>
                Each release is built in Docker from a public commit, with a base image pinned by its digest, locked dependencies and a build ID equal to the commit. Building the same commit twice gives identical files; we tested this with two clean builds on our server before turning it on.
              </p>
              <p>
                After the build, a script lists every file under <span className="mono">/_next/static</span> and <span className="mono">public/</span> with its SHA-256 and publishes the list as <a className={trust.inlineLink} href="/build.json">/build.json</a>. The fingerprint is the SHA-256 of that list. The checker downloads every listed file from the live site and compares, then compares the whole list with yours.
              </p>
              <p>
                The source is on <a className={trust.inlineLink} href={repoUrl}>GitHub</a>, and the scripts are short enough to read: <span className="mono">apps/web/scripts/build-manifest.mjs</span> and <span className="mono">scripts/verify-build.mjs</span>.
              </p>
            </section>

            <section id="limits" aria-labelledby="limits-h">
              <h2 id="limits-h">What it does not prove</h2>
              <ul>
                <li><strong>It checks what you were served, when you checked.</strong> A web server could in theory send different files to one visitor at one moment. A browser extension closes this gap, because its code is installed once and checked once; that is on our roadmap.</li>
                <li><strong>Each page also carries a little inline data.</strong> Next.js adds small inline scripts with the page&apos;s data, which differ per request, so a build hash cannot cover them. On wallet pages a strict security policy lets only scripts carrying a one-time code from our server run.</li>
                <li><strong>Rebuild on linux/amd64.</strong> We test reproducibility in Docker on that platform. Building elsewhere may produce different bytes for the same code.</li>
                <li><strong>Matching code is not the same as safe code.</strong> A match proves the site runs the published source, not that the source has no bugs. An independent security review is a separate step on our <Link className={trust.inlineLink} href="/donate">roadmap</Link>.</li>
              </ul>
              <div className={styles.next}>
                <Link className="btn btn-primary" href={walletUrl}>Open the wallet</Link>
                <a className="btn btn-secondary" href={repoUrl}>Read the code</a>
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
