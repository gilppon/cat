import * as Phaser from 'phaser';
import { gameStore } from '../managers/GameStore';
import type { Hint } from '../managers/GameStore';
import { BOARD_COLS, BOARD_ROWS, CATEGORIES, CATEGORY_META, MergeManager } from '../managers/MergeManager';
import type { BoardEvent, CellPos, ItemCategory, ItemConfig } from '../types/game';
import {
  BOARD_H,
  BOARD_W,
  BOARD_X,
  BOARD_Y,
  CELL,
  FONT_UI,
  GAME_H,
  GAME_W,
  GEN_H,
  GEN_W,
  GEN_X,
  GEN_Y,
  SHELF_H,
  SHELF_Y,
  cellCenter,
  hexToInt,
} from '../game/constants';
import { sfx } from '../lib/sfx';

/** 보드 위 아이템 하나의 시각 표현 */
class ItemView {
  readonly container: Phaser.GameObjects.Container;
  readonly badge: Phaser.GameObjects.Image;
  readonly item: ItemConfig;

  constructor(scene: Phaser.Scene, x: number, y: number, item: ItemConfig) {
    this.item = item;
    const img = scene.add.image(0, 0, item.textureKey);
    this.badge = scene.add.image(46, -46, 'check_badge').setVisible(false);
    this.container = scene.add.container(x, y, [img, this.badge]);
    this.container.setDepth(10);
  }

  destroy() {
    this.container.destroy();
  }
}

interface PressState {
  pos: CellPos;
  view: ItemView;
  startX: number;
  startY: number;
  offX: number;
  offY: number;
  dragging: boolean;
}

interface GeneratorView {
  category: ItemCategory;
  container: Phaser.GameObjects.Container;
  emoji: Phaser.GameObjects.Image;
  stars: Phaser.GameObjects.Text;
  x: number;
  y: number;
}

function emptyGrid(): (ItemView | null)[][] {
  return Array.from({ length: BOARD_ROWS }, () => Array<ItemView | null>(BOARD_COLS).fill(null));
}

/* =========================================================
 * MainScene - 머지 보드 & 생성기 (드래그 앤 드롭, 합치기 연출)
 * ========================================================= */
export class MainScene extends Phaser.Scene {
  private views: (ItemView | null)[][] = [];
  private press: PressState | null = null;
  private selectRing!: Phaser.GameObjects.Image;
  private hover!: Phaser.GameObjects.Image;
  private generators: GeneratorView[] = [];
  private starFx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private heartFx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private coinFx!: Phaser.GameObjects.Particles.ParticleEmitter;
  private unsubs: Array<() => void> = [];
  private alive = false;
  private cursor = 'default';

  constructor() {
    super('MainScene');
  }

  create() {
    this.alive = true;
    this.views = emptyGrid();
    this.generators = [];
    this.press = null;

    this.drawBoard();
    this.createGenerators();
    this.hover = this.add.image(0, 0, 'hover_move').setVisible(false).setDepth(4);
    this.selectRing = this.add.image(0, 0, 'select_ring').setVisible(false).setDepth(9);
    this.tweens.add({
      targets: this.selectRing,
      alpha: { from: 1, to: 0.4 },
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.createEmitters();
    this.rebuildAll(true);
    this.refreshOverlay();

    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onDown, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onMove, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.onUp, this);
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.onUp, this);

    this.unsubs.push(gameStore.onBoard((e) => this.onBoardEvent(e)));
    this.unsubs.push(gameStore.subscribe(() => this.refreshOverlay()));
    this.unsubs.push(gameStore.onHint((h) => this.showHint(h)));

    this.time.addEvent({ delay: 2600, loop: true, callback: this.idleWiggle, callbackScope: this });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
  }

  private cleanup() {
    this.alive = false;
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
  }

