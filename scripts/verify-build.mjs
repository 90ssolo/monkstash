#!/usr/bin/env node
// Checks that a MonkStash site serves exactly the files of a published build.
//
//   node scripts/verify-build.mjs https://wallet.monkstash.com
//     Downloads build.json and every file it lists, and checks each one's SHA-256. Also checks that
//     every script the wallet page loads from /_next/static is one of those files.
//
//   node scripts/verify-build.mjs https://wallet.monkstash.com --compare my-build.json
//     Also compares the site's files with your own build of the same commit (see /verify for the
//     exact docker command). Equal fingerprints mean the site runs exactly that source code.
//
// Node.js 18 or newer, no dependencies.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const site = (args.find((a) => /^https?:\/\//.test(a)) ?? "").replace(/\/+$/, "");
const compareAt = args.indexOf("--compare");
const comparePath = compareAt >= 0 ? args[compareAt + 1] : null;
if (!site) {
  console.error("Usage: node scripts/verify-build.mjs <site-url> [--compare <your build.json>]");
  process.exit(2);
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const fingerprintOf = (files) =>
  sha256(Object.entries(files).sort(([a], [b]) => (a < b ? -1 : 1)).map(([url, h]) => `${h}  ${url}\n`).join(""));

async function get(url) {
  const res = await fetch(url, { redirect: "follow", headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

let problems = 0;
const fail = (msg) => { problems++; console.log(`  FAIL ${msg}`); };

const manifest = JSON.parse((await get(`${site}/build.json`)).toString("utf8"));
const files = manifest.files ?? {};
console.log(`Site:        ${site}`);
console.log(`Commit:      ${manifest.commit ?? "(not set)"}`);
console.log(`Settings:    ${JSON.stringify(manifest.settings)}`);
console.log(`Fingerprint: ${manifest.fingerprint}`);
if (fingerprintOf(files) !== manifest.fingerprint) fail("the fingerprint does not match the file list in build.json");

// 1. Every listed file is served with the listed content.
console.log(`\nChecking ${Object.keys(files).length} files...`);
let checked = 0;
for (const [url, expected] of Object.entries(files)) {
  try {
    const got = sha256(await get(site + url));
    if (got !== expected) fail(`${url}: served file differs from build.json`);
  } catch (e) {
    fail(`${url}: ${e.message}`);
  }
  checked++;
}
console.log(`  ${checked} files checked`);

// 2. The pages only load script files that are in the build. Inline scripts (the page's data,
// which differs per request) are counted but cannot be covered by a build hash.
for (const page of [`${site}/`, `${site}/wallet`]) {
  let html;
  try {
    html = (await get(page)).toString("utf8");
  } catch (e) {
    fail(`${page}: ${e.message}`);
    continue;
  }
  const refs = new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"?]+)/g)].map((m) => m[1]));
  const missing = [...refs].filter((r) => !(r in files));
  for (const r of missing) fail(`${page} loads ${r}, which is not in the build`);
  const inline = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>/g)].length;
  console.log(`  ${page}: ${refs.size - missing.length} of ${refs.size} files in the build; ${inline} inline data scripts (not covered)`);
}

// 3. Optional: compare with your own build.
if (comparePath) {
  const mine = JSON.parse(readFileSync(comparePath, "utf8"));
  console.log(`\nYour build:  ${mine.fingerprint} (commit ${mine.commit ?? "not set"})`);
  if (JSON.stringify(mine.settings) !== JSON.stringify(manifest.settings)) fail("your build used different public settings; rebuild with the ones shown above");
  if (mine.fingerprint !== manifest.fingerprint) {
    fail("fingerprints differ");
    const urls = new Set([...Object.keys(files), ...Object.keys(mine.files ?? {})]);
    for (const u of [...urls].sort()) if (files[u] !== mine.files?.[u]) console.log(`       ${u}`);
  } else {
    console.log("  MATCH: the site serves exactly your build of this commit.");
  }
}

console.log(problems ? `\n${problems} problem(s) found.` : "\nNo problems found.");
process.exit(problems ? 1 : 0);
