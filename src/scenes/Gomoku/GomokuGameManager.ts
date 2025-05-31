/**
 * GomokuGameManager - 五目並べゲームの状態管理クラス
 * 
 * このクラスは以下の責務を持ちます：
 * 1. ゲームの状態管理
 *    - 盤面の状態追跡
 *    - プレイヤーの手番管理
 *    - ゲームセッションのライフサイクル管理
 * 
 * 2. プレイヤーのアクション制御
 *    - 石を置く操作のバリデーション
 *    - 合法手のチェック
 *    - ゲームの勝敗判定
 * 
 * 3. オンライン機能の提供
 *    - リアルタイムでのゲーム状態同期
 *    - マルチプレイヤーセッションの管理
 *    - Supabaseとの連携による永続化
 * 
 * 4. イベント管理
 *    - ゲーム状態の変更通知
 *    - エラーハンドリング
 *    - プレイヤーアクションのフィードバック
 */

import { BOARD_SIZE } from '../../consts/const';
import { GomokuRepository } from '../../repository/supabase/gomokuRepository';
import type { Gomoku, GameCreateParams, Player } from '../../types';

export interface GameSession {
  id: string;
  gameData: Gomoku;
  isActive: boolean;
  lastUpdateTime: number;
}

export interface GameManagerEvents {
  gameCreated: (game: Gomoku) => void;
  gameUpdated: (game: Gomoku) => void;
  gameFinished: (game: Gomoku, winner: Player | null) => void;
  error: (error: string) => void;
}

export class GomokuGameManager {
  private gomokuService: GomokuRepository;
  private activeSessions: Map<string, GameSession> = new Map();
  private eventHandlers: Partial<GameManagerEvents> = {};
  private playerId: string;

  constructor(playerId?: string) {
    this.gomokuService = new GomokuRepository();
    // ひとまず固定値とする。
    this.playerId = playerId || '11111111-1111-1111-1111-111111111111';
  }

  // イベントハンドラーの設定
  on<K extends keyof GameManagerEvents>(event: K, handler: GameManagerEvents[K]): void {
    this.eventHandlers[event] = handler;
  }

  // イベントの発火
  private emit<K extends keyof GameManagerEvents>(event: K, ...args: Parameters<GameManagerEvents[K]>): void {
    const handler = this.eventHandlers[event];
    if (handler) {
      (handler as any)(...args);
    }
  }

  // プレイヤーIDを取得
  getPlayerId(): string {
    return this.playerId;
  }

  // 新しいゲームを作成
  async createGame(opponentId: string, playerAsBlack: boolean = true): Promise<Gomoku | null> {
    try {
      const params: GameCreateParams = {
        blackPlayerId: playerAsBlack ? this.playerId : opponentId,
        whitePlayerId: playerAsBlack ? opponentId : this.playerId
      };

      const newGame = await this.gomokuService.createGame(params);
      if (newGame) {
        this.addGameSession(newGame);
        this.emit('gameCreated', newGame);
        return newGame;
      }
      
      this.emit('error', 'ゲームの作成に失敗しました');
      return null;
    } catch (error) {
      this.emit('error', `ゲーム作成エラー: ${error}`);
      return null;
    }
  }

  // 手を打つ
  async makeMove(gameId: string, row: number, col: number): Promise<boolean> {
    try {
      const game = await this.gomokuService.getGame(gameId);
      if (!game) {
        this.emit('error', 'ゲームが見つかりません');
        return false;
      }

      if (game.is_finished) {
        this.emit('error', 'ゲームは既に終了しています');
        return false;
      }

      if (game.current_player_turn !== this.playerId) {
        this.emit('error', 'あなたのターンではありません');
        return false;
      }

      const boardState = game.board_state;
      if (boardState[row][col] !== 0) {
        this.emit('error', 'その位置には既に石があります');
        return false;
      }

      // 新しい盤面を作成
      const newBoardState = boardState.map(row => [...row]);
      const playerStone = this.playerId === game.black_player_id ? 1 : 2;
      newBoardState[row][col] = playerStone;

      // 勝敗判定
      const isWinner = this.checkWinner(newBoardState, row, col, playerStone);
      
      // 次のプレイヤーを決定
      const nextPlayer = this.playerId === game.black_player_id
        ? game.white_player_id
        : game.black_player_id;

      // ゲーム状態を更新
      const updateData: any = {
        board_state: newBoardState,
        updated_at: new Date().toISOString(),
      };

      if (isWinner) {
        updateData.is_finished = true;
        updateData.winner_id = this.playerId;
        updateData.finished_at = new Date().toISOString();
      } else {
        updateData.current_player_turn = nextPlayer;
      }

      const updatedGame = await this.gomokuService.updateGameState(gameId, updateData);
      if (updatedGame) {
        this.updateGameSession(updatedGame);
        return true;
      }

      this.emit('error', '手を打つことができませんでした');
      return false;
    } catch (error) {
      this.emit('error', `手を打つ際のエラー: ${error}`);
      return false;
    }
  }

