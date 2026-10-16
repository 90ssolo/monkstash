/**
 * OpenAlias lookup for the wallet's Send screen. The browser asks us, and we ask a DNS-over-
 * HTTPS resolver, so the resolver sees our server rather than the user's IP address. We only
 * learn the name being looked up: never who is paying, how much, or from which wallet. No
 * names are logged. DNSSEC status comes from the resolver's AD (authenticated data) flag.
 */
import { NextRequest } from "next/server";
import { openAliasFqdn, parseOpenAliasTxt } from "@quietmint/wallet-core";
import { allow, tooMany } from "@/lib/server/rateLimit";

export const dynamic = "force-dynamic";

const RESOLVER = (process.env.OPENALIAS_DOH_URL || "https://cloudflare-dns.com/dns-query").replace(/\/+$/, "");
const TIMEOUT_MS = 6_000;

type DohAnswer = { type: number; data: string };
type DohResponse = { Status: number; AD?: boolean; Answer?: DohAnswer[] };

async function lookup(fqdn: string): Promise<DohResponse> {
  let last: unknown;
  // The spec asks for at least 3 attempts before giving up.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${RESOLVER}?name=${encodeURIComponent(fqdn)}&type=TXT&do=1`, {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as DohResponse;
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error("lookup failed");
}

export async function GET(req: NextRequest): Promise<Response> {
  const fqdn = openAliasFqdn(req.nextUrl.searchParams.get("name") ?? "");
  const json = (body: unknown, status = 200, cache = "no-store") =>
    Response.json(body, { status, headers: { "Cache-Control": cache } });
  if (!fqdn) return json({ ok: false, error: "invalid" }, 400);
  // Lookups are typed by people; this stops anyone using us as a free DNS resolver.
  if (!allow("openalias", req, 30)) return tooMany();

  let dns: DohResponse;
  try {
    dns = await lookup(fqdn);
  } catch {
    return json({ ok: false, error: "lookup-failed" }, 502);
  }
  // Status 3 = NXDOMAIN (the name does not exist).
  const txts = (dns.Answer ?? []).filter((a) => a.type === 16).map((a) => a.data);
  const record = dns.Status === 0 ? parseOpenAliasTxt(txts) : null;
  if (!record) return json({ ok: false, error: "not-found", fqdn }, 404, "public, max-age=60");

  return json({ ok: true, fqdn, ...record, dnssec: dns.AD === true }, 200, "public, max-age=300");
}
