/**
 * 五目並べのゲームシーン
 * 
 * 責務：
 * - シーンのライフサイクル管理
 * - 各コンポーネントの初期化と連携
 * - ゲームマネージャーとのイベント連携
 */

import * as Phaser from 'phaser';
import { GomokuContainer } from './GomokuContainer';
import { GomokuBoardRender } from './service/GomokuBoard';
import { GomokuUI } from './service/GomokuUI';
import { GomokuState } from './service/GomokuState';
import type { Gomoku, Player } from '../../types';

export class GomokuGameScene extends Phaser.Scene {
  private gameManager!: GomokuContainer;
  private gameBoard!: GomokuBoardRender;
  private ui!: GomokuUI;
  private state!: GomokuState;

  constructor() {
    super({ key: 'GomokuGame' });
  }

  init(data: { playerId: string }) {
    this.state = new GomokuState();
    this.gameManager = new GomokuContainer(data.playerId);
    this.setupGameManagerEvents();
  }

  private setupGameManagerEvents() {
    this.gameManager.on('gameCreated', (game: Gomoku) => {
      console.log('ゲームが作成されました:', game.id);
      this.state.setGameId(game.id);
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

  create() {
    // UIの初期化
    this.ui = new GomokuUI(this);
    this.ui.setupEventHandlers({
      onCreateGame: () => this.createNewGame(),
      onForfeitGame: () => this.forfeitGame(),
      onBack: () => this.scene.start('MainMenu')
    });

    // 盤面の初期化
    this.gameBoard = new GomokuBoardRender(this);
    this.gameBoard.setupClickHandler((row, col) => {
      const gameId = this.state.getGameId();
      if (gameId && !this.state.isGameLoading() &&
        this.gameManager.canPlaceStone(gameId, row, col)) {
        this.makeMove(row, col);
      }
    });

    // 既存のゲームを読み込み
    this.loadExistingGames();

    // 初期状態を表示
    this.updateDisplay();
  }

  private async loadExistingGames() {
    this.state.setLoading(true);
    this.updateDisplay();

    const games = await this.gameManager.loadPlayerGames();

    // アクティブなゲームがあれば最初のものを選択
    if (games.length > 0) {
      const activeGame = games.find(game => !game.is_finished);
      if (activeGame) {
        this.state.setGameId(activeGame.id);
        this.updateBoard();
      }
    }

    this.state.setLoading(false);
    this.updateDisplay();
  }

  private async createNewGame() {
    if (this.state.isGameLoading()) return;

    this.state.setLoading(true);
    this.updateDisplay();

    try {
      const opponentId = '22222222-2222-2222-2222-222222222222';
      await this.gameManager.createGame(opponentId, true);
    } finally {
      this.state.setLoading(false);
      this.updateDisplay();
    }
  }

  private async makeMove(row: number, col: number) {
    const gameId = this.state.getGameId();
    if (!gameId || this.state.isGameLoading()) return;

    this.state.setLoading(true);
    this.updateDisplay();

    try {
      await this.gameManager.makeMove(gameId, row, col);
    } finally {
      this.state.setLoading(false);
      this.updateDisplay();
    }
  }

  private async forfeitGame() {
    const gameId = this.state.getGameId();
    if (!gameId || this.state.isGameLoading()) return;

    this.state.setLoading(true);
    this.updateDisplay();

    try {
      await this.gameManager.forfeitGame(gameId);
    } finally {
      this.state.setLoading(false);
      this.updateDisplay();
    }
  }

  private updateBoard() {
    const gameId = this.state.getGameId();
    if (!gameId) return;

    const game = this.gameManager.getGame(gameId);
    if (!game) return;

    this.gameBoard.updateBoard(game.board_state);
  }

  private updateDisplay() {
    const debugInfo = this.gameManager.getDebugInfo();
    const activeSessions = Object.values(debugInfo.activeSessions).filter(session => session.isActive).length;
    this.ui.updateDebugInfo(debugInfo.playerId, activeSessions);

    const gameId = this.state.getGameId();
    if (!gameId) {
      this.ui.updateForNoGame(this.gameManager.getPlayerId(), this.state.isGameLoading());
      return;
    }

    const game = this.gameManager.getGame(gameId);
    if (!game) return;

    const playerColor = this.gameManager.getPlayerColor(gameId);
    if (!playerColor) return;

    const isGameFinished = this.gameManager.isGameFinished(gameId);
    const winner = this.gameManager.getWinner(gameId);
    const isPlayerTurn = this.gameManager.isPlayerTurn(gameId);

    this.ui.updateGameInfo(game, playerColor, isGameFinished, winner, this.state.isGameLoading());
    this.ui.updateGameStatus(isGameFinished, isPlayerTurn, this.state.isGameLoading());
    this.ui.updateButtonVisibility(isGameFinished, this.state.isGameLoading());
  }

  private showGameResult(winner: Player | null) {
    const gameId = this.state.getGameId();
    if (!gameId) return;

    const playerColor = this.gameManager.getPlayerColor(gameId);
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
    this.ui.destroy();
    this.state.reset();
  }
} 
