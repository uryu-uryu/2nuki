/**
 * ロギングユーティリティ
 * 環境に応じてログ出力を制御します
 */

// 開発環境かどうかを判定
const isDevelopment = import.meta.env.MODE === 'development';

// ログの引数の型定義
type LogArgs = string | number | boolean | object | null | undefined;

export const logger = {
  /**
     * 情報ログを出力します
     * 開発環境でのみ出力されます
     */
  info: (message: string, ...args: LogArgs[]) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },

  /**
     * エラーログを出力します
     * 全環境で出力されます
     */
  error: (message: string, ...args: LogArgs[]) => {
    console.error(message, ...args);
  },

  /**
     * デバッグログを出力します
     * 開発環境でのみ出力されます
     */
  debug: (message: string, ...args: LogArgs[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', message, ...args);
    }
  }
}; 