/* =========================================================
 * 유기동물 쉼터 복원 머지 (Pets Harbor & Home Restore)
 * 게임 전역 타입 정의 (사양서 §3 + 확장 필드)
 * ========================================================= */

export type ItemCategory = 'food' | 'toy' | 'medicine';
export type PetType = 'cat' | 'dog' | 'rabbit' | 'persian';

export interface ItemConfig {
  id: string;
  category: ItemCategory;
  level: number;
  name: string;
  textureKey: string;
  maxLevel: number;
  /** 확장: 아이템 아이콘(이모지) - BootScene 에서 텍스처로 렌더링 */
  emoji: string;
}

export interface BoardCell {
  row: number;
  col: number;
  item: ItemConfig | null;
}

export interface CellPos {
  row: number;
  col: number;
}

export interface PetOrder {
  id: string;
  petName: string;
  petType: PetType;
  requiredCategory: ItemCategory;
  requiredLevel: number;
  rewardCoins: number;
  rewardHearts: number;
  isHealthy: boolean;
  /** 확장: 말풍선 대사 */
  message: string;
  /** 확장: 엔드리스 황금 주문 (보상 1.5배) */
  golden?: boolean;
}

export type GeneratorLevels = Record<ItemCategory, number>;

export interface PlayerStats {
  ordersCompleted: number;
  mergesDone: number;
  itemsSpawned: number;
}

export interface PlayerData {
  coins: number;
  hearts: number;
  energy: number;
  maxEnergy: number;
  shelterLevel: number;
  unlockedPets: string[];
  boardState: (ItemConfig | null)[][];
  lastEnergyRegenTime: number;
  // ---------- 확장 필드 ----------
  orders: PetOrder[];
  completedTasks: string[];
  generatorLevels: GeneratorLevels;
  discoveredItems: string[];
  stats: PlayerStats;
  tutorialSeen: boolean;
  orderSeq: number;
  lastGiftTime: number;
  lastDaily: number;
  dailyStreak: number;
  claimedCollection: number[];
}

/** GameStore -> Phaser MainScene 으로 전달되는 보드 변화 이벤트 */
export type BoardEvent =
  | { type: 'spawn'; category: ItemCategory; to: CellPos; item: ItemConfig }
  | { type: 'move'; from: CellPos; to: CellPos }
  | { type: 'swap'; from: CellPos; to: CellPos }
  | { type: 'merge'; from: CellPos; to: CellPos; item: ItemConfig; isNew: boolean }
  | { type: 'remove'; at: CellPos; reason: 'deliver' | 'sell'; value?: number }
  | { type: 'reset' };

export interface RestoreTask {
  id: string;
  name: string;
  emoji: string;
  hearts: number;
  coins: number;
}

export interface AreaReward {
  unlockPet?: string;
  maxEnergy?: number;
  coins?: number;
  generators?: ItemCategory[];
}

export interface ShelterArea {
  id: string;
  name: string;
  emoji: string;
  description: string;
  image: string;
  tasks: RestoreTask[];
  reward: AreaReward;
  rewardText: string[];
}

export interface PetSpecies {
  id: string;
  type: PetType;
  label: string;
  image: string;
  color: string;
}
