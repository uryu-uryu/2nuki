import { SupabaseService } from '../../services/supabase/supabase';
import { GameStore } from './GameStore';

/**
 * GameController - ゲームロジック制御クラス
 * 
 * 役割:
 * - アプリケーション全体の処理フローの調整
 * - 複数のサービス（Store、Supabase など）の組み合わせ
 * - 初期化処理とリソース管理
 * - 高次のビジネスロジック実行
 * 
 * 特徴:
 * - 複数の外部依存を持つ（合成）
 * - 複雑な処理フローを簡潔なインターフェースで提供
 * - 特定のアプリケーション要件に特化
 * - サービス間の連携を担当
 */
export class GameController {
    private gameStore: GameStore;
    private supabaseService: SupabaseService;
    private supabaseUnsubscribe?: () => void;

    constructor() {
        this.gameStore = new GameStore();
        this.supabaseService = new SupabaseService();
    }

    /** 
     * ゲームコントローラーの初期化処理
     * - サーバーから初期スコアを取得
     * - リアルタイム更新の購読開始
     */
    async initialize(): Promise<void> {
        // 初期スコアをサーバーから取得
        const initialScore = await this.supabaseService.getScore();
        this.gameStore.setScore(initialScore ?? 0);

        // リアルタイム購読を開始
        this.supabaseService.subscribeToScoreChanges((newScore: number) => {
            this.gameStore.setScore(newScore, true);
        });
    }

    /** 
     * スコアインクリメント処理の制御
     * - Store でのスコア更新
     * - サーバーへの同期
     * - 重複更新の防止
     */
    async handleScoreIncrement(): Promise<void> {
        if (!this.gameStore.isUpdatingFromServer) {
            const newScore = this.gameStore.incrementScore();
            // サーバーに更新を送信
            await this.supabaseService.updateScore(newScore);
        }
    }

    /** 
     * スコア変更イベントの購読設定
     * Store の監視機能をラップして提供
     */
    subscribeToScoreChanges(callback: (score: number) => void): () => void {
        return this.gameStore.subscribe(callback);
    }

    /** 現在のスコア値を取得 */
    getCurrentScore(): number {
        return this.gameStore.score;
    }

    /** 
     * リソースのクリーンアップ処理
     * - サーバー接続の切断
     * - 購読の解除
     */
    destroy(): void {
        if (this.supabaseUnsubscribe) {
            this.supabaseUnsubscribe();
        }
        this.supabaseService.unsubscribe();
    }
} 