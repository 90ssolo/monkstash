/**
 * Links to products we recommend, in one place. `ref` is the affiliate link from the maker's
 * programme; while it is empty the plain shop link is used and nothing is earned. A link with a
 * `ref` is always shown with an "Affiliate link" note and rel="sponsored", and it never changes
 * what a guide recommends. Content pages only: wallet pages never carry partner links.
 */
export type PartnerKey = "trezor" | "ledger";

export interface Partner {
  name: string;
  /** The maker's own shop. Buying there avoids tampered devices from resellers. */
  shop: string;
  /** The affiliate link from the maker's programme, or "" when we have none. */
  ref: string;
}

export const partners: Record<PartnerKey, Partner> = {
  trezor: { name: "Trezor", shop: "https://trezor.io/trezor-safe-5", ref: "" },
  ledger: { name: "Ledger", shop: "https://shop.ledger.com/", ref: "" },
};

export function partnerLink(key: PartnerKey): { href: string; affiliate: boolean; name: string } {
  const p = partners[key];
  return { href: p.ref || p.shop, affiliate: !!p.ref, name: p.name };
}
