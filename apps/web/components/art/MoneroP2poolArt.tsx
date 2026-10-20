import { MoneroSymbol } from "./MoneroSymbol";

/** Figures for the "P2Pool Monero" article. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

/** Shares on the side chain, then one block that pays everyone directly. */
export function P2poolPayoutArt() {
  return (
    <svg viewBox="0 0 720 280" width="100%" role="img" aria-label="How P2Pool pays you: miners submit shares to the P2Pool side chain. When a share also meets the Monero network's difficulty, it becomes a real Monero block, and that block's reward is split between the miners with recent shares and paid straight to their wallets. No pool operator holds the money in between.">
      <text x="20" y="28" fontSize="14" fill={FOREST} style={LABEL}>P2Pool side chain (many small blocks, called shares)</text>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={20 + i * 62} y="40" width="52" height="40" rx="3" fill={PAPER} stroke={i === 6 ? CLAY : FOREST} strokeWidth={i === 6 ? 1.8 : 1.2} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <text key={i} x={46 + i * 62} y="65" fontSize="12" textAnchor="middle" fill={FOREST} style={LABEL}>share</text>
      ))}
      <text x="418" y="65" fontSize="12" textAnchor="middle" fill={CLAY} style={LABEL}>lucky</text>

      <path d="M 446 60 L 500 60 L 500 120 M 494 112 L 500 120 L 506 112" stroke={CLAY} strokeWidth="1.4" fill="none" />
      <text x="520" y="64" fontSize="12.5" fill={CLAY} style={LABEL}>this one also meets</text>
      <text x="520" y="82" fontSize="12.5" fill={CLAY} style={LABEL}>Monero&apos;s difficulty</text>

      <rect x="380" y="124" width="230" height="56" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.6" />
      <MoneroSymbol x={392} y={136} size={32} variant="mono" style={{ color: CLAY }} />
      <text x="526" y="148" fontSize="15" textAnchor="middle" fill={CLAY} style={LABEL}>A real Monero block</text>
      <text x="526" y="168" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>reward split inside the block</text>

      <path d="M 440 182 L 300 222 M 308 214 L 300 222 L 311 224" stroke={FOREST} strokeWidth="1.3" fill="none" />
      <path d="M 500 182 L 500 222 M 494 214 L 500 222 L 506 214" stroke={FOREST} strokeWidth="1.3" fill="none" />
      <path d="M 560 182 L 690 222 M 679 224 L 690 222 L 682 214" stroke={FOREST} strokeWidth="1.3" fill="none" />

      <rect x="220" y="226" width="150" height="40" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.3" />
      <text x="295" y="251" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>Your wallet</text>
      <rect x="425" y="226" width="150" height="40" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.3" />
      <text x="500" y="251" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>Another miner</text>
      <rect x="590" y="226" width="110" height="40" rx="3" fill={PAPER} stroke={FOREST} strokeWidth="1.3" />
      <text x="645" y="251" fontSize="13" textAnchor="middle" fill={FOREST} style={LABEL}>And another</text>
    </svg>
  );
}

/** Pick a side chain by how often your CPU finds a share. */
export function SideChainChoiceArt() {
  return (
    <svg viewBox="0 0 720 240" width="100%" role="img" aria-label="Choosing a P2Pool side chain: a bigger machine can use the main chain, a smaller one should use mini, and the smallest should use nano. P2Pool's own advice is to check your expected time to find a share with its calculator, and if that is more than one day, switch to mini or nano.">
      <path d="M 40 150 L 680 150 M 672 144 L 680 150 L 672 156" stroke={FOREST} strokeWidth="1.4" fill="none" />
      <text x="40" y="178" fontSize="13" fill={FOREST} style={LABEL}>smaller miner</text>
      <text x="680" y="178" fontSize="13" textAnchor="end" fill={FOREST} style={LABEL}>bigger miner</text>

      <rect x="40" y="50" width="190" height="80" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.6" />
      <text x="135" y="82" fontSize="18" textAnchor="middle" fill={CLAY} style={LABEL}>nano</text>
      <text x="135" y="104" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>for the smallest miners</text>
      <text x="135" y="120" fontSize="12" textAnchor="middle" fill={FOREST} style={LABEL}>flag: --nano</text>

      <rect x="265" y="50" width="190" height="80" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="360" y="82" fontSize="18" textAnchor="middle" fill={FOREST} style={LABEL}>mini</text>
      <text x="360" y="104" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>for modest miners</text>
      <text x="360" y="120" fontSize="12" textAnchor="middle" fill={FOREST} style={LABEL}>flag: --mini</text>

      <rect x="490" y="50" width="190" height="80" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="585" y="82" fontSize="18" textAnchor="middle" fill={FOREST} style={LABEL}>main</text>
      <text x="585" y="104" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>for big setups</text>
      <text x="585" y="120" fontSize="12" textAnchor="middle" fill={FOREST} style={LABEL}>default, no flag</text>

      <text x="360" y="212" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>Rule of thumb from P2Pool: if a share takes you over a day, move down a chain.</text>
    </svg>
  );
}
