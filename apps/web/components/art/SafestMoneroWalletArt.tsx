const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";

/** Five rungs: more effort and protection toward the top, more convenience toward the bottom. */
export function SecurityLadderFigure() {
  const rungs = [
    { y: 20, w: 300, t: "Offline signing", s: "keys never touch an online machine" },
    { y: 70, w: 340, t: "Hardware wallet + GUI or Feather", s: "keys stay on a separate device" },
    { y: 120, w: 380, t: "Desktop wallet + your own node", s: "keys on your computer, no node trust" },
    { y: 170, w: 420, t: "Mobile wallet", s: "keys on your phone, for spending" },
    { y: 220, w: 460, t: "Web wallet", s: "keys in your browser, small amounts" },
  ];
  return (
    <svg viewBox="0 0 640 290" role="img" aria-label="A ladder of five Monero wallet setups. From the top: offline signing, hardware wallet with a desktop companion, desktop wallet with your own node, mobile wallet, and web wallet. Protection and effort rise toward the top, convenience rises toward the bottom." style={{ width: "100%", height: "auto" }}>
      {rungs.map((r, i) => (
        <g key={r.t}>
          <rect x="20" y={r.y} width={r.w} height="42" rx="3" fill={PAPER} stroke={i === 4 ? CLAY : FOREST} strokeWidth={i === 4 ? 1.5 : 1.1} />
          <text x="34" y={r.y + 19} fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={i === 4 ? CLAY : FOREST}>{r.t}</text>
          <text x="34" y={r.y + 35} fontFamily={SERIF} fontStyle="italic" fontSize="11" fill={FOREST} opacity="0.8">{r.s}</text>
        </g>
      ))}
      <line x1="560" y1="30" x2="560" y2="255" stroke={FOREST} strokeWidth="1" />
      <path d="M554 38 L560 28 L566 38" fill="none" stroke={FOREST} strokeWidth="1" />
      <path d="M554 247 L560 257 L566 247" fill="none" stroke={CLAY} strokeWidth="1" />
      <text x="575" y="50" fontFamily={SERIF} fontStyle="italic" fontSize="11" fill={FOREST}>more</text>
      <text x="575" y="64" fontFamily={SERIF} fontStyle="italic" fontSize="11" fill={FOREST}>protection</text>
      <text x="575" y="236" fontFamily={SERIF} fontStyle="italic" fontSize="11" fill={CLAY}>more</text>
      <text x="575" y="250" fontFamily={SERIF} fontStyle="italic" fontSize="11" fill={CLAY}>convenience</text>
      <text x="20" y="280" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>MonkStash sits on the bottom rung: an early preview, not yet audited.</text>
    </svg>
  );
}

/** The official offline signing flow in three trips across the air gap. */
export function OfflineSigningFigure() {
  return (
    <svg viewBox="0 0 640 230" role="img" aria-label="Offline signing in three steps. The online view-only wallet creates an unsigned transaction. A removable drive carries it to the offline wallet, which signs it. The drive carries the signed file back and the online wallet submits it." style={{ width: "100%", height: "auto" }}>
      <rect x="20" y="30" width="190" height="120" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="115" y="58" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>Online computer</text>
      <text x="115" y="82" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>view-only wallet</text>
      <text x="115" y="100" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>no spend key</text>
      <text x="115" y="132" textAnchor="middle" fontFamily="ui-monospace, Menlo, Consolas, monospace" fontSize="11" fill={FOREST}>transfer / submit_transfer</text>

      <rect x="430" y="30" width="190" height="120" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
      <text x="525" y="58" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={CLAY}>Offline computer</text>
      <text x="525" y="82" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>full wallet, never online</text>
      <text x="525" y="100" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>holds the spend key</text>
      <text x="525" y="132" textAnchor="middle" fontFamily="ui-monospace, Menlo, Consolas, monospace" fontSize="11" fill={CLAY}>sign_transfer</text>

      <line x1="215" y1="75" x2="425" y2="75" stroke={FOREST} strokeWidth="1.2" strokeDasharray="4 3" />
      <path d="M417 70 L426 75 L417 80" fill="none" stroke={FOREST} strokeWidth="1.2" />
      <text x="320" y="68" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>1. unsigned_monero_tx</text>
      <line x1="425" y1="115" x2="215" y2="115" stroke={CLAY} strokeWidth="1.2" strokeDasharray="4 3" />
      <path d="M223 110 L214 115 L223 120" fill="none" stroke={CLAY} strokeWidth="1.2" />
      <text x="320" y="108" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>2. signed_monero_tx</text>
      <text x="320" y="140" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="11" fill={FOREST}>carried by removable media</text>
      <text x="115" y="176" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>3. submits to the network</text>
      <text x="320" y="214" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>The Monero docs call this setup not necessarily the recommended one. Most people are better served by a hardware wallet.</text>
    </svg>
  );
}
