import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { getArticles } from "@/lib/content";

/**
 * Last real content change for each static page (YYYY-MM-DD). Update the date here whenever a
 * page's visible content changes, so lastModified stays truthful instead of "now" on every build.
 * Articles use the `updated` field in their own meta.
 */
const STATIC_PAGES: { path: string; updated: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
  { path: "/", updated: "2026-10-17", changeFrequency: "weekly", priority: 1 },
  { path: "/faq", updated: "2026-10-17", changeFrequency: "monthly", priority: 0.6 },
  { path: "/support", updated: "2026-10-20", changeFrequency: "monthly", priority: 0.5 },
  { path: "/about", updated: "2026-10-21", changeFrequency: "monthly", priority: 0.5 },
  { path: "/verify", updated: "2026-10-21", changeFrequency: "monthly", priority: 0.4 },
  { path: "/server", updated: "2026-10-21", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", updated: "2026-10-25", changeFrequency: "monthly", priority: 0.3 },
  { path: "/tools", updated: "2026-10-15", changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/monero-address-validator", updated: "2026-10-15", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools/monero-restore-height-calculator", updated: "2026-10-15", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools/monero-seed-doctor", updated: "2026-10-20", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools/monero-fee-calculator", updated: "2026-10-15", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools/monero-qr-code-generator", updated: "2026-10-15", changeFrequency: "monthly", priority: 0.7 },
  { path: "/tools/monero-mining-calculator", updated: "2026-10-15", changeFrequency: "monthly", priority: 0.7 },
  { path: "/monero-wallets", updated: "2026-10-17", changeFrequency: "monthly", priority: 0.8 },
  { path: "/monero-wallets/android", updated: "2026-10-17", changeFrequency: "monthly", priority: 0.7 },
  { path: "/monero-wallets/iphone", updated: "2026-10-17", changeFrequency: "monthly", priority: 0.7 },
  { path: "/monero-wallets/desktop", updated: "2026-10-17", changeFrequency: "monthly", priority: 0.7 },
  { path: "/monero-wallets/hardware", updated: "2026-10-21", changeFrequency: "monthly", priority: 0.7 },
  { path: "/monero-chrome-extension", updated: "2026-10-21", changeFrequency: "monthly", priority: 0.7 },
  { path: "/mymonero-alternative", updated: "2026-10-15", changeFrequency: "monthly", priority: 0.7 },
  { path: "/donate", updated: "2026-10-20", changeFrequency: "monthly", priority: 0.6 },
  // Library index pages. Only final URLs belong here (never redirected ones like /wallets).
  { path: "/learn", updated: "2026-10-15", changeFrequency: "weekly", priority: 0.6 },
  { path: "/business", updated: "2026-10-17", changeFrequency: "weekly", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_PAGES.map((p) => ({ url: absoluteUrl(p.path), changeFrequency: p.changeFrequency, priority: p.priority, lastModified: new Date(`${p.updated}T00:00:00Z`) })),
    ...getArticles().map((a) => ({ url: absoluteUrl(a.path), changeFrequency: "monthly" as const, priority: 0.8, lastModified: new Date(`${a.updated}T00:00:00Z`) })),
  ];
}
