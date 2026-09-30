import { describe, expect, it } from 'vitest';
import { OrderManager } from './OrderManager';

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
});
