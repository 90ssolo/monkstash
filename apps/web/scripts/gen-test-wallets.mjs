/**
 * Generates stagenet test wallets for the dev test-wallet picker and monitoring dashboard.
 * Output: apps/web/test-wallets.local.json  (git-ignored; stagenet coins are worthless).
 *
 * Usage: node scripts/gen-test-wallets.mjs [count]
 * To use your OWN wallets instead, edit the JSON and paste your seeds. Never commit it.
 */
import { createRequire } from "node:module";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const moneroTs = require("monero-ts");
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "test-wallets.local.json");

const NODE = "http://node.sethforprivacy.com:38089";
const count = Math.min(Number(process.argv[2] || 3), 8);

if (existsSync(out)) {
  console.log(`${out} already exists. Delete it first to regenerate.`);
  process.exit(0);
}

const daemon = await moneroTs.connectToDaemonRpc(NODE);
const height = await daemon.getHeight();
const wallets = [];
for (let i = 0; i < count; i++) {
  const w = await moneroTs.createWalletKeys({ networkType: "stagenet", language: "English" });
  wallets.push({
    label: `Test ${String.fromCharCode(65 + i)}`,
    seed: await w.getSeed(),
    primaryAddress: await w.getPrimaryAddress(),
    privateViewKey: await w.getPrivateViewKey(),
    restoreHeight: height,
  });
}
writeFileSync(out, JSON.stringify({ network: "stagenet", wallets }, null, 2));
console.log(`Wrote ${count} stagenet test wallets to ${out} (restore height ${height}).`);
for (const w of wallets) console.log(`  ${w.label}: ${w.primaryAddress}`);
process.exit(0);
