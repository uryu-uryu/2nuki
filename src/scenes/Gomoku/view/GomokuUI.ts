/**
 * 五目並べのUI管理クラス
 * 
 * 責務：
 * - UIコンポーネントの作成と管理
 * - UI要素の表示更新
 * - ユーザー入力イベントの管理
 */

import * as Phaser from 'phaser';
import type { Gomoku } from '../../../types';
import { BOARD, PADDING } from '../../../consts/layout';
import { COLORS, DEFAULT_TEXT_STYLE, SMALL_TEXT_STYLE } from '../../../consts/styles';

export class GomokuUI {
  private scene: Phaser.Scene;
  private infoText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private createGameButton!: Phaser.GameObjects.Text;
  private forfeitButton!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createUI();
  }

  private createUI() {
    // 情報表示テキスト
    this.infoText = this.scene.add.text(BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50, BOARD.OFFSET_Y, '', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.PRIMARY
    });

    // ステータステキスト
    this.statusText = this.scene.add.text(BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50, BOARD.OFFSET_Y + 120, '', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.PRIMARY
    });

    // ゲーム作成ボタン
    this.createGameButton = this.scene.add.text(BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50, BOARD.OFFSET_Y + 200, 'ゲーム作成', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.PRIMARY,
      padding: PADDING.SMALL
    }).setInteractive({ useHandCursor: true });

    // ゲーム放棄ボタン
    this.forfeitButton = this.scene.add.text(BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50, BOARD.OFFSET_Y + 250, 'ゲーム放棄', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.DANGER,
      padding: PADDING.SMALL
    }).setInteractive({ useHandCursor: true }).setVisible(false);

    // デバッグ情報テキスト
    this.debugText = this.scene.add.text(10, 10, '', {
      ...SMALL_TEXT_STYLE,
      color: COLORS.TEXT.SECONDARY
    });

    // 戻るボタン
    this.backButton = this.scene.add.text(10, 10, '戻る', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.PRIMARY,
      padding: PADDING.SMALL
    }).setInteractive({ useHandCursor: true });
  }

  setupEventHandlers(handlers: {
        onCreateGame: () => void;
        onForfeitGame: () => void;
        onBack: () => void;
    }) {
    this.createGameButton.on('pointerdown', handlers.onCreateGame);
    this.forfeitButton.on('pointerdown', handlers.onForfeitGame);
    this.backButton.on('pointerdown', handlers.onBack);
  }

  updateDebugInfo(playerId: string, activeSessions: number) {
    this.debugText.setText(
      `Player: ${playerId.substring(0, 12)}... | Sessions: ${activeSessions}`
    );
  }

  updateForNoGame(playerId: string, isLoading: boolean) {
    this.infoText.setText(
      'プレイヤーID:\n' + playerId.substring(0, 20) + '...'
    );
    this.statusText.setText(isLoading ? '読み込み中...' : 'ゲームを作成してください');
    this.createGameButton.setVisible(!isLoading);
    this.forfeitButton.setVisible(false);
  }

  updateGameInfo(game: Gomoku, playerColor: string, isGameFinished: boolean, winner: string | null, isLoading: boolean) {
    let infoText = `ゲームID: ${game.id.substring(0, 8)}...\n`;
    infoText += `あなたの色: ${playerColor === 'black' ? '黒' : '白'}\n`;
    infoText += `作成日時: ${new Date(game.created_at).toLocaleTimeString()}\n`;

    if (isLoading) {
      infoText += '状態: 処理中...';
    } else if (isGameFinished) {
      infoText += '状態: ゲーム終了\n';
      if (winner) {
        const winnerText = winner === playerColor ? 'あなたの勝利!' : '相手の勝利';
        infoText += `結果: ${winnerText}`;
      }
    }

    this.infoText.setText(infoText);
  }

  updateGameStatus(isGameFinished: boolean, isPlayerTurn: boolean, isLoading: boolean) {
    if (isGameFinished) {
      this.statusText.setText('ゲームが終了しました\n新しいゲームを作成できます');
    } else if (isPlayerTurn && !isLoading) {
      this.statusText.setText('あなたのターンです\n盤面をクリックして石を置いてください');
    } else if (!isLoading) {
      this.statusText.setText('相手のターンです\nお待ちください');
    } else {
      this.statusText.setText('処理中...');
    }
  }

  updateButtonVisibility(isGameFinished: boolean, isLoading: boolean) {
    this.createGameButton.setVisible(isGameFinished);
    this.forfeitButton.setVisible(!isGameFinished && !isLoading);
  }

  destroy() {
    this.infoText.destroy();
    this.statusText.destroy();
    this.createGameButton.destroy();
    this.forfeitButton.destroy();
    this.debugText.destroy();
    this.backButton.destroy();
  }
} 