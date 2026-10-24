#!/bin/sh
# Builds wasm/polyseed.mjs (WebAssembly embedded) from vendor/polyseed and src/ with a pinned
# Emscripten. Run from this folder, on a machine with Docker:
#
#   sh build.sh            build, then print the SHA-256 to compare with wasm/SHA256SUMS
#
# The output is committed, so the website and extension builds need no C toolchain. Anyone can
# rebuild it with this script and check that the hash matches.
set -eu
# Emscripten 3.1.74, pinned by digest.
IMAGE="emscripten/emsdk:3.1.74@sha256:af45409f3199d88db4b1b03af0098532c8fb33a375ac257463eeb0a622870d06"
docker run --rm -u "$(id -u):$(id -g)" -v "$PWD":/src -w /src "$IMAGE" emcc \
  -O2 -std=c11 -DPOLYSEED_STATIC \
  -ffile-prefix-map=/src=. \
  -Ivendor/polyseed/include \
  vendor/polyseed/src/dependency.c vendor/polyseed/src/features.c vendor/polyseed/src/gf.c \
  vendor/polyseed/src/lang.c vendor/polyseed/src/lang_cs.c vendor/polyseed/src/lang_en.c \
  vendor/polyseed/src/lang_es.c vendor/polyseed/src/lang_fr.c vendor/polyseed/src/lang_it.c \
  vendor/polyseed/src/lang_jp.c vendor/polyseed/src/lang_ko.c vendor/polyseed/src/lang_pt.c \
  vendor/polyseed/src/lang_zh_s.c vendor/polyseed/src/lang_zh_t.c vendor/polyseed/src/polyseed.c \
  vendor/polyseed/src/storage.c src/glue.c \
  --js-library src/library.js \
  -sMODULARIZE=1 -sEXPORT_ES6=1 -sEXPORT_NAME=createPolyseed -sSINGLE_FILE=1 \
  -sENVIRONMENT=web,worker -sFILESYSTEM=0 \
  -sINITIAL_MEMORY=2097152 -sSTACK_SIZE=262144 -sALLOW_MEMORY_GROWTH=0 \
  -sINCOMING_MODULE_JS_API=pbkdf2 \
  -sEXPORTED_FUNCTIONS=_ps_decode,_malloc,_free \
  -sEXPORTED_RUNTIME_METHODS=HEAPU8,stringToUTF8,lengthBytesUTF8 \
  -o wasm/polyseed.mjs
# The library's notice travels with the compiled code (minifiers keep /*! comments).
{
  printf '/*! @license Polyseed (https://github.com/tevador/polyseed), Copyright (c) 2020-2026 tevador.
'
  printf ' * Apache License 2.0. Wordlists derived from BIP-39 (MIT). See packages/polyseed/vendor/polyseed
'
  printf ' * (LICENSE and NOTICE) in https://github.com/90ssolo/monkstash. Built by packages/polyseed/build.sh. */
'
  cat wasm/polyseed.mjs
} > wasm/polyseed.tmp && mv wasm/polyseed.tmp wasm/polyseed.mjs
sha256sum wasm/polyseed.mjs
