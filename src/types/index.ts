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

export {
  DB_TABLES,
  GOMOKU_COLUMNS,
  DB_SCHEMA,
  REALTIME_CHANNELS
} from '@/types/database';

export {
  SUPABASE_RPC,
  SUPABASE_CONFIG
} from 'src/consts/supabase';

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