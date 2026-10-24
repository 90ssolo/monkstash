# @quietmint/polyseed

Reads 16-word Polyseed phrases (Cake Wallet's default, Feather since 2.0) in the browser, using
[tevador/polyseed](https://github.com/tevador/polyseed) compiled to WebAssembly. It is the same
library, at the same commit, that Monero's own wallet code uses (`external/polyseed` in
monero-project/monero, commit in `vendor/polyseed/COMMIT`).

- `vendor/polyseed`: the library, unchanged (Apache-2.0, see its LICENSE and NOTICE).
- `src/glue.c`: decodes a phrase and returns the 32-byte key, the birthday and the encrypted flag,
  following Monero's `polyseed::data::generate_secret_key`.
- `src/library.js`: PBKDF2-HMAC-SHA256 (from `@noble/hashes`) and Unicode normalization for the library.
- `wasm/polyseed.mjs`: the build, committed. `wasm/SHA256SUMS` holds its hash.
- `src/index.ts`: `decodePolyseed()` and `spendKeyHex()`.

The wallet then opens a Polyseed as the 25-word seed of the same key, with a passphrase on an
unencrypted phrase as the seed offset, exactly as Monero does. Nothing here creates seeds.

## Rebuild and check

With Docker, from this folder:

```sh
sh build.sh
```

It uses Emscripten 3.1.74 pinned by image digest and prints the SHA-256 of `wasm/polyseed.mjs`,
which must match `wasm/SHA256SUMS`. Two builds give identical files.

## Tests

`pnpm test` checks the vectors from Monero's functional tests (`tests/functional_tests/wallet.py`):
the phrase `pulse tone truth ...` gives address `455jFA8H...`, and with the passphrase `abc`
gives `49PemLZH...`, birthday 1783033776. An encrypted vector was made with the reference library
itself (`polyseed_crypt` then `polyseed_encode`, with Node's own PBKDF2): with its passphrase it
opens the same wallet as the plain phrase.
