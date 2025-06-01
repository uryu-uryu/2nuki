-- uuid-ossp拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 五目並べの盤面テーブル
CREATE TABLE gomoku (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  black_player_id UUID NOT NULL,
  white_player_id UUID NOT NULL,
  current_player_turn UUID NOT NULL,
  winner_id UUID,
  board_state JSONB NOT NULL, -- 2次元配列をJSONで保存
  is_finished BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT different_players CHECK (black_player_id != white_player_id),
  CONSTRAINT valid_turn CHECK (
    current_player_turn = black_player_id OR current_player_turn = white_player_id
  ),
  CONSTRAINT valid_winner CHECK (
    winner_id IS NULL OR winner_id = black_player_id OR winner_id = white_player_id
  )
);

-- リアルタイム機能を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE gomoku; 