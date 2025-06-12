/**
 * プリローダーシーン
 * ゲーム開始前のアセット読み込み進捗を表示する
 * 背景画像とプログレスバーでユーザーに読み込み状況を知らせる
 */
import * as Phaser from 'phaser';
import { SCENE_KEYS } from '@/consts/scenes';
import { COLORS } from '@/consts/styles/color';
import { ProgressBar, PRELOADER_PROGRESS_BAR_CONFIG } from '@/view/components/progressBar';

export class Preloader extends Phaser.Scene {
  private progressBar!: ProgressBar;

  constructor() {
    super(SCENE_KEYS._002_PRELOADER);
  }

  init() {
    // Bootシーンでこの画像をロードしたので、ここで表示できる
    this.add.image(
      PRELOADER_PROGRESS_BAR_CONFIG.CENTER_X,
      PRELOADER_PROGRESS_BAR_CONFIG.CENTER_Y,
      'background'
    );

    // 新しいProgressBarコンポーネントを使用
    this.progressBar = new ProgressBar(this, {
      x: PRELOADER_PROGRESS_BAR_CONFIG.CENTER_X,
      y: PRELOADER_PROGRESS_BAR_CONFIG.CENTER_Y,
      width: PRELOADER_PROGRESS_BAR_CONFIG.WIDTH,
      height: PRELOADER_PROGRESS_BAR_CONFIG.HEIGHT,
      borderWidth: PRELOADER_PROGRESS_BAR_CONFIG.BORDER_WIDTH,
      borderColor: COLORS.WHITE,
      barColor: COLORS.WHITE,
      initialProgress: 0
    });

    // LoaderPluginが発火する'progress'イベントを使って、ローディングバーを更新
    this.load.on('progress', (progress: number) => {
      // プログレスバーコンポーネントを使用して進捗を更新
      this.progressBar.updateProgress(progress);
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
