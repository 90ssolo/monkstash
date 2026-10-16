// Bundles the server (and the shared wallet-core sources) into one file. monero-ts and qrcode
// stay external: they are installed next to it, so their WebAssembly and assets load normally.
export default {
  input: "src/server.ts",
  platform: "node",
  external: ["monero-ts", "qrcode", /^node:/],
  output: { file: "dist/server.mjs", format: "esm", sourcemap: true },
};
