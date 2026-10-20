/**
 * The seed doctor's knowledge: Monero recovery phrase formats, which app makes each one, and
 * where it can be restored. Shared by the interactive tool and the reference table on
 * /tools/monero-seed-doctor so the two never disagree. It never sees anyone's words.
 *
 * Sources (checked 2026-10-20): getmonero.org restore guide, Feather "Seed scheme" docs, Cake
 * Wallet Monero docs, tevador/polyseed, and the MonkStash restore code (wallet-core).
 */

export type WordCount = 12 | 13 | 14 | 16 | 24 | 25 | "other";
export type MadeBy = "gui" | "feather" | "cake" | "mymonero" | "exodus" | "hardware" | "unknown";

export const WORD_COUNTS: WordCount[] = [25, 16, 13, 12, 14, 24, "other"];
export const MAKERS: { id: MadeBy; label: string }[] = [
  { id: "gui", label: "Monero GUI or CLI" },
  { id: "feather", label: "Feather" },
  { id: "cake", label: "Cake Wallet" },
  { id: "mymonero", label: "MyMonero" },
  { id: "exodus", label: "Exodus" },
  { id: "hardware", label: "Ledger or Trezor" },
  { id: "unknown", label: "Not sure" },
];

/** Whether MonkStash can restore the phrase itself. */
export type HereSupport = "yes" | "check" | "no";

export interface Diagnosis {
  name: string;
  what: string;
  here: HereSupport;
  /** One line on MonkStash. */
  hereNote: string;
  /** Where else it restores. */
  elsewhere: string;
  /** Whether the user needs a restore height (Polyseed carries its own date). */
  needsHeight: boolean;
  /** What to do, in order. */
  steps: string[];
  /** Link to the most useful guide. */
  guide?: { href: string; label: string };
}

const STANDARD: Diagnosis = {
  name: "A standard 25-word Monero seed",
  what: "The classic Monero recovery phrase: 24 words plus a 25th check word made from the others. Monero GUI and CLI make it, and so do Feather and Cake Wallet when you choose the legacy seed.",
  here: "yes",
  hereNote: "MonkStash restores it, and checks each word and the check word before it starts.",
  elsewhere: "Monero GUI and CLI, Feather and Cake Wallet restore it too.",
  needsHeight: true,
  steps: [
    "Restore it with a restore height from before your first payment (use the date below).",
    "If you only wrote down 24 words, the 25th can be worked out from the others: the MonkStash restore screen does it for you.",
  ],
  guide: { href: "/restore-monero-wallet", label: "How to restore a Monero wallet" },
};

