import Phaser from 'phaser';
import { LAYOUT } from '../../../consts/layout';
import { LARGE_TEXT_STYLE } from '../../../consts/styles';

export class ScoreDisplay {
    private scoreText: Phaser.GameObjects.Text;
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.scoreText = this.scene.add.text(
            LAYOUT.SCREEN.CENTER_X, 
            LAYOUT.SCREEN.CENTER_Y, 
            '0', 
            LARGE_TEXT_STYLE
        ).setOrigin(0.5);
    }

    updateScore(score: number): void {
        this.scoreText.setText(score.toString());
    }

    destroy(): void {
        this.scoreText.destroy();
    }
} 