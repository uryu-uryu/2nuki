/**
 * Supabase関連の定数定義
 */

// Supabase RPC関数名
export const SUPABASE_RPC = {
  SET_CONFIG: 'set_config'
} as const;

// Supabaseセッション設定キー
export const SUPABASE_CONFIG = {
  PLAYER_ID: 'app.player_id'
} as const; 