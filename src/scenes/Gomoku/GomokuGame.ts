import * as Phaser from 'phaser';
import { GomokuGameManager } from '../../utils/GomokuGameManager';
import type { Gomoku, Player } from '../../types';

// 盤面の設定
const BOARD_SIZE = 15;
const CELL_SIZE = 30;
const BOARD_OFFSET_X = 50;
const BOARD_OFFSET_Y = 50;
const STONE_RADIUS = 12;

// 色の設定
const COLORS = {
  BOARD: 0xDEB887,
  GRID: 0x8B4513,
  BLACK_STONE: 0x000000,
  WHITE_STONE: 0xFFFFFF,
  WHITE_STONE_BORDER: 0x000000,
  HIGHLIGHT: 0xFF0000,
  BACKGROUND: 0xF5F5DC
};

export class GomokuGame extends Phaser.Scene {
  private gameManager!: GomokuGameManager;
  private currentGameId: string | null = null;
  
  // UI要素
  private board!: Phaser.GameObjects.Graphics;
  private stones: (Phaser.GameObjects.Graphics | null)[][] = [];
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
    this.gameManager = new GomokuGameManager(data.playerId);
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
    this.createBoard();

    // UI要素を作成
    this.createUI();

    // 入力イベントを設定
    this.setupInputEvents();

    // 既存のゲームを読み込み
    this.loadExistingGames();

    // 初期状態を表示
    this.updateDisplay();
  }

  private createBoard() {
    // 盤面の背景
    this.board = this.add.graphics();
    this.board.fillStyle(COLORS.BOARD);
    this.board.fillRect(
      BOARD_OFFSET_X - 10,
      BOARD_OFFSET_Y - 10,
      BOARD_SIZE * CELL_SIZE + 20,
      BOARD_SIZE * CELL_SIZE + 20
    );

    // グリッド線を描画
    this.board.lineStyle(1, COLORS.GRID);
    for (let i = 0; i <= BOARD_SIZE; i++) {
      // 縦線
      this.board.moveTo(BOARD_OFFSET_X + i * CELL_SIZE, BOARD_OFFSET_Y);
      this.board.lineTo(BOARD_OFFSET_X + i * CELL_SIZE, BOARD_OFFSET_Y + BOARD_SIZE * CELL_SIZE);
      
      // 横線
      this.board.moveTo(BOARD_OFFSET_X, BOARD_OFFSET_Y + i * CELL_SIZE);
      this.board.lineTo(BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE, BOARD_OFFSET_Y + i * CELL_SIZE);
    }
    this.board.strokePath();

    // 石を配置するためのグラフィックス配列を初期化
    this.stones = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  }

  private createUI() {
    // 情報表示テキスト
    this.infoText = this.add.text(BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 50, BOARD_OFFSET_Y, '', {
      fontSize: '16px',
      color: '#000000',
      fontFamily: 'Arial'
    });

    // ステータステキスト
    this.statusText = this.add.text(BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 50, BOARD_OFFSET_Y + 120, '', {
      fontSize: '14px',
      color: '#000000',
      fontFamily: 'Arial'
    });

    // ゲーム作成ボタン
    this.createGameButton = this.add.text(BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 50, BOARD_OFFSET_Y + 200, 'ゲーム作成', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { x: 10, y: 5 },
      fontFamily: 'Arial'
    }).setInteractive({ useHandCursor: true });

    // ゲーム放棄ボタン
    this.forfeitButton = this.add.text(BOARD_OFFSET_X + BOARD_SIZE * CELL_SIZE + 50, BOARD_OFFSET_Y + 250, 'ゲーム放棄', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#f44336',
      padding: { x: 10, y: 5 },
      fontFamily: 'Arial'
    }).setInteractive({ useHandCursor: true }).setVisible(false);

    // デバッグ情報テキスト
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'Arial'
    });

    // 戻るボタン
    this.backButton = this.add.text(10, 10, '戻る', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { x: 10, y: 5 },
      fontFamily: 'Arial'
    }).setInteractive({ useHandCursor: true });
  }

  private setupInputEvents() {
    // 盤面のクリックイベント
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isLoading || !this.currentGameId) return;

      // クリック位置を交点に合わせて調整
      const x = pointer.x - BOARD_OFFSET_X;
      const y = pointer.y - BOARD_OFFSET_Y;

      if (x >= -CELL_SIZE/2 && y >= -CELL_SIZE/2 && 
          x <= BOARD_SIZE * CELL_SIZE + CELL_SIZE/2 && 
          y <= BOARD_SIZE * CELL_SIZE + CELL_SIZE/2) {
        
        // 最も近い交点を計算
        const col = Math.round(x / CELL_SIZE);
        const row = Math.round(y / CELL_SIZE);

        if (col >= 0 && col < BOARD_SIZE && row >= 0 && row < BOARD_SIZE &&
            this.gameManager.canPlaceStone(this.currentGameId, row, col)) {
          this.makeMove(row, col);
        }
      }
    });

    // ボタンのクリックイベント
    this.createGameButton.on('pointerdown', () => {
      this.createNewGame();
    });

    this.forfeitButton.on('pointerdown', () => {
      this.forfeitGame();
    });

    // 戻るボタンのクリックイベント
    this.backButton.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });
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
      // ひとまず固定値とする。
      const opponentId = '22222222-2222-2222-2222-222222222222';
      
      await this.gameManager.createGame(opponentId, true); // プレイヤーを黒にする
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

    // 既存の石をクリア
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (this.stones[row][col]) {
          this.stones[row][col]!.destroy();
          this.stones[row][col] = null;
        }
      }
    }

    // 新しい石を配置
    const board = game.board_state;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const cellValue = board[row][col];
        if (cellValue !== 0) {
          this.drawStone(row, col, cellValue);
        }
      }
    }
  }

  private drawStone(row: number, col: number, stoneType: number) {
    // 交点の位置に石を配置するように調整
    const x = BOARD_OFFSET_X + (col * CELL_SIZE);
    const y = BOARD_OFFSET_Y + (row * CELL_SIZE);

    const stone = this.add.graphics();

    if (stoneType === 1) {
      // 黒石
      stone.fillStyle(COLORS.BLACK_STONE);
      stone.fillCircle(x, y, STONE_RADIUS);
    } else if (stoneType === 2) {
      // 白石
      stone.fillStyle(COLORS.WHITE_STONE);
      stone.fillCircle(x, y, STONE_RADIUS);
      stone.lineStyle(2, COLORS.WHITE_STONE_BORDER);
      stone.strokeCircle(x, y, STONE_RADIUS);
    }

    this.stones[row][col] = stone;
  }

  private updateDisplay() {
    // デバッグ情報を更新
    const debugInfo = this.gameManager.getDebugInfo();
    this.debugText.setText(`Player: ${debugInfo.playerId.substring(0, 12)}... | Sessions: ${debugInfo.activeSessionsCount}`);

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
      infoText += `状態: 処理中...`;
    } else if (isGameFinished) {
      infoText += `状態: ゲーム終了\n`;
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

    // 簡単な結果表示（実際のゲームではもっと洗練されたUIを使用）
    console.log(message);
  }

  private showError(error: string) {
    console.error('エラー:', error);
    // エラー表示のUI実装
  }

  // Phaserシーンのクリーンアップ
  destroy() {
    // リソースをクリーンアップ
    this.gameManager.cleanup();
    // Phaserのシーンはライフサイクル管理が自動的に行われるため、super.destroy()は不要
  }
} 