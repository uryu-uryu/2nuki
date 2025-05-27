import Phaser from 'phaser';
import { GameController } from './GameController';
import { ScoreDisplay } from './components/ScoreDisplay';
import { IncrementButton } from './components/IncrementButton';
import { StatusDisplay } from './components/StatusDisplay';

/**
 * Game（Phaserシーン）
 * 
 * 役割:
 * - UIコンポーネント（スコア表示・ボタン・ステータス表示など）の生成と配置
 * - GameController等のロジック層との連携
 * - シーンのライフサイクル管理（初期化・クリーンアップ）
 * - UIイベントとロジックの橋渡し
 * 
 * 特徴:
 * - PhaserのSceneを継承し、ゲーム画面の構成を担当
 * - UIとロジックの分離を意識した設計
 * - 画面遷移や他シーンとの連携もここで管理
 */
export class Game extends Phaser.Scene {
    private gameController: GameController;
    private scoreDisplay!: ScoreDisplay;
    private incrementButton!: IncrementButton;
    private statusDisplay!: StatusDisplay;
    private unsubscribeScore?: () => void;

    constructor() {
        super('Game');
        this.gameController = new GameController();
    }

    async create() {
        // UIコンポーネントを初期化
        this.scoreDisplay = new ScoreDisplay(this);
        this.incrementButton = new IncrementButton(this);
        this.statusDisplay = new StatusDisplay(this);

        // ゲームコントローラーを初期化
        await this.gameController.initialize();

        // 初期スコアを表示
        this.scoreDisplay.updateScore(this.gameController.getCurrentScore());

        // ボタンクリック時の処理を設定
        this.incrementButton.setOnClick(async () => {
            await this.gameController.handleScoreIncrement();
        });

        // スコア変更の購読
        this.unsubscribeScore = this.gameController.subscribeToScoreChanges((score: number) => {
            this.scoreDisplay.updateScore(score);
        });

        // シーンが終了する際のクリーンアップ
        this.events.once('shutdown', () => {
            this.cleanup();
        });
    }

    private cleanup(): void {
        if (this.unsubscribeScore) {
            this.unsubscribeScore();
        }
        this.gameController.destroy();
        this.scoreDisplay.destroy();
        this.incrementButton.destroy();
        this.statusDisplay.destroy();
    }

    update() {
        // ゲームループ処理（必要に応じて追加）
    }
}
