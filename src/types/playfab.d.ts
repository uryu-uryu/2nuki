declare module 'playfab-sdk' {
    export namespace PlayFabClientModels {
        interface LoginWithCustomIDRequest {
            CustomId: string;
            CreateAccount?: boolean;
        }

        interface LoginResult {
            PlayFabId: string;
            SessionTicket: string;
            NewlyCreated: boolean;
        }

        interface ApiErrorWrapper {
            code: number;
            status: string;
            error: string;
            errorCode: number;
            errorMessage: string;
        }
    }

    export class PlayFabClient {
      static settings: {
            titleId: string;
        };

      static LoginWithCustomID(
            request: PlayFabClientModels.LoginWithCustomIDRequest,
            callback: (result: PlayFabClientModels.LoginResult, error: PlayFabClientModels.ApiErrorWrapper) => void
        ): void;
    }
} 