/**
 * Live Monero fee data for the fee calculator (a content page, so no wallet engine).
 *
 * Measured on the server from a mainnet node, then cached: the node's current fee per byte
 * for each priority, and the real sizes of transactions in the most recent blocks. Visitors
 * only ever hit the cached JSON, so this cannot be used to hammer the node, and no visitor
 * data reaches it. The node is set with MONERO_STATS_NODE_URL (mainnet, restricted RPC).
 */
import type { FeeStats, FeeStatsUnavailable } from "@/lib/feeStats";
import { keepLastGood } from "@/lib/server/keepLastGood";

export const dynamic = "force-static";
export const revalidate = 600; // ten minutes

const BLOCKS = 15;
const TIMEOUT_MS = 15_000;

async function rpc<T>(base: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
    redirect: "error", // never follow a node to another address
  });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

const json = <T,>(base: string, method: string, params?: unknown) =>
  rpc<{ result: T }>(base, "/json_rpc", { jsonrpc: "2.0", id: "0", method, params }).then((r) => r.result);

function median(xs: number[]): number | null {
  if (xs.length < 3) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : Math.round((s[m - 1]! + s[m]!) / 2);
}

async function measure(base: string): Promise<FeeStats> {
  const info = await rpc<{ height: number }>(base, "/get_info");
  const est = await json<{ fees?: number[]; fee: number; quantization_mask: number }>(base, "get_fee_estimate");
  // Nodes since the 2021 scaling fork return all four tiers in `fees`. For an older node, apply
  // wallet2's multipliers for the per-byte fee algorithm (3): {1, 5, 25, 1000}. Source:
  // monero-project/monero release-v0.18, src/wallet/wallet2.cpp, wallet2::get_fee_multiplier,
  // table entry `{ 4, {1, 5, 25, 1000} }` (line 8759 as of 2026-10-16).
  const perByte = (est.fees && est.fees.length === 4 ? est.fees : [est.fee, est.fee * 5, est.fee * 25, est.fee * 1000]) as FeeStats["perByte"];

  const tip = info.height - 1;
  const heights = Array.from({ length: BLOCKS }, (_, i) => tip - i);
  // A few requests at a time, with one retry each: public nodes throttle bursts.
  const blocks: { tx_hashes?: string[] }[] = [];
  for (let i = 0; i < heights.length; i += 3) {
    blocks.push(...(await Promise.all(heights.slice(i, i + 3).map((height) =>
      json<{ tx_hashes?: string[] }>(base, "get_block", { height }).catch(() => json<{ tx_hashes?: string[] }>(base, "get_block", { height })),
    ))));
  }
  const hashes = blocks.flatMap((b) => b.tx_hashes ?? []);

  const sizes: Record<1 | 2 | 3 | 4, number[]> = { 1: [], 2: [], 3: [], 4: [] };
  const tierCounts: FeeStats["tierCounts"] = [0, 0, 0, 0, 0];
  for (let i = 0; i < hashes.length; i += 100) {
    const r = await rpc<{ txs?: { as_hex: string; as_json: string }[] }>(base, "/get_transactions", { txs_hashes: hashes.slice(i, i + 100), decode_as_json: true });
    for (const tx of r.txs ?? []) {
      const bytes = tx.as_hex.length / 2;
      let j: { vin?: unknown[]; vout?: unknown[]; rct_signatures?: { txnFee?: number } };
      try { j = JSON.parse(tx.as_json); } catch { continue; }
      const ins = j.vin?.length ?? 0;
      const outs = j.vout?.length ?? 0;
      const fee = j.rct_signatures?.txnFee ?? 0;
      if (outs === 2 && ins >= 1 && ins <= 4) sizes[ins as 1 | 2 | 3 | 4].push(bytes);
      const rate = bytes > 0 ? fee / bytes : 0;
      const tier = perByte.findIndex((p) => Math.abs(rate - p) / p < 0.05);
      tierCounts[tier >= 0 ? tier : 4] = (tierCounts[tier >= 0 ? tier : 4] ?? 0) + 1;
    }
  }

  return {
    ok: true,
    height: tip,
    fetchedAt: new Date().toISOString(),
    blocksSampled: BLOCKS,
    txsSampled: hashes.length,
    perByte,
    quantizationMask: est.quantization_mask,
    sizeByInputs: { 1: median(sizes[1]), 2: median(sizes[2]), 3: median(sizes[3]), 4: median(sizes[4]) },
    tierCounts,
  };
}

export async function GET(): Promise<Response> {
  const base = (process.env.MONERO_STATS_NODE_URL ?? "").trim().replace(/\/+$/, "");
  let body: FeeStats | FeeStatsUnavailable = { ok: false, fetchedAt: new Date().toISOString() };
  if (base) {
    try {
      body = await measure(base);
    } catch (err) {
      // Node unreachable or unexpected response: the page explains fees without live numbers.
      console.warn("[fee-stats] measurement failed:", err instanceof Error ? err.message : String(err));
    }
  }
  // Cache successes in browsers and CDNs; never cache a failure, so a brief node outage
  // does not leave visitors without live numbers once the node is back.
  if (!body.ok) body = keepLastGood(body, "fee-stats");
  const cache = body.ok ? "public, max-age=300, stale-while-revalidate=600" : "no-store";
  return Response.json(body, { headers: { "Cache-Control": cache } });
}
