/**
 * Phaserゲームの設定ファイル
 * ゲームの画面サイズ、レンダラー設定など
 */

import * as Phaser from 'phaser';
import { Boot } from '@/scenes/001_Boot/Boot';
import { Preloader } from '@/scenes/002_Preloader/Preloader';
import { MainMenuScene } from '@/scenes/101_MainMenu/MainMenuScene';
import { GomokuGameScene } from '@/scenes/301_Gomoku/GomokuScene';
import { MatchmakingScene } from '@/scenes/202_Matchmaking/MatchmakingScene';
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

