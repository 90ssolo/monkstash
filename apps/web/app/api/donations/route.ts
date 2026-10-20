/**
 * Live donation totals for /donate, measured by the view-only tracker and cached. Visitors
 * only ever receive the cached JSON; the node never sees them.
 */
import { getDonationStats } from "@/lib/server/donationTracker";
import { keepLastGood } from "@/lib/server/keepLastGood";

export const dynamic = "force-static";
export const revalidate = 120; // two minutes

export async function GET(): Promise<Response> {
  try {
    const stats = await getDonationStats();
    return Response.json(stats, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=120" } });
  } catch (err) {
    console.warn("[donations] tracker failed:", err instanceof Error ? err.message : String(err));
    const body = keepLastGood({ ok: false, checkedAt: new Date().toISOString() }, "donations");
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  }
}
