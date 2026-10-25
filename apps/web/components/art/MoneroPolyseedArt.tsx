import { Adaptive } from "./WhatIsMoneroNarrowArt";

/** Figures for the "Monero Polyseed" guide. Ink-on-paper line art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const GREY = "#6b7a70";
const PAPER = "#fbfbf7";
const MINT = "#e4efe7";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;
const SANS = { fontFamily: "var(--font-sans)" } as const;

// The 176 bits in 16 words of 11 bits, per the Polyseed specification (tevador/polyseed).
const PARTS = [
  { bits: 150, name: "your secret", note: "150 bits: the wallet itself", fill: MINT, stroke: FOREST },
  { bits: 10, name: "birthday", note: "10 bits: the month it was made", fill: PAPER, stroke: CLAY },
  { bits: 5, name: "features", note: "5 bits: e.g. passphrase-encrypted", fill: PAPER, stroke: GREY },
  { bits: 11, name: "checksum", note: "11 bits: catches a wrong word", fill: PAPER, stroke: GREY },
];

const ANATOMY_ARIA =
  "What 16 Polyseed words hold. Each word carries 11 bits, 176 bits in all: 150 bits are the wallet's secret, 10 bits record the month the wallet was made (its birthday, so no restore height is needed), 5 bits are feature flags such as passphrase encryption, and 11 bits are a checksum that catches a wrong word.";

function AnatomyWide() {
  const x0 = 30;
  const width = 660;
  let x = x0;
  const segs = PARTS.map((p) => {
    const w = (p.bits / 176) * width;
    const s = { ...p, x, w };
    x += w;
    return s;
  });
  return (
    <svg viewBox="0 0 720 250" width="100%" role="img" aria-label={ANATOMY_ARIA}>
      {Array.from({ length: 16 }, (_, i) => {
        const w = width / 16;
        return (
          <g key={i}>
            <rect x={x0 + i * w + 2} y={24} width={w - 4} height={30} rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
            <text x={x0 + i * w + w / 2} y={44} fontSize="11" fill={FOREST} textAnchor="middle" style={SANS}>{i + 1}</text>
          </g>
        );
      })}
      <text x={360} y={78} fontSize="13" fill={GREY} textAnchor="middle" style={LABEL}>16 words of 11 bits each: 176 bits</text>
      {segs.map((s) => (
        <rect key={s.name} x={s.x} y={96} width={s.w} height={34} fill={s.fill} stroke={s.stroke} strokeWidth="1.4" />
      ))}
      <text x={segs[0]!.x + segs[0]!.w / 2} y={118} fontSize="14" fill={FOREST} textAnchor="middle" style={LABEL}>your secret (150 bits)</text>
      {segs.slice(1).map((s, i) => {
        const lx = 470 + i * 0;
        const ly = 166 + i * 24;
        return (
          <g key={s.name}>
            <path d={`M${s.x + s.w / 2} 130 V${ly - 4} H${lx + 132}`} fill="none" stroke={s.stroke} strokeWidth="1.2" />
            <text x={lx + 126} y={ly} fontSize="13" fill={s.stroke === GREY ? GREY : CLAY} textAnchor="end" style={LABEL}>{s.note}</text>
          </g>
        );
      })}
      <text x={30} y={176} fontSize="13" fill={FOREST} style={LABEL}>The birthday is why a Polyseed</text>
      <text x={30} y={194} fontSize="13" fill={FOREST} style={LABEL}>never needs a restore height.</text>
    </svg>
  );
}

function AnatomyNarrow() {
  return (
    <svg viewBox="0 0 360 330" width="100%" role="img" aria-label={ANATOMY_ARIA}>
      {Array.from({ length: 16 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <g key={i}>
            <rect x={30 + col * 76} y={12 + row * 34} width={68} height={26} rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
            <text x={64 + col * 76} y={30 + row * 34} fontSize="12" fill={FOREST} textAnchor="middle" style={SANS}>{i + 1}</text>
          </g>
        );
      })}
      <text x={180} y={168} fontSize="13" fill={GREY} textAnchor="middle" style={LABEL}>16 words x 11 bits = 176 bits</text>
      {PARTS.map((p, i) => (
        <g key={p.name}>
          <rect x={30} y={184 + i * 34} width={Math.max(18, (p.bits / 150) * 120)} height={24} fill={p.fill} stroke={p.stroke} strokeWidth="1.3" />
          <text x={162} y={201 + i * 34} fontSize="13" fill={p.stroke === GREY ? GREY : p.stroke === CLAY ? CLAY : FOREST} style={LABEL}>{p.note}</text>
        </g>
      ))}
    </svg>
  );
}

/** What the 16 words of a Polyseed carry. */
export function PolyseedAnatomyArt() {
  return <Adaptive wide={<AnatomyWide />} narrow={<AnatomyNarrow />} />;
}

