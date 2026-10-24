/**
 * Builds the extension's pages (popup, side panel, tab, host) and its service worker. The wallet
 * screens come straight from the website's source (apps/web) through the "@" alias; the few
 * Next.js and Node imports they or monero-ts make are swapped for small local stand-ins.
 *
 * Settings come from scripts/build.mjs through MONKSTASH_* environment variables.
 */
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const empty = here("./src/shims/empty.ts");
const env = (k: string, fallback: string) => JSON.stringify(process.env[k] ?? fallback);

export default defineConfig({
  root: here("./src"),
  publicDir: here("./public"),
  base: "/",
  logLevel: "warn",
  resolve: {
    alias: [
      { find: /^@\//, replacement: here("../web/") },
      { find: /^next\/link$/, replacement: here("./src/adapters/Link.tsx") },
      // The shared screens live in apps/web, so their imports would resolve through apps/web's own
      // node_modules. A clean install of only this package (as store reviewers do) has none: resolve
      // them from this package's dependencies instead, which also guarantees one copy of React.
      ...["react-dom", "react", "qrcode", "jsqr", "monero-ts", "@quietmint/wallet-core", "@quietmint/node-client", "@quietmint/polyseed"].map((m) => ({
        find: new RegExp(`^${m.replace("/", "\/")}(/.*)?$`),
        replacement: `${here(`./node_modules/${m}`)}$1`,
      })),
      { find: /^assert$/, replacement: here("./src/shims/assert.ts") },
      ...["fs", "child_process", "path", "http", "https", "os", "crypto", "url", "net", "tls", "stream", "zlib", "util", "web-worker", "socks-proxy-agent"]
        .map((m) => ({ find: new RegExp(`^${m}$`), replacement: empty })),
    ],
  },
  define: {
    __FIREFOX__: JSON.stringify(process.env.MONKSTASH_BROWSER === "firefox"),
    // Test hook only in stagenet builds: any other value (unset, a typo) leaves it out.
    __TEST_BUILD__: JSON.stringify(process.env.MONKSTASH_NETWORK === "stagenet"),
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env.NEXT_PUBLIC_MONERO_NETWORK": env("MONKSTASH_NETWORK", "mainnet"),
    "process.env.NEXT_PUBLIC_API_ORIGIN": env("MONKSTASH_API_ORIGIN", "https://wallet.monkstash.com"),
    "process.env.NEXT_PUBLIC_SITE_URL": env("MONKSTASH_SITE_URL", "https://monkstash.com"),
    "process.env.NEXT_PUBLIC_WALLET_URL": env("MONKSTASH_WALLET_URL", "https://wallet.monkstash.com"),
  },
  oxc: { jsx: { runtime: "automatic" } },
  // Readable, stable class names ("wallet__appBar"): the popup restyles a few shared screens for
  // its small fixed frame (views/popup.css), which needs names that do not change between builds.
  css: {
    modules: {
      generateScopedName: (local: string, file: string) => `${file.split(/[\/]/).pop()!.replace(/\.module\.css.*$/, "")}__${local}`,
    },
  },
  build: {
    outDir: process.env.MONKSTASH_OUT ?? here("./dist/chrome"),
    emptyOutDir: true,
    target: "chrome116",
    // Store reviewers read the code: keep it readable rather than minified.
    minify: false,
    sourcemap: false,
    modulePreload: false,
    chunkSizeWarningLimit: 8000,
    rollupOptions: {
      // The shared screens carry Next.js's "use client" marker, which means nothing here.
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
      input: {
        popup: here("./src/popup.html"),
        sidepanel: here("./src/sidepanel.html"),
        tab: here("./src/tab.html"),
        host: here("./src/host.html"),
        // Firefox has no service worker here: the host page is its background page.
        ...(process.env.MONKSTASH_BROWSER === "firefox" ? {} : { sw: here("./src/sw.ts") }),
      },
      output: {
        entryFileNames: (chunk) => (chunk.name === "sw" ? "sw.js" : "assets/[name]-[hash].js"),
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
