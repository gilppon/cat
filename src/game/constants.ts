import { BOARD_COLS, BOARD_ROWS } from '../managers/MergeManager';

/* Phaser 캔버스 논리 해상도 & 레이아웃 (Scale.FIT 으로 화면에 맞춰짐) */
export const GAME_W = 900;
export const GAME_H = 1140;

export const CELL = 138;
export const ITEM_TEX = 136;

export const BOARD_W = BOARD_COLS * CELL;
export const BOARD_H = BOARD_ROWS * CELL;
export const BOARD_X = Math.round((GAME_W - BOARD_W) / 2);
export const BOARD_Y = 34;

export const SHELF_Y = BOARD_Y + BOARD_H + 32;
export const SHELF_H = 234;

export const GEN_W = 262;
export const GEN_H = 204;
export const GEN_Y = SHELF_Y + SHELF_H / 2;
export const GEN_X = [GAME_W / 2 - 288, GAME_W / 2, GAME_W / 2 + 288];

export const FONT_UI = 'Jua, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
export const FONT_EMOJI = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", sans-serif';

export function cellCenter(row: number, col: number): { x: number; y: number } {
  return { x: BOARD_X + col * CELL + CELL / 2, y: BOARD_Y + row * CELL + CELL / 2 };
}

export function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}
