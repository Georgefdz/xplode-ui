export function formatCurrency(value: number, locale = "es-MX"): string {
  return `$${value.toLocaleString(locale)}`;
}
