/**
 * 五目並べのUI管理クラス
 * 
 * 責務：
 * - UIコンポーネントの作成と管理
 * - UI要素の表示更新
 * - ユーザー入力イベントの管理
 */

import * as Phaser from 'phaser';
import type { Gomoku } from 'src/types';
import { BOARD, PADDING } from 'src/consts/layout';
import { COLORS, DEFAULT_TEXT_STYLE, SMALL_TEXT_STYLE } from 'src/consts/styles';
import i18next from 'src/i18n/config';

interface GameInfoTexts {
  loading: string;
  yourTurn: string;
  opponentTurn: string;
  waitingForOpponent: string;
}

export class GomokuUI {
  private scene: Phaser.Scene;
  private infoText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private createGameButton!: Phaser.GameObjects.Text;
  private forfeitButton!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;
  private errorText!: Phaser.GameObjects.Text;

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
    this.createGameButton = this.scene.add.text(
      BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50,
      BOARD.OFFSET_Y + 200,
      i18next.t('gamePlay.newGame'),
      {
        ...DEFAULT_TEXT_STYLE,
        color: COLORS.TEXT.WHITE,
        backgroundColor: COLORS.BUTTON.PRIMARY,
        padding: PADDING.SMALL
      }
    ).setInteractive({ useHandCursor: true });

    // ゲーム放棄ボタン
    this.forfeitButton = this.scene.add.text(
      BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50,
      BOARD.OFFSET_Y + 250,
      i18next.t('gamePlay.forfeit'),
      {
        ...DEFAULT_TEXT_STYLE,
        color: COLORS.TEXT.WHITE,
        backgroundColor: COLORS.BUTTON.DANGER,
        padding: PADDING.SMALL
      }
    ).setInteractive({ useHandCursor: true }).setVisible(false);

    // デバッグ情報テキスト
    this.debugText = this.scene.add.text(10, 10, '', {
      ...SMALL_TEXT_STYLE,
      color: COLORS.TEXT.SECONDARY
    });

    // 戻るボタン
    this.backButton = this.scene.add.text(10, 10, i18next.t('playerSelect.back'), {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.PRIMARY,
      padding: PADDING.SMALL
    }).setInteractive({ useHandCursor: true });

    // エラーテキスト
    this.errorText = this.scene.add.text(
      BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50,
      BOARD.OFFSET_Y + 300,
      '',
      {
        ...DEFAULT_TEXT_STYLE,
        color: COLORS.TEXT.DANGER
      }
    ).setVisible(false);
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
      `Player ID:\n${playerId.substring(0, 20)}...`
    );
    this.statusText.setText(isLoading ? i18next.t('gamePlay.loading') : i18next.t('gamePlay.waitingForOpponent'));
    this.createGameButton.setVisible(!isLoading);
    this.forfeitButton.setVisible(false);
  }

  updateGameInfo(
    game: Gomoku,
    playerColor: string,
    isGameFinished: boolean,
    winner: string | null,
    isLoading: boolean,
    texts: GameInfoTexts
  ) {
    let infoText = `Game ID: ${game.id.substring(0, 8)}...\n`;
    infoText += `Your Color: ${playerColor === 'black' ? '⚫' : '⚪'}\n`;
    infoText += `Created: ${new Date(game.created_at).toLocaleTimeString()}\n`;

    if (isLoading) {
      infoText += `Status: ${texts.loading}`;
    } else if (isGameFinished) {
      infoText += `Status: ${i18next.t('gamePlay.gameFinished')}\n`;
      if (winner) {
        const winnerText = winner === playerColor ? i18next.t('gamePlay.win') : i18next.t('gamePlay.lose');
        infoText += `Result: ${winnerText}`;
      }
    }

    this.infoText.setText(infoText);
  }

  updateGameStatus(isGameFinished: boolean, isPlayerTurn: boolean, isLoading: boolean) {
    if (isGameFinished) {
      this.statusText.setText(i18next.t('gamePlay.gameFinished'));
    } else if (isPlayerTurn && !isLoading) {
      this.statusText.setText(i18next.t('gamePlay.yourTurn'));
    } else if (!isLoading) {
      this.statusText.setText(i18next.t('gamePlay.opponentTurn'));
    } else {
      this.statusText.setText(i18next.t('gamePlay.loading'));
    }
  }

  updateButtonVisibility(isGameFinished: boolean, isLoading: boolean) {
    this.createGameButton.setVisible(isGameFinished);
    this.forfeitButton.setVisible(!isGameFinished && !isLoading);
  }

  showGameResult(message: string) {
    this.statusText.setText(message);
  }

  showError(error: string) {
    this.errorText.setText(error).setVisible(true);
    // 3秒後にエラーメッセージを非表示にする
    this.scene.time.delayedCall(3000, () => {
      this.errorText.setVisible(false);
    });
  }

  destroy() {
    this.infoText.destroy();
    this.statusText.destroy();
    this.createGameButton.destroy();
    this.forfeitButton.destroy();
    this.debugText.destroy();
    this.backButton.destroy();
    this.errorText.destroy();
  }
} 