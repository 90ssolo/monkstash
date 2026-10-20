/** Figures for the "Monero ring signatures" article. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

function ringPoints(cx: number, cy: number, r: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}

/** A ring of 16: you know which one is real, an outsider sees sixteen equal members. */
export function RingOfSixteenArt() {
  const real = 5;
  const left = ringPoints(190, 150, 86, 16);
  const right = ringPoints(530, 150, 86, 16);
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="Two rings of sixteen circles. On the left, the sender's view: fifteen decoys and one real signer, marked in clay. On the right, an outsider's view: sixteen identical circles, with no way to tell which one signed.">
      <text x="190" y="22" textAnchor="middle" fontSize="16" fill={FOREST} style={LABEL}>What the sender knows</text>
      <text x="530" y="22" textAnchor="middle" fontSize="16" fill={CLAY} style={LABEL}>What everyone else sees</text>
      <circle cx="190" cy="150" r="86" fill="none" stroke={FOREST} strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />
      <circle cx="530" cy="150" r="86" fill="none" stroke={FOREST} strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />
      {left.map((p, i) => (
        <circle key={`l${i}`} cx={p.x} cy={p.y} r={i === real ? 11 : 9} fill={i === real ? CLAY : PAPER} stroke={i === real ? CLAY : FOREST} strokeWidth="1.6" />
      ))}
      {right.map((p, i) => (
        <circle key={`r${i}`} cx={p.x} cy={p.y} r="9" fill={PAPER} stroke={FOREST} strokeWidth="1.6" />
      ))}
      <text x="190" y="146" textAnchor="middle" fontSize="14" fill={FOREST} style={LABEL}>1 real signer</text>
      <text x="190" y="166" textAnchor="middle" fontSize="14" fill={FOREST} style={LABEL}>15 decoys</text>
      <text x="530" y="146" textAnchor="middle" fontSize="14" fill={FOREST} style={LABEL}>16 possible</text>
      <text x="530" y="166" textAnchor="middle" fontSize="14" fill={FOREST} style={LABEL}>signers</text>
      <text x="360" y="154" textAnchor="middle" fontSize="26" fill={FOREST} style={LABEL}>vs</text>
      <text x="360" y="288" textAnchor="middle" fontSize="13" fill={FOREST} style={LABEL}>The signature proves one member approved the payment. It never says which.</text>
    </svg>
  );
}

