import * as Phaser from 'phaser';
import { CATEGORIES, CATEGORY_META, ITEM_DATABASE } from '../managers/MergeManager';
import { CELL, FONT_EMOJI, FONT_UI, GAME_H, GAME_W, GEN_H, GEN_W, ITEM_TEX } from '../game/constants';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawPaw(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.22, s * 0.4, s * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  const toes: Array<[number, number]> = [
    [-0.42, -0.18],
    [-0.15, -0.44],
    [0.15, -0.44],
    [0.42, -0.18],
  ];
  toes.forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.ellipse(cx + dx * s, cy + dy * s, s * 0.14, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* =========================================================
 * BootScene - every texture is drawn straight onto a canvas (no external assets)
 * ========================================================= */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.add
      .text(GAME_W / 2, GAME_H / 2, '🐾 Getting the shelter ready…', {
        fontFamily: FONT_UI,
        fontSize: '44px',
        color: '#8a5a2b',
      })
      .setOrigin(0.5);

    this.makeCells();
    this.makeItems();
    this.makeGenerators();
    this.makeFx();

    let started = false;
    const go = () => {
      if (started) return;
      started = true;
      try {
        const game = this.sys?.game as (Phaser.Game & { pendingDestroy?: boolean }) | undefined;
        if (game && !game.pendingDestroy) this.scene.start('MainScene');
      } catch (e) {
        console.warn('Scene start skipped', e);
      }
    };

    try {
      // Google Fonts split glyphs by unicode-range, so name the exact strings we draw
      // on canvas to preload them.
      const sample = 'Food Pantry Toy Box First Aid Box Bonus! Thanks! Tap here! Getting the shelter ready NEW MAX Lv.0123456789+';
      Promise.race([
        document.fonts.load('32px "Jua"', sample).then(() => document.fonts.ready),
        new Promise((resolve) => window.setTimeout(resolve, 2200)),
      ]).then(go, go);
    } catch {
      go();
    }
  }

  private canvasTex(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
    if (this.textures.exists(key)) this.textures.remove(key);
    const tex = this.textures.createCanvas(key, w, h);
    if (!tex) return;
    const ctx = tex.getContext();
    draw(ctx);
    tex.refresh();
  }

  private makeCells() {
    const s = CELL;
    const draw = (key: string, fill: string) =>
      this.canvasTex(key, s, s, (ctx) => {
        roundRect(ctx, 5, 5, s - 10, s - 10, 24);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.save();
        roundRect(ctx, 5, 5, s - 10, s - 10, 24);
        ctx.clip();
        const g = ctx.createLinearGradient(0, 5, 0, 44);
        g.addColorStop(0, 'rgba(120,80,40,0.13)');
        g.addColorStop(1, 'rgba(120,80,40,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, s, 44);
        ctx.restore();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(205,160,110,0.4)';
        roundRect(ctx, 6, 6, s - 12, s - 12, 23);
        ctx.stroke();
        drawPaw(ctx, s / 2, s / 2 + 4, 36, 'rgba(160,115,70,0.075)');
      });
    draw('cell_a', '#FFF8EC');
    draw('cell_b', '#FAE9CF');
  }

  private makeItems() {
    Object.values(ITEM_DATABASE).forEach((item) => {
      const m = CATEGORY_META[item.category];
      const S = ITEM_TEX;
      const isMax = item.level >= item.maxLevel;
      this.canvasTex(item.textureKey, S, S, (ctx) => {
        const x = 10;
        const y = 8;
        const w = S - 20;
        const h = S - 20;
        const r = 30;
        // body + drop shadow
        ctx.save();
        ctx.shadowColor = 'rgba(90,55,20,0.32)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        roundRect(ctx, x, y, w, h, r);
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, m.light);
        g.addColorStop(1, m.mid);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
        // gloss
        ctx.save();
        roundRect(ctx, x, y, w, h, r);
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.beginPath();
        ctx.ellipse(S / 2, y + 6, w * 0.55, h * 0.27, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(x, y + h - 16, w, 16);
        ctx.restore();
        // border
        ctx.lineWidth = isMax ? 6 : 4;
        ctx.strokeStyle = isMax ? '#FFC93C' : 'rgba(255,255,255,0.95)';
        roundRect(ctx, x + 2, y + 2, w - 4, h - 4, r - 2);
        ctx.stroke();
        // emoji
        ctx.font = `66px ${FONT_EMOJI}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, S / 2, y + h / 2 + 3);
        // level badge
        const bx = x + w - 14;
        const by = y + h - 14;
        ctx.beginPath();
        ctx.arc(bx, by, 17, 0, Math.PI * 2);
        ctx.fillStyle = isMax ? '#FFB400' : m.dark;
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px "Arial Rounded MT Bold", Arial, sans-serif';
        ctx.fillText(String(item.level), bx, by + 1);
        if (isMax) {
          ctx.font = `26px ${FONT_EMOJI}`;
          ctx.fillText('✨', x + 18, y + 18);
        }
      });
    });
  }

  private makeGenerators() {
    CATEGORIES.forEach((cat) => {
      const m = CATEGORY_META[cat];
      this.canvasTex(`gen_card_${cat}`, GEN_W, GEN_H, (ctx) => {
        const x = 8;
        const y = 6;
        const w = GEN_W - 16;
        const h = GEN_H - 20;
        const r = 42;
        ctx.save();
        ctx.shadowColor = 'rgba(80,45,10,0.35)';
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 8;
        roundRect(ctx, x, y, w, h, r);
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, m.mid);
        g.addColorStop(1, m.dark);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
        ctx.save();
        roundRect(ctx, x, y, w, h, r);
        ctx.clip();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath();
        ctx.ellipse(GEN_W / 2, y, w * 0.6, h * 0.36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#FFFFFF';
        for (let i = -h; i < GEN_W; i += 36) {
          ctx.beginPath();
          ctx.moveTo(i, y + h);
          ctx.lineTo(i + 16, y + h);
          ctx.lineTo(i + 16 + h, y);
          ctx.lineTo(i + h, y);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(255,255,255,0.92)';
        roundRect(ctx, x + 3, y + 3, w - 6, h - 6, r - 3);
        ctx.stroke();
      });
      this.canvasTex(`gen_emoji_${cat}`, 130, 120, (ctx) => {
        ctx.fillStyle = 'rgba(255,255,255,0.38)';
        ctx.beginPath();
        ctx.ellipse(65, 62, 54, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `74px ${FONT_EMOJI}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(m.generatorEmoji, 65, 66);
      });
    });

    this.canvasTex('chip', 78, 42, (ctx) => {
      roundRect(ctx, 3, 3, 72, 36, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255,200,80,0.9)';
      ctx.stroke();
    });
  }

  private makeFx() {
    this.canvasTex('fx_star', 40, 40, (ctx) => {
      ctx.translate(20, 20);
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? 18 : 7.5;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    });

    this.canvasTex('fx_heart', 44, 44, (ctx) => {
      ctx.translate(22, 23);
      ctx.beginPath();
      ctx.moveTo(0, 13);
      ctx.bezierCurveTo(-21, -1, -12, -19, 0, -8);
      ctx.bezierCurveTo(12, -19, 21, -1, 0, 13);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, -16, 0, 14);
      g.addColorStop(0, '#FF9BC0');
      g.addColorStop(1, '#FF3D7F');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
    });

    this.canvasTex('fx_coin', 40, 40, (ctx) => {
      const g = ctx.createRadialGradient(15, 13, 2, 20, 20, 19);
      g.addColorStop(0, '#FFF2A8');
      g.addColorStop(0.6, '#FFC928');
      g.addColorStop(1, '#E09200');
      ctx.beginPath();
      ctx.arc(20, 20, 17, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#C47F00';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(20, 20, 10.5, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(196,127,0,0.55)';
      ctx.stroke();
    });

    this.canvasTex('fx_ring', 180, 180, (ctx) => {
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(90, 90, 80, 0, Math.PI * 2);
      ctx.stroke();
    });

    this.canvasTex('select_ring', CELL + 10, CELL + 10, (ctx) => {
      ctx.shadowColor = 'rgba(255,190,40,0.85)';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#FFC93C';
      roundRect(ctx, 9, 9, CELL - 8, CELL - 8, 28);
      ctx.stroke();
    });

    this.canvasTex('hover_merge', CELL, CELL, (ctx) => {
      roundRect(ctx, 5, 5, CELL - 10, CELL - 10, 24);
      ctx.fillStyle = 'rgba(80,220,120,0.32)';
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(34,197,94,0.95)';
      ctx.stroke();
    });

    this.canvasTex('hover_move', CELL, CELL, (ctx) => {
      roundRect(ctx, 5, 5, CELL - 10, CELL - 10, 24);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fill();
      ctx.setLineDash([12, 9]);
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(190,140,90,0.85)';
      ctx.stroke();
    });

    this.canvasTex('check_badge', 44, 44, (ctx) => {
      ctx.beginPath();
      ctx.arc(22, 22, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#22C55E';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(14, 22.5);
      ctx.lineTo(20, 28.5);
      ctx.lineTo(30.5, 16.5);
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  }
}
