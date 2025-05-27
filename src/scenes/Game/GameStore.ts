/**
 * GameStore - ゲーム状態管理クラス
 * 
 * 役割:
 * - ゲームの状態（スコア、更新フラグなど）の保存と管理
 * - 状態変更の通知機能（Observer パターン）
 * - 状態の整合性保証（サーバー更新中の重複防止など）
 * 
 * 特徴:
 * - 外部依存なし（純粋な状態管理）
 * - 単体テストが容易
 * - 他のUI/ゲームエンジンでも再利用可能
 * - ビジネスロジックは最小限に留める
 */
export class GameStore {
    private _score: number = 0;
    private _isUpdatingFromServer: boolean = false;
    private _listeners: Array<(score: number) => void> = [];

    /** 現在のスコアを取得 */
    get score(): number {
        return this._score;
    }

    /** サーバーからの更新中かどうかを取得 */
    get isUpdatingFromServer(): boolean {
        return this._isUpdatingFromServer;
    }

    /** 
     * スコアを設定する
     * @param score 設定するスコア値
     * @param fromServer サーバーからの更新かどうか（無限ループ防止用）
     */
    setScore(score: number, fromServer: boolean = false): void {
        if (fromServer) {
            this._isUpdatingFromServer = true;
            this._score = score;
            this.notifyListeners();
            // 短時間のフラグで無限ループを防ぐ
            setTimeout(() => {
                this._isUpdatingFromServer = false;
            }, 100);
        } else if (!this._isUpdatingFromServer) {
            this._score = score;
            this.notifyListeners();
        }
    }

    /** 
     * スコアを1増加させる
     * @returns 更新後のスコア値
     */
    incrementScore(): number {
        if (!this._isUpdatingFromServer) {
            this._score++;
            this.notifyListeners();
        }
        return this._score;
    }

    /** 
     * スコア変更の監視を開始する
     * @param listener スコア変更時に呼ばれるコールバック関数
     * @returns アンサブスクライブ関数
     */
    subscribe(listener: (score: number) => void): () => void {
        this._listeners.push(listener);
        // アンサブスクライブ関数を返す
        return () => {
            const index = this._listeners.indexOf(listener);
            if (index > -1) {
                this._listeners.splice(index, 1);
            }
        };
    }

    /** 登録されている全てのリスナーに状態変更を通知する */
    private notifyListeners(): void {
        this._listeners.forEach(listener => listener(this._score));
    }
} 