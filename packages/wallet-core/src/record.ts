/**
 * The wallet record kept in browser storage. Public metadata is stored in the
 * clear so the unlock screen can show it; all secrets sit in the encrypted vault.
 */
import type { NetworkType } from "./network";
import type { EncryptedVault } from "./vault";
import type { TotpConfig } from "./totp";
import type { NodeConfig } from "./node";

export type WalletKind = "full" | "view-only";

export interface WalletPublic {
  id: string;
  name: string;
  kind: WalletKind;
  network: NetworkType;
  primaryAddress: string;
  restoreHeight: number;
  createdAt: string; // ISO
  totpEnabled: boolean;
}

export interface WalletSecrets {
  /** Recovery phrase (full wallets): a 25-word Monero seed, or a 13-word MyMonero phrase. */
  seed?: string;
  /**
   * Seed passphrase ("seed offset", as in Cake Wallet, Monerujo and the Monero CLI) for a 25-word
   * seed. The same words with a different passphrase are a different wallet.
   */
  seedOffset?: string;
  /**
   * The 16-word Polyseed the wallet was restored from, shown as its recovery words. `seed` then
   * holds the same wallet as a 25-word seed, which is what the engine opens.
   */
  polyseed?: string;
  /** The Polyseed is encrypted: its passphrase is needed with the 16 words (it is not a seed offset). */
  polyseedEncrypted?: boolean;
  /** Private spend key, hex (full wallets restored from keys). */
  privateSpendKey?: string;
  /** Private view key, hex (always present). */
  privateViewKey: string;
  totp?: TotpConfig;
  /** The user's own node. Absent means the default MonkStash relay. */
  node?: NodeConfig;
}

export interface StoredWallet {
  pub: WalletPublic;
  vault: EncryptedVault;
}
