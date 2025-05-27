-- RLSを有効化
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能なポリシー
CREATE POLICY "Allow public read access" ON game_state
  FOR SELECT USING (true);

-- 全ユーザーが更新可能なポリシー（デモ用）
CREATE POLICY "Allow public update access" ON game_state
  FOR UPDATE USING (true);

-- 全ユーザーが挿入可能なポリシー（デモ用）
CREATE POLICY "Allow public insert access" ON game_state
  FOR INSERT WITH CHECK (true); 