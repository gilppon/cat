import type { BoardEvent, CellPos, ItemCategory, PlayerData } from '../types/game';
import { SaveManager } from './SaveManager';
import { BOARD_COLS, BOARD_ROWS, CATEGORIES, ITEM_DATABASE, MergeManager } from './MergeManager';
import { OrderManager } from './OrderManager';
import { SHELTER_AREAS } from '../data/shelter';
import { sfx } from '../lib/sfx';
import { withJosa } from '../lib/korean';

/* =========================================================
 * GameStore - Phaser 씬과 React UI 가 함께 쓰는 단일 상태 저장소
 * ========================================================= */

export const ENERGY_REGEN_MS = 15_000;
export const GIFT_COOLDOWN_MS = 3 * 60_000;
export const REFRESH_ORDER_COST = 10;
export const MAX_GENERATOR_LEVEL = 3;

export type ToastTone = 'info' | 'success' | 'warn' | 'reward';

export interface Toast {
  id: number;
  text: string;
  tone: ToastTone;
  icon?: string;
  coins?: number;
  hearts?: number;
  energy?: number;
}

export interface Hint {
  category: ItemCategory;
  level: number;
}

export interface EnergyPack {
  id: 'small' | 'medium' | 'full';
  label: string;
  desc: string;
  energy: number | 'full';
  price: number;
  badge?: string;
}

export const ENERGY_PACKS: EnergyPack[] = [
  { id: 'small', label: '에너지 한 줌', desc: '+10 에너지', energy: 10, price: 30 },
  { id: 'medium', label: '에너지 한 바구니', desc: '+30 에너지', energy: 30, price: 80, badge: '인기' },
  { id: 'full', label: '에너지 가득!', desc: '최대치까지 충전', energy: 'full', price: 0 },
];

/** 출석 1~7일차 보상 (7일 후 1일차로 순환) */
export const DAILY_REWARDS: Array<{ coins: number; energy: number }> = [
  { coins: 20, energy: 5 },
  { coins: 30, energy: 5 },
  { coins: 40, energy: 10 },
  { coins: 60, energy: 10 },
  { coins: 80, energy: 15 },
  { coins: 100, energy: 15 },
  { coins: 150, energy: 20 },
];

/** 도감 수집 보상 (발견 종류 수 기준) */
export const COLLECTION_TIERS: Array<{ count: number; coins: number; energy: number }> = [
  { count: 7, coins: 50, energy: 5 },
  { count: 14, coins: 120, energy: 10 },
  { count: 21, coins: 250, energy: 20 },
];

export interface GameSnapshot {
  data: PlayerData;
  selected: CellPos | null;
  toasts: Toast[];
  celebration: string | null;
  shopOpen: boolean;
  version: number;
}

/* ---------------- 순수 헬퍼 ---------------- */
export function isAreaComplete(data: PlayerData, index: number): boolean {
  const area = SHELTER_AREAS[index];
  return !!area && area.tasks.every((t) => data.completedTasks.includes(t.id));
}

export function isAreaUnlocked(data: PlayerData, index: number): boolean {
  return index === 0 || isAreaComplete(data, index - 1);
}

export function areaDoneCount(data: PlayerData, index: number): number {
  const area = SHELTER_AREAS[index];
  return area ? area.tasks.filter((t) => data.completedTasks.includes(t.id)).length : 0;
}

export function overallProgress(data: PlayerData): number {
  const total = SHELTER_AREAS.reduce((s, a) => s + a.tasks.length, 0);
  const done = SHELTER_AREAS.reduce((s, a) => s + a.tasks.filter((t) => data.completedTasks.includes(t.id)).length, 0);
  return total ? done / total : 0;
}

export function canAffordAnyTask(data: PlayerData): boolean {
  return SHELTER_AREAS.some(
    (a, i) =>
      isAreaUnlocked(data, i) &&
      a.tasks.some((t) => !data.completedTasks.includes(t.id) && data.hearts >= t.hearts && data.coins >= t.coins),
  );
}

export function energyFullPrice(data: PlayerData): number {
  return Math.max(10, Math.ceil(Math.max(0, data.maxEnergy - data.energy) * 2.5));
}

