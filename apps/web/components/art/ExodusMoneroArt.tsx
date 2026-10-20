import { MoneroSymbol } from "./MoneroSymbol";
import { Adaptive } from "./WhatIsMoneroNarrowArt";

/** Figures for the "Exodus Monero" guide. Ink-on-paper line art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const GREY = "#6b7a70";
const PAPER = "#fbfbf7";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

const ARIA =
  "Two ways into the same Monero wallet. Path one: your 12-word Exodus phrase is converted, using the derivation path m/44'/128'/0'/0/0, into the standard 25-word Monero seed. Path two: the 25-word Monero mnemonic that Exodus Desktop could show you. Both open the same wallet on the Monero network, where your XMR has been all along.";

function WordCard({ x, y, w, h, n, title, sub, stroke }: { x: number; y: number; w: number; h: number; n: number; title: string; sub: string; stroke: string }) {
  const cols = 2;
  const rows = Math.ceil(n / cols);
  const gap = (h - 64) / rows;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={PAPER} stroke={stroke} strokeWidth="1.4" />
      <text x={x + w / 2} y={y + 22} fontSize="15" fill={stroke} textAnchor="middle" style={LABEL}>{title}</text>
      {Array.from({ length: n }, (_, i) => {
        const cx = x + 14 + (i % cols) * ((w - 28) / cols);
        const cy = y + 38 + Math.floor(i / cols) * gap;
        return <line key={i} x1={cx} y1={cy} x2={cx + (w - 28) / cols - 12} y2={cy} stroke={FOREST} strokeWidth="0.9" opacity="0.55" />;
      })}
      <text x={x + w / 2} y={y + h - 10} fontSize="12" fill={GREY} textAnchor="middle" style={LABEL}>{sub}</text>
    </g>
  );
}

function Arrow({ d, color = CLAY }: { d: string; color?: string }) {
  return <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

function Wide() {
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label={ARIA}>
      <WordCard x={20} y={30} w={150} h={150} n={12} title="Exodus, 12 words" sub="your Exodus phrase" stroke={FOREST} />
      <Arrow d="M174 105 H300 M292 99 L300 105 L292 111" />
      <text x="237" y="92" fontSize="12.5" fill={CLAY} textAnchor="middle" style={LABEL}>converted on</text>
      <text x="237" y="126" fontSize="12.5" fill={CLAY} textAnchor="middle" style={LABEL}>your device</text>

      <WordCard x={304} y={20} w={170} h={170} n={25} title="Monero, 25 words" sub="the same wallet" stroke={FOREST} />

      <Arrow d="M478 105 H560 M552 99 L560 105 L552 111" />

      <circle cx="626" cy="105" r="58" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <MoneroSymbol variant="color" size={46} x={603} y={66} />
      <text x="626" y="134" fontSize="13" fill={FOREST} textAnchor="middle" style={LABEL}>your XMR,</text>
      <text x="626" y="150" fontSize="13" fill={FOREST} textAnchor="middle" style={LABEL}>still here</text>

      <path d="M389 260 V196" stroke={FOREST} strokeWidth="1.4" fill="none" strokeDasharray="4 4" />
      <path d="M383 204 L389 196 L395 204" stroke={FOREST} strokeWidth="1.4" fill="none" />
      <text x="389" y="280" fontSize="13" fill={FOREST} textAnchor="middle" style={LABEL}>or: the 25-word Monero mnemonic Exodus Desktop showed you</text>
      <text x="20" y="214" fontSize="12.5" fill={GREY} style={LABEL}>Exodus never held the coins.</text>
      <text x="20" y="232" fontSize="12.5" fill={GREY} style={LABEL}>It only stopped showing them.</text>
    </svg>
  );
}

function Narrow() {
  return (
    <svg viewBox="0 0 360 560" width="100%" role="img" aria-label={ARIA}>
      <WordCard x={90} y={10} w={180} h={130} n={12} title="Exodus, 12 words" sub="your Exodus phrase" stroke={FOREST} />
      <Arrow d="M180 146 V200 M174 192 L180 200 L186 192" />
      <text x="196" y="178" fontSize="13" fill={CLAY} style={LABEL}>converted on your device</text>

      <WordCard x={80} y={206} w={200} h={160} n={25} title="Monero, 25 words" sub="the same wallet" stroke={FOREST} />
      <text x="180" y="390" fontSize="12.5" fill={FOREST} textAnchor="middle" style={LABEL}>or the 25-word mnemonic Exodus Desktop showed</text>

      <Arrow d="M180 400 V432 M174 424 L180 432 L186 424" />
      <circle cx="180" cy="486" r="52" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <MoneroSymbol variant="color" size={40} x={160} y={450} />
      <text x="180" y="508" fontSize="13" fill={FOREST} textAnchor="middle" style={LABEL}>your XMR,</text>
      <text x="180" y="524" fontSize="13" fill={FOREST} textAnchor="middle" style={LABEL}>still here</text>
    </svg>
  );
}

/** Both routes back into an Exodus Monero wallet. */
export function ExodusRestorePathsArt() {
  return <Adaptive wide={<Wide />} narrow={<Narrow />} />;
}

