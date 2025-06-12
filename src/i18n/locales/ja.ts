import type { TranslationKeys } from 'src/i18n/types';

type ResourceType = {
  translation: TranslationKeys;
};

export const jaTranslations: ResourceType = {
  translation: {
    // メインメニュー
    title: '五目並べ',
    startButton: 'ゲームを始める',

    // マッチメイキング
    matchmaking: {
      title: 'マッチメイキング',
      searching: '対戦相手を検索中...',
      found: 'マッチが見つかりました！',
      timeout: 'マッチメイキングがタイムアウトしました',
      error: 'エラーが発生しました',
      cancelled: 'キャンセルされました',
      elapsedTime: '経過時間: {{time}}秒',
      cancel: 'キャンセル',
      retry: '再試行',
      backToMenu: 'メニューに戻る',
      connecting: 'ゲームに接続中...',
      preparingGame: 'ゲームを準備中...',
      creatingGame: 'ゲームを作成中...',
      startingGame: 'ゲームを開始中...'
    },

    // ゲームプレイ
    gamePlay: {
      back: '戻る',
      score: 'スコア',
      time: '残り時間',
      turn: '{{player}}の番です',
      win: '勝利！',
      lose: '敗北...',
      draw: '引き分け',
      restart: 'もう一度',
      backToMenu: 'メニューに戻る',
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      forfeit: '降参する',
      newGame: '新しいゲームを作成しました',
      waitingForOpponent: '対戦相手を待っています...',
      yourTurn: 'あなたの番です',
      opponentTurn: '相手の番です',
      gameFinished: 'ゲームが終了しました',
      winner: '勝者'
    },

    // 設定
    settings: {
      title: '設定',
      sound: '効果音',
      bgm: 'BGM',
      language: '言語'
    }
  }
}; 