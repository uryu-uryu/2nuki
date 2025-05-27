import Phaser from 'phaser';
import { LAYOUT } from '../../../consts/layout';
import { DEFAULT_TEXT_STYLE } from '../../../consts/styles';

export class IncrementButton {
    private button: Phaser.GameObjects.Rectangle;
    private buttonText: Phaser.GameObjects.Text;
    private scene: Phaser.Scene;
    private onClickCallback?: () => void;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        const BUTTON_Y = 450;

        // ボタン（四角形）
        this.button = this.scene.add.rectangle(
            LAYOUT.SCREEN.CENTER_X, 
            BUTTON_Y, 
            LAYOUT.BUTTON.WIDTH, 
            LAYOUT.BUTTON.HEIGHT, 
            LAYOUT.COLORS.BLUE
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        // ボタン上のテキスト
        this.buttonText = this.scene.add.text(
            LAYOUT.SCREEN.CENTER_X, 
            BUTTON_Y, 
            '＋１', 
            DEFAULT_TEXT_STYLE
        ).setOrigin(0.5);

        // ボタン押下時の処理
        this.button.on('pointerdown', () => {
            if (this.onClickCallback) {
                this.onClickCallback();
            }
        });
    }

    setOnClick(callback: () => void): void {
        this.onClickCallback = callback;
    }

    destroy(): void {
        this.button.destroy();
        this.buttonText.destroy();
    }
} 