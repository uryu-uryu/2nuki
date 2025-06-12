/**
 * SyncManager - 五目並べゲームのオンライン同期管理クラス
 * 
 * このクラスは以下の責務を持ちます：
 * 1. Supabaseとの通信管理
 * 2. リアルタイム更新の購読管理
 * 3. ゲームデータの同期
 */

import type { Gomoku, GameCreateParams } from 'src/types';
import type { GameUpdateData } from 'src/types/gomoku';
import { GomokuRepository } from 'src/repository/supabase/gomokuRepository';
import { SessionManager } from '@/scenes/301_Gomoku/online/SessionManager';
import { GameEvents } from '@/scenes/301_Gomoku/core/GameEvents';

export class SyncManager {
  private repository: GomokuRepository;
  private sessionManager: SessionManager;
  private events: GameEvents;
  private playerId: string;

  constructor(playerId: string, sessionManager: SessionManager, events: GameEvents) {
    this.repository = new GomokuRepository();
    this.sessionManager = sessionManager;
    this.events = events;
    this.playerId = playerId;

    // プレイヤーIDを設定
    this.repository.setCurrentPlayer(playerId).catch(error => {
      this.events.emitError(`プレイヤーID設定エラー: ${error}`);
    });
  }

  // 新しいゲームを作成
  async createGame(opponentId: string, playerAsBlack: boolean = true): Promise<Gomoku | null> {
    try {
      const params: GameCreateParams = {
        blackPlayerId: playerAsBlack ? this.playerId : opponentId,
        whitePlayerId: playerAsBlack ? opponentId : this.playerId
      };

      const newGame = await this.repository.createGame(params);
      if (newGame) {
        this.sessionManager.addSession(newGame);
        this.subscribeToGame(newGame.id);
        this.events.emitGameCreated(newGame);
        return newGame;
      }

      this.events.emitError('ゲームの作成に失敗しました');
      return null;
    } catch (error) {
      this.events.emitError(`ゲーム作成エラー: ${error}`);
      return null;
    }
  }

  // ゲーム状態を更新
  async updateGameState(gameId: string, updateData: GameUpdateData): Promise<Gomoku | null> {
    try {
      const updatedGame = await this.repository.updateGameState(gameId, updateData);
      if (updatedGame) {
        this.sessionManager.updateSession(updatedGame);
        return updatedGame;
      }

      this.events.emitError('ゲーム状態の更新に失敗しました');
      return null;
    } catch (error) {
      this.events.emitError(`ゲーム状態更新エラー: ${error}`);
      return null;
    }
  }

  // プレイヤーのゲーム一覧を読み込み
  async loadPlayerGames(): Promise<Gomoku[]> {
    try {
      const games = await this.repository.getPlayerGames(this.playerId);

      games.forEach(game => {
        if (!this.sessionManager.hasSession(game.id)) {
          this.sessionManager.addSession(game);
          this.subscribeToGame(game.id);
        }
      });

      return games;
    } catch (error) {
      this.events.emitError(`ゲーム読み込みエラー: ${error}`);
      return [];
    }
  }

  // ゲームの変更を購読
  private subscribeToGame(gameId: string): void {
    this.repository.subscribeToGameChanges(gameId, (updatedGame: Gomoku) => {
      this.sessionManager.updateSession(updatedGame);
    });
  }

  // 購読を解除
  cleanup(): void {
    this.repository.unsubscribe();
  }
} 