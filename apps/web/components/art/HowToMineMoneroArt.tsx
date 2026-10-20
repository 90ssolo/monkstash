import { MoneroSymbol } from "./MoneroSymbol";

/** Figures for the "How to mine Monero" article. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

/** From your CPU, through a pool or your own node, to your wallet. */
export function MiningFlowArt() {
  return (
    <svg viewBox="0 0 720 250" width="100%" role="img" aria-label="How mining reaches your wallet: your CPU runs a miner program, which sends work to either a pool, P2Pool or your own Monero node. When a block is found on the Monero network, the reward is paid to the wallet address you set.">
      <rect x="20" y="60" width="130" height="100" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="85" y="96" fontSize="15" textAnchor="middle" fill={FOREST} style={LABEL}>Your CPU</text>
      <text x="85" y="118" fontSize="12.5" textAnchor="middle" fill={CLAY} style={LABEL}>runs a miner</text>
      <text x="85" y="136" fontSize="12.5" textAnchor="middle" fill={CLAY} style={LABEL}>program</text>

      <path d="M 152 110 L 208 110 M 200 104 L 208 110 L 200 116" stroke={FOREST} strokeWidth="1.4" fill="none" />

      <rect x="210" y="40" width="160" height="140" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="290" y="70" fontSize="15" textAnchor="middle" fill={FOREST} style={LABEL}>Where the work goes</text>
      <text x="290" y="104" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>a pool</text>
      <text x="290" y="126" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>P2Pool</text>
      <text x="290" y="148" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>or your own node (solo)</text>

      <path d="M 372 110 L 428 110 M 420 104 L 428 110 L 420 116" stroke={FOREST} strokeWidth="1.4" fill="none" />

      <rect x="430" y="60" width="120" height="100" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="490" y="96" fontSize="15" textAnchor="middle" fill={FOREST} style={LABEL}>A block is</text>
      <text x="490" y="116" fontSize="15" textAnchor="middle" fill={FOREST} style={LABEL}>found</text>
      <text x="490" y="140" fontSize="12.5" textAnchor="middle" fill={CLAY} style={LABEL}>by luck, not by turns</text>

      <path d="M 552 110 L 590 110 M 582 104 L 590 110 L 582 116" stroke={FOREST} strokeWidth="1.4" fill="none" />

      <rect x="592" y="60" width="110" height="100" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.6" />
      <MoneroSymbol x={624} y={70} size={42} variant="mono" style={{ color: CLAY }} />
      <text x="647" y="132" fontSize="15" textAnchor="middle" fill={CLAY} style={LABEL}>Your wallet</text>
      <text x="647" y="150" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>address you set</text>

      <text x="360" y="218" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>Set the payout address once, in the miner. Pools may add their own rules.</text>
    </svg>
  );
}

/** Costs on one side, rewards on the other. No numbers on purpose. */
export function MiningBalanceArt() {
  return (
    <svg viewBox="0 0 720 270" width="100%" role="img" aria-label="Mining only makes sense if rewards are bigger than costs. Costs you pay for sure: electricity, heat and noise, hardware wear and your time. Rewards you hope for: your share of block rewards, which depends on your hash rate against the whole network, plus the price of Monero when you sell.">
      <rect x="30" y="30" width="300" height="190" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="180" y="62" fontSize="17" textAnchor="middle" fill={FOREST} style={LABEL}>What you pay, for sure</text>
      <text x="60" y="100" fontSize="14" fill={FOREST} style={LABEL}>Electricity, every hour it runs</text>
      <text x="60" y="130" fontSize="14" fill={FOREST} style={LABEL}>Heat and fan noise</text>
      <text x="60" y="160" fontSize="14" fill={FOREST} style={LABEL}>Wear on a computer you use</text>
      <text x="60" y="190" fontSize="14" fill={FOREST} style={LABEL}>Your time to set it up</text>

      <text x="360" y="130" fontSize="26" textAnchor="middle" fill={CLAY} style={LABEL}>vs</text>

      <rect x="390" y="30" width="300" height="190" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.6" />
      <MoneroSymbol x={412} y={44} size={24} variant="mono" style={{ color: CLAY }} />
      <text x="560" y="62" fontSize="17" textAnchor="middle" fill={CLAY} style={LABEL}>What you might earn</text>
      <text x="420" y="100" fontSize="14" fill={FOREST} style={LABEL}>Your share of the network&apos;s power</text>
      <text x="420" y="130" fontSize="14" fill={FOREST} style={LABEL}>Block rewards, paid in XMR</text>
      <text x="420" y="160" fontSize="14" fill={FOREST} style={LABEL}>Luck, which varies a lot</text>
      <text x="420" y="190" fontSize="14" fill={FOREST} style={LABEL}>The XMR price when you sell</text>

      <text x="360" y="252" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>Put your own electricity price in a calculator before you start.</text>
    </svg>
  );
}
