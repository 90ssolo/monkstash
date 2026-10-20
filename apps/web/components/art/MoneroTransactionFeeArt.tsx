import { MoneroSymbol } from "./MoneroSymbol";

/** Figure for the "Monero transaction fee" article. Ledger line-art: forest strokes, clay accents. */

const FOREST = "#1f4733";
const CLAY = "#b4532a";
const PAPER = "#fbf7ee";
const LABEL = { fontFamily: "var(--font-display)", fontStyle: "italic" } as const;

/** What a fee pays for: size times a per-byte rate, collected by the miner. */
export function FeeBreakdownArt() {
  return (
    <svg viewBox="0 0 720 270" width="100%" role="img" aria-label="How a Monero fee is made: the size of your transaction in bytes, multiplied by a price per byte that rises with network use and the priority you pick, gives the fee, which is paid to the miner who adds your transaction to a block.">
      <rect x="20" y="50" width="170" height="110" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="105" y="82" fontSize="15" textAnchor="middle" fill={FOREST} style={LABEL}>Size of your</text>
      <text x="105" y="102" fontSize="15" textAnchor="middle" fill={FOREST} style={LABEL}>transaction</text>
      <text x="105" y="130" fontSize="12.5" textAnchor="middle" fill={CLAY} style={LABEL}>in bytes, not in coins</text>
      <text x="105" y="148" fontSize="12.5" textAnchor="middle" fill={CLAY} style={LABEL}>sent</text>

      <text x="215" y="112" fontSize="30" textAnchor="middle" fill={FOREST} style={LABEL}>x</text>

      <rect x="240" y="50" width="170" height="110" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="325" y="82" fontSize="15" textAnchor="middle" fill={FOREST} style={LABEL}>Price per byte</text>
      <text x="325" y="114" fontSize="12.5" textAnchor="middle" fill={CLAY} style={LABEL}>rises when blocks are busy</text>
      <text x="325" y="132" fontSize="12.5" textAnchor="middle" fill={CLAY} style={LABEL}>and with the priority</text>
      <text x="325" y="150" fontSize="12.5" textAnchor="middle" fill={CLAY} style={LABEL}>you choose</text>

      <text x="435" y="112" fontSize="30" textAnchor="middle" fill={FOREST} style={LABEL}>=</text>

      <rect x="460" y="50" width="110" height="110" rx="4" fill={PAPER} stroke={CLAY} strokeWidth="1.6" />
      <MoneroSymbol x={493} y={62} size={44} variant="mono" style={{ color: CLAY }} />
      <text x="515" y="124" fontSize="16" textAnchor="middle" fill={CLAY} style={LABEL}>The fee</text>
      <text x="515" y="144" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>shown before you send</text>

      <path d="M 572 105 L 616 105 M 608 99 L 616 105 L 608 111" stroke={FOREST} strokeWidth="1.4" fill="none" />

      <rect x="620" y="50" width="86" height="110" rx="4" fill={PAPER} stroke={FOREST} strokeWidth="1.4" />
      <text x="663" y="92" fontSize="15" textAnchor="middle" fill={FOREST} style={LABEL}>Miner</text>
      <text x="663" y="114" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>who adds your</text>
      <text x="663" y="132" fontSize="12.5" textAnchor="middle" fill={FOREST} style={LABEL}>block</text>

      <text x="360" y="208" fontSize="14" textAnchor="middle" fill={FOREST} style={LABEL}>The fee pays for space in a block. It does not depend on how much you send.</text>
      <text x="360" y="232" fontSize="14" textAnchor="middle" fill={CLAY} style={LABEL}>Not paid to MonkStash, an exchange, or any company.</text>
    </svg>
  );
}
