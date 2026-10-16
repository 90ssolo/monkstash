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
