import type { Metadata } from "next";
import { ogFor } from "@/lib/og";
import { JsonLd } from "@/components/JsonLd";
import { PlatformPage } from "../_platform/PlatformPage";
import { platformJsonLd } from "../_platform/schema";
import type { PlatformData } from "../_platform/types";

const data: PlatformData = {
  key: "hardware",
  path: "/monero-wallets/hardware",
  label: "Hardware",
  title: "Monero Hardware Wallet: Ledger and Trezor (2026)",
  description: "Which hardware wallets work with Monero? See the supported Ledger and Trezor models, the wallets they pair with, and the catches to know before you buy.",
  article: {
    headline: "Monero hardware wallets: which Ledger and Trezor models work",
    description: "Which Ledger and Trezor models support Monero, which wallets they pair with, and the catches to know before you buy one.",
  },

  h1Kicker: "Monero hardware wallet",
  h1Before: "Keep your big Monero balance on a ",
  h1Mark: "separate device",
  h1After: ".",
  sub: "A hardware wallet keeps your keys on a small device that signs transactions without showing the keys to your computer. For savings you will not touch often, that is the strongest setup there is. Support for Monero is narrower than for Bitcoin, so check before you buy.",
  heroFigCaption: "The device holds and uses your keys. A companion wallet shows the balance and talks to the network.",
  heroFig: { deviceLabel: "Your hardware wallet", deviceTag: "SIGNS ON THE DEVICE", keysTag: "KEYS STAY HERE", banner: "SAME MONERO. THE KEYS STAY ON A SEPARATE DEVICE.", companion: true },

  picks: {
    eyebrow: "Quick pick",
    title: "Three needs, three answers.",
    lede: "Both big makers work with Monero, but with fewer apps than they do for Bitcoin. Find the sentence that sounds like you.",
    items: [
      { need: "I want the most companion wallet choices", pick: "A Ledger Nano S Plus or Nano X", trade: "Ledger's own Monero page is thin and names only some models. Match your exact model to the Monero project's list before you buy." },
      { need: "I like Trezor's open design and screen", pick: "A Trezor Safe 3 or Safe 5", trade: "Trezor derives Monero keys in its own way, so its recovery words may not restore in a non-Trezor wallet." },
      { need: "I only hold a small amount for now", pick: "Wait on the hardware wallet", trade: "Your keys then live on a device that is online. That is fine for pocket money. Revisit it when the balance grows." },
    ],
  },

  wallets: {
    eyebrow: "Monero hardware wallets",
    title: "Two makers, one companion wallet.",
    lede: "Hardware wallets do not run Monero on their own. They sign transactions, and a companion wallet on your computer does the rest. Here are the makers the Monero project lists, and the wallet you pair them with.",
    items: [
      {
        name: "Ledger", kind: "Hardware",
        facts: [
          { k: "Models", v: "Nano S, Nano S Plus, Nano X" },
          { k: "Pairs with", v: "Monero GUI, CLI, Feather, Cake Wallet, Monero.com, Monerujo" },
          { k: "Firmware", v: "Nano S 2.1.0, S Plus 1.0.3, X 2.0.2 or newer" },
          { k: "Best for", v: "Savings, with a choice of companion apps" },
        ],
        body: "Ledger's own Monero GUI page describes the GUI as a third-party wallet that connects to your Ledger, so you keep control of your private keys while the wallet shows balances and sends.",
        points: ["Longest list of companion wallets on the Monero project's page", "Ledger Stax and Flex are not on that list, so confirm before you buy one"],
        trade: "You depend on a third-party wallet for the screen and the sync, and a full sync takes time. Check Ledger's current notes before you buy.",
      },
      {
        name: "Trezor", kind: "Hardware",
        facts: [
          { k: "Models", v: "Model T, Safe 3, Safe 5 (Safe 7 through Cake Wallet only)" },
          { k: "Pairs with", v: "Monero GUI, CLI, Feather" },
          { k: "Firmware", v: "2.5.2 or newer, per the Monero project" },
          { k: "Best for", v: "Savings, with a desktop companion" },
        ],
        body: "Trezor lists Monero as supported on its Safe family and Model T, through third-party wallets. Trezor's own app, Trezor Suite, does not support Monero, and the Model One does not either.",
        points: ["Trezor says Cake Wallet works with its Safe 7 on iPhone and Android", "Trezor derives Monero keys with SLIP-0010, which not every wallet supports"],
        trade: "Because of that key derivation, Trezor warns that its backup may not restore Monero in a wallet from another brand. Restoring onto another Trezor works. Test a restore with a small amount.",
      },
      {
        name: "Monero GUI and Feather", kind: "Companion wallets",
        facts: [
          { k: "Runs on", v: "Windows, macOS, Linux" },
          { k: "Open source", v: "Yes, both" },
          { k: "Job", v: "Shows balances, builds transactions, asks the network" },
          { k: "Best for", v: "Pairing with a Ledger or Trezor" },
        ],
        body: "The hardware wallet signs, and the companion wallet does everything else. Pick the GUI if you want to run your own node. Pick Feather for a lighter, faster start with Tor built in.",
        points: ["Both support view-only wallets, so you can watch a balance without the device", "Feather can sign offline with animated QR codes"],
        trade: "You need a computer for the companion wallet. Our desktop page covers both in detail.",
      },
    ],
  },

  fit: {
    eyebrow: "Where MonkStash fits",
    title: "MonkStash is the everyday wallet, not the vault.",
    lede: "MonkStash is a browser wallet. It does not connect to Ledger or Trezor today. Use it for small, everyday amounts, and keep your savings on a hardware wallet paired with the GUI or Feather.",
    points: [
      { b: "Pair a hardware wallet with a desktop companion.", t: "The keys stay on the device, so a hacked computer cannot simply copy them." },
      { b: "Keep a separate, small wallet for spending.", t: "Its recovery words are its own, so a problem in one wallet never touches the other." },
      { b: "Do not look for a connect button.", t: "Hardware wallet support is not in MonkStash yet. If that changes, we will say so here." },
    ],
    notice: "MonkStash works with real Monero, but we recommend small amounts until our public security review is complete.",
    figCaption: "Spend from the everyday wallet, save on the hardware wallet. Move the surplus when it grows.",
    fig: { leftDevice: "desktop", leftLabel: "A browser wallet", leftTag: "SMALL AMOUNTS" },
  },

  compare: {
    eyebrow: "Hardware wallet comparison",
    title: "Which device works with what.",
    lede: "Support is by model, and it changes. This table follows the Monero project's list and Trezor's own notes. Confirm your exact device before you buy.",
    caption: "Table 1. Monero support on Ledger and Trezor devices",
    cols: ["Models", "Pairs with", "Watch out for", "Best for"],
    rows: [
      { wallet: "MonkStash", us: true, cells: ["Not a hardware wallet", "Does not connect to one", "No hardware wallet support today", "Everyday money next to your savings"] },
      { wallet: "Ledger", cells: ["Nano S, S Plus, X", "GUI, CLI, Feather, Cake Wallet, Monero.com, Monerujo", "Stax and Flex are not on the Monero list", "Savings, wide app choice"] },
      { wallet: "Trezor", cells: ["Model T, Safe 3, Safe 5", "GUI, CLI, Feather", "Trezor Suite and Model One do not support Monero", "Savings, desktop use"] },
      { wallet: "Trezor Safe 7", cells: ["Safe 7", "Cake Wallet only", "Not listed for the desktop GUI or CLI", "Phone use through Cake Wallet"] },
    ],
    note: "Whatever you buy, back up the recovery words on paper and test a restore with a small amount before you trust the device with your savings.",
  },

  safety: {
    eyebrow: "Before you buy",
    title: "How to avoid a fake or tampered device",
    lede: "A hardware wallet is only as good as the device in the box. Buy from the maker or a reseller it lists, and let the device create the recovery words itself. Never use words that came with it.",
    steps: [
      { b: "Check Monero support first.", t: "The list at getmonero.org/downloads names the supported models and the lowest firmware. Match your exact model to it." },
      { b: "Buy from the maker or a reseller it lists.", t: "A big discount on a marketplace is how tampered devices reach buyers. The saving is not worth your savings." },
      { b: "Reject a device that arrives opened.", t: "If the packaging was opened, or it comes with a recovery card already filled in, send it back and do not use it." },
      { b: "Never type your recovery words into a computer or phone.", t: "Write them on paper. Anyone who asks you to enter them into a website or app is stealing them." },
      { b: "Test with a small amount first.", t: "Send a little, check it arrives, practise a restore, then move more." },
    ],
    figCaption: "Same product, different seller. Buy from the maker or a reseller it lists.",
    fig: { store: "WHERE YOU BUY", good: "Seller is the maker or a listed reseller", bad: "Marketplace seller with a big discount", foot: "A tampered device is worse than none." },
  },

  faqTitle: "Monero hardware wallet questions, answered",
  faqs: [
    { q: "Does Monero work with Ledger?", a: "Yes. The Monero project lists the Ledger Nano S, Nano S Plus and Nano X, with the Monero GUI, Monero CLI, Feather, Cake Wallet, Monero.com and Monerujo as companion wallets. It also lists minimum firmware versions. Ledger Stax and Flex are not on that list, so confirm before you buy one." },
    { q: "Does Monero work with Trezor?", a: "Yes, on the Model T, Safe 3 and Safe 5, through the Monero GUI, Monero CLI or Feather. Trezor says the Safe 7 works only through Cake Wallet, the Model One does not support Monero, and Trezor Suite does not support Monero." },
    { q: "What is the best hardware wallet for Monero?", a: "There is no single best one. The Monero project lists more companion wallets for Ledger than for Trezor. Trezor has a recovery caveat: its Monero backup may not restore in another brand's wallet. Pick on which companion wallet you want to use and how much that caveat matters to you." },
    { q: "Can I move my Monero to a different wallet later?", a: "You can always send the coins to a new wallet's address, whichever wallet that is. Restoring from recovery words is different. Trezor warns that its backup may not restore Monero in a non-Trezor wallet. Restoring onto another Trezor works. Test with a small amount." },
    { q: "Do I need a computer to use a hardware wallet with Monero?", a: "You need a companion wallet. On desktop that is the Monero GUI, CLI or Feather. On a phone, Trezor says Cake Wallet works with some models, and the Monero project lists Cake Wallet and Monerujo as Ledger companions. A desktop is the most common setup." },
    { q: "Is a hardware wallet safer than a software wallet?", a: "For larger or long-term amounts, usually yes, because the keys stay on a separate device and malware on your computer cannot simply copy them. It costs money, takes more effort, and you still must back up the recovery words. For small everyday amounts, a software wallet is often enough." },
    { q: "Can I use MonkStash with a Ledger or Trezor?", a: "Not today. MonkStash is a browser wallet and does not connect to hardware wallets. Many people keep a small MonkStash wallet for spending and a hardware wallet with the Monero GUI or Feather for savings." },
  ],

  final: {
    title: "A sensible next step",
    body: "Match your device to the Monero project's list, buy it from the maker or a listed reseller, and let it create your recovery words. Write them on paper, practise a restore with a small amount, then move your savings. For everyday spending, a small browser wallet sits comfortably beside it.",
  },
};

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
  alternates: { canonical: data.path },
  openGraph: ogFor({ title: data.title, description: data.description, path: data.path }),
};

export default function HardwareWalletsPage() {
  return (
    <>
      <JsonLd data={platformJsonLd(data)} />
      <PlatformPage data={data} />
    </>
  );
}
