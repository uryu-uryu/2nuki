/**
 * PlayFabの認証機能を管理するクラス
 * - 匿名ログイン（LocalStorageによるID永続化）
 * - セッション管理
 * - ログイン情報の保持
 * などの機能を提供
 */

import type { LoginWithCustomIDRequest, LoginResult, PlayFabError } from '@/types/playfab';
import { STORAGE_KEYS } from '@/consts/storage';
import { StorageFactory } from '@/utils/storage/StorageFactory';
import { logger } from '@/utils/logger';

export class PlayFabAuth {
  private static instance: PlayFabAuth;
  private isInitialized = false;
  private loginResult: LoginResult | null = null;
  private titleId: string;

  private constructor() {
    this.titleId = import.meta.env.VITE_PLAYFAB_TITLE_ID;
  }

  /**
   * シングルトンインスタンスを取得
   * @returns PlayFabAuthのインスタンス
   */
  public static getInstance(): PlayFabAuth {
    if (!PlayFabAuth.instance) {
      PlayFabAuth.instance = new PlayFabAuth();
    }
    return PlayFabAuth.instance;
  }

  /**
   * ログイン情報を取得
   * @returns ログイン結果情報。未ログインの場合はnull
   */
  public getLoginInfo(): LoginResult | null {
    return this.loginResult;
  }

  /**
   * プレイヤーIDを取得
   * @returns プレイヤーID。未ログインの場合はnull
   */
  public getPlayerId(): string | null {
    return this.loginResult?.PlayFabId ?? null;
  }

  /**
   * ログイン済みかどうかを確認
   * @returns ログイン済みの場合はtrue
   */
  public isLoggedIn(): boolean {
    return this.loginResult !== null;
  }

  /**
   * 匿名ログインを実行
   * LocalStorageに保存されたIDがある場合はそれを使用
   * @returns ログイン結果のPromise
   */
  public async loginAnonymously(): Promise<LoginResult> {
    try {
      // 初期化チェック
      await this.initialize();

      // ログイン済みの場合は既存の情報を返す
      if (this.loginResult) {
        logger.info('既にログインしています');
        logger.info(this.loginResult);
        return this.loginResult;
      }

      // LocalStorageからCustomIDを取得（なければ新規生成）
      const customId = await this.getOrCreateCustomId();

      // ログインリクエストを作成（PlayFab REST API仕様に従ってTitleIdを含める）
      const request: LoginWithCustomIDRequest = {
        TitleId: this.titleId,
        CustomId: customId,
        CreateAccount: true // アカウントが存在しない場合は新規作成
      };

      // PlayFab REST APIに直接リクエスト
      const response = await fetch(`https://${this.titleId}.playfabapi.com/Client/LoginWithCustomID`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PlayFabSDK': 'WebSDK-1.0.0'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // エラーチェック
      if (result.code !== 200) {
        const error: PlayFabError = {
          code: result.code,
          status: result.status,
          error: result.error,
          errorCode: result.errorCode,
          errorMessage: result.errorMessage,
          errorDetails: result.errorDetails
        };
        throw error;
      }

      // ログイン情報を保持
      this.loginResult = result.data;
      logger.info('匿名ログインに成功しました');
      logger.info(result.data);

      return result.data;
    } catch (error) {
      logger.error('匿名ログイン処理でエラーが発生しました', error);
      throw error;
    }
  }

  /**
   * PlayFabクライアントの初期化
   * @returns Promise<void>
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (!this.titleId) {
        throw new Error('PlayFabのタイトルIDが設定されていません');
      }

      this.isInitialized = true;
      logger.info('PlayFabクライアントを初期化しました');
    } catch (error) {
      logger.error('PlayFabクライアントの初期化に失敗しました', error);
      throw error;
    }
  }

  /**
   * LocalStorageからCustomIDを取得
   * 存在しない場合は新規生成して保存
   * @returns CustomID
   */
  private async getOrCreateCustomId(): Promise<string> {
    const storage = StorageFactory.getInstance();

    // 保存されているIDを取得
    const storedId = await storage.getItem(STORAGE_KEYS.PLAYFAB_CUSTOM_ID);
    if (storedId) {
      logger.info('既存のCustomIDを使用します');
      return storedId;
    }

    // 新規IDを生成して保存
    const newId = Math.random().toString(36).substring(2);
    await storage.setItem(STORAGE_KEYS.PLAYFAB_CUSTOM_ID, newId);
    logger.info('新規CustomIDを生成しました');
    return newId;
  }
}
