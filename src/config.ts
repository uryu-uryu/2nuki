import { GomokuGameScene } from './scenes/Gomoku/GomokuGameScene';
import { MainMenuScene } from './scenes/MainMenu/MainMenuScene';
import { PlayerSelectScene } from './scenes/PlayerSelect/PlayerSelectScene';
import { LAYOUT } from './consts/layout';
import * as Phaser from 'phaser';

export const gomokuConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: LAYOUT.GAME.WIDTH,
  height: LAYOUT.GAME.HEIGHT,
  backgroundColor: LAYOUT.BACKGROUND_COLOR,
  scene: [MainMenuScene, PlayerSelectScene, GomokuGameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  parent: undefined, // main.tsで上書き
};
