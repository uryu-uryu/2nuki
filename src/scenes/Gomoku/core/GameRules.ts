/**
 * GameRules - 五目並べゲームのルール管理クラス
 * 
 * このクラスは以下の責務を持ちます：
 * 1. 勝敗判定ロジック
 * 2. ゲームルールの適用
 * 3. ルールに関する定数管理
 */

import { BOARD_SIZE } from 'src/consts/const';

export class GameRules {
  private static readonly WIN_CONDITION = 5; // 勝利に必要な連続した石の数

  // 勝敗判定
  static checkWinner(board: number[][], row: number, col: number, player: number): boolean {
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

      // 勝利条件を満たしたかチェック
      if (count >= this.WIN_CONDITION) {
        return true;
      }
    }

    return false;
  }

  // 引き分けかどうかをチェック
  static isDraw(board: number[][]): boolean {
    return board.every(row => row.every(cell => cell !== 0));
  }

  // 合法手かどうかをチェック
  static isValidMove(board: number[][], row: number, col: number): boolean {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      return false;
    }
    return board[row][col] === 0;
  }
} 