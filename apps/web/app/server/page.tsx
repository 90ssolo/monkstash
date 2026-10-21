import Link from "next/link";
import type { Metadata } from "next";
import { ogFor } from "@/lib/og";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { CodeSnippet } from "@/components/CodeSnippet";
import { absoluteUrl, repoUrl, walletUrl } from "@/lib/site";
import { partnerLink, type PartnerKey } from "@/lib/partners";
import { ServerStackArt } from "../_trust/TrustArt";
import trust from "../_trust/trust.module.css";
import styles from "../privacy/privacy.module.css";

const UPDATED = "2026-10-21";
const UPDATED_TEXT = "21 October 2026";
const TITLE = "Run a Monero Node in One Command";
const DESCRIPTION =
  "MonkStash Server sets up your own pruned Monero node on a Linux server in one command: the official release with its signature checked, HTTPS, a firewall, a status page, and optional MonkStash Pay for a shop. Free and open source.";
const SCRIPT_URL = absoluteUrl("/server/install.sh");
const SOURCE = `${repoUrl}/blob/main/server/monkstash-server.sh`;
const TESTS = `${repoUrl}/actions/workflows/server-installer.yml`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/server" },
  openGraph: ogFor({ type: "website", title: `${TITLE}: MonkStash Server`, description: DESCRIPTION, path: "/server" }),
};

const TOC = [
  { id: "short", label: "The short version" },
  { id: "install", label: "Install it" },
  { id: "what", label: "What it sets up" },
  { id: "server", label: "Pick a server" },
  { id: "shop", label: "For shops: MonkStash Pay" },
  { id: "daily", label: "Day to day" },
  { id: "trust", label: "What it checks, and its limits" },
  { id: "faq", label: "Questions" },
];

const HOSTS: { key: PartnerKey; plan: string; specs: string; price: string; note: string }[] = [
  { key: "contabo", plan: "Cloud VPS 6", specs: "6 vCPU, 12 GB, 200 GB SSD", price: "EUR 6 a month (24-month term, tax included)", note: "Says nodes and wallets are allowed; mining is not" },
  { key: "netcup", plan: "VPS 2000", specs: "256 GB disk", price: "EUR 26.92 a month (12-month term)", note: "Check its terms for nodes before you order" },
];

const FAQ = [
  { q: "How long does the first sync take?", a: "About 1 to 3 days for a pruned mainnet node on a typical VPS, mostly limited by the disk. The status page shows the progress. Your wallet can use the node once it says Up to date." },
  { q: "Pruned or full?", a: "Pruned is the default: it keeps about a third of the data (about 105 GiB in October 2026, against about 265 GiB for the full chain), still checks every block and serves wallets. Choose --full if you want to help other nodes sync from the very beginning." },
  { q: "Can other wallets use it?", a: "Yes. Feather, Cake Wallet and the Monero GUI can connect to the same address. MonkStash Server also allows the MonkStash web wallet to call it from a browser." },
  { q: "Does MonkStash see anything?", a: "No. The script sends nothing to MonkStash, and there are no accounts or telemetry. It downloads the release from getmonero.org and GitHub, Caddy from its package repository, and a certificate from Let's Encrypt. Your node then talks to other Monero nodes." },
  { q: "Who can see my server's IP address?", a: "Other Monero nodes see it, as with any node, and anyone you give the address to. Wallets that connect to it see it too. The node does not keep an access log of who connects." },
  { q: "Does it run on a Raspberry Pi?", a: "It supports ARM64 Linux (Debian or Ubuntu with systemd), so a Pi 4 or 5 with 4 GB or more and an SSD can work, but a home connection needs a public address or a domain for HTTPS. A VPS is the simpler start." },
];

