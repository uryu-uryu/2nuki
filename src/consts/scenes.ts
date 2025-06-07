/**
 * ゲーム内の各シーン名を管理する定数
 * シーン名の一元管理により、タイプミスを防ぎ、保守性を向上させる
 */
export const SCENE_KEYS = {
  BOOT: 'Boot',
  PRELOADER: 'Preloader',
  MAIN_MENU: 'MainMenu',
  PLAYER_SELECT: 'PlayerSelect',
  MATCHMAKING: 'Matchmaking',
  GOMOKU_GAME: 'GomokuGame',
} as const;

// 型の定義
export type SceneKey = typeof SCENE_KEYS[keyof typeof SCENE_KEYS]; 