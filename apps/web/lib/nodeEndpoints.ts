/**
 * Node RPC endpoints the wallet engine calls. Its C++ HTTP client ignores any path in the node
 * URL and calls e.g. "/json_rpc" at the origin root, so these are rewritten to the relay at
 * /api/node (next.config.ts), which enforces the same list.
 */
export const NODE_ENDPOINTS = [
  "json_rpc", "get_info", "getinfo", "get_height", "getheight", "get_transactions", "gettransactions",
  "get_transaction_pool", "get_transaction_pool_hashes.bin", "get_transaction_pool_hashes",
  "send_raw_transaction", "sendrawtransaction", "get_blocks.bin", "getblocks.bin",
  "get_blocks_by_height.bin", "getblocks_by_height.bin", "get_hashes.bin", "gethashes.bin",
  "get_o_indexes.bin", "get_outs.bin", "get_outs", "is_key_image_spent", "get_fee_estimate",
  // wallet2 (Monero 0.18) reads the output distribution here to pick decoys when it builds a payment.
  "get_output_distribution.bin",
] as const;
