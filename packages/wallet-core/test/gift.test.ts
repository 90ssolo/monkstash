import { describe, expect, it } from "vitest";
import { cleanGiftMessage, decodeGift, encodeGift, giftCodeIn, giftLink, GiftLinkError, mergeGifts, readGifts, type GiftRecord } from "../src/gift";

const KEY = "0f".repeat(32);
const base = { network: "mainnet" as const, spendKey: KEY, height: 3_412_345, message: "Happy birthday" };

describe("gift links", () => {
  it("round-trips key, network, height and message", () => {
    const code = encodeGift(base);
    expect(decodeGift(code)).toEqual(base);
    expect(decodeGift(encodeGift({ ...base, network: "stagenet", message: "" }))).toEqual({ ...base, network: "stagenet", message: "" });
  });

  it("carries the amount in version 2 links, and still reads version 1 links", () => {
    const withAmount = { ...base, amount: "500000000000" };
    const code = encodeGift(withAmount);
    expect(decodeGift(code)).toEqual(withAmount);
    expect(decodeGift(encodeGift({ ...withAmount, message: "" }))).toEqual({ ...withAmount, message: "" });
    // A version 1 link made before amounts existed: no amount, everything else intact.
    const v1 = encodeGift(base);
    expect(decodeGift(v1)).toEqual(base);
    expect(code.length).toBeGreaterThan(v1.length);
    expect(() => encodeGift({ ...base, amount: "0" })).toThrow(GiftLinkError);
  });

  it("keeps a multi-byte message within one length byte", () => {
    const long = "\u{1F381}".repeat(200);
    const decoded = decodeGift(encodeGift({ ...base, message: long }));
    expect(new TextEncoder().encode(decoded.message).length).toBeLessThanOrEqual(255);
    expect(decoded.message.startsWith("\u{1F381}")).toBe(true);
  });

  it("rejects a link with one character changed or cut short", () => {
    const code = encodeGift(base);
    const swapped = code.slice(0, 20) + (code[20] === "a" ? "b" : "a") + code.slice(21);
    expect(() => decodeGift(swapped)).toThrow(GiftLinkError);
    expect(() => decodeGift(code.slice(0, -5))).toThrow(GiftLinkError);
    expect(() => decodeGift("not a gift")).toThrow(GiftLinkError);
  });

  it("cleans messages: one line, no direction tricks", () => {
    expect(cleanGiftMessage("  hi\n\nthere ‮evil ")).toBe("hi there evil");
    expect([...cleanGiftMessage("x".repeat(500))].length).toBe(140);
  });

  it("finds the code in a pasted link or on its own", () => {
    const code = encodeGift(base);
    const link = giftLink("https://wallet.monkstash.com/", code);
    expect(link).toBe(`https://wallet.monkstash.com/#gift=${code}`);
    expect(giftCodeIn(`  ${link} `)).toBe(code);
    expect(giftCodeIn(code)).toBe(code);
    expect(giftCodeIn("https://wallet.monkstash.com/#section=send")).toBeNull();
  });

  it("merges gift lists by id and drops malformed entries", () => {
    const g = (id: string, createdAt: number): GiftRecord => ({ ...base, id, amount: "1000", createdAt });
    expect(mergeGifts([g("a", 2)], [g("a", 9), g("b", 3)]).map((x) => x.id)).toEqual(["b", "a"]);
    expect(readGifts([g("a", 1), { id: "x" }, null, { ...g("c", 1), spendKey: "zz" }]).map((x) => x.id)).toEqual(["a"]);
  });

  it("keeps what either device learned about a gift when merging", () => {
    const g: GiftRecord = { ...base, id: "a", amount: "1000", createdAt: 1 };
    const [m] = mergeGifts([g], [{ ...g, hash: "ab", claimedAt: 5, reclaimed: true }]);
    expect(m).toMatchObject({ hash: "ab", claimedAt: 5, reclaimed: true });
    const [k] = mergeGifts([{ ...g, hash: "cd" }], [{ ...g, hash: "ab" }]);
    expect(k!.hash).toBe("cd");
  });
});
