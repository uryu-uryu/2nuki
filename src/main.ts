import { Buffer } from 'buffer';
import * as Phaser from 'phaser';
import { config } from 'src/config';
import { logger } from 'src/utils/logger';
import { validateEnv } from 'src/utils/envValidator';
import i18next from 'src/i18n/config';

// グローバルにBufferを定義
window.Buffer = Buffer;

// DOMが読み込まれた後にゲームを開始
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 環境変数のバリデーション
    validateEnv();

    // i18nextの初期化を待機
    await i18next.init();
    logger.info(`言語が設定されました: ${i18next.language}`);

    // ゲームコンテナを取得または作成
    let gameContainer = document.getElementById('game-container');
    if (!gameContainer) {
      gameContainer = document.createElement('div');
      gameContainer.id = 'game-container';
      document.body.appendChild(gameContainer);
    }

    // Phaserゲームインスタンスを作成
    const game = new Phaser.Game({
      ...config,
      parent: 'game-container'
    });

    // ブラウザのリサイズ時にゲームサイズを調整
    window.addEventListener('resize', () => {
      game.scale.refresh();
    });

    // ページを離れる時にリソースをクリーンアップ
    window.addEventListener('beforeunload', () => {
      game.destroy(true);
    });

    // 開発環境用の情報ログに変更
    logger.info('五目並べゲームが開始されました！');
  } catch (error) {
    // 環境変数のバリデーションエラーなどの重大なエラーを処理
    logger.error('ゲームの初期化中にエラーが発生しました:', error);

    // エラーメッセージをUIに表示
    const errorContainer = document.createElement('div');
    errorContainer.style.color = 'red';
    errorContainer.style.padding = '20px';
    errorContainer.style.textAlign = 'center';
    errorContainer.textContent = error instanceof Error ? error.message : '予期せぬエラーが発生しました';
    document.body.appendChild(errorContainer);
  }
});
