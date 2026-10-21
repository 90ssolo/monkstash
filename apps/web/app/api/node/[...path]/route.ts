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
import { BLOCK_ENDPOINTS, BLOCKS_PER_ANSWER, capBlockBatch } from "@quietmint/node-client";

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
// Bulk downloads are the expensive part: a few at a time per visitor, and a ceiling for the server.
const BULK_PER_IP = 4;
const BULK_TOTAL = 64;
// Answers that are collected before they are passed on (everything except bulk downloads).
const MAX_BUFFERED = 16 * 1024 * 1024;
// JSON-RPC requests are small. One call per request (no batches), and never the node's admin
// methods: restricted public nodes refuse them anyway, but a node configured without
// --restricted-rpc must not be controllable through the relay.
const MAX_JSON_RPC_BODY = 64 * 1024;
const DENIED_RPC = new Set([
  "set_bans", "get_bans", "banned", "flush_txpool", "flush_cache", "relay_tx", "prune_blockchain", "pop_blocks",
  "sync_info", "get_connections", "get_peer_list", "set_log_level", "set_log_categories", "set_log_hash_rate",
  "set_limit", "out_peers", "in_peers", "start_mining", "stop_mining", "mining_status", "stop_daemon",
  "save_bc", "generateblocks", "submit_block", "submitblock", "update", "set_bootstrap_daemon",
  "get_alternate_chains", "get_coinbase_tx_sum", "rpc_access_info", "rpc_access_submit_nonce",
  "rpc_access_pay", "rpc_access_tracking", "rpc_access_data", "rpc_access_account",
]);
/**
 * Answers are typed by the relay, never by the node: a node that answered with text/html could
 * otherwise run script on this origin. Every answer is also sandboxed and marked as a download.
 */
const answerType = (endpoint: string) => (endpoint.endsWith(".bin") ? "application/octet-stream" : "application/json");
const ANSWER_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; sandbox; frame-ancestors 'none'",
  "Content-Disposition": "attachment",
  "X-Content-Type-Options": "nosniff",
};

let bulkTotal = 0;
const bulkByIp = new Map<string, number>();
function clientKey(req: NextRequest): string {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0]!.trim() || "unknown";
}
/** Reserves a bulk download slot; returns the release function, or null when none is free. */
function takeBulkSlot(req: NextRequest): (() => void) | null {
  const key = clientKey(req);
  const mine = bulkByIp.get(key) ?? 0;
  if (bulkTotal >= BULK_TOTAL || mine >= BULK_PER_IP) return null;
  bulkTotal++;
  bulkByIp.set(key, mine + 1);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    bulkTotal--;
    const left = (bulkByIp.get(key) ?? 1) - 1;
    if (left > 0) bulkByIp.set(key, left);
    else bulkByIp.delete(key);
  };
}

/** True when a JSON-RPC body asks for one allowed method. */
function rpcAllowed(body: Uint8Array): boolean {
  try {
    const call = JSON.parse(new TextDecoder().decode(body)) as unknown;
    if (!call || typeof call !== "object" || Array.isArray(call)) return false;
    const method = (call as { method?: unknown }).method;
    return typeof method === "string" && !DENIED_RPC.has(method);
  } catch {
    return false;
  }
}

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

  const isRpc = endpoint === "json_rpc";
  const raw = req.method === "POST" ? await readBody(req, isRpc ? MAX_JSON_RPC_BODY : MAX_BODY) : undefined;
  if (raw === null) return new Response("Request too large", { status: 413 });
  if (isRpc && (!raw || !rpcAllowed(raw))) return new Response("Method not allowed", { status: 403 });
  // Small block batches, so a wallet can stop and save every few seconds (packages/node-client).
  const body = raw && BLOCK_ENDPOINTS.has(endpoint) ? capBlockBatch(raw, BLOCKS_PER_ANSWER) : raw;
  if (body === null) return new Response("Request not allowed", { status: 400 });

  const nodes = healthyFirst(upstreams());
  if (nodes.length === 0) return new Response("No Monero node configured", { status: 503 });

  const stream = BULK.has(endpoint);
  const release = stream ? takeBulkSlot(req) : () => {};
  if (!release) return tooMany();
  let handedOver = false;
  try {

  // A broadcast must reach the network at most once from here. If a node may have received it
  // (timeout, dropped answer, 5xx), asking the next node would at best get "double spend" back
  // and hide that the payment went out. The wallet then checks the pool for the transaction.
  const isSend = SEND_ENDPOINTS.has(endpoint);
  let lastError = "unknown error";
  for (const base of nodes) {
    try {
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
          // A node that redirects is treated as failing: following it could make this server
          // fetch an address of the node's choosing (internal services included).
          redirect: "manual",
        });
      } finally {
        if (stream) clearTimeout(firstByte);
      }
      if (res.status >= 500 || (res.status >= 300 && res.status < 400)) {
        clearTimeout(firstByte);
        void res.body?.cancel().catch(() => {});
        lastError = `${base} returned ${res.status}`;
        markDown(base);
        if (isSend) break;
        continue; // try the next node
      }
      const headers = { ...ANSWER_HEADERS, "Content-Type": answerType(endpoint) };
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
        let clientGone = false;
        const reader = res.body.pipeThrough(watchdog, { signal: abort.signal }).getReader();
        // When the wallet stops reading (it closed or moved on), stop the node download too. That
        // is the client's doing, so the node is not marked as failing.
        const body = new ReadableStream<Uint8Array>({
          async pull(ctrl) {
            try {
              const { done, value } = await reader.read();
              if (done) { release(); ctrl.close(); } else ctrl.enqueue(value);
            } catch (e) {
              release();
              ctrl.error(e);
            }
          },
          cancel() {
            clientGone = true;
            clearTimeout(idle);
            release();
            abort.abort(new Error("client went away"));
          },
        });
        abort.signal.addEventListener("abort", () => {
          clearTimeout(idle);
          release();
          if (clientGone) return;
          markDown(node);
          console.warn(`[node-proxy] stream from ${new URL(node).host} cut: ${String(abort.signal.reason?.message ?? "aborted")}`);
        });
        handedOver = true;
        return new Response(body, { status: res.status, headers });
      }
      // Small answers are collected first: a node that drops the socket mid-answer then fails
      // here, where the next node can be tried, instead of reaching the wallet half-written.
      if (Number(res.headers.get("content-length") ?? "0") > MAX_BUFFERED) throw new Error("answer too large");
      const payload = await res.arrayBuffer();
      clearTimeout(firstByte);
      if (payload.byteLength > MAX_BUFFERED) throw new Error("answer too large");
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
  } finally {
    if (!handedOver) release();
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
