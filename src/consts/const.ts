// ゲームの基本ルール
export const BOARD_SIZE = 15;  // 盤面のサイズ（15×15）

// タイミング設定
export const TIMING = {
  ERROR_MESSAGE_DURATION: 3000, // エラーメッセージ表示時間（ミリ秒）
  SCENE_TRANSITION_DELAY: 1000 // シーン遷移の遅延時間（ミリ秒）
} as const;
