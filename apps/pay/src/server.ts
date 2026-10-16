/**
 * MonkStash Pay entry point: loads settings, opens the view-only wallet, then runs three things
 * side by side: the HTTP server, a sync loop that watches for payments, and the webhook sender.
 */
import { createServer } from "node:http";
import { ConfigError, loadConfig } from "./config";
import { createApp, type AppState } from "./app";
import { accountsInUse, highestIndexes, LOOKAHEAD_WARN_GAP, reconcile, subaddressUsage } from "./invoices";
import { createPriceService } from "./prices";
import { Store } from "./store";
import { openWatcher } from "./wallet";
import { deliverDue } from "./webhooks";

const SYNC_EVERY_MS = 15_000;
const WEBHOOK_EVERY_MS = 10_000;
const SAVE_EVERY_MS = 120_000;

async function main() {
  let cfg;
  try {
    cfg = loadConfig();
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`[pay] configuration problem: ${err.message}`);
      process.exit(2);
    }
    throw err;
  }

  const store = new Store(cfg.dataDir);
  await store.load();
  console.log(`[pay] opening the view-only wallet on ${cfg.network} (first start scans from block ${cfg.restoreHeight}); invoice subaddresses go in account ${cfg.account}`);
  const watcher = await openWatcher(cfg, highestIndexes(store));
  const prices = createPriceService({ liveCoinWatchKey: cfg.liveCoinWatchKey, log: (m) => console.warn(`[pay] ${m}`) });
  let lookaheadWarned = false;
  const checkLookahead = () => {
    const u = subaddressUsage(store, cfg.account);
    if (u.gap > LOOKAHEAD_WARN_GAP && !lookaheadWarned) {
      console.warn(
        `[pay] warning: ${u.gap} subaddresses in account ${u.account} have been handed out since the last one that received a payment (index ${u.lastPaidIndex}, highest ${u.highestIndex}). ` +
          "If you restore this wallet in another app, raise its subaddress lookahead above this gap or some payments will not show up there. See the README.",
      );
    }
    lookaheadWarned = u.gap > LOOKAHEAD_WARN_GAP;
  };
  const state: AppState = { incoming: [], height: 0, lastSyncAt: null, syncError: null };

  // Payments: sync, read incoming transfers, update invoices and queue webhooks.
  // Until the first sync succeeds, invoice routes answer 503 (state.lastSyncAt is null). After
  // that, statuses are decided as of the last successful sync, so a node outage never expires
  // an invoice the server could not check.
  let syncing = false;
  let resumed = true;
  const syncOnce = async () => {
    if (syncing) return;
    syncing = true;
    try {
      await watcher.sync();
      const incoming = await watcher.incoming(accountsInUse(store, cfg));
      const height = await watcher.height();
      const syncedAt = Date.now();
      // Record first-seen times before the routes can serve this sync's view.
      await reconcile(store, incoming, cfg, syncedAt, { syncedAt, resumed });
      resumed = false;
      state.incoming = incoming;
      state.height = height;
      state.lastSyncAt = syncedAt;
      if (state.syncError) console.log("[pay] node reachable again");
      state.syncError = null;
      checkLookahead();
    } catch (err) {
      const msg = (err as Error).message || "sync failed";
      if (state.syncError !== msg) console.error(`[pay] sync problem: ${msg}`);
      state.syncError = msg;
    } finally {
      syncing = false;
    }
  };

  const server = createServer((req, res) => void createAppHandler(req, res));
  const createAppHandler = createApp({ cfg, store, watcher, prices, state });
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  await new Promise<void>((resolve) => server.listen(cfg.port, cfg.host, resolve));
  console.log(`[pay] listening on ${cfg.host}:${cfg.port}, checkout links use ${cfg.publicUrl}`);

  await syncOnce();
  console.log(`[pay] wallet synced to block ${state.height}`);
  const timers = [
    setInterval(() => void syncOnce(), SYNC_EVERY_MS),
    setInterval(() => void watcher.save().catch(() => {}), SAVE_EVERY_MS),
    ...(cfg.webhookUrl && cfg.webhookSecret
      ? [setInterval(() => void deliverDue(store, cfg.webhookUrl!, cfg.webhookSecret!).catch((e) => console.error(`[pay] webhook problem: ${(e as Error).message}`)), WEBHOOK_EVERY_MS)]
      : []),
  ];

  const stop = async (signal: string) => {
    console.log(`[pay] ${signal}: saving and shutting down`);
    timers.forEach(clearInterval);
    server.close();
    await store.save().catch(() => {});
    await watcher.close();
    process.exit(0);
  };
  process.on("SIGINT", () => void stop("SIGINT"));
  process.on("SIGTERM", () => void stop("SIGTERM"));
}

main().catch((err) => {
  console.error(`[pay] could not start: ${(err as Error).message}`);
  process.exit(1);
});
