/**
 * PlayFab APIクライアント
 * PlayFabのREST APIとの通信を担当
 * HTTPクライアントを使用してプラットフォーム非依存の実装を提供
 */

import type { IHttpClient } from '@/utils/http/HttpClient';
import { HttpClientFactory } from '@/utils/http/HttpClientFactory';
import type { LoginWithCustomIDRequest, LoginResult, PlayFabError } from '@/types/playfab';
import {
  getPlayFabApiBaseUrl,
  PLAYFAB_ENDPOINTS,
  PLAYFAB_DEFAULT_HEADERS,
  PLAYFAB_SUCCESS_CODE
} from '@/consts/playfab';
import { logger } from '@/utils/logger';

/**
 * PlayFab APIのレスポンス形式
 */
interface PlayFabResponse<T> {
    code: number;
    status: string;
    data?: T;
    error?: string;
    errorCode?: number;
    errorMessage?: string;
    errorDetails?: unknown;
}

/**
 * PlayFab APIクライアントクラス
 * PlayFabの各種APIエンドポイントへのアクセスを提供
 */
export class PlayFabApiClient {
  private httpClient: IHttpClient;
  private titleId: string;
  private baseUrl: string;

  /**
       * コンストラクタ
       * @param titleId PlayFabのタイトルID
       * @param httpClient HTTPクライアント（省略時は自動で取得）
       */
  constructor(titleId: string, httpClient?: IHttpClient) {
    this.titleId = titleId;
    this.baseUrl = getPlayFabApiBaseUrl(titleId);
    this.httpClient = httpClient || HttpClientFactory.getInstance().getHttpClient();

    logger.info('PlayFab APIクライアントを初期化しました', {
      titleId: this.titleId,
      baseUrl: this.baseUrl
    });
  }

  /**
       * CustomIDを使用したログイン
       * @param customId ユーザーのカスタムID
       * @param createAccount アカウントが存在しない場合に新規作成するか
       * @returns ログイン結果のPromise
       */
  public async loginWithCustomId(customId: string, createAccount: boolean = true): Promise<LoginResult> {
    try {
      const request: LoginWithCustomIDRequest = {
        TitleId: this.titleId,
        CustomId: customId,
        CreateAccount: createAccount
      };

      const url = `${this.baseUrl}${PLAYFAB_ENDPOINTS.LOGIN_WITH_CUSTOM_ID}`;

      logger.info('PlayFab ログインリクエストを送信します', {
        url,
        customId: customId.substring(0, 8) + '...', // セキュリティのため一部のみログ出力
        createAccount
      });

      const response = await this.httpClient.post<PlayFabResponse<LoginResult>>(
        url,
        request,
        {
          headers: PLAYFAB_DEFAULT_HEADERS
        }
      );

      // HTTPレスポンスのエラーチェック
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const playFabResponse = response.data;

      // PlayFab APIレスポンスのエラーチェック
      if (playFabResponse.code !== PLAYFAB_SUCCESS_CODE) {
        const error: PlayFabError = {
          code: playFabResponse.code,
          status: playFabResponse.status,
          error: playFabResponse.error || 'Unknown error',
          errorCode: playFabResponse.errorCode ?? 0,
          errorMessage: playFabResponse.errorMessage ?? 'Unknown error message',
          errorDetails: playFabResponse.errorDetails as { [key: string]: string[] } | undefined
        };
        throw error;
      }

      if (!playFabResponse.data) {
        throw new Error('PlayFab APIからのレスポンスにデータが含まれていません');
      }

      logger.info('PlayFab ログインに成功しました', {
        playFabId: playFabResponse.data.PlayFabId
      });

      return playFabResponse.data;
    } catch (error) {
      logger.error('PlayFab ログイン処理でエラーが発生しました', error);
      throw error;
    }
  }

  /**
       * プレイヤープロフィールを取得
       * TODO: 今後実装予定
       * @param _playFabId プレイヤーID
       * @returns プレイヤープロフィール
       */
  public async getPlayerProfile(_playFabId: string): Promise<unknown> {
    // TODO: 実装予定
    throw new Error('getPlayerProfile は未実装です');
  }

  /**
       * プレイヤー統計を更新
       * TODO: 今後実装予定
       * @param _statistics 更新する統計データ
       * @returns 更新結果
       */
  public async updatePlayerStatistics(_statistics: unknown): Promise<unknown> {
    // TODO: 実装予定
    throw new Error('updatePlayerStatistics は未実装です');
  }

  /**
       * タイトルIDを取得
       * @returns PlayFabのタイトルID
       */
  public getTitleId(): string {
    return this.titleId;
  }

  /**
       * ベースURLを取得
       * @returns PlayFab APIのベースURL
       */
  public getBaseUrl(): string {
    return this.baseUrl;
  }
} 