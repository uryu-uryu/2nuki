import Phaser from 'phaser';
import { LAYOUT } from '../../../consts/layout';
import { STATUS_TEXT_STYLE } from '../../../consts/styles';

export class StatusDisplay {
    private statusText: Phaser.GameObjects.Text;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        const STATUS_Y = 100;

        this.statusText = this.scene.add.text(
            LAYOUT.SCREEN.CENTER_X, 
            STATUS_Y, 
            'オンライン同期中...', 
            STATUS_TEXT_STYLE
        ).setOrigin(0.5);
    }

    updateStatus(message: string): void {
        this.statusText.setText(message);
    }

    destroy(): void {
        this.statusText.destroy();
    }
} 