  // 勝敗判定（五目並べのルール）
  private checkWinner(board: number[][], row: number, col: number, player: number): boolean {
    const directions = [
      [0, 1],   // 横
      [1, 0],   // 縦
      [1, 1],   // 右下斜め
      [1, -1]   // 右上斜め
    ];

    for (const [dx, dy] of directions) {
      let count = 1; // 現在の石も含む

      // 正方向にカウント
      let x = row + dx;
      let y = col + dy;
      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === player) {
        count++;
        x += dx;
        y += dy;
      }

      // 逆方向にカウント
      x = row - dx;
      y = col - dy;
      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === player) {
        count++;
        x -= dx;
        y -= dy;
      }

      // 5つ並んだら勝利
      if (count >= 5) {
        return true;
      }
    }

    return false;
  }

  // ゲームを放棄
  async forfeitGame(gameId: string): Promise<boolean> {
    try {
      const game = await this.gomokuService.getGame(gameId);
      if (!game) {
        this.emit('error', 'ゲームが見つかりません');
        return false;
      }

      if (game.is_finished) {
        this.emit('error', 'ゲームは既に終了しています');
        return false;
      }

      // 相手プレイヤーを勝者にする
      const winnerId = this.playerId === game.black_player_id
        ? game.white_player_id
        : game.black_player_id;

      const updateData = {
        is_finished: true,
        winner_id: winnerId,
        finished_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedGame = await this.gomokuService.updateGameState(gameId, updateData);
      if (updatedGame) {
        this.updateGameSession(updatedGame);
        return true;
      }

      this.emit('error', 'ゲームの放棄に失敗しました');
      return false;
    } catch (error) {
      this.emit('error', `ゲーム放棄エラー: ${error}`);
      return false;
    }
  }

  // プレイヤーの色を取得
  getPlayerColor(gameId: string): Player | null {
    const game = this.getGame(gameId);
    if (!game) return null;
    
    if (game.black_player_id === this.playerId) {
      return 'black';
    }
    if (game.white_player_id === this.playerId) {
      return 'white';
    }
    return null;
  }

  // ゲームセッションを追加
  private addGameSession(game: Gomoku): void {
    const session: GameSession = {
      id: game.id,
      gameData: game,
      isActive: !game.is_finished,
      lastUpdateTime: Date.now()
    };

    this.activeSessions.set(game.id, session);

    // リアルタイム更新を開始
    if (session.isActive) {
      this.subscribeToGame(game.id);
    }
  }

  // ゲームのリアルタイム更新を購読
  private subscribeToGame(gameId: string): void {
    this.gomokuService.subscribeToGameChanges(gameId, (updatedGame: Gomoku) => {
      this.updateGameSession(updatedGame);
    });
  }

  // ゲームセッションを更新
  private updateGameSession(game: Gomoku): void {
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
        this.emit('gameFinished', game, winner);
      }

      this.emit('gameUpdated', game);
    }
  }

  // プレイヤーのアクティブなゲーム一覧を取得
  async loadPlayerGames(): Promise<Gomoku[]> {
    try {
      const games = await this.gomokuService.getPlayerGames(this.playerId);
      
      // セッションに追加
      games.forEach(game => {
        if (!this.activeSessions.has(game.id)) {
          this.addGameSession(game);
        }
      });

      return games;
    } catch (error) {
      this.emit('error', `ゲーム読み込みエラー: ${error}`);
      return [];
    }
  }

  // 特定のゲームを取得
  getGame(gameId: string): Gomoku | null {
    const session = this.activeSessions.get(gameId);
    return session ? session.gameData : null;
  }

  // 全てのアクティブなゲームを取得
  getActiveGames(): Gomoku[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.isActive)
      .map(session => session.gameData);
  }

  // プレイヤーのターンかどうか
  isPlayerTurn(gameId: string): boolean {
    const game = this.getGame(gameId);
    return game ? game.current_player_turn === this.playerId : false;
  }

  // ゲームが終了しているかどうか
  isGameFinished(gameId: string): boolean {
    const game = this.getGame(gameId);
    return game ? game.is_finished : false;
  }

  // ゲームの勝者を取得
  getWinner(gameId: string): Player | null {
    const game = this.getGame(gameId);
    if (!game || !game.winner_id) return null;
    return this.gomokuService.getPlayerColor(game, game.winner_id);
  }

  // 手を打てるかどうかをチェック
  canMakeMove(gameId: string): boolean {
    const game = this.getGame(gameId);
    if (!game) return false;
    if (game.is_finished) return false;
    if (game.current_player_turn !== this.playerId) return false;
    return true;
  }

  // 指定位置に石を置けるかチェック
  canPlaceStone(gameId: string, row: number, col: number): boolean {
    const game = this.getGame(gameId);
    if (!game || !this.canMakeMove(gameId)) return false;
    
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;
    return game.board_state[row][col] === 0;
  }

  // ゲームセッションをクリーンアップ
  cleanup(): void {
    this.gomokuService.unsubscribe();
    this.activeSessions.clear();
    this.eventHandlers = {};
  }

  // デバッグ情報を取得
  getDebugInfo(): any {
    return {
      playerId: this.playerId,
      activeSessionsCount: this.activeSessions.size,
      sessions: Array.from(this.activeSessions.entries()).map(([id, session]) => ({
        id,
        isActive: session.isActive,
        isFinished: session.gameData.is_finished,
        lastUpdate: new Date(session.lastUpdateTime).toISOString()
      }))
    };
  }
} 