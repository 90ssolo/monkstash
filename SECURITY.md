# Security

MonkStash is a non-custodial Monero wallet. If you find a way to steal, redirect or expose someone's money or keys, we want to hear about it first, and we will fix it fast.

## Reporting a vulnerability

* Email **security@monkstash.com**. Please do not open a public issue for security problems.
* Include what you found, how to reproduce it, and what an attacker could do with it. A proof of concept helps.
* Use stagenet or testnet for any testing that moves funds. Never test against other people's wallets.
* We will acknowledge your report within 72 hours, keep you updated, and credit you when the fix ships (unless you prefer to stay anonymous).
* Please give us a reasonable time to fix the problem before you publish it. We aim for 30 days or less for serious issues.

We do not run a paid bug bounty yet. We are glad to thank you publicly, and a bounty is on the roadmap once funding allows.

## What is in scope

* The web wallet (`apps/web`: the wallet at wallet.monkstash.com and the `/pay` pages on monkstash.com) and the shared wallet core (`packages/wallet-core`).
* MonkStash Pay, the self-hosted payment server (`apps/pay`), and the WooCommerce plugin (`integrations/woocommerce`).
* The server endpoints on monkstash.com: the node relay, price, OpenAlias and donation endpoints.

Especially valuable: anything that leaks recovery words, spend or view keys; anything that makes the wallet pay a different address than the user saw; script injection on wallet pages; forging a "paid" status in MonkStash Pay or the plugin; using our servers as an open proxy.

Out of scope: denial of service by sheer traffic volume, missing best-practice headers with no exploit, social engineering of the team, and issues in third-party nodes or block explorers.

## How MonkStash protects users

* **Keys never leave the device.** Recovery words and keys are generated in the browser, encrypted with the wallet password (PBKDF2-SHA256 and AES-256-GCM via the Web Crypto API) and stored only in that browser. No server ever receives them.
* **Audited cryptography only.** The wallet engine is monero-ts (the official Monero code compiled to WebAssembly). Restores from other wallets use audited libraries (`@noble/hashes`, `@scure/bip39`, `@scure/bip32`) and are checked against published test vectors. We do not write our own cryptographic primitives.
* **Strict Content Security Policy on money pages.** The wallet and payment pages allow only scripts that carry a fresh per-request nonce: no inline scripts, no third-party code, no framing. The wallet engine's worker has its own minimal policy.
* **What our servers can see.** The default node relay sees the wallet's IP address and its sync requests, never its keys. Users can connect directly to their own node instead. Payment links keep their details in the URL fragment, which browsers never send to a server. No analytics run on wallet pages.
* **Abuse limits.** Server endpoints are rate limited per client and reject oversized requests.

The full threat model will be published with the source code.

## Supported versions

Only the latest deployed version of the web wallet is supported. For MonkStash Pay and the WooCommerce plugin, the latest release is supported; both are early (0.x) and have not yet had an independent audit.
