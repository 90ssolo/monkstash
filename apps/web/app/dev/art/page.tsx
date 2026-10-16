import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEV_TOOLS_ENABLED } from "@/lib/wallet/config";
import { ExodusAfterRestoreArt, ExodusRestorePathsArt } from "@/components/art/ExodusMoneroArt";
import { BalanceVisibilityArt } from "@/components/art/CheckMoneroBalanceArt";
import { ChangeLockArt } from "@/components/art/MoneroUnlockedBalanceArt";
import { FcmpAnonymitySetArt, FcmpAnonymitySetNarrow, FcmpRoadArt, FcmpRoadNarrow } from "@/components/art/MoneroFcmpArt";
import { Article79ScopeArt, Article79ScopeNarrow, EuTimelineArt, EuTimelineNarrow } from "@/components/art/MoneroEu2027Art";
import { WhoSeesNoKycArt, WhoSeesNoKycNarrow } from "@/components/art/BuyMoneroWithoutKycArt";
import { AtomicSwapArt, AtomicSwapNarrow } from "@/components/art/SwapBitcoinToMoneroArt";

export const metadata: Metadata = { title: "Article art", robots: { index: false, follow: false } };

const WIDE = { ExodusRestorePathsArt, ExodusAfterRestoreArt, BalanceVisibilityArt, ChangeLockArt, FcmpAnonymitySetArt, FcmpRoadArt, Article79ScopeArt, EuTimelineArt, WhoSeesNoKycArt, AtomicSwapArt };
const NARROW = { FcmpAnonymitySetNarrow, FcmpRoadNarrow, Article79ScopeNarrow, EuTimelineNarrow, WhoSeesNoKycNarrow, AtomicSwapNarrow };

/** Dev-only review sheet for article illustrations: wide versions at article width, narrow at phone width. */
export default function DevArtPage() {
  if (!DEV_TOOLS_ENABLED) notFound();
  return (
    <main style={{ padding: 24, display: "grid", gap: 24 }}>
      {Object.entries(WIDE).map(([name, Art]) => (
        <figure key={name} style={{ margin: 0, maxWidth: 720, border: "1px solid var(--line)", padding: 12, background: "var(--surface)" }}>
          <Art />
          <figcaption style={{ fontSize: 12 }}>{name}</figcaption>
        </figure>
      ))}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {Object.entries(NARROW).map(([name, Art]) => (
          <figure key={name} style={{ margin: 0, width: 340, border: "1px solid var(--line)", padding: 8, background: "var(--surface)" }}>
            <Art />
            <figcaption style={{ fontSize: 12 }}>{name}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
