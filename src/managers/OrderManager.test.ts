import { afterEach, describe, expect, it, vi } from 'vitest';
import { OrderManager } from './OrderManager';
import { SaveManager } from './SaveManager';
import { SHELTER_AREAS } from '../data/shelter';

afterEach(() => vi.restoreAllMocks());

describe('OrderManager', () => {
  it('레벨 범위는 shelterLevel에 따라 달라진다', () => {
    expect(OrderManager.levelRange(1)).toEqual([2, 3]);
    expect(OrderManager.levelRange(6)).toEqual([4, 7]);
  });

  it('주문 슬롯은 Lv3부터 4개', () => {
    expect(OrderManager.maxOrders(1)).toBe(3);
    expect(OrderManager.maxOrders(3)).toBe(4);
  });

  it('보상은 레벨이 오르면 코인이 증가한다', () => {
    const low = OrderManager.rewardFor(2, false);
    const high = OrderManager.rewardFor(5, false);
    expect(high.coins).toBeGreaterThan(low.coins);
    expect(high.hearts).toBeGreaterThanOrEqual(low.hearts);
  });

  it('황금 주문은 쉼터 완복 이후에만 생성되고 보상을 1.5배 지급한다', () => {
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
