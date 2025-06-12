/**
 * フォントやテキストスタイルに関する定数を定義
 * フォントサイズ、フォントファミリー、テキストスタイルなど
 */

import { COLORS } from '@/consts/styles/color';

// フォント設定
export const FONT = {
  FAMILY: 'Arial',
  SIZES: {
    SMALL: '12px',
    NORMAL: '14px',
    MEDIUM: '16px',
    LARGE: '24px',
    TITLE: '32px',
    HERO: '48px'
  }
} as const;

// Phaserのテキストスタイル用のフォントサイズ
export const PHASER_FONT_SIZE = {
  LARGE: '64px',
  MEDIUM: '40px',
  SMALL: '24px',
} as const;

// デフォルトのテキストスタイル
export const DEFAULT_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: PHASER_FONT_SIZE.MEDIUM,
  color: '#FFFFFF',
  fontFamily: FONT.FAMILY,
} as const;

// 大きいテキスト用のスタイル
export const LARGE_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  ...DEFAULT_TEXT_STYLE,
  fontSize: PHASER_FONT_SIZE.LARGE,
} as const;

// 小さいテキスト用のスタイル
export const SMALL_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  ...DEFAULT_TEXT_STYLE,
  fontSize: PHASER_FONT_SIZE.SMALL,
} as const;

// ステータス表示用の緑テキストスタイル
export const STATUS_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  ...SMALL_TEXT_STYLE,
  color: COLORS.GREEN,
} as const;
