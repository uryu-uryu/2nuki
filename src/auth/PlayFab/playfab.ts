/**
 * PlayFabの認証機能を管理するクラス
 * - 匿名ログイン
 * - セッション管理
 * などの機能を提供
 */

import { PlayFabClient } from 'playfab-sdk';
import type { PlayFabClientModels } from 'playfab-sdk';
import { logger } from '@/utils/logger';

export class PlayFabAuth {
  private static instance: PlayFabAuth;
  private isInitialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  /**
     * シングルトンインスタンスを取得
     */
  public static getInstance(): PlayFabAuth {
    if (!PlayFabAuth.instance) {
      PlayFabAuth.instance = new PlayFabAuth();
    }
    return PlayFabAuth.instance;
  }

  /**
     * PlayFabクライアントの初期化
     */
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }

    const titleId = import.meta.env.VITE_PLAYFAB_TITLE_ID;
    if (!titleId) {
      throw new Error('PlayFabのタイトルIDが設定されていません');
    }

    PlayFabClient.settings.titleId = titleId;
    this.isInitialized = true;
    logger.info('PlayFabクライアントを初期化しました');
  }

  /**
     * 匿名ログインを実行
     * @returns ログイン結果のPromise
     */
  public async loginAnonymously(): Promise<PlayFabClientModels.LoginResult> {
    try {
      // ランダムなIDを生成
      const customId = Math.random().toString(36).substring(2);

      // ログインリクエストを作成
      const request: PlayFabClientModels.LoginWithCustomIDRequest = {
        CustomId: customId,
        CreateAccount: true // アカウントが存在しない場合は新規作成
      };

      // ログインを実行
      return new Promise((resolve, reject) => {
        PlayFabClient.LoginWithCustomID(
          request,
          (result: PlayFabClientModels.LoginResult, error: PlayFabClientModels.ApiErrorWrapper) => {
            if (error) {
              logger.error('匿名ログインに失敗しました', error);
              reject(error);
              return;
            }

            logger.info('匿名ログインに成功しました');
            resolve(result);
          }
        );
      });
    } catch (error) {
      logger.error('匿名ログイン処理でエラーが発生しました', error);
      throw error;
    }
  }
}
