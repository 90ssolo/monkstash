import { describe, expect, it } from "vitest";
import { normalizeNodeUri, NodeUriError } from "../src/node";

describe("own node address", () => {
  it("accepts https and returns the origin", () => {
    expect(normalizeNodeUri("https://node.example.com:18089")).toBe("https://node.example.com:18089");
    expect(normalizeNodeUri("  https://node.example.com:18089/  ")).toBe("https://node.example.com:18089");
  });
  it("assumes https when no scheme is given", () => {
    expect(normalizeNodeUri("node.example.com:18089")).toBe("https://node.example.com:18089");
  });
  it("allows plain http only for this computer or .onion", () => {
    expect(normalizeNodeUri("http://127.0.0.1:18081")).toBe("http://127.0.0.1:18081");
    expect(normalizeNodeUri("http://localhost:18081")).toBe("http://localhost:18081");
    expect(normalizeNodeUri("http://[::1]:18081")).toBe("http://[::1]:18081");
    expect(normalizeNodeUri("http://abcdefghijklmnop.onion:18089")).toBe("http://abcdefghijklmnop.onion:18089");
    expect(() => normalizeNodeUri("http://node.example.com:18089")).toThrowError(NodeUriError);
    expect(() => normalizeNodeUri("http://192.168.1.10:18089")).toThrowError(NodeUriError);
  });
  it("rejects credentials, paths, queries and odd schemes", () => {
    expect(() => normalizeNodeUri("https://user:pass@node.example.com")).toThrowError(/login/);
    expect(() => normalizeNodeUri("https://node.example.com/json_rpc")).toThrowError(NodeUriError);
    expect(() => normalizeNodeUri("https://node.example.com/?x=1")).toThrowError(NodeUriError);
    expect(() => normalizeNodeUri("ftp://node.example.com")).toThrowError(NodeUriError);
    expect(() => normalizeNodeUri("")).toThrowError(NodeUriError);
    expect(() => normalizeNodeUri("not a url at all")).toThrowError(NodeUriError);
  });
});
