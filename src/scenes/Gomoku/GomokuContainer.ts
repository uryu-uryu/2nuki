/**
 * GomokuContainer - 五目並べゲームのコンテナクラス
 * 
 * このクラスは以下の責務を持ちます：
 * 1. ゲームマネージャーとの連携
 *    - GomokuGameManagerのインスタンス管理
 *    - ゲームマネージャーのイベントハンドリング
 *    - ゲーム状態の更新通知
 * 
 * 2. ゲームセッション管理
 *    - 現在のゲームIDの管理
 *    - ローディング状態の管理
 *    - 既存ゲームのロード
 * 
 * 3. ユーザーインタラクション制御
 *    - ゲーム操作（石を置く、投了など）の仲介
 *    - ゲーム状態の参照機能の提供
 *    - エラーハンドリングとフィードバック
 * 
 * 4. UI更新のトリガー
 *    - ゲーム状態変更時のコールバック実行
 *    - エラー発生時の通知
 *    - ゲーム終了時の結果通知
 */

import type { Gomoku, Player } from '../../types';
import { GomokuManager } from './GomokuManager';
import type { DebugInfo } from './GomokuManager';

export class GomokuContainer {
  private gameManager: GomokuManager;
  private currentGameId: string | null = null;
  private isLoading: boolean = false;

  constructor(playerId: string) {
    this.gameManager = new GomokuManager(playerId);
    this.setupGameManagerEvents();
  }

  private setupGameManagerEvents() {
    this.gameManager.on('gameCreated', (game: Gomoku) => {
      console.log('ゲームが作成されました:', game.id);
      this.currentGameId = game.id;
      this.onGameUpdated?.();
    });

    this.gameManager.on('gameUpdated', (game: Gomoku) => {
      console.log('ゲームが更新されました:', game.id);
      this.onGameUpdated?.();
    });

    this.gameManager.on('gameFinished', (game: Gomoku, winner: Player | null) => {
      console.log('ゲームが終了しました:', game.id, '勝者:', winner);
      this.onGameFinished?.(winner);
    });

    this.gameManager.on('error', (error: string) => {
      console.error('ゲームエラー:', error);
      this.onError?.(error);
    });
  }

  // コールバック関数
  public onGameUpdated?: () => void;
  public onGameFinished?: (winner: Player | null) => void;
  public onError?: (error: string) => void;

  // ゲーム操作メソッド
  async loadExistingGames() {
    this.isLoading = true;
    this.onGameUpdated?.();

    const games = await this.gameManager.loadPlayerGames();
    
    if (games.length > 0) {
      const activeGame = games.find(game => !game.is_finished);
      if (activeGame) {
        this.currentGameId = activeGame.id;
      }
    }

    this.isLoading = false;
    this.onGameUpdated?.();
  }

  async createNewGame() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.onGameUpdated?.();

    try {
      const opponentId = '22222222-2222-2222-2222-222222222222';
      await this.gameManager.createGame(opponentId, true);
    } finally {
      this.isLoading = false;
      this.onGameUpdated?.();
    }
  }

  async makeMove(row: number, col: number) {
    if (!this.currentGameId || this.isLoading) return;

    this.isLoading = true;
    this.onGameUpdated?.();

    try {
      await this.gameManager.makeMove(this.currentGameId, row, col);
    } finally {
      this.isLoading = false;
      this.onGameUpdated?.();
    }
  }

  async forfeitGame() {
    if (!this.currentGameId || this.isLoading) return;

    this.isLoading = true;
    this.onGameUpdated?.();

    try {
      await this.gameManager.forfeitGame(this.currentGameId);
    } finally {
      this.isLoading = false;
      this.onGameUpdated?.();
    }
  }

  // ゲーム状態取得メソッド
  getCurrentGame(): Gomoku | null {
    return this.currentGameId ? this.gameManager.getGame(this.currentGameId) : null;
  }

  getPlayerColor(): Player | null {
    return this.currentGameId ? this.gameManager.getPlayerColor(this.currentGameId) : null;
  }

  isPlayerTurn(): boolean {
    return this.currentGameId ? this.gameManager.isPlayerTurn(this.currentGameId) : false;
  }

  isGameFinished(): boolean {
    return this.currentGameId ? this.gameManager.isGameFinished(this.currentGameId) : false;
  }

  getWinner(): Player | null {
    return this.currentGameId ? this.gameManager.getWinner(this.currentGameId) : null;
  }

  canPlaceStone(row: number, col: number): boolean {
    return this.currentGameId ? this.gameManager.canPlaceStone(this.currentGameId, row, col) : false;
  }

  getPlayerId(): string {
    return this.gameManager.getPlayerId();
  }

  getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  // クリーンアップ
  cleanup() {
    this.gameManager.cleanup();
  }

  // デバッグ情報
  getDebugInfo(): DebugInfo {
    return this.gameManager.getDebugInfo();
  }
} 