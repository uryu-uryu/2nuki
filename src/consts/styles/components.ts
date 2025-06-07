/**
 * 特定のコンポーネントに関する定数を定義
 * ボタン、パディング、その他UIコンポーネントのスタイル設定
 */

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
