#!/usr/bin/env bash
# MonkStash Server: your own Monero node on a fresh Debian or Ubuntu server, in one command.
#
#   curl -fsSL https://monkstash.com/server/install.sh -o install.sh
#   sudo bash install.sh install --domain node.example.com
#
# It installs the official Monero release (signature checked against the Monero release key),
# runs a pruned node as a system service, puts its restricted RPC behind HTTPS (Caddy), opens
# only the ports it needs, and adds a status page. After installing, the same script is
# available as `monkstash-server` (status, update, uninstall).
#
# Nothing is sent to MonkStash. The node is yours: no keys, accounts or telemetry.
# Source and tests: https://github.com/90ssolo/monkstash/tree/main/server (BSD-3-Clause).
set -euo pipefail

SCRIPT_VERSION="0.4.0"
SELF_URL="https://monkstash.com/server/install.sh"

# The Monero release signing key (binaryFate), as published by the Monero project.
MONERO_KEY_URL="https://raw.githubusercontent.com/monero-project/monero/master/utils/gpg_keys/binaryfate.asc"
MONERO_KEY_FPR="81AC591FE9C4B65C5806AFC3F0AF4D462A0BDF92"
MONERO_HASHES_URL="https://www.getmonero.org/downloads/hashes.txt"
MONERO_DL_BASE="https://downloads.getmonero.org/cli"

CONF_DIR="/etc/monkstash-server"
CONF_FILE="$CONF_DIR/config"
MONERO_CONF="/etc/monero/monerod.conf"
MONERO_DIR="/opt/monero"
DATA_DIR="/var/lib/monero"
LOG_DIR="/var/log/monero"
WWW_DIR="/var/lib/monkstash-server/www"
BIN="/usr/local/bin/monkstash-server"
DEFAULT_ORIGIN="https://wallet.monkstash.com"

# MonkStash Pay is built on this server from this exact public commit (git checks it by hash).
# A new Pay release is a new commit here, delivered by "monkstash-server self-update".
PAY_REPO="https://github.com/90ssolo/monkstash.git"
PAY_REF="713be1c23ea9675d9a994e7dad77309441e62484"
# Tests build the commit under test instead. Must be a full 40-character commit hash.
if [ -n "${MONKSTASH_PAY_REF:-}" ]; then
  [[ "$MONKSTASH_PAY_REF" =~ ^[0-9a-f]{40}$ ]] || { echo "MONKSTASH_PAY_REF must be a full commit hash" >&2; exit 1; }
  PAY_REF=$MONKSTASH_PAY_REF
fi
PAY_SRC="/opt/monkstash-pay/src"
PAY_ENV="$CONF_DIR/pay.env"
PAY_PORT_LOCAL=8080

# Temporary files live under one directory that is removed on exit, whatever happens.
TMP_ROOT=$(mktemp -d)
trap 'rm -rf "$TMP_ROOT"' EXIT
# If a command fails, say where, so a support request can point at the step.
trap 'printf "error: stopped at line %s (%s). Nothing was half-removed; it is safe to run the command again.
" "$LINENO" "$BASH_COMMAND" >&2' ERR

# ---------------------------------------------------------------------------------------------
# Output

if [ -t 1 ]; then B=$'\e[1m'; G=$'\e[32m'; Y=$'\e[33m'; R=$'\e[31m'; N=$'\e[0m'; else B=""; G=""; Y=""; R=""; N=""; fi
say()  { printf '%s\n' "$*"; }
step() { printf '\n%s==> %s%s\n' "$B" "$*" "$N"; }
ok()   { printf '%s  ok%s %s\n' "$G" "$N" "$*"; }
warn() { printf '%s  warning:%s %s\n' "$Y" "$N" "$*" >&2; }
die()  { printf '%serror:%s %s\n' "$R" "$N" "$*" >&2; exit 1; }

usage() {
  cat <<EOF
MonkStash Server $SCRIPT_VERSION: your own Monero node, in one command.

Usage:
  monkstash-server install [options]   Install or reconfigure the node
  monkstash-server status [--json]     Sync progress, peers, disk, version
  monkstash-server update [--check]    Install a newer Monero release (signature checked)
  monkstash-server self-update         Update this script from $SELF_URL
  monkstash-server pay-info            MonkStash Pay address, API key and webhook secret (root)
  monkstash-server link ...            Payment links and donate buttons (root, see below)
  monkstash-server uninstall [--purge] Remove the services (--purge also deletes the blockchain)

Install options:
  --domain NAME        Public name for the node's HTTPS address (recommended). Without it, an
                       address like 203-0-113-7.sslip.io is used for your server's IP.
  --email ADDRESS      Optional: e-mail for certificate expiry notices (sent to Let's Encrypt)
  --network NET        mainnet (default) or stagenet (free test coins)
  --full               Keep the whole blockchain instead of a pruned copy (needs about 3x the disk)
  --origin URL         Another web wallet allowed to use this node from a browser (repeatable).
                       $DEFAULT_ORIGIN is always allowed.
  --pay                Also install MonkStash Pay (view-only shop payments) at pay.<domain>
  --pay-domain NAME    Address for MonkStash Pay instead of pay.<domain>
  --shop-url URL       Your WooCommerce shop, for example https://shop.example.com: payment
                       webhooks go to its MonkStash Pay plugin
  --shop-name NAME     Shown on the checkout page and in the customer's wallet
  --currency CODE      Price currency for invoices (default EUR)
  --no-firewall        Do not configure ufw
  --auto-update        Check for new Monero releases every day and install them
  --yes                Do not ask for confirmation
  --force              Skip the disk and memory checks

Payment links (MonkStash Pay): one link to share in a chat, email or profile; every payer
gets their own invoice. Leave out --amount and the payer chooses (donations, tips).
  monkstash-server link new "Logo design" --amount 150 [--currency EUR] [--max 1]
  monkstash-server link new "Support my work" --min 2 --suggest 5,10,25
      [--description TEXT] [--expires 2026-12-31] [--return-url https://...]
  monkstash-server link list           Every link with its payments
  monkstash-server link off ID         Stop a link taking payments (link on ID starts it again)

MonkStash Pay asks for your shop wallet's primary address, private VIEW key and restore height
(or reads MONKSTASH_PAY_ADDRESS, MONKSTASH_PAY_VIEW_KEY and MONKSTASH_PAY_RESTORE_HEIGHT).
It can see payments, never spend them. Never enter a seed or spend key.
EOF
}

need_root() { [ "$(id -u)" -eq 0 ] || die "run this as root, for example: sudo bash $0 ${1:-install}"; }

# ---------------------------------------------------------------------------------------------
# Settings, kept in $CONF_FILE so status, update and a later install use the same values.

NETWORK="mainnet"; DOMAIN=""; EMAIL=""; PRUNED=1; ORIGINS=""; FIREWALL=1; AUTO_UPDATE=0; YES=0; FORCE=0
PAY=0; PAY_DOMAIN=""; SHOP_URL=""; SHOP_NAME=""; CURRENCY="EUR"

load_conf() { if [ -f "$CONF_FILE" ]; then # shellcheck disable=SC1090
  . "$CONF_FILE"; fi; }

save_conf() {
  mkdir -p "$CONF_DIR"
  umask 022
  cat > "$CONF_FILE" <<EOF
# Written by monkstash-server $SCRIPT_VERSION. Re-run "monkstash-server install" to change.
NETWORK="$NETWORK"
DOMAIN="$DOMAIN"
EMAIL="$EMAIL"
PRUNED="$PRUNED"
ORIGINS="$ORIGINS"
FIREWALL="$FIREWALL"
AUTO_UPDATE="$AUTO_UPDATE"
PAY="$PAY"
PAY_DOMAIN="$PAY_DOMAIN"
SHOP_URL="$SHOP_URL"
SHOP_NAME="$SHOP_NAME"
CURRENCY="$CURRENCY"
EOF
}

ports() {
  case "$NETWORK" in
    mainnet)  P2P=18080; RPC=18081; RRPC=18089 ;;
    stagenet) P2P=38080; RPC=38081; RRPC=38089 ;;
    *) die "unknown network: $NETWORK (use mainnet or stagenet)" ;;
  esac
}

