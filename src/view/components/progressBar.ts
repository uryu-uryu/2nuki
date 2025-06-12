/**
 * プログレスバーコンポーネント
 * 読み込み進捗や処理進捗を表示するための再利用可能なUIコンポーネント
 * Phaser の GameObjects を使用してプログレスバーを描画・更新する
 */

import * as Phaser from 'phaser';
import { COLORS } from '@/consts/styles/color';
import { LAYOUT } from '@/consts/styles/layout';

/**
 * プリローダー用のプログレスバー設定
 * Preloaderシーンで使用される標準的なプログレスバーの設定値
 * layout.ts の画面サイズに合わせて中央座標を設定
 */
export const PRELOADER_PROGRESS_BAR_CONFIG = {
  CENTER_X: LAYOUT.GAME.WIDTH / 2,   // 1024 / 2 = 512
  CENTER_Y: LAYOUT.GAME.HEIGHT / 2,  // 768 / 2 = 384
  WIDTH: 400,
  HEIGHT: 32,
  BORDER_WIDTH: 1
} as const;

/**
 * プログレスバーの設定オプション
 */
export interface ProgressBarOptions {
    /** バーの中心X座標 */
    x: number;
    /** バーの中心Y座標 */
    y: number;
    /** バーの幅 */
    width: number;
    /** バーの高さ */
    height: number;
    /** ボーダーの太さ (デフォルト: 2) */
    borderWidth?: number;
    /** ボーダーの色 (デフォルト: 白) */
    borderColor?: number;
    /** バーの色 (デフォルト: 白) */
    barColor?: number;
    /** 背景色 (デフォルト: 透明) */
    backgroundColor?: number;
    /** 初期進捗値 (0-1, デフォルト: 0) */
    initialProgress?: number;
}

/**
 * プログレスバークラス
 * Phaser シーンで使用できる再利用可能なプログレスバーコンポーネント
 */
export class ProgressBar {
  private scene: Phaser.Scene;
  private options: Required<ProgressBarOptions>;

  // UI要素
  private container: Phaser.GameObjects.Container;
  private backgroundRect!: Phaser.GameObjects.Rectangle;
  private borderRect!: Phaser.GameObjects.Rectangle;
  private progressRect!: Phaser.GameObjects.Rectangle;

  // 状態
  private currentProgress: number;

  /**
       * プログレスバーを初期化
       * @param scene - プログレスバーを表示するPhaserシーン
       * @param options - プログレスバーの設定オプション
       */
  constructor(scene: Phaser.Scene, options: ProgressBarOptions) {
    this.scene = scene;
    this.options = {
      ...options,
      borderWidth: options.borderWidth ?? 2,
      borderColor: options.borderColor ?? COLORS.WHITE,
      barColor: options.barColor ?? COLORS.WHITE,
      backgroundColor: options.backgroundColor ?? 0x000000,
      initialProgress: options.initialProgress ?? 0
    };

    this.currentProgress = this.options.initialProgress;
    this.container = this.scene.add.container(this.options.x, this.options.y);

    this.createProgressBar();
  }

  /**
       * プログレスバーのUI要素を作成
       */
  private createProgressBar(): void {
    const { width, height, borderWidth, borderColor, backgroundColor, barColor } = this.options;

    // 背景
    if (backgroundColor !== null) {
      this.backgroundRect = this.scene.add.rectangle(
        0, 0, width, height, backgroundColor
      );
      this.container.add(this.backgroundRect);
    }

    // ボーダー
    this.borderRect = this.scene.add.rectangle(
      0, 0, width, height
    ).setStrokeStyle(borderWidth, borderColor);
    this.container.add(this.borderRect);

    // プログレスバー本体（初期は幅0）
    this.progressRect = this.scene.add.rectangle(
      -(width / 2) + 2, // 左端からわずかにオフセット
      0,
      0, // 初期幅
      height - (borderWidth * 2), // ボーダー分を除いた高さ
      barColor
    );
    this.progressRect.setOrigin(0, 0.5); // 左端を基準に拡張
    this.container.add(this.progressRect);

    // 初期進捗を設定
    this.updateProgress(this.currentProgress);
  }

  /**
       * 進捗を更新
       * @param progress - 進捗値 (0.0 から 1.0)
       */
  public updateProgress(progress: number): void {
    // 進捗値を0-1の範囲にクランプ
    this.currentProgress = Math.max(0, Math.min(1, progress));

    // プログレスバーの幅を更新
    const maxWidth = this.options.width - (this.options.borderWidth * 2);
    const progressWidth = maxWidth * this.currentProgress;

    this.progressRect.width = progressWidth;
  }

  /**
       * 現在の進捗値を取得
       * @returns 現在の進捗値 (0.0 から 1.0)
       */
  public getProgress(): number {
    return this.currentProgress;
  }

  /**
       * プログレスバーの表示/非表示を切り替え
       * @param visible - 表示するかどうか
       */
  public setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  /**
       * プログレスバーの位置を変更
       * @param x - 新しいX座標
       * @param y - 新しいY座標
       */
  public setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  /**
       * プログレスバーを破棄
       */
  public destroy(): void {
    this.container.destroy();
  }

  /**
       * プログレスバーのコンテナを取得
       * @returns Phaser.GameObjects.Container
       */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }
}

/**
 * 簡単にプログレスバーを作成するヘルパー関数
 * @param scene - Phaserシーン
 * @param x - X座標
 * @param y - Y座標  
 * @param width - 幅
 * @param height - 高さ
 * @returns ProgressBarインスタンス
 */
export function createProgressBar(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number
): ProgressBar {
  return new ProgressBar(scene, { x, y, width, height });
}
