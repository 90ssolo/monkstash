import type { Metadata } from "next";
import { ogFor } from "@/lib/og";
import { JsonLd } from "@/components/JsonLd";
import { PlatformPage } from "../_platform/PlatformPage";
import { platformJsonLd } from "../_platform/schema";
import type { PlatformData } from "../_platform/types";

const data: PlatformData = {
  key: "iphone",
  path: "/monero-wallets/iphone",
  label: "iPhone",
  title: "Monero Wallet for iPhone: Honest Picks for 2026",
  description: "Need a Monero wallet for iPhone? Compare Cake Wallet, Monero.com and Stack Wallet, plus a no-install browser option and how to spot fake apps.",
  article: {
    headline: "Monero wallet for iPhone: honest picks for 2026",
    description: "The Monero wallets you can install on an iPhone, what each one is good at, and how to avoid fake apps.",
  },

  h1Kicker: "Monero wallet for iPhone",
  h1Before: "The right Monero wallet for your ",
  h1Mark: "iPhone",
  h1After: ".",
  sub: "The App Store has fewer Monero wallets than Android does, which makes the choice easier. Three well-known apps run on iPhone, and there is a browser option if you would rather install nothing. Here is who each one fits, and the catch in each.",
  heroFigCaption: "Your keys stay on your phone. The wallet only asks the network questions.",
  heroFig: { deviceLabel: "Your iPhone", deviceTag: "KEEP THE BALANCE MODEST", keysTag: "YOUR KEYS LIVE HERE", banner: "SAME MONERO. A WALLET THAT FITS YOUR PHONE." },

  picks: {
    eyebrow: "Quick pick",
    title: "Three needs, three answers.",
    lede: "Monerujo and Feather do not run on iPhone, so the list is short. Find the sentence that sounds like you.",
    items: [
      { need: "I want a Monero-only app", pick: "Monero.com by Cake Wallet", trade: "The same company makes Cake Wallet, so you are trusting one developer team either way." },
      { need: "I hold Monero and other coins", pick: "Cake Wallet", trade: "One app for many coins means a bigger app with more going on. If you only want Monero, it is more than you need." },
      { need: "I would rather install nothing", pick: "A browser wallet like MonkStash", trade: "Mobile browsers are still being tested, so keep to small amounts for now." },
    ],
  },

  wallets: {
    eyebrow: "iPhone Monero wallets",
    title: "Three wallets in the App Store.",
    lede: "All three are non-custodial, which means you hold the keys. The Monero project lists each as a wallet that scans the blockchain on your device without handing your keys to a node. We have not ranked them.",
    items: [
      {
        name: "Cake Wallet", kind: "Multi-coin",
        facts: [
          { k: "Works on", v: "iPhone, Android, Mac, Linux" },
          { k: "Open source", v: "Yes (MIT license)" },
          { k: "Seed words", v: "16-word Polyseed or 25-word" },
          { k: "Best for", v: "iPhone users who hold other coins" },
        ],
        body: "It began as the first Monero wallet for iOS, and its App Store listing describes it as non-custodial and open source. It now covers many coins, with native Tor integration and background sync listed.",
        points: ["Subaddresses and accounts", "Choose your own restore height", "Native Tor integration, per its App Store listing", "Hardware wallet support listed"],
        trade: "It supports other coins too. If you want Monero and nothing else, a Monero-only app keeps things simpler.",
      },
      {
        name: "Monero.com", kind: "Monero only",
        facts: [
          { k: "Works on", v: "iPhone, Android" },
          { k: "Open source", v: "Yes, code on GitHub" },
          { k: "Seed words", v: "Check when you create it" },
          { k: "Best for", v: "A focused Monero app" },
        ],
        body: "A Monero-only app from the makers of Cake Wallet. It is on the App Store, and the project says you are free to check its code on GitHub.",
        points: ["Only Monero, so nothing else to sort through", "Store, send, receive and exchange from one app"],
        trade: "Same developer as Cake Wallet. You get a simpler app, not a second opinion on who built it.",
      },
      {
        name: "Stack Wallet", kind: "Multi-coin",
        facts: [
          { k: "Works on", v: "iPhone, Android, Windows, Mac, Linux" },
          { k: "Open source", v: "Yes (GPL-3.0)" },
          { k: "Seed words", v: "Check when you create it" },
          { k: "Best for", v: "Open source multi-coin users" },
        ],
        body: "A fully open source wallet from Cypher Stack that covers Monero along with Bitcoin, Litecoin, Firo and others. Its App Store listing says private keys stay on your device, and its release notes mention Monero options such as using local nodes.",
        points: ["Custom nodes", "One app on phone and computer"],
        trade: "Monero is one coin among many, so it is less focused than a Monero-only app.",
      },
    ],
  },

  fit: {
    eyebrow: "Where MonkStash fits",
    title: "No app to install. Just Safari or your browser.",
    lede: "There is no MonkStash iPhone app. What exists is a wallet that runs in your phone's browser, with nothing to download and no account to make.",
    points: [
      { b: "Open it, create a wallet, write the words down.", t: "That takes a couple of minutes and nothing is installed on your phone." },
      { b: "Good for small, everyday amounts.", t: "Browser wallets are only as safe as the phone and browser you use, so keep savings elsewhere." },
      { b: "If you see a MonkStash app in the App Store, it is not ours.", t: "We have not published one. Treat any app using our name as a fake." },
    ],
    notice: "MonkStash works with real Monero, but mobile browsers are still being tested. Start with a small amount until our public security review is complete.",
    figCaption: "Spend from the phone, save on a hardware wallet. Move the surplus when it grows.",
    fig: { leftDevice: "iphone", leftLabel: "Your iPhone", leftTag: "SMALL AMOUNTS" },
  },

  compare: {
    eyebrow: "iPhone wallet comparison",
    title: "Four options, side by side.",
    lede: "MonkStash is the first row. The seed column matters when you restore: count your words first, then pick a wallet that reads that format.",
    caption: "Table 1. Monero wallets you can use on an iPhone",
    cols: ["Works on", "Open source", "Seed words", "Best for"],
    rows: [
      { wallet: "MonkStash", us: true, cells: ["Phone browser, no install", "Built on open source monero-ts", "25 words", "Small, everyday amounts"] },
      { wallet: "Cake Wallet", cells: ["iPhone, Android, Mac, Linux", "Yes (MIT)", "16-word Polyseed or 25-word", "Phone users, multi-coin holders"] },
      { wallet: "Monero.com", cells: ["iPhone, Android", "Yes", "Check on setup", "A focused Monero app"] },
      { wallet: "Stack Wallet", cells: ["iPhone, Android, desktop", "Yes (GPL-3.0)", "Check on setup", "Open source multi-coin users"] },
    ],
    note: "Apple's App Store does not make an app safe. Keep a modest balance on your phone and your larger savings somewhere safer, such as a hardware wallet.",
  },

  safety: {
    eyebrow: "Before you install anything",
    title: "How to avoid fake iPhone wallets",
    lede: "Search for a Monero wallet and you will see look-alike apps and sites built to collect recovery words. Start from a trusted list, not a search result. Never type your seed into an app you found through an ad.",
    steps: [
      { b: "Start from the Monero project's list.", t: "The page at getmonero.org/downloads lists the mobile wallets it knows about. Follow the link to the app from there, not from a search ad." },
      { b: "Read the developer name, not the app name.", t: "Fake apps copy names and icons. On the App Store page, check that the developer matches the wallet's official website." },
      { b: "Be wary of profiles and beta invites.", t: "A site that asks you to install a configuration profile, or a test build, to get a \"wallet\" is a red flag unless you reached it from the developer's own site." },
      { b: "No real app asks for your seed to \"verify\" you.", t: "Support staff, giveaways and chat bots that ask for your recovery words are stealing them." },
      { b: "Test with a small amount first.", t: "Send a little, check it arrives, then move more." },
    ],
    figCaption: "Same name, different developer. Read the developer before you tap Get.",
    fig: { store: "APP STORE LISTING", good: "Developer matches the official site", bad: "Developer you do not recognise", foot: "One wrong developer is all a clone needs." },
  },

  faqTitle: "iPhone Monero wallet questions, answered",
  faqs: [
    { q: "What is the best Monero wallet for iPhone?", a: "Cake Wallet is the best-known option, and Monero.com is its Monero-only sibling. Stack Wallet is an open source multi-coin alternative. If you would rather not install anything, a browser wallet like MonkStash runs in your phone's browser. Check the developer name before you install any of them." },
    { q: "Is there a Monero wallet for iOS?", a: "Yes. Cake Wallet, Monero.com by Cake Wallet and Stack Wallet all have App Store listings. Monerujo is Android only, and Feather is a desktop wallet, so neither runs on an iPhone." },
    { q: "Can I use a Monero wallet on iPhone without an app?", a: "Yes. MonkStash runs in your phone's browser, so there is nothing to install and no account to make. Mobile browsers are still being tested, so use small amounts while the wallet is in early preview." },
    { q: "Is Cake Wallet safe on iPhone?", a: "It is a widely used, open source wallet, and its App Store listing describes it as non-custodial. Safe still depends on you: install it from the official listing, keep your recovery words offline, and start with a small amount. No wallet is risk free." },
    { q: "Can I use a Ledger or Trezor with an iPhone?", a: "It is limited. Trezor says that on iOS, Monero works through Cake Wallet with its Safe 7 only. The Monero project also lists Cake Wallet as a Ledger Nano companion. Check each maker's current notes before you buy, or use a desktop wallet for a hardware setup. See our hardware wallet page." },
    { q: "Do iPhone wallets share my keys with a node?", a: "The Monero project lists Cake Wallet, Monero.com and Stack Wallet as wallets that scan the blockchain on your device, without sharing a key with the nodes. The node can still see your network address, so Tor or your own node adds privacy." },
    { q: "How many words is my Monero seed?", a: "The classic Monero seed is 25 words. A newer format called Polyseed is 16 words, and Cake Wallet can create standalone Monero wallets with either. Count your words before you restore, and make sure the wallet you choose reads that format." },
  ],

  final: {
    title: "A sensible next step",
    body: "Pick one wallet, install it from a listing you checked, and write the recovery words on paper before you do anything else. Send a small test amount, confirm it lands, and build from there. If you would rather not install anything, a small browser wallet is the quickest way to start.",
  },
};

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
  alternates: { canonical: data.path },
  openGraph: ogFor({ title: data.title, description: data.description, path: data.path }),
};

export default function IphoneWalletsPage() {
  return (
    <>
      <JsonLd data={platformJsonLd(data)} />
      <PlatformPage data={data} />
    </>
  );
}
