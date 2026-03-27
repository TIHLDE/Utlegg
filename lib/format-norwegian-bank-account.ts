/**
 * Norwegian bank account (kontonummer): 4 + 2 + 5 digits, display with dots.
 */
export function formatNorwegianBankAccountDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6)}`;
}
