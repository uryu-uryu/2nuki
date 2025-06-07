/**
 * HTTPクライアントの抽象化
 * WebとiOSの両方で使えるようにインターフェースを定義
 * プラットフォーム固有の実装は各クラスで行う
 */

/**
 * HTTPリクエストのオプション
 */
export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number; // ミリ秒
}

/**
 * HTTPレスポンス
 */
export interface HttpResponse<T = unknown> {
  ok: boolean;
  status: number;
  statusText: string;
  data: T;
}

/**
 * HTTPクライアントのインターフェース
 * プラットフォーム固有の実装を隠蔽し、統一されたAPIを提供
 */
export interface IHttpClient {
  /**
   * HTTPリクエストを実行
   * @param url リクエストURL
   * @param options リクエストオプション
   * @returns レスポンスのPromise
   */
  request<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;

  /**
   * GETリクエストを実行
   * @param url リクエストURL
   * @param options リクエストオプション
   * @returns レスポンスのPromise
   */
  get<T>(url: string, options?: Omit<HttpRequestOptions, 'method'>): Promise<HttpResponse<T>>;

  /**
   * POSTリクエストを実行
   * @param url リクエストURL
   * @param body リクエストボディ
   * @param options リクエストオプション
   * @returns レスポンスのPromise
   */
  post<T>(url: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method' | 'body'>): Promise<HttpResponse<T>>;
}

/**
 * Web環境用のHTTPクライアント実装
 * fetchを使用してHTTPリクエストを実行
 */
export class FetchHttpClient implements IHttpClient {
  /**
     * HTTPリクエストを実行
     * @param url リクエストURL
     * @param options リクエストオプション
     * @returns レスポンスのPromise
     */
  public async request<T>(url: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000
    } = options;

    // AbortControllerでタイムアウト制御
    const controller = new globalThis.AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), timeout);

    try {
      const response = await globalThis.fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      globalThis.clearTimeout(timeoutId);

      const data = await response.json();

      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data
      };
    } catch (error) {
      globalThis.clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
     * GETリクエストを実行
     * @param url リクエストURL
     * @param options リクエストオプション
     * @returns レスポンスのPromise
     */
  public async get<T>(url: string, options?: Omit<HttpRequestOptions, 'method'>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
     * POSTリクエストを実行
     * @param url リクエストURL
     * @param body リクエストボディ
     * @param options リクエストオプション
     * @returns レスポンスのPromise
     */
  public async post<T>(url: string, body?: unknown, options?: Omit<HttpRequestOptions, 'method' | 'body'>): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }
} 