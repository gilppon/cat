/**
 * High-definition procedural canvas artwork engine for Pets Harbor
 * Replaces system emojis with crisp, vibrant, 85-score 3D-styled game assets.
 */

// Helper: draw soft drop shadow beneath an item
function drawFloorShadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(70, 40, 10, 0.18)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + ry * 1.5, rx, ry * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Helper: draw glossy highlight arc
function drawGlossPill(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, rot = -0.4) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Helper: draw sparkling star
function drawSparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#FFFFFF') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.quadraticCurveTo(cx, cy, cx + size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy + size);
  ctx.quadraticCurveTo(cx, cy, cx - size, cy);
  ctx.quadraticCurveTo(cx, cy, cx, cy - size);
  ctx.fill();
  ctx.restore();
}

/* ====================================================================
 * FOOD CHAIN (1 ~ 7)
 * ==================================================================== */

function drawWarmMilk(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.35, s * 0.3, s * 0.2);
  ctx.save();
  // Bottle Body
  const g = ctx.createLinearGradient(cx - s * 0.2, cy, cx + s * 0.2, cy);
  g.addColorStop(0, '#E8F4FC');
  g.addColorStop(0.3, '#FFFFFF');
  g.addColorStop(0.85, '#D5E8F5');
  g.addColorStop(1, '#B9D5EB');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.22, cy - s * 0.15, s * 0.44, s * 0.55, [8, 8, 16, 16]);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#9CBED8';
  ctx.stroke();

  // Milk liquid level
  ctx.fillStyle = '#FFEAA7';
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.18, cy, s * 0.36, s * 0.36, [0, 0, 12, 12]);
  ctx.fill();

  // Heart badge on bottle
  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.arc(cx - s * 0.05, cy + s * 0.16, s * 0.05, 0, Math.PI * 2);
  ctx.arc(cx + s * 0.05, cy + s * 0.16, s * 0.05, 0, Math.PI * 2);
  ctx.moveTo(cx - s * 0.09, cy + s * 0.18);
  ctx.lineTo(cx, cy + s * 0.26);
  ctx.lineTo(cx + s * 0.09, cy + s * 0.18);
  ctx.fill();

  // Collar & Nipple
  ctx.fillStyle = '#FFBE76';
  ctx.beginPath();
  ctx.roundRect(cx - s * 0.18, cy - s * 0.26, s * 0.36, s * 0.12, 6);
  ctx.fill();
  ctx.fillStyle = '#FF7979';
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.32, s * 0.09, Math.PI, 0, false);
  ctx.fill();

  drawGlossPill(ctx, cx - s * 0.12, cy + s * 0.05, s * 0.04, s * 0.16, 0);
  ctx.restore();
}

function drawBoneTreat(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.25, s * 0.38, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.25);

  const bg = ctx.createLinearGradient(-s * 0.35, -s * 0.2, s * 0.35, s * 0.2);
  bg.addColorStop(0, '#FFEAA7');
  bg.addColorStop(0.4, '#FDCB6E');
  bg.addColorStop(1, '#E17055');

  ctx.fillStyle = bg;
  ctx.strokeStyle = '#D35400';
  ctx.lineWidth = 3.5;

  // Draw bone shape
  ctx.beginPath();
  // Center bar
  ctx.roundRect(-s * 0.28, -s * 0.1, s * 0.56, s * 0.2, 8);
  ctx.fill();
  ctx.stroke();

  // Left knobs
  ctx.beginPath();
  ctx.arc(-s * 0.25, -s * 0.11, s * 0.12, 0, Math.PI * 2);
  ctx.arc(-s * 0.25, s * 0.11, s * 0.12, 0, Math.PI * 2);
  // Right knobs
  ctx.arc(s * 0.25, -s * 0.11, s * 0.12, 0, Math.PI * 2);
  ctx.arc(s * 0.25, s * 0.11, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ribbon in center
  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
  ctx.fill();
  drawSparkle(ctx, -s * 0.15, -s * 0.08, s * 0.06);
  ctx.restore();
}

