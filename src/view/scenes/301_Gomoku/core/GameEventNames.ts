/**
 * GameEventNames - 五目並べゲームのイベント名定数
 * 
 * このファイルは以下の責務を持ちます：
 * 1. ゲームイベントの名前を定数として定義
 * 2. イベント名の型安全性を確保
 */

export const GameEventNames = {
  GAME_CREATED: 'gameCreated',
  GAME_UPDATED: 'gameUpdated',
  GAME_FINISHED: 'gameFinished',
  ERROR: 'error',
} as const;

// イベント名の型を定義
export type GameEventName = typeof GameEventNames[keyof typeof GameEventNames]; 