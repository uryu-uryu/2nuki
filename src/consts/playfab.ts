/**
 * PlayFab API関連の定数定義
 * API エンドポイントやヘッダー情報を集約管理
 */

/**
 * PlayFab APIのベースURL
 * @param titleId PlayFabのタイトルID
 * @returns APIのベースURL
 */
export const getPlayFabApiBaseUrl = (titleId: string): string => {
  return `https://${titleId}.playfabapi.com`;
};

/**
 * PlayFab APIエンドポイント定義
 */
export const PLAYFAB_ENDPOINTS = {
  LOGIN_WITH_CUSTOM_ID: '/Client/LoginWithCustomID',
  // 今後追加予定のエンドポイント
  GET_PLAYER_PROFILE: '/Client/GetPlayerProfile',
  UPDATE_PLAYER_STATISTICS: '/Client/UpdatePlayerStatistics',
} as const;

/**
 * PlayFab APIのデフォルトヘッダー
 */
export const PLAYFAB_DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-PlayFabSDK': 'WebSDK-1.0.0',
} as const;

/**
 * PlayFab API レスポンスの成功ステータスコード
 */
export const PLAYFAB_SUCCESS_CODE = 200; 