export function diagnose(count: WordCount, madeBy: MadeBy): Diagnosis {
  switch (count) {
    case 25:
      return STANDARD;
    case 16:
      return {
        name: "A 16-word Polyseed",
        what: "Polyseed is the newer Monero phrase format. Feather uses it since version 2.0 and Cake Wallet makes it by default. The date the wallet was made is built into the words, so you do not need a restore height.",
        here: "no",
        hereNote: "MonkStash cannot restore a Polyseed yet.",
        elsewhere: "Feather and Cake Wallet restore it.",
        needsHeight: false,
        steps: [
          "Restore it in Feather or Cake Wallet.",
          "To use it in a wallet without Polyseed (such as MonkStash), open the wallet in Feather, go to Wallet, then Seed, tick Show 25 word seed, and write down the restore height with it.",
          "A 25-word seed cannot be turned back into a Polyseed.",
        ],
        guide: { href: "/feather-wallet-review", label: "Feather Wallet review" },
      };
    case 13:
      return {
        name: "A 13-word MyMonero phrase",
        what: "MyMonero, the web wallet that shut down in January 2026, used a shorter 13-word phrase. It holds the same kind of keys as any Monero wallet.",
        here: "yes",
        hereNote: "MonkStash restores MyMonero phrases and checks them first.",
        elsewhere: "Not every Monero wallet accepts MyMonero phrases; check before you rely on another app.",
        needsHeight: true,
        steps: [
          "Restore it in MonkStash with a date before you first used MyMonero.",
          "Check the address matches your old MyMonero address.",
        ],
        guide: { href: "/restore-mymonero-seed", label: "How to restore a MyMonero seed" },
      };
    case 12:
      if (madeBy === "cake") {
        return {
          name: "A 12-word BIP39 phrase from Cake Wallet",
          what: "Cake Wallet can make Monero wallets from a 12-word BIP39 phrase, the kind Bitcoin wallets use. Cake turns it into a normal Monero wallet.",
          here: "check",
          hereNote: "MonkStash reads 12 words the way Cake documents (path m/44'/128'/0'/0/0), but not a seed passphrase. Without a passphrase it should give the same wallet: check the address after restoring.",
          elsewhere: "Cake Wallet restores it. Its Recovery & Keys screen, Legacy tab, also shows the same wallet as a 25-word seed with its restore height, which works anywhere.",
          needsHeight: true,
          steps: [
            "Simplest: in Cake, open Recovery & Keys, Legacy tab, and use that 25-word seed and restore height.",
            "If you set a seed passphrase in Cake, restore in Cake, or use the Legacy 25-word seed.",
          ],
          guide: { href: "/cake-wallet-review", label: "Cake Wallet review" },
        };
      }
      return {
        name: madeBy === "exodus" ? "A 12-word Exodus phrase" : "A 12-word BIP39 phrase (Exodus, or Cake Wallet)",
        what: "Exodus used one 12-word BIP39 phrase for every coin, including Monero, until it ended Monero support in August 2025. Cake Wallet can also make 12-word Monero wallets.",
        here: "yes",
        hereNote: "MonkStash restores Exodus phrases and turns them into the standard 25-word seed of the same wallet.",
        elsewhere: "Cake Wallet restores BIP39 Monero phrases too.",
        needsHeight: true,
        steps: [
          "Restore it in MonkStash. Exodus added Monero in April 2019, so no date is needed before that.",
          "Check the address matches the Monero address Exodus showed you.",
          "If it came from Cake Wallet with a seed passphrase, use Cake's Legacy 25-word seed instead.",
        ],
        guide: { href: "/exodus-monero", label: "Move Monero out of Exodus" },
      };
    case 14:
      return {
        name: "A 14-word Feather seed (before version 2.0)",
        what: "Before version 2.0, Feather made 14-word seeds with a library it no longer uses for new wallets.",
        here: "no",
        hereNote: "MonkStash cannot restore 14-word seeds.",
        elsewhere: "Feather restores them and says it will keep doing so.",
        needsHeight: true,
        steps: [
          "Restore it in Feather.",
          "To move the money elsewhere, send it from Feather to your new wallet's address.",
        ],
        guide: { href: "/feather-wallet-review", label: "Feather Wallet review" },
      };
    case 24:
      if (madeBy === "hardware") {
        return {
          name: "A hardware wallet's phrase",
          what: "Ledger and Trezor phrases belong to the device. A Monero wallet on them is opened by connecting the device, not by typing the words into an app.",
          here: "no",
          hereNote: "MonkStash cannot use hardware wallets yet.",
          elsewhere: "Monero GUI and Feather open Monero wallets on a connected Ledger or Trezor.",
          needsHeight: true,
          steps: [
            "Restore the phrase on the device (or a new one of the same brand), then connect it to Monero GUI or Feather.",
            "Never type a hardware wallet's words into a website or a software wallet.",
          ],
          guide: { href: "/safest-monero-wallet", label: "The safest Monero wallets" },
        };
      }
      return {
        name: madeBy === "cake" ? "A 24-word BIP39 phrase from Cake Wallet" : "24 words: a few possibilities",
        what: madeBy === "cake"
          ? "Cake Wallet can make Monero wallets from a 24-word BIP39 phrase."
          : "24 words can be a standard Monero seed missing its 25th check word, a hardware wallet's phrase, or a 24-word BIP39 phrase from Cake Wallet.",
        here: madeBy === "cake" ? "no" : "check",
        hereNote: madeBy === "cake"
          ? "MonkStash cannot restore 24-word BIP39 phrases."
          : "If the words are Monero words, MonkStash's restore screen works out the missing 25th word. Otherwise it cannot restore them.",
        elsewhere: "Cake Wallet restores its own 24-word phrases; hardware phrases need the device with Monero GUI or Feather.",
        needsHeight: true,
        steps: madeBy === "cake"
          ? ["Restore it in Cake.", "To move it elsewhere, Cake's Keys tab shows the private view and spend keys, which other wallets accept."]
          : ["If it came from Monero GUI, Feather or Cake's legacy seed, enter the 24 words in MonkStash: it adds the 25th.", "If it came from a Ledger or Trezor, use the device with Monero GUI or Feather."],
        guide: { href: "/monero-seed-phrase", label: "Monero seed phrases explained" },
      };
    default:
      return {
        name: "Not a Monero phrase format we know",
        what: "Monero phrases come in 25, 16, 14 or 13 words, and some apps use 12 or 24-word BIP39 phrases. Another number usually means a word was lost or added, or the phrase belongs to another coin.",
        here: "no",
        hereNote: "Count the words again on your backup.",
        elsewhere: "If the app you used supports several coins, its Monero wallet may use the same phrase as everything else.",
        needsHeight: true,
        steps: ["Count again, one line at a time.", "Check the app that made it: its help pages say which phrase it shows for Monero."],
        guide: { href: "/monero-seed-phrase", label: "Monero seed phrases explained" },
      };
  }
}

/** Why a restored wallet can show 0 (or too little), most common first. */
export const ZERO_BALANCE_CAUSES: { title: string; body: string }[] = [
  { title: "The restore height is too late", body: "The wallet only reads blocks after it, so earlier payments are skipped. Restore again with an earlier date. Too early only costs time; too late hides money." },
  { title: "The scan has not finished", body: "The balance builds up as the wallet reads the chain. Wait until it says it is up to date before you judge it." },
  { title: "It is a different wallet", body: "Check that the address after restoring matches the one you used. A 12 or 24-word phrase made by another app, or with a passphrase, can open a different, empty wallet." },
  { title: "The money is in another account", body: "Some wallets keep several accounts in one seed. Look for an account list in the wallet." },
];

/** Reference rows for the table: words, what it is, made by, restores in, MonkStash. */
export const FORMAT_TABLE: { words: string; name: string; madeBy: string; restores: string; here: string }[] = [
  { words: "25", name: "Standard Monero seed", madeBy: "Monero GUI and CLI; Feather and Cake (legacy option)", restores: "Monero GUI and CLI, Feather, Cake", here: "Yes" },
  { words: "16", name: "Polyseed (date built in)", madeBy: "Feather 2.0 and later; Cake (default)", restores: "Feather, Cake", here: "Not yet: use Feather's 25-word seed" },
  { words: "14", name: "Older Feather seed", madeBy: "Feather before 2.0", restores: "Feather", here: "No" },
  { words: "13", name: "MyMonero phrase", madeBy: "MyMonero (shut down January 2026)", restores: "MonkStash; check others first", here: "Yes" },
  { words: "12", name: "BIP39 phrase", madeBy: "Exodus (until August 2025); Cake (option)", restores: "Cake; MonkStash for Exodus", here: "Yes (Cake: without passphrase)" },
  { words: "24", name: "Hardware or BIP39 phrase", madeBy: "Ledger, Trezor; Cake (option)", restores: "The device with Monero GUI or Feather; Cake", here: "No" },
];
