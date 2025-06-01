/**
 * 五目並べの状態管理クラス
 * 
 * 責務：
 * - ゲームの状態管理
 * - ローディング状態の管理
 * - 現在のゲームIDの管理
 */

export class GomokuSessionController {
  private currentGameId: string | null = null;
  private isLoading: boolean = false;

  setGameId(gameId: string | null) {
    this.currentGameId = gameId;
  }

  getGameId(): string | null {
    return this.currentGameId;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  isGameLoading(): boolean {
    return this.isLoading;
  }

  hasActiveGame(): boolean {
    return this.currentGameId !== null;
  }

  reset() {
    this.currentGameId = null;
    this.isLoading = false;
  }
} 