/** A key image: the same coin always yields the same marker, so a second spend is rejected. */
export function KeyImageArt() {
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="Two spends of the same coin. The first spend produces key image K7 and is accepted onto the list of used key images. The second spend of the same coin produces the same key image K7, which is already on the list, so the network rejects it.">
      <rect x="24" y="20" width="300" height="130" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="40" y="46" fontSize="16" fill={FOREST} style={LABEL}>First spend</text>
      <circle cx="70" cy="96" r="20" fill="none" stroke={FOREST} strokeWidth="1.6" />
      <text x="70" y="101" textAnchor="middle" fontSize="13" fill={FOREST} style={LABEL}>coin</text>
      <path d="M 94 96 L 150 96 M 142 90 L 150 96 L 142 102" fill="none" stroke={FOREST} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="156" y="78" width="62" height="36" rx="3" fill="none" stroke={CLAY} strokeWidth="1.6" />
      <text x="187" y="101" textAnchor="middle" fontSize="15" fill={CLAY} style={LABEL}>key K7</text>
      <path d="M 222 96 L 262 96 M 254 90 L 262 96 L 254 102" fill="none" stroke={FOREST} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 272 84 l 8 10 l 18 -22" fill="none" stroke={FOREST} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="40" y="136" fontSize="13" fill={FOREST} style={LABEL}>Accepted. K7 is written to the used list.</text>

      <rect x="24" y="166" width="300" height="114" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
      <text x="40" y="192" fontSize="16" fill={CLAY} style={LABEL}>Same coin, spent again</text>
      <circle cx="70" cy="234" r="20" fill="none" stroke={FOREST} strokeWidth="1.6" />
      <text x="70" y="239" textAnchor="middle" fontSize="13" fill={FOREST} style={LABEL}>coin</text>
      <path d="M 94 234 L 150 234 M 142 228 L 150 234 L 142 240" fill="none" stroke={FOREST} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="156" y="216" width="62" height="36" rx="3" fill="none" stroke={CLAY} strokeWidth="1.6" />
      <text x="187" y="239" textAnchor="middle" fontSize="15" fill={CLAY} style={LABEL}>key K7</text>
      <path d="M 222 234 L 262 234 M 254 228 L 262 234 L 254 240" fill="none" stroke={FOREST} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 272 222 l 20 20 M 292 222 l -20 20" fill="none" stroke={CLAY} strokeWidth="2.2" strokeLinecap="round" />

      <rect x="392" y="20" width="304" height="260" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="410" y="46" fontSize="16" fill={FOREST} style={LABEL}>List of used key images (public)</text>
      {["K2", "K5", "K7", "K9"].map((k, i) => (
        <g key={k}>
          <rect x="410" y={62 + i * 38} width="268" height="30" rx="3" fill="none" stroke={k === "K7" ? CLAY : FOREST} strokeWidth={k === "K7" ? 1.8 : 1} />
          <text x="426" y={82 + i * 38} fontSize="14" fill={k === "K7" ? CLAY : FOREST} style={LABEL}>{k}</text>
          <text x="660" y={82 + i * 38} textAnchor="end" fontSize="12" fill={FOREST} opacity="0.6" style={LABEL}>coin unknown</text>
        </g>
      ))}
      <text x="410" y="238" fontSize="13" fill={FOREST} style={LABEL}>The list proves a coin was used.</text>
      <text x="410" y="258" fontSize="13" fill={FOREST} style={LABEL}>It does not say which coin it was.</text>
      <path d="M 326 234 L 392 234" stroke={CLAY} strokeWidth="1.4" strokeDasharray="4 3" fill="none" />
      <path d="M 326 96 L 392 160" stroke={FOREST} strokeWidth="1.4" strokeDasharray="4 3" fill="none" />
    </svg>
  );
}

const GRID_COLS = 18;
const GRID_ROWS = 6;
/** Pre-chosen positions for 16 "ring members" in the sea of outputs (deterministic, no randomness). */
const RING_IDX = new Set([4, 13, 22, 29, 37, 44, 51, 58, 63, 70, 77, 83, 90, 96, 101, 106]);

/** Rings pick 16 outputs; a full-chain membership proof can point at the whole set. */
export function ChainWideArt() {
  const dots = (ox: number, mode: "ring" | "all") =>
    Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => {
      const c = i % GRID_COLS;
      const r = Math.floor(i / GRID_COLS);
      const x = ox + c * 18;
      const y = 70 + r * 26;
      const on = mode === "all" || RING_IDX.has(i);
      return <circle key={`${mode}${i}`} cx={x} cy={y} r={on ? 5.5 : 4} fill={on ? (mode === "all" ? CLAY : FOREST) : PAPER} stroke={on ? (mode === "all" ? CLAY : FOREST) : FOREST} strokeWidth={on ? 1.4 : 0.8} opacity={on ? 1 : 0.55} />;
    });
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="Two grids representing outputs on the blockchain. On the left, a ring signature picks only sixteen outputs to hide among. On the right, a full-chain membership proof counts every output in the grid as a possible source.">
      <text x="24" y="26" fontSize="16" fill={FOREST} style={LABEL}>Today: a ring of 16</text>
      <text x="384" y="26" fontSize="16" fill={CLAY} style={LABEL}>Planned: the whole chain</text>
      {dots(30, "ring")}
      {dots(390, "all")}
      <text x="24" y="250" fontSize="13" fill={FOREST} style={LABEL}>Only the 16 filled dots could be your coin.</text>
      <text x="384" y="250" fontSize="13" fill={FOREST} style={LABEL}>Every output on the chain is a candidate.</text>
      <text x="360" y="284" textAnchor="middle" fontSize="12" fill={FOREST} opacity="0.7" style={LABEL}>Simplified illustration. Real grids hold millions of outputs.</text>
    </svg>
  );
}
