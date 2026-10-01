/* =========================================================
 * Pet Shelter Restore Merge (Pets Harbor & Home Restore)
 * Global game type definitions
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
  /** Extra: item icon (emoji) - rendered as a texture in BootScene */
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
  /** Extra: speech bubble line */
  message: string;
  /** Extra: endless golden order (1.5x reward) */
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
  // ---------- Extra fields ----------
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

/** Board change events passed from GameStore to the Phaser MainScene */
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
