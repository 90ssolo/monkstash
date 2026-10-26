/**
 * MonkStash Pay settings, all from environment variables. Startup fails with a clear message
 * when something is missing or unsafe, rather than running half-configured.
 */
import { addressNetwork, CONFIRMATION_PRESETS, isCurrencyCode, type ConfirmationPolicy, type NetworkType } from "@quietmint/wallet-core";

export interface PayConfig {
  network: NetworkType;
  /** The shop wallet's primary address and private VIEW key. The spend key is never needed. */
  address: string;
  viewKey: string;
  restoreHeight: number;
  /**
   * The wallet account (major index) this server makes invoice subaddresses in. One account per
   * Pay server: never share it with a till, payment links or another Pay server, or two orders
   * could be handed the same subaddress.
   */
  account: number;
  /** Most unpaid, unexpired invoices allowed at once; new ones are refused above this. */
  maxOpenInvoices: number;
  /** Monero node (daemon RPC). The node sees this server's IP and its sync requests, never the view key. */
  nodeUrl: string;
  nodeUsername?: string;
  nodePassword?: string;
  /** Secret the shop uses to call the API. */
  apiKey: string;
  /** Where to send "invoice paid" events, and the secret they are signed with. */
  webhookUrl?: string;
  webhookSecret?: string;
  dataDir: string;
  port: number;
  host: string;
  /** Public base URL of this server, used to build checkout links. */
  publicUrl: string;
  shopName?: string;
  /**
   * The MonkStash wallet the checkout's "Pay with MonkStash" button opens, with the order filled
   * in (price, hold time, way back to the shop). Unset to hide the button.
   */
  walletLink?: string;
  policy: ConfirmationPolicy;
  /** Default minutes before an invoice expires (fiat prices are held this long). */
  expiryMinutes: number;
  /** Rate-limit by the X-Forwarded-For address a trusted reverse proxy adds. */
  trustProxy: boolean;
  /** Default currency when the API call does not name one. */
  defaultCurrency: string;
  liveCoinWatchKey?: string;
}

export class ConfigError extends Error {}

