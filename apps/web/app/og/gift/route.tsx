import { ImageResponse } from "next/og";

// The link preview of every gift link (chat apps, social posts). The gift itself is after the # in
// the link, which a preview never sees, so the card shows no amount: one image for all gifts.
// Layout and colour only, no font fetch, like app/opengraph-image.tsx.
export const dynamic = "force-static";

const PAPER = "#f8f7ef";
const DEEP = "#1b2a22";

// The official Monero symbol (components/art/MoneroSymbol.tsx), unchanged.
const MONERO_DISC = "M4128,2249.81C4128,3287,3287.26,4127.86,2250,4127.86S372,3287,372,2249.81,1212.76,371.75,2250,371.75,4128,1212.54,4128,2249.81Z";
const MONERO_UPPER = "M2250,371.75c-1036.89,0-1879.12,842.06-1877.8,1878,0.26,207.26,33.31,406.63,95.34,593.12h561.88V1263L2250,2483.57,3470.52,1263v1579.9h562c62.12-186.48,95-385.85,95.37-593.12C4129.66,1212.76,3287,372,2250,372Z";
const MONERO_LOWER = "M1969.3,2764.17l-532.67-532.7v994.14H1029.38l-384.29.07c329.63,540.8,925.35,902.56,1604.91,902.56S3525.31,3766.4,3855,3225.6H3063.25V2231.47l-532.7,532.7-280.61,280.61-280.62-280.61h0Z";

function Monk({ size, hood }: { size: number; hood: string }) {
  return (
    <svg width={size * 0.74} height={size} viewBox="11 2 49 66">
      <path fillRule="evenodd" fill={hood} d="M11 60 C11 33 19 12 32 10 C45 12 53 33 53 60 Z M21.5 60 C21.5 42 25.5 29.5 32 27.5 C38.5 29.5 42.5 42 42.5 60 Z" />
      <path d="M25.6 41 q2.4 2.6 4.8 0 M33.6 41 q2.4 2.6 4.8 0" fill="none" stroke={hood} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M44 13 q8 -2 12 -11 q-10 0 -12 9 z" fill="#f26822" />
      <path d="M47 18 q8 1 13 -6 q-9 -2 -13 5 z" fill="#f26822" />
    </svg>
  );
}

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: DEEP, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: "#b4532a" }} />

        {/* Words */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "70px 0 66px 80px", width: 650 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Monk size={50} hood={PAPER} />
            <div style={{ fontSize: 34, fontWeight: 700, color: PAPER, letterSpacing: -1 }}>MonkStash</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 4, color: "#e9a07a" }}>A GIFT FOR YOU</div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, color: PAPER, lineHeight: 1.02, letterSpacing: -2 }}>
              <span>Someone sent</span>
              <span>you Monero.</span>
            </div>
            <div style={{ fontSize: 28, color: "#c0c9bd", lineHeight: 1.35, maxWidth: 540 }}>
              Open the link to see your gift and claim it into a wallet only you control.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", flexShrink: 0, whiteSpace: "nowrap", padding: "14px 28px", borderRadius: 10, background: "#b4532a", color: "#fff", fontSize: 26 }}>Claim your gift</div>
            <div style={{ display: "flex", whiteSpace: "nowrap", fontSize: 24, color: "#a3aea4" }}>No account needed</div>
          </div>
        </div>

        {/* The envelope, a note rising out of it */}
        <div style={{ position: "absolute", right: 70, top: 92, width: 430, height: 460, display: "flex" }}>
          {/* back and open flap */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 210, background: "#263d31", borderRadius: 20, display: "flex" }} />
          <svg style={{ position: "absolute", left: 0, bottom: 210 }} width="430" height="120" viewBox="0 0 100 28" preserveAspectRatio="none">
            <path d="M0 28 L44 3 Q50 0 56 3 L100 28 Z" fill="#2a4135" />
          </svg>
          {/* note */}
          <div style={{ position: "absolute", left: 30, right: 30, top: 34, height: 330, background: PAPER, borderRadius: 14, display: "flex", flexDirection: "column", padding: "30px 32px", boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 3, color: "#9a4420" }}>FOR YOU</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
              <svg width="58" height="58" viewBox="0 0 3756.09 3756.49">
                <g transform="translate(-371.96 -371.75)">
                  <path d={MONERO_DISC} fill="#fff" />
                  <path d={MONERO_UPPER} fill="#f26822" />
                  <path d={MONERO_LOWER} fill="#4d4d4d" />
                </g>
              </svg>
              <div style={{ fontSize: 46, fontWeight: 700, color: DEEP, letterSpacing: -1 }}>XMR</div>
            </div>
            <div style={{ display: "flex", marginTop: 26, height: 4, width: 180, background: "#b4532a", borderRadius: 2 }} />
            <div style={{ display: "flex", marginTop: 16, height: 14, width: 290, background: "#e4e3d8", borderRadius: 7 }} />
            <div style={{ display: "flex", marginTop: 12, height: 14, width: 220, background: "#e4e3d8", borderRadius: 7 }} />
          </div>
          {/* front pocket */}
          <svg style={{ position: "absolute", left: 0, bottom: 0 }} width="430" height="210" viewBox="0 0 100 49" preserveAspectRatio="none">
            <path d="M0 0 L50 27 L100 0 L100 44 Q100 49 95 49 L5 49 Q0 49 0 44 Z" fill="#2f4a3b" />
          </svg>
          {/* seal */}
          <div style={{ position: "absolute", left: 180, bottom: 100, width: 70, height: 70, borderRadius: 35, background: "#b4532a", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(0,0,0,0.35)", border: "4px solid #c96a40" }}>
            <Monk size={36} hood={PAPER} />
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
