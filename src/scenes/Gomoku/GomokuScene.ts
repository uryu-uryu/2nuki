/**
 * 五目並べのゲームシーン
 * 
 * 責務：
 * - シーンのライフサイクル管理
 * - UIコンポーネントの作成と管理
 * - ゲームマネージャーとのイベント連携
 * - ゲームの状態表示
 * - ユーザー入力の制御
 */

import * as Phaser from 'phaser';
import { GomokuManager } from './GomokuManager';
import { GomokuBoardRender } from './service/GomokuBoard';
import type { Gomoku, Player } from '../../types';
import { BOARD, PADDING } from '../../consts/layout';
import { COLORS, DEFAULT_TEXT_STYLE, SMALL_TEXT_STYLE } from '../../consts/styles';

export class GomokuGameScene extends Phaser.Scene {
  private gameManager!: GomokuManager;
  private gameBoard!: GomokuBoardRender;
  private currentGameId: string | null = null;

  // UI要素
  private infoText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private createGameButton!: Phaser.GameObjects.Text;
  private forfeitButton!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;

  // ゲーム状態
  private isLoading: boolean = false;

  constructor() {
    super({ key: 'GomokuGame' });
  }

  init(data: { playerId: string }) {
    this.gameManager = new GomokuManager(data.playerId);
    this.setupGameManagerEvents();
  }

  private setupGameManagerEvents() {
    this.gameManager.on('gameCreated', (game: Gomoku) => {
      console.log('ゲームが作成されました:', game.id);
      this.currentGameId = game.id;
      this.updateDisplay();
      this.updateBoard();
    });

    this.gameManager.on('gameUpdated', (game: Gomoku) => {
      console.log('ゲームが更新されました:', game.id);
      this.updateDisplay();
      this.updateBoard();
    });

    this.gameManager.on('gameFinished', (game: Gomoku, winner: Player | null) => {
      console.log('ゲームが終了しました:', game.id, '勝者:', winner);
      this.updateDisplay();
      this.showGameResult(winner);
    });

    this.gameManager.on('error', (error: string) => {
      console.error('ゲームエラー:', error);
      this.showError(error);
    });
  }

  preload() {
    // 必要な場合は画像やアセットをここで読み込み
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    // 盤面を作成
    this.gameBoard = new GomokuBoardRender(this);
    this.gameBoard.setupClickHandler((row, col) => {
      if (this.currentGameId && !this.isLoading &&
        this.gameManager.canPlaceStone(this.currentGameId, row, col)) {
        this.makeMove(row, col);
      }
    });

    // UI要素を作成
    this.createUI();

    // 既存のゲームを読み込み
    this.loadExistingGames();

    // 初期状態を表示
    this.updateDisplay();
  }

  private createUI() {
    // 情報表示テキスト
    this.infoText = this.add.text(BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50, BOARD.OFFSET_Y, '', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.PRIMARY
    });

