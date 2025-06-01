import type {
  GameState,
  Gomoku,
  DatabaseResult,
  RealtimePayload,
  Player,
  CellState,
  Move,
  GameCreateParams,
  GameUpdateParams
} from 'src/types/database';

// データベースのテーブル名や列名の定義
export const DB_TABLES = {
  GOMOKU: 'gomoku',
} as const;

export const GOMOKU_COLUMNS = {
  ID: 'id',
  BLACK_PLAYER_ID: 'black_player_id',
  WHITE_PLAYER_ID: 'white_player_id',
  CURRENT_PLAYER_TURN: 'current_player_turn',
  BOARD_STATE: 'board_state',
  IS_FINISHED: 'is_finished',
  UPDATED_AT: 'updated_at'
} as const;

export const REALTIME_CHANNELS = {
  GOMOKU_CHANGES: 'gomoku_changes'
} as const;

export const DB_SCHEMA = {
  PUBLIC: 'public'
} as const;

// 型のエクスポート
export type {
  GameState,
  Gomoku,
  DatabaseResult,
  RealtimePayload,
  Player,
  CellState,
  Move,
  GameCreateParams,
  GameUpdateParams
}; 