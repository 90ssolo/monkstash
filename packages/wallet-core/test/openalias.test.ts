import { describe, expect, it } from "vitest";
import { openAliasFqdn, parseOpenAliasTxt } from "../src/openalias";

// The real TXT records published at donate.getmonero.org (fetched 2026-10-15, DNSSEC validated).
const REAL = [
  '"oa1:btc recipient_address=1KTexdemPdxSBcG55heUuTjDRYqbC5ZL8H; recipient_name=Monero Development; tx_description=Donation to Monero Core Team;"',
  '"oa1:xmr recipient_address=888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H; recipient_name=Monero Development; tx_description=Donation to Monero Core Team;"',
];

describe("OpenAlias", () => {
  it("turns names into FQDNs as the spec says", () => {
    expect(openAliasFqdn("donate.getmonero.org")).toBe("donate.getmonero.org");
    expect(openAliasFqdn("  Donate@GetMonero.org. ")).toBe("donate.getmonero.org");
  });
  it("is not fooled by addresses, spaces or junk", () => {
    expect(openAliasFqdn("888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H")).toBeNull();
    expect(openAliasFqdn("localhost")).toBeNull();
    expect(openAliasFqdn("pay me.example.com")).toBeNull();
    expect(openAliasFqdn("a@b@c.com")).toBeNull();
    expect(openAliasFqdn("-bad.example.com")).toBeNull();
    expect(openAliasFqdn("example.123")).toBeNull();
    expect(openAliasFqdn("")).toBeNull();
  });
  it("picks the xmr record from real DNS data", () => {
    expect(parseOpenAliasTxt(REAL)).toEqual({
      address: "888tNkZrPN6JsEgekjMnABU4TBzc2Dt29EPAvkRxbANsAnjyPbb3iQ1YBRk1UXcdRsiKc9dhwMVgN5S9cQUiyoogDavup3H",
      name: "Monero Development",
      description: "Donation to Monero Core Team",
    });
  });
  it("joins split TXT strings and ignores other records", () => {
    expect(parseOpenAliasTxt(['"v=spf1 -all"', '"oa1:xmr recipient_address=4ABC" "DEF; recipient_name=Ann;"'])).toEqual({ address: "4ABCDEF", name: "Ann" });
  });
  it("returns null when there is no xmr record", () => {
    expect(parseOpenAliasTxt(['"oa1:btc recipient_address=1abc;"', '"hello"'])).toBeNull();
    expect(parseOpenAliasTxt(['"oa1:xmr recipient_name=No address;"'])).toBeNull();
  });
});
