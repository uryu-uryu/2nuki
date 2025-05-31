import { LAYOUT } from 'src/consts/layout';

export const DEFAULT_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: LAYOUT.FONT_SIZE.MEDIUM,
  color: LAYOUT.COLORS.WHITE,
  fontFamily: LAYOUT.FONT_FAMILY,
} as const;

// 大きいテキスト用のスタイル
export const LARGE_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  ...DEFAULT_TEXT_STYLE,
  fontSize: LAYOUT.FONT_SIZE.LARGE,
} as const;

// 小さいテキスト用のスタイル
export const SMALL_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  ...DEFAULT_TEXT_STYLE,
  fontSize: LAYOUT.FONT_SIZE.SMALL,
} as const;

// ステータス表示用の緑テキストスタイル
export const STATUS_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  ...SMALL_TEXT_STYLE,
  color: LAYOUT.COLORS.GREEN,
} as const;

export const COLORS = {
  BOARD: 0xDEB887,
  GRID: 0x8B4513,
  BLACK_STONE: 0x000000,
  WHITE_STONE: 0xFFFFFF,
  WHITE_STONE_BORDER: 0x000000,
  HIGHLIGHT: 0xFF0000,
  BACKGROUND: 0xF5F5DC,
  TEXT: {
    PRIMARY: '#000000',
    SECONDARY: '#666666',
    WHITE: '#FFFFFF'
  },
  BUTTON: {
    PRIMARY: '#4CAF50',
    SECONDARY: '#2196F3',
    DANGER: '#f44336'
  }
}; 