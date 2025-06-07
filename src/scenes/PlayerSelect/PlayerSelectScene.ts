import * as Phaser from 'phaser';
import { LAYOUT } from '@/consts/styles/layout';
import { PADDING } from '@/consts/styles/components';
import { COLORS } from '@/consts/styles/color';
import { LARGE_TEXT_STYLE, DEFAULT_TEXT_STYLE } from '@/consts/styles/text';
import { SCENE_KEYS } from 'src/consts/scenes';
import i18next from 'src/i18n/config';

export class PlayerSelectScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.PLAYER_SELECT);
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // タイトルテキスト
    this.add.text(LAYOUT.SCREEN.CENTER_X, 100, i18next.t('playerSelect.title'), {
      ...LARGE_TEXT_STYLE,
      color: COLORS.TEXT.PRIMARY
    }).setOrigin(0.5);

    // プレイヤー1のボタン
    const player1Button = this.add.text(LAYOUT.SCREEN.CENTER_X, 200, i18next.t('playerSelect.player1'), {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.PRIMARY,
      padding: PADDING.MEDIUM
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // プレイヤー2のボタン
    const player2Button = this.add.text(LAYOUT.SCREEN.CENTER_X, 300, i18next.t('playerSelect.player2'), {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.SECONDARY,
      padding: PADDING.MEDIUM
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // 説明テキスト
    this.add.text(LAYOUT.SCREEN.CENTER_X, 400, i18next.t('playerSelect.description'), {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.SECONDARY,
      align: 'center'
    }).setOrigin(0.5);

    // ボタンのクリックイベント
    // ローカル環境のテスト用に、ひとまず固定の ＩＤ とする。
    player1Button.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.GOMOKU_GAME, { playerId: 'EFB703BEA8688F46' });
    });

    player2Button.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.GOMOKU_GAME, { playerId: 'D4E0667168AEB3C' });
    });
  }
} 