import type { Metadata } from "next";
import { ogFor } from "@/lib/og";
import { JsonLd } from "@/components/JsonLd";
import { PlatformPage } from "../_platform/PlatformPage";
import { platformJsonLd } from "../_platform/schema";
import type { PlatformData } from "../_platform/types";

const data: PlatformData = {
  key: "android",
  path: "/monero-wallets/android",
  label: "Android",
  title: "Monero Wallet for Android: Honest Picks for 2026",
  description: "Looking for a Monero wallet for Android? Compare Cake Wallet, Monero.com, Monerujo and Stack Wallet, and learn how to download safely and avoid fake apps.",
  article: {
    headline: "Monero wallet for Android: honest picks for 2026",
    description: "Four Monero wallets you can run on an Android phone, what each one is good at, and how to install one without landing on a fake.",
  },

  h1Kicker: "Monero wallet for Android",
  h1Before: "The right Monero wallet for your ",
  h1Mark: "Android phone",
  h1After: ".",
  sub: "Pay, get paid and check your balance from your pocket. Four well-known wallets run on Android, and they are not the same. Here is who each one fits, and the catch in each, so you pick once and get on with it.",
  heroFigCaption: "Your keys stay on your phone. The wallet only asks the network questions.",
  heroFig: { deviceLabel: "Your Android phone", deviceTag: "KEEP THE BALANCE MODEST", keysTag: "YOUR KEYS LIVE HERE", banner: "SAME MONERO. A WALLET THAT FITS YOUR PHONE." },

  picks: {
    eyebrow: "Quick pick",
    title: "Three needs, three answers.",
    lede: "Most people only need one of these. Find the sentence that sounds like you.",
    items: [
      { need: "I want a Monero-only app", pick: "Monero.com by Cake Wallet", trade: "The same company makes Cake Wallet, so you are trusting one developer team either way." },
      { need: "I hold Monero and other coins", pick: "Cake Wallet", trade: "One app for many coins means a bigger app with more going on. If you only want Monero, it is more than you need." },
      { need: "I want open source Monero code, outside the big stores", pick: "Monerujo", trade: "Android only, and you install it from F-Droid or the project's GitHub releases, which takes more care than a one-tap store install." },
    ],
  },

  wallets: {
    eyebrow: "Android Monero wallets",
    title: "Four wallets that really run on Android.",
    lede: "All four are non-custodial, which means you hold the keys. They are listed by the Monero project as wallets that scan the blockchain on your device without handing your keys to a node. We have not ranked them.",
    items: [
      {
        name: "Cake Wallet", kind: "Multi-coin",
        facts: [
          { k: "Works on", v: "Android, iPhone, Mac, Linux" },
          { k: "Open source", v: "Yes (MIT license)" },
          { k: "Seed words", v: "16-word Polyseed or 25-word" },
          { k: "Best for", v: "Phone users who hold other coins" },
        ],
        body: "It began as the first Monero wallet for iOS and now handles many coins. On Android you can get it from Google Play, as an APK, or from Accrescent.",
        points: ["Subaddresses and accounts", "Choose your own restore height", "Use a trusted node for faster syncing", "Works with Tor and i2p node proxies", "Works with hardware wallets"],
        trade: "It supports other coins too. If you want Monero and nothing else, a Monero-only app keeps things simpler.",
      },
      {
        name: "Monero.com", kind: "Monero only",
        facts: [
          { k: "Works on", v: "Android, iPhone" },
          { k: "Open source", v: "Yes, code on GitHub" },
          { k: "Seed words", v: "Check when you create it" },
          { k: "Best for", v: "A focused Monero app" },
        ],
        body: "A Monero-only app from the makers of Cake Wallet. It is on Google Play, or you can download the APK from the Cake Wallet GitHub releases.",
        points: ["Only Monero, so nothing else to sort through", "Store, send, receive and exchange from one app"],
        trade: "Same developer as Cake Wallet. You get a simpler app, not a second opinion on who built it.",
      },
      {
        name: "Monerujo", kind: "Monero only",
        facts: [
          { k: "Works on", v: "Android only" },
          { k: "Open source", v: "Yes (Apache-2.0)" },
          { k: "Seed words", v: "Check when you create it" },
          { k: "Best for", v: "Open source purists on Android" },
        ],
        body: "An Android wallet made for Monero alone. You can install it from the project's own F-Droid repository or download the APK from its GitHub releases. You can also point it at your own daemon (the server software that follows the network).",
        points: ["Works with Ledger devices, per the Monero project", "Custom node support", "Runs on mainnet and stagenet (a practice network)"],
        trade: "Installing from F-Droid or GitHub takes more care than a store, and the project's README warns you can lose funds if you misuse it. Start small.",
      },
      {
        name: "Stack Wallet", kind: "Multi-coin",
        facts: [
          { k: "Works on", v: "Android, iPhone, Windows, Mac, Linux" },
          { k: "Open source", v: "Yes (GPL-3.0)" },
          { k: "Seed words", v: "Check when you create it" },
          { k: "Best for", v: "Open source multi-coin users" },
        ],
        body: "A fully open source wallet from Cypher Stack that covers Monero along with Bitcoin, Litecoin, Firo and others. It states that private keys and seeds stay on your device.",
        points: ["Custom nodes", "One app on phone and computer"],
        trade: "Monero is one coin among many, so it is less focused than a Monero-only app.",
      },
    ],
  },

  fit: {
    eyebrow: "Where MonkStash fits",
    title: "No app to install. Just your phone's browser.",
    lede: "There is no MonkStash Android app. What exists is a wallet that runs in your phone's browser, with nothing to download and no account to make.",
    points: [
      { b: "Open it, create a wallet, write the words down.", t: "That takes a couple of minutes and nothing lands on your phone but a browser tab." },
      { b: "Good for small, everyday amounts.", t: "Browser wallets are only as safe as the phone and browser you use, so keep savings elsewhere." },
      { b: "If you see a MonkStash app in Google Play, it is not ours.", t: "We have not published one. Treat any app using our name as a fake." },
    ],
    notice: "MonkStash works with real Monero, but mobile browsers are still being tested. Start with a small amount until our public security review is complete.",
    figCaption: "Spend from the phone, save on a hardware wallet. Move the surplus when it grows.",
    fig: { leftDevice: "android", leftLabel: "Your Android phone", leftTag: "SMALL AMOUNTS" },
  },

  compare: {
    eyebrow: "Android wallet comparison",
    title: "Five options, side by side.",
    lede: "MonkStash is the first row. The seed column matters when you restore: count your words first, then pick a wallet that reads that format.",
    caption: "Table 1. Monero wallets you can use on an Android phone",
    cols: ["Works on", "Open source", "Seed words", "Best for"],
    rows: [
      { wallet: "MonkStash", us: true, cells: ["Phone browser, no install", "Yes (BSD-3-Clause)", "25 words", "Small, everyday amounts"] },
      { wallet: "Cake Wallet", cells: ["Android, iPhone, Mac, Linux", "Yes (MIT)", "16-word Polyseed or 25-word", "Phone users, multi-coin holders"] },
      { wallet: "Monero.com", cells: ["Android, iPhone", "Yes", "Check on setup", "A focused Monero app"] },
      { wallet: "Monerujo", cells: ["Android only", "Yes (Apache-2.0)", "Check on setup", "Open source purists"] },
      { wallet: "Stack Wallet", cells: ["Android, iPhone, desktop", "Yes (GPL-3.0)", "Check on setup", "Open source multi-coin users"] },
    ],
    note: "A phone can be lost, dropped or infected. Keep a modest balance on it and your larger savings somewhere safer, such as a hardware wallet.",
  },

  safety: {
    eyebrow: "Before you install anything",
    title: "How to avoid fake Android wallets",
    lede: "Search for a Monero wallet and you will see look-alike apps and sites built to collect recovery words. Start from a trusted list, not a search result. Never type your seed into an app you found through an ad.",
    steps: [
      { b: "Start from the Monero project's list.", t: "The page at getmonero.org/downloads lists the mobile wallets it knows about. Follow the link to the app from there, not from a search ad." },
      { b: "Read the publisher, not the name.", t: "Fake apps copy names and icons. In Google Play, check that the publisher matches the wallet's official website." },
      { b: "Treat APK files from messages as hostile.", t: "Only sideload an APK from the project's own GitHub releases page or F-Droid repository, reached through its official site." },
      { b: "No real app asks for your seed to \"verify\" you.", t: "Support staff, giveaways and chat bots that ask for your recovery words are stealing them." },
      { b: "Test with a small amount first.", t: "Send a little, check it arrives, then move more." },
    ],
    figCaption: "Same name, different publisher. Read the publisher before you tap Install.",
    fig: { store: "GOOGLE PLAY LISTING", good: "Publisher matches the official site", bad: "Publisher you do not recognise", foot: "One wrong publisher is all a clone needs." },
  },

  faqTitle: "Android Monero wallet questions, answered",
  faqs: [
    { q: "What is the best Monero wallet for Android?", a: "There is no single best one. Monero.com is a Monero-only app, Cake Wallet suits people who also hold other coins, Monerujo is open source and made for Android, and Stack Wallet covers many coins in one open source app. Pick the one that matches how you use Monero, and download it only from a source the wallet's official website points to." },
    { q: "Is Cake Wallet or Monerujo better for Android?", a: "Neither is better for everyone. Cake Wallet is a multi-coin app with a store-friendly install and wide features. Monerujo does Monero alone and is installed from F-Droid or GitHub. If you want other coins or a simple store install, pick Cake. If you want a focused open source app, pick Monerujo." },
    { q: "Can I use a Monero wallet on Android without installing an app?", a: "Yes. MonkStash runs in your phone's browser, so there is nothing to install and no account to make. Mobile browsers are still being tested, so use small amounts while the wallet is in early preview." },
    { q: "Do Android wallets share my keys with a node?", a: "The Monero project lists Cake Wallet, Monero.com, Monerujo and Stack Wallet as wallets that scan the blockchain on your device, without sharing a key with the nodes. The node can still see your network address, so a Tor or i2p setup, or your own node, adds privacy." },
    { q: "Is a Monero wallet on Google Play safe?", a: "A Play listing is not proof of safety. Fake wallets have used copied names and icons. Check that the publisher matches the wallet's official website, and reach the app through a link from that website or from the Monero project's wallet list." },
    { q: "Can I use a Ledger or Trezor with an Android wallet?", a: "Sometimes. The Monero project lists Cake Wallet, Monero.com and Monerujo as companions for Ledger Nano devices. Trezor says Cake Wallet on Android works with its Safe 7, Safe 5, Safe 3 and Model T. Check each maker's current notes, and see our hardware wallet page." },
    { q: "How many words is my Monero seed?", a: "The classic Monero seed is 25 words. A newer format called Polyseed is 16 words, and Cake Wallet can create standalone Monero wallets with either. Count your words before you restore, and make sure the wallet you choose reads that format." },
  ],

  final: {
    title: "A sensible next step",
    body: "Pick one wallet, install it from a source you checked, and write the recovery words on paper before you do anything else. Send a small test amount, confirm it lands, and build from there. If you would rather not install anything, a small browser wallet is the quickest way to start.",
  },
};

export const metadata: Metadata = {
  title: data.title,
  description: data.description,
  alternates: { canonical: data.path },
  openGraph: ogFor({ title: data.title, description: data.description, path: data.path }),
};

export default function AndroidWalletsPage() {
  return (
    <>
      <JsonLd data={platformJsonLd(data)} />
      <PlatformPage data={data} />
    </>
  );
}
