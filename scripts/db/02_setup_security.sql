-- sample です。

-- RLSを有効化
-- テーブルごとにRLSを有効化
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;

-- ゲーム内ポリシー
-- デフォルトで全てのアクセスを拒否
ALTER TABLE game_state FORCE ROW LEVEL SECURITY;

-- プレイヤーが自分のゲームを読み取れるポリシー
CREATE POLICY "Allow players to read their games" ON game_state
  FOR SELECT USING (
    auth.uid() IN (player1_id, player2_id)
  );

-- プレイヤーが自分のターンの時だけ更新できるポリシー
CREATE POLICY "Allow players to update on their turn" ON game_state
  FOR UPDATE USING (
    auth.uid() = current_player_id
    AND game_status = 'in_progress'
  );

-- 新規ゲーム作成時のポリシー
CREATE POLICY "Allow authenticated users to create games" ON game_state
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND player1_id = auth.uid()
  );

-- プロフィール系のポリシー
-- プロフィール閲覧ポリシー（全ユーザー閲覧可能）
CREATE POLICY "Allow public read access to profiles" ON profiles
  FOR SELECT USING (true);

-- プロフィール更新ポリシー（自分のプロフィールのみ）
CREATE POLICY "Allow users to update own profile" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
  );