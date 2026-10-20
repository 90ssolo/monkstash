import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEV_TOOLS_ENABLED } from "@/lib/wallet/config";
import { ArticleCover, COVER_PATHS } from "@/components/art/Covers";

export const metadata: Metadata = { title: "Card covers", robots: { index: false, follow: false } };

/** Dev-only contact sheet of every card cover, for reviewing the set side by side. */
export default function DevCoversPage() {
  if (!DEV_TOOLS_ENABLED) notFound();
  return (
    <main style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 16 }}>
      {[...COVER_PATHS, "/no-cover-yet"].map((p) => (
        <figure key={p} style={{ margin: 0, border: "1px solid var(--line)", background: "var(--surface)" }}>
          <ArticleCover path={p} />
          <figcaption style={{ padding: "6px 10px", fontSize: 12 }}>{p}</figcaption>
        </figure>
      ))}
    </main>
  );
}
