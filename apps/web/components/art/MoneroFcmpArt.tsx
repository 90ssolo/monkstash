import { MoneroSymbol } from "./MoneroSymbol";

/*
 * Figures for the FCMP++ and Carrot article. Ink-on-paper line art: forest ink, clay accents,
 * grey notes. Each figure has a wide version (720 units) and a stacked phone version (360 units),
 * shown through <Adaptive> so labels stay readable on a 375px screen.
 */

const INK = "#1f4733";
const CLAY = "#b4532a";
const GREY = "#6b7a70";
const PAPER = "#fbfbf7";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

function ringPoints(cx: number, cy: number, r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

/** A ring of 16 members around the coin being spent. */
function Ring16({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts = ringPoints(cx, cy, r, 16);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="7" fill={PAPER} stroke={INK} strokeWidth="1.5" />
      ))}
      <MoneroSymbol variant="color" size={34} x={cx - 17} y={cy - 17} />
    </g>
  );
}

/** A run of blocks, every output inside counted as a possible source. */
function ChainBlocks({ x, y, cols, rows, blockW, gap }: { x: number; y: number; cols: number; rows: number; blockW: number; gap: number }) {
  const blocks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bx = x + c * (blockW + gap);
      const by = y + r * (blockW + gap);
      blocks.push(
        <g key={`${r}-${c}`}>
          <rect x={bx} y={by} width={blockW} height={blockW} rx="3" fill={PAPER} stroke={INK} strokeWidth="1.3" />
          {[0, 1, 2, 3].map((d) => (
            <circle key={d} cx={bx + 9 + (d % 2) * (blockW - 18)} cy={by + 9 + Math.floor(d / 2) * (blockW - 18)} r="3.2" fill={CLAY} />
          ))}
          {c < cols - 1 ? <path d={`M ${bx + blockW} ${by + blockW / 2} h ${gap}`} stroke={INK} strokeWidth="1.2" /> : null}
        </g>,
      );
    }
  }
  return <g>{blocks}</g>;
}

