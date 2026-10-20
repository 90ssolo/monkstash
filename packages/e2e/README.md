# End-to-end tests

Browser tests of the web wallet (Playwright, with axe-core accessibility checks), run against the local dev server on stagenet.

## Setup
1. `apps/web/.env.local` with `NEXT_PUBLIC_MONERO_NETWORK=stagenet` (see `apps/web/.env.example`).
2. Throwaway stagenet wallets in `apps/web/test-wallets.local.json` (`node apps/web/scripts/gen-test-wallets.mjs`). Never use real wallets. Tests that need them are skipped without the file.
3. Google Chrome installed (the tests use it, so no browser download is needed). Another browser: `E2E_CHANNEL=msedge`.

## Run
```
pnpm --filter @quietmint/e2e e2e            # everything except live-network tests (about 3 minutes)
pnpm --filter @quietmint/e2e e2e:network    # live stagenet: sync, node outage, recovery (about 6 minutes)
```
The dev server starts by itself if it is not running on port 3210.

The move-file setup test needs a stagenet move file of the wallet labelled "Test B": save one from that wallet's Settings and set `E2E_MOVE_FILE=<path>`.

## What is covered
* Create: recovery words, backup check (a wrong word is refused), passwords that do not match, authenticator (a wrong code is refused), unlock with password and code.
* Restore: missing check word, swapped words, unknown words, wrong word count; restore, lock, wrong password, unlock, reload.
* Watch-only: a view key of another wallet is refused; the wallet cannot send.
* Receive (new addresses) and send (invalid address, review screen, sent) in simulation.
* Two tabs: the wallet runs in one tab at a time.
* Move file setup: words of another wallet are refused; the right words open the wallet with the file's scan progress.
* Removing the wallet from the browser.
* Accessibility (WCAG 2.2 A and AA rules that axe-core can check): every setup step, every dashboard section, the unlock screen and eight content pages. Automated checks find only part of the problems: keyboard and screen reader use still need a person.
* Live stagenet (@network): a full sync, a node outage shown after two minutes, and recovery when the node is back.
