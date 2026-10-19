import { createServer, type IncomingMessage, type Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { startCappedNode, type CappedNode } from "../src/cappedNode";

// The same real getblocks.bin request as in blockBatch.test.ts.
const REAL = Uint8Array.from(Buffer.from("AREBAQEBAgEBFAlibG9ja19pZHMKAQFAn2jN3Y50s3RptBweYSUNgcV3a0ImT0FtXSfEYmOD7XbuPMmGRikiBs0+hvdNiLTcwdk3CIZF6bDLyoS3znTrBmNsaWVudApBAzM4OGY5YzE2ZmJhZGM0YmQxNzllYTgzNTZmN2NmZjBiZjY1MTdlZTViNzM3YWExZTk3ZTZlNzlhMjEwNjIzMjgwMDA2NWUzNTI3ZTQ2MGUwOGI5YWU0YTMzZTkwOWRiM2ViYjBmZmRlZDIyZGM5OWNhNmExNmZhNzE3YTlhMWMwYmVjMGZlMTMxNGZkZTgwZDc1OWU4ZWUzMGE3M2YwMDQyOTEwMmRlNGQzYWNiMjZmMDQxMTA5ODIzMTg1NTg1NDZkYzhmOWRiZDhmMDk0MDUFcHJ1bmULAQ5yZXF1ZXN0ZWRfaW5mbwgBDHN0YXJ0X2hlaWdodAUAAAAAAAAAAA==", "base64"));

interface Seen { url: string; method: string; body: Buffer; auth?: string }

/** A stand-in node that records what it receives. */
async function fakeNode(answer: (s: Seen) => { status: number; body: string | Buffer; headers?: Record<string, string> }) {
  const seen: Seen[] = [];
  const server: Server = createServer(async (req: IncomingMessage, res) => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const s: Seen = { url: req.url ?? "", method: req.method ?? "", body: Buffer.concat(chunks), ...(req.headers.authorization ? { auth: req.headers.authorization } : {}) };
    seen.push(s);
    const a = answer(s);
    res.writeHead(a.status, a.headers ?? { "content-type": "application/octet-stream" });
    res.end(a.body);
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  const port = (server.address() as { port: number }).port;
  return { url: `http://127.0.0.1:${port}`, seen, close: () => new Promise<void>((r) => server.close(() => r())) };
}

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => { while (cleanups.length) await cleanups.pop()!(); });

async function setup(answer: Parameters<typeof fakeNode>[0], maxBlocks?: number) {
  const node = await fakeNode(answer);
  const fwd: CappedNode = await startCappedNode(node.url + "/", maxBlocks ? { maxBlocks } : {});
  cleanups.push(node.close, fwd.close);
  return { node, fwd };
}

describe("startCappedNode", () => {
  it("listens on this computer only", async () => {
    const { fwd } = await setup(() => ({ status: 200, body: "" }));
    expect(fwd.uri).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
  });

  it("adds the block cap to block requests and returns the node's answer unchanged", async () => {
    const payload = Buffer.alloc(300_000, 7);
    const { node, fwd } = await setup(() => ({ status: 200, body: payload }), 100);
    const res = await fetch(`${fwd.uri}/getblocks.bin`, { method: "POST", headers: { "content-type": "application/octet-stream" }, body: REAL });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-length")).toBe(String(payload.length));
    expect(Buffer.from(await res.arrayBuffer()).equals(payload)).toBe(true);
    expect(node.seen[0]!.url).toBe("/getblocks.bin");
    expect(node.seen[0]!.body.length).toBe(REAL.length + 1 + 15 + 1 + 8);
    expect(node.seen[0]!.body.includes(Buffer.from("max_block_count"))).toBe(true);
  });

  it("passes other requests through untouched", async () => {
    const { node, fwd } = await setup(() => ({ status: 200, body: '{"result":{}}', headers: { "content-type": "application/json" } }));
    const json = '{"jsonrpc":"2.0","id":"0","method":"get_info"}';
    const res = await fetch(`${fwd.uri}/json_rpc`, { method: "POST", headers: { "content-type": "application/json" }, body: json });
    expect(await res.text()).toBe('{"result":{}}');
    expect(res.headers.get("content-type")).toBe("application/json");
    expect(node.seen[0]!.body.toString()).toBe(json);
    const hashes = await fetch(`${fwd.uri}/gethashes.bin`, { method: "POST", body: REAL });
    expect(hashes.status).toBe(200);
    expect(node.seen[1]!.body.equals(Buffer.from(REAL))).toBe(true);
  });

  it("carries a node login challenge and the answer to it", async () => {
    const { node, fwd } = await setup((s) => s.auth
      ? { status: 200, body: "ok" }
      : { status: 401, body: "", headers: { "www-authenticate": 'Digest qop="auth",algorithm=MD5,realm="monero-rpc",nonce="abc"' } });
    const first = await fetch(`${fwd.uri}/json_rpc`, { method: "POST", body: "{}" });
    expect(first.status).toBe(401);
    expect(first.headers.get("www-authenticate")).toContain("Digest");
    const second = await fetch(`${fwd.uri}/json_rpc`, { method: "POST", body: "{}", headers: { authorization: 'Digest username="u"' } });
    expect(second.status).toBe(200);
    expect(node.seen[1]!.auth).toBe('Digest username="u"');
  });

  it("answers 502 when the node cannot be reached", async () => {
    const dead = await fakeNode(() => ({ status: 200, body: "" }));
    await dead.close();
    const fwd = await startCappedNode(dead.url);
    cleanups.push(fwd.close);
    const res = await fetch(`${fwd.uri}/get_info`);
    expect(res.status).toBe(502);
  });
});
