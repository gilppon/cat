import { describe, expect, it } from 'vitest';
import { ITEM_DATABASE, MergeManager } from './MergeManager';

describe('MergeManager', () => {
  it('같은 id + 최대 미만이면 합칠 수 있다', () => {
    const a = ITEM_DATABASE['food_1']!;
    const b = ITEM_DATABASE['food_1']!;
    expect(MergeManager.canMerge(a, b)).toBe(true);
  });

  it('다른 아이템은 합칠 수 없다', () => {
    expect(MergeManager.canMerge(ITEM_DATABASE['food_1'], ITEM_DATABASE['toy_1'])).toBe(false);
  });

  it('최대 레벨은 합칠 수 없다', () => {
    const max = ITEM_DATABASE['food_7']!;
    expect(MergeManager.canMerge(max, max)).toBe(false);
    expect(MergeManager.getMergeResult(max, max)).toBeNull();
  });

  it('합치면 다음 레벨을 반환한다', () => {
    const res = MergeManager.getMergeResult(ITEM_DATABASE['toy_2'], ITEM_DATABASE['toy_2']);
    expect(res?.id).toBe('toy_3');
  });

  it('판매가는 2^(lv-1), 최소 1', () => {
    expect(MergeManager.sellPrice(ITEM_DATABASE['food_1']!)).toBe(1);
    expect(MergeManager.sellPrice(ITEM_DATABASE['food_3']!)).toBe(4);
  });

  it('생성기 레벨은 1~3 범위로 굴린다', () => {
    for (let i = 0; i < 50; i++) {
      const lv = MergeManager.rollGeneratorLevel(1);
      expect(lv).toBeGreaterThanOrEqual(1);
      expect(lv).toBeLessThanOrEqual(3);
    }
  });
});