function drawFreshFish(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.28, s * 0.36, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.15);

  const g = ctx.createLinearGradient(-s * 0.35, -s * 0.2, s * 0.35, s * 0.2);
  g.addColorStop(0, '#74B9FF');
  g.addColorStop(0.5, '#0984E3');
  g.addColorStop(1, '#00CEC9');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#0652DD';
  ctx.lineWidth = 3.5;

  // Fish body
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.34, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tail
  ctx.beginPath();
  ctx.moveTo(-s * 0.3, 0);
  ctx.lineTo(-s * 0.46, -s * 0.18);
  ctx.quadraticCurveTo(-s * 0.4, 0, -s * 0.46, s * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Belly highlight
  ctx.fillStyle = '#E8F8F5';
  ctx.beginPath();
  ctx.ellipse(s * 0.05, s * 0.08, s * 0.22, s * 0.08, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(s * 0.2, -s * 0.05, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2D3436';
  ctx.beginPath();
  ctx.arc(s * 0.22, -s * 0.05, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(s * 0.23, -s * 0.065, s * 0.015, 0, Math.PI * 2);
  ctx.fill();

  drawSparkle(ctx, s * 0.05, -s * 0.12, s * 0.07);
  ctx.restore();
}

function drawRoastChicken(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.3, s * 0.38, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.3);

  // Big meat drumstick
  const g = ctx.createRadialGradient(-s * 0.05, -s * 0.05, 5, 0, 0, s * 0.35);
  g.addColorStop(0, '#FFEAA7');
  g.addColorStop(0.35, '#E17055');
  g.addColorStop(0.85, '#D63031');
  g.addColorStop(1, '#8C1D1D');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#6C1212';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.ellipse(-s * 0.05, 0, s * 0.3, s * 0.23, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bone with paper frill
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#B2BEC3';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(s * 0.18, -s * 0.07, s * 0.22, s * 0.14, 6);
  ctx.fill();
  ctx.stroke();

  // Bone knob
  ctx.fillStyle = '#DFE6E9';
  ctx.beginPath();
  ctx.arc(s * 0.4, -s * 0.07, s * 0.06, 0, Math.PI * 2);
  ctx.arc(s * 0.4, s * 0.07, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Delicious glossy sheen
  drawGlossPill(ctx, -s * 0.12, -s * 0.08, s * 0.14, s * 0.06, 0.2);
  drawSparkle(ctx, -s * 0.1, -s * 0.15, s * 0.07, '#FFF');
  ctx.restore();
}

function drawPremiumCan(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.32, s * 0.35, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);

  // Metal Can Body
  const g = ctx.createLinearGradient(-s * 0.3, 0, s * 0.3, 0);
  g.addColorStop(0, '#B2BEC3');
  g.addColorStop(0.3, '#DFE6E9');
  g.addColorStop(0.7, '#FFFFFF');
  g.addColorStop(1, '#636E72');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#2D3436';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.roundRect(-s * 0.26, -s * 0.18, s * 0.52, s * 0.44, [8, 8, 14, 14]);
  ctx.fill();
  ctx.stroke();

  // Gold label wrap
  const lg = ctx.createLinearGradient(-s * 0.26, 0, s * 0.26, 0);
  lg.addColorStop(0, '#F39C12');
  lg.addColorStop(0.5, '#F1C40F');
  lg.addColorStop(1, '#D68910');
  ctx.fillStyle = lg;
  ctx.fillRect(-s * 0.25, -s * 0.08, s * 0.5, s * 0.24);

  // Fish icon on label
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, 0.04 * s, s * 0.12, s * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Can top lid rim
  ctx.fillStyle = '#DFE6E9';
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.18, s * 0.26, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pull tab ring
  ctx.fillStyle = '#F1C40F';
  ctx.beginPath();
  ctx.arc(0, -s * 0.2, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawSparkle(ctx, s * 0.16, -s * 0.14, s * 0.08, '#FFF');
  ctx.restore();
}

function drawHomemadeBento(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.32, s * 0.4, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);

  // Lacquered Bento Box
  ctx.fillStyle = '#C0392B';
  ctx.strokeStyle = '#7B241C';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-s * 0.34, -s * 0.25, s * 0.68, s * 0.5, 14);
  ctx.fill();
  ctx.stroke();

  // Inner box divider
  ctx.fillStyle = '#FDFEFE';
  ctx.beginPath();
  ctx.roundRect(-s * 0.3, -s * 0.21, s * 0.6, s * 0.42, 10);
  ctx.fill();

  // Rice on left with seaweed
  ctx.fillStyle = '#F8F9F9';
  ctx.beginPath();
  ctx.roundRect(-s * 0.27, -s * 0.18, s * 0.26, s * 0.36, 8);
  ctx.fill();
  // Nori band
  ctx.fillStyle = '#2C3E50';
  ctx.fillRect(-s * 0.2, -s * 0.06, s * 0.12, s * 0.18);
  // Umeboshi plum
  ctx.fillStyle = '#E74C3C';
  ctx.beginPath();
  ctx.arc(-s * 0.14, -s * 0.08, s * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Rolled omelet (Tamagoyaki) on right
  ctx.fillStyle = '#F1C40F';
  ctx.strokeStyle = '#D68910';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(s * 0.03, -s * 0.16, s * 0.24, s * 0.14, 5);
  ctx.fill();
  ctx.stroke();

  // Cherry tomato & broccoli
  ctx.fillStyle = '#E74C3C';
  ctx.beginPath();
  ctx.arc(s * 0.08, s * 0.08, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#27AE60';
  ctx.beginPath();
  ctx.arc(s * 0.19, s * 0.07, s * 0.06, 0, Math.PI * 2);
  ctx.fill();

  drawSparkle(ctx, -s * 0.22, -s * 0.2, s * 0.08, '#FFF');
  ctx.restore();
}

function drawCelebrationCake(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.36, s * 0.42, s * 0.22);
  ctx.save();
  ctx.translate(cx, cy);

  // Crown aura for MAX item
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
  ctx.lineWidth = 5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Bottom Cake Tier
  const bg = ctx.createLinearGradient(-s * 0.3, 0, s * 0.3, 0);
  bg.addColorStop(0, '#FF9FF3');
  bg.addColorStop(0.5, '#FFF0F5');
  bg.addColorStop(1, '#FDA7DF');
  ctx.fillStyle = bg;
  ctx.strokeStyle = '#ED4C67';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-s * 0.34, 0, s * 0.68, s * 0.32, [10, 10, 16, 16]);
  ctx.fill();
  ctx.stroke();

  // Frosting drips
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-s * 0.22, 0.06 * s, s * 0.06, 0, Math.PI);
  ctx.arc(-s * 0.08, 0.08 * s, s * 0.06, 0, Math.PI);
  ctx.arc(s * 0.08, 0.06 * s, s * 0.06, 0, Math.PI);
  ctx.arc(s * 0.22, 0.07 * s, s * 0.06, 0, Math.PI);
  ctx.fill();

  // Top Cake Tier
  ctx.fillStyle = '#FFC312';
  ctx.beginPath();
  ctx.roundRect(-s * 0.22, -s * 0.22, s * 0.44, s * 0.24, [8, 8, 4, 4]);
  ctx.fill();
  ctx.stroke();

  // Strawberries
  ctx.fillStyle = '#EA2027';
  ctx.beginPath();
  ctx.arc(-s * 0.12, -s * 0.24, s * 0.05, 0, Math.PI * 2);
  ctx.arc(s * 0.12, -s * 0.24, s * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Candle & Flame
  ctx.fillStyle = '#12CBC4';
  ctx.fillRect(-s * 0.03, -s * 0.38, s * 0.06, s * 0.16);
  // Flame
  const fg = ctx.createRadialGradient(0, -s * 0.44, 2, 0, -s * 0.44, s * 0.1);
  fg.addColorStop(0, '#FFFFFF');
  fg.addColorStop(0.3, '#FFC312');
  fg.addColorStop(1, '#FF3838');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.44, s * 0.05, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  drawSparkle(ctx, -s * 0.3, -s * 0.15, s * 0.1, '#FFD700');
  drawSparkle(ctx, s * 0.3, -s * 0.15, s * 0.1, '#FFD700');
  ctx.restore();
}

/* ====================================================================
 * TOY CHAIN (1 ~ 7)
 * ==================================================================== */

function drawYarnBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.32, s * 0.35, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);

  // Big Fluffy Yarn Sphere
  const g = ctx.createRadialGradient(-s * 0.1, -s * 0.1, 5, 0, 0, s * 0.35);
  g.addColorStop(0, '#FDA7DF');
  g.addColorStop(0.6, '#D980FA');
  g.addColorStop(1, '#833471');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#5758BB';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.arc(0, 0, s * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Yarn Ribbons Texture
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-s * 0.05, -s * 0.05, s * 0.24, -0.6, 1.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(s * 0.05, s * 0.05, s * 0.2, 1.5, 3.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.14, 0.2, 2.5);
  ctx.stroke();

  // Loose strand trailing out
  ctx.strokeStyle = '#D980FA';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(s * 0.25, s * 0.15);
  ctx.bezierCurveTo(s * 0.42, s * 0.25, s * 0.28, s * 0.38, s * 0.44, s * 0.36);
  ctx.stroke();

  drawSparkle(ctx, -s * 0.14, -s * 0.16, s * 0.07);
  ctx.restore();
}

function drawTennisBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.32, s * 0.35, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.3);

  const g = ctx.createRadialGradient(-s * 0.1, -s * 0.1, 5, 0, 0, s * 0.35);
  g.addColorStop(0, '#E8F54A');
  g.addColorStop(0.7, '#A3CB38');
  g.addColorStop(1, '#009432');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#006266';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.arc(0, 0, s * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Classic White Curved Seam
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.arc(-s * 0.3, 0, s * 0.28, -0.9, 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(s * 0.3, 0, s * 0.28, Math.PI - 0.9, Math.PI + 0.9);
  ctx.stroke();

  drawGlossPill(ctx, -s * 0.12, -s * 0.12, s * 0.1, s * 0.05, 0.5);
  ctx.restore();
}

function drawMousePlush(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.28, s * 0.38, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);

  // Plush body
  const g = ctx.createRadialGradient(s * 0.05, -s * 0.05, 5, 0, 0, s * 0.35);
  g.addColorStop(0, '#DFE6E9');
  g.addColorStop(0.7, '#B2BEC3');
  g.addColorStop(1, '#636E72');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#2D3436';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.ellipse(0, s * 0.04, s * 0.32, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Big pink ears
  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.arc(-s * 0.18, -s * 0.16, s * 0.1, 0, Math.PI * 2);
  ctx.arc(-s * 0.02, -s * 0.2, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snout & Pink nose
  ctx.fillStyle = '#FD79A8';
  ctx.beginPath();
  ctx.arc(s * 0.32, s * 0.05, s * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Winding Key in back
  ctx.fillStyle = '#F1C40F';
  ctx.strokeStyle = '#B7950B';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(-s * 0.34, -s * 0.04, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  drawSparkle(ctx, 0, -s * 0.08, s * 0.06);
  ctx.restore();
}

function drawFlyingDisc(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.3, s * 0.42, s * 0.18);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.15);

  // Outer Frisbee ring
  const g = ctx.createLinearGradient(-s * 0.35, -s * 0.1, s * 0.35, s * 0.1);
  g.addColorStop(0, '#FF7675');
  g.addColorStop(0.5, '#FD79A8');
  g.addColorStop(1, '#6C5CE7');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#2D3436';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.38, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner Dome
  ctx.fillStyle = '#FDCB6E';
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.02, s * 0.26, s * 0.11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Central star badge
  ctx.fillStyle = '#FFFFFF';
  drawSparkle(ctx, 0, -s * 0.02, s * 0.09, '#FFFFFF');
  drawGlossPill(ctx, -s * 0.18, -s * 0.06, s * 0.12, s * 0.03, 0.2);
  ctx.restore();
}

