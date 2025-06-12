export type TranslationKeys = {
    // メインメニュー
    title: string;
    startButton: string;

    // マッチメイキング
    matchmaking: {
        title: string;
        searching: string;
        found: string;
        timeout: string;
        error: string;
        cancelled: string;
        cancel: string;
        retry: string;
        backToMenu: string;
        elapsedTime: string;
        connecting: string;
        preparingGame: string;
        creatingGame: string;
        startingGame: string;
    };

    // ゲームプレイ
    gamePlay: {
        back: string;
        score: string;
        time: string;
        turn: string;
        win: string;
        lose: string;
        draw: string;
        restart: string;
        backToMenu: string;
        loading: string;
        error: string;
        forfeit: string;
        newGame: string;
        waitingForOpponent: string;
        yourTurn: string;
        opponentTurn: string;
        gameFinished: string;
        winner: string;
    };

    // 設定
    settings: {
        title: string;
        sound: string;
        bgm: string;
        language: string;
    };
};

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {
            translation: TranslationKeys;
        };
    }
} 