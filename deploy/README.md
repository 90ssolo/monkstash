# Deploying MonkStash on a VPS

One small VPS runs everything: the website and wallet (Next.js), HTTPS (Caddy, automatic certificates) and, optionally, an onion mirror (Tor). About 30 minutes the first time.

## What you need

* A VPS with **Ubuntu 24.04**, **2 vCPU, 4 GB RAM, 25 GB disk** or more root SSH access. A Monero node later needs a bigger plan (100 GB+ for a pruned node).
* The domain (monkstash.com) with access to its DNS settings.
* From this repository on your computer: the code (the server builds it).

## 1. Point the domain at the server

In your domain's DNS settings, add:

| Type | Name | Value |
|---|---|---|
| A | `@` | the VPS's IPv4 address |
| A | `www` | the same IPv4 address |
| A | `wallet` | the same IPv4 address |
| AAAA | `@`, `www` and `wallet` | the VPS's IPv6 address (if it has one) |

DNS can take a few minutes to an hour to spread. HTTPS certificates are issued only once it has.

The wallet runs on its own address, `wallet.monkstash.com`. Browsers keep each address's storage separate, so the content pages (articles, tools) can never read the wallet's encrypted data. `monkstash.com/wallet` redirects there. If you use Cloudflare, set these records to **DNS only** (grey cloud): Caddy needs to reach Let's Encrypt directly, and visitors' traffic should not pass through a third party.

## 2. Secure the server (once)

Log in as root with the password or key from the provider, then:

```bash
# Updates and a firewall that only allows SSH, HTTP and HTTPS
apt update && apt -y upgrade
apt -y install ufw unattended-upgrades
ufw allow OpenSSH && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 443/udp && ufw --force enable

# A normal user for day-to-day work (replace "monk" if you like)
adduser monk && usermod -aG sudo monk
mkdir -p /home/monk/.ssh && cp ~/.ssh/authorized_keys /home/monk/.ssh/ && chown -R monk:monk /home/monk/.ssh
```

Make sure you can log in as `monk` with your SSH key **in a second window** before the next step. Then turn off password and root logins:

```bash
sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/; s/^#\?PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart ssh
```

### Notes from a real Debian 12 server

* **The provider ships its own SSH settings** in `/etc/ssh/sshd_config.d/` (for example `00-provider.conf`), which turn password and root login back on. SSH uses the first value it reads, so put the hardening in a file that sorts first, `00-monkstash-hardening.conf`:
  `PasswordAuthentication no`, `KbdInteractiveAuthentication no`, `PermitRootLogin no`, `MaxAuthTries 3`, `LoginGraceTime 30`, `X11Forwarding no`, `AllowUsers monk`. Check with `sudo sshd -T | grep -E "passwordauth|permitroot"`.
* **fail2ban on Debian 12** needs `backend = systemd` (logins go to the journal, not `/var/log/auth.log`) and the `python3-systemd` package, or it fails to start.
* **Automatic security updates:** `unattended-upgrades`, with `APT::Periodic::Unattended-Upgrade "1";` in `/etc/apt/apt.conf.d/20auto-upgrades`.
* **The `monk` user has no password at all** (key login only) and passwordless sudo. Keep the root password for the provider's web console only.
* **Docker:** install from Docker's signed apt repository (key fingerprint `9DC8 5822 9FC7 DD38 854A E2D8 8D81 803C 0EBF CD88`) rather than piping a script to the shell. Some provider images already list that repository; keep theirs if the key fingerprint matches.
* **A 2 GB swap file** keeps the Next.js build from running out of memory on 4 GB.
* **Staging on a test hostname:** set `SITE_DOMAIN=203-0-113-10.sslip.io` style values (your server's IP with dashes) and `STAGING_ROBOTS_HEADER=X-Robots-Tag "noindex, nofollow"` so search engines never index the test copy.

## 3. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
usermod -aG docker monk
```

Log out and back in as `monk`.

## 4. Copy the code to the server

The repository is private for now, so copy it from your computer (run this on your computer, from the folder that contains `monero`):

```bash
rsync -az --delete --exclude node_modules --exclude .next --exclude .git --exclude private --exclude "*.local.json" --exclude ".env*" --exclude .data monero/ monk@YOUR_SERVER_IP:~/monkstash/
```

Without rsync (Windows), use `scp -r` or WinSCP with the same folders left out. Never copy `private/`, `.env` files or `test-wallets.local.json`.

## 5. Configure

On the server:

```bash
cd ~/monkstash
cp deploy/.env.example deploy/.env
nano deploy/.env
```

Fill in `ACME_EMAIL` (for certificate notices) and check the domain and node lists. Keep `NEXT_PUBLIC_MONERO_NETWORK=stagenet` for a test run first, then switch to `mainnet`.

## 6. Start

```bash
cd ~/monkstash
docker compose -f deploy/docker-compose.yml up -d --build
docker compose -f deploy/docker-compose.yml logs -f
```

The first build takes a few minutes. Then open `https://monkstash.com`. Caddy gets the certificate on the first visit.

## 7. Check it

* The home page, a few guides and `/wallet` load over HTTPS.
* `https://monkstash.com/api/price` returns prices.
* `https://monkstash.com/donate` shows the live tracker (the first scan takes a minute or two).
* Create a stagenet wallet in a private window and let it sync.

## Updating

Copy the new code (step 4), then:

```bash
cd ~/monkstash && docker compose -f deploy/docker-compose.yml up -d --build
```

To roll back, copy the previous version and run the same command.

## The onion mirror (optional)

```bash
docker compose -f deploy/docker-compose.yml --profile onion up -d --build
docker compose -f deploy/docker-compose.yml exec tor cat /var/lib/tor/monkstash/hostname
```

That prints your `.onion` address. Put it in `deploy/.env` as `ONION_LOCATION_HEADER=Onion-Location http://YOUR.onion{uri}` and restart Caddy (`docker compose -f deploy/docker-compose.yml restart caddy`). Tor Browser users then see a ".onion available" button.

The onion keys live in the `tor-keys` volume. **Back them up**: whoever has them can run your onion address. This server only publishes an onion service; it does not relay or exit anyone else's traffic.

## Backups

Two volumes hold state worth keeping:

* `monkstash_web-data`: donation tracker progress (can be rebuilt by rescanning).
* `monkstash_tor-keys`: the onion address keys (cannot be rebuilt).

```bash
docker run --rm -v monkstash_tor-keys:/v -v "$PWD":/b debian:12-slim tar czf /b/tor-keys.tgz -C /v .
```

Store the file somewhere offline. Wallet data is never on the server: wallets live in users' browsers.

## What runs where

| Container | Does | Sees |
|---|---|---|
| `web` | The site, the wallet page, the node relay, prices, OpenAlias lookups, the donation tracker | Visitor IPs and which pages they load; wallet sync requests through the relay (never keys) |
| `caddy` | HTTPS and redirects | Visitor IPs |
| `tor` | The onion address | Nothing about visitors' IPs |

No analytics run on the server, and the wallet page loads no third-party code.
