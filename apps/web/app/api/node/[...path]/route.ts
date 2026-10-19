/**
 * Same-origin proxy to a Monero node (monerod restricted RPC).
 *
 * Why: browsers block cross-origin calls to most public nodes (no CORS headers), and
 * routing through one place makes "switch to our own node" a configuration change.
 * Privacy note: whoever runs this proxy can see the wallet's node traffic (never keys).
 * Users who want maximum privacy should point the wallet at their own node.
 */
import { NextRequest } from "next/server";
import { NODE_ENDPOINTS } from "@/lib/nodeEndpoints";
import { allow, tooMany } from "@/lib/server/rateLimit";
import { capBlockBatch } from "@/lib/server/blockBatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Only the endpoints a light client needs. Restricted public nodes refuse the rest anyway.
// One list for the rewrites (next.config.ts), the host routing (proxy.ts) and this relay, so they never drift.
const ALLOWED = new Set<string>(NODE_ENDPOINTS);

const MAX_BODY = 2 * 1024 * 1024; // 2 MB; wallet requests are small, responses can be large
// A first sync sends many block requests in bursts, so the general limit is generous; the
// relay exists for wallets, not as a free proxy. Broadcasting a transaction is rare.
const PER_MINUTE = 900;
const SENDS_PER_MINUTE = 20;
const SEND_ENDPOINTS = new Set(["send_raw_transaction", "sendrawtransaction"]);
// Blocks per getblocks.bin answer (see lib/server/blockBatch.ts). The wallet can only stop and save
// between answers; at 100 a browser processes one in about 2 s instead of about 10 (measured 2026-10-19).
const BLOCKS_PER_ANSWER = 100;
const BLOCK_ENDPOINTS = new Set(["get_blocks.bin", "getblocks.bin"]);

/** Reads at most `max` bytes of the body; null when it is larger (without buffering the rest). */
async function readBody(req: NextRequest, max: number): Promise<Uint8Array<ArrayBuffer> | null> {
  const declared = Number(req.headers.get("content-length") ?? "0");
  if (declared > max) return null;
  if (!req.body) return new Uint8Array();
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) { await reader.cancel().catch(() => {}); return null; }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.byteLength; }
  return out;
}
const TIMEOUT_MS = 60_000;
/**
 * Block downloads are streamed. One mainnet getblocks.bin batch can be tens of megabytes and take
 * minutes from a public node; collecting it first meant the wallet received nothing until the end,
 * and its engine gave up on the silence ("Exception in thread pool"). Now bytes flow as they
 * arrive. Limits: the node must start answering within FIRST_BYTE_MS, and a stream that goes quiet
 * for IDLE_MS is cut (the wallet then retries; the relay marks the node as failing).
 */
const FIRST_BYTE_MS = 60_000;
const IDLE_MS = 120_000;
const BULK = new Set(["get_blocks.bin", "getblocks.bin", "get_blocks_by_height.bin", "getblocks_by_height.bin", "get_outs.bin", "get_output_distribution.bin", "get_hashes.bin", "gethashes.bin"]);

/** Plain http is fine for a node on this machine, the private network or Tor; elsewhere it can be read and changed in transit. */
const privateHttp = /^http:\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[::1\]|[^/:]+\.onion|[a-z0-9-]+(:|\/|$))/i;
let warned = false;

