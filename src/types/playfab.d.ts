/**
 * PlayFab SDKの型定義
 * PlayFab REST APIに合わせた型定義
 */

declare global {
    interface Window {
        PlayFab: PlayFabStatic;
    }

    const PlayFab: PlayFabStatic;
}

export interface PlayFabStatic {
    settings: {
        titleId: string;
    };
    ClientApi: {
        LoginWithCustomID: (
            request: LoginWithCustomIDRequest,
            callback: (result: { data: LoginResult }, error: PlayFabError | null) => void
        ) => void;
    };
}

export interface LoginWithCustomIDRequest {
    TitleId: string;
    CustomId: string;
    CreateAccount?: boolean;
}

export interface LoginResult {
    PlayFabId?: string;
    NewlyCreated?: boolean;
    SessionTicket?: string;
    SettingsForUser?: Record<string, unknown>;
    LastLoginTime?: string;
    EntityToken?: Record<string, unknown>;
    TreatmentAssignment?: Record<string, unknown>;
}

export interface PlayFabError {
    code: number;
    status: string;
    error: string;
    errorCode: number;
    errorMessage: string;
    errorDetails?: { [key: string]: string[] };
    retryAfterSeconds?: number;
}

export interface PlayFabSuccessContainer<T> {
    code: number;
    status: string;
    data: T;
}

export type PlayFabCallback<T> = (
    error: PlayFabError | null,
    result: PlayFabSuccessContainer<T> | null
) => void;

export interface ClientAPI {
    LoginWithCustomID(
        request: LoginWithCustomIDRequest,
        callback: PlayFabCallback<LoginResult>
    ): void;
}