#!/usr/bin/env node
// Checks that a MonkStash site serves exactly the files of a published build.
//
//   node scripts/verify-build.mjs https://wallet.monkstash.com
//     Downloads build.json and every file it lists, and checks each one's SHA-256. Also checks that
//     every script the home and wallet pages load is one of those files, served from the site
//     itself, and that their security policy allows no other script source.
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

async function fetchOk(url) {
  const res = await fetch(url, { redirect: "follow", headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res;
}
const get = async (url) => Buffer.from(await (await fetchOk(url)).arrayBuffer());

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

// 2. The pages only load script files that are in the build, from this site, and their security
// policy allows no other script source. Inline scripts (the page's data, which differs per
// request) are counted but cannot be covered by a build hash.
const attr = (tag, name) => {
  const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
  return m ? (m[1] ?? m[2] ?? m[3] ?? "") : null;
};
for (const page of [`${site}/`, `${site}/wallet`]) {
  let res, html;
  try {
    res = await fetchOk(page);
    html = await res.text();
  } catch (e) {
    fail(`${page}: ${e.message}`);
    continue;
  }
  const origin = new URL(res.url).origin;
  // Every script the page can load: <script src>, and <link> preloads of scripts or modules.
  const sources = [];
  for (const [tag] of html.matchAll(/<script\b[^>]*>/gi)) {
    const src = attr(tag, "src");
    if (src !== null) sources.push(src);
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase();
    const as = (attr(tag, "as") ?? "").toLowerCase();
    if (rel.includes("modulepreload") || (rel.includes("preload") && as === "script")) sources.push(attr(tag, "href") ?? "");
  }
  let inBuild = 0;
  for (const src of new Set(sources)) {
    let u;
    try { u = new URL(src, res.url); } catch { fail(`${page} loads a script with an unreadable address: ${src}`); continue; }
    if (u.origin !== origin) fail(`${page} loads a script from another site: ${u.href}`);
    else if (!(u.pathname in files)) fail(`${page} loads ${u.pathname}, which is not in the build`);
    else inBuild++;
  }
  const inline = [...html.matchAll(/<script\b[^>]*>/gi)].filter(([tag]) => attr(tag, "src") === null).length;
  console.log(`  ${page}: ${inBuild} of ${new Set(sources).size} scripts in the build; ${inline} inline data scripts (not covered)`);

  // The security policy the browser enforces on this page.
  const csp = res.headers.get("content-security-policy");
  if (!csp) { fail(`${page} has no Content-Security-Policy`); continue; }
  const directive = (name) => (csp.split(";").map((d) => d.trim().split(/\s+/)).find(([n]) => n === name) ?? []).slice(1);
  const scriptSrc = directive("script-src").length ? directive("script-src") : directive("default-src");
  const allowedTokens = new Set(["'self'", "'strict-dynamic'", "'wasm-unsafe-eval'", "'unsafe-inline'", "'none'"]);
  const foreign = scriptSrc.filter((t) => !allowedTokens.has(t) && !t.startsWith("'nonce-"));
  if (foreign.length) fail(`${page}: the security policy lets scripts come from ${foreign.join(" ")}`);
  if (/\/wallet$/.test(page) || new URL(res.url).hostname.startsWith("wallet.")) {
    if (!scriptSrc.some((t) => t.startsWith("'nonce-"))) fail(`${page}: the wallet page's policy has no per-request nonce`);
    if (scriptSrc.includes("'unsafe-inline'") && !scriptSrc.includes("'strict-dynamic'")) fail(`${page}: the wallet page's policy allows any inline script`);
  }
  console.log(`  ${page}: script policy ${scriptSrc.map((t) => (t.startsWith("'nonce-") ? "'nonce-...'" : t)).join(" ")}`);
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
