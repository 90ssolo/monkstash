import type { ReactNode } from "react";

/**
 * Section = which library index lists the article (/learn, /guides, or the wallets hub).
 * It does NOT set the URL: learn and guides articles live at flat root URLs (/<slug>,
 * Brian Dean / Backlinko style), and wallet reviews sit under the /monero-wallets hub,
 * whose folder name is itself the keyword. Breadcrumbs follow the pillar (lib/pillars.ts).
 */
export type Section = "learn" | "guides" | "wallets";
/** Sections that have their own generated library page (the wallets hub is the custom /monero-wallets page). */
export type HubSection = "learn" | "guides";

/** Library index page per section. */
// Guides and explainers share one library hub (/learn); /guides redirects there.
export const SECTION_PATH: Record<Section, string> = { learn: "/learn", guides: "/learn", wallets: "/monero-wallets" };
export const SECTION_LABEL: Record<Section, string> = { learn: "Learn", guides: "Learn", wallets: "Monero wallets" };

export interface ArticleMeta {
  slug: string;
  section: Section;
  kicker: string;
  title: string;
  /**
   * Shorter <title> for search results when `title` (the H1) is too long. The layout appends
   * " | MonkStash" (12 chars), so keep this at 48 chars or fewer. Falls back to `title`.
   */
  seoTitle?: string;
  /** <= ~155 chars, used for <meta description> and card summary. */
  summary: string;
  keyword: string;
  updated: string; // ISO date
  /** First publication date (ISO). Until launch, articles fall back to `updated`. */
  published?: string;
  readingMinutes: number;
  toc: { id: string; label: string }[];
  related: string[]; // slugs
  faq?: { q: string; a: string }[];
  /**
   * Pillar pages (the flagship guide of a pillar, see lib/pillars.ts) use the chapter
   * layout. `toc` then lists the chapters, and `chapterBlurbs` adds a one-line teaser per
   * chapter for the "What's inside" grid.
   */
  layout?: "pillar";
  /** Pillar H1: the keyword line, then the benefit line. `title` remains the <title>. */
  h1?: { keyword: string; sizzle: string };
  chapterBlurbs?: Record<string, string>;
  /** External sources shown in a numbered list (YMYL: claims link to primary sources). */
  sources?: { label: string; href: string }[];
}

export interface ArticleModule {
  meta: ArticleMeta;
  Body: () => ReactNode;
  /** Pillar pages only: the hero illustration. */
  Hero?: () => ReactNode;
}

import * as whatIsMonero from "@/content/what-is-monero";
import * as isMoneroTraceable from "@/content/is-monero-traceable";
import * as createMoneroWallet from "@/content/create-monero-wallet";
import * as backUpMoneroWallet from "@/content/back-up-monero-wallet";
import * as restoreMoneroWallet from "@/content/restore-monero-wallet";
import * as howMoneroWorks from "@/content/how-monero-works";
import * as moneroVsBitcoin from "@/content/monero-vs-bitcoin";
import * as isMoneroSafe from "@/content/is-monero-safe";
import * as howToSendMonero from "@/content/send-monero";
import * as howToReceiveMonero from "@/content/receive-monero";
import * as fixWalletNotSyncing from "@/content/monero-wallet-not-syncing";
import * as howToBuyMonero from "@/content/buy-monero";
import * as isMoneroLegal from "@/content/is-monero-legal";
import * as whatIsANode from "@/content/monero-node";
import * as remoteNode from "@/content/monero-remote-node";
import * as restoreMymoneroSeed from "@/content/restore-mymonero-seed";
import * as moneroPhishingSites from "@/content/monero-phishing-sites";
import * as moneroSeedPhrase from "@/content/monero-seed-phrase";
import * as howToUseMonero from "@/content/use-monero";
import * as moneroViewKey from "@/content/monero-view-key";
import * as moneroViewOnlyWallet from "@/content/monero-view-only-wallet";
import * as moneroRestoreHeight from "@/content/monero-restore-height";
import * as moneroTransactionFee from "@/content/monero-transaction-fee";
import * as moneroTransactionTime from "@/content/monero-transaction-time";
import * as moneroLightWallet from "@/content/monero-light-wallet";
import * as walletNotConnecting from "@/content/monero-wallet-not-connecting";
import * as walletNotShowingBalance from "@/content/monero-wallet-not-showing-balance";
import * as runAMoneroNode from "@/content/run-a-monero-node";
import * as moneroRingSignatures from "@/content/monero-ring-signatures";
import * as moneroStealthAddress from "@/content/monero-stealth-address";
import * as moneroSubaddress from "@/content/monero-subaddress";
import * as moneroVsZcash from "@/content/monero-vs-zcash";
import * as moneroPrunedNode from "@/content/monero-pruned-node";
import * as moneroTransactionLookup from "@/content/monero-transaction-lookup";
import * as howToMineMonero from "@/content/mine-monero";
import * as moneroP2pool from "@/content/monero-p2pool";
import * as featherWalletReview from "@/content/feather-wallet-review";
import * as cakeWalletReview from "@/content/cake-wallet-review";
import * as safestMoneroWallet from "@/content/safest-monero-wallet";
import * as moneroGuiVsCli from "@/content/monero-gui-vs-cli";
import * as moneroGuiVirusWarning from "@/content/monero-gui-virus-warning";
import * as acceptMoneroPayments from "@/content/accept-monero-payments";
import * as moneroPaymentGateway from "@/content/monero-payment-gateway";
import * as moneroPos from "@/content/monero-pos";
import * as moneroPaymentLink from "@/content/monero-payment-link";
import * as moneroWoocommerce from "@/content/monero-woocommerce";
// added October 2026
import * as exodusMonero from "@/content/exodus-monero";
import * as checkMoneroBalance from "@/content/check-monero-balance";
import * as moneroUnlockedBalance from "@/content/monero-unlocked-balance";
import * as moneroFcmp from "@/content/monero-fcmp";
import * as moneroEu2027 from "@/content/monero-eu-2027";
import * as buyMoneroWithoutKyc from "@/content/buy-monero-without-kyc";
import * as swapBitcoinToMonero from "@/content/swap-bitcoin-to-monero";
import * as moneroPolyseed from "@/content/monero-polyseed";
import * as whyMoneroDelisted from "@/content/why-monero-delisted";
import * as sellMonero from "@/content/sell-monero";

