-- カスタムパラメータの定義
CREATE EXTENSION IF NOT EXISTS pgconfig;

-- カスタム設定パラメータの作成
SELECT set_config('custom.app.player_id', '', false);

-- RLSを有効化
-- テーブルごとにRLSを有効化
ALTER TABLE gomoku ENABLE ROW LEVEL SECURITY;

-- ゲーム内ポリシー
-- デフォルトで全てのアクセスを拒否
ALTER TABLE gomoku FORCE ROW LEVEL SECURITY;

-- プレイヤーが自分のゲームを読み取れるポリシー
CREATE POLICY "Allow players to read their games" ON gomoku
  FOR SELECT USING (
    current_setting('custom.app.player_id')::TEXT IN (black_player_id, white_player_id)
  );

-- プレイヤーが自分のターンの時だけ更新できるポリシー
CREATE POLICY "Allow players to update on their turn" ON gomoku
  FOR UPDATE USING (
    current_setting('custom.app.player_id')::TEXT = current_player_turn
    AND NOT is_finished
  );

-- 新規ゲーム作成時のポリシー
CREATE POLICY "Allow authenticated users to create games" ON gomoku
  FOR INSERT WITH CHECK (
    current_setting('custom.app.player_id')::TEXT IS NOT NULL
    AND black_player_id = current_setting('custom.app.player_id')::TEXT
  );
