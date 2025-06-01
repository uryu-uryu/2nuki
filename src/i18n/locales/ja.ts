import type { TranslationKeys } from 'src/i18n/types';

type ResourceType = {
  translation: TranslationKeys;
};

export const jaTranslations: ResourceType = {
  translation: {
    // メインメニュー
    title: '五目並べ',
    startButton: 'ゲームを始める',

    // プレイヤー選択
    playerSelect: {
      title: 'プレイヤー選択',
      player1: 'プレイヤー1として参加',
      player2: 'プレイヤー2として参加',
      back: '戻る',
      description: 'ローカルテスト用：\n別のタブで異なるプレイヤーを選択してください'
    },

    // ゲームプレイ
    gamePlay: {
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