const MODULES: ArticleModule[] = [
  // learn
  whatIsMonero, howMoneroWorks, isMoneroTraceable, moneroVsBitcoin, isMoneroSafe, moneroSeedPhrase, moneroPhishingSites,
  moneroViewKey, moneroRestoreHeight, moneroTransactionFee, moneroTransactionTime, moneroLightWallet,
  moneroRingSignatures, moneroStealthAddress, moneroSubaddress, moneroVsZcash,
  whatIsANode, runAMoneroNode, moneroPrunedNode, isMoneroLegal,
  // guides
  howToUseMonero, createMoneroWallet, backUpMoneroWallet, restoreMoneroWallet, restoreMymoneroSeed, moneroViewOnlyWallet,
  howToSendMonero, howToReceiveMonero, moneroTransactionLookup, fixWalletNotSyncing, walletNotConnecting, walletNotShowingBalance,
  moneroGuiVirusWarning, remoteNode, howToBuyMonero, howToMineMonero, moneroP2pool,
  // merchants
  acceptMoneroPayments, moneroPaymentLink, moneroPos, moneroPaymentGateway, moneroWoocommerce,
  // added October 2026
  exodusMonero, checkMoneroBalance, moneroUnlockedBalance, moneroFcmp, moneroEu2027, buyMoneroWithoutKyc, swapBitcoinToMonero,
  moneroPolyseed, whyMoneroDelisted, sellMonero,
  // wallets (served under /monero-wallets)
  safestMoneroWallet, featherWalletReview, cakeWalletReview, moneroGuiVsCli,
];

const BY_KEY = new Map(MODULES.map((m) => [`${m.meta.section}/${m.meta.slug}`, m]));

export interface ArticleCard extends ArticleMeta {
  path: string;
}

export function getArticles(): ArticleCard[] {
  return MODULES.map((m) => ({ ...m.meta, path: articlePath(m.meta) }));
}

export function getArticle(section: Section, slug: string): ArticleModule | null {
  return BY_KEY.get(`${section}/${slug}`) ?? null;
}

export function getRelated(meta: ArticleMeta): ArticleCard[] {
  return meta.related
    .map((slug) => MODULES.find((m) => m.meta.slug === slug))
    .filter((m): m is ArticleModule => !!m)
    .map((m) => ({ ...m.meta, path: articlePath(m.meta) }));
}

export function articlePath(meta: Pick<ArticleMeta, "section" | "slug">): string {
  return meta.section === "wallets" ? `/monero-wallets/${meta.slug}` : `/${meta.slug}`;
}

/** Root-level article (learn or guides) by slug. */
export function getRootArticle(slug: string): ArticleModule | null {
  return getArticle("learn", slug) ?? getArticle("guides", slug);
}

/** Title for any internal path that is an article (used by pillar chapter blocks and prev/next). */
export function articleByPath(path: string): ArticleCard | null {
  return getArticles().find((a) => a.path === path) ?? null;
}
