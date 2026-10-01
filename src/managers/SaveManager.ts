import type { ItemCategory, ItemConfig, PetOrder, PetType, PlayerData } from '../types/game';
import { BOARD_COLS, BOARD_ROWS, ITEM_DATABASE, MergeManager } from './MergeManager';
import { OrderManager } from './OrderManager';
import { ORDER_LINES, PET_SPECIES } from '../data/shelter';

/* =========================================================
 * Data storage & save manager
 *  - always rebuilds the default data so references are never shared
 *  - older saves (e.g. a 5x5 board) migrate safely
 * ========================================================= */

const SAVE_KEY = 'PETS_HARBOR_SAVE_V1';
const PET_TYPES: PetType[] = ['cat', 'dog', 'rabbit', 'persian'];

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export class SaveManager {
  static createDefault(): PlayerData {
    const board = MergeManager.createEmptyBoard();
    const place = (row: number, col: number, id: string) => {
      const item = ITEM_DATABASE[id];
      const targetRow = board[row];
      if (item && targetRow && row < BOARD_ROWS && col < BOARD_COLS) targetRow[col] = item;
    };
    // Starter items for the tutorial
    place(5, 1, 'food_1');
    place(5, 2, 'food_1');
    place(4, 3, 'toy_1');
    place(5, 4, 'medicine_2');
    place(4, 5, 'medicine_1');

    const starter = (n: number, petName: string, category: ItemCategory, level: number): PetOrder => {
      const reward = OrderManager.rewardFor(level, false);
      const lines = ORDER_LINES[category] ?? ['Thanks for your help!'];
      return {
        id: `order_start_${n}`,
        petName,
        petType: 'cat',
        requiredCategory: category,
        requiredLevel: level,
        rewardCoins: reward.coins,
        rewardHearts: reward.hearts,
        isHealthy: category !== 'medicine',
        message: lines[n % lines.length] ?? 'Thanks for your help!',
      };
    };

    const now = Date.now();
    return {
      coins: 100,
      hearts: 20,
      energy: 60,
      maxEnergy: 60,
      shelterLevel: 1,
      unlockedPets: ['stray_cat_01'],
      boardState: board,
      lastEnergyRegenTime: now,
      orders: [starter(0, 'Nabi', 'food', 2), starter(1, 'Cheese', 'toy', 2), starter(2, 'Kkami', 'medicine', 3)],
      completedTasks: [],
      generatorLevels: { food: 1, toy: 1, medicine: 1 },
      discoveredItems: ['food_1', 'toy_1', 'medicine_1', 'medicine_2'],
      stats: { ordersCompleted: 0, mergesDone: 0, itemsSpawned: 0 },
      tutorialSeen: false,
      orderSeq: 10,
      lastGiftTime: 0,
      lastDaily: 0,
      dailyStreak: 0,
      claimedCollection: [],
    };
  }

  public static load(): PlayerData {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(SAVE_KEY);
    } catch {
      raw = null;
    }
    if (!raw) return SaveManager.createDefault();
    try {
      return SaveManager.normalize(JSON.parse(raw) as Partial<PlayerData>);
    } catch (e) {
      console.error('Failed to parse save data', e);
      return SaveManager.createDefault();
    }
  }

  public static save(data: PlayerData): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save', e);
    }
  }

  public static reset(): PlayerData {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    return SaveManager.createDefault();
  }

  public static hasSave(): boolean {
    try {
      return !!localStorage.getItem(SAVE_KEY);
    } catch {
      return false;
    }
  }

  /** Save validation + filling in missing fields + re-hydrating item configs */
  static normalize(p: Partial<PlayerData>): PlayerData {
    const d = SaveManager.createDefault();

    let boardState = d.boardState;
    if (Array.isArray(p.boardState)) {
      boardState = MergeManager.createEmptyBoard();
      p.boardState.forEach((row, r) => {
        if (!Array.isArray(row) || r >= BOARD_ROWS) return;
        const targetRow = boardState[r];
        if (!targetRow) return;
        row.forEach((cell, c) => {
          if (c >= BOARD_COLS || !cell) return;
          const item = ITEM_DATABASE[(cell as ItemConfig).id];
          if (item) targetRow[c] = item;
        });
      });
    }

    const orders: PetOrder[] = Array.isArray(p.orders)
      ? p.orders
          .filter(
            (o) =>
              o &&
              typeof o.id === 'string' &&
              PET_TYPES.includes(o.petType) &&
              !!ITEM_DATABASE[`${o.requiredCategory}_${o.requiredLevel}`],
          )
          .map((o) => ({
            ...o,
            message:
              typeof o.message === 'string' ? o.message : (ORDER_LINES[o.requiredCategory]?.[0] ?? 'Thanks for your help!'),
            isHealthy: o.requiredCategory !== 'medicine',
          }))
      : d.orders;

    const unlocked = Array.isArray(p.unlockedPets) ? p.unlockedPets.filter((id) => !!PET_SPECIES[id]) : [];

    const maxEnergy = clamp(Math.round(num(p.maxEnergy, d.maxEnergy)), 20, 200);
    const energy = clamp(Math.round(num(p.energy, d.energy)), 0, maxEnergy);
    const rawGen = (p.generatorLevels ?? {}) as Partial<Record<string, unknown>>;
    const stats = { ...d.stats, ...(p.stats ?? {}) };

    return {
      coins: clamp(Math.round(num(p.coins, d.coins)), 0, 999999),
      hearts: clamp(Math.round(num(p.hearts, d.hearts)), 0, 99999),
      energy,
      maxEnergy,
      shelterLevel: clamp(Math.round(num(p.shelterLevel, d.shelterLevel)), 1, 6),
      unlockedPets: unlocked.length ? unlocked : d.unlockedPets,
      boardState,
      lastEnergyRegenTime: num(p.lastEnergyRegenTime, Date.now()),
      orders,
      completedTasks: Array.isArray(p.completedTasks) ? p.completedTasks.filter((t) => typeof t === 'string') : [],
      generatorLevels: {
        food: clamp(Math.round(num(rawGen.food, d.generatorLevels.food)), 1, 3),
        toy: clamp(Math.round(num(rawGen.toy, d.generatorLevels.toy)), 1, 3),
        medicine: clamp(Math.round(num(rawGen.medicine, d.generatorLevels.medicine)), 1, 3),
      },
      discoveredItems: Array.isArray(p.discoveredItems)
        ? [...new Set(p.discoveredItems.filter((id): id is string => typeof id === 'string' && !!ITEM_DATABASE[id]))]
        : d.discoveredItems,
      stats: {
        ordersCompleted: clamp(Math.round(num(stats.ordersCompleted, 0)), 0, 999999),
        mergesDone: clamp(Math.round(num(stats.mergesDone, 0)), 0, 999999),
        itemsSpawned: clamp(Math.round(num(stats.itemsSpawned, 0)), 0, 999999),
      },
      tutorialSeen: !!p.tutorialSeen,
      orderSeq: clamp(Math.round(num(p.orderSeq, d.orderSeq)), 0, Number.MAX_SAFE_INTEGER),
      lastGiftTime: Math.max(0, num(p.lastGiftTime, 0)),
      lastDaily: Math.max(0, num(p.lastDaily, 0)),
      dailyStreak: clamp(Math.round(num(p.dailyStreak, 0)), 0, 7),
      claimedCollection: Array.isArray(p.claimedCollection)
        ? [...new Set(p.claimedCollection.filter((t): t is number => t === 7 || t === 14 || t === 21))]
        : [],
    };
  }
}
