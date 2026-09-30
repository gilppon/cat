/** base './' 배포(서브패스)에서도 깨지지 않는 정적 에셋 경로 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || './';
  const clean = path.replace(/^\/+/, '');
  return base.endsWith('/') ? `${base}${clean}` : `${base}/${clean}`;
}
