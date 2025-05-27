# ゲーム セットアップ手順

このゲームは複数のプレイヤー間でリアルタイムにスコアを同期するPhaserゲームです。

## 必要な設定

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスし、新しいプロジェクトを作成
2. プロジェクトのURLとanon keyを取得

### 2. データベーステーブルの作成

`scripts/db/`ディレクトリ内のSQLスクリプトを順序通りに実行してください。
詳細な手順は `scripts/db/README.md` を参照してください。

### 3. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下を設定：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. アプリケーションの起動

```bash
npm install
npm run dev
```

## 機能説明

- **リアルタイム同期**: 複数のブラウザタブ/デバイスでゲームを開くと、どのタブでボタンを押してもすべてのタブで数字が同期されます
- **自動復旧**: ページをリロードしても最新のスコアが表示されます
- **競合回避**: 同時更新時の無限ループを防ぐ仕組みを実装

## トラブルシューティング

1. **リアルタイム更新が動かない場合**
   - Supabaseプロジェクトでrealtime機能が有効になっているか確認
   - `scripts/db/01_create_tables.sql`のrealtime設定が実行されているか確認

2. **接続エラーが発生する場合**
   - `.env` ファイルの設定値が正しいか確認
   - SupabaseプロジェクトのURLとAPIキーを再確認

3. **データが更新されない場合**
   - `scripts/db/02_setup_security.sql`のRLSポリシーが正しく設定されているか確認
   - ブラウザのコンソールでエラーメッセージを確認 