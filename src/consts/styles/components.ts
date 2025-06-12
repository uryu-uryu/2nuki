/**
 * 特定のコンポーネントに関する定数を定義
 * ボタン、パディング、その他UIコンポーネントのスタイル設定
 * css ファイルのように広く使われてしまいがちなので、極力 デフォルトcomponent実装側で設定するべき
 */

import { BOARD_SIZE } from '@/consts/const';

// ボタンのサイズ設定
export const BUTTON = {
  WIDTH: 200,
  HEIGHT: 80,
} as const;

// パディング設定
export const PADDING = {
  SMALL: { x: 10, y: 5 },
  MEDIUM: { x: 20, y: 10 }
} as const;

/**
 * TODO: 以下をやめる。残すにしても良い名前にしたい。そもそも flex box とかにしたいし、phaser 用の UI ライブラリがあればそれを使ってもよい。
 * → rex ui にしたい。
 * SIDE_PANEL: ゲーム盤面とUI要素の間に適切な余白を確保
 * BUTTON_SPACING: ボタン同士が近すぎて誤操作しないよう適切な間隔を確保
 * LANGUAGE_BUTTON_OFFSET: 言語切り替えボタンのオフセット
 */
// UIのマージン・オフセット設定
export const MARGIN = {
  SMALL: 10,
  MEDIUM: 20,
  LARGE: 50,
  SIDE_PANEL: 50, // サイドパネルのマージン
  BUTTON_SPACING: 50, // ボタン間のスペース
  LANGUAGE_BUTTON_OFFSET: 200 // 言語切り替えボタンのオフセット
} as const;

// ゲーム盤面のコンポーネント設定
export const BOARD = {
  CELL_SIZE: 30,
  OFFSET_X: 50,
  OFFSET_Y: 50,
  STONE_RADIUS: 12,
  get SIZE() { return BOARD_SIZE; }
} as const;

// プリローダー設定
export const PRELOADER = {
  // 背景画像サイズ
  BACKGROUND: {
    WIDTH: 800,
    HEIGHT: 600
  },

  // 古いスタイルのプログレスバー設定（init()メソッド用）
  OLD_STYLE: {
    CENTER_X: 512,
    CENTER_Y: 384,
    FRAME_WIDTH: 468,
    FRAME_HEIGHT: 32,
    BAR_INITIAL_WIDTH: 4,
    BAR_HEIGHT: 28,
    BAR_OFFSET_X: 230,
    MAX_BAR_WIDTH: 460
  },

  // TODO: そもそも progress bar componentを作るべきで、そちらに寄せるべき
  PROGRESS_BAR: {
    WIDTH: 468,
    HEIGHT: 32,
    BORDER_WIDTH: 1,
    BAR_WIDTH: 4,
    BAR_HEIGHT: 28
  }
} as const;
