// データベーステーブル定数
export const DB_TABLES = {
  GOMOKU: 'gomoku'
} as const;

// gomokuテーブルのカラム定数
export const GOMOKU_COLUMNS = {
  ID: 'id',
  BLACK_PLAYER_ID: 'black_player_id',
  WHITE_PLAYER_ID: 'white_player_id',
  CURRENT_PLAYER_TURN: 'current_player_turn',
  WINNER_ID: 'winner_id',
  BOARD_STATE: 'board_state',
  IS_FINISHED: 'is_finished',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  FINISHED_AT: 'finished_at'
} as const;

// データベーススキーマ名
export const DB_SCHEMA = {
  PUBLIC: 'public'
} as const;

// リアルタイムチャンネル名
export const REALTIME_CHANNELS = {
  GAME_STATE_CHANGES: 'game_state_changes',
  GOMOKU_CHANGES: 'gomoku_changes'
} as const;

// gomokuテーブルのデータ型
export interface Gomoku {
  [GOMOKU_COLUMNS.ID]: string;
  [GOMOKU_COLUMNS.BLACK_PLAYER_ID]: string;
  [GOMOKU_COLUMNS.WHITE_PLAYER_ID]: string;
  [GOMOKU_COLUMNS.CURRENT_PLAYER_TURN]: string;
  [GOMOKU_COLUMNS.WINNER_ID]?: string | null;
  [GOMOKU_COLUMNS.BOARD_STATE]: number[][];
  [GOMOKU_COLUMNS.IS_FINISHED]: boolean;
  [GOMOKU_COLUMNS.CREATED_AT]: string;
  [GOMOKU_COLUMNS.UPDATED_AT]: string;
  [GOMOKU_COLUMNS.FINISHED_AT]?: string | null;
}

export interface GameCreateParams {
  blackPlayerId: string;
  whitePlayerId: string;
}

export interface GameUpdateParams {
  currentPlayerTurn?: string;
  boardState?: number[][];
  isFinished?: boolean;
}

// データベース操作の結果型
export interface DatabaseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// リアルタイム更新のペイロード型
export interface RealtimePayload<T> {
  new: T;
  old: T;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

// 五目並べゲーム用の追加型定義
export type Player = 'black' | 'white';
export type CellState = 0 | 1 | 2; // 0: 空, 1: 黒石, 2: 白石

export interface Move {
  row: number;
  col: number;
  player: Player;
}

export interface GameState {
  id: number;
  score: number;
  updated_at: string;
}

// game_stateテーブルのカラム定数
export const GAME_STATE_COLUMNS = {
  ID: 'id',
  SCORE: 'score',
  UPDATED_AT: 'updated_at'
} as const; 