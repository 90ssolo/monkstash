// Writes public/build.json after `next build`: the source commit, the public build settings, and a
// SHA-256 for every file a browser can download from this site (the Next.js bundles and public/).
// Two builds of the same commit with the same settings give the same manifest, so anyone can
// rebuild and compare (see scripts/verify-build.mjs at the repository root and the /verify page).
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const web = join(new URL(".", import.meta.url).pathname.replace(/^\/(\w:)/, "$1"), "..");
const OUT = "build.json";

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = {};
const add = (root, urlPrefix) => {
  for (const p of walk(join(web, root))) {
    const url = urlPrefix + relative(join(web, root), p).split(sep).join("/");
    if (url === `/${OUT}`) continue;
    files[url] = createHash("sha256").update(readFileSync(p)).digest("hex");
  }
};
add(".next/static", "/_next/static/");
add("public", "/");

const sorted = Object.fromEntries(Object.entries(files).sort(([a], [b]) => (a < b ? -1 : 1)));
const listing = Object.entries(sorted).map(([url, h]) => `${h}  ${url}\n`).join("");
const manifest = {
  format: "monkstash-build",
  v: 1,
  commit: process.env.BUILD_ID || null,
  settings: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "",
    NEXT_PUBLIC_WALLET_URL: process.env.NEXT_PUBLIC_WALLET_URL ?? "",
    NEXT_PUBLIC_MONERO_NETWORK: process.env.NEXT_PUBLIC_MONERO_NETWORK ?? "",
  },
  // SHA-256 of the file list ("<sha256>  <url>\n" per file, sorted by url): one value to compare.
  fingerprint: createHash("sha256").update(listing).digest("hex"),
  files: sorted,
};
writeFileSync(join(web, "public", OUT), JSON.stringify(manifest, null, 2) + "\n");
console.log(`build manifest: ${Object.keys(sorted).length} files, fingerprint ${manifest.fingerprint}`);
