/**
 * 五目並べのゲームシーン
 * this.gameContainer.on("hoge") でイベントを登録し、
 * GameEvents で 実装している this.gameContainer.emit("hoge") でイベントを発火している。
 * 
 * 責務：
 * - シーンのライフサイクル管理
 * - 各コンポーネントの初期化と連携
 * - ゲームマネージャーとのイベント連携
 */

import * as Phaser from 'phaser';
import { GomokuContainer } from 'src/scenes/Gomoku/GomokuContainer';
import { GomokuBoardRender } from 'src/scenes/Gomoku/view/GomokuBoard';
import { GomokuUI } from 'src/scenes/Gomoku/view/GomokuUI';
import { GomokuSessionController } from 'src/scenes/Gomoku/view/GomokuSessionController';
import type { Gomoku, Player } from 'src/types';
import { logger } from 'src/utils/logger';
import { GameEventNames } from 'src/scenes/Gomoku/core/GameEventNames';
import { SCENE_KEYS } from 'src/consts/scenes';

export class GomokuGameScene extends Phaser.Scene {
  private gameContainer!: GomokuContainer;
  private gameBoard!: GomokuBoardRender;
  private ui!: GomokuUI;
  private state!: GomokuSessionController;

  constructor() {
    super(SCENE_KEYS.GOMOKU_GAME);
  }

  init(data: { playerId: string }) {
    this.state = new GomokuSessionController();
    this.gameContainer = new GomokuContainer(data.playerId);
    this.setupGameManagerEvents();
  }

  private setupGameManagerEvents() {
    this.gameContainer.on(GameEventNames.GAME_CREATED, (game: Gomoku) => {
      logger.info('ゲームが作成されました:', game.id);
      this.state.setGameId(game.id);
      this.updateDisplay();
      this.updateBoard();
    });

    this.gameContainer.on(GameEventNames.GAME_UPDATED, (game: Gomoku) => {
      logger.info('ゲームが更新されました:', game.id);
      this.updateDisplay();
      this.updateBoard();
    });

    this.gameContainer.on(GameEventNames.GAME_FINISHED, (game: Gomoku, winner: Player | null) => {
      logger.info('ゲームが終了しました:', game.id, '勝者:', winner);
      this.updateDisplay();
      this.showGameResult(winner);
    });

    this.gameContainer.on(GameEventNames.ERROR, (error: string) => {
      logger.error('ゲームエラー:', error);
      this.showError(error);
    });
  }

  create() {
    // UIの初期化
    this.ui = new GomokuUI(this);
    this.ui.setupEventHandlers({
      onCreateGame: () => this.createNewGame(),
      onForfeitGame: () => this.forfeitGame(),
      onBack: () => this.scene.start(SCENE_KEYS.MAIN_MENU)
    });

    // 盤面の初期化
    this.gameBoard = new GomokuBoardRender(this);
    this.gameBoard.setupClickHandler((row, col) => {
      const gameId = this.state.getGameId();
      if (gameId && !this.state.isGameLoading() &&
        this.gameContainer.canPlaceStone(gameId, row, col)) {
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

    const games = await this.gameContainer.loadPlayerGames();

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
      await this.gameContainer.createGame(opponentId, true);
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
      await this.gameContainer.makeMove(gameId, row, col);
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
      await this.gameContainer.forfeitGame(gameId);
    } finally {
      this.state.setLoading(false);
      this.updateDisplay();
    }
  }

  private updateBoard() {
    const gameId = this.state.getGameId();
    if (!gameId) return;

    const game = this.gameContainer.getGame(gameId);
    if (!game) return;

    this.gameBoard.updateBoard(game.board_state);
  }

  /**
   * デバッグ情報の表示を更新する
   */
  private updateDebugDisplay() {
    const debugInfo = this.gameContainer.getDebugInfo();
    const activeSessions = Object.values(debugInfo.activeSessions).filter(session => session.isActive).length;
    this.ui.updateDebugInfo(debugInfo.playerId, activeSessions);
  }

  /**
   * ゲームが存在しない場合の表示を更新する
   */
  private updateNoGameDisplay() {
    this.ui.updateForNoGame(this.gameContainer.getPlayerId(), this.state.isGameLoading());
  }

  /**
   * アクティブなゲームの情報を表示する
   * @param gameId 表示対象のゲームID
   */
  private updateActiveGameDisplay(gameId: string) {
    const game = this.gameContainer.getGame(gameId);
    if (!game) return;

    const playerColor = this.gameContainer.getPlayerColor(gameId);
    if (!playerColor) return;

    const isGameFinished = this.gameContainer.isGameFinished(gameId);
    const winner = this.gameContainer.getWinner(gameId);
    const isPlayerTurn = this.gameContainer.isPlayerTurn(gameId);

    // ゲーム情報の更新
    this.ui.updateGameInfo(game, playerColor, isGameFinished, winner, this.state.isGameLoading());
    this.ui.updateGameStatus(isGameFinished, isPlayerTurn, this.state.isGameLoading());
    this.ui.updateButtonVisibility(isGameFinished, this.state.isGameLoading());
  }

  /**
   * 画面表示全体を更新する
   * デバッグ情報とゲーム状態に応じた表示の更新を行う
   */
  private updateDisplay() {
    // デバッグ情報の更新
    this.updateDebugDisplay();

    // ゲームIDの取得
    const gameId = this.state.getGameId();
    if (!gameId) {
      this.updateNoGameDisplay();
      return;
    }

    // アクティブなゲームの表示更新
    this.updateActiveGameDisplay(gameId);
  }

  private showGameResult(winner: Player | null) {
    const gameId = this.state.getGameId();
    if (!gameId) return;

    const playerColor = this.gameContainer.getPlayerColor(gameId);
    let message = 'ゲーム終了！\n';

    if (winner === null) {
      message += '引き分けです';
    } else if (winner === playerColor) {
      message += 'おめでとうございます！\nあなたの勝利です！';
    } else {
      message += '残念！\n相手の勝利です';
    }

    logger.debug('ゲームメッセージ:', message);
  }

  private showError(error: string) {
    logger.error('エラー:', error);
  }

  destroy() {
    this.gameContainer.cleanup();
    this.gameBoard.destroy();
    this.ui.destroy();
    this.state.reset();
  }
} 
