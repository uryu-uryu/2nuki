import * as Phaser from 'phaser';
import { LAYOUT } from '@/consts/styles/layout';
import { MARGIN } from '@/consts/styles/components';
import { COLORS } from '@/consts/styles/color';
import { DEFAULT_TEXT_STYLE } from '@/consts/styles/text';
import { SCENE_KEYS } from 'src/consts/scenes';
import { logger } from 'src/utils/logger';
import i18next from 'src/i18n/config';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS._101_MAIN_MENU);
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // タイトルテキスト
    this.add.text(LAYOUT.SCREEN.CENTER_X, LAYOUT.SCREEN.CENTER_Y - 100, i18next.t('title'), {
      fontSize: '48px',
      color: '#000000',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    // スタートボタン
    this.add.text(LAYOUT.SCREEN.CENTER_X, LAYOUT.SCREEN.CENTER_Y, i18next.t('startButton'), {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: COLORS.PRIMARY,
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        logger.info('マッチメイキング画面に遷移');
        this.scene.start(SCENE_KEYS._202_MATCHMAKING);
      });

    // 言語切り替えボタン
    // TODO: ブラウザ等の設定から自動で反映されるようにしたい。
    this.add.text(
      LAYOUT.SCREEN.CENTER_X + MARGIN.LANGUAGE_BUTTON_OFFSET, // 画面中央から右にオフセット
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
  }
} 