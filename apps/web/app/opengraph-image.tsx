import { ImageResponse } from "next/og";

export const alt = "MonkStash: a private, non-custodial Monero web wallet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded default social image, Ledger theme. Kept to layout + color (no custom font
// fetch) so it builds reliably. Any page can override with its own opengraph-image.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#edeee6",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/* top edge accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: "#b4532a" }} />

        {/* brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* MonkStash mark: hooded monk, eyes closed, Monero-orange sprig */}
          <svg width="72" height="72" viewBox="0 0 64 64">
            <path d="M11 60 C11 33 19 12 32 10 C45 12 53 33 53 60 Z" fill="#1f4733" />
            <path d="M21.5 60 C21.5 42 25.5 29.5 32 27.5 C38.5 29.5 42.5 42 42.5 60 Z" fill="#edeee6" />
            <path d="M25.6 41 q2.4 2.6 4.8 0 M33.6 41 q2.4 2.6 4.8 0" fill="none" stroke="#1f4733" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M44 13 q8 -2 12 -11 q-10 0 -12 9 z" fill="#f26822" />
            <path d="M47 18 q8 1 13 -6 q-9 -2 -13 5 z" fill="#f26822" />
          </svg>
          <div style={{ fontSize: 38, fontWeight: 700, color: "#1b2a22", letterSpacing: -1 }}>MonkStash</div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 78, fontWeight: 700, color: "#1b2a22", lineHeight: 1.04, letterSpacing: -2, maxWidth: 940 }}>
            Spend like it's nobody's business.
          </div>
          <div style={{ fontSize: 30, color: "#415249", maxWidth: 840 }}>
            A free, non-custodial Monero wallet. Your keys stay on your device.
          </div>
        </div>

        {/* footer row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ padding: "12px 22px", borderRadius: 8, background: "#1f4733", color: "#f6f7ef", fontSize: 24, fontWeight: 700 }}>
            Open wallet
          </div>
          <div style={{ fontSize: 24, color: "#6b7a70" }}>No download, no account</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
