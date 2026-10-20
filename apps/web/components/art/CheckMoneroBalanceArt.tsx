import { MoneroSymbol } from "./MoneroSymbol";
import { Adaptive } from "./WhatIsMoneroNarrowArt";

/** Figures for the "Check a Monero balance" guide. Ink-on-paper line art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const GREY = "#6b7a70";
const PAPER = "#fbfbf7";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

const ARIA =
  "What each thing you hold lets you see. An address alone: nothing, because payments go to one-time addresses and amounts are hidden. An address plus the private view key: incoming payments, but today not reliably the outgoing ones. The recovery words: the full balance, and the power to spend it. Never type recovery words into a balance checker.";

const TIERS = [
  { title: "Address only", sees: ["no payments", "no amounts", "no balance"], note: "anyone can have this", color: GREY, dash: true },
  { title: "Address + view key", sees: ["incoming payments", "their amounts", "not reliable spends"], note: "a watch-only wallet", color: FOREST, dash: false },
  { title: "Recovery words", sees: ["full balance", "full history", "can spend it"], note: "never type into a checker", color: CLAY, dash: false },
];

function Eye({ x, y, open, color }: { x: number; y: number; open: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth="1.5">
      <path d={`M-18 0 Q0 ${-14 * open - 2} 18 0 Q0 ${14 * open + 2} -18 0`} />
      {open > 0 ? <circle cx="0" cy="0" r={4 * open + 1} /> : <path d="M-18 0 H18" />}
    </g>
  );
}

function Wide() {
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label={ARIA}>
      {TIERS.map((t, i) => {
        const x = 20 + i * 236;
        return (
          <g key={t.title}>
            <rect x={x} y="40" width="208" height="200" rx="4" fill={PAPER} stroke={t.color} strokeWidth="1.4" strokeDasharray={t.dash ? "4 4" : undefined} />
            <text x={x + 104} y="28" fontSize="15" fill={t.color} textAnchor="middle" style={LABEL}>{t.title}</text>
            {i === 2 ? <MoneroSymbol variant="mono" size={30} x={x + 89} y={56} style={{ color: CLAY }} /> : <Eye x={x + 104} y={72} open={i * 0.6} color={t.color} />}
            {t.sees.map((s, k) => (
              <text key={s} x={x + 104} y={124 + k * 26} fontSize="14.5" fill={i === 0 ? GREY : FOREST} textAnchor="middle" style={LABEL}>{s}</text>
            ))}
            <text x={x + 104} y="222" fontSize="12.5" fill={t.color} textAnchor="middle" style={LABEL}>{t.note}</text>
            {i < 2 ? <path d={`M${x + 212} 140 H${x + 232} M${x + 226} 135 L${x + 232} 140 L${x + 226} 145`} stroke={GREY} strokeWidth="1.3" fill="none" /> : null}
          </g>
        );
      })}
      <text x="360" y="282" fontSize="13" fill={FOREST} textAnchor="middle" style={LABEL}>The more you can see, the more you must protect. A balance never needs the recovery words.</text>
    </svg>
  );
}

function Narrow() {
  return (
    <svg viewBox="0 0 360 560" width="100%" role="img" aria-label={ARIA}>
      {TIERS.map((t, i) => {
        const y = 10 + i * 172;
        return (
          <g key={t.title}>
            <rect x="10" y={y} width="340" height="150" rx="4" fill={PAPER} stroke={t.color} strokeWidth="1.4" strokeDasharray={t.dash ? "4 4" : undefined} />
            <text x="26" y={y + 30} fontSize="17" fill={t.color} style={LABEL}>{t.title}</text>
            {i === 2 ? <MoneroSymbol variant="mono" size={28} x={306} y={y + 12} style={{ color: CLAY }} /> : <Eye x={318} y={y + 26} open={i * 0.6} color={t.color} />}
            {t.sees.map((s, k) => (
              <text key={s} x="26" y={y + 62 + k * 22} fontSize="14.5" fill={i === 0 ? GREY : FOREST} style={LABEL}>{s}</text>
            ))}
            <text x="334" y={y + 136} fontSize="12.5" fill={t.color} textAnchor="end" style={LABEL}>{t.note}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** What an address, a view key and the recovery words each reveal. */
export function BalanceVisibilityArt() {
  return <Adaptive wide={<Wide />} narrow={<Narrow />} />;
}
