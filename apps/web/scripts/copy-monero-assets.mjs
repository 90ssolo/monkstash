// Copies the monero-ts Web Worker bundle into public/ so the browser can load it
// from our own origin (no CDN). Runs before dev and build.
import { createRequire } from "node:module";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const dist = join(dirname(require.resolve("monero-ts/package.json")), "dist");
const out = join(dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..", "public", "monero");
mkdirSync(out, { recursive: true });
copyFileSync(join(dist, "monero.worker.js"), join(out, "monero.worker.js"));
console.log("monero-ts worker copied to", out);
