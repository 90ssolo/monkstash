/**
 * Dev-only: serves the local test-wallet fixture to the test-wallet picker and the
 * monitoring dashboard. Returns 404 in production or on mainnet, so this never ships live.
 * The fixture holds stagenet throwaway wallets and is git-ignored.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DEV_TOOLS_ENABLED } from "@/lib/wallet/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!DEV_TOOLS_ENABLED) return new Response("Not found", { status: 404 });
  try {
    const raw = await readFile(join(process.cwd(), "test-wallets.local.json"), "utf-8");
    return new Response(raw, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ network: "stagenet", wallets: [] });
  }
}
