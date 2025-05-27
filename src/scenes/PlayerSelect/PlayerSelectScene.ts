import * as Phaser from 'phaser';

export class PlayerSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayerSelect' });
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor('#F5F5DC');

    // タイトルテキスト
    this.add.text(400, 100, 'プレイヤー選択', {
      fontSize: '32px',
      color: '#000000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // プレイヤー1のボタン
    const player1Button = this.add.text(400, 200, 'プレイヤー1として開始', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // プレイヤー2のボタン
    const player2Button = this.add.text(400, 300, 'プレイヤー2として開始', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#2196F3',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // 説明テキスト
    this.add.text(400, 400, 'ローカルテスト用：\n別のタブで異なるプレイヤーを選択してください', {
      fontSize: '16px',
      color: '#666666',
      align: 'center',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // ボタンのクリックイベント
    player1Button.on('pointerdown', () => {
      this.scene.start('GomokuGame', { playerId: '11111111-1111-1111-1111-111111111111' });
    });

    player2Button.on('pointerdown', () => {
      this.scene.start('GomokuGame', { playerId: '22222222-2222-2222-2222-222222222222' });
    });
  }
} 