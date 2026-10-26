/**
 * Builds the extension into dist/chrome or dist/firefox: the pages (vite.config.ts), the wallet
 * engine's worker file, the manifest and build.json.
 *
 *   node scripts/build.mjs                    Chrome release: mainnet, relay at wallet.monkstash.com
 *   node scripts/build.mjs --firefox          Firefox release
 *   add --dev for a test build: stagenet through a local dev server (localhost:3210)
 *
 * Chrome runs the wallet in an offscreen document started by the service worker; Firefox has no
 * offscreen documents and runs the same host page as its (event) background page.
 */
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
// The bundle's region comments name files relative to the working folder: build from this package's
// folder wherever the script is started, so every machine writes the same bytes.
process.chdir(root);
const dev = process.argv.includes("--dev");
const firefox = process.argv.includes("--firefox");
const browser = firefox ? "firefox" : "chrome";
const out = join(root, "dist", browser);
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

const target = dev
  ? { network: "stagenet", api: "http://localhost:3210", site: "http://localhost:3210", wallet: "http://localhost:3210" }
  : { network: "mainnet", api: "https://wallet.monkstash.com", site: "https://monkstash.com", wallet: "https://wallet.monkstash.com" };
process.env.MONKSTASH_NETWORK = target.network;
process.env.MONKSTASH_API_ORIGIN = target.api;
process.env.MONKSTASH_SITE_URL = target.site;
process.env.MONKSTASH_WALLET_URL = target.wallet;
process.env.MONKSTASH_BROWSER = browser;
process.env.MONKSTASH_OUT = out;

await build({ configFile: join(root, "vite.config.ts") });

// The engine runs in a Web Worker loaded from a file inside the extension (no remote code).
const require = createRequire(join(root, "package.json"));
const moneroDist = dirname(require.resolve("monero-ts/package.json"));
mkdirSync(join(out, "monero"), { recursive: true });
// The engine's worker, without its pointer to a source map that is not shipped.
writeFileSync(join(out, "monero/monero.worker.js"), readFileSync(join(moneroDist, "dist/monero.worker.js"), "utf8").replace(/\n?\/\/# sourceMappingURL=\S+\s*$/, "\n"));

const icons = { 16: "icons/icon-16.png", 32: "icons/icon-32.png", 48: "icons/icon-48.png", 128: "icons/icon-128.png" };
const common = {
  manifest_version: 3,
  name: dev ? "MonkStash (stagenet test build)" : "MonkStash: Monero Wallet",
  short_name: "MonkStash",
  version: pkg.version,
  description: "A non-custodial Monero wallet. Your keys are made and kept on this device, encrypted with your password.",
  icons,
  action: { default_popup: "popup.html", default_title: "MonkStash", default_icon: icons },
};
const perBrowser = firefox
  ? {
      // Event page: Firefox suspends it about 30 s after the last extension event; open views send a
      // heartbeat (views/remote.ts) and the host locks itself shortly after the last view closes.
      background: { page: "host.html" },
      sidebar_action: { default_panel: "sidepanel.html", default_title: "MonkStash", default_icon: icons, open_at_install: false },
      // contextMenus: the right-click "Pay with MonkStash" item (no access to pages).
      permissions: ["storage", "unlimitedStorage", "idle", "contextMenus"],
      browser_specific_settings: {
        gecko: {
          id: "extension@monkstash.com",
          strict_min_version: "140.0",
          // Firefox's built-in consent counts anything handled outside the browser. The transactions you
          // send pass through the relay to the Monero network ("transactions" is in Firefox's
          // financialAndPaymentInfo category), so that is declared; nothing else leaves the browser.
          data_collection_permissions: { required: ["financialAndPaymentInfo"] },
        },
      },
    }
  : {
      minimum_chrome_version: "116",
      side_panel: { default_path: "sidepanel.html" },
      background: { service_worker: "sw.js", type: "module" },
      // contextMenus: the right-click "Pay with MonkStash" item (no access to pages).
      permissions: ["storage", "unlimitedStorage", "idle", "offscreen", "sidePanel", "contextMenus"],
    };
const manifest = {
  ...common,
  ...perBrowser,
  // The wallet's relay only (or the local dev server for test builds). No access to websites.
  // (Match patterns carry no port: the dev build's "http://localhost/*" covers the dev server.)
  host_permissions: [`${new URL(target.api).origin.replace(/:\d+$/, "")}/*`],
  // Your own node, asked for when you save it in Settings (only that one host is granted).
  optional_host_permissions: ["https://*/*", "http://localhost/*", "http://127.0.0.1/*", "http://[::1]/*"],
  // Extension pages: own scripts and the WebAssembly engine only; connections to our API and to
  // a node the user added (https, or http on this computer); no frames, forms, plugins or base tags.
  content_security_policy: {
    extension_pages: [
      "default-src 'self'",
      "script-src 'self' 'wasm-unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      `connect-src 'self' https: http://localhost:* http://127.0.0.1:* http://[::1]:*${dev ? " ws: http:" : ""}`,
      "worker-src 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'none'",
      "form-action 'none'",
    ].join("; "),
  },
};
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
// A release must never carry the stagenet test hook (see host/main.ts).
if (!dev) {
  const leaked = readdirSync(join(out, "assets")).filter((f) => f.endsWith(".js") && readFileSync(join(out, "assets", f), "utf8").includes("__monkstash ="));
  if (leaked.length) throw new Error(`Release build contains the test hook: ${leaked.join(", ")}`);
}

// build.json: a SHA-256 for every file in the package and one fingerprint over the list, in the
// website's format (apps/web/scripts/build-manifest.mjs). Settings shows the fingerprint; two
// builds of the same commit give the same one, and an installed copy can be checked against it
// (the stores add a _metadata folder of their own, which is not part of the build).
const BUILD = "build.json";
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const files = Object.fromEntries(
  walk(out)
    .map((p) => ["/" + relative(out, p).split(sep).join("/"), p])
    .filter(([url]) => url !== `/${BUILD}`)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([url, p]) => [url, createHash("sha256").update(readFileSync(p)).digest("hex")]),
);
const listing = Object.entries(files).map(([url, h]) => `${h}  ${url}\n`).join("");
const buildInfo = {
  format: "monkstash-extension-build",
  v: 1,
  commit: process.env.BUILD_COMMIT || null,
  version: manifest.version,
  settings: { browser, network: target.network, api: target.api },
  fingerprint: createHash("sha256").update(listing).digest("hex"),
  files,
};
writeFileSync(join(out, BUILD), JSON.stringify(buildInfo, null, 2) + "\n");
console.log(`Built ${manifest.name} ${manifest.version} for ${browser} (${target.network}) into dist/${browser}: ${Object.keys(files).length} files, fingerprint ${buildInfo.fingerprint}`);
