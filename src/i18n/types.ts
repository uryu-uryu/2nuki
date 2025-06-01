export type TranslationKeys = {
    // メインメニュー
    title: string;
    startButton: string;

    // プレイヤー選択
    playerSelect: {
        title: string;
        player1: string;
        player2: string;
        back: string;
        description: string;
    };

    // ゲームプレイ
    gamePlay: {
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