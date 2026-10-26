/** Parses a frequency typed by the user. Accepts a comma or a dot as decimal separator; NaN when empty or not a number. */
export function parseHz(text: string): number {
  const normalised = text.trim().replace(',', '.');
  return normalised === '' ? NaN : Number(normalised);
}

/** Frequencies are always shown with two decimals and a dot, whatever the browser locale. */
export function formatHz(hz: number): string {
  return hz.toFixed(2);
}
