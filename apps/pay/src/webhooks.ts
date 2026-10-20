/**
 * Webhooks: a signed POST to the shop when an invoice changes state, so orders complete without
 * anyone watching a screen. Signature scheme (verify it on your side before trusting a webhook):
 *
 *   X-MonkStash-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256(secret, "<t>.<raw body>")>
 *
 * Reject events whose t is more than 5 minutes old (replays). A failed delivery is retried after
 * 1 min, 5 min, 30 min, 2 h and 6 h: 6 attempts in all, the last about 8 h 36 min after the
 * first. Then it is given up (the API still has the status).
 */
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { InvoiceEvent, OutboxItem, Store } from "./store";

export const RETRY_DELAYS_MS = [60_000, 300_000, 1_800_000, 7_200_000, 21_600_000];

export function sign(secret: string, timestamp: number, body: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

/** For shops (and tests): checks a signature header against the raw body. */
export function verifySignature(secret: string, header: string, body: string, nowSec = Math.floor(Date.now() / 1000), toleranceSec = 300): boolean {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=", 2) as [string, string]));
  const t = Number(parts.t);
  if (!Number.isInteger(t) || Math.abs(nowSec - t) > toleranceSec || !parts.v1) return false;
  const expected = Buffer.from(sign(secret, t, body), "hex");
  const got = Buffer.from(parts.v1, "hex");
  return got.length === expected.length && timingSafeEqual(got, expected);
}

export function queueEvent(store: Store, invoiceId: string, event: InvoiceEvent, payload: unknown, now = Date.now()): OutboxItem {
  const item: OutboxItem = {
    id: randomUUID(), invoiceId, event,
    body: JSON.stringify({ id: randomUUID(), type: event, created: Math.floor(now / 1000), data: payload }),
    attempts: 0, nextAt: now,
  };
  store.outbox.push(item);
  return item;
}

/** Sends due webhooks once. Returns how many were delivered. */
const delivering = new WeakSet<Store>();

export async function deliverDue(store: Store, url: string, secret: string, fetchImpl: typeof fetch = fetch, now = Date.now()): Promise<number> {
  // One delivery pass at a time: a slow shop must not get the same event twice in parallel.
  if (delivering.has(store)) return 0;
  delivering.add(store);
  try {
    return await deliverPass(store, url, secret, fetchImpl, now);
  } finally {
    delivering.delete(store);
  }
}

async function deliverPass(store: Store, url: string, secret: string, fetchImpl: typeof fetch, now: number): Promise<number> {
  let delivered = 0;
  const started = Date.now();
  const due = store.outbox.filter((o) => o.nextAt <= now);
  for (const item of due) {
    // Timestamp each send when it happens: earlier sends can take up to 10 s each, and the
    // shop rejects signatures older than its tolerance window.
    const t = Math.floor((now + (Date.now() - started)) / 1000);
    let ok = false;
    let error = "";
    try {
      const res = await fetchImpl(url, {
        method: "POST",
        headers: { "content-type": "application/json", "user-agent": "MonkStash-Pay/0.1", "x-monkstash-event": item.event, "x-monkstash-signature": `t=${t},v1=${sign(secret, t, item.body)}` },
        body: item.body,
        signal: AbortSignal.timeout(10_000),
        redirect: "error",
      });
      ok = res.ok;
      if (!ok) error = `HTTP ${res.status}`;
    } catch (err) {
      error = (err as Error).message;
    }
    await store.update((d) => {
      const i = d.outbox.findIndex((o) => o.id === item.id);
      if (i === -1) return;
      if (ok) { d.outbox.splice(i, 1); return; }
      const o = d.outbox[i]!;
      o.attempts += 1;
      o.lastError = error.slice(0, 200);
      if (o.attempts > RETRY_DELAYS_MS.length) {
        d.outbox.splice(i, 1);
        // Only the invoice id and event: never the body, the URL or the secret.
        console.warn(`[pay] webhook ${o.event} for invoice ${o.invoiceId} given up after ${o.attempts} attempts; the shop can still read the status from the API`);
      } else o.nextAt = now + RETRY_DELAYS_MS[o.attempts - 1]!;
    });
    if (ok) delivered++;
  }
  return delivered;
}
