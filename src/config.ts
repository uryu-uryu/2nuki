/**
 * Phaserゲームの設定ファイル
 * ゲームの画面サイズ、レンダラー設定など
 */

import * as Phaser from 'phaser';
import { Boot } from '@/view/scenes/001_Boot/Boot';
import { Preloader } from '@/view/scenes/002_Preloader/Preloader';
import { MainMenuScene } from '@/view/scenes/101_MainMenu/MainMenuScene';
import { GomokuGameScene } from '@/view/scenes/301_Gomoku/GomokuScene';
import { MatchmakingScene } from '@/view/scenes/202_Matchmaking/MatchmakingScene';
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
    GomokuGameScene,
    MatchmakingScene,
  ]
};

