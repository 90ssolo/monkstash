/*
 * MonkStash wrapper around tevador's Polyseed reference library (vendor/polyseed, the commit
 * Monero itself uses). It only reads phrases: it turns a 16-word Polyseed into the 32-byte key
 * the library derives from it, exactly as Monero's own wallet code does (see
 * src/mnemonics/polyseed/polyseed.cpp in monero-project/monero, data::generate_secret_key):
 *
 *   - an encrypted seed is first decrypted with the passphrase (polyseed_crypt);
 *   - the key comes from polyseed_keygen for the Monero coin.
 *
 * A passphrase on a seed that is not encrypted is a "seed offset", which the wallet engine
 * (monero-ts, Monero's wallet2) applies itself, as it does for 25-word seeds.
 *
 * PBKDF2-HMAC-SHA256 and Unicode normalization come from JavaScript (library.js): the audited
 * @noble/hashes and the browser's String.prototype.normalize. Nothing here creates seeds, so no
 * random numbers are needed.
 */
#include <stdint.h>
#include <string.h>
#include "polyseed.h"

/* From library.js. */
extern void js_pbkdf2_sha256(const uint8_t* pw, size_t pwlen, const uint8_t* salt, size_t saltlen,
    uint32_t iterations, uint8_t* key, size_t keylen);
/* Writes the normalized string (NUL-terminated) and returns its length in bytes, or POLYSEED_STR_SIZE when it does not fit. */
extern size_t js_normalize(const char* str, char* out, size_t out_size, int compat_decompose);

static void pbkdf2(const uint8_t* pw, size_t pwlen, const uint8_t* salt, size_t saltlen,
    uint64_t iterations, uint8_t* key, size_t keylen) {
    js_pbkdf2_sha256(pw, pwlen, salt, saltlen, (uint32_t)iterations, key, keylen);
}

static size_t nfc(const char* str, polyseed_str norm) {
    return js_normalize(str, norm, POLYSEED_STR_SIZE, 0);
}

static size_t nfkd(const char* str, polyseed_str norm) {
    return js_normalize(str, norm, POLYSEED_STR_SIZE, 1);
}

static void wipe(void* const ptr, const size_t len) {
    volatile uint8_t* p = (volatile uint8_t*)ptr;
    for (size_t i = 0; i < len; ++i) p[i] = 0;
}

/* Never called: decoding needs no randomness. Fails loudly if that ever changes. */
static void no_random(void* result, size_t n) {
    wipe(result, n);
    __builtin_trap();
}

static int injected = 0;

/* Longest input accepted, in bytes; well inside POLYSEED_STR_SIZE after normalization. */
#define MAX_INPUT 400

/*
 * Decodes `phrase` (any Polyseed language) for Monero. `passphrase` may be empty.
 * On success writes the 32-byte key to `key_out`, the birthday (unix seconds) to `birthday_out`
 * and whether the seed was encrypted to `encrypted_out`, and returns 0. Otherwise returns a
 * polyseed_status, or 100 when an encrypted seed has no passphrase, or 101 for input too long.
 */
int ps_decode(const char* phrase, const char* passphrase, uint8_t* key_out,
    uint64_t* birthday_out, int* encrypted_out) {
    if (!injected) {
        polyseed_dependency deps = { 0 };
        deps.randbytes = &no_random;
        deps.pbkdf2_sha256 = &pbkdf2;
        deps.memzero = &wipe;
        deps.u8_nfc = &nfc;
        deps.u8_nfkd = &nfkd;
        polyseed_inject(&deps);
        injected = 1;
    }
    if (strlen(phrase) > MAX_INPUT || strlen(passphrase) > MAX_INPUT) return 101;

    const polyseed_lang* lang = NULL;
    polyseed_data* seed = NULL;
    polyseed_status status = polyseed_decode(phrase, POLYSEED_MONERO, &lang, &seed);
    if (status != POLYSEED_OK) return (int)status;

    int encrypted = polyseed_is_encrypted(seed);
    if (encrypted) {
        if (passphrase[0] == '\0') {
            polyseed_free(seed);
            return 100;
        }
        polyseed_crypt(seed, passphrase);
    }
    polyseed_keygen(seed, POLYSEED_MONERO, 32, key_out);
    *birthday_out = polyseed_get_birthday(seed);
    *encrypted_out = encrypted;
    polyseed_free(seed);
    return 0;
}
