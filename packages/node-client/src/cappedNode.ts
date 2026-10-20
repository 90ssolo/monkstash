/**
 * A private forwarder between a wallet engine running in Node.js and its Monero node, used by the
 * server-side view-only wallets (the donation tracker, MonkStash Pay).
 *
 * Why: the engine cannot be told how many blocks to ask for, and in Node.js it fails to process
 * the node's largest answers ("Exception in thread pool" on about 400 or more recent mainnet
 * blocks). The forwarder adds the block cap (see blockBatch.ts) to every block request and passes
 * everything else through unchanged, including node logins (the engine answers the node's
 * login challenge itself; the forwarder only carries the headers).
 *
 * It listens on 127.0.0.1 only, on a free port, and talks to exactly one node.
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { BLOCK_ENDPOINTS, BLOCKS_PER_ANSWER, capBlockBatch } from "./blockBatch";

export interface CappedNode {
  /** Give this to the engine as its node address. */
  uri: string;
  close(): Promise<void>;
}

export interface CappedNodeOptions {
  maxBlocks?: number;
  /** Longest wait for one answer from the node (default 3 minutes, the engine's own limit). */
  timeoutMs?: number;
}

const MAX_REQUEST = 2 * 1024 * 1024;
const PASS_REQUEST = ["content-type", "authorization", "accept"] as const;
// Not content-encoding: fetch has already decompressed the body.
const PASS_RESPONSE = ["content-type", "www-authenticate"] as const;

async function readRequest(req: IncomingMessage): Promise<Uint8Array<ArrayBuffer> | null> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_REQUEST) return null;
    chunks.push(chunk as Buffer);
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.length; }
  return out;
}

/** Starts a forwarder to `nodeUrl` (for example https://node.example.com:18081). */
export async function startCappedNode(nodeUrl: string, opts: CappedNodeOptions = {}): Promise<CappedNode> {
  const upstream = nodeUrl.replace(/\/+$/, "");
  const maxBlocks = opts.maxBlocks ?? BLOCKS_PER_ANSWER;
  const timeoutMs = opts.timeoutMs ?? 180_000;

  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const pathname = (req.url ?? "/").split("?")[0]!;
    const raw = req.method === "POST" || req.method === "PUT" ? await readRequest(req) : undefined;
    if (raw === null) { res.writeHead(413).end(); return; }
    const body = raw && BLOCK_ENDPOINTS.has(pathname.replace(/^\//, "")) ? capBlockBatch(raw, maxBlocks) : raw;
    const headers: Record<string, string> = {};
    for (const h of PASS_REQUEST) {
      const v = req.headers[h];
      if (typeof v === "string") headers[h] = v;
    }
    let answer: Response;
    try {
      answer = await fetch(upstream + (req.url ?? "/"), { method: req.method, headers, body, signal: AbortSignal.timeout(timeoutMs) });
    } catch {
      res.writeHead(502).end();
      return;
    }
    const out: Record<string, string> = {};
    for (const h of PASS_RESPONSE) {
      const v = answer.headers.get(h);
      if (v) out[h] = v;
    }
    // Whole answers with a length: the engine in Node.js rejects streamed (chunked) answers. With
    // the block cap the largest answers are a few megabytes.
    let data: Uint8Array;
    try {
      data = new Uint8Array(await answer.arrayBuffer());
    } catch {
      res.writeHead(502).end();
      return;
    }
    res.writeHead(answer.status, { ...out, "content-length": String(data.byteLength) });
    res.end(data);
  };

  const server = createServer((req, res) => { handle(req, res).catch(() => { if (!res.headersSent) res.writeHead(502); res.end(); }); });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("The node forwarder did not start");
  return {
    uri: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve) => {
      server.closeAllConnections();
      server.close(() => resolve());
    }),
  };
}
