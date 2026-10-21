#!/bin/sh
# Signs server/monkstash-server.sh with the MonkStash release key, writing
# server/monkstash-server.sh.sig (served as /server/install.sh.sig). Run after every change to the
# script, before committing it; CI refuses a script whose signature does not match.
#   sh scripts/sign-installer.sh [path to the private key]
set -eu
key=${1:-$HOME/.ssh/monkstash_release_ed25519}
cd "$(dirname "$0")/.."
# Sign exactly what git stores and the website serves (LF line endings).
if grep -q "$(printf '\r')" server/monkstash-server.sh; then echo "server/monkstash-server.sh has CRLF line endings; convert it to LF first" >&2; exit 1; fi
rm -f server/monkstash-server.sh.sig
ssh-keygen -Y sign -q -f "$key" -n monkstash-server server/monkstash-server.sh
printf 'release@monkstash.com namespaces="monkstash-server" %s\n' "$(sed -n 's/^RELEASE_KEY="\(.*\)"$/\1/p' server/monkstash-server.sh)" > /tmp/monkstash-signers.$$
ssh-keygen -Y verify -f /tmp/monkstash-signers.$$ -I release@monkstash.com -n monkstash-server -s server/monkstash-server.sh.sig < server/monkstash-server.sh
rm -f /tmp/monkstash-signers.$$
