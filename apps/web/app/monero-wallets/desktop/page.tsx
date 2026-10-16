import type { Metadata } from "next";
import { ogFor } from "@/lib/og";
import { JsonLd } from "@/components/JsonLd";
import { PlatformPage } from "../_platform/PlatformPage";
import { platformJsonLd } from "../_platform/schema";
import type { PlatformData } from "../_platform/types";

const data: PlatformData = {
  key: "desktop",
  path: "/monero-wallets/desktop",
  label: "Desktop",
  title: "Monero Desktop Wallet: Windows, Mac and Linux",
  description: "Choose a Monero desktop wallet for Windows, Mac or Linux. Compare the official Monero GUI and CLI, Feather and Stack Wallet, and learn to download safely.",
  article: {
    headline: "Monero desktop wallets: honest picks for Windows, Mac and Linux",
    description: "The Monero wallets that run on a computer, including the official GUI and CLI and Feather, what each is good at, and how to download them safely.",
  },

  h1Kicker: "Monero desktop wallet",
  h1Before: "The right Monero wallet for your ",
  h1Mark: "computer",
  h1After: ".",
  sub: "A desktop wallet gives you the most control: your own node if you want one, a hardware wallet if you use one, and a bigger screen for the details. Windows, Mac and Linux all have solid options. Here is who each one fits, and the catch in each.",
  heroFigCaption: "Your keys stay on your computer. The wallet only asks the network questions.",
  heroFig: { deviceLabel: "Your computer", deviceTag: "SYNCS ON YOUR MACHINE", keysTag: "YOUR KEYS LIVE HERE", banner: "SAME MONERO. MORE CONTROL ON A BIG SCREEN." },

  picks: {
    eyebrow: "Quick pick",
    title: "Three needs, three answers.",
    lede: "Most people only need one of these. Find the sentence that sounds like you.",
    items: [
      { need: "I want the official wallet and my own node", pick: "Monero GUI", trade: "It has the most options and the most to learn. It is not the quickest to get started with." },
      { need: "I want a light, quick start with Tor built in", pick: "Feather", trade: "Not the official Monero wallet, and it has no built-in local node manager, so running your own node takes more setup." },
      { need: "I want to use a Ledger or Trezor", pick: "Feather or Monero GUI", trade: "A hardware wallet adds cost and steps. See our hardware wallet page for what works with what." },
    ],
  },

  wallets: {
    eyebrow: "Monero desktop wallets",
    title: "Four wallets worth running on a computer.",
    lede: "All four are non-custodial, which means you hold the keys. The first two are the Monero project's official wallets, so most other wallets are measured against them. We have not ranked them.",
    items: [
      {
        name: "Monero GUI", kind: "Official",
        facts: [
          { k: "Works on", v: "Windows 64-bit, macOS (Intel and Apple chips), Linux 64-bit" },
          { k: "Open source", v: "Yes, the Monero project's own wallet" },
          { k: "Seed words", v: "25 words" },
          { k: "Best for", v: "Maximum control, your own node" },
        ],
        body: "The graphical wallet from the Monero project, downloaded from getmonero.org. It is the wallet to pick if you want to run your own node and learn how Monero works in depth.",
        points: ["Local node manager built in", "View-only wallets", "Works with Ledger and Trezor devices", "Verify the download with the hashes the site publishes"],
        trade: "Bigger and busier than Feather, so it is more to learn for a first wallet. No built-in Tor, though it accepts a proxy.",
      },
      {
        name: "Monero CLI", kind: "Official",
        facts: [
          { k: "Works on", v: "Windows, macOS, Linux, FreeBSD" },
          { k: "Open source", v: "Yes, the Monero project's own wallet" },
          { k: "Seed words", v: "25 words" },
          { k: "Best for", v: "Advanced users, servers, scripts" },
        ],
        body: "The command line wallet from the Monero project. It has no windows or buttons, which makes it the right tool for servers and for people who prefer a terminal.",
        points: ["Builds for more systems than the GUI, including FreeBSD","View-only wallets", "Works with Ledger and Trezor devices"],
        trade: "No graphical interface at all. If you have never used a terminal, start with the GUI or Feather.",
      },
      {
        name: "Feather", kind: "Light and fast",
        facts: [
          { k: "Works on", v: "Windows, macOS, Linux, Tails" },
          { k: "Open source", v: "Yes (BSD-3-Clause)" },
          { k: "Seed words", v: "16-word Polyseed; restores 14 and 25 words" },
          { k: "Best for", v: "A light, fast everyday wallet" },
        ],
        body: "A small, quick wallet that aims to be friendly to beginners while matching the official command line wallet's features. It works well on modest computers, virtual machines and live systems.",
        points: ["Built-in Tor support", "Works with Ledger Nano S, S Plus and X, and Trezor Model T and Safe 3", "View-only wallets and offline signing with animated QR codes", "Restores a wallet from a damaged or partial seed"],
        trade: "Not the official wallet. Its documentation lists no local node manager and no multisig yet.",
      },
      {
        name: "Stack Wallet", kind: "Multi-coin",
        facts: [
          { k: "Works on", v: "Windows, Mac, Linux, Android, iPhone" },
          { k: "Open source", v: "Yes (GPL-3.0)" },
          { k: "Seed words", v: "Check when you create it" },
          { k: "Best for", v: "Open source multi-coin users" },
        ],
        body: "A fully open source wallet from Cypher Stack that covers Monero along with Bitcoin, Litecoin, Firo and others, on desktop and phone.",
        points: ["Custom nodes", "Keys and seeds stay on your device, per the project"],
        trade: "Monero is one coin among many, so it is less focused than a Monero-only wallet.",
      },
    ],
  },

  fit: {
    eyebrow: "Where MonkStash fits",
    title: "No install. Just your desktop browser.",
    lede: "MonkStash is not a desktop program. It is a wallet that runs in your computer's browser, so there is nothing to download and no account to make.",
    points: [
      { b: "Open it, create a wallet, write the words down.", t: "That takes a couple of minutes, and the full wallet already works in Chrome." },
      { b: "Good for small, everyday amounts.", t: "A browser wallet is only as safe as your computer and browser, so keep savings in a hardware wallet." },
      { b: "A browser extension is planned, not built.", t: "Until then, the web wallet gives you the same features. See the Chrome extension page for the plan." },
    ],
    notice: "MonkStash works with real Monero, but we recommend small amounts until our public security review is complete.",
    figCaption: "Spend from the computer, save on a hardware wallet. Move the surplus when it grows.",
    fig: { leftDevice: "desktop", leftLabel: "Your computer", leftTag: "SMALL AMOUNTS" },
  },

  compare: {
    eyebrow: "Desktop wallet comparison",
    title: "Five options, side by side.",
    lede: "MonkStash is the first row. If you restore an old wallet, count your seed words first, then pick a wallet that reads that format.",
    caption: "Table 1. Monero wallets for Windows, Mac and Linux",
    cols: ["Works on", "Open source", "Seed words", "Best for"],
    rows: [
      { wallet: "MonkStash", us: true, cells: ["Any desktop browser", "Built on open source monero-ts", "25 words", "Small, everyday amounts"] },
      { wallet: "Monero GUI", cells: ["Windows, macOS, Linux", "Yes, official", "25 words", "Maximum control, own node"] },
      { wallet: "Monero CLI", cells: ["Windows, macOS, Linux, FreeBSD", "Yes, official", "25 words", "Advanced users, servers"] },
      { wallet: "Feather", cells: ["Windows, macOS, Linux, Tails", "Yes (BSD-3-Clause)", "16-word Polyseed; restores 14 and 25", "A light, fast everyday wallet"] },
      { wallet: "Stack Wallet", cells: ["Windows, Mac, Linux, phone", "Yes (GPL-3.0)", "Check on setup", "Open source multi-coin users"] },
    ],
    note: "A computer can catch malware. For large or long-term amounts, pair a desktop wallet with a hardware wallet so the keys never sit on the machine.",
  },

  safety: {
    eyebrow: "Before you download anything",
    title: "How to avoid fake desktop wallets",
    lede: "Search for a Monero wallet and you will see look-alike sites with trojan installers. Start from the official site, not a search result. Never type your seed into a program you found through an ad.",
    steps: [
      { b: "Download from the project's own site.", t: "The official wallets live at getmonero.org/downloads, which also lists Feather and other third-party wallets with links to them." },
      { b: "Verify the download.", t: "The Monero site publishes SHA256 hashes, and calls its GPG-signed hashes file the canonical source. Checking takes a few minutes and catches tampered installers." },
      { b: "Check the address bar every time.", t: "One wrong letter in the domain is all a clone needs. Use a bookmark you trust." },
      { b: "No real wallet asks for your seed to \"verify\" you.", t: "Support staff, giveaways and chat bots that ask for your recovery words are stealing them." },
      { b: "Test with a small amount first.", t: "Send a little, check it arrives, then move more." },
    ],
    figCaption: "Same name, different source. Read the source before you click Download.",
    fig: { store: "DOWNLOAD PAGE", good: "Address matches the official site", bad: "Address you do not recognise", foot: "One wrong letter is all a clone needs." },
  },

  faqTitle: "Desktop Monero wallet questions, answered",
  faqs: [
    { q: "What is the best Monero desktop wallet?", a: "It depends on what you want. The official Monero GUI gives the most control and supports running your own node. Feather is lighter and quicker to start, with Tor built in. The command line wallet suits advanced users. Stack Wallet covers many coins at once." },
    { q: "Is there a Monero wallet for Windows?", a: "Yes. The official Monero GUI and CLI both have Windows builds, and so does Feather. Download from getmonero.org or the wallet's own site, and verify the download as the Monero site explains." },
    { q: "Is there a Monero wallet for Mac?", a: "Yes. The official GUI and CLI have macOS builds for both Intel and Apple chips, and Feather and Stack Wallet also run on macOS." },
    { q: "What is the difference between Monero GUI and Feather?", a: "The GUI is the official wallet. It is larger and includes a local node manager. Feather is a smaller, faster wallet with built-in Tor and Polyseed by default, and its documentation lists no local node manager. Both support Ledger and Trezor devices." },
    { q: "Do I need to download the whole blockchain?", a: "Not for most wallets. Light-style wallets like Feather connect to a node and scan the blockchain on your device. Running your own full node means syncing the whole chain, which takes time and storage. Read what a node is and how a remote node affects privacy first." },
    { q: "Can I use a hardware wallet with a desktop wallet?", a: "Yes. The Monero project lists the GUI, the CLI and Feather as companions for supported Ledger and Trezor devices. The hardware wallet keeps the keys, and the desktop wallet shows balances and builds transactions. See our hardware wallet page." },
    { q: "How many words is my Monero seed?", a: "The classic Monero seed, used by the official GUI and CLI, is 25 words. A newer format called Polyseed is 16 words, and Feather creates it by default. Count your words before you restore, and pick a wallet that reads that format." },
  ],

  final: {
    title: "A sensible next step",
    body: "Pick one wallet, download it from the official site, verify it, and write the recovery words on paper before you do anything else. Send a small test amount, confirm it lands, and build from there. If you would rather not install anything yet, a small browser wallet is the quickest way to start.",
  },
};

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
  alternates: { canonical: data.path },
  openGraph: ogFor({ title: data.title, description: data.description, path: data.path }),
};

export default function DesktopWalletsPage() {
  return (
    <>
      <JsonLd data={platformJsonLd(data)} />
      <PlatformPage data={data} />
    </>
  );
}