function drawCuddlyBear(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.32, s * 0.36, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);

  // Bear Head
  const g = ctx.createRadialGradient(0, -s * 0.05, 5, 0, 0, s * 0.32);
  g.addColorStop(0, '#E17055');
  g.addColorStop(0.7, '#D35400');
  g.addColorStop(1, '#A04000');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#6E2C00';
  ctx.lineWidth = 3.5;

  // Ears
  ctx.beginPath();
  ctx.arc(-s * 0.2, -s * 0.2, s * 0.1, 0, Math.PI * 2);
  ctx.arc(s * 0.2, -s * 0.2, s * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FAD7A0';
  ctx.beginPath();
  ctx.arc(-s * 0.2, -s * 0.2, s * 0.05, 0, Math.PI * 2);
  ctx.arc(s * 0.2, -s * 0.2, s * 0.05, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snout
  ctx.fillStyle = '#FDEBD0';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.08, s * 0.14, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose & Eyes
  ctx.fillStyle = '#2C3E50';
  ctx.beginPath();
  ctx.arc(0, s * 0.04, s * 0.045, 0, Math.PI * 2);
  ctx.arc(-s * 0.1, -s * 0.03, s * 0.035, 0, Math.PI * 2);
  ctx.arc(s * 0.1, -s * 0.03, s * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Red Bow Tie
  ctx.fillStyle = '#E74C3C';
  ctx.beginPath();
  ctx.moveTo(0, s * 0.22);
  ctx.lineTo(-s * 0.1, s * 0.18);
  ctx.lineTo(-s * 0.1, s * 0.26);
  ctx.closePath();
  ctx.moveTo(0, s * 0.22);
  ctx.lineTo(s * 0.1, s * 0.18);
  ctx.lineTo(s * 0.1, s * 0.26);
  ctx.closePath();
  ctx.fill();

  drawSparkle(ctx, -s * 0.15, -s * 0.15, s * 0.06);
  ctx.restore();
}

function drawMiniCarousel(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.35, s * 0.4, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);

  // Tent Canopy
  const cg = ctx.createLinearGradient(-s * 0.3, 0, s * 0.3, 0);
  cg.addColorStop(0, '#E84393');
  cg.addColorStop(0.5, '#FDCB6E');
  cg.addColorStop(1, '#0984E3');
  ctx.fillStyle = cg;
  ctx.strokeStyle = '#2D3436';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(0, -s * 0.36);
  ctx.lineTo(-s * 0.34, -s * 0.1);
  ctx.lineTo(s * 0.34, -s * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Flag on top
  ctx.fillStyle = '#E74C3C';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.36);
  ctx.lineTo(s * 0.12, -s * 0.42);
  ctx.lineTo(0, -s * 0.48);
  ctx.closePath();
  ctx.fill();

  // Carousel Pillars
  ctx.fillStyle = '#F1C40F';
  ctx.fillRect(-s * 0.22, -s * 0.1, s * 0.05, s * 0.34);
  ctx.fillRect(s * 0.17, -s * 0.1, s * 0.05, s * 0.34);

  // Little Rocking Horse in center
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E84393';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, s * 0.04, s * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Base platform
  ctx.fillStyle = '#6C5CE7';
  ctx.beginPath();
  ctx.roundRect(-s * 0.32, s * 0.22, s * 0.64, s * 0.12, 6);
  ctx.fill();
  ctx.stroke();

  drawSparkle(ctx, -s * 0.2, -s * 0.2, s * 0.09, '#FFEAA7');
  ctx.restore();
}

function drawDreamPlayground(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.38, s * 0.44, s * 0.22);
  ctx.save();
  ctx.translate(cx, cy);

  // Dream castle aura
  ctx.save();
  ctx.strokeStyle = 'rgba(162, 155, 254, 0.5)';
  ctx.lineWidth = 6;
  ctx.setLineDash([10, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Central Castle Tower
  const tg = ctx.createLinearGradient(-s * 0.2, 0, s * 0.2, 0);
  tg.addColorStop(0, '#A29BFE');
  tg.addColorStop(0.5, '#E056FD');
  tg.addColorStop(1, '#6C5CE7');
  ctx.fillStyle = tg;
  ctx.strokeStyle = '#341F97';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.roundRect(-s * 0.18, -s * 0.2, s * 0.36, s * 0.46, [8, 8, 4, 4]);
  ctx.fill();
  ctx.stroke();

  // Side towers
  ctx.fillStyle = '#686DE0';
  ctx.beginPath();
  ctx.roundRect(-s * 0.35, -s * 0.08, s * 0.16, s * 0.34, 6);
  ctx.roundRect(s * 0.19, -s * 0.08, s * 0.16, s * 0.34, 6);
  ctx.fill();
  ctx.stroke();

  // Spire roofs
  ctx.fillStyle = '#F368E0';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.42);
  ctx.lineTo(-s * 0.2, -s * 0.2);
  ctx.lineTo(s * 0.2, -s * 0.2);
  ctx.closePath();
  ctx.moveTo(-s * 0.27, -s * 0.26);
  ctx.lineTo(-s * 0.37, -s * 0.08);
  ctx.lineTo(-s * 0.17, -s * 0.08);
  ctx.closePath();
  ctx.moveTo(s * 0.27, -s * 0.26);
  ctx.lineTo(s * 0.17, -s * 0.08);
  ctx.lineTo(s * 0.37, -s * 0.08);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden Cat Paw Crest on gate
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(0, s * 0.08, s * 0.07, 0, Math.PI * 2);
  ctx.fill();

  drawSparkle(ctx, -s * 0.28, -s * 0.32, s * 0.11, '#FFD700');
  drawSparkle(ctx, s * 0.28, -s * 0.32, s * 0.11, '#FFD700');
  ctx.restore();
}

/* ====================================================================
 * MEDICINE CHAIN (1 ~ 7)
 * ==================================================================== */

function drawBandage(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.3, s * 0.35, s * 0.18);
  ctx.save();
  ctx.translate(cx, cy);

  // Crossed bandages
  const drawBand = (rot: number) => {
    ctx.save();
    ctx.rotate(rot);
    const bg = ctx.createLinearGradient(-s * 0.32, 0, s * 0.32, 0);
    bg.addColorStop(0, '#FFEAA7');
    bg.addColorStop(0.5, '#FDCB6E');
    bg.addColorStop(1, '#F39C12');
    ctx.fillStyle = bg;
    ctx.strokeStyle = '#D68910';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-s * 0.32, -s * 0.1, s * 0.64, s * 0.2, 8);
    ctx.fill();
    ctx.stroke();
    // Air holes
    ctx.fillStyle = 'rgba(214, 137, 16, 0.4)';
    [-0.2, 0.2].forEach((x) => {
      ctx.beginPath();
      ctx.arc(x * s, 0, s * 0.03, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  };

  drawBand(-0.4);
  drawBand(0.4);

  // Healing Red Cross in Center
  ctx.fillStyle = '#E74C3C';
  ctx.beginPath();
  ctx.roundRect(-s * 0.04, -s * 0.11, s * 0.08, s * 0.22, 3);
  ctx.roundRect(-s * 0.11, -s * 0.04, s * 0.22, s * 0.08, 3);
  ctx.fill();

  drawSparkle(ctx, -s * 0.2, -s * 0.2, s * 0.08, '#FFF');
  ctx.restore();
}

function drawVitaminPill(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.3, s * 0.36, s * 0.18);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.6);

  // Capsule shape
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#2D3436';

  // Left half (Vibrant Coral Pink)
  ctx.fillStyle = '#FF7675';
  ctx.beginPath();
  ctx.roundRect(-s * 0.34, -s * 0.14, s * 0.34, s * 0.28, [14, 0, 0, 14]);
  ctx.fill();
  ctx.stroke();

  // Right half (Warm Bright Yellow)
  ctx.fillStyle = '#F1C40F';
  ctx.beginPath();
  ctx.roundRect(0, -s * 0.14, s * 0.34, s * 0.28, [0, 14, 14, 0]);
  ctx.fill();
  ctx.stroke();

  // Gloss streak
  drawGlossPill(ctx, -s * 0.05, -s * 0.06, s * 0.18, s * 0.04, 0);
  drawSparkle(ctx, -s * 0.18, -s * 0.08, s * 0.06);
  ctx.restore();
}

