import { describe, expect, it } from "vitest";
import { addressKey, cleanNote, EMPTY_LABELS, labelCount, mergeLabels, LABEL_MAX, readLabels, withAddressLabel, withTxNote } from "../src/labels";
import { dailyPrices, historyCurrencies, parseBitfinexCandles, parseEcbHistory, parseKrakenOhlc, utcDay } from "../src/priceHistory";

const H1 = "a".repeat(64);
const H2 = "b".repeat(64);

describe("labels", () => {
  it("cleans notes to one short line", () => {
    expect(cleanNote("  rent\n for\tMarch  ")).toBe("rent for March");
    expect(cleanNote("a\u202eb\u0000c")).toBe("a b c");
    expect([...cleanNote("x".repeat(500))]).toHaveLength(LABEL_MAX);
    expect(cleanNote("   ")).toBe("");
  });

  it("sets and removes notes and address labels without changing the original", () => {
    const a = withTxNote(EMPTY_LABELS, H1, " Rent ");
    expect(a.tx[H1]).toBe("Rent");
    expect(EMPTY_LABELS.tx).toEqual({});
    expect(withTxNote(a, H1, "").tx).toEqual({});
    const b = withAddressLabel(a, 0, 3, "8addr", "Given to Ana");
    expect(b.addr[addressKey(0, 3)]).toEqual({ label: "Given to Ana", address: "8addr" });
    expect(labelCount(b)).toBe(2);
    expect(withAddressLabel(b, 0, 3, "8addr", " ").addr).toEqual({});
  });

  it("reads only the expected shape", () => {
    expect(readLabels(null)).toEqual(EMPTY_LABELS);
    expect(readLabels({ tx: { [H1]: "ok", nothex: "x", [H2]: 5 }, addr: { "0/1": { label: "A", address: "8" }, bad: { label: "B", address: "8" }, "0/2": { label: 1 } } }))
      .toEqual({ tx: { [H1]: "ok" }, addr: { "0/1": { label: "A", address: "8" } } });
  });

  it("merges a move file without overwriting this device", () => {
    const here = withTxNote(EMPTY_LABELS, H1, "mine");
    const moved = withTxNote(withTxNote(EMPTY_LABELS, H1, "theirs"), H2, "new");
    expect(mergeLabels(here, moved).tx).toEqual({ [H1]: "mine", [H2]: "new" });
  });
});

describe("price history", () => {
  const day = (d: string) => Date.parse(`${d}T00:00:00Z`);
  it("parses Bitfinex and Kraken daily closes", () => {
    expect(parseBitfinexCandles([[day("2024-01-01"), 160, 165.5, 170, 150, 9], [day("2024-01-02"), 1, 0, 1, 1, 1], "x"])).toEqual({ "2024-01-01": 165.5 });
    expect(parseKrakenOhlc({ error: [], result: { XXMRZUSD: [[day("2024-01-01") / 1000, "1", "2", "0.5", "1.5", "1", "9", 3]], last: 1 } })).toEqual({ "2024-01-01": 1.5 });
    expect(parseKrakenOhlc({ error: ["EGeneral"], result: {} })).toEqual({});
    expect(utcDay(day("2024-02-29") + 86_399_000)).toBe("2024-02-29");
  });

  it("parses the ECB history from a start date", () => {
    const xml = `<Cube><Cube time="2024-01-05"><Cube currency="USD" rate="1.1"/><Cube currency="GBP" rate="0.86"/></Cube><Cube time="2024-01-04"><Cube currency="USD" rate="1.0"/><Cube currency="GBP" rate="0.8"/></Cube><Cube time="2015-12-31"><Cube currency="USD" rate="1"/></Cube></Cube>`;
    const ecb = parseEcbHistory(xml);
    expect(Object.keys(ecb).sort()).toEqual(["2024-01-04", "2024-01-05"]);
    expect(ecb["2024-01-05"]).toEqual({ EUR: 1, USD: 1.1, GBP: 0.86 });
    expect(historyCurrencies(ecb)).toEqual(["EUR", "GBP", "USD"]);
  });

  it("combines USD days with ECB rates, carrying rates over weekends", () => {
    const ecb = { "2024-01-05": { EUR: 1, USD: 1.25, GBP: 0.875 } }; // a Friday
    const primary = { "2024-01-05": 100, "2024-01-06": 110 };
    const backup = { "2024-01-04": 90, "2024-01-06": 999 };
    expect(dailyPrices("USD", primary, backup, ecb)).toEqual({ "2024-01-04": "90", "2024-01-05": "100", "2024-01-06": "110" });
    // 2024-01-04 has no ECB rate yet, so it is left out; Saturday uses Friday's rate.
    expect(dailyPrices("EUR", primary, backup, ecb)).toEqual({ "2024-01-05": "80", "2024-01-06": "88" });
    expect(dailyPrices("GBP", primary, backup, ecb)).toEqual({ "2024-01-05": "70", "2024-01-06": "77" });
    expect(dailyPrices("XYZ", primary, backup, ecb)).toEqual({});
  });
});
