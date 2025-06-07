import { GomokuGameScene } from 'src/scenes/Gomoku/GomokuScene';
import { MainMenuScene } from 'src/scenes/MainMenu/MainMenuScene';
import { PlayerSelectScene } from 'src/scenes/PlayerSelect/PlayerSelectScene';
import { MatchmakingScene } from 'src/scenes/Matchmaking/MatchmakingScene';
import { Boot } from 'src/scenes/Boot';
import { Preloader } from 'src/scenes/Preloader';
import { LAYOUT } from 'src/consts/layout';
import * as Phaser from 'phaser';

export const gomokuConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: LAYOUT.GAME.WIDTH,
  height: LAYOUT.GAME.HEIGHT,
  backgroundColor: LAYOUT.BACKGROUND_COLOR,
  scene: [Boot, Preloader, MainMenuScene, PlayerSelectScene, MatchmakingScene, GomokuGameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  parent: undefined, // main.tsで上書き
};
