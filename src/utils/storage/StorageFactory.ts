/**
 * 環境に応じたストレージ実装を提供するファクトリークラス
 */
import { StorageInterface } from '@/utils/storage/StorageInterface';
import { BrowserStorage } from '@/utils/storage/BrowserStorage';
import { logger } from '@/utils/logger';

export class StorageFactory {
  private static instance: StorageInterface | null = null;

  /**
     * 環境に応じたストレージ実装のインスタンスを取得
     * @returns StorageInterfaceを実装したインスタンス
     */
  public static getInstance(): StorageInterface {
    if (!this.instance) {
      // TODO: 環境判定を追加し、適切な実装を返す
      // 現状はブラウザ実装のみ
      this.instance = new BrowserStorage();
      logger.info('ブラウザ用ストレージを初期化しました');
    }
    return this.instance;
  }
} 