    // ステータステキスト
    this.statusText = this.add.text(BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50, BOARD.OFFSET_Y + 120, '', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.PRIMARY
    });

    // ゲーム作成ボタン
    this.createGameButton = this.add.text(BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50, BOARD.OFFSET_Y + 200, 'ゲーム作成', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.PRIMARY,
      padding: PADDING.SMALL
    }).setInteractive({ useHandCursor: true });

    // ゲーム放棄ボタン
    this.forfeitButton = this.add.text(BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE + 50, BOARD.OFFSET_Y + 250, 'ゲーム放棄', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.DANGER,
      padding: PADDING.SMALL
    }).setInteractive({ useHandCursor: true }).setVisible(false);

    // デバッグ情報テキスト
    this.debugText = this.add.text(10, 10, '', {
      ...SMALL_TEXT_STYLE,
      color: COLORS.TEXT.SECONDARY
    });

    // 戻るボタン
    this.backButton = this.add.text(10, 10, '戻る', {
      ...DEFAULT_TEXT_STYLE,
      color: COLORS.TEXT.WHITE,
      backgroundColor: COLORS.BUTTON.PRIMARY,
      padding: PADDING.SMALL
    }).setInteractive({ useHandCursor: true });

    // ボタンのクリックイベント
    this.createGameButton.on('pointerdown', () => this.createNewGame());
    this.forfeitButton.on('pointerdown', () => this.forfeitGame());
    this.backButton.on('pointerdown', () => this.scene.start('MainMenu'));
  }

  private async loadExistingGames() {
    this.isLoading = true;
    this.updateDisplay();

    const games = await this.gameManager.loadPlayerGames();

    // アクティブなゲームがあれば最初のものを選択
    if (games.length > 0) {
      const activeGame = games.find(game => !game.is_finished);
      if (activeGame) {
        this.currentGameId = activeGame.id;
        this.updateBoard();
      }
    }

    this.isLoading = false;
    this.updateDisplay();
  }

  private async createNewGame() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.updateDisplay();

    try {
      // ローカル環境用の固定UUID
      const opponentId = '22222222-2222-2222-2222-222222222222';
      await this.gameManager.createGame(opponentId, true);
    } finally {
      this.isLoading = false;
      this.updateDisplay();
    }
  }

  private async makeMove(row: number, col: number) {
    if (!this.currentGameId || this.isLoading) return;

    this.isLoading = true;
    this.updateDisplay();

    try {
      await this.gameManager.makeMove(this.currentGameId, row, col);
    } finally {
      this.isLoading = false;
      this.updateDisplay();
    }
  }

  private async forfeitGame() {
    if (!this.currentGameId || this.isLoading) return;

    this.isLoading = true;
    this.updateDisplay();

    try {
      await this.gameManager.forfeitGame(this.currentGameId);
    } finally {
      this.isLoading = false;
      this.updateDisplay();
    }
  }

  private updateBoard() {
    if (!this.currentGameId) return;

    const game = this.gameManager.getGame(this.currentGameId);
    if (!game) return;

    this.gameBoard.updateBoard(game.board_state);
  }

  private updateDisplay() {
    // デバッグ情報を更新
    const debugInfo = this.gameManager.getDebugInfo();
    this.debugText.setText(`Player: ${debugInfo.playerId.substring(0, 12)}... | Sessions: ${debugInfo.activeSessions}`);

    if (!this.currentGameId) {
      this.infoText.setText('プレイヤーID:\n' + this.gameManager.getPlayerId().substring(0, 20) + '...');
      this.statusText.setText(this.isLoading ? '読み込み中...' : 'ゲームを作成してください');
      this.createGameButton.setVisible(!this.isLoading);
      this.forfeitButton.setVisible(false);
      return;
    }

    const game = this.gameManager.getGame(this.currentGameId);
    if (!game) return;

    // ゲーム情報を表示
    const playerColor = this.gameManager.getPlayerColor(this.currentGameId);
    const isPlayerTurn = this.gameManager.isPlayerTurn(this.currentGameId);
    const isGameFinished = this.gameManager.isGameFinished(this.currentGameId);
    const winner = this.gameManager.getWinner(this.currentGameId);

    let infoText = `ゲームID: ${game.id.substring(0, 8)}...\n`;
    infoText += `あなたの色: ${playerColor === 'black' ? '黒' : '白'}\n`;
    infoText += `作成日時: ${new Date(game.created_at).toLocaleTimeString()}\n`;

    if (this.isLoading) {
      infoText += '状態: 処理中...';
    } else if (isGameFinished) {
      infoText += '状態: ゲーム終了\n';
      if (winner) {
        const winnerText = winner === playerColor ? 'あなたの勝利!' : '相手の勝利';
        infoText += `結果: ${winnerText}`;
      }
    } else {
      infoText += `ターン: ${isPlayerTurn ? 'あなた' : '相手'}`;
    }

    this.infoText.setText(infoText);

    // ステータステキスト
    if (isGameFinished) {
      this.statusText.setText('ゲームが終了しました\n新しいゲームを作成できます');
    } else if (isPlayerTurn && !this.isLoading) {
      this.statusText.setText('あなたのターンです\n盤面をクリックして石を置いてください');
    } else if (!this.isLoading) {
      this.statusText.setText('相手のターンです\nお待ちください');
    } else {
      this.statusText.setText('処理中...');
    }

    // ボタンの表示制御
    this.createGameButton.setVisible(isGameFinished);
    this.forfeitButton.setVisible(!isGameFinished && !this.isLoading);
  }

  private showGameResult(winner: Player | null) {
    if (!this.currentGameId) return;

    const playerColor = this.gameManager.getPlayerColor(this.currentGameId);
    let message = 'ゲーム終了！\n';

    if (winner === null) {
      message += '引き分けです';
    } else if (winner === playerColor) {
      message += 'おめでとうございます！\nあなたの勝利です！';
    } else {
      message += '残念！\n相手の勝利です';
    }

    console.log(message);
  }

  private showError(error: string) {
    console.error('エラー:', error);
  }

  destroy() {
    this.gameManager.cleanup();
    this.gameBoard.destroy();
  }
} 
