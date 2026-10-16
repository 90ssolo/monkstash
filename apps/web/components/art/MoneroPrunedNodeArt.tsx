const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";

/** A pruned node keeps one of eight stripes of the prunable data. */
export function PruningStripesFigure() {
  return (
    <svg viewBox="0 0 640 230" role="img" aria-label="A full node stores all eight stripes of the prunable transaction data. A pruned node keeps the always-needed data in full plus one of eight stripes, and the other seven are dropped." style={{ width: "100%", height: "auto" }}>
      <text x="30" y="28" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>Full node</text>
      <rect x="30" y="38" width="130" height="34" rx="2" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="95" y="60" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>always needed</text>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={170 + i * 55} y="38" width="52" height="34" rx="2" fill={PAPER} stroke={FOREST} strokeWidth="1" />
      ))}
      <text x="396" y="93" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>8 stripes of prunable data (ring signature material)</text>

      <text x="30" y="132" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={CLAY}>Pruned node</text>
      <rect x="30" y="142" width="130" height="34" rx="2" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
      <text x="95" y="164" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>always needed</text>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={170 + i * 55} y="142" width="52" height="34" rx="2" fill={i === 3 ? PAPER : "none"} stroke={CLAY} strokeWidth={i === 3 ? 1.6 : 0.8} strokeDasharray={i === 3 ? undefined : "3 3"} opacity={i === 3 ? 1 : 0.55} />
      ))}
      <text x="396" y="197" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>keeps 1 stripe in 8, drops the other 7</text>
      <text x="320" y="222" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>Each node keeps a random stripe, so the network as a whole still holds all of them.</text>
    </svg>
  );
}

/** Three ways to end up with a pruned node, and the one way back. */
export function PruneRoutesFigure() {
  return (
    <svg viewBox="0 0 640 230" role="img" aria-label="Three routes. Start new: run monerod with the prune flag on the first sync, the best option. Convert an existing node: stop it and run the monero-blockchain-prune tool, which temporarily needs space for both copies. Go back to full: there is no un-prune, so you delete the data and sync again from the start." style={{ width: "100%", height: "auto" }}>
      {[
        { x: 10, color: FOREST, t1: "Start new", t2: "monerod --prune-blockchain", t3: "on the first sync", t4: "best result" },
        { x: 224, color: CLAY, t1: "Convert existing", t2: "monero-blockchain-prune", t3: "needs space for both copies", t4: "temporarily" },
        { x: 438, color: FOREST, t1: "Back to full", t2: "no un-prune", t3: "sync again from scratch", t4: "takes hours to days" },
      ].map((c) => (
        <g key={c.t1}>
          <rect x={c.x} y="20" width="192" height="150" rx="4" fill={PAPER} stroke={c.color} strokeWidth="1.3" />
          <text x={c.x + 96} y="52" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="16" fill={c.color}>{c.t1}</text>
          <text x={c.x + 96} y="86" textAnchor="middle" fontFamily="ui-monospace, Menlo, Consolas, monospace" fontSize="11" fill={c.color}>{c.t2}</text>
          <text x={c.x + 96} y="116" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={c.color}>{c.t3}</text>
          <text x={c.x + 96} y="136" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={c.color}>{c.t4}</text>
        </g>
      ))}
      <text x="320" y="204" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>Decide before the first sync. It is the cheapest time to choose.</text>
    </svg>
  );
}
