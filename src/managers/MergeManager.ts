import type { BoardCell, CellPos, ItemCategory, ItemConfig } from '../types/game';

/* =========================================================
 * Core merge logic manager
 * ========================================================= */

export const BOARD_ROWS = 6;
export const BOARD_COLS = 6;
export const CATEGORIES: ItemCategory[] = ['food', 'toy', 'medicine'];

export type Board = (ItemConfig | null)[][];

export interface CategoryMeta {
  label: string;
  need: string;
  generatorName: string;
  generatorEmoji: string;
  light: string;
  mid: string;
  dark: string;
  soft: string;
}

export const CATEGORY_META: Record<ItemCategory, CategoryMeta> = {
  food: {
    label: 'Food & Treats',
    need: "I'm hungry",
    generatorName: 'Food Pantry',
    generatorEmoji: '🧺',
    light: '#FFE7C2',
    mid: '#FFB463',
    dark: '#D9751C',
    soft: '#FFF4E3',
  },
  toy: {
    label: 'Toys',
    need: "I'm bored",
    generatorName: 'Toy Box',
    generatorEmoji: '🎁',
    light: '#EDE3FF',
    mid: '#B99BFF',
    dark: '#7650DB',
    soft: '#F4EFFF',
  },
  medicine: {
    label: 'Medicine',
    need: 'I feel sick',
    generatorName: 'First Aid Box',
    generatorEmoji: '🧰',
    light: '#D6F8EC',
    mid: '#6ED6B3',
    dark: '#1E9A77',
    soft: '#EAFBF4',
  },
};

const CHAINS: Record<ItemCategory, Array<{ name: string; emoji: string }>> = {
  food: [
    { name: 'Warm Milk', emoji: '🥛' },
    { name: 'Bone Treat', emoji: '🦴' },
    { name: 'Fresh Fish', emoji: '🐟' },
    { name: 'Roast Chicken', emoji: '🍗' },
    { name: 'Premium Can', emoji: '🥫' },
    { name: 'Homemade Bento', emoji: '🍱' },
    { name: 'Celebration Cake', emoji: '🎂' },
  ],
  toy: [
    { name: 'Yarn Ball', emoji: '🧶' },
    { name: 'Soft Tennis Ball', emoji: '🎾' },
    { name: 'Mouse Plush', emoji: '🐭' },
    { name: 'Flying Disc', emoji: '🥏' },
    { name: 'Cuddly Bear', emoji: '🧸' },
    { name: 'Mini Carousel', emoji: '🎠' },
    { name: 'Dream Playground', emoji: '🏰' },
  ],
  medicine: [
    { name: 'Bandage', emoji: '🩹' },
    { name: 'Vitamin Pill', emoji: '💊' },
    { name: 'Healing Ointment', emoji: '🧴' },
    { name: 'Preventive Shot', emoji: '💉' },
    { name: 'Thermometer', emoji: '🌡️' },
    { name: 'Magic Potion', emoji: '🧪' },
    { name: "Doctor's Stethoscope", emoji: '🩺' },
  ],
};

export const ITEM_DATABASE: Record<string, ItemConfig> = (() => {
  const db: Record<string, ItemConfig> = {};
  CATEGORIES.forEach((category) => {
    const chain = CHAINS[category];
    chain.forEach((def, i) => {
      const level = i + 1;
      const id = `${category}_${level}`;
      db[id] = {
        id,
        category,
        level,
        name: def.name,
        emoji: def.emoji,
        textureKey: `item_${id}`,
        maxLevel: chain.length,
      };
    });
  });
  return db;
})();

export class MergeManager {
  static getItem(category: ItemCategory, level: number): ItemConfig | null {
    return ITEM_DATABASE[`${category}_${level}`] ?? null;
  }

  static getChain(category: ItemCategory): ItemConfig[] {
    return CHAINS[category]!.map((_, i) => ITEM_DATABASE[`${category}_${i + 1}`]!);
  }

  static canMerge(a: ItemConfig | null | undefined, b: ItemConfig | null | undefined): boolean {
    return !!a && !!b && a.id === b.id && a.level < a.maxLevel;
  }

  static getMergeResult(a: ItemConfig | null | undefined, b: ItemConfig | null | undefined): ItemConfig | null {
    if (!a || !MergeManager.canMerge(a, b)) return null;
    return MergeManager.getItem(a.category, a.level + 1);
  }

  static createEmptyBoard(): Board {
    return Array.from({ length: BOARD_ROWS }, () => Array<ItemConfig | null>(BOARD_COLS).fill(null));
  }

  static getEmptyCells(board: Board): BoardCell[] {
    const cells: BoardCell[] = [];
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        if (!board[row]?.[col]) cells.push({ row, col, item: null });
      }
    }
    return cells;
  }

  /** Nearest empty cell to a reference point (which may be off the board) */
  static findNearestEmpty(board: Board, fromRow: number, fromCol: number): CellPos | null {
    let best: CellPos | null = null;
    let bestDist = Infinity;
    for (const cell of MergeManager.getEmptyCells(board)) {
      const d = (cell.row - fromRow) ** 2 + (cell.col - fromCol) ** 2 + Math.random() * 0.01;
      if (d < bestDist) {
        bestDist = d;
        best = { row: cell.row, col: cell.col };
      }
    }
    return best;
  }

  static findItem(board: Board, category: ItemCategory, level: number): CellPos | null {
    for (let row = 0; row < BOARD_ROWS; row++) {
      for (let col = 0; col < BOARD_COLS; col++) {
        const it = board[row]?.[col];
        if (it && it.category === category && it.level === level) return { row, col };
      }
    }
    return null;
  }

  static highestLevel(board: Board, category: ItemCategory): number {
    let best = 0;
    board.forEach((row) =>
      row.forEach((it) => {
        if (it && it.category === category) best = Math.max(best, it.level);
      }),
    );
    return best;
  }

  /** Progress toward the ingredients an order needs, measured against board stock (0~1) */
  static materialProgress(board: Board, category: ItemCategory, level: number): number {
    const target = 2 ** (level - 1);
    let sum = 0;
    board.forEach((row) =>
      row.forEach((it) => {
        if (it && it.category === category && it.level <= level) sum += 2 ** (it.level - 1);
      }),
    );
    return Math.min(1, sum / target);
  }

  /** Decides the item level a generator spawns, based on the generator level */
  static rollGeneratorLevel(genLevel: number): number {
    const lv = Math.max(1, Math.min(3, genLevel));
    const p3 = lv >= 3 ? 0.08 : 0;
    const p2 = [0, 0.1, 0.22, 0.3][lv] ?? 0;
    const r = Math.random();
    if (r < p3) return 3;
    if (r < p3 + p2) return 2;
    return 1;
  }

  static sellPrice(item: ItemConfig): number {
    return Math.max(1, 2 ** (item.level - 1));
  }
}
