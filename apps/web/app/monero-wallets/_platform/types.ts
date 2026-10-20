export type PlatformKey = "android" | "iphone" | "desktop" | "hardware";

/** The four platform pages, in the order they are listed everywhere. */
export const PLATFORMS: { key: PlatformKey; path: string; label: string; blurb: string }[] = [
  { key: "android", path: "/monero-wallets/android", label: "Android", blurb: "Phone apps from Google Play, F-Droid or GitHub." },
  { key: "iphone", path: "/monero-wallets/iphone", label: "iPhone", blurb: "What you can install from the App Store." },
  { key: "desktop", path: "/monero-wallets/desktop", label: "Desktop", blurb: "Windows, Mac and Linux wallets." },
  { key: "hardware", path: "/monero-wallets/hardware", label: "Hardware", blurb: "Ledger and Trezor, and what they work with." },
];

export interface Fact { k: string; v: string }

export interface WalletEntry {
  name: string;
  kind: string;
  facts: Fact[];
  body: string;
  points: string[];
  trade: string;
}

export interface QuickPick { need: string; pick: string; trade: string }
export interface FaqItem { q: string; a: string }
export interface CompareRow { wallet: string; cells: string[]; us?: boolean }
export interface SafetyStep { b: string; t: string }

export interface PlatformData {
  key: PlatformKey;
  path: string;
  /** Short name used in the breadcrumb and link labels, for example "Android". */
  label: string;
  title: string;
  description: string;

  article: { headline: string; description: string };

  /** H1 is built as kicker line + before + highlighted + after. */
  h1Kicker: string;
  h1Before: string;
  h1Mark: string;
  h1After: string;
  sub: string;
  heroFigCaption: string;
  heroFig: { deviceLabel: string; deviceTag: string; keysTag: string; banner: string; companion?: boolean };

  picks: { eyebrow: string; title: string; lede: string; items: QuickPick[] };
  wallets: { eyebrow: string; title: string; lede: string; items: WalletEntry[] };

  fit: {
    eyebrow: string;
    title: string;
    lede: string;
    points: { b: string; t: string }[];
    notice: string;
    figCaption: string;
    fig: { leftDevice: PlatformKey; leftLabel: string; leftTag: string };
  };

  compare: {
    eyebrow: string;
    title: string;
    lede: string;
    caption: string;
    cols: string[];
    rows: CompareRow[];
    note: string;
  };

  safety: {
    eyebrow: string;
    title: string;
    lede: string;
    steps: SafetyStep[];
    figCaption: string;
    fig: { store: string; good: string; bad: string; foot: string };
  };

  faqTitle: string;
  faqs: FaqItem[];

  final: { title: string; body: string };
}
