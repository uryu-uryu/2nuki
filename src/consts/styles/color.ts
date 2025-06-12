/**
 * 色に関する定数を定義
 * アプリケーション全体で使用する色の定義を管理
 */

export const COLORS = {
  // 基本色
  WHITE: 0xFFFFFF,
  BLACK: 0x000000,
  RED: 0xFF0000,

  // ゲーム盤面の色
  BOARD: 0xDEB887,
  GRID: 0x8B4513,

  // 背景色
  BACKGROUND: 0xF5F5DC,

  // UI色（文字列形式）
  GRAY: '#666666',
  GREEN: '#00ff00',
  BLUE: '#1565c0',
  DANGER: '#f44336',
  PRIMARY: '#4CAF50',
  SECONDARY: '#2196F3'
} as const; 