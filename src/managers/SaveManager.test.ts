import { describe, expect, it } from 'vitest';
import { SaveManager } from './SaveManager';

describe('SaveManager.normalize', () => {
  it('clamps the coin and heart caps', () => {
    const d = SaveManager.normalize({ coins: 99999999, hearts: -50 } as never);
    expect(d.coins).toBe(999999);
    expect(d.hearts).toBe(0);
  });

  it('energy never exceeds maxEnergy', () => {
    const d = SaveManager.normalize({ energy: 9999, maxEnergy: 50 } as never);
    expect(d.energy).toBeLessThanOrEqual(d.maxEnergy);
  });

  it('clamps generator levels to 1~3', () => {
    const d = SaveManager.normalize({ generatorLevels: { food: 99, toy: 0, medicine: 2 } } as never);
    expect(d.generatorLevels.food).toBe(3);
    expect(d.generatorLevels.toy).toBe(1);
    expect(d.generatorLevels.medicine).toBe(2);
  });

  it('collection discoveries keep only valid unique ids', () => {
    const d = SaveManager.normalize({ discoveredItems: ['food_1', 'food_1', 'unknown', 7] } as never);
    expect(d.discoveredItems).toEqual(['food_1']);
  });

  it('collection reward log keeps only allowed tiers, without duplicates', () => {
    const d = SaveManager.normalize({ claimedCollection: [7, 7, 8, 14.5, '21', 21] } as never);
    expect(d.claimedCollection).toEqual([7, 21]);
  });
});
