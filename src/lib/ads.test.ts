import { afterEach, describe, expect, it, vi } from 'vitest';

function installCrazySdk(outcome: 'finished' | 'error') {
  const events: string[] = [];
  const requestAd = vi.fn(
    (_kind: string, callbacks: { adStarted: () => void; adFinished: () => void; adError: () => void }) => {
      if (outcome === 'finished') callbacks.adFinished();
      else callbacks.adError();
    },
  );
  const sdk = {
    init: vi.fn(async () => {}),
    game: {
      loadingStart: () => events.push('loadingStart'),
      loadingStop: () => events.push('loadingStop'),
      gameplayStart: () => events.push('gameplayStart'),
      gameplayStop: () => events.push('gameplayStop'),
    },
    ad: { requestAd },
  };

  vi.stubGlobal('window', {
    location: { hostname: 'www.crazygames.com', search: '' },
    CrazyGames: { SDK: sdk },
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
  });
  vi.stubGlobal('document', {
    createElement: () => ({
      set src(_value: string) {},
      async: false,
      onload: null as null | (() => void),
      onerror: null as null | (() => void),
    }),
    head: {
      appendChild: (script: { onload: (() => void) | null }) => script.onload?.(),
    },
  });

  return { events, requestAd };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('Ads CrazyGames SDK adapter', () => {
  it('replays an early gameplay start after SDK init and rewards only on adFinished', async () => {
    const { events, requestAd } = installCrazySdk('finished');
    const { Ads } = await import('./ads');

    Ads.gameplayStart();
    await Ads.init();

    expect(events).toEqual(['loadingStart', 'loadingStop', 'gameplayStart']);
    expect(await Ads.rewardedBreak()).toBe(true);
    expect(requestAd).toHaveBeenCalledWith('rewarded', expect.any(Object));
  });

  it('does not reward when CrazyGames reports an ad error', async () => {
    installCrazySdk('error');
    const { Ads } = await import('./ads');
    await Ads.init();

    expect(await Ads.rewardedBreak()).toBe(false);
  });
});
