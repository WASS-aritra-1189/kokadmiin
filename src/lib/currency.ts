const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AED: "د.إ",
};

export function currencySymbol(currency?: string | null): string {
  return CURRENCY_SYMBOLS[(currency ?? "INR").toUpperCase()] ?? currency ?? "₹";
}

export function formatPrice(amount: number | string, currency?: string | null): string {
  return `${currencySymbol(currency)}${Number(amount)}`;
}
