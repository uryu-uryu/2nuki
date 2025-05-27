import Phaser from 'phaser';
import { Boot } from './scenes/Boot.ts';
import { Game } from './scenes/Game/index.ts';
import { Preloader } from './scenes/Preloader.ts';
import { LAYOUT } from './consts/layout.ts';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: LAYOUT.GAME.WIDTH,
    height: LAYOUT.GAME.HEIGHT,
    parent: 'game-container',
    backgroundColor: LAYOUT.BACKGROUND_COLOR,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x:0, y: 500 }
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        Game,
    ]
};

new Phaser.Game(config);