# ---------------------------------------------------------------------------------------------
# Checks

check_os() {
  [ -r /etc/os-release ] || die "cannot tell which Linux this is (/etc/os-release missing)"
  # shellcheck disable=SC1091
  . /etc/os-release
  case "${ID:-}:${VERSION_ID:-}" in
    debian:12|debian:13|ubuntu:22.04|ubuntu:24.04|ubuntu:26.04) ok "${PRETTY_NAME:-$ID $VERSION_ID}" ;;
    *) [ "$FORCE" -eq 1 ] || die "supported: Debian 12 or 13, Ubuntu 22.04, 24.04 or 26.04 (found ${PRETTY_NAME:-unknown}). Use --force to try anyway."
       warn "untested system: ${PRETTY_NAME:-unknown}" ;;
  esac
  command -v systemctl > /dev/null || die "this script needs systemd"
}

arch_tag() {
  case "$(uname -m)" in
    x86_64|amd64) echo "linux-x64" ;;
    aarch64|arm64) echo "linux-armv8" ;;
    *) die "unsupported processor: $(uname -m) (x86-64 and ARM64 are supported)" ;;
  esac
}

check_resources() {
  local mem_mb need_gb free_gb
  mem_mb=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
  if [ "$mem_mb" -lt 3500 ]; then
    [ "$FORCE" -eq 1 ] || die "the node needs at least 4 GB of memory; this server has ${mem_mb} MB. Use --force to try anyway."
    warn "only ${mem_mb} MB of memory"
  else ok "memory: ${mem_mb} MB"; fi
  # Pruned mainnet is about 105 GiB (October 2026) and grows; full is about 265 GiB.
  if [ "$NETWORK" = mainnet ]; then if [ "$PRUNED" -eq 1 ]; then need_gb=150; else need_gb=400; fi; else need_gb=10; fi
  mkdir -p "$DATA_DIR"
  free_gb=$(df -P -BG "$DATA_DIR" | awk 'NR==2 {gsub("G","",$4); print $4}')
  # A node that is already installed only needs room to grow.
  if [ -d "$DATA_DIR/lmdb" ] || [ -d "$DATA_DIR/stagenet/lmdb" ]; then need_gb=$(( need_gb / 10 )); fi
  if [ "$free_gb" -lt "$need_gb" ]; then
    [ "$FORCE" -eq 1 ] || die "the $NETWORK blockchain needs about ${need_gb} GB free in $DATA_DIR; there are ${free_gb} GB. Use a bigger disk or --force."
    warn "only ${free_gb} GB free, ${need_gb} GB recommended"
  else ok "disk: ${free_gb} GB free (${need_gb} GB needed)"; fi
}

public_ipv4() {
  # The address this server uses to reach the internet, read locally: no outside service is asked.
  ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i = 1; i < NF; i++) if ($i == "src") {print $(i + 1); exit}}'
}

is_private_ip() { case "$1" in 10.*|192.168.*|127.*|169.254.*|172.1[6-9].*|172.2[0-9].*|172.3[01].*|100.6[4-9].*|100.[7-9][0-9].*|100.1[01][0-9].*|100.12[0-7].*|"") return 0 ;; *) return 1 ;; esac; }

pick_domain() {
  if [ -n "$DOMAIN" ]; then ok "address: https://$DOMAIN"; return; fi
  local ip; ip=$(public_ipv4)
  if is_private_ip "$ip"; then
    die "this server's address ($ip) is not public, so it cannot get a certificate by itself. Point a domain at it and pass --domain NAME."
  fi
  DOMAIN="${ip//./-}.sslip.io"
  ok "address: https://$DOMAIN (sslip.io turns the IP into a name; use --domain for your own)"
}

# ---------------------------------------------------------------------------------------------
# Packages

apt_install() { DEBIAN_FRONTEND=noninteractive apt-get install -y -q --no-install-recommends "$@" > /dev/null; }

install_packages() {
  step "Installing packages"
  DEBIAN_FRONTEND=noninteractive apt-get update -q > /dev/null
  apt_install ca-certificates curl gnupg bzip2 tar coreutils iproute2 jq
  [ "$FIREWALL" -eq 1 ] && apt_install ufw
  ok "base packages"
  if ! command -v caddy > /dev/null; then
    # Caddy's official Debian repository, signed by Caddy's key.
    install -d -m 0755 /etc/apt/keyrings
    curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor --yes -o /etc/apt/keyrings/caddy-stable.gpg
    echo "deb [signed-by=/etc/apt/keyrings/caddy-stable.gpg] https://dl.cloudsmith.io/public/caddy/stable/deb/debian any-version main" > /etc/apt/sources.list.d/caddy-stable.list
    DEBIAN_FRONTEND=noninteractive apt-get update -q > /dev/null
    apt_install caddy
  fi
  ok "caddy $(caddy version 2>/dev/null | awk '{print $1}')"
}

# ---------------------------------------------------------------------------------------------
# Monero release: signed hashes, checked key, checked archive

