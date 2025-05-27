// データベーステーブル定数
export const DB_TABLES = {
  GAME_STATE: 'game_state'
} as const;

// game_stateテーブルのカラム定数
export const GAME_STATE_COLUMNS = {
  ID: 'id',
  SCORE: 'score',
  UPDATED_AT: 'updated_at'
} as const;

// リアルタイムチャンネル名
export const REALTIME_CHANNELS = {
  GAME_STATE_CHANGES: 'game_state_changes'
} as const;

// データベーススキーマ名
export const DB_SCHEMA = {
  PUBLIC: 'public'
} as const;

// ゲーム状態のデータ型
export interface GameState {
  [GAME_STATE_COLUMNS.ID]: number;
  [GAME_STATE_COLUMNS.SCORE]: number;
  [GAME_STATE_COLUMNS.UPDATED_AT]: string;
}

// データベース操作の結果型
export interface DatabaseResult<T = any> {
  data: T | null;
  error: Error | null;
}

// リアルタイム更新のペイロード型
export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Record<string, any>;
  old?: Record<string, any>;
  schema: string;
  table: string;
} 