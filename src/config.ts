/**
 * Phaserゲームの設定ファイル
 * ゲームの画面サイズ、レンダラー設定など
 */

import * as Phaser from 'phaser';
import { Boot } from 'src/scenes/Boot';
import { Preloader } from 'src/scenes/Preloader';
import { MainMenuScene } from 'src/scenes/MainMenu/MainMenuScene';
import { PlayerSelectScene } from 'src/scenes/PlayerSelect/PlayerSelectScene';
import { GomokuGameScene } from 'src/scenes/Gomoku/GomokuScene';
import { MatchmakingScene } from 'src/scenes/Matchmaking/MatchmakingScene';
import { LAYOUT } from '@/consts/styles/layout';
import { COLORS } from '@/consts/styles/color';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: LAYOUT.GAME.WIDTH,
  height: LAYOUT.GAME.HEIGHT,
  backgroundColor: COLORS.BACKGROUND,
  parent: 'game-container',
  scene: [
    Boot,
    Preloader,
    MainMenuScene,
    PlayerSelectScene,
    GomokuGameScene,
    MatchmakingScene,
  ]
};

