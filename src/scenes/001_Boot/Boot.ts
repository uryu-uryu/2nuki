import { SCENE_KEYS } from 'src/consts/scenes';
import { PlayFabAuth } from 'src/auth/PlayFab/playfabAuth';
import { logger } from 'src/utils/logger';

export class Boot extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS._001_BOOT);
  }

  preload() {
    // ブートシーンは通常、ゲームロゴや背景など、プリローダーに必要なアセットをロードするために使用します。
    // ブートシーン自体にはプリローダーがないため、アセットのファイルサイズは小さければ小さいほど良いです。
    // this.load.image('background', 'assets/bg.png');
    logger.info('ブートシーンを開始します');
  }

  async create() {
    try {
      // PlayFabで匿名ログインを実行
      logger.info('匿名ログインを開始します');

      const auth = PlayFabAuth.getInstance();
      await auth.loginAnonymously();

      logger.info('匿名ログインが完了しました');

      // プリローダーシーンに遷移
      this.scene.start(SCENE_KEYS._002_PRELOADER);
    } catch (error) {
      logger.error('匿名ログインに失敗しました', error);
      // TODO: エラー画面への遷移やリトライ機能の実装
    }
  }
}
