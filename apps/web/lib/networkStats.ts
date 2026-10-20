/** Shape of /api/network-stats: live Monero mainnet difficulty and block reward, for the mining calculator. */
export interface NetworkStats {
  ok: true;
  /** Height of the newest block (the chain tip). */
  height: number;
  /** Current network difficulty (expected hashes needed to find the next block). */
  difficulty: number;
  /** Target seconds between blocks (120 on Monero). */
  targetSeconds: number;
  /** Network hashrate in H/s, derived as difficulty / targetSeconds. */
  networkHashrate: number;
  /** Total reward of the newest block (base reward plus that block's fees), in piconero. */
  lastBlockReward: number;
  /** RingCT outputs on the chain up to the tip (get_output_distribution), when the node answered. */
  rctOutputs?: number;
  /** When the numbers were read (ISO). */
  fetchedAt: string;
}

export interface NetworkStatsUnavailable {
  ok: false;
  fetchedAt: string;
}

/** Monero's target block time, in seconds. */
export const BLOCK_TARGET_SECONDS = 120;
/** Monero's tail emission per block since June 2022, in XMR. Fees are added on top. */
export const TAIL_EMISSION_XMR = 0.6;

export interface MiningInput {
  /** Your hashrate, H/s. */
  hashrate: number;
  difficulty: number;
  /** Block reward in XMR. */
  rewardXmr: number;
  /** Pool fee as a fraction, 0 to 1. */
  feeFraction: number;
  targetSeconds?: number;
}

export interface MiningEstimate {
  networkHashrate: number;
  share: number;
  blocksPerDay: number;
  xmrPerDay: number;
  /** Days until you have mined 1 XMR at the expected rate (pool or P2Pool). */
  daysPerXmr: number;
  /** Solo: expected days between blocks you find. */
  soloDaysPerBlock: number;
}

/** Expected earnings. Pure function so the page and any tests share one formula. */
export function estimateMining(i: MiningInput): MiningEstimate {
  const target = i.targetSeconds ?? BLOCK_TARGET_SECONDS;
  const networkHashrate = i.difficulty / target;
  const blocksPerDay = 86_400 / target;
  const share = i.hashrate / networkHashrate;
  const xmrPerDay = share * blocksPerDay * i.rewardXmr * (1 - i.feeFraction);
  return {
    networkHashrate,
    share,
    blocksPerDay,
    xmrPerDay,
    daysPerXmr: xmrPerDay > 0 ? 1 / xmrPerDay : Infinity,
    soloDaysPerBlock: i.hashrate > 0 ? networkHashrate / i.hashrate / blocksPerDay : Infinity,
  };
}
