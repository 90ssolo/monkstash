import { repoUrl } from "@/lib/site";

export interface FaqLink { href: string; label: string }
export interface FaqEntry {
  q: string;
  /** Plain text. Feeds both the visible answer and the FAQPage schema. */
  a: string;
  /** Optional phrase inside `a` to highlight. */
  hl?: string;
  /** Deep guides that go further than this answer. */
  links?: FaqLink[];
}
export interface FaqCategory {
  id: string;
  name: string;
  /** One line shown beside the category heading. */
  blurb: string;
  items: FaqEntry[];
}

export const faqCategories: FaqCategory[] = [
  {
    id: "basics",
    name: "Basics",
    blurb: "What MonkStash is, what it costs, and what you need to start.",
    items: [
      {
        q: "What is MonkStash?",
        a: "MonkStash is a free Monero (XMR) wallet that runs in your web browser. It is non-custodial, which means your keys are created and kept on your device and we never see them or control your money.",
        hl: "your keys are created and kept on your device",
        links: [{ href: "/about", label: "About MonkStash" }, { href: "/what-is-monero", label: "What Monero is" }],
      },
      {
        q: "How do I start using Monero?",
        a: "Create or restore a wallet, write down your recovery words, and set a password. Most people finish setup in about two minutes. Then share your address to receive Monero, or buy some first.",
        links: [{ href: "/use-monero", label: "How to use Monero" }, { href: "/create-monero-wallet", label: "Create a wallet" }, { href: "/buy-monero", label: "How to buy Monero" }],
      },
      {
        q: "Do I need an account or email?",
        a: "No. There is no sign-up. You create a wallet, write down your recovery words, and set a password. That is it.",
        hl: "There is no sign-up.",
        links: [{ href: "/create-monero-wallet", label: "Create a wallet" }],
      },
      {
        q: "Do I need to download anything?",
        a: "No. The wallet runs in your browser, so there is nothing to install and no blockchain to download. It connects to a Monero node to find your payments.",
        links: [{ href: "/monero-node", label: "What a node does" }],
      },
      {
        q: "Is there a Chrome extension?",
        a: "A Chrome extension is planned, but you can use the full wallet today without it.",
        links: [{ href: "/monero-chrome-extension", label: "The Monero Chrome extension" }],
      },
      {
        q: "Is MonkStash free?",
        a: "Yes. The wallet is free to use. You only ever pay the small Monero network fee when you send a payment, which goes to the network, not to us.",
        links: [{ href: "/monero-transaction-fee", label: "How Monero fees work" }],
      },
      {
        q: "Can I use MonkStash on my phone?",
        a: "MonkStash is built to run in your phone browser too, with nothing to install. Mobile browsers are still being tested, so start with small amounts. Your wallet lives in the browser where you created it; on a new device, restore it with your recovery words.",
        links: [{ href: "/monero-wallets", label: "Compare Monero wallets" }, { href: "/restore-monero-wallet", label: "Restore a wallet" }],
      },
      {
        q: "Is Monero legal?",
        a: "In most countries it is legal to own and use Monero. Some exchanges have stopped listing it, which affects where you can buy it, not whether you can hold it. Rules vary by country and change over time, so check your local situation.",
        links: [{ href: "/is-monero-legal", label: "Is Monero legal?" }],
      },
      {
        q: "Is Monero traceable?",
        a: "Monero hides the sender, receiver, and amount of every transaction, which makes it far harder to trace than Bitcoin. No system is perfectly anonymous, and details like your IP address can still leak if you are not careful.",
        hl: "far harder to trace than Bitcoin",
        links: [{ href: "/is-monero-traceable", label: "Is Monero traceable?" }, { href: "/monero-vs-bitcoin", label: "Monero vs Bitcoin" }],
      },
    ],
  },
  {
    id: "safety",
    name: "Safety",
    blurb: "Keys, recovery words, scams, and what we can and cannot see.",
    items: [
      {
        q: "What are recovery words?",
        a: "Recovery words are a list of 25 words, sometimes called a seed phrase, that stand for the keys to your wallet. They are the only way to get your wallet back if you lose your device, and anyone who has them can take your money, so keep them private and offline.",
        hl: "anyone who has them can take your money",
        links: [{ href: "/monero-seed-phrase", label: "Monero seed phrase explained" }, { href: "/back-up-monero-wallet", label: "Back up your wallet" }],
      },
      {
        q: "Can MonkStash access my funds?",
        a: "No. Because your keys never leave your device, we cannot spend, freeze, or recover your money. That is the point of a non-custodial wallet.",
        hl: "we cannot spend, freeze, or recover your money",
        links: [{ href: "/about#built", label: "How MonkStash is built" }],
      },
      {
        q: "Is a web wallet safe?",
        a: "It is safe when it is non-custodial and you follow good habits: back up your recovery words offline, use the real site, and keep your device free of harmful software. For large savings, a hardware wallet is safer.",
        links: [{ href: "/is-monero-safe", label: "Is Monero safe?" }, { href: "/monero-wallets", label: "Wallet types compared" }],
      },
      {
        q: "Has MonkStash been audited?",
        a: "Not yet. MonkStash is an early preview. The wallet engine is monero-ts, an open-source WebAssembly build of Monero's own wallet code, and MonkStash's own code is open source too, but the app has not been independently audited yet. Security work runs from day one, and an independent audit is planned. Until it is done, use small amounts.",
        hl: "has not been independently audited",
        links: [{ href: "/about#status", label: "Our honest status" }, { href: "/donate", label: "Support the project" }],
      },
      {
        q: "Is MonkStash open source?",
        a: "Yes. The full MonkStash code (the web wallet, this website, MonkStash Pay and the WooCommerce plugin) is public under the BSD-3-Clause license, so anyone can read it, run it, or report a problem. Open code is not the same as an audit: an independent security review and signed, reproducible builds are still on the roadmap.",
        hl: "BSD-3-Clause license",
        links: [{ href: repoUrl, label: "Read the code" }, { href: "/donate#roadmap", label: "The roadmap" }],
      },
      {
        q: "What can the Monero node see?",
        a: "To find your payments, your wallet asks a Monero node through our relay server. The relay can see your IP address and those requests, and the node sees the requests and any transaction you send, but neither ever sees your keys or your recovery words. If you run your own node, you can connect MonkStash to it in the wallet's settings. Your browser then talks to your node directly, and no third party is involved.",
        links: [{ href: "/monero-node", label: "What a node does" }, { href: "/monero-remote-node", label: "Remote nodes" }, { href: "/run-a-monero-node", label: "Run your own node" }, { href: "/monero-light-wallet", label: "Light wallets" }],
      },
      {
        q: "How do I spot a fake wallet site?",
        a: "Only use the real MonkStash site, and bookmark it so you do not land on a copy. Never type your recovery words into a site or app because a message asked you to. Be wary of anyone offering help in a chat or comment who then asks for your words or a payment, and download wallet software only from official sources.",
        hl: "bookmark it",
        links: [{ href: "/monero-phishing-sites", label: "How Monero phishing sites work" }, { href: "/support", label: "Support" }],
      },
      {
        q: "Will MonkStash ever ask for my recovery words?",
        a: "Never. No real support person, from any wallet, needs them. Anyone who asks is trying to steal your money. Keep your 25 words offline and private.",
        hl: "Never.",
        links: [{ href: "/support", label: "Support" }],
      },
    ],
  },
  {
    id: "using",
    name: "Using the wallet",
    blurb: "Restoring, sending, receiving, and fixing the usual snags.",
    items: [
      {
        q: "Can I use my existing Monero wallet?",
        a: "Yes. Restore it with your 25 recovery words to send and receive, or add a watch-only wallet with your address and private view key to follow incoming payments without being able to spend.",
        links: [{ href: "/restore-monero-wallet", label: "Restore a wallet" }, { href: "/monero-view-only-wallet", label: "View-only wallets" }, { href: "/monero-view-key", label: "What a view key is" }],
      },
      {
        q: "How do I send Monero?",
        a: "Enter the recipient's address and the amount, check the fee your wallet shows, then confirm. Check the address carefully first, because a Monero payment cannot be undone.",
        links: [{ href: "/send-monero", label: "How to send Monero" }, { href: "/tools/monero-address-validator", label: "Address validator" }],
      },
      {
        q: "Why is my balance taking a while to appear?",
        a: "The wallet has to scan the network for your payments. Entering roughly when you first made the wallet lets it skip ahead and sync much faster.",
        hl: "lets it skip ahead",
        links: [{ href: "/monero-restore-height", label: "What restore height is" }, { href: "/monero-wallet-not-showing-balance", label: "Balance not showing" }],
      },
      {
        q: "My wallet will not sync. What should I do?",
        a: "This is almost always the node your wallet connects to, not your money, which is safe on the network. Try again in a few minutes, and follow the fix guide if it persists.",
        links: [{ href: "/monero-wallet-not-syncing", label: "Fix a wallet that will not sync" }, { href: "/monero-wallet-not-connecting", label: "Wallet not connecting" }],
      },
      {
        q: "A payment has not arrived. What now?",
        a: "Make sure your wallet has finished syncing, then check the sender used the right address.",
        links: [{ href: "/receive-monero", label: "How to receive Monero" }, { href: "/monero-transaction-time", label: "How long payments take" }],
      },
    ],
  },
  {
    id: "fees",
    name: "Fees and timing",
    blurb: "What a payment costs, and how long until it counts.",
    items: [
      {
        q: "How long do payments take?",
        a: "A payment usually confirms in about 2 minutes, and is treated as final after about 20 minutes, which is 10 confirmations.",
        hl: "about 2 minutes",
        links: [{ href: "/monero-transaction-time", label: "Monero transaction time" }],
      },
      {
        q: "How much are the fees?",
        a: "The Monero network fee is usually a few cents or less, and does not depend on how much you send. Your wallet shows the fee before you confirm.",
        hl: "a few cents or less",
        links: [{ href: "/monero-transaction-fee", label: "Monero transaction fees" }],
      },
      {
        q: "How long does the first sync take?",
        a: "Setup takes about two minutes. Syncing the first time can take a little longer, and the wallet shows its progress. Entering roughly when you made the wallet lets it start from the right place.",
        links: [{ href: "/monero-restore-height", label: "What restore height is" }, { href: "/monero-wallet-not-syncing", label: "If it stalls" }],
      },
    ],
  },
  {
    id: "recovery",
    name: "Recovery",
    blurb: "Forgotten passwords, lost devices, and balances that look wrong.",
    items: [
      {
        q: "What happens if I forget my password?",
        a: "Your password only unlocks the copy saved in this browser. If you forget it, remove the wallet and bring it back with your recovery words. Without those words, no one, including us, can recover your money.",
        hl: "bring it back with your recovery words",
        links: [{ href: "/restore-monero-wallet", label: "Restore a wallet" }, { href: "/back-up-monero-wallet", label: "Back up your wallet" }],
      },
      {
        q: "What if I lose my recovery words?",
        a: "Without your recovery words, and without access to the wallet saved in your browser, no one, including us, can recover your money. Write the 25 words on paper and keep them offline and private.",
        links: [{ href: "/monero-seed-phrase", label: "Monero seed phrase explained" }, { href: "/back-up-monero-wallet", label: "Back up your wallet" }],
      },
      {
        q: "My balance looks wrong after restoring. Why?",
        a: "The usual cause is a restore date set too late. Restore again with an earlier date so the wallet scans far enough back.",
        hl: "restore date set too late",
        links: [{ href: "/monero-wallet-not-showing-balance", label: "Balance not showing" }, { href: "/monero-restore-height", label: "What restore height is" }],
      },
      {
        q: "What is a restore height?",
        a: "It is roughly the point on the blockchain where your wallet was first made. A wallet only needs to look from there onward, so entering it lets the wallet skip ahead and sync faster. If you are unsure, pick an earlier date, not a later one.",
        links: [{ href: "/monero-restore-height", label: "Restore height explained" }],
      },
    ],
  },
  {
    id: "mymonero",
    name: "MyMonero",
    blurb: "If your wallet lived at MyMonero, start here.",
    items: [
      {
        q: "What happened to MyMonero?",
        a: "It shut down in January 2026. Your funds are safe if you have your recovery words. You can restore them in MonkStash, but watch out for fake MyMonero sites.",
        hl: "watch out for fake MyMonero sites",
        links: [{ href: "/restore-mymonero-seed", label: "Restore a MyMonero seed" }, { href: "/mymonero-alternative", label: "MyMonero alternative" }],
      },
      {
        q: "Can I restore my MyMonero wallet in MonkStash?",
        a: "Yes, if you have your recovery words: both the 25-word kind and MyMonero's older 13-word kind work. Give the wallet an earlier restore date than you think you need so it finds all your payments, then check the address matches your old MyMonero address.",
        links: [{ href: "/restore-mymonero-seed", label: "Restore a MyMonero seed" }, { href: "/restore-monero-wallet", label: "Restore a wallet" }],
      },
      {
        q: "Are there fake MyMonero sites?",
        a: "Yes. After MyMonero closed, look-alike sites appeared that copy real wallets to trick people into handing over their recovery words. Never type your recovery words into a site because a message or a search result pointed you there.",
        links: [{ href: "/monero-phishing-sites", label: "How Monero phishing sites work" }],
      },
      {
        q: "Is MonkStash the same as MyMonero?",
        a: "No. MonkStash is a new, separate wallet. It is not MyMonero and not a rebrand of it.",
        links: [{ href: "/about#why", label: "Why MonkStash exists" }],
      },
    ],
  },
];

export const allFaqs: FaqEntry[] = faqCategories.flatMap((c) => c.items);
