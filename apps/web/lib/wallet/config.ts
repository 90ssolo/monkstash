import type { NetworkType } from "@quietmint/wallet-core";

/** Network the whole app targets. Set with NEXT_PUBLIC_MONERO_NETWORK. */
export const NETWORK: NetworkType = (() => {
  const v = process.env.NEXT_PUBLIC_MONERO_NETWORK;
  return v === "mainnet" || v === "testnet" || v === "stagenet" ? v : "stagenet";
})();

/**
 * Where the wallet's own API and node relay live. Empty on the website: same origin. The browser
 * extension sets it (NEXT_PUBLIC_API_ORIGIN) to the wallet origin, since its pages have their own.
 */
export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_ORIGIN ?? "").replace(/\/+$/, "");

/** An API path on the wallet's server (same origin on the website). */
export const apiUrl = (path: string) => `${API_ORIGIN}${path}`;

export const IS_TEST_NETWORK = NETWORK !== "mainnet";

/** Dev tooling (test-wallet picker, monitoring dashboard) is only available off mainnet in dev. */
export const DEV_TOOLS_ENABLED = process.env.NODE_ENV !== "production" && IS_TEST_NETWORK;

export const EXPLORER_TX: Record<NetworkType, (hash: string) => string> = {
  mainnet: (h) => `https://xmrchain.net/tx/${h}`,
  stagenet: (h) => `https://stagenet.xmrchain.net/tx/${h}`,
  testnet: (h) => `https://testnet.xmrchain.net/tx/${h}`,
};
