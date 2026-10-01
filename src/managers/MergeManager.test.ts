import { describe, expect, it } from 'vitest';
import { ITEM_DATABASE, MergeManager } from './MergeManager';

describe('MergeManager', () => {
  it('merges when the id matches and the level is below max', () => {
    const a = ITEM_DATABASE['food_1']!;
    const b = ITEM_DATABASE['food_1']!;
    expect(MergeManager.canMerge(a, b)).toBe(true);
  });

  it('does not merge different items', () => {
    expect(MergeManager.canMerge(ITEM_DATABASE['food_1'], ITEM_DATABASE['toy_1'])).toBe(false);
  });

  it('does not merge at max level', () => {
    const max = ITEM_DATABASE['food_7']!;
    expect(MergeManager.canMerge(max, max)).toBe(false);
    expect(MergeManager.getMergeResult(max, max)).toBeNull();
  });

  it('returns the next level on merge', () => {
    const res = MergeManager.getMergeResult(ITEM_DATABASE['toy_2'], ITEM_DATABASE['toy_2']);
    expect(res?.id).toBe('toy_3');
  });

  it('sell price is 2^(lv-1), minimum 1', () => {
    expect(MergeManager.sellPrice(ITEM_DATABASE['food_1']!)).toBe(1);
    expect(MergeManager.sellPrice(ITEM_DATABASE['food_3']!)).toBe(4);
  });

  it('rolls generator levels within 1~3', () => {
    for (let i = 0; i < 50; i++) {
      const lv = MergeManager.rollGeneratorLevel(1);
      expect(lv).toBeGreaterThanOrEqual(1);
      expect(lv).toBeLessThanOrEqual(3);
    }
  });
});
