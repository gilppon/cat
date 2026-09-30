import type { PetOrder, PlayerData } from '../types/game';
import { CATEGORIES } from './MergeManager';
import { ORDER_LINES, PET_NAMES, PET_SPECIES } from '../data/shelter';

const HEARTS_BY_LEVEL = [0, 1, 3, 4, 6, 9, 13, 18];
const LEVEL_RANGE: Record<number, [number, number]> = {
  1: [2, 3],
  2: [2, 4],
  3: [3, 5],
  4: [3, 6],
  5: [4, 6],
  6: [4, 7],
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

/* =========================================================
 * 동물 친구들의 요청(주문) 생성기
 * ========================================================= */
export class OrderManager {
  static levelRange(shelterLevel: number): [number, number] {
    return LEVEL_RANGE[Math.min(6, Math.max(1, Math.round(shelterLevel)))] ?? [2, 3];
  }

  static maxOrders(shelterLevel: number): number {
    return shelterLevel >= 3 ? 4 : 3;
  }

  static rewardFor(level: number, jitter = true): { coins: number; hearts: number } {
    const base = 6 * 2 ** (level - 1);
    const mult = jitter ? 0.9 + Math.random() * 0.3 : 1;
    return {
      coins: Math.round(base * mult) + 4,
      hearts: HEARTS_BY_LEVEL[Math.min(level, HEARTS_BY_LEVEL.length - 1)] ?? level,
    };
  }

  static create(data: PlayerData, existing: PetOrder[]): PetOrder {
    const [min, max] = OrderManager.levelRange(data.shelterLevel);
    const used = existing.map((o) => o.requiredCategory);
    const missing = CATEGORIES.filter((c) => !used.includes(c));

    let category = missing.length > 0 && Math.random() < 0.75 ? pick(missing) : pick(CATEGORIES);
    let level = min + Math.floor(Math.pow(Math.random(), 1.4) * (max - min + 1));
    for (
      let tries = 0;
      tries < 8 && existing.some((o) => o.requiredCategory === category && o.requiredLevel === level);
      tries++
    ) {
      category = pick(CATEGORIES);
      level = min + Math.floor(Math.random() * (max - min + 1));
    }

    // 새로 입소한 친구가 먼저 찾아오도록 가중치
    const speciesIds = data.unlockedPets.filter((id) => PET_SPECIES[id]);
    const pool = speciesIds.length ? speciesIds : ['stray_cat_01'];
    const newest = PET_SPECIES[pool[pool.length - 1]!] ?? PET_SPECIES['stray_cat_01']!;
    const newestShown = existing.some((o) => o.petType === newest.type);
    const species = (!newestShown && pool.length > 1 && Math.random() < 0.65 ? newest : PET_SPECIES[pick(pool)]!)!;

    const usedNames = new Set(existing.map((o) => o.petName));
    const names = PET_NAMES.filter((n) => !usedNames.has(n));
    const reward = OrderManager.rewardFor(level);
    data.orderSeq += 1;

    return {
      id: `order_${Date.now().toString(36)}_${data.orderSeq}`,
      petName: pick(names.length ? names : PET_NAMES),
      petType: species.type,
      requiredCategory: category,
      requiredLevel: level,
      rewardCoins: reward.coins,
      rewardHearts: reward.hearts,
      isHealthy: category !== 'medicine',
      message: pick(ORDER_LINES[category]),
    };
  }
}
