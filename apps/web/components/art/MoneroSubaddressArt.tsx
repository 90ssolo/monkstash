/** Figures for the "Monero subaddress" article. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

function Door({ x, y, label, sub, accent = false }: { x: number; y: number; label: string; sub: string; accent?: boolean }) {
  const c = accent ? CLAY : FOREST;
  return (
    <g>
      <path d={`M ${x} ${y + 80} L ${x} ${y + 26} A 30 26 0 0 1 ${x + 60} ${y + 26} L ${x + 60} ${y + 80} Z`} fill={PAPER} stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={x + 48} cy={y + 56} r="2.6" fill={c} />
      <text x={x + 30} y={y + 104} textAnchor="middle" fontSize="14" fill={c} style={LABEL}>{label}</text>
      <text x={x + 30} y={y + 122} textAnchor="middle" fontSize="11" fill={FOREST} opacity="0.75" style={LABEL}>{sub}</text>
    </g>
  );
}

/** One wallet, many doors: every subaddress is a separate entrance to the same wallet. */
export function ManyDoorsArt() {
  const doors = [
    { label: "Main", sub: "starts with 4", accent: true },
    { label: "Rent", sub: "starts with 8" },
    { label: "Shop", sub: "starts with 8" },
    { label: "Client A", sub: "starts with 8" },
    { label: "Client B", sub: "starts with 8" },
  ];
  const xs = [60, 190, 320, 450, 580];
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="One wallet with five doors. The main address starts with 4. Four subaddresses, labelled rent, shop, client A and client B, each start with 8. All five doors lead into the same wallet and the same balance, but each door is a different address to the outside world.">
      <rect x="24" y="24" width="672" height="224" rx="6" fill="none" stroke={FOREST} strokeWidth="1.3" />
      {doors.map((d, i) => (
        <Door key={d.label} x={xs[i] ?? 0} y={62} label={d.label} sub={d.sub} accent={d.accent} />
      ))}
      <path d="M 90 200 L 90 232 M 220 200 L 220 232 M 350 200 L 350 232 M 480 200 L 480 232 M 610 200 L 610 232" stroke={FOREST} strokeWidth="1.2" strokeDasharray="3 4" fill="none" />
      <path d="M 90 232 L 610 232" stroke={FOREST} strokeWidth="1.4" fill="none" />
      <text x="360" y="266" textAnchor="middle" fontSize="16" fill={FOREST} style={LABEL}>One recovery phrase. One balance. Many addresses.</text>
      <text x="360" y="288" textAnchor="middle" fontSize="12" fill={FOREST} opacity="0.7" style={LABEL}>On a block explorer nothing connects the doors to each other.</text>
    </svg>
  );
}

/** The three address types side by side. */
export function AddressTypesArt() {
  const cols = [
    { t: "Standard", a: "starts with 4", l: "95 characters", n: "Your main address", c: FOREST },
    { t: "Subaddress", a: "starts with 8", l: "95 characters", n: "Made for one payer or purpose", c: CLAY },
    { t: "Integrated", a: "starts with 4", l: "106 characters", n: "Standard address plus a short payment ID", c: FOREST },
  ];
  return (
    <svg viewBox="0 0 720 210" width="100%" role="img" aria-label="Three Monero address types on mainnet. Standard: starts with 4, 95 characters. Subaddress: starts with 8, 95 characters. Integrated: starts with 4, 106 characters, a standard address with a short payment ID built in.">
      {cols.map((c, i) => {
        const x = 18 + i * 236;
        return (
          <g key={c.t}>
            <rect x={x} y="16" width="222" height="170" rx="4" fill={PAPER} stroke={c.c} strokeWidth="1.5" />
            <text x={x + 16} y="48" fontSize="20" fill={c.c} style={LABEL}>{c.t}</text>
            <text x={x + 16} y="80" fontSize="15" fill={FOREST} style={LABEL}>{c.a}</text>
            <text x={x + 16} y="102" fontSize="15" fill={FOREST} style={LABEL}>{c.l}</text>
            <foreignObject x={x + 14} y="116" width="194" height="60">
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 13, lineHeight: 1.25, color: FOREST, opacity: 0.85 }}>{c.n}</div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}
