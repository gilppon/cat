import * as Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { MainScene } from '../scenes/MainScene';
import { GAME_H, GAME_W } from './constants';

/* =========================================================
 * Phaser 3 game entry point
 * Created when React mounts <PhaserBoard />.
 * ========================================================= */
export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_W,
    height: GAME_H,
    transparent: true,
    banner: false,
    audio: { noAudio: true },
    render: { antialias: true },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_W,
      height: GAME_H,
    },
    scene: [BootScene, MainScene],
  });
}
