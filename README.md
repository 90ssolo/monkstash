# MonkStash

A free, non-custodial Monero (XMR) wallet that runs in your browser, plus tools for getting paid in Monero.

* Website: https://monkstash.com
* Wallet: https://wallet.monkstash.com
* Security reports: security@monkstash.com (see [SECURITY.md](SECURITY.md))

Recovery words and keys are created in the browser, encrypted with the wallet password and stored only on the user's device. No server ever receives them. Anyone can read this code to check how that works, and run their own copy.

## What is in this repository

| Path | What it is |
|---|---|
| `packages/wallet-core` | Shared, unit-tested logic: vault encryption, address and amount checks, payment links, invoices, restore formats (MyMonero, Exodus), height estimates |
| `apps/web` | The website and the wallet (Next.js). Includes the node relay, the free tools and the `/pay` page for payment links |
| `apps/pay` | MonkStash Pay: a self-hosted payment server for online shops, using a view-only wallet |
| `integrations/woocommerce` | WooCommerce plugin that takes Monero through your own MonkStash Pay server |
| `deploy` | Docker Compose, Caddy and Tor files to run the whole site on one server |

## How it protects users

* **Keys stay on the device.** The wallet engine is [monero-ts](https://github.com/woodser/monero-ts), the official Monero code compiled to WebAssembly. Secrets are encrypted with PBKDF2-SHA256 and AES-256-GCM through the Web Crypto API.
* **No custom cryptography.** Restores from other wallets use audited libraries (`@noble/hashes`, `@scure/bip39`, `@scure/bip32`) and are tested against published vectors.
* **A strict Content Security Policy** on wallet and payment pages: only scripts with a fresh per-request nonce, no third-party code, no framing.
* **The wallet has its own origin** (`wallet.` subdomain), so content pages can never read its storage.
* **What the server can see.** The default node relay sees a wallet's IP address and sync requests, never its keys. Users can connect straight to their own node in Settings instead. Payment link details live in the URL fragment, which browsers never send to a server.

## Verify the build

Builds are reproducible: the same commit, built in Docker with the pinned base image, gives byte-identical files. Each release publishes `/build.json` (the commit, the public build settings and a SHA-256 for every file a browser can download) and the wallet shows the fingerprint in Settings.

```bash
node scripts/verify-build.mjs https://wallet.monkstash.com
```

That checks every live file against the manifest. To compare with your own build of the same commit, follow the steps on [monkstash.com/verify](https://monkstash.com/verify), which fills in the exact commit and settings. What this proves, and what it does not, is explained on the same page.

## Run it locally

Requirements: Node.js 24 and pnpm 10.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev     # http://localhost:3210 (stagenet by default)
pnpm test    # unit tests
```

Set `NEXT_PUBLIC_MONERO_NETWORK` to `stagenet`, `testnet` or `mainnet`, and `MONERO_NODE_URLS` to the nodes the relay should use, for example your own node at `http://127.0.0.1:18081`.

## Run your own server

See [deploy/README.md](deploy/README.md) for a step by step guide: one small Debian or Ubuntu server, Docker, automatic HTTPS and an optional onion mirror.

## Support the project

MonkStash is free and takes no fee on payments. Donations in XMR pay for its development:

```
49e3LYdPPHjgf27mSUD6ya8P5zcgwa8CWaBRjgEq44EtHqppMhLTSVsRuWpW4zCNeFWrGPvnxakAccZjtQBMQtLeJAYou4F
```

The wallet is public: its private view key and a live total are on [monkstash.com/donate](https://monkstash.com/donate), so anyone can check every donation. Always compare the address with that page before sending.

## License

BSD-3-Clause. See [LICENSE](LICENSE).
