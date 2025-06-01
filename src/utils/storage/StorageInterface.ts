/**
 * ストレージ操作の基本インターフェース
 * 各プラットフォーム固有の実装はこのインターフェースに従う
 */
export interface StorageInterface {
    /**
     * 値を保存
     * @param key 保存するキー
     * @param value 保存する値
     */
    setItem(key: string, value: string): Promise<void>;

    /**
     * 値を取得
     * @param key 取得するキー
     * @returns 保存されている値。存在しない場合はnull
     */
    getItem(key: string): Promise<string | null>;

    /**
     * 値を削除
     * @param key 削除するキー
     */
    removeItem(key: string): Promise<void>;

    /**
     * 全ての値を削除
     */
    clear(): Promise<void>;
} 