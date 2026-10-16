import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { NavMenu } from "./NavMenu";
import { walletUrl } from "@/lib/site";

const NAV = [
  { href: "/learn", label: "Learn" },
  { href: "/monero-wallets", label: "Wallets" },
  { href: "/business", label: "Business" },
  { href: "/tools", label: "Tools" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <>
      <div className="topbar">
        <div className="container-wide topbar-inner">
          <span>Money no one can freeze</span>
          <span>Cash for the internet, private by default</span>
        </div>
      </div>
      <header className="site-header">
        <div className="container-wide">
          <div className="site-header-inner">
            <Link href="/" className="brand" aria-label="MonkStash home">
              <BrandMark />
              <span>MonkStash</span>
            </Link>
            <nav className="nav" aria-label="Main">
              {NAV.map((n) => <Link key={n.href} className="nav-link" href={n.href}>{n.label}</Link>)}
              {/* Phones: the same links in a menu (works without script; closes on Escape, link or outside click). */}
              <NavMenu items={NAV} />
              <Link className="btn btn-primary btn-sm" href={walletUrl}>Open wallet</Link>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
