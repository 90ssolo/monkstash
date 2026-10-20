import { MoneroSymbol } from "./MoneroSymbol";

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#f6f1e4";
const SERIF = "var(--font-display)";

function HArrow({ x1, y, x2, color, both = false }: { x1: number; y: number; x2: number; color: string; both?: boolean }) {
  return (
    <g>
      <path d={`M${x1} ${y} H${x2}`} stroke={color} strokeWidth="1.4" fill="none" />
      <path d={`M${x2 - 8} ${y - 6} L${x2} ${y} L${x2 - 8} ${y + 6}`} stroke={color} strokeWidth="1.4" fill="none" />
      {both ? <path d={`M${x1 + 8} ${y - 6} L${x1} ${y} L${x1 + 8} ${y + 6}`} stroke={color} strokeWidth="1.4" fill="none" /> : null}
    </g>
  );
}

/** Where your own node sits: between your wallet and the rest of the network. */
export function NodeInNetworkFigure() {
  const peers = [
    [470, 60], [540, 40], [600, 80], [500, 130], [570, 150], [610, 210], [480, 210], [545, 235],
  ];
  return (
    <svg viewBox="0 0 640 270" role="img" aria-label="Your wallet talks only to your own node. Your node talks to many other nodes on the Monero network, downloads and checks every block, and passes new transactions along." style={{ width: "100%", height: "auto" }}>
      <rect x="10" y="90" width="120" height="70" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x="70" y="121" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>Your wallet</text>
      <text x="70" y="141" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>keys stay here</text>

      <HArrow x1={130} y={125} x2={196} color={CLAY} both />
      <text x="163" y="112" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>private</text>

      <rect x="198" y="80" width="160" height="90" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.6" />
      <text x="278" y="115" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={CLAY}>Your node</text>
      <text x="278" y="135" textAnchor="middle" fontFamily="ui-monospace, Menlo, Consolas, monospace" fontSize="12" fill={CLAY}>monerod</text>
      <text x="278" y="155" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={CLAY}>checks every block</text>

      <HArrow x1={358} y={125} x2={440} color={FOREST} both />
      <text x="399" y="112" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>blocks</text>

      <ellipse cx="545" cy="135" rx="95" ry="115" fill="none" stroke={FOREST} strokeWidth="1" strokeDasharray="4 3" />
      {peers.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path d={`M${x} ${y} L${x === 500 ? 545 : 545} 135`} stroke={FOREST} strokeWidth="0.6" opacity="0.5" fill="none" />
          <circle cx={x} cy={y} r="7" fill={PAPER} stroke={FOREST} strokeWidth="1.1" />
        </g>
      ))}
      <circle cx="545" cy="135" r="20" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <MoneroSymbol variant="mono" size={26} x={532} y={122} style={{ color: FOREST }} />

      <text x="320" y="258" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize="13" fill={FOREST}>With your own node, no one else learns which addresses your wallet is looking for.</text>
    </svg>
  );
}

/** Full versus pruned: roughly a third of the disk for the same everyday use. */
export function StorageFigure() {
  const full = 560;
  const pruned = Math.round((95 / 280) * full);
  return (
    <svg viewBox="0 0 640 218" role="img" aria-label="Two bars compare disk use. A full node is about 280 gigabytes. A pruned node is about 95 gigabytes, roughly one third. Figures from the Monero project README, June 2026." style={{ width: "100%", height: "auto" }}>
      <text x="40" y="30" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={FOREST}>Full node</text>
      <rect x="40" y="40" width={full} height="36" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.2" />
      <text x={40 + full - 10} y="64" textAnchor="end" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={FOREST}>about 280 GB</text>

      <text x="40" y="112" fontFamily={SERIF} fontStyle="italic" fontSize="15" fill={CLAY}>Pruned node</text>
      <rect x="40" y="122" width={pruned} height="36" rx="3" fill={PAPER} stroke={CLAY} strokeWidth="1.4" />
      <text x={40 + pruned + 12} y="146" fontFamily={SERIF} fontStyle="italic" fontSize="14" fill={CLAY}>about 95 GB</text>

      <text x="40" y="186" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>Both fully check the chain. Pruning drops part of the old transaction data, not the checks.</text>
      <text x="40" y="206" fontFamily={SERIF} fontStyle="italic" fontSize="12" fill={FOREST}>Source: Monero README, June 2026.</text>
    </svg>
  );
}