export default function ServerPage() {
  const install = `curl -fsSL ${SCRIPT_URL} -o install.sh\nsudo bash install.sh install --domain node.example.com`;
  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org", "@type": "SoftwareApplication", name: "MonkStash Server", applicationCategory: "UtilitiesApplication",
          operatingSystem: "Debian 12 or 13, Ubuntu 22.04, 24.04 or 26.04 (x86-64, ARM64)", description: DESCRIPTION, url: absoluteUrl("/server"),
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }, license: "https://opensource.org/license/bsd-3-clause", dateModified: UPDATED,
          publisher: { "@type": "Organization", name: "MonkStash" },
        },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "MonkStash Server", item: absoluteUrl("/server") },
        ] },
      ]} />
      <SiteHeader />
      <main id="main">
        <section className={trust.hero}>
          <div className="container-wide">
            <nav className={trust.crumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">MonkStash Server</span>
            </nav>
            <div className={trust.heroGrid}>
              <div>
                <h1 className={trust.h1}>
                  <span className={`eyebrow ${trust.h1Kicker}`}>MonkStash Server</span>{" "}
                  Your own Monero node, <mark>in one command</mark>.
                </h1>
                <p className={trust.sub}>
                  Rent a small Linux server, paste two lines, and get a pruned Monero node with HTTPS, a firewall and a status page. Add MonkStash Pay and the same server takes payments for your shop. Free and open source.
                </p>
                <div className={trust.ctaRow}>
                  <a className="btn btn-primary btn-lg" href="#install">Install it</a>
                  <a className="btn btn-ghost btn-lg" href={SOURCE} rel="noopener">Read the script</a>
                </div>
                <p className={trust.micro}>Last updated <time dateTime={UPDATED}>{UPDATED_TEXT}</time>. Tested on every change on Ubuntu 24.04 (x86-64 and ARM64) and 22.04. Debian 12 and 13 are supported but not in the automatic test yet.</p>
              </div>
              <figure className={trust.fig}>
                <div className={trust.figBox}><ServerStackArt /></div>
                <figcaption className={trust.figCap}><span><b>Figure 1</b></span><span>What runs on your server.</span></figcaption>
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
                <li><strong>Your node, not someone else&apos;s.</strong> A public node sees which requests your wallet makes. Your own node sees only you.</li>
                <li><strong>The official Monero release.</strong> The script checks the release signature with the Monero project&apos;s key before it installs anything.</li>
                <li><strong>Ready for wallets.</strong> HTTPS with an automatic certificate, and the MonkStash web wallet may connect from a browser. Feather, Cake and the Monero GUI work too.</li>
                <li><strong>Payments for a shop, if you want them.</strong> One flag adds MonkStash Pay: a view-only payment server that can see payments and never spend them.</li>
              </ul>
            </section>

            <section id="install" aria-labelledby="install-h">
              <h2 id="install-h">Install it</h2>
              <h3>1. Rent a server</h3>
              <p>Debian 12 or 13, or Ubuntu 22.04, 24.04 or 26.04, with at least 4 GB of memory and about 150 GB of free disk for a pruned mainnet node. Point a domain at its IP address (for example <span className="mono">node.example.com</span>), or skip that and the script uses an address like <span className="mono">203-0-113-7.sslip.io</span>. See <a href="#server">pick a server</a>.</p>
              <h3>2. Run two lines</h3>
              <p>Log in to the server with SSH and run:</p>
              <CodeSnippet title="Install" note="Debian or Ubuntu, as root" code={install} />
              <p>It asks once before it changes anything. Want to read it first? It is a single file: <span className="mono">less install.sh</span>, or <a className={trust.inlineLink} href={SOURCE} rel="noopener">read it on GitHub</a>.</p>
              <h3>3. Connect your wallet</h3>
              <p>
                Open <span className="mono">https://node.example.com/status</span> and wait until it says <b>Up to date</b>. Then in <Link className={trust.inlineLink} href={walletUrl}>MonkStash</Link> go to <b>Settings</b>, <b>Connection</b>, choose your own node and paste <span className="mono">https://node.example.com</span>. Other wallets take the same address.
              </p>
            </section>

            <section id="what" aria-labelledby="what-h">
              <h2 id="what-h">What it sets up</h2>
              <table className={styles.table}>
                <caption>Table 1. The pieces MonkStash Server installs</caption>
                <thead><tr><th scope="col">Piece</th><th scope="col">What it does</th></tr></thead>
                <tbody>
                  <tr><th scope="row">Monero node</th><td>The official <span className="mono">monerod</span>, pruned, as a system service under its own user, restarted if it stops</td></tr>
                  <tr><th scope="row">Restricted RPC</th><td>What wallets use. It cannot change or stop the node. The full RPC listens only on the server itself</td></tr>
                  <tr><th scope="row">HTTPS</th><td>Caddy with an automatic certificate, no access log</td></tr>
                  <tr><th scope="row">Firewall</th><td>ufw: SSH on its current port, 80, 443 and the Monero peer port open, everything else closed</td></tr>
                  <tr><th scope="row">Status page</th><td>Sync progress, peers, disk and version at <span className="mono">/status</span>, refreshed every minute</td></tr>
                  <tr><th scope="row">MonkStash Pay</th><td>Optional, with <span className="mono">--pay</span>: checkout pages and a shop API at <span className="mono">pay.&lt;your address&gt;</span></td></tr>
                </tbody>
              </table>
            </section>

            <section id="server" aria-labelledby="server-h">
              <h2 id="server-h">Pick a server</h2>
              <p>A pruned mainnet node needs about 4 GB of memory and 150 GB or more of SSD, and the disk matters most for the first sync. Two plans that fit, checked on {UPDATED_TEXT}:</p>
              <table className={styles.table}>
                <caption>Table 2. Servers that fit a pruned node</caption>
                <thead><tr><th scope="col">Host and plan</th><th scope="col">Size</th><th scope="col">Price</th><th scope="col">Nodes allowed?</th></tr></thead>
                <tbody>
                  {HOSTS.map((h) => {
                    const l = partnerLink(h.key);
                    return (
                      <tr key={h.key}>
                        <th scope="row"><a className={trust.inlineLink} href={l.href} rel={l.affiliate ? "sponsored noopener" : "noopener"}>{l.name}</a> {h.plan}{l.affiliate ? <span className="small muted"> (referral link)</span> : null}</th>
                        <td>{h.specs}</td><td>{h.price}</td><td>{h.note}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="small muted">Prices change; check the host. Avoid plans under 150 GB of disk: they cannot hold the chain for long. Mainstream clouds work too but need an extra volume for the disk, which roughly doubles the price.</p>
            </section>

            <section id="shop" aria-labelledby="shop-h">
              <h2 id="shop-h">For shops: MonkStash Pay</h2>
              <p>
                Add <span className="mono">--pay</span> and the same server takes Monero payments for your shop. It asks for your shop wallet&apos;s primary address, private <b>view</b> key and restore height. With those it can see payments, <mark>never spend them</mark>. Never give it a seed or spend key.
              </p>
              <CodeSnippet title="Node and payments" note="WooCommerce shop" code={`sudo bash install.sh install --domain node.example.com --pay \\\n  --shop-url https://shop.example.com --shop-name "Example shop" --currency EUR`} />
              <p>
                Then run <span className="mono">sudo monkstash-server pay-info</span> and copy the server address, API key and webhook secret into the MonkStash Pay plugin in WooCommerce. A fresh address for every order, prices in your currency, and the order completes itself when paid. The plugin and how it works: <Link className={trust.inlineLink} href="/monero-woocommerce">Monero for WooCommerce</Link>.
              </p>
            </section>

            <section id="daily" aria-labelledby="daily-h">
              <h2 id="daily-h">Day to day</h2>
              <CodeSnippet title="Commands" code={`# Sync progress, peers, disk, version\nmonkstash-server status\n# Install a newer Monero release (signature checked again)\nsudo monkstash-server update\n# Check for new releases every day and install them\nsudo monkstash-server install --auto-update\n# Get the latest version of this script\nsudo monkstash-server self-update`} />
              <p>Running <span className="mono">install</span> again changes settings (a domain, another wallet origin, Pay) and keeps the blockchain. <span className="mono">uninstall</span> removes the services and keeps the blockchain unless you add <span className="mono">--purge</span>.</p>
            </section>

            <section id="trust" aria-labelledby="trust-h">
              <h2 id="trust-h">What it checks, and its limits</h2>
              <ul>
                <li><strong>The release.</strong> It downloads the signed hash list from getmonero.org, checks the signature with the Monero release key (fingerprint <span className="mono">81AC 591F E9C4 B65C 5806 AFC3 F0AF 4D46 2A0B DF92</span>), and checks the archive&apos;s SHA-256 against it. A changed hash list or a different key stops the install.</li>
                <li><strong>The script itself.</strong> Its SHA-256 is listed in this site&apos;s <a className={trust.inlineLink} href="https://wallet.monkstash.com/build.json">build manifest</a>, and the site can be rebuilt from the public source to check it (<Link className={trust.inlineLink} href="/verify">how</Link>). Run <span className="mono">sha256sum install.sh</span> to compare.</li>
                <li><strong>Tested in public.</strong> Every change installs it on fresh Ubuntu machines, x86-64 and ARM64, with a test node, and checks the sync, HTTPS, browser access, the restricted RPC, the status page, the firewall and uninstall (<a className={trust.inlineLink} href={TESTS} rel="noopener">the test runs</a>).</li>
                <li><strong>It runs as root</strong>, like any server installer, because it installs services and a firewall. Read it before you run it if you can.</li>
                <li><strong>You run the server.</strong> Keeping its system updated, its SSH login safe and its disk from filling up is yours to do. The script has not had an independent security review yet.</li>
              </ul>
            </section>

            <section id="faq" aria-labelledby="faq-h">
              <h2 id="faq-h">Questions</h2>
              {FAQ.map((f) => (
                <div key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
              <div className={styles.next}>
                <a className="btn btn-primary" href="#install">Install it</a>
                <Link className="btn btn-secondary" href="/run-a-monero-node">Prefer doing it by hand? The full guide</Link>
              </div>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
