import type { BoardCell, CellPos, ItemCategory, ItemConfig } from '../types/game';

/* =========================================================
 * 코어 머지 로직 매니저 (사양서 §5)
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
    label: '사료·간식',
    need: '배고파요',
    generatorName: '사료 창고',
    generatorEmoji: '🧺',
    light: '#FFE7C2',
    mid: '#FFB463',
    dark: '#D9751C',
    soft: '#FFF4E3',
  },
  toy: {
    label: '장난감',
    need: '심심해요',
    generatorName: '장난감 상자',
    generatorEmoji: '🎁',
    light: '#EDE3FF',
    mid: '#B99BFF',
    dark: '#7650DB',
    soft: '#F4EFFF',
  },
  medicine: {
    label: '의약품',
    need: '아파요',
    generatorName: '구급 상자',
    generatorEmoji: '🧰',
    light: '#D6F8EC',
    mid: '#6ED6B3',
    dark: '#1E9A77',
    soft: '#EAFBF4',
  },
};

const CHAINS: Record<ItemCategory, Array<{ name: string; emoji: string }>> = {
  food: [
    { name: '따뜻한 우유', emoji: '🥛' },
    { name: '뼈다귀 간식', emoji: '🦴' },
    { name: '싱싱한 생선', emoji: '🐟' },
    { name: '닭고기 구이', emoji: '🍗' },
    { name: '프리미엄 통조림', emoji: '🥫' },
    { name: '수제 영양 도시락', emoji: '🍱' },
    { name: '축하 펫 케이크', emoji: '🎂' },
  ],
  toy: [
    { name: '털실 뭉치', emoji: '🧶' },
    { name: '말랑 테니스공', emoji: '🎾' },
    { name: '쥐돌이 인형', emoji: '🐭' },
    { name: '날아라 원반', emoji: '🥏' },
    { name: '포근한 곰 인형', emoji: '🧸' },
    { name: '미니 회전목마', emoji: '🎠' },
    { name: '꿈의 놀이 성', emoji: '🏰' },
  ],
  medicine: [
    { name: '반창고', emoji: '🩹' },
    { name: '비타민 알약', emoji: '💊' },
    { name: '상처 연고', emoji: '🧴' },
    { name: '예방 주사', emoji: '💉' },
    { name: '체온계', emoji: '🌡️' },
    { name: '특효 물약', emoji: '🧪' },
    { name: '명의의 청진기', emoji: '🩺' },
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

  /** 기준점(보드 밖일 수도 있음)에서 가장 가까운 빈 칸 */
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

  /** 주문 레벨까지 필요한 재료 대비 보드 위 재료 비율 (0~1) */
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

  /** 생성기 레벨에 따라 스폰될 아이템 레벨을 결정 */
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
