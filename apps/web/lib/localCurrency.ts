/**
 * A sensible display currency from the browser's locale (used only for "about €23.80" hints;
 * nothing is sent anywhere). Falls back to USD.
 */
import { MAIN_CURRENCIES } from "./prices";

const EURO = new Set(["AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES"]);
const BY_REGION: Record<string, string> = { GB: "GBP", CH: "CHF", CA: "CAD", AU: "AUD", JP: "JPY", US: "USD" };

export function localCurrency(): (typeof MAIN_CURRENCIES)[number] {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region ?? "";
    const cur = EURO.has(region) ? "EUR" : BY_REGION[region] ?? "USD";
    return (MAIN_CURRENCIES as readonly string[]).includes(cur) ? (cur as (typeof MAIN_CURRENCIES)[number]) : "USD";
  } catch {
    return "USD";
  }
}

export function fiatText(amount: string, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(Number(amount));
  } catch {
    return `${amount} ${currency}`;
  }
}
