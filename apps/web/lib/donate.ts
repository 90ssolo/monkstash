/**
 * Donation page data: the /donate page reads everything from here.
 * Nothing on the page is ever invented: null means "not published yet" and the page says so.
 */
export type MilestoneStatus = "live" | "building" | "next" | "later";

export interface Milestone {
  id: string;
  title: string;
  outcome: string;
  why: string;
  status: MilestoneStatus;
}

export const donate = {
  /** Public XMR donation address (mainnet). */
  address: "49e3LYdPPHjgf27mSUD6ya8P5zcgwa8CWaBRjgEq44EtHqppMhLTSVsRuWpW4zCNeFWrGPvnxakAccZjtQBMQtLeJAYou4F" as string | null,
  /** Private VIEW key of the donation wallet, published so anyone can verify incoming donations. Verified to match the address. */
  viewKey: "29d19a4dcd1e79db030cf4ef23548950ccf800e1e455d32cff2f8567078e560e" as string | null,
  /** Block height the donation wallet was created at (15 October 2026); the tracker scans from here. */
  restoreHeight: 3783215 as number | null,
  /** Where supporters can ask to be listed (forum thread, Matrix room, repo issue). */
  contactUrl: null as string | null,
  supporters: [] as { name: string; note?: string }[],
  /** How donations are spent. Shown on the page and in the FAQ. */
  spendingPolicy:
    "Donations fund the feature at the front of the line and keep the free web wallet running. There are no targets and no countdowns: we build in this order, at the pace support allows, and never spend on anything outside this roadmap.",
  /** The public roadmap: six user-facing steps, built in this order. */
  milestones: [
    {
      id: "web-wallet",
      title: "A private wallet in your browser",
      outcome: "A free, non-custodial Monero wallet in your browser. Restores 25-word seeds, MyMonero's 13 words and Exodus's 12 words, and can use your own node.",
      why: "The gift that comes first. It is live and free, and it stays free.",
      status: "live",
    },
    {
      id: "payment-requests",
      title: "Get paid: links, a till and shop checkout",
      outcome: "Payment links priced in XMR, euros or dollars, a Pay with Monero button and cashier mode are live. Shop checkout (MonkStash Pay and a WooCommerce plugin) is built and tested on the test network, and is coming next.",
      why: "The easiest way to get paid in Monero, from any wallet, without handing your keys or your customers to a middleman.",
      status: "live",
    },
    {
      id: "verifiable-builds",
      title: "Proof the code is genuine",
      outcome: "Open source (BSD-3-Clause) and reproducible builds with a free checker are live: anyone can rebuild the wallet and confirm the site serves exactly the published code. Still to come: signed releases.",
      why: "A web wallet should never ask for blind trust. Open code lets you read it; verifiable builds let you check it.",
      status: "building",
    },
    {
      id: "fcmp",
      title: "Ready for Monero's biggest upgrade",
      outcome: "Support for FCMP++, the planned upgrade that replaces ring signatures with full-chain membership proofs, so your wallet keeps working when the network switches over.",
      why: "When Monero upgrades, your wallet has to be ready on day one.",
      status: "next",
    },
    {
      id: "security-review",
      title: "An independent security review",
      outcome: "An outside firm reviews the wallet code, and we publish the report.",
      why: "Funded by donations. A review is only worth something if someone independent does it.",
      status: "later",
    },
    {
      id: "extension",
      title: "Extension and phone apps",
      outcome: "MonkStash in your Chrome and Firefox toolbar, then as an app on iPhone and Android, built on the same wallet core.",
      why: "There is still no good Monero browser extension. This fills the gap.",
      status: "later",
    },
  ] as Milestone[],
};
