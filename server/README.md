# MonkStash Server

Your own Monero node on a fresh Debian or Ubuntu server, in one command. Use it with the MonkStash wallet, Feather, Cake or the Monero GUI instead of a public node.

```
curl -fsSL https://monkstash.com/server/install.sh -o install.sh
sudo bash install.sh install --domain node.example.com
```

Without `--domain`, the node gets an address like `203-0-113-7.sslip.io` for the server's public IP. When it finishes, open `https://<your address>/status` and, once it says Up to date, paste the address into the wallet (MonkStash: Settings, Connection, use your own node).

## What it does

* **Installs the official Monero release.** It downloads the signed hash list from getmonero.org, checks its signature with the Monero release key (binaryFate, fingerprint `81AC 591F E9C4 B65C 5806 AFC3 F0AF 4D46 2A0B DF92`, the key itself fetched from the Monero source repository), and checks the archive's SHA-256 against that list. Any mismatch stops the install.
* **Runs a pruned node** as the `monerod` system service, under its own `monero` user with a locked-down systemd unit. `--full` keeps the whole blockchain.
* **Puts the restricted RPC behind HTTPS** with Caddy (automatic certificates, no access log). The full RPC listens only on `127.0.0.1`. Browsers may call the node from `https://wallet.monkstash.com` (CORS); add others with `--origin`.
* **Turns on the firewall** (ufw): SSH (on its current port), 80, 443 and the peer port. `--no-firewall` skips it.
* **Adds a status page** at `/status`: sync progress, peers, disk and version, refreshed every minute. No wallet or payment data.

Nothing is sent to MonkStash: no accounts, no telemetry. The only outside requests are to getmonero.org and GitHub (release, signature, key), Caddy's package repository, Let's Encrypt (certificate) and other Monero nodes.

## Requirements

* Debian 12 or 13, Ubuntu 22.04, 24.04 or 26.04, on x86-64 or ARM64, with systemd.
* At least 4 GB of memory.
* Disk: about 150 GB free for a pruned mainnet node (the pruned chain was about 105 GiB in October 2026 and grows), 400 GB for a full node, 10 GB for stagenet.
* First sync: about 1 to 3 days on a typical VPS, mostly limited by disk speed.

## Commands

| Command | What it does |
|---|---|
| `monkstash-server status` | Sync progress, peers, disk, version and the node's address (`--json` for scripts) |
| `monkstash-server update` | Install a newer Monero release, signature checked; the previous one is kept for rollback. `--check` only reports. `install --auto-update` checks daily |
| `monkstash-server install ...` | Change settings (domain, origins, network); the blockchain is kept |
| `monkstash-server self-update` | Replace this script with the current one from monkstash.com |
| `monkstash-server uninstall` | Stop and remove the services; `--purge` also deletes the blockchain |

## Checking the script

The website build lists every file it serves with its SHA-256 in [build.json](https://wallet.monkstash.com/build.json), including `server/install.sh`, and that build is reproducible from this repository (see [/verify](https://monkstash.com/verify)):

```
sha256sum install.sh
```

The `Server installer` GitHub Actions workflow installs it on fresh Ubuntu machines (x86-64 and ARM64) with a stagenet node on every change and checks the release verification, sync, HTTPS, browser access, the restricted RPC, the status page, the firewall, re-install, update and uninstall.
