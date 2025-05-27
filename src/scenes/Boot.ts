export class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        // ブートシーンは通常、ゲームロゴや背景など、プリローダーに必要なアセットをロードするために使用します。
        // ブートシーン自体にはプリローダーがないため、アセットのファイルサイズは小さければ小さいほど良いです。
        this.load.image('background', 'assets/bg.png');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
