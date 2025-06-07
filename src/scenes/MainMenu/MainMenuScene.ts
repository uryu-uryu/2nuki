import * as Phaser from 'phaser';
import { LAYOUT } from '@/consts/styles/layout';
import { PADDING } from '@/consts/styles/components';
import { COLORS } from '@/consts/styles/color';
import { LARGE_TEXT_STYLE, DEFAULT_TEXT_STYLE } from '@/consts/styles/text';
import { SCENE_KEYS } from 'src/consts/scenes';
import i18next from 'src/i18n/config';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.MAIN_MENU);
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // タイトルテキスト
    this.add.text(LAYOUT.SCREEN.CENTER_X, 200, i18next.t('title'), {
      ...LARGE_TEXT_STYLE,
      color: COLORS.TEXT.PRIMARY
    }).setOrigin(0.5);

    // スタートボタン
    const startButton = this.add.text(
      LAYOUT.SCREEN.CENTER_X,
      300,
      i18next.t('startButton'),
      {
        ...DEFAULT_TEXT_STYLE,
        color: COLORS.TEXT.WHITE,
        backgroundColor: COLORS.BUTTON.PRIMARY,
        padding: PADDING.MEDIUM
      }
    ).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // 言語切り替えボタン
    // TODO: ブラウザ等の設定から自動で反映されるようにしたい。
    this.add.text(
      LAYOUT.SCREEN.CENTER_X + 200, // 画面中央から右に200px
      50,
      i18next.language === 'ja' ? '🇯🇵' : '🇺🇸',
      DEFAULT_TEXT_STYLE
    )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        // 言語切り替え
        const newLang = i18next.language === 'ja' ? 'en' : 'ja';
        i18next.changeLanguage(newLang).then(() => {
          // シーンを再起動して翻訳を反映
          this.scene.restart();
        });
      });

    // ボタンのクリックイベント
    startButton.on('pointerdown', () => {
      // TODO: プレイヤー選択画面を廃止しする

      // プレイヤー選択画面を廃止し、マッチメイキング画面に直接遷移
      this.scene.start(SCENE_KEYS.MATCHMAKING);
    });
  }
} 