// データベーステーブル定数
export {
  DB_TABLES,
  GAME_STATE_COLUMNS,
  GOMOKU_COLUMNS,
  REALTIME_CHANNELS,
  DB_SCHEMA
} from './database';

// データベース型定義
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
} from './database'; 