/** Detects whether the last syllable of a word has a Hangul final consonant (batchim) */
export function hasBatchim(word: string): boolean {
  if (!word) return false;
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

/** Particle slot a word would fill in Korean (subject / object / topic / partner). */
type JosaPair = 'subject' | 'object' | 'topic' | 'partner';

/**
 * English copy needs no Korean particles, so this just returns the word.
 * The slot argument is kept so call sites stay stable if Korean copy ever returns.
 * e.g. withJosa('Cloud', 'subject') => 'Cloud'
 */
export function withJosa(word: string, _pair: JosaPair): string {
  return word;
}