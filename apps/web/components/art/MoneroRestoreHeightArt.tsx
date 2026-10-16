/** Figures for the "Monero restore height" article. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

/** The blockchain as a timeline with the restore height flag. */
export function RestoreHeightTimelineArt() {
  return (
    <svg viewBox="0 0 720 280" width="100%" role="img" aria-label="A timeline of the Monero blockchain from block 0 in April 2014 to today. A flag marks the restore height, placed shortly before the wallet's first payment. The wallet skips everything to the left of the flag and scans everything to the right.">
      <defs>
        <marker id="rh-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke={CLAY} strokeWidth="1.4" />
        </marker>
      </defs>
      <rect x="40" y="130" width="330" height="22" fill="none" stroke={FOREST} strokeWidth="1.2" strokeDasharray="3 4" opacity="0.55" />
      <rect x="370" y="130" width="310" height="22" fill={PAPER} stroke={CLAY} strokeWidth="1.6" />
      <text x="205" y="124" fontSize="14" fill={FOREST} textAnchor="middle" opacity="0.8" style={LABEL}>skipped, nothing of yours is here</text>
      <text x="525" y="124" fontSize="14" fill={CLAY} textAnchor="middle" style={LABEL}>scanned for your payments</text>

      <text x="40" y="176" fontSize="13" fill={FOREST} style={LABEL}>Block 0</text>
      <text x="40" y="194" fontSize="12" fill={FOREST} style={LABEL}>April 2014</text>
      <text x="680" y="176" fontSize="13" fill={FOREST} textAnchor="end" style={LABEL}>Tip</text>
      <text x="680" y="194" fontSize="12" fill={FOREST} textAnchor="end" style={LABEL}>about 3.8 million blocks</text>

      <path d="M 370 130 L 370 46" stroke={CLAY} strokeWidth="1.8" fill="none" />
      <path d="M 370 46 L 424 58 L 370 72 Z" fill={CLAY} stroke={CLAY} strokeWidth="1" strokeLinejoin="round" />
      <text x="370" y="34" fontSize="16" fill={CLAY} textAnchor="middle" style={LABEL}>Restore height</text>

      <circle cx="430" cy="141" r="6" fill={PAPER} stroke={FOREST} strokeWidth="1.6" />
      <path d="M 430 156 L 430 222" stroke={FOREST} strokeWidth="1.2" fill="none" />
      <text x="430" y="240" fontSize="13" fill={FOREST} textAnchor="middle" style={LABEL}>your first payment</text>

      <path d="M 372 104 L 440 104" stroke={CLAY} strokeWidth="1.4" fill="none" markerEnd="url(#rh-arrow)" />
      <text x="40" y="266" fontSize="12" fill={FOREST} style={LABEL}>Put the flag at or before your first payment. Left of it you lose nothing by skipping; right of it you lose nothing by scanning.</text>
    </svg>
  );
}

/** Too high versus too low. */
export function RestoreHeightMistakesArt() {
  const row = (y: number, flagX: number, label: string, outcome: string, bad: boolean) => (
    <g>
      <text x="24" y={y - 14} fontSize="15" fill={bad ? CLAY : FOREST} style={LABEL}>{label}</text>
      <line x1="24" y1={y + 18} x2="696" y2={y + 18} stroke={FOREST} strokeWidth="1.2" />
      <circle cx="320" cy={y + 18} r="6" fill={PAPER} stroke={FOREST} strokeWidth="1.6" />
      <path d={`M ${flagX} ${y + 18} L ${flagX} ${y - 10}`} stroke={CLAY} strokeWidth="1.8" fill="none" />
      <path d={`M ${flagX} ${y - 10} L ${flagX + 18} ${y - 4} L ${flagX} ${y + 2} Z`} fill={CLAY} />
      <text x="696" y={y - 14} fontSize="13" fill={bad ? CLAY : FOREST} textAnchor="end" style={LABEL}>{outcome}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 720 270" width="100%" role="img" aria-label="Three placements of the restore height flag relative to the first payment. Well before it: works, only slower. Just before it: ideal. After it: the first payment is skipped and the balance is wrong.">
      {row(48, 120, "Flag well before the first payment", "works, scan takes longer", false)}
      {row(124, 300, "Flag just before the first payment", "best choice", false)}
      {row(200, 480, "Flag after the first payment", "payments missed, balance too low", true)}
      <text x="320" y="254" fontSize="12" fill={FOREST} textAnchor="middle" style={LABEL}>The circle is your first payment. The flag is the restore height.</text>
    </svg>
  );
}
