/** Figures for the "Feather wallet review" article. Ledger line-art, generic devices only. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

function Arrow({ x1, y1, x2, y2, color = FOREST, dashed = false }: { x1: number; y1: number; x2: number; y2: number; color?: string; dashed?: boolean }) {
  const horizontal = y1 === y2;
  const head = horizontal
    ? `M ${x2 - 8} ${y2 - 5} L ${x2} ${y2} L ${x2 - 8} ${y2 + 5}`
    : `M ${x2 - 5} ${y2 - 8} L ${x2} ${y2} L ${x2 + 5} ${y2 - 8}`;
  return (
    <g stroke={color} strokeWidth="1.4" fill="none">
      <path d={`M ${x1} ${y1} L ${x2} ${y2}`} strokeDasharray={dashed ? "5 4" : undefined} />
      <path d={head} />
    </g>
  );
}

/** Where the keys live when you use a desktop wallet with and without a hardware wallet. */
export function FeatherKeysArt() {
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="Two setups side by side. Left: a computer holds the wallet and the keys, and asks a node about the network. Right: the computer runs the wallet but the keys stay on a separate hardware wallet that signs each payment.">
      {/* left */}
      <rect x="16" y="10" width="332" height="280" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="182" y="36" fontSize="16" textAnchor="middle" fill={FOREST} style={LABEL}>Feather on its own</text>
      <rect x="44" y="60" width="150" height="104" rx="4" fill="none" stroke={FOREST} strokeWidth="1.3" />
      <path d="M 30 176 L 208 176 L 200 164 L 38 164 Z" fill="none" stroke={FOREST} strokeWidth="1.3" />
      <text x="119" y="92" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>Your computer</text>
      <rect x="64" y="106" width="110" height="38" rx="3" fill="none" stroke={CLAY} strokeWidth="1.3" />
      <text x="119" y="130" fontSize="13.5" textAnchor="middle" fill={CLAY} style={LABEL}>Wallet and keys</text>
      <Arrow x1={212} y1={124} x2={262} y2={124} dashed />
      <rect x="264" y="98" width="68" height="52" rx="3" fill="none" stroke={FOREST} strokeWidth="1.2" strokeDasharray="5 4" />
      <text x="298" y="121" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>A node</text>
      <text x="298" y="138" fontSize="11.5" textAnchor="middle" fill={FOREST} style={LABEL}>the network</text>
      <text x="182" y="228" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>Keys are encrypted on this computer.</text>
      <text x="182" y="248" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>Malware on it is the main risk.</text>

      {/* right */}
      <rect x="372" y="10" width="332" height="280" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="538" y="36" fontSize="16" textAnchor="middle" fill={FOREST} style={LABEL}>Feather with a hardware wallet</text>
      <rect x="392" y="60" width="130" height="104" rx="4" fill="none" stroke={FOREST} strokeWidth="1.3" />
      <path d="M 380 176 L 534 176 L 526 164 L 388 164 Z" fill="none" stroke={FOREST} strokeWidth="1.3" />
      <text x="457" y="92" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>Your computer</text>
      <rect x="410" y="106" width="94" height="38" rx="3" fill="none" stroke={FOREST} strokeWidth="1.3" />
      <text x="457" y="130" fontSize="13.5" textAnchor="middle" fill={FOREST} style={LABEL}>Wallet app</text>
      <Arrow x1={528} y1={124} x2={566} y2={124} />
      <rect x="568" y="82" width="56" height="92" rx="8" fill="none" stroke={CLAY} strokeWidth="1.4" />
      <rect x="578" y="94" width="36" height="22" rx="2" fill="none" stroke={CLAY} strokeWidth="1.1" />
      <circle cx="596" cy="148" r="6" fill="none" stroke={CLAY} strokeWidth="1.1" />
      <text x="596" y="196" fontSize="13" textAnchor="middle" fill={CLAY} style={LABEL}>Keys stay here</text>
      <Arrow x1={640} y1={124} x2={684} y2={124} dashed />
      <text x="662" y="116" fontSize="11.5" textAnchor="middle" fill={FOREST} style={LABEL}>node</text>
      <text x="538" y="228" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>You confirm each payment on the device.</text>
      <text x="538" y="248" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>The computer never holds the keys.</text>
    </svg>
  );
}

/** The three Tor routing modes Feather documents and what each sends over Tor. */
export function FeatherTorModesArt() {
  const rows = [
    { y: 62, name: "Never over Tor", sync: false, other: false, note: "Direct connections" },
    { y: 140, name: "Default: Tor except sync", sync: false, other: true, note: "Documented default" },
    { y: 218, name: "Always over Tor", sync: true, other: true, note: "Slowest sync" },
  ];
  return (
    <svg viewBox="0 0 720 300" width="100%" role="img" aria-label="Feather's three Tor modes. Never over Tor: nothing goes through Tor. Default: all traffic except wallet synchronization goes through Tor. Always over Tor: everything, including synchronization, goes through Tor, which makes the first sync slow.">
      <rect x="16" y="10" width="688" height="280" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="260" y="40" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>Wallet sync (heavy data)</text>
      <text x="440" y="40" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>Other traffic</text>
      <text x="610" y="40" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>Note</text>
      {rows.map((r) => (
        <g key={r.name}>
          <line x1="32" y1={r.y - 22} x2="688" y2={r.y - 22} stroke={FOREST} strokeWidth="0.8" strokeDasharray="3 4" />
          <text x="40" y={r.y + 18} fontSize="15" fill={FOREST} style={LABEL}>{r.name}</text>
          {[{ cx: 260, on: r.sync }, { cx: 440, on: r.other }].map((c) => (
            <g key={c.cx}>
              <circle cx={c.cx} cy={r.y + 10} r="16" fill={c.on ? CLAY : "none"} stroke={c.on ? CLAY : FOREST} strokeWidth="1.3" />
              {c.on ? <path d={`M ${c.cx - 7} ${r.y + 10} L ${c.cx - 2} ${r.y + 16} L ${c.cx + 8} ${r.y + 4}`} stroke={PAPER} strokeWidth="2" fill="none" /> : null}
            </g>
          ))}
          <text x="610" y={r.y + 15} fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>{r.note}</text>
        </g>
      ))}
      <text x="360" y="276" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>Filled circle means the traffic goes through Tor. Mode names paraphrased from Feather&apos;s docs.</text>
    </svg>
  );
}
