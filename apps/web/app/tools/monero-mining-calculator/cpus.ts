/**
 * Approximate RandomX (rx/0) hashrates for a few common CPUs, rounded to the nearest 100 H/s.
 * Source: the public XMRig benchmark list (https://xmrig.com/benchmark, multi-thread RandomX
 * table), checked October 2026. Results there are submitted by users, so treat them as a
 * rough guide, not a promise.
 */
export const BENCH_URL = "https://xmrig.com/benchmark";

export interface CpuBench {
  name: string;
  /** H/s, rounded. */
  hashrate: number;
}

export const CPUS: CpuBench[] = [
  { name: "AMD Ryzen 9 7950X", hashrate: 27_000 },
  { name: "AMD Ryzen 9 5950X", hashrate: 23_400 },
  { name: "AMD Ryzen 9 7900X", hashrate: 20_700 },
  { name: "Intel Core i9-14900K", hashrate: 16_300 },
  { name: "AMD Ryzen 7 5800X", hashrate: 12_400 },
  { name: "AMD Ryzen 7 5700X", hashrate: 11_200 },
  { name: "Intel Core i7-12700K", hashrate: 10_000 },
  { name: "AMD Ryzen 5 5600X", hashrate: 9_100 },
  { name: "Apple M4 Pro", hashrate: 6_800 },
];
