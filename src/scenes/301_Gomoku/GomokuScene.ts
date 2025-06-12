/**
 * 五目並べのゲームシーン
 * this.gameContainer.on("hoge") でイベントを登録し、
 * GameEvents で 実装している this.gameContainer.emit("hoge") でイベントを発火している。
 * 
 * 責務：
 * - シーンのライフサイクル管理
 * - 各コンポーネントの初期化と連携
 * - ゲームマネージャーとのイベント連携
 * - マッチメイキングからのゲーム開始
 */

import * as Phaser from 'phaser';
import { GomokuContainer } from '@/scenes/301_Gomoku/GomokuContainer';
import { GomokuBoardRender } from '@/scenes/301_Gomoku/view/GomokuBoard';
import { GomokuUI } from '@/scenes/301_Gomoku/view/GomokuUI';
import { GomokuSessionController } from '@/scenes/301_Gomoku/view/GomokuSessionController';
import type { Gomoku, Player } from 'src/types';
import type { MatchTransitionData } from 'src/types/matchmaking';
import { logger } from 'src/utils/logger';
import { GameEventNames } from '@/scenes/301_Gomoku/core/GameEventNames';
import { SCENE_KEYS } from 'src/consts/scenes';
import i18next from 'src/i18n/config';

export class GomokuGameScene extends Phaser.Scene {
  private gameContainer!: GomokuContainer;
  private gameBoard!: GomokuBoardRender;
  private ui!: GomokuUI;
  private state!: GomokuSessionController;
  private matchData?: MatchTransitionData;

  constructor() {
    super(SCENE_KEYS._301_GOMOKU_GAME);
  }

  init(data?: MatchTransitionData | { playerId: string }) {
    // マッチメイキングからのデータか従来のプレイヤーIDかを判定
    if (data && 'matchId' in data) {
      // マッチメイキングからの遷移
      this.matchData = data;
      this.state = new GomokuSessionController();
      this.gameContainer = new GomokuContainer(data.myPlayerId);
      logger.info('マッチメイキングからゲーム開始:', {
        gameId: data.gameId,
        matchId: data.matchId,
        role: data.isBlackPlayer ? '先攻（黒石）' : '後攻（白石）'
      });
    } else if (data && 'playerId' in data) {
      // 従来の方式（手動ゲーム作成）
      this.state = new GomokuSessionController();
      this.gameContainer = new GomokuContainer(data.playerId);
      logger.info('手動ゲーム作成モードで開始:', data.playerId);
    } else {
      // デフォルト（デバッグ用）
      this.state = new GomokuSessionController();
      this.gameContainer = new GomokuContainer('default-player');
      logger.warn('デフォルトプレイヤーでゲーム開始');
    }

    this.setupGameManagerEvents();
  }

  private setupGameManagerEvents() {
    this.gameContainer.on(GameEventNames.GAME_CREATED, (game: Gomoku) => {
      logger.info(i18next.t('gamePlay.newGame'), game.id);
      this.state.setGameId(game.id);
      this.updateDisplay();
      this.updateBoard();
    });

    this.gameContainer.on(GameEventNames.GAME_UPDATED, (game: Gomoku) => {
      logger.info(i18next.t('gamePlay.turn', { player: game.current_player_turn }), game.id);
      this.updateDisplay();
      this.updateBoard();
    });

    this.gameContainer.on(GameEventNames.GAME_FINISHED, (game: Gomoku, winner: Player | null) => {
      logger.info(i18next.t('gamePlay.gameFinished'), game.id, i18next.t('gamePlay.winner'), winner);
      this.updateDisplay();
      this.showGameResult(winner);
    });

    this.gameContainer.on(GameEventNames.ERROR, (error: string) => {
      logger.error(i18next.t('gamePlay.error'), error);
      this.showError(error);
    });
  }

  create() {
    // UIの初期化
    this.ui = new GomokuUI(this);
    this.ui.setupEventHandlers({
      onCreateGame: () => this.createNewGame(),
      onForfeitGame: () => this.forfeitGame(),
      onBack: () => this.scene.start(SCENE_KEYS._101_MAIN_MENU)
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

    // マッチメイキングからの遷移かどうかで処理を分ける
    if (this.matchData) {
      this.startMatchedGame();
    } else {
      this.loadExistingGames();
    }

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
      const opponentId = 'D4E0667168AEB3C';
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
    this.ui.updateGameInfo(
      game,
      playerColor,
      isGameFinished,
      winner,
      this.state.isGameLoading(),
      {
        loading: i18next.t('gamePlay.loading'),
        yourTurn: i18next.t('gamePlay.yourTurn'),
        opponentTurn: i18next.t('gamePlay.opponentTurn'),
        waitingForOpponent: i18next.t('gamePlay.waitingForOpponent')
      }
    );
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
    const message = winner
      ? i18next.t('gamePlay.win')
      : i18next.t('gamePlay.draw');
    this.ui.showGameResult(message);
  }

  private showError(error: string) {
    logger.error(error);
    this.ui.showError(i18next.t('gamePlay.error'));
  }

  /**
   * マッチメイキングから作成されたゲームを開始
   */
  private async startMatchedGame() {
    if (!this.matchData) {
      logger.error('マッチデータが存在しません');
      return;
    }

    this.state.setLoading(true);
    this.updateDisplay();

    try {
      if (this.matchData.gameId) {
        // Supabaseで作成済みのゲームを読み込み
        this.state.setGameId(this.matchData.gameId);

        // プレイヤーのゲーム一覧を読み込んで該当ゲームを取得
        await this.gameContainer.loadPlayerGames();

        // ゲームデータを取得して盤面を更新
        const game = this.gameContainer.getGame(this.matchData.gameId);
        if (game) {
          this.updateBoard();
          logger.info('マッチメイキングゲーム読み込み完了:', {
            gameId: this.matchData.gameId,
            blackPlayer: game.black_player_id,
            whitePlayer: game.white_player_id,
            myRole: this.matchData.isBlackPlayer ? '先攻（黒石）' : '後攻（白石）'
          });
        } else {
          logger.error('ゲームが見つかりません:', this.matchData.gameId);
          this.showError('ゲームが見つかりませんでした');
        }
      }
    } catch (error) {
      logger.error('マッチメイキングゲーム開始エラー:', error);
      this.showError('ゲームの開始に失敗しました');
    } finally {
      this.state.setLoading(false);
      this.updateDisplay();
    }
  }

  destroy() {
    this.gameContainer.cleanup();
    this.gameBoard.destroy();
    this.ui.destroy();
    this.state.reset();
  }
} 
