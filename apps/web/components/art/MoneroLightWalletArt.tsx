/** Figure for the "Monero light wallet" article. Ledger line-art. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

/** Three wallet models side by side, showing where the view key lives. */
export function ThreeModelsArt() {
  const cols = [
    { x: 16, title: "Full node wallet", sub: "Your own node", wallet: "Wallet + keys", server: "Your node", sees: "Sees nothing outside", keyAt: "Keys stay with you", color: FOREST },
    { x: 252, title: "Remote node wallet", sub: "MonkStash works this way", wallet: "Wallet + keys", server: "Someone's node", sees: "Sees your IP and requests", keyAt: "Keys stay with you", color: FOREST },
    { x: 488, title: "Light wallet server", sub: "How MyMonero worked", wallet: "Wallet + spend key", server: "Server + view key", sees: "Sees all incoming payments", keyAt: "View key is handed over", color: CLAY },
  ];
  return (
    <svg viewBox="0 0 720 320" width="100%" role="img" aria-label="Three wallet models side by side. Full node wallet: keys and scanning stay with you, using your own node. Remote node wallet: the wallet scans blocks itself and keys stay on your device, but the node you use can see your connection. Light wallet server: you give the server your view key and it scans for you, so it can see all your incoming payments, though it cannot spend.">
      {cols.map((c) => (
        <g key={c.title}>
          <rect x={c.x} y="10" width="216" height="300" rx="4" fill={PAPER} stroke={c.color} strokeWidth="1.4" />
          <text x={c.x + 108} y="38" fontSize="16" textAnchor="middle" fill={c.color} style={LABEL}>{c.title}</text>
          <text x={c.x + 108} y="56" fontSize="12" textAnchor="middle" fill={FOREST} style={LABEL}>{c.sub}</text>

          <rect x={c.x + 20} y="76" width="176" height="52" rx="3" fill="none" stroke={FOREST} strokeWidth="1.2" />
          <text x={c.x + 108} y="108" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>{c.wallet}</text>

          <path d={`M ${c.x + 108} 130 L ${c.x + 108} 168 M ${c.x + 102} 160 L ${c.x + 108} 168 L ${c.x + 114} 160`} stroke={c.color} strokeWidth="1.4" fill="none" />

          <rect x={c.x + 20} y="172" width="176" height="52" rx="3" fill="none" stroke={c.color} strokeWidth="1.2" strokeDasharray={c.color === CLAY ? "0" : "5 4"} />
          <text x={c.x + 108} y="204" fontSize="14" textAnchor="middle" fill={c.color} style={LABEL}>{c.server}</text>

          <text x={c.x + 108} y="252" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>{c.sees}</text>
          <text x={c.x + 108} y="276" fontSize="12.5" textAnchor="middle" fill={c.color} style={LABEL}>{c.keyAt}</text>
        </g>
      ))}
    </svg>
  );
}
