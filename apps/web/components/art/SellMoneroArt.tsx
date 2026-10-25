import { MoneroSymbol } from "./MoneroSymbol";
import { Adaptive } from "./WhatIsMoneroNarrowArt";

/** Figure for the "How to sell Monero" guide. Ink-on-paper line art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const GREY = "#6b7a70";
const PAPER = "#fbfbf7";
const MINT = "#e4efe7";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;
const SANS = { fontFamily: "var(--font-sans)" } as const;

const ARIA =
  "Selling Monero peer to peer on a Haveno network such as RetoSwap, in four steps. One: you lock the XMR you sell plus a security deposit, and the buyer locks a deposit, in a 2-of-3 multisig escrow held by you, the buyer and an arbitrator. Two: the buyer pays you outside the app, for example by bank transfer. Three: you check the money really arrived, from the name in the trade. Four: you confirm, the XMR goes to the buyer and both deposits come back. If something goes wrong, the arbitrator decides.";

const STEPS = [
  { n: "1", title: "You lock XMR", sub: "plus a deposit, in escrow" },
  { n: "2", title: "Buyer pays you", sub: "outside the app" },
  { n: "3", title: "You check it", sub: "right amount, right name" },
  { n: "4", title: "You confirm", sub: "buyer gets the XMR" },
];

function Step({ x, y, s, w }: { x: number; y: number; s: (typeof STEPS)[number]; w: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={86} rx="5" fill={s.n === "3" ? MINT : PAPER} stroke={FOREST} strokeWidth="1.4" />
      <circle cx={x + 22} cy={y + 24} r="11" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
      <text x={x + 22} y={y + 28.5} fontSize="12" fill={CLAY} textAnchor="middle" style={SANS}>{s.n}</text>
      <text x={x + 42} y={y + 29} fontSize="15" fill={FOREST} style={LABEL}>{s.title}</text>
      <text x={x + 16} y={y + 64} fontSize="12.5" fill={GREY} style={LABEL}>{s.sub}</text>
    </g>
  );
}

function Wide() {
  const w = 154;
  return (
    <svg viewBox="0 0 720 230" width="100%" role="img" aria-label={ARIA}>
      {STEPS.map((s, i) => (
        <g key={s.n}>
          <Step x={14 + i * 176} y={30} s={s} w={w} />
          {i < 3 ? <path d={`M${14 + i * 176 + w + 3} 73 H${14 + (i + 1) * 176 - 3} M${14 + (i + 1) * 176 - 9} 68 L${14 + (i + 1) * 176 - 3} 73 L${14 + (i + 1) * 176 - 9} 78`} stroke={CLAY} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        </g>
      ))}
      <g transform="translate(91 150)">
        <rect x="-70" y="0" width="140" height="56" rx="5" fill={PAPER} stroke={FOREST} strokeWidth="1.2" strokeDasharray="4 4" />
        <MoneroSymbol variant="color" size={22} x={-62} y={8} />
        <text x="-34" y="23" fontSize="12" fill={FOREST} style={LABEL}>2-of-3 escrow:</text>
        <text x="-62" y="44" fontSize="12" fill={GREY} style={LABEL}>you, buyer, arbitrator</text>
      </g>
      <path d="M91 120 V148" stroke={FOREST} strokeWidth="1.2" strokeDasharray="3 4" />
      <text x={440} y={182} fontSize="13.5" fill={CLAY} textAnchor="middle" style={LABEL}>Never confirm before the money is really in your account.</text>
    </svg>
  );
}

function Narrow() {
  return (
    <svg viewBox="0 0 360 500" width="100%" role="img" aria-label={ARIA}>
      {STEPS.map((s, i) => (
        <g key={s.n}>
          <Step x={50} y={10 + i * 112} s={s} w={260} />
          {i < 3 ? <path d={`M180 ${100 + i * 112} V${118 + i * 112} M175 ${112 + i * 112} L180 ${118 + i * 112} L185 ${112 + i * 112}`} stroke={CLAY} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        </g>
      ))}
      <text x={180} y={470} fontSize="13" fill={CLAY} textAnchor="middle" style={LABEL}>Never confirm before the money</text>
      <text x={180} y={488} fontSize="13" fill={CLAY} textAnchor="middle" style={LABEL}>is really in your account.</text>
    </svg>
  );
}

/** The four steps of a peer-to-peer sale on a Haveno network. */
export function SellP2pStepsArt() {
  return <Adaptive wide={<Wide />} narrow={<Narrow />} />;
}
