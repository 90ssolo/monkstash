import { MoneroSymbol } from "./MoneroSymbol";
import { Adaptive } from "./WhatIsMoneroNarrowArt";

/** Figure for the "Why was Monero delisted?" guide. Ink-on-paper line art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const GREY = "#6b7a70";
const PAPER = "#fbfbf7";
const MINT = "#e4efe7";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;
const SANS = { fontFamily: "var(--font-sans)" } as const;

const ARIA =
  "What an exchange's compliance team can check. For a bitcoin deposit, the public chain shows the sending address, where they came from and where they go next, so tracing tools can score them. For a Monero deposit, the chain hides all three, so the same tools have nothing to score. Many exchanges and some regulators chose to stop listing coins they cannot trace.";

function Panel({ x, y, w, title, coin, rows, ok }: { x: number; y: number; w: number; title: string; coin: "btc" | "xmr"; rows: string[]; ok: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={190} rx="5" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      {coin === "btc" ? (
        <g transform={`translate(${x + 34} ${y + 32})`}>
          <circle r="16" fill={PAPER} stroke={GREY} strokeWidth="1.6" />
          <text y="4" fontSize="9" fontWeight="700" fill={GREY} textAnchor="middle" style={SANS}>BTC</text>
        </g>
      ) : (
        <MoneroSymbol variant="color" size={32} x={x + 18} y={y + 16} />
      )}
      <text x={x + 62} y={y + 37} fontSize="15" fill={FOREST} style={LABEL}>{title}</text>
      {rows.map((r, i) => (
        <g key={r} transform={`translate(${x + 20} ${y + 72 + i * 30})`}>
          <rect width={w - 40} height="22" rx="3" fill={ok ? MINT : PAPER} stroke={ok ? FOREST : GREY} strokeWidth="1" strokeDasharray={ok ? undefined : "3 4"} />
          <text x="10" y="15" fontSize="12" fill={ok ? FOREST : GREY} style={SANS}>{r}</text>
          <text x={w - 52} y="16" fontSize="13" fill={ok ? FOREST : CLAY} textAnchor="end" style={SANS}>{ok ? "visible" : "hidden"}</text>
        </g>
      ))}
    </g>
  );
}

const ROWS = ["the sending address", "where the coins came from", "where they go next"];

function Wide() {
  return (
    <svg viewBox="0 0 720 260" width="100%" role="img" aria-label={ARIA}>
      <Panel x={20} y={20} w={320} title="A bitcoin deposit" coin="btc" rows={ROWS} ok />
      <Panel x={380} y={20} w={320} title="A Monero deposit" coin="xmr" rows={ROWS} ok={false} />
      <text x={180} y={240} fontSize="13" fill={FOREST} textAnchor="middle" style={LABEL}>tracing tools can score it</text>
      <text x={540} y={240} fontSize="13" fill={CLAY} textAnchor="middle" style={LABEL}>nothing for the tools to score</text>
    </svg>
  );
}

function Narrow() {
  return (
    <svg viewBox="0 0 360 470" width="100%" role="img" aria-label={ARIA}>
      <Panel x={20} y={10} w={320} title="A bitcoin deposit" coin="btc" rows={ROWS} ok />
      <text x={180} y={222} fontSize="13" fill={FOREST} textAnchor="middle" style={LABEL}>tracing tools can score it</text>
      <Panel x={20} y={240} w={320} title="A Monero deposit" coin="xmr" rows={ROWS} ok={false} />
      <text x={180} y={452} fontSize="13" fill={CLAY} textAnchor="middle" style={LABEL}>nothing for the tools to score</text>
    </svg>
  );
}

/** What an exchange can check on a deposit: bitcoin versus Monero. */
export function ExchangeViewArt() {
  return <Adaptive wide={<Wide />} narrow={<Narrow />} />;
}
