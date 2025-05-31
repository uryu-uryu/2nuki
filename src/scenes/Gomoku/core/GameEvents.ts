/**
 * GameEvents - 五目並べゲームのイベント管理クラス
 * 
 * このクラスは以下の責務を持ちます：
 * 1. イベントの定義
 * 2. イベントハンドラーの管理
 * 3. イベントの発火
 */

import type { Gomoku, Player } from '../../../types';
import type { GameManagerEvents } from '../../../types/gomoku';

export class GameEvents {
  private eventHandlers: Partial<GameManagerEvents> = {};

  // イベントハンドラーの登録
  on<K extends keyof GameManagerEvents>(event: K, handler: GameManagerEvents[K]): void {
    this.eventHandlers[event] = handler;
  }

  // イベントの発火
  emit<K extends keyof GameManagerEvents>(event: K, ...args: Parameters<GameManagerEvents[K]>): void {
    const handler = this.eventHandlers[event];
    if (handler) {
      const typedHandler = handler as (...args: Parameters<GameManagerEvents[K]>) => void;
      typedHandler(...args);
    }
  }

  // ゲーム作成イベント
  emitGameCreated(game: Gomoku): void {
    this.emit('gameCreated', game);
  }

  // ゲーム更新イベント
  emitGameUpdated(game: Gomoku): void {
    this.emit('gameUpdated', game);
  }

  // ゲーム終了イベント
  emitGameFinished(game: Gomoku, winner: Player | null): void {
    this.emit('gameFinished', game, winner);
  }

  // エラーイベント
  emitError(message: string): void {
    this.emit('error', message);
  }

  // イベントハンドラーのクリーンアップ
  cleanup(): void {
    this.eventHandlers = {};
  }
} 