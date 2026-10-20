import { describe, expect, it } from "vitest";
import { aliasChanged, checkContact, ContactError, contactForAddress, lookalikeContact, sortContacts, type Contact } from "../src/contacts";

const MAIN = "48VWHdLTEpE5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx2vsrG7c";
const STAGE = "58hYNUFQtRL5dqa5VpAy5xgQWBHZARiGmEmojNLqD4ef1FAzkPxCe9JXUYwCShRR5XNMGnyusrnkmMWr2HMdfDRx32FhSVJ";
const ana: Contact = { id: "1", name: "Ana", address: MAIN, createdAt: "2026-10-01T00:00:00Z" };

describe("contacts", () => {
  it("validates new contacts", () => {
    expect(checkContact({ name: "  Ana   Studio ", address: ` ${MAIN} ` }, "mainnet", [])).toEqual({ name: "Ana Studio", address: MAIN });
    expect(() => checkContact({ name: "", address: MAIN }, "mainnet", [])).toThrow(ContactError);
    expect(() => checkContact({ name: "x".repeat(41), address: MAIN }, "mainnet", [])).toThrow(/40/);
    expect(() => checkContact({ name: "Bob", address: "nope" }, "mainnet", [])).toThrow(/not a valid/);
    expect(() => checkContact({ name: "Bob", address: STAGE }, "mainnet", [])).toThrow(/stagenet address/);
    expect(() => checkContact({ name: "ana", address: STAGE }, "stagenet", [ana])).toThrow(/already have a contact called Ana/);
    expect(() => checkContact({ name: "Bob", address: MAIN }, "mainnet", [ana])).toThrow(/already saved as Ana/);
    expect(checkContact({ name: "Ana", address: MAIN, note: "Logo work" }, "mainnet", [ana], "1")).toMatchObject({ name: "Ana", note: "Logo work" });
    expect(checkContact({ name: "Monero", address: MAIN, alias: "donate@getmonero.org" }, "mainnet", []).alias).toBe("donate.getmonero.org");
  });

  it("recognises an exact saved address", () => {
    expect(contactForAddress(` ${MAIN}`, [ana])?.name).toBe("Ana");
    expect(contactForAddress(STAGE, [ana])).toBeNull();
  });

  it("raises the alarm for a lookalike (poisoned) address", () => {
    // Same first and last characters, different middle: what address-poisoning malware produces.
    const fake = MAIN.slice(0, 10) + "X".repeat(MAIN.length - 16) + MAIN.slice(-6);
    expect(lookalikeContact(fake, [ana])?.name).toBe("Ana");
    expect(lookalikeContact(MAIN, [ana])).toBeNull(); // the real one is fine
    expect(lookalikeContact(STAGE, [ana])).toBeNull(); // unrelated address
    expect(lookalikeContact("48VW", [ana])).toBeNull();
  });

  it("flags a saved name that now points somewhere else", () => {
    const byName: Contact = { ...ana, alias: "donate.getmonero.org" };
    expect(aliasChanged(byName, MAIN)).toBe(false);
    expect(aliasChanged(byName, STAGE)).toBe(true);
    expect(aliasChanged(ana, STAGE)).toBe(false); // saved by address: fresh subaddresses are normal
  });

  it("sorts recently paid first, then by name", () => {
    const list: Contact[] = [
      { ...ana, id: "a", name: "Zed" },
      { ...ana, id: "b", name: "Bea", lastPaidAt: "2026-10-10T00:00:00Z" },
      { ...ana, id: "c", name: "Al" },
    ];
    expect(sortContacts(list).map((c) => c.name)).toEqual(["Bea", "Al", "Zed"]);
  });
});
