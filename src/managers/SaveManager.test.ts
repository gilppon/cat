import { describe, expect, it } from 'vitest';
import { SaveManager } from './SaveManager';

describe('SaveManager.normalize', () => {
  it('코인/하트 상한을 자른다', () => {
    const d = SaveManager.normalize({ coins: 99999999, hearts: -50 } as never);
    expect(d.coins).toBe(999999);
    expect(d.hearts).toBe(0);
  });

  it('에너지는 maxEnergy를 넘지 않는다', () => {
    const d = SaveManager.normalize({ energy: 9999, maxEnergy: 50 } as never);
    expect(d.energy).toBeLessThanOrEqual(d.maxEnergy);
  });

  it('생성기 레벨은 1~3으로 보정한다', () => {
    const d = SaveManager.normalize({ generatorLevels: { food: 99, toy: 0, medicine: 2 } } as never);
    expect(d.generatorLevels.food).toBe(3);
    expect(d.generatorLevels.toy).toBe(1);
    expect(d.generatorLevels.medicine).toBe(2);
  });
});
