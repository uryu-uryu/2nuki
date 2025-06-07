/**
 * マッチメイキング機能に関する定数
 * PlayFabマッチメイキングで使用される設定値を管理
 */

export const MATCHMAKING_CONFIG = {
  /** PlayFabのマッチメイキングキュー名（環境変数から取得） */
  QUEUE_NAME: import.meta.env.VITE_PLAYFAB_MATCHMAKING_QUEUE_NAME || 'gomoku-default',
  /** マッチメイキングのタイムアウト時間（秒） */
  TIMEOUT_SECONDS: 120,
  /** マッチング状態のポーリング間隔（ミリ秒） */
  POLLING_INTERVAL_MS: 2000,
  /** API呼び出しの最大リトライ回数 */
  MAX_RETRIES: 3,
  /** 初期ポーリング間隔（ミリ秒） */
  INITIAL_POLLING_INTERVAL_MS: 1000,
  /** 長時間ポーリング間隔（ミリ秒） */
  LONG_POLLING_INTERVAL_MS: 3000,
  /** ポーリング間隔を変更するタイミング（秒） */
  POLLING_INTERVAL_CHANGE_THRESHOLD: 30
} as const;

export const MATCHMAKING_STATUS = {
  /** 待機状態 */
  IDLE: 'idle',
  /** マッチング検索中 */
  SEARCHING: 'searching',
  /** マッチング成功 */
  MATCHED: 'matched',
  /** タイムアウト */
  TIMEOUT: 'timeout',
  /** エラー発生 */
  ERROR: 'error',
  /** キャンセル */
  CANCELLED: 'cancelled'
} as const;

export const MATCHMAKING_EVENTS = {
  /** マッチング開始 */
  MATCHING_STARTED: 'matchmakingStarted',
  /** マッチング成功 */
  MATCH_FOUND: 'matchFound',
  /** マッチングエラー */
  MATCHING_ERROR: 'matchmakingError',
  /** マッチングキャンセル */
  MATCHING_CANCELLED: 'matchmakingCancelled',
  /** マッチングタイムアウト */
  MATCHING_TIMEOUT: 'matchmakingTimeout'
} as const;

export type MatchmakingStatusType = typeof MATCHMAKING_STATUS[keyof typeof MATCHMAKING_STATUS];
export type MatchmakingEventType = typeof MATCHMAKING_EVENTS[keyof typeof MATCHMAKING_EVENTS]; 