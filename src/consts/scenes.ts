/**
 * ゲーム内の各シーン名を管理する定数
 * シーン名の一元管理により、タイプミスを防ぎ、保守性を向上させる
 * 
 * プレフィックス分類:
 * - 0xx: 裏側系処理（Boot、Preloader等）
 * - 1xx: メニュー系画面
 * - 2xx: 対戦前の処理、通信系
 * - 3xx: ゲーム本体
 */
export const SCENE_KEYS = {
  _001_BOOT: 'Boot',
  _002_PRELOADER: 'Preloader',
  _101_MAIN_MENU: 'MainMenu',
  _202_MATCHMAKING: 'Matchmaking',
  _301_GOMOKU_GAME: 'GomokuGame',
} as const;

// 型の定義
export type SceneKey = typeof SCENE_KEYS[keyof typeof SCENE_KEYS]; 