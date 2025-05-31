export class Preloader extends Phaser.Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    //  Bootシーンでこの画像をロードしたので、ここで表示できる
    this.add.image(512, 384, 'background');

    //  シンプルなプログレスバー。これはバーの枠線です。
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  これは実際のプログレスバーです。読み込みの進捗に応じて左からサイズが増加します。
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  LoaderPluginが発火する'progress'イベントを使って、ローディングバーを更新します
    this.load.on('progress', (progress: number) => {

      //  プログレスバーを更新（バーは464px幅なので、100% = 464px）
      bar.width = 4 + (460 * progress);

    });
  }

  preload() {
    //  ゲーム用のアセットをロードします - 自分のアセットに置き換えてください
    this.load.setPath('assets');

  }

  create() {
    //  すべてのアセットがロードされたら、ここで他のシーンでも使えるグローバルなオブジェクトを作成することがよくあります。
    //  例えば、ここでグローバルアニメーションを定義して、他のシーンで使えるようにできます。

    //  MainMenuへ移動します。カメラフェードなどのシーントランジションに置き換えることもできます。
    this.scene.start('Game');
  }
}
