/** Emscripten module factory for glue.c (see build.sh). */
declare const createPolyseed: (options: object) => Promise<unknown>;
export default createPolyseed;
