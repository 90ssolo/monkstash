import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "../src/csv";

describe("csv", () => {
  it("quotes commas, quotes and line breaks", () => {
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("two\nlines")).toBe('"two\nlines"');
    expect(csvCell(" padded ")).toBe('" padded "');
    expect(csvCell(null)).toBe("");
    expect(csvCell(12_345_678_901_234n)).toBe("12345678901234");
  });
  it("defuses spreadsheet formulas but keeps numbers numeric", () => {
    expect(csvCell("=HYPERLINK(\"http://evil\")")).toBe('"\'=HYPERLINK(""http://evil"")"');
    expect(csvCell("+1+1")).toBe("'+1+1");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(csvCell("-2+3")).toBe("'-2+3");
    expect(csvCell("-0.5")).toBe("-0.5");
    expect(csvCell(-3)).toBe("-3");
  });
  it("builds a document with CRLF line ends", () => {
    expect(toCsv(["a", "b"], [[1, "x,y"], [null, "=1"]])).toBe('a,b\r\n1,"x,y"\r\n,\'=1\r\n');
  });
});
