/**
 * GomokuContainer - 五目並べゲームのメインコンテナクラス
 * 
 * このクラスは以下の責務を持ちます：
 * 1. 各管理クラスの統合
 * 2. 外部からのインターフェース提供
 * 3. ゲーム全体の制御
 */

import type { Gomoku, Player } from 'src/types';
import type { GameManagerEvents, GameUpdateData, DebugInfo } from 'src/types/gomoku';
import { GomokuBoardManager } from '@/view/scenes/301_Gomoku/core/GomokuBoardManager';
import { GameRules } from '@/view/scenes/301_Gomoku/core/GameRules';
import { GameEvents } from '@/view/scenes/301_Gomoku/core/GameEvents';
import { SessionManager } from '@/view/scenes/301_Gomoku/online/SessionManager';
import { SyncManager } from '@/view/scenes/301_Gomoku/online/SyncManager';

export class GomokuContainer {
  private events: GameEvents;
  private sessionManager: SessionManager;
  private syncManager: SyncManager;
  private gameStates: Map<string, GomokuBoardManager> = new Map();
  private playerId: string;

  constructor(playerId?: string) {
    if (!playerId) {
      throw new Error('playerId is required');
    }
    this.playerId = playerId;
    this.events = new GameEvents();
    this.sessionManager = new SessionManager(this.events);
    this.syncManager = new SyncManager(this.playerId, this.sessionManager, this.events);
  }

  // イベントハンドラーの設定
  on<K extends keyof GameManagerEvents>(event: K, handler: GameManagerEvents[K]): void {
    this.events.on(event, handler);
  }

  // プレイヤーIDを取得
  getPlayerId(): string {
    return this.playerId;
  }

  // 新しいゲームを作成
  async createGame(opponentId: string, playerAsBlack: boolean = true): Promise<Gomoku | null> {
    return this.syncManager.createGame(opponentId, playerAsBlack);
  }

  // 手を打つ
  async makeMove(gameId: string, row: number, col: number): Promise<boolean> {
    const game = this.sessionManager.getGame(gameId);
    if (!game) {
      this.events.emitError('ゲームが見つかりません');
      return false;
    }

    const gameState = this.getOrCreateGameState(game);
    if (!gameState.canPlaceStone(row, col)) {
      this.events.emitError('その位置には石を置けません');
      return false;
    }

    const playerStone = gameState.getPlayerColor() === 'black' ? 1 : 2;
    const boardState = game.board_state;
    const newBoardState = boardState.map((r: number[]) => [...r]);
    newBoardState[row][col] = playerStone;

    const isWinner = GameRules.checkWinner(newBoardState, row, col, playerStone);
    const now = new Date().toISOString();

    const updateData: GameUpdateData = {
      board_state: newBoardState,
      updated_at: now,
      current_player_turn: gameState.getNextPlayer()
    };

    if (isWinner) {
      updateData.is_finished = true;
      updateData.winner_id = this.playerId;
      updateData.finished_at = now;
    }

    const updatedGame = await this.syncManager.updateGameState(gameId, updateData);
    return !!updatedGame;
  }

  // ゲームを放棄
  async forfeitGame(gameId: string): Promise<boolean> {
    const game = this.sessionManager.getGame(gameId);
    if (!game) {
      this.events.emitError('ゲームが見つかりません');
      return false;
    }

    if (game.is_finished) {
      this.events.emitError('ゲームは既に終了しています');
      return false;
    }

    const gameState = this.getOrCreateGameState(game);
    const winnerId = gameState.getNextPlayer();
    const now = new Date().toISOString();

    const updateData: GameUpdateData = {
      board_state: game.board_state,
      is_finished: true,
      winner_id: winnerId,
      finished_at: now,
      updated_at: now
    };

    const updatedGame = await this.syncManager.updateGameState(gameId, updateData);
    return !!updatedGame;
  }

  // プレイヤーの色を取得
  getPlayerColor(gameId: string): Player | null {
    const game = this.sessionManager.getGame(gameId);
    if (!game) return null;

    const gameState = this.getOrCreateGameState(game);
    return gameState.getPlayerColor();
  }

  // プレイヤーのアクティブなゲーム一覧を取得
  async loadPlayerGames(): Promise<Gomoku[]> {
    return this.syncManager.loadPlayerGames();
  }

  // 特定のゲームを取得
  getGame(gameId: string): Gomoku | null {
    return this.sessionManager.getGame(gameId);
  }

  // 全てのアクティブなゲームを取得
  getActiveGames(): Gomoku[] {
    return this.sessionManager.getActiveGames();
  }

  // プレイヤーのターンかどうか
  isPlayerTurn(gameId: string): boolean {
    const game = this.sessionManager.getGame(gameId);
    if (!game) return false;

    const gameState = this.getOrCreateGameState(game);
    return gameState.isPlayerTurn();
  }

  // ゲームが終了しているかどうか
  isGameFinished(gameId: string): boolean {
    const game = this.sessionManager.getGame(gameId);
    if (!game) return false;

    const gameState = this.getOrCreateGameState(game);
    return gameState.isGameFinished();
  }

  // ゲームの勝者を取得
  getWinner(gameId: string): Player | null {
    const game = this.sessionManager.getGame(gameId);
    if (!game) return null;

    const gameState = this.getOrCreateGameState(game);
    return gameState.getWinner();
  }

  // 手を打てるかどうかをチェック
  canMakeMove(gameId: string): boolean {
    const game = this.sessionManager.getGame(gameId);
    if (!game) return false;

    const gameState = this.getOrCreateGameState(game);
    return !gameState.isGameFinished() && gameState.isPlayerTurn();
  }

  // 指定位置に石を置けるかチェック
  canPlaceStone(gameId: string, row: number, col: number): boolean {
    const game = this.sessionManager.getGame(gameId);
    if (!game) return false;

    const gameState = this.getOrCreateGameState(game);
    return gameState.canPlaceStone(row, col);
  }

  // GameStateの取得または作成
  private getOrCreateGameState(game: Gomoku): GomokuBoardManager {
    let gameState = this.gameStates.get(game.id);
    if (!gameState) {
      gameState = new GomokuBoardManager(game, this.playerId);
      this.gameStates.set(game.id, gameState);
    } else {
      gameState.updateGameData(game);
    }
    return gameState;
  }

  // クリーンアップ
  cleanup(): void {
    this.syncManager.cleanup();
    this.sessionManager.cleanup();
    this.events.cleanup();
    this.gameStates.clear();
  }

  // デバッグ情報を取得
  getDebugInfo(): DebugInfo {
    return {
      activeSessions: Object.fromEntries(this.sessionManager['activeSessions']),
      playerId: this.playerId
    };
  }
} 