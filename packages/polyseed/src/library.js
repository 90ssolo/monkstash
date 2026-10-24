// Emscripten JavaScript library for glue.c: PBKDF2 and Unicode normalization. The module is
// created with `pbkdf2` (PBKDF2-HMAC-SHA256 from @noble/hashes) passed in by src/index.ts.
addToLibrary({
  js_pbkdf2_sha256: (pw, pwlen, salt, saltlen, iterations, key, keylen) => {
    const out = Module.pbkdf2(HEAPU8.slice(pw, pw + pwlen), HEAPU8.slice(salt, salt + saltlen), iterations >>> 0, keylen);
    HEAPU8.set(out, key);
    out.fill(0);
  },
  js_normalize: (str, out, outSize, compat) => {
    const text = UTF8ToString(str).normalize(compat ? "NFKD" : "NFC");
    const len = lengthBytesUTF8(text);
    if (len >= outSize) return outSize;
    stringToUTF8(text, out, outSize);
    return len;
  },
});
