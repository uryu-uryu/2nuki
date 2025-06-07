/**
 * PlayFabの認証機能を管理するクラス
 * - 匿名ログイン（LocalStorageによるID永続化）
 * - セッション管理
 * - ログイン情報の保持
 * などの機能を提供
 */

import type { LoginResult } from '@/types/playfab';
import { STORAGE_KEYS } from '@/consts/storage';
import { StorageFactory } from '@/utils/storage/StorageFactory';
import { logger } from '@/utils/logger';
import { PlayFabApiClient } from '@/auth/PlayFab/PlayFabApiClient';

export class PlayFabAuth {
  private static instance: PlayFabAuth;
  private isInitialized = false;
  private loginResult: LoginResult | null = null;
  private titleId: string;
  private apiClient: PlayFabApiClient;

  private constructor() {
    this.titleId = import.meta.env.VITE_PLAYFAB_TITLE_ID;
    this.apiClient = new PlayFabApiClient(this.titleId);
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

      // PlayFab APIクライアントを使用してログイン
      const loginResult = await this.apiClient.loginWithCustomId(customId, true);

      // ログイン情報を保持
      this.loginResult = loginResult;
      logger.info('匿名ログインに成功しました');
      logger.info(loginResult);

      return loginResult;
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

  /**
   * APIクライアントを取得
   * テスト等で使用
   * @returns PlayFabApiClientのインスタンス
   */
  public getApiClient(): PlayFabApiClient {
    return this.apiClient;
  }

  /**
   * ログアウト処理
   * ログイン情報をクリア
   */
  public logout(): void {
    this.loginResult = null;
    logger.info('ログアウトしました');
  }
}
