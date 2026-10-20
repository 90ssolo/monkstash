/** Figure for the "How long does a Monero transaction take" article. Ledger line-art. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

/** Timeline from broadcast to spendable. */
export function ConfirmationTimelineArt() {
  const ticks = Array.from({ length: 10 }, (_, i) => i + 1);
  const x0 = 130;
  const step = 52;
  return (
    <svg viewBox="0 0 720 270" width="100%" role="img" aria-label="Timeline of a Monero payment. At 0 minutes the sender broadcasts it and the recipient's wallet usually shows it as incoming within seconds. About 2 minutes later it is in a block, the first confirmation. After the tenth confirmation, about 20 minutes in, the funds can be spent.">
      <line x1="40" y1="120" x2="690" y2="120" stroke={FOREST} strokeWidth="1.4" />

      <circle cx="40" cy="120" r="9" fill={PAPER} stroke={FOREST} strokeWidth="1.6" />
      <text x="40" y="82" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>Broadcast</text>
      <text x="40" y="100" fontSize="12" textAnchor="start" fill={CLAY} style={LABEL}>0 min</text>
      <text x="22" y="156" fontSize="12.5" fill={FOREST} style={LABEL}>Shows as incoming</text>
      <text x="22" y="173" fontSize="12.5" fill={FOREST} style={LABEL}>within seconds</text>

      {ticks.map((n) => {
        const x = x0 + (n - 1) * step;
        const key = n === 1 || n === 10;
        return (
          <g key={n}>
            <rect x={x - 11} y={109} width="22" height="22" rx="3" fill={PAPER} stroke={key ? CLAY : FOREST} strokeWidth={key ? 1.8 : 1.2} />
            <text x={x} y={125} fontSize="12.5" textAnchor="middle" fill={key ? CLAY : FOREST} style={LABEL}>{n}</text>
          </g>
        );
      })}

      <text x={x0} y="82" fontSize="14" textAnchor="middle" fill={CLAY} style={LABEL}>1st confirmation</text>
      <text x={x0} y="100" fontSize="12" textAnchor="middle" fill={FOREST} style={LABEL}>about 2 min</text>
      <text x={x0 + 9 * step} y="82" fontSize="14" textAnchor="middle" fill={CLAY} style={LABEL}>10th confirmation</text>
      <text x={x0 + 9 * step} y="100" fontSize="12" textAnchor="middle" fill={FOREST} style={LABEL}>about 20 min</text>

      <path d={`M ${x0 + 9 * step + 11} 120 L 690 120 M 682 114 L 690 120 L 682 126`} stroke={CLAY} strokeWidth="1.6" fill="none" />
      <text x="640" y="156" fontSize="14" textAnchor="middle" fill={CLAY} style={LABEL}>Spendable</text>

      <text x="360" y="156" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>one new block roughly every 2 minutes</text>
      <path d={`M ${x0} 190 L ${x0 + 9 * step} 190 M ${x0} 184 L ${x0} 196 M ${x0 + 9 * step} 184 L ${x0 + 9 * step} 196`} stroke={FOREST} strokeWidth="1.2" fill="none" />
      <text x="360" y="214" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>Wait for the 10 boxes to fill. Block times vary, so 20 minutes is an average.</text>
      <text x="360" y="244" fontSize="13" textAnchor="middle" fill={CLAY} style={LABEL}>Change from your own send is locked for the same 10 blocks.</text>
    </svg>
  );
}