/** Ring of 16 today vs every eligible output under FCMP++ (wide). */
export function FcmpAnonymitySetArt() {
  return (
    <svg viewBox="0 0 720 320" width="100%" role="img" aria-label="Left: today a Monero spend hides among a ring of 16 outputs drawn around the coin. Right: with FCMP++, rows of blocks are shown and every output in every block is marked as a possible source of the coin.">
      <rect x="12" y="12" width="300" height="296" rx="4" fill={PAPER} stroke={INK} strokeWidth="1.2" />
      <text x="162" y="42" textAnchor="middle" fontSize="19" fill={INK} style={LABEL}>Today: a ring of 16</text>
      <Ring16 cx={162} cy={160} r={78} />
      <text x="162" y="270" textAnchor="middle" fontSize="15" fill={INK} style={LABEL}>Your coin hides among 16 outputs</text>
      <text x="162" y="290" textAnchor="middle" fontSize="14" fill={GREY} style={LABEL}>1 real, 15 decoys chosen by your wallet</text>

      <path d="M 324 160 L 380 160 M 370 152 L 380 160 L 370 168" fill="none" stroke={CLAY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="392" y="12" width="316" height="296" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.2" />
      <text x="550" y="42" textAnchor="middle" fontSize="19" fill={CLAY} style={LABEL}>With FCMP++: the whole chain</text>
      <ChainBlocks x={412} y={66} cols={6} rows={4} blockW={38} gap={9} />
      <text x="550" y="270" textAnchor="middle" fontSize="15" fill={INK} style={LABEL}>Every eligible output is a candidate</text>
      <text x="550" y="290" textAnchor="middle" fontSize="14" fill={GREY} style={LABEL}>no decoys to pick, nothing to guess from</text>
    </svg>
  );
}

/** Phone version of the anonymity set figure, stacked. */
export function FcmpAnonymitySetNarrow() {
  return (
    <svg viewBox="0 0 360 560" style={{ width: "100%", height: "auto" }} role="img" aria-label="Top: today a Monero spend hides among a ring of 16 outputs. Bottom: with FCMP++, every output in every block is marked as a possible source of the coin.">
      <rect x="6" y="6" width="348" height="250" rx="4" fill={PAPER} stroke={INK} strokeWidth="1.2" />
      <text x="180" y="34" textAnchor="middle" fontSize="18" fill={INK} style={LABEL}>Today: a ring of 16</text>
      <Ring16 cx={180} cy={130} r={70} />
      <text x="180" y="232" textAnchor="middle" fontSize="14" fill={INK} style={LABEL}>1 real coin, 15 decoys</text>
      <path d="M 180 262 L 180 290 M 172 282 L 180 290 L 188 282" fill="none" stroke={CLAY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6" y="298" width="348" height="256" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.2" />
      <text x="180" y="326" textAnchor="middle" fontSize="18" fill={CLAY} style={LABEL}>With FCMP++: the whole chain</text>
      <ChainBlocks x={30} y={344} cols={5} rows={3} blockW={46} gap={13} />
      <text x="180" y="540" textAnchor="middle" fontSize="14" fill={INK} style={LABEL}>Every eligible output is a candidate</text>
    </svg>
  );
}

const ROAD = [
  { date: "3 Oct 2025", label: "Alpha stressnet", short: ["Alpha", "stressnet"], done: true },
  { date: "6 May 2026", label: "Beta stressnet v1", short: ["Beta", "v1"], done: true },
  { date: "27 May 2026", label: "Beta v2", short: ["Beta", "v2"], done: true },
  { date: "5 Oct 2026", label: "Beta v3", short: ["Beta", "v3"], done: true },
  { date: "ongoing", label: "Audits and review", short: ["Audits,", "review"], done: false },
  { date: "no date set", label: "Mainnet upgrade", short: ["Mainnet", "upgrade"], done: false },
];

/** The public test timeline, from the release notes (wide). */
export function FcmpRoadArt() {
  const x0 = 50;
  const step = 100;
  return (
    <svg viewBox="0 0 600 170" width="100%" role="img" aria-label="Timeline: alpha stressnet forked 3 October 2025, beta stressnet v1 on 6 May 2026, beta v2 on 27 May 2026, beta v3 on 5 October 2026. Audits and review are ongoing. The mainnet upgrade has no date set.">
      <path d={`M ${x0} 70 H ${x0 + step * 3}`} stroke={INK} strokeWidth="2" />
      <path d={`M ${x0 + step * 3} 70 H ${x0 + step * 5}`} stroke={CLAY} strokeWidth="2" strokeDasharray="6 6" />
      {ROAD.map((s, i) => {
        const x = x0 + i * step;
        const last = i === ROAD.length - 1;
        const [l1, l2] = s.short;
        return (
          <g key={s.label}>
            {last ? (
              <MoneroSymbol variant="mono" size={30} x={x - 15} y={55} style={{ color: CLAY }} />
            ) : (
              <circle cx={x} cy={70} r="9" fill={s.done ? INK : PAPER} stroke={s.done ? INK : CLAY} strokeWidth="1.8" />
            )}
            <text x={x} y="36" textAnchor="middle" fontSize="14" fill={s.done ? GREY : CLAY} style={LABEL}>{s.date}</text>
            <text x={x} y="112" textAnchor="middle" fontSize="16" fill={s.done ? INK : CLAY} style={LABEL}>{l1}</text>
            <text x={x} y="132" textAnchor="middle" fontSize="16" fill={s.done ? INK : CLAY} style={LABEL}>{l2}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Phone version of the timeline, vertical. */
export function FcmpRoadNarrow() {
  const y0 = 40;
  const step = 62;
  return (
    <svg viewBox="0 0 360 430" style={{ width: "100%", height: "auto" }} role="img" aria-label="Timeline: alpha stressnet forked 3 October 2025, beta stressnet v1 on 6 May 2026, beta v2 on 27 May 2026, beta v3 on 5 October 2026. Audits and review are ongoing. The mainnet upgrade has no date set.">
      <path d={`M 60 ${y0} V ${y0 + step * 3}`} stroke={INK} strokeWidth="2" />
      <path d={`M 60 ${y0 + step * 3} V ${y0 + step * 5}`} stroke={CLAY} strokeWidth="2" strokeDasharray="6 6" />
      {ROAD.map((s, i) => {
        const y = y0 + i * step;
        const last = i === ROAD.length - 1;
        return (
          <g key={s.label}>
            {last ? (
              <MoneroSymbol variant="mono" size={30} x={45} y={y - 15} style={{ color: CLAY }} />
            ) : (
              <circle cx={60} cy={y} r="9" fill={s.done ? INK : PAPER} stroke={s.done ? INK : CLAY} strokeWidth="1.8" />
            )}
            <text x="92" y={y - 4} fontSize="16" fill={s.done ? INK : CLAY} style={LABEL}>{s.label}</text>
            <text x="92" y={y + 16} fontSize="13" fill={s.done ? GREY : CLAY} style={LABEL}>{s.date}</text>
          </g>
        );
      })}
      <text x="180" y="400" textAnchor="middle" fontSize="12" fill={GREY} style={LABEL}>Stressnet coins have no value.</text>
      <text x="180" y="418" textAnchor="middle" fontSize="12" fill={GREY} style={LABEL}>Dates from the seraphis-migration release notes.</text>
    </svg>
  );
}
