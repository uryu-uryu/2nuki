/**
 * ブラウザ環境用のLocalStorage実装
 */
import { StorageInterface } from '@/utils/storage/StorageInterface';
import { logger } from '@/utils/logger';

export class BrowserStorage implements StorageInterface {
  async setItem(key: string, value: string): Promise<void> {
    try {
      window.localStorage.setItem(key, value);
      logger.info(`ストレージに保存しました: ${key}`);
    } catch (error) {
      logger.error('ストレージへの保存に失敗しました', error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const value = window.localStorage.getItem(key);
      logger.info(`ストレージから取得しました: ${key}`);
      return value;
    } catch (error) {
      logger.error('ストレージからの取得に失敗しました', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      window.localStorage.removeItem(key);
      logger.info(`ストレージから削除しました: ${key}`);
    } catch (error) {
      logger.error('ストレージからの削除に失敗しました', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      window.localStorage.clear();
      logger.info('ストレージをクリアしました');
    } catch (error) {
      logger.error('ストレージのクリアに失敗しました', error);
      throw error;
    }
  }
} 