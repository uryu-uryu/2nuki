import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#F5F5DC');

    // タイトルテキスト
    this.add.text(400, 200, '五目並べ', {
      fontSize: '48px',
      color: '#000000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // スタートボタン
    const startButton = this.add.text(400, 300, 'ゲームを始める', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // ボタンのクリックイベント
    startButton.on('pointerdown', () => {
      this.scene.start('PlayerSelect');
    });
  }
} 