  /* ---------------- 배경 ---------------- */
  private drawBoard() {
    const g = this.add.graphics().setDepth(0);
    const fx = BOARD_X - 22;
    const fy = BOARD_Y - 22;
    const fw = BOARD_W + 44;
    const fh = BOARD_H + 44;
    g.fillStyle(0x6b3f1d, 0.2);
    g.fillRoundedRect(fx + 4, fy + 12, fw, fh, 46);
    g.fillStyle(0xc4874f, 1);
    g.fillRoundedRect(fx, fy, fw, fh, 46);
    g.fillStyle(0xe2ae78, 1);
    g.fillRoundedRect(fx + 7, fy + 7, fw - 14, fh - 14, 40);
    g.lineStyle(3, 0xf6d2a2, 0.9);
    g.strokeRoundedRect(fx + 7, fy + 7, fw - 14, fh - 14, 40);
    g.fillStyle(0xf8e8cf, 1);
    g.fillRoundedRect(BOARD_X - 8, BOARD_Y - 8, BOARD_W + 16, BOARD_H + 16, 30);

    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const p = cellCenter(r, c);
        this.add.image(p.x, p.y, (r + c) % 2 === 0 ? 'cell_a' : 'cell_b').setDepth(1);
      }
    }

    const s = this.add.graphics().setDepth(0);
    s.fillStyle(0x6b3f1d, 0.12);
    s.fillRoundedRect(22, SHELF_Y + 8, GAME_W - 44, SHELF_H, 44);
    s.fillStyle(0xffffff, 0.5);
    s.fillRoundedRect(22, SHELF_Y, GAME_W - 44, SHELF_H, 44);
    s.lineStyle(4, 0xffffff, 0.85);
    s.strokeRoundedRect(22, SHELF_Y, GAME_W - 44, SHELF_H, 44);
  }

  private createGenerators() {
    CATEGORIES.forEach((cat, i) => {
      const meta = CATEGORY_META[cat]!;
      const x = GEN_X[i] ?? GAME_W / 2;
      const y = GEN_Y;
      const card = this.add.image(0, 0, `gen_card_${cat}`);
      const emoji = this.add.image(0, -34, `gen_emoji_${cat}`);
      const name = this.add
        .text(0, 40, meta.generatorName, {
          fontFamily: FONT_UI,
          fontSize: '32px',
          color: '#FFFFFF',
          stroke: meta.dark,
          strokeThickness: 8,
        })
        .setOrigin(0.5);
      const stars = this.add
        .text(0, 72, '★☆☆', {
          fontFamily: FONT_UI,
          fontSize: '22px',
          color: '#FFE27A',
          stroke: meta.dark,
          strokeThickness: 5,
        })
        .setOrigin(0.5);
      const chip = this.add.image(GEN_W / 2 - 46, -GEN_H / 2 + 30, 'chip');
      const chipText = this.add
        .text(GEN_W / 2 - 46, -GEN_H / 2 + 31, '⚡1', {
          fontFamily: FONT_UI,
          fontSize: '24px',
          color: '#E08A00',
        })
        .setOrigin(0.5);
      const container = this.add.container(x, y, [card, emoji, name, stars, chip, chipText]).setDepth(8);
      this.tweens.add({
        targets: emoji,
        y: -40,
        duration: 1250 + i * 170,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.generators.push({ category: cat, container, emoji, stars, x, y });
    });
  }

  private createEmitters() {
    this.starFx = this.add
      .particles(0, 0, 'fx_star', {
        speed: { min: 160, max: 430 },
        angle: { min: 0, max: 360 },
        rotate: { min: 0, max: 360 },
        scale: { start: 0.95, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: { min: 380, max: 760 },
        gravityY: 520,
        tint: [0xffffff, 0xffe066, 0xffb3d9, 0xa8e6ff],
        emitting: false,
      })
      .setDepth(90);
    this.heartFx = this.add
      .particles(0, 0, 'fx_heart', {
        speed: { min: 140, max: 320 },
        angle: { min: 200, max: 340 },
        scale: { start: 1.1, end: 0.35 },
        alpha: { start: 1, end: 0 },
        lifespan: 950,
        gravityY: -60,
        emitting: false,
      })
      .setDepth(90);
    this.coinFx = this.add
      .particles(0, 0, 'fx_coin', {
        speed: { min: 160, max: 340 },
        angle: { min: 220, max: 320 },
        scale: { start: 1, end: 0.5 },
        alpha: { start: 1, end: 0 },
        lifespan: 720,
        gravityY: 760,
        emitting: false,
      })
      .setDepth(90);
  }

  /* ---------------- 입력 ---------------- */
  private cellAt(x: number, y: number): CellPos | null {
    const col = Math.floor((x - BOARD_X) / CELL);
    const row = Math.floor((y - BOARD_Y) / CELL);
    if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) return null;
    return { row, col };
  }

  private generatorAt(x: number, y: number): GeneratorView | null {
    return (
      this.generators.find((g) => Math.abs(x - g.x) <= GEN_W / 2 - 6 && Math.abs(y - g.y) <= GEN_H / 2 - 6) ?? null
    );
  }

  private onDown(p: Phaser.Input.Pointer) {
    if (this.press) return;
    const gen = this.generatorAt(p.x, p.y);
    if (gen) {
      this.tapGenerator(gen);
      return;
    }
    const pos = this.cellAt(p.x, p.y);
    if (!pos) return;
    const view = this.views[pos.row]?.[pos.col];
    if (!view) {
      gameStore.select(null);
      return;
    }
    this.tweens.killTweensOf(view.container);
    const c = cellCenter(pos.row, pos.col);
    view.container.setPosition(c.x, c.y).setAngle(0).setAlpha(1).setScale(1.06);
    this.press = { pos, view, startX: p.x, startY: p.y, offX: c.x - p.x, offY: c.y - p.y, dragging: false };
  }

  private setCursor(cursor: string) {
    if (this.cursor === cursor) return;
    this.cursor = cursor;
    this.input.setDefaultCursor(cursor);
  }

  private onMove(p: Phaser.Input.Pointer) {
    const pr = this.press;
    if (!pr) {
      const pos = this.cellAt(p.x, p.y);
      const over = !!this.generatorAt(p.x, p.y) || (!!pos && !!(pos && this.views[pos.row]?.[pos.col]));
      this.setCursor(over ? 'pointer' : 'default');
      return;
    }
    if (!pr.dragging) {
      if (Phaser.Math.Distance.Between(p.x, p.y, pr.startX, pr.startY) < 14) return;
      pr.dragging = true;
      pr.view.container.setDepth(100);
      this.tweens.add({ targets: pr.view.container, scale: 1.16, duration: 120, ease: 'Quad.easeOut' });
      gameStore.select(pr.pos);
      this.selectRing.setVisible(false);
      this.setCursor('grabbing');
      sfx.pick();
    }
    const x = Phaser.Math.Clamp(p.x + pr.offX, 40, GAME_W - 40);
    const y = Phaser.Math.Clamp(p.y + pr.offY - 12, 40, GAME_H - 40);
    pr.view.container.setPosition(x, y);
    this.updateHover(pr, x, y + 12);
  }

  private onUp() {
    const pr = this.press;
    if (!pr) return;
    this.press = null;
    this.hover.setVisible(false);
    this.setCursor('default');
    const { view } = pr;

    if (!pr.dragging) {
      this.tweens.add({ targets: view.container, scale: 1, duration: 160, ease: 'Back.easeOut' });
      const sel = gameStore.getSnapshot().selected;
      if (sel && sel.row === pr.pos.row && sel.col === pr.pos.col) this.wiggle(view);
      gameStore.select(pr.pos);
      sfx.tap();
      this.refreshOverlay();
      return;
    }

    const target = this.cellAt(view.container.x, view.container.y + 12);
    if (!target || (target.row === pr.pos.row && target.col === pr.pos.col)) {
      this.returnHome(view, pr.pos);
      this.refreshOverlay();
      return;
    }
    const res = gameStore.moveItem(pr.pos, target);
    if (res === 'none') this.returnHome(view, pr.pos);
    this.refreshOverlay();
  }

  private updateHover(pr: PressState, x: number, y: number) {
    const target = this.cellAt(x, y);
    if (!target || (target.row === pr.pos.row && target.col === pr.pos.col)) {
      this.hover.setVisible(false);
      return;
    }
    const board = gameStore.board;
    const canMerge = MergeManager.canMerge(board[pr.pos.row]?.[pr.pos.col], board[target.row]?.[target.col]);
    const c = cellCenter(target.row, target.col);
    this.hover
      .setTexture(canMerge ? 'hover_merge' : 'hover_move')
      .setPosition(c.x, c.y)
      .setVisible(true);
  }

  private tapGenerator(g: GeneratorView) {
    this.tweens.killTweensOf(g.container);
    g.container.setScale(1);
    this.tweens.add({
      targets: g.container,
      scaleX: { from: 0.9, to: 1 },
      scaleY: { from: 1.07, to: 1 },
      duration: 320,
      ease: 'Back.easeOut',
    });
    gameStore.spawnFromGenerator(g.category);
  }

  /* ---------------- 보드 이벤트 연출 ---------------- */
  private onBoardEvent(e: BoardEvent) {
    if (!this.alive) return;
    switch (e.type) {
      case 'move': {
        const v = this.take(e.from);
        this.put(e.to, v);
        if (v) this.glide(v, e.to);
        sfx.drop();
        break;
      }
      case 'swap': {
        const a = this.take(e.from);
        const b = this.take(e.to);
        this.put(e.to, a);
        this.put(e.from, b);
        if (a) this.glide(a, e.to);
        if (b) this.glide(b, e.from);
        sfx.drop();
        break;
      }
      case 'merge':
        this.playMerge(e.from, e.to, e.item, e.isNew);
        break;
      case 'spawn':
        this.playSpawn(e.category, e.to, e.item);
        break;
      case 'remove':
        this.playRemove(e.at, e.reason, e.value ?? 0);
        break;
      case 'reset':
        this.rebuildAll(true);
        break;
    }
  }

  private take(pos: CellPos): ItemView | null {
    const row = this.views[pos.row];
    const v = row?.[pos.col];
    if (row) row[pos.col] = null;
    return v ?? null;
  }

  private put(pos: CellPos, v: ItemView | null) {
    const row = this.views[pos.row];
    if (!row) return;
    const old = row[pos.col];
    if (old && old !== v) old.destroy();
    row[pos.col] = v;
  }

  private glide(v: ItemView, pos: CellPos) {
    const c = cellCenter(pos.row, pos.col);
    this.tweens.killTweensOf(v.container);
    this.tweens.add({
      targets: v.container,
      x: c.x,
      y: c.y,
      scale: 1,
      angle: 0,
      alpha: 1,
      duration: 210,
      ease: 'Back.easeOut',
      onComplete: () => v.container.setDepth(10),
    });
  }

  private returnHome(v: ItemView, pos: CellPos) {
    this.glide(v, pos);
    sfx.drop();
  }

  private playMerge(from: CellPos, to: CellPos, item: ItemConfig, isNew: boolean) {
    const a = this.take(from);
    const b = this.take(to);
    const c = cellCenter(to.row, to.col);
    const meta = CATEGORY_META[item.category];

    if (a) {
      this.tweens.killTweensOf(a.container);
      a.container.setDepth(30);
      this.tweens.add({
        targets: a.container,
        x: c.x,
        y: c.y,
        scale: 0.5,
        alpha: 0,
        duration: 150,
        ease: 'Quad.easeIn',
        onComplete: () => a.destroy(),
      });
    }
    if (b) {
      this.tweens.killTweensOf(b.container);
      this.tweens.add({
        targets: b.container,
        scale: 0.5,
        alpha: 0,
        duration: 150,
        ease: 'Quad.easeIn',
        onComplete: () => b.destroy(),
      });
    }

    const nv = new ItemView(this, c.x, c.y, item);
    nv.container.setScale(0.1).setDepth(40);
    this.put(to, nv);
    this.tweens.add({
      targets: nv.container,
      scale: 1,
      duration: 430,
      delay: 110,
      ease: 'Back.easeOut',
      onComplete: () => nv.container.setDepth(10),
    });

    this.time.delayedCall(110, () => {
      if (!this.alive) return;
      this.starFx.explode(14 + item.level * 3, c.x, c.y);
      const ring = this.add.image(c.x, c.y, 'fx_ring').setDepth(85).setScale(0.35).setTint(hexToInt(meta.mid));
      this.tweens.add({
        targets: ring,
        scale: 1.3,
        alpha: 0,
        duration: 460,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy(),
      });
    });

    if (item.level === item.maxLevel) {
      this.floatText(c.x, c.y - 58, 'MAX!', '#FFD34D', '#9A5B00');
      this.cameras.main.shake(180, 0.005);
    } else if (isNew) {
      this.floatText(c.x, c.y - 58, 'NEW!', '#FF5FA2', '#FFFFFF');
    } else {
      this.floatText(c.x, c.y - 58, `Lv.${item.level}`, '#FFFFFF', meta.dark);
    }
    if (item.level >= 5 && item.level < item.maxLevel) this.cameras.main.shake(120, 0.0032);
    sfx.merge(item.level);
  }

  private playSpawn(category: ItemCategory, to: CellPos, item: ItemConfig) {
    const gi = CATEGORIES.indexOf(category);
    const g = this.generators[gi];
    const sx = g ? g.x : GAME_W / 2;
    const sy = g ? g.y - 34 : GAME_H;
    const c = cellCenter(to.row, to.col);
    const v = new ItemView(this, sx, sy, item);
    v.container.setScale(0.35).setDepth(50);
    this.put(to, v);
    if (g) {
      this.tweens.add({
        targets: g.emoji,
        scale: { from: 1.25, to: 1 },
        duration: 260,
        ease: 'Back.easeOut',
      });
    }
    this.tweens.add({
      targets: v.container,
      x: { value: c.x, ease: 'Cubic.easeOut' },
      y: { value: c.y, ease: 'Back.easeOut' },
      scale: { value: 1, ease: 'Back.easeOut' },
      duration: 470,
      onComplete: () => {
        v.container.setDepth(10);
        if (this.alive) this.starFx.explode(5, c.x, c.y);
      },
    });
    if (item.level > 1) this.floatText(c.x, c.y - 52, '보너스!', '#FFE066', '#B86B00');
    sfx.spawn();
  }

  private playRemove(at: CellPos, reason: 'deliver' | 'sell', value: number) {
    const v = this.take(at);
    if (!v) return;
    if (this.press && this.press.view === v) {
      this.press = null;
      this.hover.setVisible(false);
    }
    this.tweens.killTweensOf(v.container);
    const c = cellCenter(at.row, at.col);
    v.container.setDepth(70);

    if (reason === 'deliver') {
      this.heartFx.explode(10, c.x, c.y);
      this.starFx.explode(10, c.x, c.y);
      this.tweens.add({
        targets: v.container,
        scale: 1.3,
        duration: 170,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: v.container,
            y: -140,
            scale: 0.6,
            alpha: 0.25,
            duration: 640,
            ease: 'Cubic.easeIn',
            onComplete: () => v.destroy(),
          });
        },
      });
      this.floatText(c.x, c.y - 50, '고마워요!', '#FF5FA2', '#FFFFFF');
      sfx.deliver();
    } else {
      this.coinFx.explode(Math.min(12, 4 + value), c.x, c.y);
      this.floatText(c.x, c.y - 44, `+${value}`, '#FFD34D', '#8A5A00');
      this.tweens.add({
        targets: v.container,
        scale: 0,
        angle: 160,
        duration: 300,
        ease: 'Back.easeIn',
        onComplete: () => v.destroy(),
      });
      sfx.coin();
    }
  }

  private rebuildAll(animate: boolean) {
    this.press = null;
    this.views.forEach((row) => row.forEach((v) => v?.destroy()));
    this.views = emptyGrid();
    const board = gameStore.board;
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const item = board[r]?.[c];
        if (!item) continue;
        const p = cellCenter(r, c);
        const v = new ItemView(this, p.x, p.y, item);
        const row = this.views[r];
        if (row) row[c] = v;
        if (animate) {
          v.container.setScale(0);
          this.tweens.add({
            targets: v.container,
            scale: 1,
            duration: 380,
            delay: 80 + (r + c) * 45,
            ease: 'Back.easeOut',
          });
        }
      }
    }
  }

  /** 저장소 상태와 스프라이트 격자가 어긋났을 때 조용히 보정 */
  private syncBoard() {
    const board = gameStore.board;
    for (let r = 0; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        if (this.press && this.press.pos.row === r && this.press.pos.col === c) continue;
        const item = board[r]?.[c] ?? null;
        const row = this.views[r];
        if (!row) continue;
        const v = row[c];
        if (!item) {
          if (v) {
            v.destroy();
            row[c] = null;
          }
          continue;
        }
        if (v && v.item.id === item.id) continue;
        if (v) v.destroy();
        const p = cellCenter(r, c);
        row[c] = new ItemView(this, p.x, p.y, item);
      }
    }
  }

  /** 선택 표시, 주문 완료 가능 배지, 생성기 상태 갱신 */
  private refreshOverlay() {
    if (!this.alive) return;
    this.syncBoard();
    const data = gameStore.live;
    const sel = gameStore.getSnapshot().selected;

    if (sel && data.boardState[sel.row]?.[sel.col] && !this.press?.dragging) {
      const c = cellCenter(sel.row, sel.col);
      this.selectRing.setPosition(c.x, c.y).setVisible(true);
    } else {
      this.selectRing.setVisible(false);
    }

    const needed = new Set(data.orders.map((o) => `${o.requiredCategory}_${o.requiredLevel}`));
    this.views.forEach((row) =>
      row.forEach((v) => {
        if (v) v.badge.setVisible(needed.has(v.item.id));
      }),
    );

    const noEnergy = data.energy < 1;
    this.generators.forEach((g) => {
      g.container.setAlpha(noEnergy ? 0.6 : 1);
      const lvl = Math.max(1, Math.min(3, data.generatorLevels[g.category] ?? 1));
      g.stars.setText('★'.repeat(lvl) + '☆'.repeat(3 - lvl));
    });
  }

  /* ---------------- 부가 연출 ---------------- */
  private showHint(h: Hint) {
    if (!this.alive) return;
    let found = 0;
    this.views.forEach((row) =>
      row.forEach((v) => {
        if (v && v.item.category === h.category && v.item.level === h.level && v !== this.press?.view) {
          found += 1;
          this.pulse(v.container, 3);
        }
      }),
    );
    if (found) return;

    this.views.forEach((row) =>
      row.forEach((v) => {
        if (v && v.item.category === h.category && v.item.level < h.level && v !== this.press?.view) {
          this.pulse(v.container, 1);
        }
      }),
    );
    const g = this.generators[CATEGORIES.indexOf(h.category)];
    if (g) {
      this.tweens.killTweensOf(g.container);
      g.container.setScale(1);
      this.tweens.add({
        targets: g.container,
        scale: 1.08,
        duration: 200,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut',
        onComplete: () => g.container.setScale(1),
      });
      this.floatText(g.x, g.y - GEN_H / 2 - 6, '여기를 탭!', '#FFFFFF', CATEGORY_META[h.category].dark);
    }
  }

  private pulse(target: Phaser.GameObjects.Container, repeat: number) {
    this.tweens.killTweensOf(target);
    target.setScale(1);
    this.tweens.add({
      targets: target,
      scale: 1.2,
      duration: 180,
      yoyo: true,
      repeat,
      ease: 'Sine.easeInOut',
      onComplete: () => target.setScale(1),
    });
  }

  private wiggle(v: ItemView) {
    this.tweens.add({
      targets: v.container,
      angle: { from: -9, to: 9 },
      duration: 80,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
      onComplete: () => v.container.setAngle(0),
    });
  }

  private idleWiggle() {
    if (!this.alive || this.press) return;
    const ready: ItemView[] = [];
    this.views.forEach((row) =>
      row.forEach((v) => {
        if (v && v.badge.visible) ready.push(v);
      }),
    );
    if (ready.length) {
      const pick = ready[Math.floor(Math.random() * ready.length)];
      if (pick) this.wiggle(pick);
      return;
    }
    if (Math.random() < 0.4 && this.generators.length) {
      const g = this.generators[Math.floor(Math.random() * this.generators.length)];
      if (!g) return;
      this.tweens.add({
        targets: g.emoji,
        angle: { from: -10, to: 10 },
        duration: 90,
        yoyo: true,
        repeat: 3,
        onComplete: () => g.emoji.setAngle(0),
      });
    }
  }

  private floatText(x: number, y: number, text: string, color: string, stroke: string) {
    const t = this.add
      .text(x, y, text, {
        fontFamily: FONT_UI,
        fontSize: '40px',
        color,
        stroke,
        strokeThickness: 9,
      })
      .setOrigin(0.5)
      .setDepth(95)
      .setScale(0.5);
    this.tweens.add({ targets: t, scale: 1, duration: 220, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: t,
      y: y - 64,
      alpha: 0,
      delay: 260,
      duration: 700,
      ease: 'Cubic.easeIn',
      onComplete: () => t.destroy(),
    });
  }
}