const req = (env: NodeJS.ProcessEnv, name: string): string => {
  const v = env[name]?.trim();
  if (!v) throw new ConfigError(`${name} is required.`);
  return v;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): PayConfig {
  const network = (env.PAY_NETWORK?.trim() || "mainnet") as NetworkType;
  if (!["mainnet", "stagenet", "testnet"].includes(network)) throw new ConfigError("PAY_NETWORK must be mainnet, stagenet or testnet.");

  const address = req(env, "PAY_ADDRESS");
  if (addressNetwork(address) !== network) throw new ConfigError(`PAY_ADDRESS is not a ${network} address.`);
  // Primary addresses start with 4 (mainnet), 5 (stagenet) or 9 (testnet); subaddresses cannot be used here.
  if (!/^[459]/.test(address) || address.length !== 95) throw new ConfigError("PAY_ADDRESS must be the wallet's primary address (95 characters), not a subaddress.");

  const viewKey = req(env, "PAY_VIEW_KEY").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(viewKey)) throw new ConfigError("PAY_VIEW_KEY must be the 64-character private view key.");

  const rawHeight = env.PAY_RESTORE_HEIGHT?.trim() ?? "";
  if (!rawHeight) {
    throw new ConfigError(
      "PAY_RESTORE_HEIGHT is required: the block height when the shop wallet was created (a little earlier is fine), where the first scan starts. If you do not know it, use the height of a block from shortly before you made the wallet. Scanning from block 0 would take many hours.",
    );
  }
  const restoreHeight = Number(rawHeight);
  if (!/^\d+$/.test(rawHeight) || !Number.isSafeInteger(restoreHeight)) throw new ConfigError("PAY_RESTORE_HEIGHT must be a block height, a whole number like 3200000.");

  const rawAccount = env.PAY_ACCOUNT?.trim() || "1";
  const account = Number(rawAccount);
  if (!/^\d+$/.test(rawAccount) || !Number.isInteger(account) || account > 1000) {
    throw new ConfigError("PAY_ACCOUNT must be a wallet account number from 0 to 1000 (default 1). Use an account nothing else creates addresses in.");
  }

  const rawMaxOpen = env.PAY_MAX_OPEN_INVOICES?.trim() || "500";
  const maxOpenInvoices = Number(rawMaxOpen);
  if (!/^\d+$/.test(rawMaxOpen) || maxOpenInvoices < 1 || maxOpenInvoices > 100_000) throw new ConfigError("PAY_MAX_OPEN_INVOICES must be a whole number from 1 to 100000.");

  const nodeUrl = req(env, "PAY_NODE_URL").replace(/\/+$/, "");
  if (!/^https?:\/\//.test(nodeUrl)) throw new ConfigError("PAY_NODE_URL must start with http:// or https://.");

  const apiKey = req(env, "PAY_API_KEY");
  if (apiKey.length < 32) throw new ConfigError("PAY_API_KEY must be at least 32 characters. Generate one with: openssl rand -hex 32");

  const webhookUrl = env.PAY_WEBHOOK_URL?.trim() || undefined;
  const webhookSecret = env.PAY_WEBHOOK_SECRET?.trim() || undefined;
  if (webhookUrl && !/^https?:\/\//.test(webhookUrl)) throw new ConfigError("PAY_WEBHOOK_URL must be a full http(s) URL.");
  if (webhookUrl && (!webhookSecret || webhookSecret.length < 32)) throw new ConfigError("PAY_WEBHOOK_SECRET (32+ characters) is required with PAY_WEBHOOK_URL.");

  const port = Number(env.PAY_PORT ?? "8080");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new ConfigError("PAY_PORT must be a port number.");

  const publicUrl = (env.PAY_PUBLIC_URL?.trim() || `http://localhost:${port}`).replace(/\/+$/, "");
  const speed = (env.PAY_CONFIRMATIONS?.trim() || "standard") as keyof typeof CONFIRMATION_PRESETS;
  if (!(speed in CONFIRMATION_PRESETS)) throw new ConfigError("PAY_CONFIRMATIONS must be quick, standard or safe.");

  const expiryMinutes = Number(env.PAY_EXPIRY_MINUTES ?? "30");
  if (!Number.isFinite(expiryMinutes) || expiryMinutes < 5 || expiryMinutes > 60 * 24 * 7) throw new ConfigError("PAY_EXPIRY_MINUTES must be between 5 and 10080.");

  // "off" hides the button; anything else must be an https address (http only for localhost).
  const walletRaw = env.PAY_MONKSTASH_WALLET?.trim() || "https://wallet.monkstash.com/";
  const walletLink = /^off$/i.test(walletRaw) ? undefined : walletRaw;
  if (walletLink && !/^https:\/\/[^\s#]+$/.test(walletLink) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/[^\s#]*$/.test(walletLink)) {
    throw new ConfigError("PAY_MONKSTASH_WALLET must be an https:// address, or off.");
  }

  const defaultCurrency = (env.PAY_CURRENCY?.trim() || "EUR").toUpperCase();
  if (defaultCurrency !== "XMR" && !isCurrencyCode(defaultCurrency)) throw new ConfigError("PAY_CURRENCY must be XMR or a currency code like EUR.");

  return {
    network, address, viewKey, restoreHeight, account, maxOpenInvoices, nodeUrl,
    nodeUsername: env.PAY_NODE_USERNAME?.trim() || undefined,
    nodePassword: env.PAY_NODE_PASSWORD?.trim() || undefined,
    apiKey, webhookUrl, webhookSecret,
    dataDir: env.PAY_DATA_DIR?.trim() || "./data",
    port, host: env.PAY_HOST?.trim() || "0.0.0.0", publicUrl,
    shopName: env.PAY_SHOP_NAME?.trim().slice(0, 60) || undefined,
    walletLink,
    policy: CONFIRMATION_PRESETS[speed],
    expiryMinutes, defaultCurrency,
    liveCoinWatchKey: env.LIVECOINWATCH_API_KEY?.trim() || undefined,
    // Behind a reverse proxy (Caddy, nginx), every request comes from the proxy's address.
    // Set PAY_TRUST_PROXY=1 to rate-limit by the client address the proxy adds instead.
    // Only set it when the proxy is the only way in, or clients can claim any address.
    trustProxy: /^(1|true|yes)$/i.test(env.PAY_TRUST_PROXY?.trim() ?? ""),
  };
}