const STEPS_ARIA =
  "Four steps after the restore. One: the wallet syncs from your restore date. Two: compare the address with an old Exodus receive address. Three: send a small test amount. Four: optionally move everything to a brand new wallet with fresh words.";

const STEPS = [
  { t1: "Sync from", t2: "your date" },
  { t1: "Match the", t2: "address" },
  { t1: "Send a small", t2: "test amount" },
  { t1: "Move to a", t2: "fresh wallet" },
];

/** After the restore: sync, check, test, move. */
export function ExodusAfterRestoreArt() {
  return (
    <Adaptive
      wide={
        <svg viewBox="0 0 720 150" width="100%" role="img" aria-label={STEPS_ARIA}>
          {STEPS.map((s, i) => {
            const x = 20 + i * 176;
            const last = i === STEPS.length - 1;
            return (
              <g key={i}>
                <rect x={x} y="30" width="148" height="74" rx="4" fill={PAPER} stroke={last ? CLAY : FOREST} strokeWidth="1.4" strokeDasharray={last ? "4 4" : undefined} />
                <text x={x + 14} y="22" fontSize="13" fill={CLAY} style={LABEL}>{i + 1}</text>
                <text x={x + 74} y="62" fontSize="15" fill={FOREST} textAnchor="middle" style={LABEL}>{s.t1}</text>
                <text x={x + 74} y="82" fontSize="15" fill={FOREST} textAnchor="middle" style={LABEL}>{s.t2}</text>
                {!last ? <Arrow d={`M${x + 152} 67 H${x + 172} M${x + 166} 62 L${x + 172} 67 L${x + 166} 72`} color={FOREST} /> : null}
              </g>
            );
          })}
          <text x="636" y="128" fontSize="12" fill={GREY} textAnchor="middle" style={LABEL}>optional</text>
        </svg>
      }
      narrow={
        <svg viewBox="0 0 360 380" width="100%" role="img" aria-label={STEPS_ARIA}>
          {STEPS.map((s, i) => {
            const y = 10 + i * 92;
            const last = i === STEPS.length - 1;
            return (
              <g key={i}>
                <rect x="60" y={y} width="240" height="62" rx="4" fill={PAPER} stroke={last ? CLAY : FOREST} strokeWidth="1.4" strokeDasharray={last ? "4 4" : undefined} />
                <text x="40" y={y + 37} fontSize="16" fill={CLAY} textAnchor="middle" style={LABEL}>{i + 1}</text>
                <text x="180" y={y + 37} fontSize="16" fill={FOREST} textAnchor="middle" style={LABEL}>{s.t1} {s.t2}{last ? " (optional)" : ""}</text>
                {!last ? <Arrow d={`M180 ${y + 66} V${y + 88} M175 ${y + 82} L180 ${y + 88} L185 ${y + 82}`} color={FOREST} /> : null}
              </g>
            );
          })}
        </svg>
      }
    />
  );
}
