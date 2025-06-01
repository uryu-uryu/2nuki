import * as Phaser from 'phaser';
import { SCREEN, PADDING } from 'src/consts/layout';
import { COLORS, LARGE_TEXT_STYLE, DEFAULT_TEXT_STYLE } from 'src/consts/styles';
import { SCENE_KEYS } from 'src/consts/scenes';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.MAIN_MENU);
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // タイトルテキスト
    this.add.text(SCREEN.CENTER_X, 200, '五目並べ', {
      ...LARGE_TEXT_STYLE,
      color: COLORS.TEXT.PRIMARY
    }).setOrigin(0.5);

    // スタートボタン
    const startButton = this.add.text(SCREEN.CENTER_X, 300, 'ゲームを始める', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.PRIMARY,
      padding: PADDING.MEDIUM
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // ボタンのクリックイベント
    startButton.on('pointerdown', () => {
      this.scene.start(SCENE_KEYS.PLAYER_SELECT);
    });
  }
} 