import { getArticles } from "@/lib/content";
import { absoluteUrl, site, walletAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const lines = [
    `# ${site.name}`, "", `> ${site.description}`, "",
    "Key facts:",
    "- A Monero web wallet: it runs in the browser, with nothing to install.",
    "- Non-custodial: the seed phrase and private keys are generated and encrypted (PBKDF2-SHA256 + AES-256-GCM) in the user's browser and never sent to a server.",
    "- The wallet engine is monero-ts (WebAssembly build of the official Monero code).",
    "- Supports creating a wallet, restoring from a 25-word seed, a 13-word MyMonero phrase (converted in the browser with MyMonero's own key derivation) or a 12-word Exodus BIP39 phrase (BIP32 m/44'/128'/0'/0/0, as in Cake Wallet; converted to the standard 25-word seed), and view-only (watch-only) wallets.",
    "- Syncs through the MonkStash relay to public Monero nodes by default: the relay sees the user's IP and requests, the node sees requests and broadcast transactions, neither sees keys. Users can instead connect the wallet directly to their own node (HTTPS, monerod --rpc-access-control-origins); the node address is stored only inside the encrypted wallet.",
    "- Payment requests: the wallet creates a fresh subaddress per request and a /pay link (standard monero: URI kept in the #fragment, never sent to the server), and marks requests paid automatically.",
    "- Payment requests can be priced in EUR, USD and other currencies (converted at the median of several exchanges, rate held until the link expires), with an optional expiry, payee name and https return link, and turned into a plain-HTML Pay with Monero button.",
    "- Cashier mode: a browser point of sale inside the wallet (keypad, fresh subaddress and QR per sale, rate held 15 minutes, configurable confirmation rules, sales list encrypted on the device, CSV export). Intended for a watch-only wallet on the till device.",
    "- Coming, not yet released or downloadable: MonkStash Pay, a self-hosted Monero payment gateway run by the merchant (view-only wallet, invoice API, checkout page, HMAC-signed webhooks), plus a WooCommerce plugin for it. Version 0.1 is built and tested on stagenet (a real invoice and checkout page, and an expiry webhook delivered with a valid signature; a paid order has not yet been tested end to end).",
    "- Source code: not public yet. MonkStash will be published as open source after launch. The wallet engine it builds on, monero-ts, is already open source.",
    "- Sends to OpenAlias names (e.g. donate.getmonero.org), looked up through the MonkStash server with the DNSSEC status shown; unverified names need explicit confirmation.",
    "- Recovery words can be shown again in settings after re-entering the wallet password (and authenticator code if 2FA is on); they hide after 60 seconds.",
    "- Locks itself after 10 minutes idle, or 5 minutes after the tab is hidden.",
    "- A wallet lives in the browser where it was created; it does not sync across devices (restore with the seed on a new device).",
    "- No account, email or registration. Wallet pages carry no analytics.",
    "- Status: early preview, not yet independently security audited. Mobile browsers are still being tested. A browser extension is planned, not built.",
    "- Contact: support@monkstash.com (help), security@monkstash.com (vulnerabilities), hello@monkstash.com (general).", "",
    "## Pages",
    `- [Monero web wallet (home)](${absoluteUrl("/")})`,
    `- [Open the wallet](${walletAbsoluteUrl})`,
    `- [Best Monero wallets compared](${absoluteUrl("/monero-wallets")})`,
    `- [Monero wallets for Android](${absoluteUrl("/monero-wallets/android")})`,
    `- [Monero wallets for iPhone](${absoluteUrl("/monero-wallets/iphone")})`,
    `- [Monero desktop wallets](${absoluteUrl("/monero-wallets/desktop")})`,
    `- [Monero hardware wallets](${absoluteUrl("/monero-wallets/hardware")})`,
    `- [MyMonero alternative](${absoluteUrl("/mymonero-alternative")})`,
    `- [Monero wallet Chrome extension](${absoluteUrl("/monero-chrome-extension")})`,
    `- [Monero address validator](${absoluteUrl("/tools/monero-address-validator")})`,
    `- [Monero restore height calculator](${absoluteUrl("/tools/monero-restore-height-calculator")})`,
    `- [Monero fee calculator](${absoluteUrl("/tools/monero-fee-calculator")})`,
    `- [Monero QR code generator](${absoluteUrl("/tools/monero-qr-code-generator")}): monero: payment URI and QR code, made in the browser`,
    `- [Monero mining calculator](${absoluteUrl("/tools/monero-mining-calculator")}): estimated earnings from live network difficulty`,
    `- [Free Monero tools](${absoluteUrl("/tools")})`,
    `- [Monero guide library](${absoluteUrl("/learn")})`,
    `- [Monero for business](${absoluteUrl("/business")})`,
    `- [Support the project](${absoluteUrl("/donate")})`,
    `- [About](${absoluteUrl("/about")})`,
    `- [Privacy policy](${absoluteUrl("/privacy")}): no accounts, cookies or tracking; what the node relay can see`,
    `- [FAQ](${absoluteUrl("/faq")})`,
    `- [Support](${absoluteUrl("/support")})`, "",
    "## Articles",
    ...getArticles().map((a) => `- [${a.title}](${absoluteUrl(a.path)}): ${a.summary}`), "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
