import * as Phaser from 'phaser';
import { SCREEN, PADDING } from '../../consts/layout';
import { COLORS, LARGE_TEXT_STYLE, DEFAULT_TEXT_STYLE } from '../../consts/styles';

export class PlayerSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayerSelect' });
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // タイトルテキスト
    this.add.text(SCREEN.CENTER_X, 100, 'プレイヤー選択', {
      ...LARGE_TEXT_STYLE,
      color: COLORS.TEXT.PRIMARY
    }).setOrigin(0.5);

    // プレイヤー1のボタン
    const player1Button = this.add.text(SCREEN.CENTER_X, 200, 'プレイヤー1として開始', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.PRIMARY,
      padding: PADDING.MEDIUM
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // プレイヤー2のボタン
    const player2Button = this.add.text(SCREEN.CENTER_X, 300, 'プレイヤー2として開始', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.SECONDARY,
      padding: PADDING.MEDIUM
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // 説明テキスト
    this.add.text(SCREEN.CENTER_X, 400, 'ローカルテスト用：\n別のタブで異なるプレイヤーを選択してください', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.SECONDARY,
      align: 'center'
    }).setOrigin(0.5);

    // ボタンのクリックイベント
    // ローカル環境のテスト用に、ひとまず固定の ＩＤ とする。
    player1Button.on('pointerdown', () => {
      this.scene.start('GomokuGame', { playerId: '11111111-1111-1111-1111-111111111111' });
    });

    player2Button.on('pointerdown', () => {
      this.scene.start('GomokuGame', { playerId: '22222222-2222-2222-2222-222222222222' });
    });
  }
} 