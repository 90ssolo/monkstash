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

## License

BSD-3-Clause. See [LICENSE](LICENSE).
