/**
 * SessionManager - 五目並べゲームのセッション管理クラス
 * 
 * このクラスは以下の責務を持ちます：
 * 1. アクティブセッションの管理
 * 2. セッションのライフサイクル管理
 * 3. セッション状態の更新
 */

import type { Gomoku } from 'src/types';
import type { GameSession } from 'src/types/gomoku';
import { GameEvents } from '@/scenes/301_Gomoku/core/GameEvents';

export class SessionManager {
  private activeSessions: Map<string, GameSession> = new Map();
  private events: GameEvents;

  constructor(events: GameEvents) {
    this.events = events;
  }

  // セッションを追加
  addSession(game: Gomoku): void {
    const session: GameSession = {
      id: game.id,
      gameData: game,
      isActive: !game.is_finished,
      lastUpdateTime: Date.now()
    };

    this.activeSessions.set(game.id, session);
  }

  // セッションを更新
  updateSession(game: Gomoku): void {
    const session = this.activeSessions.get(game.id);
    if (session) {
      const wasFinished = session.gameData.is_finished;
      session.gameData = game;
      session.lastUpdateTime = Date.now();

      // ゲームが終了した場合
      if (!wasFinished && game.is_finished) {
        session.isActive = false;
        const winner = game.winner_id ?
          (game.winner_id === game.black_player_id ? 'black' : 'white') : null;
        this.events.emitGameFinished(game, winner);
      }

      this.events.emitGameUpdated(game);
    }
  }

  // セッションを取得
  getSession(gameId: string): GameSession | undefined {
    return this.activeSessions.get(gameId);
  }

  // ゲームデータを取得
  getGame(gameId: string): Gomoku | null {
    const session = this.activeSessions.get(gameId);
    return session ? session.gameData : null;
  }

  // アクティブなゲーム一覧を取得
  getActiveGames(): Gomoku[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.isActive)
      .map(session => session.gameData);
  }

  // セッションが存在するかチェック
  hasSession(gameId: string): boolean {
    return this.activeSessions.has(gameId);
  }

  // セッションをクリア
  cleanup(): void {
    this.activeSessions.clear();
  }
} 