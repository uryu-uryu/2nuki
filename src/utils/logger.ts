/**
 * ロギングユーティリティ
 * 環境に応じてログ出力を制御します
 */

// 開発環境かどうかを判定
const isDevelopment = import.meta.env.VITE_MODE === 'dev';

// ログの引数の型定義
type LogArgs = string | number | boolean | object | null | undefined | Error | unknown;

// ロガーの実装
export const logger = {
  /**
   * 情報ログを出力します
   * 開発環境でのみ出力されます
   */
  info: (...args: LogArgs[]): void => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * エラーログを出力します
   * 全環境で出力されます
   */
  error: (...args: LogArgs[]): void => {
    console.error('[ERROR]', ...args);
  },

  /**
   * デバッグログを出力します
   * 開発環境でのみ出力されます
   */
  debug: (...args: LogArgs[]): void => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * 警告ログを出力します
   * 全環境で出力されます
   */
  warn: (...args: LogArgs[]): void => {
    console.warn('[WARN]', ...args);
  }
}; 