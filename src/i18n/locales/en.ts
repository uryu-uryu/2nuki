import type { TranslationKeys } from 'src/i18n/types';

type ResourceType = {
  translation: TranslationKeys;
};

export const enTranslations: ResourceType = {
  translation: {
    // Main Menu
    title: 'Gomoku',
    startButton: 'Start Game',

    // Player Select
    playerSelect: {
      title: 'Select Player',
      player1: 'Join as Player 1',
      player2: 'Join as Player 2',
      back: 'Back',
      description: 'Local Test Mode:\nPlease select different players in separate tabs'
    },

    // Game Play
    gamePlay: {
      score: 'Score',
      time: 'Time Left',
      turn: '{{player}}\'s Turn',
      win: 'Victory!',
      lose: 'Defeat...',
      draw: 'Draw',
      restart: 'Play Again',
      backToMenu: 'Back to Menu',
      loading: 'Loading...',
      error: 'An error occurred',
      forfeit: 'Forfeit',
      newGame: 'New game created',
      waitingForOpponent: 'Waiting for opponent...',
      yourTurn: 'Your turn',
      opponentTurn: 'Opponent\'s turn',
      gameFinished: 'Game finished',
      winner: 'Winner'
    },

    // Settings
    settings: {
      title: 'Settings',
      sound: 'Sound Effects',
      bgm: 'BGM',
      language: 'Language'
    }
  }
}; 