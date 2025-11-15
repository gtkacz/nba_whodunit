/**
 * Normalizes a string by removing accents/diacritics
 * This allows searching "Jokic" to match "Jokić"
 * Handles special characters like Đ/đ which are single characters, not base + diacritic
 * @param str - The string to normalize
 * @returns The normalized string with accents removed
 */
export function normalizeString(str: string): string {
  if (!str) return ''
  
  // First, handle special single-character cases that aren't base + diacritic
  // These are single Unicode characters that need explicit mapping
  const specialCharMap: Record<string, string> = {
    // Croatian/Serbian
    'Đ': 'D', 'đ': 'd',
    // Polish
    'Ł': 'L', 'ł': 'l',
    // Danish/Norwegian
    'Ø': 'O', 'ø': 'o',
    'Å': 'A', 'å': 'a',
    'Æ': 'AE', 'æ': 'ae',
    // Icelandic
    'Þ': 'Th', 'þ': 'th',
    'Ð': 'D', 'ð': 'd',
    // Other common accented characters that might not decompose properly
    'Č': 'C', 'č': 'c',
    'Ć': 'C', 'ć': 'c',
    'Š': 'S', 'š': 's',
    'Ž': 'Z', 'ž': 'z',
  }
  
  let normalized = str
  // Replace special characters
  for (const [special, replacement] of Object.entries(specialCharMap)) {
    normalized = normalized.replace(new RegExp(special, 'g'), replacement)
  }
  
  // Normalize to NFD (Normalized Form Decomposed) which separates base characters from diacritics
  // Then remove combining diacritical marks (Unicode ranges for various diacritics)
  // This handles most accented characters like é, á, í, ó, ú, etc.
  normalized = normalized
    .normalize('NFD')
    // Remove combining diacritical marks (multiple Unicode ranges)
    .replace(/[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g, '')
    .normalize('NFC')
  
  return normalized
}

