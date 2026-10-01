import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gameStore, tutorialStep } from './GameStore';
import { ITEM_DATABASE } from './MergeManager';
import { SaveManager } from './SaveManager';

describe('GameStore progression rewards', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T12:00:00'));
    vi.stubGlobal('window', {
      AudioContext: undefined,
      webkitAudioContext: undefined,
      setTimeout: globalThis.setTimeout,
    });
    gameStore.reset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('tutorial step follows merge, delivery, restoration, then saved completion', () => {
    const data = SaveManager.createDefault();
    expect(tutorialStep(data)).toBe(0);

    data.stats.mergesDone = 1;
    expect(tutorialStep(data)).toBe(1);

    data.stats.ordersCompleted = 1;
    expect(tutorialStep(data)).toBe(2);

    data.completedTasks.push('yard_weeds');
    expect(tutorialStep(data)).toBe(3);

    data.tutorialSeen = true;
    expect(tutorialStep(data)).toBe(3);
  });

  it('daily rewards advance once per day and wrap after day seven', () => {
    expect(gameStore.dailyStatus()).toMatchObject({ available: true, streakDay: 1, coins: 20, energy: 5 });
    expect(gameStore.claimDaily()).toBe(true);
    expect(gameStore.claimDaily()).toBe(false);

    vi.setSystemTime(new Date('2026-10-02T12:00:00'));
    expect(gameStore.dailyStatus()).toMatchObject({ available: true, streakDay: 2, coins: 30, energy: 5 });

    gameStore.live.dailyStreak = 7;
    gameStore.live.lastDaily = Date.now() - 24 * 60 * 60 * 1000;
    expect(gameStore.dailyStatus()).toMatchObject({ available: true, streakDay: 1 });

    gameStore.live.lastDaily -= 24 * 60 * 60 * 1000;
    expect(gameStore.dailyStatus()).toMatchObject({ available: true, streakDay: 1 });
  });

  it('daily reward reports only energy that fits under the cap', () => {
    gameStore.live.energy = gameStore.live.maxEnergy - 2;

    expect(gameStore.claimDaily()).toBe(true);
    expect(gameStore.live.energy).toBe(gameStore.live.maxEnergy);
    expect(gameStore.getSnapshot().toasts.at(-1)?.energy).toBe(2);
  });

  it('collection rewards require discovery and can only be claimed once', () => {
    gameStore.live.discoveredItems = Object.keys(ITEM_DATABASE).slice(0, 7);
    gameStore.live.energy = gameStore.live.maxEnergy - 2;
    const coins = gameStore.live.coins;

    expect(gameStore.claimCollection(7)).toBe(true);
    expect(gameStore.live.coins).toBe(coins + 50);
    expect(gameStore.live.energy).toBe(gameStore.live.maxEnergy);
    expect(gameStore.getSnapshot().toasts.at(-1)?.energy).toBe(2);
    expect(gameStore.claimCollection(7)).toBe(false);
    expect(gameStore.claimCollection(8)).toBe(false);
    expect(gameStore.live.coins).toBe(coins + 50);
  });

  it('tutorial completion grants its capped reward once', () => {
    gameStore.live.coins = 999990;
    gameStore.live.energy = gameStore.live.maxEnergy - 1;

    gameStore.finishTutorial();
    gameStore.finishTutorial();

    expect(gameStore.live.tutorialSeen).toBe(true);
    expect(gameStore.live.coins).toBe(999999);
    expect(gameStore.live.energy).toBe(gameStore.live.maxEnergy);
    expect(gameStore.getSnapshot().toasts.at(-1)?.energy).toBe(1);
  });
});
