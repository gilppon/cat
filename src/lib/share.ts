export async function makeRestoreShareUrl(areaId: string): Promise<string> {
  const params = { type: 'shelter_restore', area: areaId };
  try {
    const pokiUrl = await window.PokiSDK?.shareableURL?.(params);
    if (pokiUrl) return pokiUrl;
  } catch {
    // A share link should still work when the Poki SDK is unavailable.
  }

  const url = new URL(window.location.href);
  url.searchParams.set('restore', areaId);
  return url.toString();
}

export function getRestoreInvite(): string | null {
  const pokiValue = window.PokiSDK?.getURLParam?.('area');
  const query = new URLSearchParams(window.location.search);
  return pokiValue || query.get('restore') || query.get('gdarea');
}