/** Configured nodes, https ones first. */
function upstreams(): string[] {
  const urls = (process.env.MONERO_NODE_URLS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  const exposed = urls.filter((u) => u.startsWith("http://") && !privateHttp.test(u));
  if (exposed.length && !warned) {
    warned = true;
    console.warn(`[node-proxy] plain http over the internet (prefer https): ${exposed.map((u) => new URL(u).host).join(", ")}`);
  }
  return [...urls.filter((u) => u.startsWith("https://")), ...urls.filter((u) => !u.startsWith("https://"))];
}

/**
 * Errors that prove a node never received the request (no connection, name not found, TLS
 * handshake refused). Only these allow a transaction broadcast to be tried on another node:
 * after a timeout or a dropped answer the first node may already have accepted it.
 */
const NEVER_SENT = new Set([
  "ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "EHOSTUNREACH", "ENETUNREACH", "UND_ERR_CONNECT_TIMEOUT",
  "CERT_HAS_EXPIRED", "DEPTH_ZERO_SELF_SIGNED_CERT", "SELF_SIGNED_CERT_IN_CHAIN", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "ERR_TLS_CERT_ALTNAME_INVALID",
]);
function neverSent(e: unknown): boolean {
  const cause = (e as { cause?: { code?: string } })?.cause;
  return !!cause?.code && NEVER_SENT.has(cause.code);
}

/**
 * Nodes that just failed (error, timeout or 5xx) go to the back of the queue for a while, so one
 * broken public node cannot slow every request down until the wallet engine gives up. A failed
 * node is still tried as a last resort, and one success clears its mark.
 */
const DOWN_FOR_MS = 120_000;
const downUntil = new Map<string, number>();
const markDown = (base: string) => downUntil.set(base, Date.now() + DOWN_FOR_MS);
function healthyFirst(nodes: string[]): string[] {
  const now = Date.now();
  const isDown = (n: string) => (downUntil.get(n) ?? 0) > now;
  return [...nodes.filter((n) => !isDown(n)), ...nodes.filter(isDown)];
}

async function forward(req: NextRequest, path: string[]): Promise<Response> {
  const endpoint = path.join("/");
  if (!allow("node", req, PER_MINUTE)) return tooMany();
  // The server's clock, so the wallet can correct a device clock that is off (see lib/wallet/clock.ts).
  // Answered here, without contacting any node.
  if (endpoint === "time") {
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store", "X-MonkStash-Time": String(Date.now()) } });
  }
  if (!ALLOWED.has(endpoint)) return new Response("Endpoint not allowed", { status: 403 });
  if (SEND_ENDPOINTS.has(endpoint) && !allow("node-send", req, SENDS_PER_MINUTE)) return tooMany();

  const raw = req.method === "POST" ? await readBody(req, MAX_BODY) : undefined;
  if (raw === null) return new Response("Request too large", { status: 413 });
  const body = raw && BLOCK_ENDPOINTS.has(endpoint) ? capBlockBatch(raw, BLOCKS_PER_ANSWER) : raw;

  const nodes = healthyFirst(upstreams());
  if (nodes.length === 0) return new Response("No Monero node configured (MONERO_NODE_URLS)", { status: 503 });

  // A broadcast must reach the network at most once from here. If a node may have received it
  // (timeout, dropped answer, 5xx), asking the next node would at best get "double spend" back
  // and hide that the payment went out. The wallet then checks the pool for the transaction.
  const isSend = SEND_ENDPOINTS.has(endpoint);
  let lastError = "unknown error";
  for (const base of nodes) {
    try {
      const stream = BULK.has(endpoint);
      const abort = new AbortController();
      const firstByte = setTimeout(() => abort.abort(new Error("no answer in time")), stream ? FIRST_BYTE_MS : TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(`${base}/${endpoint}`, {
          method: req.method,
          headers: { "Content-Type": req.headers.get("content-type") ?? "application/octet-stream" },
          body,
          signal: abort.signal,
          cache: "no-store",
        });
      } finally {
        if (stream) clearTimeout(firstByte);
      }
      if (res.status >= 500) {
        clearTimeout(firstByte);
        lastError = `${base} returned ${res.status}`;
        markDown(base);
        if (isSend) break;
        continue; // try the next node
      }
      const headers = {
        "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "no-store",
        "X-MonkStash-Node": new URL(base).host,
      };
      if (stream && res.body) {
        downUntil.delete(base);
        // Pass bytes on as they arrive; cut the stream if the node goes quiet for too long.
        let idle = setTimeout(() => abort.abort(new Error("node went quiet")), IDLE_MS);
        const watchdog = new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, ctrl) {
            clearTimeout(idle);
            idle = setTimeout(() => abort.abort(new Error("node went quiet")), IDLE_MS);
            ctrl.enqueue(chunk);
          },
          flush() { clearTimeout(idle); },
        });
        const node = base;
        const body = res.body.pipeThrough(watchdog, { signal: abort.signal });
        abort.signal.addEventListener("abort", () => { clearTimeout(idle); markDown(node); console.warn(`[node-proxy] stream from ${new URL(node).host} cut: ${String(abort.signal.reason?.message ?? "aborted")}`); });
        return new Response(body, { status: res.status, headers });
      }
      // Small answers are collected first: a node that drops the socket mid-answer then fails
      // here, where the next node can be tried, instead of reaching the wallet half-written.
      const payload = await res.arrayBuffer();
      clearTimeout(firstByte);
      downUntil.delete(base);
      return new Response(payload, {
        status: res.status,
        headers,
      });
    } catch (e) {
      lastError = `${base}: ${(e as Error).message}`;
      markDown(base);
      if (isSend && !neverSent(e)) {
        console.warn("[node-proxy] broadcast outcome unknown, not retried:", lastError);
        return new Response("The node did not confirm the broadcast. The transaction may have been sent.", { status: 504 });
      }
    }
  }
  console.warn("[node-proxy] all nodes failed:", lastError);
  return new Response("All configured Monero nodes are unreachable", { status: 502 });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
