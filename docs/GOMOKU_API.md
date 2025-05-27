# Gomoku (五目並べ) API 仕様

## 概要

このドキュメントでは、Supabaseベースの五目並べゲーム機能のAPI仕様と使用方法について説明します。フロントエンドはPhaser.jsを使用して実装されています。

## データベーススキーマ

### `gomoku` テーブル

| カラム名 | データ型 | 説明 |
|----------|----------|------|
| id | UUID | ゲームの一意識別子 |
| black_player_id | UUID | 黒石プレイヤーのID |
| white_player_id | UUID | 白石プレイヤーのID |
| current_player_turn | UUID | 現在のターンのプレイヤーID |
| winner_id | UUID | 勝者のプレイヤーID (nullable) |
| board_state | JSONB | 盤面の状態 (15x15の2次元配列) |
| is_finished | BOOLEAN | ゲーム終了フラグ |
| created_at | TIMESTAMPTZ | 作成日時 |
| updated_at | TIMESTAMPTZ | 更新日時 |
| finished_at | TIMESTAMPTZ | 終了日時 (nullable) |

### 盤面の状態表現

- `0`: 空のセル
- `1`: 黒石
- `2`: 白石

## GomokuService API

### メソッド

#### `createGame(params: GameCreateParams): Promise<Gomoku | null>`
新しいゲームを作成します。

**パラメータ:**
```typescript
interface GameCreateParams {
  blackPlayerId: string;
  whitePlayerId: string;
}
```

#### `getGame(gameId: string): Promise<Gomoku | null>`
指定されたIDのゲームを取得します。

#### `getPlayerGames(playerId: string): Promise<Gomoku[]>`
プレイヤーのアクティブなゲーム一覧を取得します。

#### `makeMove(gameId: string, params: GameUpdateParams): Promise<Gomoku | null>`
手を打ちます。

**パラメータ:**
```typescript
interface GameUpdateParams {
  row: number;    // 0-14
  col: number;    // 0-14
  playerId: string;
}
```

#### `forfeitGame(gameId: string, playerId: string): Promise<Gomoku | null>`
ゲームを放棄します。

#### `subscribeToGameChanges(gameId: string, callback: (game: Gomoku) => void): void`
リアルタイム更新を購読します。

#### `unsubscribe(): void`
リアルタイム購読を停止します。

### ユーティリティメソッド

#### `getPlayerColor(game: Gomoku, playerId: string): Player | null`
プレイヤーの色（黒/白）を取得します。

#### `getCurrentTurnColor(game: Gomoku): Player`
現在のターンのプレイヤー色を取得します。

#### `getEmptyCellCount(board: number[][]): number`
盤面の空のセル数を取得します。

## GomokuGameManager クラス

ゲーム状態の管理とイベント処理を簡素化するユーティリティクラスです。

### 使用例

```typescript
import { GomokuGameManager } from '../utils/GomokuGameManager';

const gameManager = new GomokuGameManager();

// イベントハンドラーを設定
gameManager.on('gameCreated', (game) => {
  console.log('ゲームが作成されました:', game.id);
});

gameManager.on('gameUpdated', (game) => {
  console.log('ゲームが更新されました');
});

gameManager.on('gameFinished', (game, winner) => {
  console.log('ゲーム終了:', winner);
});

gameManager.on('error', (error) => {
  console.error('エラー:', error);
});

// ゲームを作成
const opponentId = 'opponent-player-id';
await gameManager.createGame(opponentId, true); // プレイヤーを黒にする

// 手を打つ
await gameManager.makeMove(gameId, row, col);

// ゲームを放棄
await gameManager.forfeitGame(gameId);
```

### 主要メソッド

#### `createGame(opponentId: string, playerAsBlack: boolean): Promise<Gomoku | null>`
新しいゲームを作成します。

#### `makeMove(gameId: string, row: number, col: number): Promise<boolean>`
指定位置に石を配置します。

#### `forfeitGame(gameId: string): Promise<boolean>`
ゲームを放棄します。

#### `canPlaceStone(gameId: string, row: number, col: number): boolean`
指定位置に石を置けるかチェックします。

#### `getPlayerColor(gameId: string): Player | null`
プレイヤーの色を取得します。

#### `isPlayerTurn(gameId: string): boolean`
プレイヤーのターンかどうかを確認します。

## Phaser.js実装

### GomokuGame シーン

メインのゲームシーンです。`Phaser.Scene`を継承しています。

### ファイル構成

```
src/
├── game/
│   ├── GomokuGame.ts      # メインゲームシーン
│   ├── GameConfig.ts      # Phaser設定
│   └── index.ts           # エクスポート
├── utils/
│   └── GomokuGameManager.ts # ゲーム管理ユーティリティ
├── services/
│   └── supabase/
│       ├── supabase.ts
│       ├── gomokuService.ts
│       └── index.ts
└── main.ts                # エントリーポイント
```

### 起動方法

```typescript
import * as Phaser from 'phaser';
import { gameConfig } from './game';

const game = new Phaser.Game({
  ...gameConfig,
  parent: 'game-container'
});
```

### ゲーム機能

1. **盤面描画**: 15x15のグリッドと碁石の描画
2. **マウス/タッチ入力**: クリック/タップで石を配置
3. **リアルタイム更新**: 相手の手がリアルタイムで反映
4. **ゲーム状態表示**: ターン、勝敗、プレイヤー情報
5. **ゲーム管理**: 作成、放棄、状態管理

## ゲームルール

1. **盤面**: 15x15のグリッド
2. **先手**: 黒石が先手
3. **勝利条件**: 縦、横、斜めのいずれかで5つの石を連続して並べる
4. **ターン制**: プレイヤーが交互に石を置く
5. **放棄**: プレイヤーはいつでもゲームを放棄できる

## リアルタイム機能

Supabaseのリアルタイム機能を使用して、相手の手がリアルタイムで反映されます。

### 設定

```sql
-- リアルタイム機能を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE gomoku;
```

## イベントシステム

GomokuGameManagerはイベントベースの設計で、以下のイベントを提供します：

- `gameCreated`: ゲーム作成時
- `gameUpdated`: ゲーム状態更新時
- `gameFinished`: ゲーム終了時
- `error`: エラー発生時

## エラーハンドリング

すべてのメソッドは適切なエラーハンドリングを行い、失敗時は：
- `null` を返す（データ取得系）
- `false` を返す（操作系）
- エラーイベントを発火
- エラーメッセージをコンソールに出力

## 制約事項

1. **プレイヤー制限**: 異なる2人のプレイヤーが必要
2. **ターン制限**: 自分のターンのみ手を打てる
3. **位置制限**: 既に石がある位置には置けない
4. **ゲーム状態**: 終了したゲームでは手を打てない

## セキュリティ考慮事項

1. プレイヤーIDの検証
2. ターンの正当性チェック
3. 盤面の整合性確認
4. データベース制約による不正データ防止

## パフォーマンス最適化

1. インデックス設定の推奨
2. リアルタイム接続の適切な管理
3. 不要な状態更新の防止
4. Phaserオブジェクトの適切な破棄

## 開発・デバッグ

- デバッグ情報は画面左上に表示されます
- コンソールにゲームイベントが出力されます
- `gameManager.getDebugInfo()`でセッション情報を確認できます 