/** 인터랙티브 튜토리얼 단계 (저장된 스탯에서 파생, 리로드에도 강함) */
export function tutorialStep(data: PlayerData): 0 | 1 | 2 | 3 {
  if (data.tutorialSeen) return 3;
  if (data.stats.mergesDone < 1) return 0;
  if (data.stats.ordersCompleted < 1) return 1;
  if (!data.completedTasks.includes('yard_weeds')) return 2;
  return 3;
}

type Listener = () => void;

class GameStore {
  private data: PlayerData;
  private selected: CellPos | null = null;
  private toasts: Toast[] = [];
  private celebration: string | null = null;
  private shopOpen = false;
  private version = 0;
  private toastSeq = 0;
  private listeners = new Set<Listener>();
  private boardListeners = new Set<(e: BoardEvent) => void>();
  private hintListeners = new Set<(h: Hint) => void>();
  private snapshot: GameSnapshot;

  constructor() {
    this.data = SaveManager.load();
    this.recomputeProgress();
    this.applyEnergyRegen(Date.now());
    this.ensureOrders();
    this.snapshot = this.buildSnapshot();
  }

  /* ---------------- 구독 ---------------- */
  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): GameSnapshot => this.snapshot;

  onBoard(listener: (e: BoardEvent) => void): () => void {
    this.boardListeners.add(listener);
    return () => {
      this.boardListeners.delete(listener);
    };
  }

  onHint(listener: (h: Hint) => void): () => void {
    this.hintListeners.add(listener);
    return () => {
      this.hintListeners.delete(listener);
    };
  }

  /** Phaser 씬 전용 실시간 데이터 (스냅샷 복사 이전 값) */
  get live(): PlayerData {
    return this.data;
  }

  get board() {
    return this.data.boardState;
  }

  /* ---------------- 내부 ---------------- */
  private buildSnapshot(): GameSnapshot {
    this.version += 1;
    const d = this.data;
    return {
      data: {
        ...d,
        boardState: d.boardState.map((row) => [...row]),
        orders: [...d.orders],
        completedTasks: [...d.completedTasks],
        unlockedPets: [...d.unlockedPets],
        discoveredItems: [...d.discoveredItems],
        generatorLevels: { ...d.generatorLevels },
        stats: { ...d.stats },
      },
      selected: this.selected ? { ...this.selected } : null,
      toasts: this.toasts,
      celebration: this.celebration,
      shopOpen: this.shopOpen,
      version: this.version,
    };
  }

  private commit(save = true) {
    if (save) SaveManager.save(this.data);
    this.snapshot = this.buildSnapshot();
    this.listeners.forEach((l) => l());
  }

  private emitBoard(e: BoardEvent) {
    this.boardListeners.forEach((l) => l(e));
  }

  private pushToast(text: string, tone: ToastTone = 'info', extra: Partial<Omit<Toast, 'id' | 'text' | 'tone'>> = {}) {
    const toast: Toast = { id: ++this.toastSeq, text, tone, ...extra };
    this.toasts = [...this.toasts.slice(-2), toast];
    window.setTimeout(() => this.dismissToast(toast.id), tone === 'reward' ? 2900 : 2400);
  }

  private addEnergy(amount: number): number {
    const gain = Math.min(Math.max(0, this.data.maxEnergy - this.data.energy), amount);
    this.data.energy += gain;
    return gain;
  }

  private inBounds(p: CellPos) {
    return p.row >= 0 && p.row < BOARD_ROWS && p.col >= 0 && p.col < BOARD_COLS;
  }

  private samePos(a: CellPos | null, b: CellPos | null) {
    return !!a && !!b && a.row === b.row && a.col === b.col;
  }

  private recomputeProgress() {
    let restored = 0;
    SHELTER_AREAS.forEach((_, i) => {
      if (isAreaComplete(this.data, i)) restored += 1;
    });
    this.data.shelterLevel = 1 + restored;
  }

  private applyEnergyRegen(now: number): boolean {
    const d = this.data;
    if (d.energy >= d.maxEnergy) {
      d.lastEnergyRegenTime = now;
      return false;
    }
    const elapsed = now - d.lastEnergyRegenTime;
    if (elapsed < ENERGY_REGEN_MS) return false;
    const gained = Math.floor(elapsed / ENERGY_REGEN_MS);
    d.energy = Math.min(d.maxEnergy, d.energy + gained);
    d.lastEnergyRegenTime += gained * ENERGY_REGEN_MS;
    if (d.energy >= d.maxEnergy) d.lastEnergyRegenTime = now;
    return true;
  }

  private ensureOrders() {
    const d = this.data;
    d.orders = d.orders.filter((o) => !!ITEM_DATABASE[`${o.requiredCategory}_${o.requiredLevel}`]);
    const max = OrderManager.maxOrders(d.shelterLevel);
    while (d.orders.length < max) d.orders.push(OrderManager.create(d, d.orders));
  }

  private findItemFor(category: ItemCategory, level: number): CellPos | null {
    const sel = this.selected;
    if (sel) {
      const it = this.data.boardState[sel.row]?.[sel.col];
      if (it && it.category === category && it.level === level) return { ...sel };
    }
    return MergeManager.findItem(this.data.boardState, category, level);
  }

  /* ---------------- 공개 액션 ---------------- */
  tick() {
    if (this.applyEnergyRegen(Date.now())) this.commit();
  }

  toast(text: string, tone: ToastTone = 'info', extra: Partial<Omit<Toast, 'id' | 'text' | 'tone'>> = {}) {
    this.pushToast(text, tone, extra);
    this.commit(false);
  }

  dismissToast(id: number) {
    const next = this.toasts.filter((t) => t.id !== id);
    if (next.length !== this.toasts.length) {
      this.toasts = next;
      this.commit(false);
    }
  }

  select(pos: CellPos | null) {
    let next = pos;
    if (next && !this.data.boardState[next.row]?.[next.col]) next = null;
    if ((this.selected === null && next === null) || this.samePos(this.selected, next)) return;
    this.selected = next ? { ...next } : null;
    this.commit(false);
  }

  moveItem(from: CellPos, to: CellPos): 'none' | 'move' | 'swap' | 'merge' {
    const b = this.data.boardState;
    if (!this.inBounds(from) || !this.inBounds(to) || this.samePos(from, to)) return 'none';
    const fromRow = b[from.row];
    const toRow = b[to.row];
    if (!fromRow || !toRow) return 'none';
    const a = fromRow[from.col];
    if (!a) return 'none';
    const target = toRow[to.col];

    if (!target) {
      toRow[to.col] = a;
      fromRow[from.col] = null;
      this.selected = { ...to };
      this.emitBoard({ type: 'move', from, to });
      this.commit();
      return 'move';
    }

    const merged = MergeManager.getMergeResult(a, target);
    if (merged) {
      toRow[to.col] = merged;
      fromRow[from.col] = null;
      const isNew = !this.data.discoveredItems.includes(merged.id);
      if (isNew) this.data.discoveredItems.push(merged.id);
      this.data.stats.mergesDone += 1;
      this.selected = { ...to };
      this.emitBoard({ type: 'merge', from, to, item: merged, isNew });
      if (merged.level === merged.maxLevel) {
        this.pushToast(`최고 단계 달성! ${merged.emoji} ${merged.name}`, 'success', { icon: '🏆' });
      } else if (isNew) {
        this.pushToast(`새 아이템 발견! ${merged.emoji} ${merged.name}`, 'success', { icon: '✨' });
      }
      this.commit();
      return 'merge';
    }

    if (a.id === target.id && a.level >= a.maxLevel) {
      this.pushToast('최고 단계 아이템은 더 이상 합칠 수 없어요', 'info', { icon: '🏆' });
    }
    toRow[to.col] = a;
    fromRow[from.col] = target;
    this.selected = { ...to };
    this.emitBoard({ type: 'swap', from, to });
    this.commit();
    return 'swap';
  }

  spawnFromGenerator(category: ItemCategory): boolean {
    const d = this.data;
    if (d.energy < 1) {
      this.pushToast('에너지가 부족해요! 상점에서 충전할 수 있어요', 'warn', { icon: '⚡' });
      this.shopOpen = true;
      sfx.error();
      this.commit(false);
      return false;
    }
    const genIndex = Math.max(0, CATEGORIES.indexOf(category));
    const prefCol = (genIndex + 0.5) * (BOARD_COLS / CATEGORIES.length) - 0.5;
    const pos = MergeManager.findNearestEmpty(d.boardState, BOARD_ROWS, prefCol);
    if (!pos) {
      this.pushToast('보드가 가득 찼어요! 합치거나 판매해서 공간을 만들어 주세요', 'warn', { icon: '📦' });
      sfx.error();
      this.commit(false);
      return false;
    }
    const level = MergeManager.rollGeneratorLevel(d.generatorLevels[category] ?? 1);
    const item = MergeManager.getItem(category, level) ?? MergeManager.getItem(category, 1);
    if (!item) return false;

    const wasFull = d.energy >= d.maxEnergy;
    d.energy -= 1;
    if (wasFull && d.energy < d.maxEnergy) d.lastEnergyRegenTime = Date.now();
    const spawnRow = d.boardState[pos.row];
    if (!spawnRow) return false;
    spawnRow[pos.col] = item;
    if (!d.discoveredItems.includes(item.id)) d.discoveredItems.push(item.id);
    d.stats.itemsSpawned += 1;
    this.emitBoard({ type: 'spawn', category, to: pos, item });
    this.commit();
    return true;
  }

  deliverOrder(orderId: string): boolean {
    const d = this.data;
    const idx = d.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return false;
    const order = d.orders[idx];
    if (!order) return false;
    const pos = this.findItemFor(order.requiredCategory, order.requiredLevel);
    if (!pos) {
      this.pushToast('아직 필요한 아이템이 보드에 없어요', 'info', { icon: '🔍' });
      sfx.error();
      this.commit(false);
      return false;
    }
    const deliverRow = d.boardState[pos.row];
    if (!deliverRow) return false;
    deliverRow[pos.col] = null;
    if (this.samePos(this.selected, pos)) this.selected = null;
    d.coins = Math.min(999999, d.coins + order.rewardCoins);
    d.hearts = Math.min(99999, d.hearts + order.rewardHearts);
    d.stats.ordersCompleted += 1;
    const next = OrderManager.create(
      d,
      d.orders.filter((_, i) => i !== idx),
    );
    d.orders = d.orders.map((o, i) => (i === idx ? next : o));
    this.emitBoard({ type: 'remove', at: pos, reason: 'deliver' });
    const goldenDelivered = !!order.golden;
    this.pushToast(
      goldenDelivered ? `황금 주문 달성! ${withJosa(order.petName, '이/가')} 크게 기뻐해요! 👑` : `${withJosa(order.petName, '이/가')} 행복해졌어요!`,
      'reward',
      {
        icon: goldenDelivered ? '👑' : '💖',
        coins: order.rewardCoins,
        hearts: order.rewardHearts,
      },
    );
    this.commit();
    return true;
  }

  sellItem(pos: CellPos) {
    const row = this.data.boardState[pos.row];
    const item = row?.[pos.col];
    if (!item || !row) return;
    const price = MergeManager.sellPrice(item);
    row[pos.col] = null;
    this.data.coins = Math.min(999999, this.data.coins + price);
    if (this.samePos(this.selected, pos)) this.selected = null;
    this.emitBoard({ type: 'remove', at: pos, reason: 'sell', value: price });
    this.pushToast(`${item.emoji} ${withJosa(item.name, '을/를')} 판매했어요`, 'info', { icon: '💰', coins: price });
    this.commit();
  }

  completeTask(taskId: string): boolean {
    const areaIndex = SHELTER_AREAS.findIndex((a) => a.tasks.some((t) => t.id === taskId));
    if (areaIndex < 0) return false;
    const area = SHELTER_AREAS[areaIndex];
    if (!area) return false;
    const task = area.tasks.find((t) => t.id === taskId);
    const d = this.data;
    if (!task || d.completedTasks.includes(taskId)) return false;

    if (!isAreaUnlocked(d, areaIndex)) {
      this.pushToast('이전 구역을 먼저 복원해 주세요', 'info', { icon: '🔒' });
      this.commit(false);
      return false;
    }
    if (d.hearts < task.hearts || d.coins < task.coins) {
      const lack: string[] = [];
      if (d.hearts < task.hearts) lack.push(`하트 ${task.hearts - d.hearts}개`);
      if (d.coins < task.coins) lack.push(`코인 ${task.coins - d.coins}개`);
      this.pushToast(`${lack.join(', ')}가 더 필요해요`, 'warn', { icon: '🧺' });
      sfx.error();
      this.commit(false);
      return false;
    }

    d.hearts -= task.hearts;
    d.coins -= task.coins;
    d.completedTasks.push(taskId);

    if (isAreaComplete(d, areaIndex)) {
      const r = area.reward;
      if (r.unlockPet && !d.unlockedPets.includes(r.unlockPet)) d.unlockedPets.push(r.unlockPet);
      if (r.maxEnergy) d.maxEnergy += r.maxEnergy;
      if (r.coins) d.coins += r.coins;
      (r.generators ?? []).forEach((cat) => {
        d.generatorLevels[cat] = Math.min(MAX_GENERATOR_LEVEL, (d.generatorLevels[cat] ?? 1) + 1);
      });
      // 의도된 사양: 구역 완료 시 에너지 가득 충전 보너스 (CelebrationModal 문구와 일치)
      d.energy = Math.max(d.energy, d.maxEnergy);
      d.lastEnergyRegenTime = Date.now();
      this.recomputeProgress();
      this.ensureOrders();
      this.celebration = area.id;
      sfx.fanfare();
    } else {
      this.pushToast(`${task.emoji} ${task.name} 완료!`, 'success', { icon: '✨' });
      sfx.restore();
    }
    this.commit();
    return true;
  }

  refreshOrder(orderId: string): boolean {
    const d = this.data;
    const idx = d.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) return false;
    if (d.coins < REFRESH_ORDER_COST) {
      this.pushToast(`다른 친구를 부르려면 코인 ${REFRESH_ORDER_COST}개가 필요해요`, 'warn', { icon: '💰' });
      sfx.error();
      this.commit(false);
      return false;
    }
    d.coins -= REFRESH_ORDER_COST;
    const next = OrderManager.create(
      d,
      d.orders.filter((_, i) => i !== idx),
    );
    d.orders = d.orders.map((o, i) => (i === idx ? next : o));
    this.pushToast(`${withJosa(next.petName, '이/가')} 새로 찾아왔어요!`, 'info', { icon: '🐾' });
    sfx.tap();
    this.commit();
    return true;
  }

  buyEnergy(id: EnergyPack['id']): boolean {
    const pack = ENERGY_PACKS.find((p) => p.id === id);
    if (!pack) return false;
    const d = this.data;
    if (pack.energy === 'full' && d.energy >= d.maxEnergy) {
      this.pushToast('에너지가 이미 가득 차 있어요!', 'info', { icon: '⚡' });
      this.commit(false);
      return false;
    }
    const price = pack.energy === 'full' ? energyFullPrice(d) : pack.price;
    if (d.coins < price) {
      this.pushToast(`코인이 ${price - d.coins}개 부족해요`, 'warn', { icon: '💰' });
      sfx.error();
      this.commit(false);
      return false;
    }
    const gain = pack.energy === 'full' ? d.maxEnergy - d.energy : pack.energy;
    d.coins -= price;
    d.energy = Math.min(d.maxEnergy, d.energy + gain);
    this.pushToast(`${pack.label} 충전 완료!`, 'success', { icon: '⚡', energy: gain });
    sfx.buy();
    this.commit();
    return true;
  }

  claimGift(): boolean {
    const now = Date.now();
    const d = this.data;
    if (now - d.lastGiftTime < GIFT_COOLDOWN_MS) return false;
    d.lastGiftTime = now;
    const energy = this.addEnergy(5);
    d.coins = Math.min(999999, d.coins + 10);
    this.pushToast('쉼터 후원 선물이 도착했어요!', 'reward', { icon: '🎁', energy, coins: 10 });
    sfx.buy();
    this.commit();
    return true;
  }

  /** 보상형광고 시청 보상 (포털 SDK 성공 후 호출) */
  grantAdReward(kind: 'energy' | 'giftBonus'): void {
    const d = this.data;
    if (kind === 'energy') {
      const gain = this.addEnergy(15);
      this.pushToast('광고 보상! 에너지 충전 ⚡', 'reward', { icon: '🎬', energy: gain });
    } else {
      const gain = this.addEnergy(5);
      d.coins = Math.min(999999, d.coins + 10);
      this.pushToast('후원 선물 2배! 🎁🎁', 'reward', { icon: '🎬', energy: gain, coins: 10 });
    }
    sfx.buy();
    this.commit();
  }

  /* ---------------- 일일보상 & 도감 보상 ---------------- */
  private dailyReward(day: number): { coins: number; energy: number } {
    return DAILY_REWARDS[Math.min(Math.max(day, 1), 7) - 1] ?? { coins: 20, energy: 5 };
  }

  dailyStatus(): { available: boolean; streakDay: number; coins: number; energy: number } {
    const d = this.data;
    const now = Date.now();
    const today = new Date(now).toDateString();
    if (d.lastDaily > 0 && new Date(d.lastDaily).toDateString() === today) {
      const r = this.dailyReward(d.dailyStreak);
      return { available: false, streakDay: Math.min(Math.max(d.dailyStreak, 1), 7), coins: r.coins, energy: r.energy };
    }
    const yesterday = new Date(now - 86400000).toDateString();
    const continued = d.lastDaily > 0 && new Date(d.lastDaily).toDateString() === yesterday;
    const next = continued ? (d.dailyStreak % 7) + 1 : 1;
    const r = this.dailyReward(next);
    return { available: true, streakDay: next, coins: r.coins, energy: r.energy };
  }

  claimDaily(): boolean {
    const st = this.dailyStatus();
    if (!st.available) return false;
    const d = this.data;
    d.lastDaily = Date.now();
    d.dailyStreak = st.streakDay;
    d.coins = Math.min(999999, d.coins + st.coins);
    const energy = this.addEnergy(st.energy);
    this.pushToast(`출석 ${st.streakDay}일째 보상! 내일도 와주세요 📅`, 'reward', {
      icon: '📅',
      coins: st.coins,
      energy,
    });
    sfx.buy();
    this.commit();
    return true;
  }

  claimCollection(tier: number): boolean {
    const def = COLLECTION_TIERS.find((t) => t.count === tier);
    const d = this.data;
    if (!def || d.claimedCollection.includes(tier)) return false;
    if (d.discoveredItems.length < tier) return false;
    d.claimedCollection.push(tier);
    d.coins = Math.min(999999, d.coins + def.coins);
    const energy = this.addEnergy(def.energy);
    this.pushToast(`도감 ${tier}종 달성! 수집가 보상 🏆`, 'reward', {
      icon: '📚',
      coins: def.coins,
      energy,
    });
    sfx.fanfare();
    this.commit();
    return true;
  }

  setShopOpen(open: boolean) {
    if (this.shopOpen === open) return;
    this.shopOpen = open;
    this.commit(false);
  }

  closeCelebration() {
    this.celebration = null;
    this.commit(false);
  }

  /** 인터랙티브 튜토리얼 완료: 수료 보상 + seen 처리 */
  finishTutorial() {
    const d = this.data;
    if (d.tutorialSeen) return;
    d.tutorialSeen = true;
    d.coins = Math.min(999999, d.coins + 30);
    const energy = this.addEnergy(10);
    this.pushToast('튜토리얼 완료! 환영 선물 도착 🎁', 'reward', { icon: '🎓', coins: 30, energy });
    sfx.fanfare();
    this.commit();
  }

  /** 튜토리얼 건너뛰기: 보상 없이 seen 처리 */
  skipTutorial() {
    if (this.data.tutorialSeen) return;
    this.data.tutorialSeen = true;
    this.commit();
  }

  hint(category: ItemCategory, level: number) {
    this.hintListeners.forEach((l) => l({ category, level }));
  }

  reset() {
    this.data = SaveManager.reset();
    this.recomputeProgress();
    this.ensureOrders();
    this.selected = null;
    this.celebration = null;
    this.shopOpen = false;
    this.toasts = [];
    this.emitBoard({ type: 'reset' });
    this.commit();
  }
}

export const gameStore = new GameStore();
