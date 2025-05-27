// ❌ 悪い例: 全部まとめて書いた場合
class BadGameManager {
    private _score: number = 0;
    private _isUpdating: boolean = false;
    private supabaseService: SupabaseService;
    
    constructor() {
        this.supabaseService = new SupabaseService();
    }
    
    async incrementScore() {
        // 状態管理ロジック
        if (!this._isUpdating) {
            this._score++;
        }
        
        // サーバー通信ロジック
        await this.supabaseService.updateScore(this._score);
        
        // UI更新ロジック
        this.updateUI();
        
        // ログ処理
        console.log('Score updated to:', this._score);
    }
    
    // 全ての責任が混在している...
}

// ✅ 良い例: 責任を分離した場合

// GameStore: 純粋な状態管理
class GameStore {
    private _score: number = 0;
    
    incrementScore(): number {
        this._score++;
        this.notifyListeners(); // 状態変更の通知のみ
        return this._score;
    }
    
    // 状態管理にのみ専念
}

// GameController: 高次の処理調整
class GameController {
    constructor(
        private gameStore: GameStore,
        private supabaseService: SupabaseService,
        private logger: Logger
    ) {}
    
    async handleScoreIncrement(): Promise<void> {
        // 各サービスを組み合わせて処理を調整
        const newScore = this.gameStore.incrementScore();
        await this.supabaseService.updateScore(newScore);
        this.logger.log('Score updated to:', newScore);
    }
} 