/**
 * Checks an installed copy of the extension against a build.json you trust (for example one from
 * your own rebuild of the public commit: `node scripts/build.mjs`, then dist/chrome/build.json).
 *
 *   node scripts/verify-extension.mjs <installed folder or .xpi> <trusted build.json>
 *
 * Where installed copies live:
 *   Chrome   %LOCALAPPDATA%\Google\Chrome\User Data\Default\Extensions\<extension id>\<version>_0
 *            (macOS: ~/Library/Application Support/Google/Chrome/Default/Extensions/..., Linux: ~/.config/google-chrome/Default/Extensions/...)
 *   Firefox  <profile folder>\extensions\extension@monkstash.com.xpi  (about:support shows the profile folder)
 *
 * The stores add files of their own, which are not part of the build and are skipped: Chrome's
 * _metadata folder (its signature data) and Firefox's META-INF folder (the add-on signature).
 * Exit code 0 when every file matches, 1 otherwise.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { inflateRawSync } from "node:zlib";

const [installed, trusted] = process.argv.slice(2);
if (!installed || !trusted) {
  console.error("Usage: node scripts/verify-extension.mjs <installed folder or .xpi> <trusted build.json>");
  process.exit(2);
}

const STORE_FILES = /^\/(_metadata|META-INF)\//;
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

/** Files of an unpacked folder as { "/path": Buffer }. */
function readFolder(dir) {
  const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
  return Object.fromEntries(walk(dir).map((p) => ["/" + relative(dir, p).split(sep).join("/"), readFileSync(p)]));
}

/** Files of a .xpi (a zip: stored or deflated entries, read from the central directory). */
function readZip(file) {
  const z = readFileSync(file);
  let eocd = z.length - 22;
  while (eocd >= 0 && z.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error("Not a zip file.");
  const count = z.readUInt16LE(eocd + 10);
  let at = z.readUInt32LE(eocd + 16);
  const out = {};
  for (let i = 0; i < count; i++) {
    if (z.readUInt32LE(at) !== 0x02014b50) throw new Error("Damaged zip directory.");
    const method = z.readUInt16LE(at + 10);
    const size = z.readUInt32LE(at + 20);
    const nameLen = z.readUInt16LE(at + 28);
    const extraLen = z.readUInt16LE(at + 30);
    const commentLen = z.readUInt16LE(at + 32);
    const local = z.readUInt32LE(at + 42);
    const name = z.toString("utf8", at + 46, at + 46 + nameLen);
    at += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith("/")) continue;
    const dataAt = local + 30 + z.readUInt16LE(local + 26) + z.readUInt16LE(local + 28);
    const raw = z.subarray(dataAt, dataAt + size);
    if (method !== 0 && method !== 8) throw new Error(`Unsupported compression in ${name}.`);
    out[`/${name}`] = method === 0 ? Buffer.from(raw) : inflateRawSync(raw);
  }
  return out;
}

const files = installed.toLowerCase().endsWith(".xpi") ? readZip(installed) : readFolder(installed);
const expected = JSON.parse(readFileSync(trusted, "utf8"));
if (expected.format !== "monkstash-extension-build") throw new Error("That is not an extension build.json.");

const problems = [];
for (const [path, hash] of Object.entries(expected.files)) {
  const got = files[path];
  if (!got) problems.push(`missing   ${path}`);
  else if (sha256(got) !== hash) problems.push(`different ${path}`);
}
for (const path of Object.keys(files)) {
  if (path === "/build.json" || STORE_FILES.test(path)) continue;
  if (!(path in expected.files)) problems.push(`extra     ${path}`);
}

console.log(`Trusted build: ${expected.settings?.browser ?? "?"} ${expected.version}, ${expected.settings?.network}, commit ${expected.commit ?? "(not recorded)"}`);
console.log(`Fingerprint:   ${expected.fingerprint}`);
if (problems.length) {
  console.log(`\nThe installed copy does NOT match (${problems.length} problem${problems.length === 1 ? "" : "s"}):`);
  for (const p of problems) console.log(`  ${p}`);
  process.exit(1);
}
console.log(`\nAll ${Object.keys(expected.files).length} files match. The installed copy is this build.`);
