import { describe, expect, it } from "vitest";
import { combineUsd, combineWithBackup, parseBitfinex, parseCoingecko, parseEcb, parseKraken, parseKucoin, parseLiveCoinWatch, PriceError, rateString, xmrRates } from "../src/prices";
import { fiatToAtomic } from "../src/invoice";

// Real responses captured on 2026-10-15 (trimmed).
const KRAKEN = { error: [], result: { XXMRZUSD: { a: ["534.77000000", "1", "1.000"], c: ["534.45000000", "2.46737682"] } } };
const BITFINEX = [534.72, 19.48, 534.9, 38.82, -21.17, -0.038, 534.84, 2225.67, 559.8, 532.91];
const KUCOIN = { code: "200000", data: { time: 1792068355516, price: "535.27", bestBid: "535.21" } };
const GECKO = { monero: { usd: 535.04, eur: 477.25 } };
const ECB = `<?xml version="1.0" encoding="UTF-8"?><gesmes:Envelope><Cube><Cube time='2026-10-14'>
  <Cube currency='USD' rate='1.1195'/><Cube currency='JPY' rate='171.03'/><Cube currency='GBP' rate='0.86015'/>
</Cube></Cube></gesmes:Envelope>`;

describe("price sources", () => {
  it("parses each exchange's real response", () => {
    expect(parseKraken(KRAKEN)).toBe(534.45);
    expect(parseBitfinex(BITFINEX)).toBe(534.84);
    expect(parseKucoin(KUCOIN)).toBe(535.27);
    expect(parseCoingecko(GECKO)).toBe(535.04);
    expect(parseLiveCoinWatch({ rate: 534.6081324140566, volume: 144048538 })).toBe(534.6081324140566);
  });
  it("returns null for errors and junk", () => {
    expect(parseKraken({ error: ["EQuery:Unknown asset pair"], result: {} })).toBeNull();
    expect(parseKucoin({ code: "400100", data: null })).toBeNull();
    expect(parseBitfinex(["error", 10020, "symbol: invalid"])).toBeNull();
    expect(parseCoingecko({ status: { error_code: 429 } })).toBeNull();
    expect(parseCoingecko({ monero: { usd: -1 } })).toBeNull();
    expect(parseLiveCoinWatch({ error: { code: 401, status: "Unauthorized" } })).toBeNull();
    expect(parseKraken(null)).toBeNull();
  });
  it("parses the ECB table and adds EUR", () => {
    const e = parseEcb(ECB)!;
    expect(e.date).toBe("2026-10-14");
    expect(e.perEur).toMatchObject({ USD: 1.1195, JPY: 171.03, GBP: 0.86015, EUR: 1 });
    expect(parseEcb("<html>maintenance</html>")).toBeNull();
  });
});

describe("combining", () => {
  it("takes the median and drops an outlier", () => {
    const r = combineUsd([
      { source: "Kraken", usd: 534.45 },
      { source: "Bitfinex", usd: 534.84 },
      { source: "KuCoin", usd: 535.27 },
      { source: "Broken", usd: 999 },
    ]);
    expect(r.sources).toEqual(["Bitfinex", "Kraken", "KuCoin"]);
    expect(r.usd).toBe(534.84);
  });
  it("uses exchanges first and asks backups only when needed", async () => {
    let asked = 0;
    const backup = async () => { asked++; return [{ source: "CoinGecko", usd: 535.04 }, { source: "LiveCoinWatch", usd: 534.6 }]; };
    const ex = [{ source: "Kraken", usd: 534.45 }, { source: "Bitfinex", usd: 534.84 }, { source: "KuCoin", usd: 535.27 }];
    expect(await combineWithBackup(ex, backup)).toMatchObject({ usd: 534.84, usedBackup: false });
    expect(asked).toBe(0);
    // Two exchanges down: the one left is topped up by the backups.
    const r = await combineWithBackup([ex[0]!], backup);
    expect(r).toMatchObject({ usedBackup: true, sources: ["CoinGecko", "Kraken", "LiveCoinWatch"] });
    expect(asked).toBe(1);
    // Everything down: still refuses rather than guessing.
    await expect(combineWithBackup([], async () => [])).rejects.toThrow(PriceError);
  });
  it("refuses a single source or sources that disagree", () => {
    expect(() => combineUsd([{ source: "Kraken", usd: 534 }])).toThrow(PriceError);
    expect(() => combineUsd([{ source: "A", usd: 500 }, { source: "B", usd: 600 }])).toThrow(PriceError);
  });
  it("converts to every currency through the ECB rates", () => {
    const rates = xmrRates(534.84, parseEcb(ECB)!);
    expect(rates.USD).toBe("534.84");
    expect(Number(rates.EUR)).toBeCloseTo(534.84 / 1.1195, 4);
    expect(Number(rates.JPY)).toBeCloseTo((534.84 / 1.1195) * 171.03, 2);
    // The strings feed the invoice engine directly.
    expect(fiatToAtomic("10", rates.EUR!)).toBeGreaterThan(0n);
  });
  it("formats rates without exponents", () => {
    expect(rateString(477.7445288)).toBe("477.74453");
    expect(rateString(81709.1)).toBe("81709.1");
    expect(rateString(0.000123456789)).toBe("0.00012345679");
    expect(() => rateString(0)).toThrow(PriceError);
  });
});