function drawHealingOintment(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.32, s * 0.38, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.35);

  // Squeezable Tube Body
  const tg = ctx.createLinearGradient(-s * 0.3, 0, s * 0.2, 0);
  tg.addColorStop(0, '#55E6C1');
  tg.addColorStop(0.5, '#25CCF7');
  tg.addColorStop(1, '#1B9CFC');
  ctx.fillStyle = tg;
  ctx.strokeStyle = '#182C61';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.moveTo(-s * 0.32, -s * 0.14);
  ctx.lineTo(s * 0.14, -s * 0.08);
  ctx.lineTo(s * 0.14, s * 0.08);
  ctx.lineTo(-s * 0.32, s * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tube cap
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(s * 0.14, -s * 0.06, s * 0.12, s * 0.12, 4);
  ctx.fill();
  ctx.stroke();

  // Pearly healing cream drop
  ctx.fillStyle = '#E8F8F5';
  ctx.beginPath();
  ctx.arc(s * 0.32, 0, s * 0.06, 0, Math.PI * 2);
  ctx.fill();

  drawSparkle(ctx, -s * 0.1, -s * 0.12, s * 0.08);
  ctx.restore();
}

function drawPreventiveShot(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.32, s * 0.38, s * 0.18);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.5);

  // Glass Barrel
  ctx.fillStyle = 'rgba(235, 248, 255, 0.85)';
  ctx.strokeStyle = '#2980B9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-s * 0.24, -s * 0.09, s * 0.44, s * 0.18, 4);
  ctx.fill();
  ctx.stroke();

  // Liquid inside (Emerald Cure)
  ctx.fillStyle = '#2ECC71';
  ctx.fillRect(-s * 0.2, -s * 0.07, s * 0.26, s * 0.14);

  // Measurement marks
  ctx.strokeStyle = '#2C3E50';
  ctx.lineWidth = 2;
  [-0.14, -0.06, 0.02].forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x * s, -s * 0.08);
    ctx.lineTo(x * s, -s * 0.04);
    ctx.stroke();
  });

  // Plunger & Needle
  ctx.fillStyle = '#BDC3C7';
  ctx.fillRect(-s * 0.36, -s * 0.04, s * 0.12, s * 0.08);
  ctx.strokeStyle = '#7F8C8D';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(s * 0.2, 0);
  ctx.lineTo(s * 0.38, 0);
  ctx.stroke();

  // Tiny drop at needle tip
  ctx.fillStyle = '#2ECC71';
  ctx.beginPath();
  ctx.arc(s * 0.42, 0, s * 0.03, 0, Math.PI * 2);
  ctx.fill();

  drawSparkle(ctx, 0, -s * 0.14, s * 0.07);
  ctx.restore();
}

