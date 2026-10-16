const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";

function Arrow({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
  return (
    <g>
      <path d={`M${x} ${y1} V${y2 - 2}`} stroke={color} strokeWidth="1.4" fill="none" />
      <path d={`M${x - 6} ${y2 - 8} L${x} ${y2} L${x + 6} ${y2 - 8}`} stroke={color} strokeWidth="1.4" fill="none" />
    </g>
  );
}

function Box({ x, y, w, h, lines, color = FOREST }: { x: number; y: number; w: number; h: number; lines: string[]; color?: string }) {
  const startY = y + h / 2 - ((lines.length - 1) * 8) + 4;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={PAPER} stroke={color} strokeWidth="1.2" />
      {lines.map((t, i) => (
        <text key={t} x={x + w / 2} y={startY + i * 16} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={color}>{t}</text>
      ))}
    </g>
  );
}

/** Four quick questions, each pointing at the usual cause of a zero or low balance. */
export function BalanceDecisionFigure() {
  const cols = [
    { cx: 80, q: ["Is the wallet", "still syncing?"], a: ["Wait for the", "scan to finish"] },
    { cx: 240, q: ["Restored from", "recovery words?"], a: ["Restore height may be", "after your first payment"] },
    { cx: 400, q: ["Is some of it", "marked locked?"], a: ["Normal: about 10", "blocks, ~20 minutes"] },
    { cx: 560, q: ["Same seed and", "network as the sender?"], a: ["Wrong wallet or", "wrong network"] },
  ];
  return (
    <svg viewBox="0 0 640 340" role="img" aria-label="Decision tree for a Monero balance that shows zero or too little. Four questions: is the wallet still syncing, was it restored with a restore height after the first payment, is the funds marked locked, and are the seed and network the same as the sender used. Each points to its usual fix. If all four are fine, ask the sender for a transaction ID and proof." style={{ width: "100%", height: "auto" }}>
      <Box x={210} y={10} w={220} h={46} lines={["Balance shows 0 or too little"]} />
      <path d="M320 56 V74 M80 74 H560 M80 74 V92 M240 74 V92 M400 74 V92 M560 74 V92" stroke={FOREST} strokeWidth="1.2" fill="none" />
      {cols.map((c) => (
        <g key={c.cx}>
          <Box x={c.cx - 72} y={94} w={144} h={56} lines={c.q} />
          <Arrow x={c.cx} y1={150} y2={190} color={CLAY} />
          <text x={c.cx + 10} y={174} fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>yes</text>
          <Box x={c.cx - 72} y={192} w={144} h={64} lines={c.a} color={CLAY} />
        </g>
      ))}
      <rect x="10" y="280" width="620" height="48" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" strokeDasharray="4 3" />
      <text x="320" y="301" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>None of these? Ask the sender for the transaction ID and proof of payment.</text>
      <text x="320" y="319" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>It may never have been sent. Funds on the blockchain do not vanish.</text>
    </svg>
  );
}
