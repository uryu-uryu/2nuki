import { SCENE_KEYS } from 'src/consts/scenes';

export class Boot extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.BOOT);
  }

  preload() {
    // ブートシーンは通常、ゲームロゴや背景など、プリローダーに必要なアセットをロードするために使用します。
    // ブートシーン自体にはプリローダーがないため、アセットのファイルサイズは小さければ小さいほど良いです。
    this.load.image('background', 'assets/bg.png');
  }

  create() {
    this.scene.start(SCENE_KEYS.PRELOADER);
  }
}
