/** The few parts of Node's assert that monero-ts calls at runtime (assert, equal, deepEqual). */
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) throw new Error(message || "Assertion failed");
}
assert.ok = assert;
assert.equal = (a: unknown, b: unknown, message?: string) => {
  // eslint-disable-next-line eqeqeq
  if (a != b) throw new Error(message || `Expected ${String(a)} to equal ${String(b)}`);
};
assert.deepEqual = (a: unknown, b: unknown, message?: string) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(message || "Expected values to be deeply equal");
};
export default assert;
