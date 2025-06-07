/**
 * 環境変数のバリデーションを行うユーティリティ
 * 
 * アプリケーションの起動時に必要な環境変数が正しく設定されているかを確認します。
 * 環境変数が不足している場合は、エラーをスローします。
 */

import { logger } from 'src/utils/logger';

// 必須の環境変数の定義
const REQUIRED_ENV_VARS = {
  VITE_SUPABASE_URL: '必須: Supabaseのプロジェクトのエンドポイントを指定してください',
  VITE_SUPABASE_ANON_KEY: '必須: Supabaseの匿名認証キーを指定してください',
  VITE_MODE: '必須: アプリケーションの実行モード（dev/prod）を指定してください',
  VITE_PLAYFAB_TITLE_ID: '必須: PlayFabのタイトルIDを指定してください',
  VITE_PLAYFAB_MATCHMAKING_QUEUE_NAME: '必須: PlayFabマッチメイキングのキュー名を指定してください（例: gomoku-dev, gomoku-prod）',
} as const;

/**
 * 環境変数の存在チェックを行う
 * @throws {Error} 必須の環境変数が設定されていない場合
 */
export function validateEnv(): void {
  const missingVars: string[] = [];

  // 各必須環境変数のチェック
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, message]) => {
    if (!import.meta.env[key]) {
      missingVars.push(`${key}: ${message}`);
    }
  });

  // MODEの値が正しいかチェック
  if (import.meta.env.VITE_MODE && !['dev', 'prod'].includes(import.meta.env.VITE_MODE)) {
    missingVars.push('VITE_MODE: 値は "dev" または "prod" のいずれかを指定してください');
  }

  // 不足している環境変数がある場合はエラーをスロー
  if (missingVars.length > 0) {
    const errorMessage = [
      '環境変数の設定が不足しています。以下の環境変数を.envファイルに設定してください：',
      ...missingVars
    ].join('\n');

    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  logger.info('環境変数の検証が完了しました');
} 