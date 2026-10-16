/**
 * The user's own Monero node. Stored only inside the encrypted wallet vault (never in plain
 * browser storage), because the address and any login reveal where the user runs a node.
 */
export interface NodeConfig {
  /** Origin only, e.g. "https://node.example.com:18089". */
  uri: string;
  /** Optional RPC login (monerod --rpc-login). */
  username?: string;
  password?: string;
}

export class NodeUriError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NodeUriError";
  }
}

const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Validates and normalizes a node address to its origin. HTTPS is required, because a
 * secure page cannot reach a plain-HTTP server; the exceptions are a node on this computer
 * (browsers allow loopback) and a .onion address (Tor Browser treats it as secure).
 */
export function normalizeNodeUri(input: string): string {
  const raw = input.trim();
  if (!raw) throw new NodeUriError("Enter your node's address.");
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    throw new NodeUriError("That does not look like a web address. Example: https://node.example.com:18089");
  }
  if (url.username || url.password) throw new NodeUriError("Put the login in the username and password fields, not in the address.");
  if (url.pathname !== "/" || url.search || url.hash) throw new NodeUriError("Use only the address and port, with nothing after them.");
  const host = url.hostname.toLowerCase();
  const local = LOOPBACK.has(host) || host.endsWith(".localhost");
  const onion = host.endsWith(".onion");
  if (url.protocol === "http:" && !local && !onion) {
    throw new NodeUriError("Use https:// for a node on another machine. Plain http:// only works for a node on this computer or a .onion address.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new NodeUriError("The address must start with https://");
  return url.origin;
}
