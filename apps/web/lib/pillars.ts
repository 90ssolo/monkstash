/**
 * Pillars and clusters (Backlinko hub model). Each pillar is one flagship guide; its
 * cluster pages go deeper on one subtopic each. This registry is the single source for
 * breadcrumbs (Home > Pillar > Page), the pillar's chapter blocks, and previous/next
 * links between cluster pages. URLs stay flat; membership lives here, not in the path.
 *
 * Paths, not slugs, so non-article pages (tools, landing pages) can belong to a pillar.
 */
export type PillarId = "web-wallet" | "wallets" | "seed-keys" | "using" | "basics" | "nodes" | "buying" | "merchants" | "legal";

export interface Pillar {
  id: PillarId;
  /** Short name used in breadcrumbs and menus. */
  name: string;
  /** The pillar page itself. */
  path: string;
  /** Cluster pages, in reading order. */
  cluster: string[];
}

export const PILLARS: Pillar[] = [
  {
    id: "web-wallet",
    name: "Monero web wallet",
    path: "/",
    cluster: ["/create-monero-wallet", "/monero-light-wallet", "/monero-chrome-extension", "/mymonero-alternative", "/restore-mymonero-seed", "/exodus-monero", "/monero-phishing-sites"],
  },
  {
    id: "wallets",
    name: "Best Monero wallets",
    path: "/monero-wallets",
    cluster: [
      "/monero-wallets/safest-monero-wallet", "/monero-wallets/desktop", "/monero-wallets/android", "/monero-wallets/iphone",
      "/monero-wallets/hardware", "/monero-wallets/feather-wallet-review", "/monero-wallets/cake-wallet-review",
      "/monero-wallets/monero-gui-vs-cli", "/monero-gui-virus-warning",
    ],
  },
  {
    id: "seed-keys",
    name: "Seed phrase and keys",
    path: "/monero-seed-phrase",
    cluster: ["/back-up-monero-wallet", "/restore-monero-wallet", "/monero-restore-height", "/tools/monero-restore-height-calculator", "/monero-view-key", "/monero-view-only-wallet"],
  },
  {
    id: "using",
    name: "Using Monero",
    path: "/use-monero",
    cluster: [
      "/send-monero", "/receive-monero", "/monero-subaddress", "/monero-transaction-fee", "/tools/monero-fee-calculator", "/monero-transaction-time",
      "/monero-unlocked-balance", "/monero-transaction-lookup", "/check-monero-balance", "/tools/monero-address-validator", "/monero-wallet-not-syncing",
      "/monero-wallet-not-connecting", "/monero-wallet-not-showing-balance",
    ],
  },
  {
    id: "basics",
    name: "What is Monero",
    path: "/what-is-monero",
    cluster: ["/how-monero-works", "/monero-ring-signatures", "/monero-stealth-address", "/monero-fcmp", "/is-monero-traceable", "/is-monero-safe", "/monero-vs-bitcoin", "/monero-vs-zcash"],
  },
  {
    id: "nodes",
    name: "Nodes and mining",
    path: "/monero-node",
    cluster: ["/run-a-monero-node", "/monero-remote-node", "/monero-pruned-node", "/mine-monero", "/tools/monero-mining-calculator", "/monero-p2pool"],
  },
  {
    id: "buying",
    name: "Get Monero",
    path: "/buy-monero",
    cluster: ["/buy-monero-without-kyc", "/swap-bitcoin-to-monero"],
  },
  {
    id: "merchants",
    name: "Accept Monero",
    path: "/accept-monero-payments",
    cluster: ["/monero-payment-link", "/tools/monero-qr-code-generator", "/monero-pos", "/monero-payment-gateway", "/monero-woocommerce"],
  },
  {
    id: "legal",
    name: "Monero and the law",
    path: "/is-monero-legal",
    cluster: ["/monero-eu-2027"],
  },
];

export function getPillar(id: PillarId): Pillar {
  return PILLARS.find((p) => p.id === id)!;
}

/** The pillar a page belongs to, either as the pillar page itself or as a cluster page. */
export function pillarOf(path: string): { pillar: Pillar; isPillar: boolean } | null {
  for (const pillar of PILLARS) {
    if (pillar.path === path) return { pillar, isPillar: true };
    if (pillar.cluster.includes(path)) return { pillar, isPillar: false };
  }
  return null;
}

/** Previous and next cluster pages within the same pillar (Backlinko-style sequence). */
export function clusterNeighbors(path: string): { prev: string | null; next: string | null } {
  const found = pillarOf(path);
  if (!found || found.isPillar) return { prev: null, next: null };
  const list = found.pillar.cluster;
  const i = list.indexOf(path);
  return { prev: i > 0 ? list[i - 1]! : found.pillar.path, next: i < list.length - 1 ? list[i + 1]! : null };
}