function drawThermometer(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.32, s * 0.36, s * 0.18);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.4);

  // Digital body
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#2C3E50';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(-s * 0.32, -s * 0.08, s * 0.58, s * 0.16, [14, 6, 6, 14]);
  ctx.fill();
  ctx.stroke();

  // Silver metal probe tip
  ctx.fillStyle = '#BDC3C7';
  ctx.beginPath();
  ctx.roundRect(-s * 0.42, -s * 0.04, s * 0.12, s * 0.08, 4);
  ctx.fill();
  ctx.stroke();

  // LCD Screen showing healthy heart
  ctx.fillStyle = '#E8F8F5';
  ctx.fillRect(-s * 0.12, -s * 0.05, s * 0.2, s * 0.1);
  ctx.fillStyle = '#2ECC71';
  ctx.beginPath();
  ctx.arc(-s * 0.04, 0, s * 0.025, 0, Math.PI * 2);
  ctx.fill();

  drawSparkle(ctx, -s * 0.18, -s * 0.14, s * 0.07);
  ctx.restore();
}

function drawMagicPotion(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.34, s * 0.36, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);

  // Glass Flask Body
  const pg = ctx.createRadialGradient(0, s * 0.1, 5, 0, 0, s * 0.32);
  pg.addColorStop(0, '#55E6C1');
  pg.addColorStop(0.6, '#10AC84');
  pg.addColorStop(1, '#01A3A4');
  ctx.fillStyle = pg;
  ctx.strokeStyle = '#10AC84';
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.arc(0, s * 0.06, s * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Neck & Cork
  ctx.fillStyle = 'rgba(235, 248, 255, 0.85)';
  ctx.fillRect(-s * 0.08, -s * 0.24, s * 0.16, s * 0.18);
  ctx.strokeRect(-s * 0.08, -s * 0.24, s * 0.16, s * 0.18);

  ctx.fillStyle = '#D35400';
  ctx.beginPath();
  ctx.roundRect(-s * 0.1, -s * 0.32, s * 0.2, s * 0.1, 4);
  ctx.fill();
  ctx.stroke();

  // Bubbles rising inside
  ctx.fillStyle = '#FFFFFF';
  const bubbles: Array<[number, number, number]> = [
    [-0.08, 0.05, 0.035],
    [0.06, 0.12, 0.045],
    [-0.02, 0.18, 0.03],
  ];
  bubbles.forEach(([bx, by, br]) => {
    ctx.beginPath();
    ctx.arc(bx * s, by * s, br * s, 0, Math.PI * 2);
    ctx.fill();
  });

  drawGlossPill(ctx, -s * 0.12, -s * 0.02, s * 0.12, s * 0.05, -0.4);
  drawSparkle(ctx, s * 0.14, -s * 0.14, s * 0.09, '#FFEAA7');
  ctx.restore();
}

