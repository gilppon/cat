import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderManager } from './OrderManager';
import { SaveManager } from './SaveManager';
import { SHELTER_AREAS } from '../data/shelter';

afterEach(() => vi.restoreAllMocks());

describe('OrderManager', () => {
  it('level range follows shelterLevel', () => {
    expect(OrderManager.levelRange(1)).toEqual([2, 3]);
    expect(OrderManager.levelRange(6)).toEqual([4, 7]);
  });

  it('order slots go up to 4 at Lv3', () => {
    expect(OrderManager.maxOrders(1)).toBe(3);
    expect(OrderManager.maxOrders(3)).toBe(4);
  });

  it('rewards pay more coins as the level rises', () => {
    const low = OrderManager.rewardFor(2, false);
    const high = OrderManager.rewardFor(5, false);
    expect(high.coins).toBeGreaterThan(low.coins);
    expect(high.hearts).toBeGreaterThanOrEqual(low.hearts);
  });

  it('golden orders only spawn after a full restore and pay 1.5x', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const data = SaveManager.createDefault();

    const beforeCompletion = OrderManager.create(data, []);
    expect(beforeCompletion.golden).toBeUndefined();

    data.completedTasks = SHELTER_AREAS.flatMap((area) => area.tasks.map((task) => task.id));
    const golden = OrderManager.create(data, []);
    const base = OrderManager.rewardFor(golden.requiredLevel, true);

    expect(golden.golden).toBe(true);
    expect(golden.rewardCoins).toBe(Math.round(base.coins * 1.5));
    expect(golden.rewardHearts).toBe(Math.round(base.hearts * 1.5));
  });
});
