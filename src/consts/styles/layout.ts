/**
 * 画面全体のレイアウトに関する定数を定義
 * 画面サイズ、中央座標など
 */

// 画面全体のレイアウト定数
export const LAYOUT = {
  // 画面全体サイズ
  GAME: {
    WIDTH: 1024,
    HEIGHT: 768,
  },

  // 画面の中央座標（実際のゲーム表示に使用される座標）
  SCREEN: {
    CENTER_X: 400,
    CENTER_Y: 300,
  },
} as const;
