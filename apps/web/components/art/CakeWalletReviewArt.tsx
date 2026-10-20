/** Figures for the "Cake Wallet review" article. Ledger line-art, generic devices only. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

function Arrow({ x1, x2, y, color = FOREST, dashed = false }: { x1: number; x2: number; y: number; color?: string; dashed?: boolean }) {
  return (
    <g stroke={color} strokeWidth="1.4" fill="none">
      <path d={`M ${x1} ${y} L ${x2} ${y}`} strokeDasharray={dashed ? "5 4" : undefined} />
      <path d={`M ${x2 - 8} ${y - 5} L ${x2} ${y} L ${x2 - 8} ${y + 5}`} />
    </g>
  );
}

/** Where the keys live and where a third party enters when you use the in-app exchange. */
export function CakeKeysAndSwapArt() {
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="Two flows. Sending Monero: your phone holds the keys and asks a node about the network, and no third party holds your coins. Swapping coins in the app: the phone sends your coins to a third-party exchange provider, which sends the other coin back, so that provider's rules apply.">
      <rect x="16" y="10" width="332" height="280" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="182" y="36" fontSize="16" textAnchor="middle" fill={FOREST} style={LABEL}>Sending Monero</text>
      <rect x="44" y="64" width="84" height="132" rx="10" fill="none" stroke={FOREST} strokeWidth="1.4" />
      <rect x="54" y="80" width="64" height="86" rx="2" fill="none" stroke={FOREST} strokeWidth="1" />
      <rect x="62" y="108" width="48" height="26" rx="3" fill="none" stroke={CLAY} strokeWidth="1.2" />
      <text x="86" y="125" fontSize="12" textAnchor="middle" fill={CLAY} style={LABEL}>keys</text>
      <circle cx="86" cy="182" r="5" fill="none" stroke={FOREST} strokeWidth="1" />
      <Arrow x1={140} x2={206} y={130} dashed />
      <rect x="208" y="102" width="116" height="56" rx="3" fill="none" stroke={FOREST} strokeWidth="1.2" strokeDasharray="5 4" />
      <text x="266" y="126" fontSize="13.5" textAnchor="middle" fill={FOREST} style={LABEL}>A Monero node</text>
      <text x="266" y="144" fontSize="11.5" textAnchor="middle" fill={FOREST} style={LABEL}>yours or a remote one</text>
      <text x="182" y="236" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>Keys stay on the phone.</text>
      <text x="182" y="256" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>No company holds your coins.</text>

      <rect x="372" y="10" width="332" height="280" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="538" y="36" fontSize="16" textAnchor="middle" fill={FOREST} style={LABEL}>Swapping inside the app</text>
      <rect x="392" y="64" width="70" height="116" rx="10" fill="none" stroke={FOREST} strokeWidth="1.4" />
      <rect x="400" y="78" width="54" height="76" rx="2" fill="none" stroke={FOREST} strokeWidth="1" />
      <text x="427" y="122" fontSize="12" textAnchor="middle" fill={FOREST} style={LABEL}>your coin</text>
      <Arrow x1={474} x2={540} y={110} />
      <rect x="542" y="80" width="140" height="80" rx="3" fill="none" stroke={CLAY} strokeWidth="1.4" />
      <text x="612" y="112" fontSize="14" textAnchor="middle" fill={CLAY} style={LABEL}>Third-party</text>
      <text x="612" y="130" fontSize="14" textAnchor="middle" fill={CLAY} style={LABEL}>swap provider</text>
      <path d="M 676 168 L 676 190 L 440 190 L 440 160" stroke={FOREST} strokeWidth="1.2" fill="none" strokeDasharray="5 4" />
      <path d="M 435 168 L 440 160 L 445 168" stroke={FOREST} strokeWidth="1.2" fill="none" />
      <text x="558" y="208" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>other coin comes back</text>
      <text x="538" y="244" fontSize="13" textAnchor="middle" fill={CLAY} style={LABEL}>The provider&apos;s own rules and logs apply.</text>
      <text x="538" y="264" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>Cake does not hold the swap funds.</text>
    </svg>
  );
}

/** Which Cake Labs app fits which need. Generic icons, no logos. */
export function CakeAppsArt() {
  const cols = [
    { x: 16, title: "Cake Wallet", lines: ["Many coins in one app", "Monero plus Bitcoin,", "Ethereum and more"], tag: "Multi-coin", color: FOREST },
    { x: 252, title: "Monero.com", lines: ["Monero only", "Same company", "Narrower app"], tag: "Monero-only", color: CLAY },
    { x: 488, title: "MonkStash", lines: ["Monero only", "Runs in a browser", "Nothing to install"], tag: "Web wallet", color: FOREST },
  ];
  return (
    <svg viewBox="0 0 720 280" width="100%" role="img" aria-label="Three options compared. Cake Wallet holds many coins in one mobile and desktop app. Monero.com is a Monero-only app from the same company. MonkStash is a Monero-only wallet that runs in a browser.">
      {cols.map((c) => (
        <g key={c.title}>
          <rect x={c.x} y="10" width="216" height="260" rx="4" fill={PAPER} stroke={c.color} strokeWidth="1.4" />
          <text x={c.x + 108} y="40" fontSize="17" textAnchor="middle" fill={c.color} style={LABEL}>{c.title}</text>
          <rect x={c.x + 78} y="56" width="60" height="92" rx="9" fill="none" stroke={c.color} strokeWidth="1.3" />
          <rect x={c.x + 86} y="68" width="44" height="58" rx="2" fill="none" stroke={c.color} strokeWidth="1" />
          {c.title === "Cake Wallet" ? (
            <g fill="none" stroke={c.color} strokeWidth="1">
              <circle cx={c.x + 100} cy="86" r="6" /><circle cx={c.x + 116} cy="86" r="6" />
              <circle cx={c.x + 100} cy="104" r="6" /><circle cx={c.x + 116} cy="104" r="6" />
            </g>
          ) : (
            <circle cx={c.x + 108} cy="96" r="11" fill="none" stroke={c.color} strokeWidth="1.2" />
          )}
          <text x={c.x + 108} y="176" fontSize="12.5" textAnchor="middle" fill={c.color} style={LABEL}>{c.tag}</text>
          {c.lines.map((t, i) => (
            <text key={t} x={c.x + 108} y={206 + i * 20} fontSize="13.5" textAnchor="middle" fill={FOREST} style={LABEL}>{t}</text>
          ))}
        </g>
      ))}
    </svg>
  );
}
