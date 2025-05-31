import * as Phaser from 'phaser';
import { gomokuConfig } from './config';
import { logger } from './utils/logger';

// DOMが読み込まれた後にゲームを開始
document.addEventListener('DOMContentLoaded', () => {
  // ゲームコンテナを取得または作成
  let gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    document.body.appendChild(gameContainer);
  }

  // Phaserゲームインスタンスを作成
  const game = new Phaser.Game({
    ...gomokuConfig,
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
});
