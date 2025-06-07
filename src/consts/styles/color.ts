/**
 * 色に関する定数を定義
 * アプリケーション全体で使用する色の定義を管理
 */

export const COLORS = {
  // ゲーム盤面の色
  BOARD: 0xDEB887,
  GRID: 0x8B4513,

  // 石の色
  BLACK_STONE: 0x000000,
  WHITE_STONE: 0xFFFFFF,
  WHITE_STONE_BORDER: 0x000000,

  // ハイライト・強調色
  HIGHLIGHT: 0xFF0000,

  // 背景色
  BACKGROUND: 0xF5F5DC,

  // テキストの色
  TEXT: {
    PRIMARY: '#000000',
    SECONDARY: '#666666',
    WHITE: '#FFFFFF',
    GREEN: '#00ff00',
    BLUE: '#1565c0',
    DANGER: '#f44336'
  },

  // ボタンの色
  BUTTON: {
    PRIMARY: '#4CAF50',
    SECONDARY: '#2196F3',
    DANGER: '#f44336'
  }
} as const; 