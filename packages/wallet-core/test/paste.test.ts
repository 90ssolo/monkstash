import { describe, expect, it } from "vitest";
import { giftLink } from "../src/gift";
import { readPastedRecipient } from "../src/paste";
import { buildPaymentFragment, parsePaymentUri, paymentLink } from "../src/request";

// Published address: the Monero General Fund (getmonero.org).
const FUND = "44AFFq5kSiGBoZ4NMDwYtN18obc8AemS33DBLWs3H7otXft3XjrpDtQGv7SqSsaBYBb98uNbr2VBBEt7f2wfn3RVGQBEP3A";

describe("readPastedRecipient", () => {
  it("reads a bare address, also when it was copied over several lines", () => {
    expect(readPastedRecipient(`  ${FUND}\n`)).toEqual({ kind: "address", address: FUND });
    const broken = `${FUND.slice(0, 40)}\n${FUND.slice(40, 80)} ${FUND.slice(80)}`;
    expect(readPastedRecipient(broken)).toEqual({ kind: "address", address: FUND });
  });
  it("reads monero: payment links", () => {
    const uri = `monero:${FUND}?tx_amount=0.25&tx_description=Coffee`;
    const p = readPastedRecipient(uri);
    expect(p).toEqual({ kind: "request", uri });
    expect(parsePaymentUri((p as { uri: string }).uri).amount).toBe(250_000_000_000n);
  });
  it("reads MonkStash pay links, including fiat-priced ones", () => {
    const frag = buildPaymentFragment({ address: FUND, amount: 100_000_000_000n, fiat: { currency: "EUR", amount: "20.00", rate: "200" } });
    const link = paymentLink("https://monkstash.com", frag);
    const p = readPastedRecipient(link);
    expect(p.kind).toBe("request");
    const req = parsePaymentUri((p as { uri: string }).uri);
    expect(req.address).toBe(FUND);
    expect(req.amount).toBe(100_000_000_000n);
  });
  it("spots a gift link pasted by mistake, and is not fooled by an address", () => {
    expect(readPastedRecipient(giftLink("https://wallet.monkstash.com/gift", "3".repeat(60))).kind).toBe("gift");
    expect(readPastedRecipient(FUND).kind).toBe("address");
  });
  it("reads names and leaves everything else alone", () => {
    expect(readPastedRecipient("donate.getmonero.org")).toEqual({ kind: "name", name: "donate.getmonero.org" });
    expect(readPastedRecipient("donate@getmonero.org").kind).toBe("name");
    expect(readPastedRecipient("").kind).toBe("empty");
    expect(readPastedRecipient("hello there").kind).toBe("unknown");
    expect(readPastedRecipient("https://example.com/page").kind).toBe("unknown");
    expect(readPastedRecipient("bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq").kind).toBe("unknown");
  });
});