# Prints "<version> <sha256> <file>" for this machine from the signed hash list, after checking
# the signature with the pinned release key. Fails if anything does not match.
latest_release() {
  local tmp tag fpr
  tmp=$(mktemp -d -p "$TMP_ROOT")
  tag=$(arch_tag)
  curl -fsSL "$MONERO_KEY_URL" -o "$tmp/key.asc" || die "could not download the Monero release key"
  curl -fsSL "$MONERO_HASHES_URL" -o "$tmp/hashes.txt" || die "could not download the signed hash list"
  export GNUPGHOME="$tmp/gnupg"; mkdir "$GNUPGHOME"; chmod 700 "$GNUPGHOME" 2> /dev/null || true
  gpg --batch --quiet --import "$tmp/key.asc" 2> /dev/null
  fpr=$(gpg --batch --with-colons --fingerprint 2> /dev/null | awk -F: '/^fpr/ {print $10; exit}')
  [ "$fpr" = "$MONERO_KEY_FPR" ] || die "the downloaded release key has fingerprint $fpr, expected $MONERO_KEY_FPR. Stopping."
  # Only the signed text counts: gpg writes exactly the part the signature covers, so lines added
  # before or after the signed block (by whoever controls the download server) are ignored.
  gpg --batch --yes --status-fd 3 --output "$tmp/signed.txt" --decrypt "$tmp/hashes.txt" 3> "$tmp/status" 2> /dev/null || true
  grep -q "^\[GNUPG:\] VALIDSIG $MONERO_KEY_FPR " "$tmp/status" \
    || die "the hash list is not signed by the Monero release key. Stopping."
  unset GNUPGHOME
  local found
  found=$(awk -v tag="$tag" '$2 ~ "^monero-" tag "-v[0-9.]+\\.tar\\.bz2$" {v = $2; sub("^monero-" tag "-v", "", v); sub("\\.tar\\.bz2$", "", v); print v, $1, $2}' "$tmp/signed.txt")
  [ -n "$found" ] || die "no Monero release for $tag in the signed hash list"
  [ "$(printf '%s\n' "$found" | wc -l)" -eq 1 ] || die "the signed hash list names more than one Monero release for $tag. Stopping."
  printf '%s\n' "$found"
}

# True when version $1 is lower than version $2 (dotted numbers).
version_lt() { [ "$1" != "$2" ] && [ "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -n 1)" = "$1" ]; }

installed_version() { readlink "$MONERO_DIR/current" 2> /dev/null | sed -n 's#.*/v\{0,1\}\([0-9.]*\)$#\1#p'; }

