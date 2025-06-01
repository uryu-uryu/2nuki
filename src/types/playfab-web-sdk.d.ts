declare module 'playfab-web-sdk' {
    export namespace PlayFabClientModels {
        interface LoginWithCustomIDRequest {
            CustomId: string;
            CreateAccount?: boolean;
        }

        interface LoginResult {
            PlayFabId: string;
            SessionTicket: string;
            NewlyCreated: boolean;
            SettingsForUser: Record<string, unknown>;
            LastLoginTime: string;
            EntityToken: Record<string, unknown>;
            TreatmentAssignment: Record<string, unknown>;
        }
    }

    export namespace PlayFab {
        interface ISettings {
            titleId: string;
            developerSecretKey?: string;
            advertisingIdType?: string;
            advertisingIdValue?: string;
        }

        interface IPlayFabRequestCommon {
            customTags?: Record<string, string>;
        }

        interface IPlayFabSuccessContainer<TResult> {
            code: number;
            status: string;
            data: TResult;
        }

        interface IPlayFabError {
            code: number;
            error: string;
            errorCode: number;
            errorMessage: string;
            errorDetails?: { [key: string]: string[] };
            retryAfterSeconds?: number;
        }

        type PlayFabCallback<TResult> = (
            result: IPlayFabSuccessContainer<TResult>,
            error: IPlayFabError | null
        ) => void;

        namespace ClientApi {
            function LoginWithCustomID(
                request: PlayFabClientModels.LoginWithCustomIDRequest,
                callback: PlayFabCallback<PlayFabClientModels.LoginResult>
            ): void;
        }

        const settings: ISettings;
    }
} 