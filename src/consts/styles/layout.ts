/**
 * 画面全体のレイアウトに関する定数を定義
 * 画面サイズ、中央座標、ゲーム盤面の配置など
 */

import { BOARD_SIZE } from '@/consts/const';

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

  // 背景色
  BACKGROUND_COLOR: '#028af8',
} as const;

// ゲーム盤面のレイアウト定数
export const BOARD = {
  CELL_SIZE: 30,
  OFFSET_X: 50,
  OFFSET_Y: 50,
  STONE_RADIUS: 12,
  get SIZE() { return BOARD_SIZE; }
} as const;
