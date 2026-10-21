/**
 * Live Monero network numbers for the mining calculator (a content page, so no wallet engine).
 *
 * Read on the server from a mainnet node, then cached: the current difficulty and height from
 * get_info, the newest block's reward from get_last_block_header, and the number of RingCT
 * outputs on the chain (for the FCMP++ guide) from get_output_distribution. Visitors only ever hit
 * the cached JSON, so this cannot be used to hammer the node, and no visitor data reaches it.
 * The node is set with MONERO_STATS_NODE_URL (mainnet, restricted RPC), shared with fee-stats.
 */
import type { NetworkStats, NetworkStatsUnavailable } from "@/lib/networkStats";
import { keepLastGood } from "@/lib/server/keepLastGood";
import { BLOCK_TARGET_SECONDS } from "@/lib/networkStats";

export const dynamic = "force-static";
export const revalidate = 300; // five minutes

const TIMEOUT_MS = 10_000;

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

interface GetInfo {
  height: number;
  difficulty?: number;
  wide_difficulty?: string;
  target?: number;
  nettype?: string;
  status?: string;
}

interface OutputDistribution {
  result?: { distributions?: { distribution?: number[] }[] };
}

/** RingCT outputs up to `height`, or undefined: optional, so the mining numbers never depend on it. */
async function rctOutputsAt(base: string, height: number): Promise<number | undefined> {
  try {
    const r = await rpc<OutputDistribution>(base, "/json_rpc", {
      jsonrpc: "2.0", id: "0", method: "get_output_distribution",
      params: { amounts: [0], cumulative: true, binary: false, from_height: height, to_height: height },
    });
    const n = r.result?.distributions?.[0]?.distribution?.at(-1);
    return positive(n) ? n : undefined;
  } catch {
    return undefined;
  }
}

interface LastBlockHeader {
  result?: { block_header?: { reward?: number; height?: number }; status?: string };
}

function positive(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

async function measure(base: string): Promise<NetworkStats> {
  const [info, last] = await Promise.all([
    rpc<GetInfo>(base, "/get_info"),
    rpc<LastBlockHeader>(base, "/json_rpc", { jsonrpc: "2.0", id: "0", method: "get_last_block_header" }),
  ]);
  if (info.nettype && info.nettype !== "mainnet") throw new Error(`node is on ${info.nettype}, not mainnet`);

  // `difficulty` is the low 64 bits; `wide_difficulty` is the full value as hex. Prefer the full one.
  let difficulty = info.difficulty;
  if (info.wide_difficulty && /^0x[0-9a-f]+$/i.test(info.wide_difficulty)) difficulty = Number(BigInt(info.wide_difficulty));
  const targetSeconds = positive(info.target) ? info.target : BLOCK_TARGET_SECONDS;
  const reward = last.result?.block_header?.reward;
  if (!positive(info.height) || !positive(difficulty) || !positive(reward)) throw new Error("unexpected node response");
  const rctOutputs = await rctOutputsAt(base, info.height - 1);

  return {
    ok: true,
    height: info.height - 1,
    difficulty,
    targetSeconds,
    networkHashrate: difficulty / targetSeconds,
    lastBlockReward: reward,
    ...(rctOutputs ? { rctOutputs } : {}),
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET(): Promise<Response> {
  const base = (process.env.MONERO_STATS_NODE_URL ?? "").trim().replace(/\/+$/, "");
  let body: NetworkStats | NetworkStatsUnavailable = { ok: false, fetchedAt: new Date().toISOString() };
  if (base) {
    try {
      body = await measure(base);
    } catch (err) {
      // Node unreachable or unexpected response: the calculator asks for difficulty by hand.
      console.warn("[network-stats] read failed:", err instanceof Error ? err.message : String(err));
    }
  }
  // Cache successes; never cache a failure, so a brief outage does not stick.
  if (!body.ok) body = keepLastGood(body, "network-stats");
  const cache = body.ok ? "public, max-age=300, stale-while-revalidate=600" : "no-store";
  return Response.json(body, { headers: { "Cache-Control": cache } });
}
