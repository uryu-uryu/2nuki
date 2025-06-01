/**
 * 五目並べゲームの状態管理クラス
 * 
 * このクラスは以下の責務を持ちます：
 * 1. 盤面の状態管理
 * 2. プレイヤーの手番管理
 * 3. ゲーム状態の検証
 */

import { BOARD_SIZE } from 'src/consts/const';
import type { Gomoku, Player } from 'src/types';

export class GomokuBoardManager {
  private gameData: Gomoku;
  private playerId: string;

  constructor(gameData: Gomoku, playerId: string) {
    this.gameData = gameData;
    this.playerId = playerId;
  }

  // ゲームデータを取得
  getGameData(): Gomoku {
    return this.gameData;
  }

  // ゲームデータを更新
  updateGameData(newGameData: Gomoku): void {
    this.gameData = newGameData;
  }

  // プレイヤーの色を取得
  getPlayerColor(): Player | null {
    if (this.gameData.black_player_id === this.playerId) {
      return 'black';
    }
    if (this.gameData.white_player_id === this.playerId) {
      return 'white';
    }
    return null;
  }

  // プレイヤーのターンかどうか
  isPlayerTurn(): boolean {
    return this.gameData.current_player_turn === this.playerId;
  }

  // ゲームが終了しているかどうか
  isGameFinished(): boolean {
    return this.gameData.is_finished;
  }

  // 指定位置に石を置けるかチェック
  canPlaceStone(row: number, col: number): boolean {
    if (!this.isPlayerTurn() || this.isGameFinished()) return false;
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;
    return this.gameData.board_state[row][col] === 0;
  }

  // 勝者を取得
  getWinner(): Player | null {
    if (!this.gameData.winner_id) return null;
    return this.gameData.winner_id === this.gameData.black_player_id ? 'black' : 'white';
  }

  // 次のプレイヤーを取得
  getNextPlayer(): string {
    return this.playerId === this.gameData.black_player_id
      ? this.gameData.white_player_id
      : this.gameData.black_player_id;
  }
} 