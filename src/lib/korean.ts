/** 한글 받침 여부 판단 */
export function hasBatchim(word: string): boolean {
  if (!word) return false;
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

type JosaPair = '이/가' | '을/를' | '은/는' | '와/과';

/** 받침에 맞는 조사를 붙여 준다. 예) withJosa('구름', '이/가') => '구름이' */
export function withJosa(word: string, pair: JosaPair): string {
  const [withFinal, withoutFinal] = pair.split('/');
  return word + (hasBatchim(word) ? withFinal : withoutFinal);
}
