import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { site, walletAddressText, walletUrl } from "@/lib/site";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Wallet",
    links: [
      { href: walletUrl, label: "Open the wallet" },
      { href: "/monero-chrome-extension", label: "Chrome extension" },
      { href: "/monero-wallets", label: "Compare Monero wallets" },
      { href: "/mymonero-alternative", label: "MyMonero alternative" },
      { href: "/restore-monero-wallet", label: "Restore a wallet" },
    ],
  },
  {
    title: "Learn",
    links: [
      { href: "/learn", label: "The library" },
      { href: "/what-is-monero", label: "What is Monero" },
      { href: "/create-monero-wallet", label: "Create a wallet" },
      { href: "/buy-monero", label: "Buy Monero" },
      { href: "/learn#fix", label: "Fix a problem" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/tools/monero-address-validator", label: "Address validator" },
      { href: "/tools/monero-restore-height-calculator", label: "Restore height" },
      { href: "/tools/monero-fee-calculator", label: "Fee calculator" },
      { href: "/tools/monero-qr-code-generator", label: "QR code generator" },
      { href: "/tools/monero-mining-calculator", label: "Mining calculator" },
    ],
  },
  {
    title: "Business",
    links: [
      { href: "/business", label: "Business overview" },
      { href: "/monero-payment-link", label: "Payment links" },
      { href: "/monero-pos", label: "A till for your counter" },
      { href: "/accept-monero-payments", label: "Accept payments" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/support", label: "Support" },
      { href: "/donate", label: "Support the project" },
      { href: "/privacy", label: "Privacy policy" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  const siteHost = new URL(site.url).host;
  return (
    <footer className="site-footer">
      <div className="container-wide">
        <aside className="footer-safety" aria-label="Stay safe">
          <p className="footer-safety-label">Stay safe</p>
          <p className="footer-safety-text">
            The real MonkStash lives only at <strong>{siteHost}</strong>
            {walletAddressText.startsWith(siteHost) ? null : <> and <strong>{walletAddressText}</strong></>}. We will never ask for your 25 words, by email, chat or anywhere else.
          </p>
          <Link className="footer-safety-link" href="/monero-phishing-sites">Spot a fake wallet <span aria-hidden="true">→</span></Link>
        </aside>

        <nav className="footer-grid" aria-label="Footer">
          <div className="footer-about">
            <Link href="/" className="brand"><BrandMark /><span>MonkStash</span></Link>
            <p>
              A free Monero wallet that runs in your browser. Your keys are made and encrypted on your device. We never see them, and we cannot move your money.
            </p>
            <Link className="footer-roadmap" href="/donate#roadmap">
              <span className="footer-roadmap-label">Coming next</span>
              <span className="footer-roadmap-text">See the roadmap, and help us build it</span>
              <span aria-hidden="true" className="footer-roadmap-arrow">→</span>
            </Link>
          </div>
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h2>{c.title}</h2>
              <ul>
                {c.links.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </nav>

        <div className="footer-contact">
          <p><span>Say hello</span> <a href="mailto:hello@monkstash.com">hello@monkstash.com</a></p>
          <p><span>Need help</span> <a href="mailto:support@monkstash.com">support@monkstash.com</a></p>
          <p><span>Report a vulnerability</span> <a href="mailto:security@monkstash.com">security@monkstash.com</a></p>
        </div>

        <div className="footer-bottom">
          <span>© {year} MonkStash. Your money, your business.</span>
          <span>
            Monero is an independent open-source project. MonkStash is not affiliated with it. Learn more at <a href="https://www.getmonero.org/" rel="noopener">getmonero.org</a>.
          </span>
        </div>
      </div>
    </footer>
  );
}
