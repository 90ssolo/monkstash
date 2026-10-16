/**
 * CSV for exports (sales, payment requests, wallet history). RFC 4180 quoting, plus protection
 * against spreadsheet formula injection: a cell that starts with = + - @ (or a tab or carriage
 * return) could run as a formula in Excel or LibreOffice, so it gets a leading apostrophe.
 * Numbers that are plain amounts (like -0.5) are left alone so they stay numeric.
 */
export type CsvCell = string | number | bigint | boolean | null | undefined;

const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/;

export function csvCell(value: CsvCell): string {
  if (value === null || value === undefined) return "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s) && !PLAIN_NUMBER.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
}

/** A whole CSV document. Lines end in CRLF, as spreadsheets expect. */
export function toCsv(header: string[], rows: CsvCell[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
