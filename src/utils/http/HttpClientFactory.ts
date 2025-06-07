/**
 * HTTPクライアントのファクトリークラス
 * 実行環境に応じて適切なHTTPクライアントのインスタンスを提供
 * Web環境ではFetchHttpClient、iOS環境では将来的にiOS専用クライアントを返す
 */

import type { IHttpClient } from '@/utils/http/HttpClient';
import { FetchHttpClient } from '@/utils/http/HttpClient';
import { logger } from '@/utils/logger';

/**
 * プラットフォーム定数
 */
export const PLATFORMS = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android'
} as const;

/**
 * プラットフォームの種類
 */
export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];

/**
 * HTTPクライアントファクトリー
 * シングルトンパターンでインスタンスを管理
 */
export class HttpClientFactory {
  private static instance: HttpClientFactory;
  private httpClient: IHttpClient | null = null;

  private constructor() { }

  /**
     * シングルトンインスタンスを取得
     * @returns HttpClientFactoryのインスタンス
     */
  public static getInstance(): HttpClientFactory {
    if (!HttpClientFactory.instance) {
      HttpClientFactory.instance = new HttpClientFactory();
    }
    return HttpClientFactory.instance;
  }

  /**
     * 現在のプラットフォームを判定
     * @returns プラットフォームの種類
     */
  private detectPlatform(): Platform {
    // TODO: iOS環境の判定ロジックを追加
    // Capacitorやreact-native環境での判定など
    if (typeof window !== 'undefined' && window.navigator) {
      // Web環境
      return PLATFORMS.WEB;
    }

    // デフォルトはweb
    return PLATFORMS.WEB;
  }

  /**
     * プラットフォームに応じたHTTPクライアントを取得
     * @param platform 明示的にプラットフォームを指定する場合
     * @returns HTTPクライアントのインスタンス
     */
  public getHttpClient(platform?: Platform): IHttpClient {
    if (this.httpClient) {
      return this.httpClient;
    }

    const targetPlatform = platform || this.detectPlatform();

    switch (targetPlatform) {
    case PLATFORMS.WEB:
      this.httpClient = new FetchHttpClient();
      logger.info('Web用HTTPクライアントを初期化しました');
      break;

    case PLATFORMS.IOS:
      // TODO: iOS用HTTPクライアントの実装
      logger.warn('iOS用HTTPクライアントは未実装です。Web用クライアントを使用します');
      this.httpClient = new FetchHttpClient();
      break;

    case PLATFORMS.ANDROID:
      // TODO: Android用HTTPクライアントの実装
      logger.warn('Android用HTTPクライアントは未実装です。Web用クライアントを使用します');
      this.httpClient = new FetchHttpClient();
      break;

    default:
      logger.warn('不明なプラットフォームです。Web用クライアントを使用します');
      this.httpClient = new FetchHttpClient();
      break;
    }

    return this.httpClient;
  }

  /**
     * HTTPクライアントを明示的に設定
     * テスト環境などで使用
     * @param client HTTPクライアントのインスタンス
     */
  public setHttpClient(client: IHttpClient): void {
    this.httpClient = client;
    logger.info('HTTPクライアントを手動設定しました');
  }

  /**
     * HTTPクライアントをリセット
     * 主にテスト環境で使用
     */
  public reset(): void {
    this.httpClient = null;
    logger.info('HTTPクライアントをリセットしました');
  }
} 