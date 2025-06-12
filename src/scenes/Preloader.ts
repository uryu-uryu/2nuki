/**
 * プリローダーシーン
 * ゲーム開始前のアセット読み込み進捗を表示する
 * 背景画像とプログレスバーでユーザーに読み込み状況を知らせる
 */
import * as Phaser from 'phaser';
import { SCENE_KEYS } from '@/consts/scenes';
import { LAYOUT } from '@/consts/styles/layout';
import { COLORS } from '@/consts/styles/color';
import { PRELOADER } from '@/consts/styles/components';

export class Preloader extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Rectangle;
  private progressBarFill!: Phaser.GameObjects.Rectangle;

  constructor() {
    super(SCENE_KEYS.PRELOADER);
  }

  init() {
    // Bootシーンでこの画像をロードしたので、ここで表示できる
    this.add.image(
      PRELOADER.OLD_STYLE.CENTER_X,
      PRELOADER.OLD_STYLE.CENTER_Y,
      'background'
    );

    // プログレスフレーム
    this.add.rectangle(
      PRELOADER.OLD_STYLE.CENTER_X,
      PRELOADER.OLD_STYLE.CENTER_Y,
      PRELOADER.OLD_STYLE.FRAME_WIDTH,
      PRELOADER.OLD_STYLE.FRAME_HEIGHT
    ).setStrokeStyle(1, COLORS.WHITE);

    // プログレスバー（初期状態）
    this.progressBar = this.add.rectangle(
      PRELOADER.OLD_STYLE.CENTER_X - PRELOADER.OLD_STYLE.BAR_OFFSET_X,
      PRELOADER.OLD_STYLE.CENTER_Y,
      PRELOADER.OLD_STYLE.BAR_INITIAL_WIDTH,
      PRELOADER.OLD_STYLE.BAR_HEIGHT,
      COLORS.WHITE
    );

    // LoaderPluginが発火する'progress'イベントを使って、ローディングバーを更新します
    this.load.on('progress', (progress: number) => {
      // プログレスバーを更新（バーは最大460px幅なので、100% = 460px）
      this.progressBar.width = PRELOADER.OLD_STYLE.BAR_INITIAL_WIDTH + (PRELOADER.OLD_STYLE.MAX_BAR_WIDTH * progress);
    });
  }

  preload() {
    // 背景とプログレスバーを表示
    this.add.image(
      LAYOUT.SCREEN.CENTER_X + (LAYOUT.GAME.WIDTH - PRELOADER.BACKGROUND.WIDTH) / 2,
      LAYOUT.SCREEN.CENTER_Y + (LAYOUT.GAME.HEIGHT - PRELOADER.BACKGROUND.HEIGHT) / 2,
      'background'
    );

    // 新スタイルのプログレスバーフレーム
    this.add.rectangle(
      LAYOUT.SCREEN.CENTER_X + (LAYOUT.GAME.WIDTH - PRELOADER.BACKGROUND.WIDTH) / 2,
      LAYOUT.SCREEN.CENTER_Y + (LAYOUT.GAME.HEIGHT - PRELOADER.BACKGROUND.HEIGHT) / 2,
      PRELOADER.PROGRESS_BAR.WIDTH,
      PRELOADER.PROGRESS_BAR.HEIGHT
    ).setStrokeStyle(PRELOADER.PROGRESS_BAR.BORDER_WIDTH, COLORS.WHITE);

    // 新スタイルのプログレスバー（初期状態）
    this.progressBarFill = this.add.rectangle(
      LAYOUT.SCREEN.CENTER_X + (LAYOUT.GAME.WIDTH - PRELOADER.BACKGROUND.WIDTH) / 2 - PRELOADER.PROGRESS_BAR.WIDTH / 2 + PRELOADER.PROGRESS_BAR.BAR_WIDTH / 2,
      LAYOUT.SCREEN.CENTER_Y + (LAYOUT.GAME.HEIGHT - PRELOADER.BACKGROUND.HEIGHT) / 2,
      PRELOADER.PROGRESS_BAR.BAR_WIDTH,
      PRELOADER.PROGRESS_BAR.BAR_HEIGHT,
      COLORS.WHITE
    );

    this.load.on('progress', (progress: number) => {
      // プログレスバーを更新（バーは最大PRELOADER.PROGRESS_BAR.WIDTH - 8px幅）
      const maxBarWidth = PRELOADER.PROGRESS_BAR.WIDTH - 8;
      this.progressBarFill.width = PRELOADER.PROGRESS_BAR.BAR_WIDTH + maxBarWidth * progress;
    });
  }

  create() {
    // すべてのアセットがロードされたら、ここで他のシーンでも使えるグローバルなオブジェクトを作成することがよくあります。
    // 例えば、ここでグローバルアニメーションを定義して、他のシーンで使えるようにできます。

    // MainMenuへ移動します。カメラフェードなどのシーントランジションに置き換えることもできます。
    this.scene.start(SCENE_KEYS.MAIN_MENU);
  }
}
