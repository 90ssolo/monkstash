/**
 * Offline estimate of the Monero block height at a given date (the "restore height").
 *
 * Mainnet uses real (height, timestamp) anchors read from block headers every 100,000 blocks,
 * and interpolates between them. A single anchor with a fixed 120-second block time is not
 * enough: blocks came every 60 seconds until March 2016, so extrapolating backwards would put
 * an early wallet's start point far too late and the scan would miss its first payments.
 *
 * The estimate is moved earlier by a safety margin, because starting the scan too late misses
 * funds while starting a little early only costs some extra scanning.
 */
import type { NetworkType } from "./network";

/**
 * [height, unix seconds] from block headers (public mainnet node, fetched 2026-10-15): every
 * 100,000 blocks, plus block 1,009,827 where block time changed from 60 to 120 seconds.
 */
// prettier-ignore
const MAINNET_ANCHORS: readonly (readonly [number, number])[] = [
  [1, 1397818193], [100001, 1403640002], [200001, 1409644544], [300001, 1415690634], [400001, 1421749759],
  [500001, 1427785317], [600001, 1433825149], [700001, 1439872934], [800001, 1445938582], [900001, 1452044697],
  [1000001, 1458145506], [1009827, 1458748658], [1100001, 1469573596], [1200001, 1481576008], [1300001, 1493568604], [1400001, 1505525745],
  [1500001, 1517489517], [1600001, 1529603428], [1700001, 1541612996], [1800001, 1553698479], [1900001, 1565709582],
  [2000001, 1577680290], [2100001, 1589683819], [2200001, 1601704045], [2300001, 1613708130], [2400001, 1625715904],
  [2500001, 1637720923], [2600001, 1649731573], [2700001, 1661752945], [2800001, 1673769946], [2900001, 1685787047],
  [3000001, 1697813354], [3100001, 1709832796], [3200001, 1721843341], [3300001, 1733848767], [3400001, 1745849788],
  [3500001, 1757868675], [3600001, 1769885845], [3700001, 1781905893], [3784206, 1792024544],
];

/** Stagenet (test network) has a single observed anchor; it only matters in development. */
const STAGENET_ANCHOR: readonly [number, number] = [2_226_373, Date.UTC(2026, 9, 10, 16, 30) / 1000];

export const BLOCK_TIME_S = 120;
/** Default safety margin: start the scan this many days before the given date. */
export const RESTORE_MARGIN_DAYS = 7;

function interpolate(anchors: readonly (readonly [number, number])[], t: number): number {
  const first = anchors[0]!;
  const last = anchors[anchors.length - 1]!;
  if (t <= first[1]) return 0;
  if (t >= last[1]) return last[0] + Math.floor((t - last[1]) / BLOCK_TIME_S);
  for (let i = 1; i < anchors.length; i++) {
    const [h1, t1] = anchors[i]!;
    if (t <= t1) {
      const [h0, t0] = anchors[i - 1]!;
      return Math.floor(h0 + ((t - t0) / (t1 - t0)) * (h1 - h0));
    }
  }
  return last[0];
}

/**
 * Estimated block height for a date, moved `marginDays` earlier. Unknown networks return 0
 * (scan from genesis: always correct, just slow).
 */
export function estimateHeightAt(date: Date, network: NetworkType = "mainnet", marginDays = RESTORE_MARGIN_DAYS): number {
  const t = date.getTime() / 1000 - marginDays * 86_400;
  if (network === "mainnet") return Math.max(0, interpolate(MAINNET_ANCHORS, t));
  if (network === "stagenet") return Math.max(0, STAGENET_ANCHOR[0] + Math.floor((t - STAGENET_ANCHOR[1]) / BLOCK_TIME_S));
  return 0;
}

/** Approximate date of a mainnet block height (inverse of the estimate, no margin). */
export function estimateDateOfHeight(height: number): Date {
  const a = MAINNET_ANCHORS;
  const last = a[a.length - 1]!;
  if (height <= a[0]![0]) return new Date(a[0]![1] * 1000);
  if (height >= last[0]) return new Date((last[1] + (height - last[0]) * BLOCK_TIME_S) * 1000);
  for (let i = 1; i < a.length; i++) {
    const [h1, t1] = a[i]!;
    if (height <= h1) {
      const [h0, t0] = a[i - 1]!;
      return new Date((t0 + ((height - h0) / (h1 - h0)) * (t1 - t0)) * 1000);
    }
  }
  return new Date(last[1] * 1000);
}