function drawDoctorStethoscope(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  drawFloorShadow(ctx, cx, cy + s * 0.36, s * 0.42, s * 0.2);
  ctx.save();
  ctx.translate(cx, cy);

  // Golden halo for MAX item
  ctx.save();
  ctx.strokeStyle = 'rgba(46, 204, 113, 0.45)';
  ctx.lineWidth = 6;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Flexible Tubing
  ctx.strokeStyle = '#16A085';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, -s * 0.04, s * 0.24, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Silver Metal Head (Chest piece)
  const hg = ctx.createRadialGradient(0, s * 0.18, 4, 0, s * 0.18, s * 0.18);
  hg.addColorStop(0, '#FFFFFF');
  hg.addColorStop(0.5, '#BDC3C7');
  hg.addColorStop(1, '#7F8C8D');
  ctx.fillStyle = hg;
  ctx.strokeStyle = '#2C3E50';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(0, s * 0.2, s * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Heart Jewel in center of chest piece
  ctx.fillStyle = '#E74C3C';
  ctx.beginPath();
  ctx.arc(-s * 0.03, s * 0.18, s * 0.035, 0, Math.PI * 2);
  ctx.arc(s * 0.03, s * 0.18, s * 0.035, 0, Math.PI * 2);
  ctx.moveTo(-s * 0.06, s * 0.2);
  ctx.lineTo(0, s * 0.26);
  ctx.lineTo(s * 0.06, s * 0.2);
  ctx.fill();

  // Ear tips
  ctx.fillStyle = '#2C3E50';
  ctx.beginPath();
  ctx.arc(-s * 0.22, -s * 0.24, s * 0.045, 0, Math.PI * 2);
  ctx.arc(s * 0.22, -s * 0.24, s * 0.045, 0, Math.PI * 2);
  ctx.fill();

  drawSparkle(ctx, -s * 0.24, -s * 0.1, s * 0.1, '#FFD700');
  drawSparkle(ctx, s * 0.24, -s * 0.1, s * 0.1, '#FFD700');
  ctx.restore();
}

/* ====================================================================
 * GENERATOR BOXES
 * ==================================================================== */

export function drawGeneratorArtwork(
  ctx: CanvasRenderingContext2D,
  cat: 'food' | 'toy' | 'medicine',
  cx: number,
  cy: number,
  s: number,
) {
  ctx.save();
  if (cat === 'food') {
    // Woven Picnic Basket
    drawFloorShadow(ctx, cx, cy + s * 0.35, s * 0.45, s * 0.2);
    const bg = ctx.createLinearGradient(cx, cy - s * 0.2, cx, cy + s * 0.3);
    bg.addColorStop(0, '#E67E22');
    bg.addColorStop(1, '#A04000');
    ctx.fillStyle = bg;
    ctx.strokeStyle = '#6E2C00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.4, cy - s * 0.12, s * 0.8, s * 0.46, [8, 8, 18, 18]);
    ctx.fill();
    ctx.stroke();

    // Red Gingham Napkin Draping Over
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.25, cy - s * 0.12);
    ctx.lineTo(cx, cy + s * 0.12);
    ctx.lineTo(cx + s * 0.25, cy - s * 0.12);
    ctx.closePath();
    ctx.fill();

    // Handle
    ctx.strokeStyle = '#BA4A00';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.1, s * 0.28, Math.PI, 0);
    ctx.stroke();
    drawSparkle(ctx, cx - s * 0.25, cy - s * 0.2, s * 0.09, '#FFEAA7');
  } else if (cat === 'toy') {
    // Surprise Present Box
    drawFloorShadow(ctx, cx, cy + s * 0.35, s * 0.45, s * 0.2);
    const bg = ctx.createLinearGradient(cx, cy - s * 0.2, cx, cy + s * 0.3);
    bg.addColorStop(0, '#A29BFE');
    bg.addColorStop(1, '#6C5CE7');
    ctx.fillStyle = bg;
    ctx.strokeStyle = '#341F97';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.36, cy - s * 0.1, s * 0.72, s * 0.46, [6, 6, 14, 14]);
    ctx.fill();
    ctx.stroke();

    // Box Lid
    ctx.fillStyle = '#E056FD';
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.4, cy - s * 0.2, s * 0.8, s * 0.14, 6);
    ctx.fill();
    ctx.stroke();

    // Golden Ribbon Cross
    ctx.fillStyle = '#F1C40F';
    ctx.fillRect(cx - s * 0.07, cy - s * 0.2, s * 0.14, s * 0.56);

    // Big Bow on top
    ctx.beginPath();
    ctx.arc(cx - s * 0.12, cy - s * 0.26, s * 0.1, 0, Math.PI * 2);
    ctx.arc(cx + s * 0.12, cy - s * 0.26, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawSparkle(ctx, cx + s * 0.24, cy - s * 0.24, s * 0.1, '#FFD700');
  } else {
    // Medical First-Aid Kit
    drawFloorShadow(ctx, cx, cy + s * 0.35, s * 0.45, s * 0.2);
    const bg = ctx.createLinearGradient(cx, cy - s * 0.2, cx, cy + s * 0.3);
    bg.addColorStop(0, '#FFFFFF');
    bg.addColorStop(1, '#D5F5E3');
    ctx.fillStyle = bg;
    ctx.strokeStyle = '#27AE60';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.38, cy - s * 0.12, s * 0.76, s * 0.46, [12, 12, 16, 16]);
    ctx.fill();
    ctx.stroke();

    // Big Green / Red Cross
    ctx.fillStyle = '#2ECC71';
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.07, cy - s * 0.04, s * 0.14, s * 0.3, 4);
    ctx.roundRect(cx - s * 0.18, cy + s * 0.04, s * 0.36, s * 0.14, 4);
    ctx.fill();

    // Carrying Handle
    ctx.strokeStyle = '#58D68D';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.16, cy - s * 0.24, s * 0.32, s * 0.14, 6);
    ctx.stroke();
    drawSparkle(ctx, cx - s * 0.22, cy - s * 0.15, s * 0.09, '#2ECC71');
  }
  ctx.restore();
}