const ONEWAY_ARIA =
  "The conversion goes one way. A 16-word Polyseed runs through a one-way key derivation to make the wallet's key, which can be written as a 25-word seed for the same wallet. A 25-word seed cannot be turned back into a Polyseed.";

function Card({ x, y, w, h, title, sub, n }: { x: number; y: number; w: number; h: number; title: string; sub: string; n: number }) {
  const cols = 2;
  const rows = Math.ceil(n / cols);
  const gap = (h - 58) / rows;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x={x + w / 2} y={y + 22} fontSize="15" fill={FOREST} textAnchor="middle" style={LABEL}>{title}</text>
      {Array.from({ length: n }, (_, i) => {
        const cx = x + 14 + (i % cols) * ((w - 28) / cols);
        const cy = y + 36 + Math.floor(i / cols) * gap;
        return <line key={i} x1={cx} y1={cy} x2={cx + (w - 28) / cols - 12} y2={cy} stroke={FOREST} strokeWidth="0.9" opacity="0.55" />;
      })}
      <text x={x + w / 2} y={y + h - 10} fontSize="12" fill={GREY} textAnchor="middle" style={LABEL}>{sub}</text>
    </g>
  );
}

function OneWayWide() {
  return (
    <svg viewBox="0 0 720 230" width="100%" role="img" aria-label={ONEWAY_ARIA}>
      <Card x={40} y={30} w={170} h={150} n={16} title="Polyseed, 16 words" sub="Feather, Cake Wallet" />
      <path d="M216 90 H496 M488 84 L496 90 L488 96" stroke={CLAY} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={356} y={78} fontSize="13" fill={CLAY} textAnchor="middle" style={LABEL}>one-way key derivation</text>
      <path d="M496 130 H216 M224 124 L216 130 L224 136" stroke={GREY} strokeWidth="1.4" fill="none" strokeDasharray="4 5" strokeLinecap="round" />
      <path d="M346 118 L366 142 M366 118 L346 142" stroke={CLAY} strokeWidth="2" strokeLinecap="round" />
      <text x={356} y={164} fontSize="13" fill={GREY} textAnchor="middle" style={LABEL}>no way back</text>
      <Card x={500} y={20} w={180} h={170} n={25} title="Legacy, 25 words" sub="the same wallet" />
    </svg>
  );
}

function OneWayNarrow() {
  return (
    <svg viewBox="0 0 360 470" width="100%" role="img" aria-label={ONEWAY_ARIA}>
      <Card x={95} y={10} w={170} h={140} n={16} title="Polyseed, 16 words" sub="Feather, Cake Wallet" />
      <path d="M160 156 V280 M154 272 L160 280 L166 272" stroke={CLAY} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={150} y={214} fontSize="13" fill={CLAY} textAnchor="end" style={LABEL}>one way</text>
      <path d="M200 280 V156 M194 164 L200 156 L206 164" stroke={GREY} strokeWidth="1.4" fill="none" strokeDasharray="4 5" strokeLinecap="round" />
      <path d="M190 208 L210 228 M210 208 L190 228" stroke={CLAY} strokeWidth="2" strokeLinecap="round" />
      <text x={218} y={222} fontSize="13" fill={GREY} style={LABEL}>no way back</text>
      <Card x={90} y={288} w={180} h={170} n={25} title="Legacy, 25 words" sub="the same wallet" />
    </svg>
  );
}

/** Polyseed to 25 words works; 25 words to Polyseed does not. */
export function PolyseedOneWayArt() {
  return <Adaptive wide={<OneWayWide />} narrow={<OneWayNarrow />} />;
}
