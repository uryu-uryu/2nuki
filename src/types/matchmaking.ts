/**
 * マッチメイキング機能の型定義
 * PlayFabマッチメイキングAPIとの連携で使用される型を定義
 */

import type { MatchmakingStatusType } from 'src/consts/matchmaking';

/**
 * マッチメイキングの状態を管理するインターface
 */
export interface MatchmakingState {
    /** 現在のマッチメイキング状態 */
    status: MatchmakingStatusType;
    /** PlayFabから返されるチケットID */
    ticketId: string | null;
    /** マッチング成功時のマッチID */
    matchId: string | null;
    /** マッチング開始からの経過時間（秒） */
    elapsedTime: number;
    /** エラーメッセージ */
    error: string | null;
    /** ポーリング用のタイマーID */
    pollingTimer: number | null;
}

/**
 * PlayFabマッチメイキングチケット作成リクエスト
 */
export interface CreateMatchmakingTicketRequest {
    /** マッチメイキングキュー名 */
    QueueName: string;
    /** プレイヤー情報 */
    Creator: {
        /** プレイヤーのEntity情報 */
        Entity: {
            Id: string;
            Type: string;
        };
        /** プレイヤーの属性情報（JSON文字列） */
        Attributes?: {
            DataObject?: unknown;
        };
    };
    /** マッチメイキングのタイムアウト時間（秒） */
    GiveUpAfterSeconds: number;
}

/**
 * PlayFabマッチメイキングチケット作成レスポンス
 */
export interface CreateMatchmakingTicketResult {
    /** 作成されたチケットのID */
    TicketId: string;
    /** PlayFab REST APIの共通レスポンス構造 */
    data?: {
        TicketId: string;
    };
}

/**
 * PlayFabマッチメイキングチケット取得レスポンス
 */
export interface GetMatchmakingTicketResult {
    /** チケットID */
    TicketId: string;
    /** マッチメイキング状態 */
    Status: PlayFabMatchmakingStatus;
    /** マッチID（マッチ成立時のみ） */
    MatchId?: string;
    /** 推定待機時間（秒） */
    EstimatedWaitTimeSeconds?: number;
    /** PlayFab REST APIの共通レスポンス構造 */
    data?: {
        TicketId: string;
        Status: PlayFabMatchmakingStatus;
        MatchId?: string;
        EstimatedWaitTimeSeconds?: number;
    };
}

/**
 * PlayFabマッチ情報
 */
export interface PlayFabMatchDetails {
    /** マッチID */
    MatchId: string;
    /** マッチしたプレイヤー一覧 */
    Members: Array<{
        /** プレイヤーのEntity情報 */
        Entity: {
            Id: string;
            Type: string;
            TypeString?: string;
        };
        /** チーム ID （オプション） */
        TeamId?: string;
        /** プレイヤーの属性情報 */
        Attributes?: {
            DataObject?: unknown;
        };
    }>;
    /** 推奨リージョン */
    RegionPreferences?: string[];
    /** ロビー情報（使用する場合） */
    ArrangementString?: string;
}

/**
 * PlayFabマッチ取得レスポンス
 */
export interface GetMatchResult {
    /** HTTP ステータスコード */
    code?: number;
    /** ステータス文字列 */
    status?: string;
    /** マッチの詳細情報 */
    data?: {
        MatchId: string;
        Members: Array<{
            Entity: {
                Id: string;
                Type: string;
                TypeString?: string;
            };
        }>;
        RegionPreferences?: string[];
        ArrangementString?: string;
    };
    /** レガシー構造のサポート */
    Match?: PlayFabMatchDetails;
}

/**
 * マッチメイキングの結果情報
 */
export interface MatchmakingResult {
    /** 成功フラグ */
    success: boolean;
    /** チケットID（チケット作成成功時のみ） */
    ticketId?: string;
    /** マッチ情報（成功時のみ） */
    matchDetails?: PlayFabMatchDetails;
    /** エラーメッセージ（失敗時のみ） */
    error?: string;
}

/**
 * マッチメイキングイベントのペイロード型
 */
export interface MatchmakingEventPayload {
    /** マッチング開始イベント */
    matchmakingStarted: { ticketId: string };
    /** マッチング成功イベント */
    matchFound: { matchDetails: PlayFabMatchDetails };
    /** マッチングエラーイベント */
    matchmakingError: { error: string };
    /** マッチングキャンセルイベント */
    matchmakingCancelled: Record<string, never>;
    /** マッチングタイムアウトイベント */
    matchmakingTimeout: Record<string, never>;
}

/**
 * ゲーム遷移時に渡すマッチ情報
 */
export interface MatchTransitionData {
    /** マッチID */
    matchId: string;
    /** 自分のプレイヤーID */
    myPlayerId: string;
    /** 相手のプレイヤーID */
    opponentPlayerId: string;
    /** 自分が黒石（先攻）かどうか */
    isBlackPlayer: boolean;
    /** Supabaseで作成されたゲームID */
    gameId?: string;
}

/**
 * マッチメイキングからゲーム作成への結果
 */
export interface GameCreationResult {
    /** 成功フラグ */
    success: boolean;
    /** 作成されたゲームデータ */
    gameData?: {
        id: string;
        matchId: string;
        myPlayerId: string;
        opponentPlayerId: string;
        isBlackPlayer: boolean;
        [key: string]: unknown;
    };
    /** エラーメッセージ */
    error?: string;
}

/**
 * PlayFabマッチメイキングチケットの状態
 */
export type PlayFabMatchmakingStatus =
    | 'WaitingForPlayers'
    | 'WaitingForMatch'
    | 'WaitingForServer'
    | 'Matched'
    | 'Canceled'
    | 'Failed'; 