/* ====================================================================
 * MAIN DISPATCHER
 * ==================================================================== */

export function drawCrispItemArt(
  ctx: CanvasRenderingContext2D,
  itemId: string,
  _category: string,
  _level: number,
  cx: number,
  cy: number,
  size: number,
) {
  switch (itemId) {
    // Food
    case 'food_1':
      drawWarmMilk(ctx, cx, cy, size);
      break;
    case 'food_2':
      drawBoneTreat(ctx, cx, cy, size);
      break;
    case 'food_3':
      drawFreshFish(ctx, cx, cy, size);
      break;
    case 'food_4':
      drawRoastChicken(ctx, cx, cy, size);
      break;
    case 'food_5':
      drawPremiumCan(ctx, cx, cy, size);
      break;
    case 'food_6':
      drawHomemadeBento(ctx, cx, cy, size);
      break;
    case 'food_7':
      drawCelebrationCake(ctx, cx, cy, size);
      break;

    // Toy
    case 'toy_1':
      drawYarnBall(ctx, cx, cy, size);
      break;
    case 'toy_2':
      drawTennisBall(ctx, cx, cy, size);
      break;
    case 'toy_3':
      drawMousePlush(ctx, cx, cy, size);
      break;
    case 'toy_4':
      drawFlyingDisc(ctx, cx, cy, size);
      break;
    case 'toy_5':
      drawCuddlyBear(ctx, cx, cy, size);
      break;
    case 'toy_6':
      drawMiniCarousel(ctx, cx, cy, size);
      break;
    case 'toy_7':
      drawDreamPlayground(ctx, cx, cy, size);
      break;

    // Medicine
    case 'medicine_1':
      drawBandage(ctx, cx, cy, size);
      break;
    case 'medicine_2':
      drawVitaminPill(ctx, cx, cy, size);
      break;
    case 'medicine_3':
      drawHealingOintment(ctx, cx, cy, size);
      break;
    case 'medicine_4':
      drawPreventiveShot(ctx, cx, cy, size);
      break;
    case 'medicine_5':
      drawThermometer(ctx, cx, cy, size);
      break;
    case 'medicine_6':
      drawMagicPotion(ctx, cx, cy, size);
      break;
    case 'medicine_7':
      drawDoctorStethoscope(ctx, cx, cy, size);
      break;

    default:
      // Graceful fallback for any unknown key
      drawSparkle(ctx, cx, cy, size * 0.4, '#F1C40F');
      break;
  }
}
