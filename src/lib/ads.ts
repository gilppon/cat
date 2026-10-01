/* Unified portal ad adapter (Poki / CrazyGames / automatic fallback to mock ads)
 * - ?poki or a poki domain → Poki SDK v2
 * - ?crazy or a crazygames domain → CrazyGames SDK v3
 * - anything else → AdOverlay mock ads (webindy / local testing)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    PokiSDK?: any;
    CrazyGames?: any;
  }
}

export type AdKind = 'commercial' | 'rewarded';
type AdUI = (kind: AdKind, done: (ok: boolean) => void) => void;

const POKI_URL = 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js';
const CRAZY_URL = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';

let adUI: AdUI | null = null;
let provider: 'poki' | 'crazy' | null = null;
let ready = false;
let initPromise: Promise<void> | null = null;
let gameplayActive = false;
let gameplayNotified = false;

export function registerAdUI(fn: AdUI | null) {
  adUI = fn;
}

function env(): 'poki' | 'crazy' | null {
  try {
    const host = window.location.hostname;
    const q = window.location.search;
    if (/poki(-gdn)?\.com$/.test(host) || q.includes('poki')) return 'poki';
    if (/(^|\.)crazygames\.com$/.test(host) || q.includes('crazy')) return 'crazy';
  } catch {
    /* ignore */
  }
  return null;
}

function loadScript(src: string, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    const timer = window.setTimeout(() => reject(new Error('ads timeout')), timeout);
    s.src = src;
    s.async = true;
    s.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    s.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error('ads load error'));
    };
    document.head.appendChild(s);
  });
}

async function mockAd(kind: AdKind): Promise<boolean> {
  if (!adUI) return false;
  return new Promise<boolean>((resolve) => adUI!(kind, (ok) => resolve(ok)));
}

function notifyGameplayStart() {
  if (!ready || !gameplayActive || gameplayNotified) return;
  try {
    if (provider === 'poki') window.PokiSDK?.gameplayStart?.();
    else if (provider === 'crazy') window.CrazyGames?.SDK?.game?.gameplayStart();
    else return;
    gameplayNotified = true;
  } catch {
    /* ignore */
  }
}

function notifyGameplayStop() {
  if (!ready || !gameplayNotified) return;
  try {
    if (provider === 'poki') window.PokiSDK?.gameplayStop?.();
    else if (provider === 'crazy') window.CrazyGames?.SDK?.game?.gameplayStop();
  } catch {
    /* ignore */
  } finally {
    gameplayNotified = false;
  }
}

export const Ads = {
  get provider() {
    return provider;
  },

  init(): Promise<void> {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const e = env();
      try {
        if (e === 'poki') {
          await loadScript(POKI_URL);
          await window.PokiSDK?.init();
          provider = 'poki';
        } else if (e === 'crazy') {
          await loadScript(CRAZY_URL);
          await window.CrazyGames?.SDK?.init();
          try {
            window.CrazyGames?.SDK?.game?.loadingStart();
          } catch {
            /* ignore */
          }
          provider = 'crazy';
        }
      } catch {
        provider = null;
      }
      ready = true;
      this.loadingFinished();
      notifyGameplayStart();
    })();
    return initPromise;
  },

  loadingFinished() {
    if (!ready) return;
    try {
      if (provider === 'poki') window.PokiSDK?.gameLoadingFinished?.();
      else if (provider === 'crazy') window.CrazyGames?.SDK?.game?.loadingStop();
    } catch {
      /* ignore */
    }
  },

  gameplayStart() {
    gameplayActive = true;
    notifyGameplayStart();
  },

  gameplayStop() {
    gameplayActive = false;
    notifyGameplayStop();
  },

  /** Rewarded ad. Returns true once the view is completed */
  async rewardedBreak(): Promise<boolean> {
    if (provider === 'poki' && ready) {
      try {
        return Boolean(await window.PokiSDK.rewardedBreak());
      } catch {
        return false;
      }
    }
    if (provider === 'crazy' && ready) {
      return new Promise<boolean>((resolve) => {
        let settled = false;
        const timeout = window.setTimeout(() => finish(false), 60_000);
        const finish = (ok: boolean) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          resolve(ok);
        };
        try {
          window.CrazyGames?.SDK?.ad?.requestAd('rewarded', {
            adStarted: () => {},
            adFinished: () => finish(true),
            adError: () => finish(false),
          });
        } catch {
          finish(false);
        }
      });
    }
    return mockAd('rewarded');
  },
};
