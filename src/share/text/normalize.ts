/**
 * Normalizes text for matching, so that different ways of writing the same
 * text match:
 * - full-width and half-width letters, digits and katakana (NFKC):
 *   "ＡＢＣ" → "ABC", "ﾄｳｷｮｳ" → "トウキョウ"
 * - upper and lower case: "Tokyo" → "tokyo"
 * - hiragana and katakana: "とうきょう" → "トウキョウ"
 */
export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ぁ-ゖ]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0x60)
    );
}

const collator = new Intl.Collator("ja", { numeric: true });

/**
 * Compares two strings in Japanese order: numbers by value ("2" < "10"),
 * letters alphabetically with case next to each other, and hiragana and
 * katakana together in kana order.
 */
export function compareText(a: string, b: string): number {
  return collator.compare(a, b);
}

/**
 * Reads a number typed by the user. Accepts full-width digits and thousands
 * separators ("１,０００" → 1000). Returns null if it is not a number.
 */
export function parseNumberText(text: string): number | null {
  const t = text.normalize("NFKC").trim().replace(/[ー−]/g, "-");
  const plain = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t) ? t.replace(/,/g, "") : t;

  return /^-?\d+(\.\d+)?$/.test(plain) ? Number(plain) : null;
}
