-- game_stateテーブルを作成
CREATE TABLE game_state (
  id BIGINT PRIMARY KEY DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初期データを挿入
INSERT INTO game_state (id, score, updated_at) 
VALUES (1, 0, NOW())
ON CONFLICT (id) DO NOTHING;

-- リアルタイム機能を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE game_state; 