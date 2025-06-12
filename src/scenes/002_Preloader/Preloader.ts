/**
 * プリローダーシーン
 * ゲーム開始前のアセット読み込み進捗を表示する
 * 背景画像とプログレスバーでユーザーに読み込み状況を知らせる
 */
import * as Phaser from 'phaser';
import { SCENE_KEYS } from '@/consts/scenes';
import { COLORS } from '@/consts/styles/color';
import { PRELOADER } from '@/consts/styles/components';

export class Preloader extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Rectangle;

  constructor() {
    super(SCENE_KEYS._002_PRELOADER);
  }

  init() {
    // Bootシーンでこの画像をロードしたので、ここで表示できる
    this.add.image(
      PRELOADER.PROGRESS_BAR.CENTER_X,
      PRELOADER.PROGRESS_BAR.CENTER_Y,
      'background'
    );

    // プログレスフレーム
    this.add.rectangle(
      PRELOADER.PROGRESS_BAR.CENTER_X,
      PRELOADER.PROGRESS_BAR.CENTER_Y,
      PRELOADER.PROGRESS_BAR.WIDTH,
      PRELOADER.PROGRESS_BAR.HEIGHT
    ).setStrokeStyle(PRELOADER.PROGRESS_BAR.BORDER_WIDTH, COLORS.WHITE);

    // プログレスバー（初期状態）
    this.progressBar = this.add.rectangle(
      PRELOADER.PROGRESS_BAR.CENTER_X - PRELOADER.PROGRESS_BAR.BAR_OFFSET_X,
      PRELOADER.PROGRESS_BAR.CENTER_Y,
      PRELOADER.PROGRESS_BAR.BAR_INITIAL_WIDTH,
      PRELOADER.PROGRESS_BAR.BAR_HEIGHT,
      COLORS.WHITE
    );

    // LoaderPluginが発火する'progress'イベントを使って、ローディングバーを更新します
    this.load.on('progress', (progress: number) => {
      // プログレスバーを更新（バーは最大460px幅なので、100% = 460px）
      this.progressBar.width = PRELOADER.PROGRESS_BAR.BAR_INITIAL_WIDTH + (PRELOADER.PROGRESS_BAR.MAX_BAR_WIDTH * progress);
    });
  }

  preload() {
    // ここではアセットの読み込みのみを行い、UIはinit()で既に設定済み
    // 追加でロードするアセットがある場合はここに記述
  }

  create() {
    // すべてのアセットがロードされたら、ここで他のシーンでも使えるグローバルなオブジェクトを作成することがよくあります。
    // 例えば、ここでグローバルアニメーションを定義して、他のシーンで使えるようにできます。

    // MainMenuへ移動します。カメラフェードなどのシーントランジションに置き換えることもできます。
    this.scene.start(SCENE_KEYS._101_MAIN_MENU);
  }
}