install_release() {
  local version="$1" sha="$2" file="$3" tmp got dir
  dir="$MONERO_DIR/$version"
  if [ -x "$dir/monerod" ]; then ok "Monero $version already present"; else
    tmp=$(mktemp -d -p "$TMP_ROOT")
    curl -fsSL "$MONERO_DL_BASE/$file" -o "$tmp/$file" || die "could not download $file"
    got=$(sha256sum "$tmp/$file" | awk '{print $1}')
    [ "$got" = "$sha" ] || die "$file has SHA-256 $got, but the signed list says $sha. Stopping."
    ok "Monero $version: signature and SHA-256 match"
    mkdir -p "$tmp/x"; tar -xjf "$tmp/$file" -C "$tmp/x"
    mkdir -p "$dir"; cp "$tmp"/x/*/monerod "$dir/"; chmod 0755 "$dir/monerod"
  fi
  ln -sfn "$dir" "$MONERO_DIR/current.new" && mv -Tf "$MONERO_DIR/current.new" "$MONERO_DIR/current"
}

# ---------------------------------------------------------------------------------------------
# Configuration files

write_monero_conf() {
  local allowed="$DEFAULT_ORIGIN"
  for o in $ORIGINS; do [ "$o" = "$DEFAULT_ORIGIN" ] || allowed="$allowed,$o"; done
  mkdir -p /etc/monero
  cat > "$MONERO_CONF" <<EOF
# Written by monkstash-server. Re-run "monkstash-server install" to change; edits here are replaced.
data-dir=$DATA_DIR
log-file=$LOG_DIR/monerod.log
log-level=0
max-log-file-size=10000000
max-log-files=5
$([ "$NETWORK" = stagenet ] && echo "stagenet=1")
$([ "$PRUNED" -eq 1 ] && printf 'prune-blockchain=1\nsync-pruned-blocks=1')

# Peers: other nodes connect here.
p2p-bind-ip=0.0.0.0
p2p-bind-port=$P2P
out-peers=32
in-peers=64
no-igd=1
enable-dns-blocklist=1

# Full RPC for this server only (status and admin).
rpc-bind-ip=127.0.0.1
rpc-bind-port=$RPC

# Restricted RPC for wallets, reached through Caddy's HTTPS. It cannot change the node.
rpc-restricted-bind-ip=127.0.0.1
rpc-restricted-bind-port=$RRPC
rpc-access-control-origins=$allowed
no-zmq=1
EOF
  chmod 0644 "$MONERO_CONF"
}

write_units() {
  cat > /etc/systemd/system/monerod.service <<EOF
[Unit]
Description=Monero node (MonkStash Server)
After=network-online.target
Wants=network-online.target

[Service]
User=monero
Group=monero
ExecStart=$MONERO_DIR/current/monerod --config-file $MONERO_CONF --non-interactive
Restart=on-failure
RestartSec=10
TimeoutStopSec=120
LimitNOFILE=65536
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=$DATA_DIR $LOG_DIR
ProtectKernelTunables=yes
ProtectControlGroups=yes
RestrictSUIDSGID=yes

[Install]
WantedBy=multi-user.target
EOF

  cat > /etc/systemd/system/monkstash-status.service <<EOF
[Unit]
Description=MonkStash Server status page

[Service]
Type=oneshot
ExecStart=$BIN status --write $WWW_DIR/status.json
EOF
  cat > /etc/systemd/system/monkstash-status.timer <<EOF
[Unit]
Description=Refresh the MonkStash Server status page every minute

[Timer]
OnBootSec=30
OnUnitActiveSec=60

[Install]
WantedBy=timers.target
EOF

  cat > /etc/systemd/system/monkstash-update.service <<EOF
[Unit]
Description=Install a newer Monero release if there is one (signature checked)

[Service]
Type=oneshot
ExecStart=$BIN update
EOF
  cat > /etc/systemd/system/monkstash-update.timer <<EOF
[Unit]
Description=Daily check for a new Monero release

[Timer]
OnCalendar=daily
RandomizedDelaySec=6h
Persistent=true

[Install]
WantedBy=timers.target
EOF
}

write_caddy() {
  {
    echo "# Written by monkstash-server. Re-run \"monkstash-server install\" to change."
    if [ -n "$EMAIL" ]; then printf '{\n\temail %s\n}\n\n' "$EMAIL"; fi
    cat <<EOF
$DOMAIN {
	# No access log: the node does not record who connects.
	header {
		-Server
		Strict-Transport-Security "max-age=31536000"
		X-Content-Type-Options nosniff
		Referrer-Policy no-referrer
	}
	handle /status {
		root * $WWW_DIR
		rewrite * /status.html
		header Content-Security-Policy "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
		file_server
	}
	@assets path /status.json /status.js /status.css
	handle @assets {
		root * $WWW_DIR
		header Cache-Control no-store
		file_server
	}
	handle {
		reverse_proxy 127.0.0.1:$RRPC
	}
}
EOF
    if [ "$PAY" -eq 1 ]; then cat <<EOF

# MonkStash Pay: checkout pages and the shop API. Pay sets its own security headers.
$PAY_DOMAIN {
	header -Server
	reverse_proxy 127.0.0.1:$PAY_PORT_LOCAL
}
EOF
    fi
  } > /etc/caddy/Caddyfile
}

write_status_page() {
  mkdir -p "$WWW_DIR"
  cat > "$WWW_DIR/status.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Monero node status</title>
<link rel="stylesheet" href="/status.css">
</head>
<body>
<main>
  <p class="kicker">MonkStash Server</p>
  <h1>Your Monero node</h1>
  <p id="state" class="state">Reading the node…</p>
  <div class="bar" aria-hidden="true"><span id="fill"></span></div>
  <dl id="facts"></dl>
  <section class="use">
    <h2>Use it in MonkStash</h2>
    <p>Open your wallet, go to <b>Settings</b>, <b>Connection</b>, choose your own node and paste:</p>
    <p class="addr"><code id="url"></code> <button type="button" id="copy">Copy</button></p>
    <p class="small">Wait until it says <b>Up to date</b> here first. Other wallets (Feather, Cake, Monero GUI) can use the same address.</p>
  </section>
  <p class="small">Updated every minute. This page shows no wallet or payment data.</p>
</main>
<script src="/status.js"></script>
</body>
</html>
EOF
  cat > "$WWW_DIR/status.css" <<'EOF'
:root { --bg: #edeee6; --surface: #fbfbf7; --ink: #1b2a22; --ink2: #415249; --line: #c7c8bb; --forest: #1f4733; --clay: #9a4420; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width: 640px; margin: 40px auto; padding: 28px 24px; background: var(--surface); border: 1px solid var(--line); border-top: 3px solid var(--forest); border-radius: 0 0 10px 10px; }
.kicker { margin: 0; font-size: .75rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--clay); }
h1 { margin: 6px 0 14px; font: 600 1.9rem/1.2 Georgia, "Times New Roman", serif; }
h2 { margin: 0 0 8px; font: 600 1.2rem/1.3 Georgia, serif; }
.state { margin: 0 0 10px; font-weight: 650; }
.bar { height: 10px; background: #dfe0d6; border-radius: 6px; overflow: hidden; margin-bottom: 18px; }
.bar span { display: block; height: 100%; width: 0; background: var(--forest); transition: width .4s; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 18px; margin: 0 0 22px; }
dt { color: var(--ink2); font-size: .9rem; } dd { margin: 0; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.use { padding: 16px; background: var(--bg); border-radius: 8px; margin-bottom: 16px; }
.use p { margin: 0 0 10px; }
.addr { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
code { font: .9rem ui-monospace, Menlo, Consolas, monospace; background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: 4px 8px; overflow-wrap: anywhere; }
button { font: inherit; font-size: .85rem; font-weight: 600; padding: 5px 12px; border: 1px solid var(--forest); border-radius: 6px; background: var(--surface); color: var(--forest); cursor: pointer; }
button:focus-visible { outline: 2px solid var(--clay); outline-offset: 2px; }
.small { font-size: .85rem; color: var(--ink2); margin: 0; }
.good { color: var(--forest); } .wait { color: var(--clay); }
@media (max-width: 680px) { main { margin: 0; border-radius: 0; min-height: 100vh; } }
EOF
  cat > "$WWW_DIR/status.js" <<'EOF'
const $ = (id) => document.getElementById(id);
const url = location.origin;
$("url").textContent = url;
$("copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(url); $("copy").textContent = "Copied"; } catch { $("copy").textContent = "Copy failed"; }
  setTimeout(() => { $("copy").textContent = "Copy"; }, 1800);
});
const gb = (n) => (n / 1e9).toFixed(1) + " GB";
async function load() {
  try {
    const s = await (await fetch("/status.json", { cache: "no-store" })).json();
    const pct = s.target ? Math.min(100, Math.floor((s.height / s.target) * 1000) / 10) : 0;
    const st = $("state");
    if (!s.running) { st.textContent = "The node is not running."; st.className = "state wait"; }
    else if (s.synced) { st.textContent = "Up to date"; st.className = "state good"; }
    else { st.textContent = `Syncing: ${pct}% (about ${Math.max(0, s.target - s.height).toLocaleString()} blocks to go)`; st.className = "state wait"; }
    $("fill").style.width = (s.synced ? 100 : pct) + "%";
    const rows = [
      ["Network", s.network], ["Height", s.height ? s.height.toLocaleString() : "starting"], ["Connections", `${s.out_peers} out, ${s.in_peers} in`],
      ["Blockchain", s.pruned ? "pruned" : "full"], ["Database", s.db_size ? gb(s.db_size) : "n/a"], ["Disk free", s.free_space ? gb(s.free_space) : "n/a"],
      ["Monero", s.version + (s.update_available ? " (update available)" : "")],
      ...(s.pay && s.pay !== "off" ? [["Payments", { ready: "MonkStash Pay is ready", syncing: "MonkStash Pay is scanning", running: "MonkStash Pay is running", down: "MonkStash Pay is not answering" }[s.pay] || s.pay]] : []),
      ["Checked", new Date(s.checked_at).toLocaleString()],
    ];
    $("facts").replaceChildren(...rows.flatMap(([k, v]) => { const dt = document.createElement("dt"); dt.textContent = k; const dd = document.createElement("dd"); dd.textContent = v; return [dt, dd]; }));
  } catch { $("state").textContent = "Status is not available yet. It appears a minute after the install."; }
}
load(); setInterval(load, 30000);
EOF
  chmod 0644 "$WWW_DIR"/status.*
}

configure_firewall() {
  [ "$FIREWALL" -eq 1 ] || { warn "firewall not configured (--no-firewall)"; return; }
  local ssh_ports p
  # Every port sshd really listens on (sshd -T lists each Port line; a socket-activated sshd can
  # listen elsewhere, so the listening sockets count too), so the firewall never locks you out.
  # sshd -T can fail (no host keys yet, or no sshd at all); then the usual port 22 is kept open.
  ssh_ports=$( { { sshd -T 2> /dev/null || true; } | awk '/^port / {print $2}'
    { ss -Hltnp 2> /dev/null || true; } | awk '/"sshd"|sshd/ {n = split($4, a, ":"); print a[n]}'; } | sort -un)
  for p in $ssh_ports; do case "$p" in *[!0-9]*) ;; *) ufw allow "$p/tcp" comment "SSH" > /dev/null ;; esac; done
  [ -n "$ssh_ports" ] || { ssh_ports=22; ufw allow 22/tcp comment "SSH" > /dev/null; }
  ufw allow 80/tcp comment "HTTPS certificate" > /dev/null
  ufw allow 443/tcp comment "Monero node over HTTPS" > /dev/null
  ufw allow "$P2P/tcp" comment "Monero peers" > /dev/null
  ufw default deny incoming > /dev/null
  ufw default allow outgoing > /dev/null
  ufw --force enable > /dev/null
  ok "firewall: SSH ($(echo $ssh_ports | tr ' ' ',')), 80, 443 and $P2P open; everything else closed"
}

# ---------------------------------------------------------------------------------------------
# MonkStash Pay

env_get() { [ -r "$PAY_ENV" ] && sed -n "s/^$1=//p" "$PAY_ENV" | head -n 1; return 0; }

# The shop wallet, from the environment, the existing settings, or questions on this terminal.
collect_pay_wallet() {
  PAY_ADDRESS="${MONKSTASH_PAY_ADDRESS:-$(env_get PAY_ADDRESS)}"
  PAY_VIEW_KEY="${MONKSTASH_PAY_VIEW_KEY:-$(env_get PAY_VIEW_KEY)}"
  PAY_HEIGHT="${MONKSTASH_PAY_RESTORE_HEIGHT:-$(env_get PAY_RESTORE_HEIGHT)}"
  if [ -z "$PAY_ADDRESS" ] || [ -z "$PAY_VIEW_KEY" ] || [ -z "$PAY_HEIGHT" ]; then
    [ -t 0 ] || die "MonkStash Pay needs the shop wallet: set MONKSTASH_PAY_ADDRESS, MONKSTASH_PAY_VIEW_KEY and MONKSTASH_PAY_RESTORE_HEIGHT, or run this on a terminal"
    say ""
    say "MonkStash Pay watches your shop wallet with its VIEW key: it can see payments, never spend them."
    say "Never enter your recovery words or spend key here. Use a wallet only for the shop."
    [ -n "$PAY_ADDRESS" ] || { printf 'Shop wallet primary address: '; read -r PAY_ADDRESS; }
    [ -n "$PAY_VIEW_KEY" ] || { printf 'Private view key (not shown): '; read -rs PAY_VIEW_KEY; printf '\n'; }
    [ -n "$PAY_HEIGHT" ] || { printf 'Restore height (block when the wallet was made, or a little earlier): '; read -r PAY_HEIGHT; }
  fi
  local prefix=4; [ "$NETWORK" = stagenet ] && prefix=5
  PAY_ADDRESS=$(printf '%s' "$PAY_ADDRESS" | tr -d '[:space:]')
  PAY_VIEW_KEY=$(printf '%s' "$PAY_VIEW_KEY" | tr -d '[:space:]' | tr 'A-F' 'a-f')
  case "$PAY_ADDRESS" in "$prefix"*) ;; *) die "a $NETWORK primary address starts with $prefix" ;; esac
  [ "${#PAY_ADDRESS}" -eq 95 ] || die "a primary address has 95 characters (this one has ${#PAY_ADDRESS}); subaddresses and integrated addresses do not work here"
  case "$PAY_ADDRESS" in *[!123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]*) die "the address has characters a Monero address cannot have" ;; esac
  [ "${#PAY_VIEW_KEY}" -eq 64 ] || die "a private view key is 64 characters of 0-9 and a-f"
  case "$PAY_VIEW_KEY" in *[!0-9a-f]*) die "a private view key is 64 characters of 0-9 and a-f" ;; esac
  case "$PAY_HEIGHT" in ""|*[!0-9]*) die "the restore height is a block number, like 3500000" ;; esac
  ok "shop wallet ${PAY_ADDRESS:0:8}...${PAY_ADDRESS: -6}, scanning from block $PAY_HEIGHT"
}

install_docker() {
  if ! command -v docker > /dev/null; then apt_install docker.io; fi
  command -v git > /dev/null || apt_install git
  systemctl enable --now docker > /dev/null 2>&1
  ok "docker $(docker version --format '{{.Server.Version}}' 2> /dev/null)"
}

pay_tag() { echo "monkstash-pay:${PAY_REF:0:12}"; }

build_pay() {
  local tag; tag=$(pay_tag)
  if docker image inspect "$tag" > /dev/null 2>&1; then ok "MonkStash Pay ${PAY_REF:0:12} already built"; return; fi
  [ -d "$PAY_SRC/.git" ] || git clone --quiet "$PAY_REPO" "$PAY_SRC"
  git -C "$PAY_SRC" fetch --quiet origin "$PAY_REF" 2> /dev/null || git -C "$PAY_SRC" fetch --quiet origin
  git -C "$PAY_SRC" -c advice.detachedHead=false checkout --quiet --force "$PAY_REF"
  [ "$(git -C "$PAY_SRC" rev-parse HEAD)" = "$PAY_REF" ] || die "could not check out MonkStash Pay at $PAY_REF"
  say "  building MonkStash Pay from ${PAY_REF:0:12} (a few minutes)..."
  docker build --quiet -f "$PAY_SRC/apps/pay/Dockerfile" -t "$tag" "$PAY_SRC" > /dev/null || die "the MonkStash Pay build failed"
  ok "MonkStash Pay built from public commit ${PAY_REF:0:12}"
}

write_pay_env() {
  local api secret webhook=""
  api=$(env_get PAY_API_KEY); [ -n "$api" ] || api=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')
  secret=$(env_get PAY_WEBHOOK_SECRET); [ -n "$secret" ] || secret=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')
  [ -n "$SHOP_URL" ] && webhook="${SHOP_URL%/}/wp-json/monkstash-pay/v1/webhook"
  install -d -m 0700 "$CONF_DIR"
  umask 077
  cat > "$PAY_ENV.tmp" <<EOF
# MonkStash Pay settings, written by monkstash-server. Secret: readable by root only.
PAY_NETWORK=$NETWORK
PAY_ADDRESS=$PAY_ADDRESS
PAY_VIEW_KEY=$PAY_VIEW_KEY
PAY_RESTORE_HEIGHT=$PAY_HEIGHT
PAY_NODE_URL=http://127.0.0.1:$RRPC
PAY_API_KEY=$api
PAY_WEBHOOK_URL=$webhook
PAY_WEBHOOK_SECRET=$secret
PAY_PUBLIC_URL=https://$PAY_DOMAIN
PAY_HOST=127.0.0.1
PAY_PORT=$PAY_PORT_LOCAL
PAY_TRUST_PROXY=1
PAY_SHOP_NAME=$SHOP_NAME
PAY_CURRENCY=$CURRENCY
PAY_CONFIRMATIONS=standard
EOF
  mv -f "$PAY_ENV.tmp" "$PAY_ENV"; chmod 0600 "$PAY_ENV"
  umask 022
  # The config directory holds the secrets now; the plain settings file stays readable.
  chmod 0755 "$CONF_DIR"; [ -f "$CONF_FILE" ] && chmod 0644 "$CONF_FILE"
}

write_pay_unit() {
  cat > /etc/systemd/system/monkstash-pay.service <<EOF
[Unit]
Description=MonkStash Pay (view-only shop payments)
After=docker.service monerod.service network-online.target
Requires=docker.service

[Service]
ExecStartPre=-/usr/bin/docker rm -f monkstash-pay
ExecStart=/usr/bin/docker run --rm --name monkstash-pay --network host --env-file $PAY_ENV -v monkstash-pay-data:/data --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges $(pay_tag)
ExecStop=/usr/bin/docker stop -t 30 monkstash-pay
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
}

# "ready", "syncing" (waiting for its first wallet scan), "down", "running" (seen without the
# API key, for a non-root status) or "off".
pay_state() {
  [ -f /etc/systemd/system/monkstash-pay.service ] || { echo off; return; }
  if [ ! -r "$PAY_ENV" ]; then systemctl is-active --quiet monkstash-pay && echo running || echo down; return; fi
  local h; h=$(curl -s --max-time 5 -H "Authorization: Bearer $(env_get PAY_API_KEY)" "http://127.0.0.1:$PAY_PORT_LOCAL/api/health" || true)
  if [ -z "$h" ]; then echo down; elif jq -e '.ok == true' > /dev/null 2>&1 <<< "$h"; then echo ready; else echo syncing; fi
}

cmd_pay_info() {
  load_conf; need_root pay-info
  [ -r "$PAY_ENV" ] || die "MonkStash Pay is not installed (add it with: monkstash-server install --pay)"
  say "MonkStash Pay:     https://$PAY_DOMAIN   (state: $(pay_state))"
  say "Webhooks go to:    $(env_get PAY_WEBHOOK_URL | grep . || echo "not set (add --shop-url)")"
  say "Dashboard:         https://$PAY_DOMAIN/admin   (sign in with the API key below)"
  say ""
  say "In WooCommerce (Payments, MonkStash Pay):"
  say "  MonkStash Pay server:  https://$PAY_DOMAIN"
  say "  API key:               $(env_get PAY_API_KEY)"
  say "  Webhook secret:        $(env_get PAY_WEBHOOK_SECRET)"
  say "  Behind a trusted proxy: leave off unless your shop is behind a proxy or CDN"
  say ""
  say "Keep these two secrets private. Anyone with the API key can create invoices for your shop."
}

# Calls this server's own MonkStash Pay API. Prints the JSON reply; fails with Pay's message.
pay_api() {
  local method=$1 path=$2 body=${3:-} out code data=()
  [ -n "$body" ] && data=(--data "$body")
  out=$(mktemp -p "$TMP_ROOT")
  code=$(curl -s --max-time 20 -o "$out" -w '%{http_code}' -X "$method" \
    -H "Authorization: Bearer $(env_get PAY_API_KEY)" -H "Content-Type: application/json" \
    "${data[@]}" "http://127.0.0.1:$PAY_PORT_LOCAL$path" || true)
  if [ "${code:0:1}" != "2" ]; then
    local msg; msg=$(jq -r '.error // empty' "$out" 2> /dev/null)
    rm -f "$out"
    die "MonkStash Pay answered ${code:-nothing}${msg:+: $msg}"
  fi
  cat "$out"; rm -f "$out"
}

print_link() {
  jq -r '
    "\(.title)\(if .active then "" else "   (switched off)" end)",
    "  Link:      \(.url)",
    "  QR code:   \(.qrUrl)",
    "  Price:     \(if .amount then "\(.amount) \(.currency)" else "payer chooses (\(.currency))\(if .minAmount then ", at least \(.minAmount)" else "" end)" end)\(if .maxPayments then ", at most \(.maxPayments) payment(s)" else "" end)\(if .expiresAt then ", until \(.expiresAt)" else "" end)",
    "  Payments:  \(.stats.paid) paid, \(.stats.receivedXmr) XMR\(if .stats.open > 0 then ", \(.stats.open) waiting" else "" end)",
    "  Id:        \(.id)"'
}

cmd_link() {
  load_conf; need_root link
  [ -r "$PAY_ENV" ] || die "MonkStash Pay is not installed (add it with: monkstash-server install --pay)"
  local sub=${1:-}; shift || true
  case "$sub" in
    new)
      local title=${1:-}; [ -n "$title" ] && [ "${title:0:2}" != "--" ] || die 'give the link a title, for example: monkstash-server link new "Logo design" --amount 150'
      shift
      local amount="" currency="" min="" suggest="" max="" desc="" expires="" ret=""
      while [ $# -gt 0 ]; do
        case "$1" in
          --amount) amount="${2:?}"; shift ;;
          --currency) currency=$(printf '%s' "${2:?}" | tr 'a-z' 'A-Z'); shift ;;
          --min) min="${2:?}"; shift ;;
          --suggest) suggest="${2:?}"; shift ;;
          --max) max="${2:?}"; shift ;;
          --description) desc="${2:?}"; shift ;;
          --expires) expires="${2:?}"; shift ;;
          --return-url) ret="${2:?}"; shift ;;
          *) die "unknown option for link new: $1" ;;
        esac
        shift
      done
      case "$max" in ""|*[!0-9]*) [ -z "$max" ] || die "--max must be a whole number" ;; esac
      # A bare date means the end of that day (UTC).
      case "$expires" in ????-??-??) expires="${expires}T23:59:59Z" ;; esac
      local body
      body=$(jq -n --arg title "$title" --arg amount "$amount" --arg currency "$currency" --arg min "$min" \
        --arg suggest "$suggest" --arg max "$max" --arg desc "$desc" --arg expires "$expires" --arg ret "$ret" '
        {title: $title}
        + (if $amount != "" then {amount: $amount} else {} end)
        + (if $currency != "" then {currency: $currency} else {} end)
        + (if $min != "" then {minAmount: $min} else {} end)
        + (if $suggest != "" then {suggested: ($suggest | split(",") | map(gsub("^ +| +$"; "")))} else {} end)
        + (if $max != "" then {maxPayments: ($max | tonumber)} else {} end)
        + (if $desc != "" then {description: $desc} else {} end)
        + (if $expires != "" then {expiresAt: $expires} else {} end)
        + (if $ret != "" then {returnUrl: $ret} else {} end)')
      local link; link=$(pay_api POST /api/links "$body")
      ok "payment link created"
      print_link <<< "$link"
      say ""
      say "Button for your website (plain HTML, no script):"
      jq -r '.buttonHtml' <<< "$link"
      ;;
    list|"")
      local all; all=$(pay_api GET /api/links)
      if [ "$(jq '.links | length' <<< "$all")" -eq 0 ]; then say 'No payment links yet. Create one with: monkstash-server link new "Title" --amount 10'; return 0; fi
      jq -c '.links[]' <<< "$all" | while IFS= read -r l; do print_link <<< "$l"; say ""; done
      ;;
    off|on)
      local id=${1:-}; [[ "$id" =~ ^[A-Za-z0-9_-]{16,64}$ ]] || die "give the link id, from: monkstash-server link list"
      local active=false; [ "$sub" = on ] && active=true
      pay_api PATCH "/api/links/$id" "{\"active\": $active}" | print_link
      ;;
    *) die "unknown link command: $sub (use new, list, off or on)" ;;
  esac
}

# ---------------------------------------------------------------------------------------------
# Commands

cmd_install() {
  load_conf
  while [ $# -gt 0 ]; do
    case "$1" in
      --domain) DOMAIN="${2:?}"; shift ;;
      --email) EMAIL="${2:?}"; shift ;;
      --network) NETWORK="${2:?}"; shift ;;
      --full) PRUNED=0 ;;
      --pruned) PRUNED=1 ;;
      --origin) case "$2" in https://*[!A-Za-z0-9.:/-]*) die "--origin may only contain letters, digits, dots, dashes, colons and slashes" ;; https://?*) ORIGINS="$ORIGINS ${2%/}" ;; *) die "--origin must start with https://" ;; esac; shift ;;
      --pay) PAY=1 ;;
      --no-pay) PAY=0 ;;
      --pay-domain) PAY_DOMAIN="${2:?}"; shift ;;
      --shop-url) case "$2" in https://*[!A-Za-z0-9._~:/?#@\&=%+,-]*) die "--shop-url may only contain letters, digits and . _ ~ : / ? # @ & = % + , -" ;; https://?*) SHOP_URL="${2%/}" ;; *) die "--shop-url must start with https://" ;; esac; shift ;;
      --shop-name) SHOP_NAME="${2:?}"; shift ;;
      --currency) CURRENCY=$(printf '%s' "${2:?}" | tr 'a-z' 'A-Z'); shift ;;
      --no-firewall) FIREWALL=0 ;;
      --auto-update) AUTO_UPDATE=1 ;;
      --no-auto-update) AUTO_UPDATE=0 ;;
      --yes|-y) YES=1 ;;
      --force) FORCE=1 ;;
      -h|--help) usage; exit 0 ;;
      *) die "unknown option: $1 (see --help)" ;;
    esac
    shift
  done
  need_root install
  # The script copies itself into place as the monkstash-server command, so it must be a file.
  [ -f "$0" ] || die "download the script first: curl -fsSL $SELF_URL -o install.sh && sudo bash install.sh install"
  ports

  step "Checking this server"
  check_os
  check_resources
  pick_domain
  case "$DOMAIN" in ""|*[!A-Za-z0-9.-]*|.*|*..*) die "invalid domain: $DOMAIN" ;; esac
  # The settings file is read back by the shell, and the address goes into the Caddyfile.
  case "$EMAIL" in "") ;; *[!A-Za-z0-9._%+@-]*|*@*@*|@*|*@) die "invalid --email: $EMAIL" ;; *@*.*) ;; *) die "invalid --email: $EMAIL" ;; esac
  if [ "$PAY" -eq 1 ]; then
    [ -n "$PAY_DOMAIN" ] || PAY_DOMAIN="pay.$DOMAIN"
    case "$PAY_DOMAIN" in *[!A-Za-z0-9.-]*|.*|*..*) die "invalid --pay-domain: $PAY_DOMAIN" ;; esac
    case "$SHOP_NAME" in *[[:cntrl:]]*|*'"'*|*'$'*|*'`'*|*'\'*) die "the shop name cannot contain quotes, \$, backticks, backslashes or control characters" ;; esac
    case "$CURRENCY" in [A-Z][A-Z][A-Z]) ;; *) die "--currency is a three-letter code like EUR or USD" ;; esac
    collect_pay_wallet
    ok "MonkStash Pay at https://$PAY_DOMAIN$([ -n "$SHOP_URL" ] && echo ", webhooks to $SHOP_URL")"
  fi

  if [ "$YES" -ne 1 ] && [ -t 0 ]; then
    say ""
    say "This will install a $([ "$PRUNED" -eq 1 ] && echo pruned || echo full) $NETWORK Monero node reachable at https://$DOMAIN,"
    [ "$PAY" -eq 1 ] && say "MonkStash Pay at https://$PAY_DOMAIN,"
    say "$([ "$FIREWALL" -eq 1 ] && echo "turn on the firewall (SSH stays open), ")and start syncing. Continue? [y/N]"
    read -r answer; case "$answer" in y|Y|yes) ;; *) die "stopped" ;; esac
  fi

  install_packages

  step "Installing Monero"
  id monero > /dev/null 2>&1 || useradd --system --home-dir "$DATA_DIR" --shell /usr/sbin/nologin monero
  install -d -o monero -g monero -m 0750 "$DATA_DIR" "$LOG_DIR"
  local rel; rel=$(latest_release)
  # shellcheck disable=SC2086
  install_release $rel

  if [ "$PAY" -eq 1 ]; then
    step "Installing MonkStash Pay"
    install_docker
    build_pay
  fi

  step "Configuring"
  # This script becomes the monkstash-server command.
  if [ "$(readlink -f "$0")" != "$BIN" ]; then install -m 0755 "$0" "$BIN"; fi
  save_conf
  write_monero_conf
  write_units
  write_status_page
  if [ "$PAY" -eq 1 ]; then write_pay_env; write_pay_unit; fi
  write_caddy
  caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile > /dev/null 2>&1 || die "the web server settings are not valid (caddy validate)"
  ok "settings written"
  configure_firewall

  step "Starting"
  systemctl daemon-reload
  systemctl enable --now monerod.service > /dev/null 2>&1
  systemctl restart monerod.service
  systemctl enable --now monkstash-status.timer > /dev/null 2>&1
  if [ "$AUTO_UPDATE" -eq 1 ]; then systemctl enable --now monkstash-update.timer > /dev/null 2>&1; ok "daily Monero updates on"
  else systemctl disable --now monkstash-update.timer > /dev/null 2>&1 || true; fi
  if [ "$PAY" -eq 1 ]; then
    systemctl enable monkstash-pay.service > /dev/null 2>&1; systemctl restart monkstash-pay.service
    ok "MonkStash Pay running (it starts answering once the node and its first wallet scan are done)"
  elif [ -f /etc/systemd/system/monkstash-pay.service ]; then
    systemctl disable --now monkstash-pay.service > /dev/null 2>&1 || true; rm -f /etc/systemd/system/monkstash-pay.service; systemctl daemon-reload
  fi
  systemctl reload caddy 2> /dev/null || systemctl restart caddy
  ok "node, status page and HTTPS running"
  "$BIN" status --write "$WWW_DIR/status.json" > /dev/null 2>&1 || true

  say ""
  say "${B}Done.${N} Your node is syncing. That takes about 1 to 3 days on mainnet."
  say ""
  say "  Node address:  https://$DOMAIN"
  say "  Status page:   https://$DOMAIN/status"
  say "  In MonkStash:  Settings, Connection, use your own node, paste the address above"
  say ""
  if [ "$PAY" -eq 1 ]; then
    say "  MonkStash Pay:   https://$PAY_DOMAIN"
    say "  Shop settings:   sudo monkstash-server pay-info   (API key and webhook secret for the plugin)"
    [ -n "$SHOP_URL" ] || say "  Webhooks:        not set yet; run install again with --shop-url https://your-shop"
  fi
  say ""
  say "  Check progress:  monkstash-server status"
  say "  Update Monero:   monkstash-server update"
}

rpc() { curl -fsS --max-time 10 "http://127.0.0.1:$RPC/$1"; }

status_json() {
  local info running=false
  if systemctl is-active --quiet monerod.service && info=$(rpc get_info 2> /dev/null); then running=true; else info='{}'; fi
  jq -n --argjson i "$info" --argjson running "$running" --arg network "$NETWORK" --arg now "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg pruned "$PRUNED" --arg pay "$(pay_state)" '{
    pay: $pay,
    running: $running, network: $network, pruned: ($pruned == "1"),
    height: ($i.height // 0), target: ([($i.target_height // 0), ($i.height // 0)] | max),
    synced: (($i.synchronized // false) and (($i.height // 0) >= ($i.target_height // 0))),
    out_peers: ($i.outgoing_connections_count // 0), in_peers: ($i.incoming_connections_count // 0),
    db_size: ($i.database_size // 0), free_space: ($i.free_space // 0),
    version: ($i.version // "unknown"), update_available: ($i.update_available // false), checked_at: $now }'
}

cmd_status() {
  load_conf; ports
  local write="" json=0
  while [ $# -gt 0 ]; do case "$1" in --json) json=1 ;; --write) write="${2:?}"; shift ;; *) die "unknown option: $1" ;; esac; shift; done
  local s; s=$(status_json)
  if [ -n "$write" ]; then printf '%s\n' "$s" > "$write.tmp" && mv -f "$write.tmp" "$write"; chmod 0644 "$write"; return; fi
  if [ "$json" -eq 1 ]; then printf '%s\n' "$s"; return; fi
  jq -r '
    (if .running | not then "Node: not running (see: journalctl -u monerod)"
     elif .synced then "Node: up to date"
     else "Node: syncing, \(if .target > 0 then ((.height * 1000 / .target | floor) / 10) else 0 end)% (\(.target - .height) blocks to go)" end),
    "Network:     \(.network)\(if .pruned then ", pruned" else "" end)",
    "Height:      \(.height) of \(.target)",
    "Connections: \(.out_peers) out, \(.in_peers) in",
    "Database:    \(.db_size / 1e9 * 10 | floor / 10) GB, \(.free_space / 1e9 | floor) GB free",
    "Monero:      \(.version)\(if .update_available then " (update available: monkstash-server update)" else "" end)",
    (if .pay != "off" then "Payments:    MonkStash Pay \(.pay)" else empty end)' <<< "$s"
  [ -n "$DOMAIN" ] && say "Address:     https://$DOMAIN   (status page: https://$DOMAIN/status)"
  return 0
}

cmd_update() {
  load_conf; need_root update
  local check=0; [ "${1:-}" = "--check" ] && check=1
  local rel version cur; rel=$(latest_release); version=${rel%% *}; cur=$(installed_version)
  if [ "$PAY" = 1 ] && [ "$check" -eq 0 ] && ! docker image inspect "$(pay_tag)" > /dev/null 2>&1; then
    step "Updating MonkStash Pay to ${PAY_REF:0:12}"
    build_pay; write_pay_unit; systemctl daemon-reload; systemctl restart monkstash-pay.service; ok "MonkStash Pay restarted"
  fi
  if [ "$cur" = "$version" ]; then ok "Monero $cur is the latest release"; return 0; fi
  # An old, validly signed hash list served again must not roll the node back to a version with
  # known bugs.
  if [ -n "$cur" ] && version_lt "$version" "$cur"; then
    say "The signed hash list offers Monero $version, older than the installed $cur. Not downgrading."
    return 0
  fi
  if [ "$check" -eq 1 ]; then say "Monero $version is available (installed: ${cur:-none}). Run: monkstash-server update"; return 0; fi
  step "Updating Monero ${cur:-none} to $version"
  # shellcheck disable=SC2086
  install_release $rel
  systemctl restart monerod.service
  ok "running Monero $version (the previous version stays in $MONERO_DIR/$cur until the next update)"
  # Keep only the current and the previous release.
  find "$MONERO_DIR" -mindepth 1 -maxdepth 1 -type d ! -name "$version" ! -name "$cur" -exec rm -rf {} +
}

cmd_self_update() {
  need_root self-update
  local tmp; tmp=$(mktemp -p "$TMP_ROOT")
  curl -fsSL "$SELF_URL" -o "$tmp" || die "could not download $SELF_URL"
  bash -n "$tmp" || die "the downloaded script is not valid; keeping the current one"
  local new; new=$(sed -n 's/^SCRIPT_VERSION="\(.*\)"$/\1/p' "$tmp")
  install -m 0755 "$tmp" "$BIN"
  ok "monkstash-server $SCRIPT_VERSION -> ${new:-unknown}. Its SHA-256 is $(sha256sum "$BIN" | awk '{print $1}'); compare it with https://wallet.monkstash.com/build.json (server/install.sh)."
}

cmd_uninstall() {
  need_root uninstall
  local purge=0; [ "${1:-}" = "--purge" ] && purge=1
  systemctl disable --now monkstash-pay.service monkstash-update.timer monkstash-status.timer monerod.service > /dev/null 2>&1 || true
  if command -v docker > /dev/null; then
    docker rm -f monkstash-pay > /dev/null 2>&1 || true
    docker images --format '{{.Repository}}:{{.Tag}}' | grep '^monkstash-pay:' | xargs -r docker rmi > /dev/null 2>&1 || true
    [ "$purge" -eq 1 ] && docker volume rm monkstash-pay-data > /dev/null 2>&1 || true
  fi
  rm -rf /opt/monkstash-pay /etc/systemd/system/monkstash-pay.service
  rm -f /etc/systemd/system/monerod.service /etc/systemd/system/monkstash-status.* /etc/systemd/system/monkstash-update.*
  systemctl daemon-reload
  if [ -f /etc/caddy/Caddyfile ] && grep -q "Written by monkstash-server" /etc/caddy/Caddyfile; then
    printf ':80 {\n\trespond "Not configured" 404\n}\n' > /etc/caddy/Caddyfile; systemctl reload caddy 2> /dev/null || true
  fi
  rm -rf "$MONERO_DIR" "$WWW_DIR" /etc/monero "$CONF_DIR"
  if [ "$purge" -eq 1 ]; then rm -rf "$DATA_DIR" "$LOG_DIR"; ok "removed, including the blockchain and Pay's invoices"
  else ok "removed. The blockchain is kept in $DATA_DIR and Pay's invoices in the docker volume monkstash-pay-data (--purge deletes both)"; fi
  say "Caddy, ufw and their rules are left installed. Remove this command with: rm $BIN"
}

case "${1:-}" in
  install) shift; cmd_install "$@" ;;
  status) shift; cmd_status "$@" ;;
  update) shift; cmd_update "$@" ;;
  self-update) shift; cmd_self_update ;;
  pay-info) shift; cmd_pay_info ;;
  link) shift; cmd_link "$@" ;;
  uninstall) shift; cmd_uninstall "$@" ;;
  version|--version) say "monkstash-server $SCRIPT_VERSION" ;;
  help|-h|--help|"") usage ;;
  *) usage; exit 1 ;;
esac
