/**
 * 五目並べの盤面表示を補助するクラス
 */

import * as Phaser from 'phaser';
import { BOARD } from 'src/consts/layout';
import { COLORS } from 'src/consts/styles';

export class GomokuBoardRender {
  private scene: Phaser.Scene;
  private board: Phaser.GameObjects.Graphics;
  private stones: (Phaser.GameObjects.Graphics | null)[][] = [];
  private onStonePlace?: (row: number, col: number) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.board = scene.add.graphics();
    this.stones = Array(BOARD.SIZE).fill(null).map(() => Array(BOARD.SIZE).fill(null));
    this.createBoard();
  }

  /**
     * 盤面のグリッドを作成
     */
  private createBoard() {
    // 盤面の背景
    this.board.fillStyle(COLORS.BOARD);
    this.board.fillRect(
      BOARD.OFFSET_X - 10,
      BOARD.OFFSET_Y - 10,
      BOARD.SIZE * BOARD.CELL_SIZE + 20,
      BOARD.SIZE * BOARD.CELL_SIZE + 20
    );

    // グリッド線を描画
    this.board.lineStyle(1, COLORS.GRID);
    for (let i = 0; i <= BOARD.SIZE; i++) {
      // 縦線
      this.board.moveTo(BOARD.OFFSET_X + i * BOARD.CELL_SIZE, BOARD.OFFSET_Y);
      this.board.lineTo(BOARD.OFFSET_X + i * BOARD.CELL_SIZE, BOARD.OFFSET_Y + BOARD.SIZE * BOARD.CELL_SIZE);

      // 横線
      this.board.moveTo(BOARD.OFFSET_X, BOARD.OFFSET_Y + i * BOARD.CELL_SIZE);
      this.board.lineTo(BOARD.OFFSET_X + BOARD.SIZE * BOARD.CELL_SIZE, BOARD.OFFSET_Y + i * BOARD.CELL_SIZE);
    }
    this.board.strokePath();
  }

  /**
     * 盤面の状態を更新
     */
  updateBoard(boardState: number[][]) {
    // 既存の石をクリア
    this.clearStones();

    // 新しい石を配置
    for (let row = 0; row < BOARD.SIZE; row++) {
      for (let col = 0; col < BOARD.SIZE; col++) {
        const cellValue = boardState[row][col];
        if (cellValue !== 0) {
          this.drawStone(row, col, cellValue);
        }
      }
    }
  }

  /**
     * 石を描画
     */
  private drawStone(row: number, col: number, stoneType: number) {
    const x = BOARD.OFFSET_X + (col * BOARD.CELL_SIZE);
    const y = BOARD.OFFSET_Y + (row * BOARD.CELL_SIZE);

    const stone = this.scene.add.graphics();

    if (stoneType === 1) {
      // 黒石
      stone.fillStyle(COLORS.BLACK_STONE);
      stone.fillCircle(x, y, BOARD.STONE_RADIUS);
    } else if (stoneType === 2) {
      // 白石
      stone.fillStyle(COLORS.WHITE_STONE);
      stone.fillCircle(x, y, BOARD.STONE_RADIUS);
      stone.lineStyle(2, COLORS.WHITE_STONE_BORDER);
      stone.strokeCircle(x, y, BOARD.STONE_RADIUS);
    }

    this.stones[row][col] = stone;
  }

  /**
     * 盤面上の全ての石をクリア
     */
  private clearStones() {
    for (let row = 0; row < BOARD.SIZE; row++) {
      for (let col = 0; col < BOARD.SIZE; col++) {
        if (this.stones[row][col]) {
          this.stones[row][col]!.destroy();
          this.stones[row][col] = null;
        }
      }
    }
  }

  /**
     * クリックイベントのハンドラーを設定
     */
  setupClickHandler(handler: (row: number, col: number) => void) {
    this.onStonePlace = handler;

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // クリック位置を交点に合わせて調整
      const x = pointer.x - BOARD.OFFSET_X;
      const y = pointer.y - BOARD.OFFSET_Y;

      if (x >= -BOARD.CELL_SIZE / 2 && y >= -BOARD.CELL_SIZE / 2 &&
        x <= BOARD.SIZE * BOARD.CELL_SIZE + BOARD.CELL_SIZE / 2 &&
        y <= BOARD.SIZE * BOARD.CELL_SIZE + BOARD.CELL_SIZE / 2) {

        // 最も近い交点を計算
        const col = Math.round(x / BOARD.CELL_SIZE);
        const row = Math.round(y / BOARD.CELL_SIZE);

        if (col >= 0 && col < BOARD.SIZE && row >= 0 && row < BOARD.SIZE) {
          this.onStonePlace?.(row, col);
        }
      }
    });
  }

  /**
     * リソースのクリーンアップ
     */
  destroy() {
    this.clearStones();
    this.board.destroy();
  }
} 