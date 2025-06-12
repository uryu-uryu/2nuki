import type { TranslationKeys } from 'src/i18n/types';

type ResourceType = {
  translation: TranslationKeys;
};

export const enTranslations: ResourceType = {
  translation: {
    // Main Menu
    title: 'Gomoku',
    startButton: 'Start Game',

    // Matchmaking
    matchmaking: {
      title: 'Matchmaking',
      searching: 'Searching for opponent...',
      found: 'Match found!',
      timeout: 'Matchmaking timeout',
      error: 'An error occurred',
      cancelled: 'Cancelled',
      cancel: 'Cancel',
      retry: 'Retry',
      backToMenu: 'Back to Menu',
      elapsedTime: 'Elapsed time: {{time}}s',
      connecting: 'Connecting to game...',
      preparingGame: 'Preparing game...',
      creatingGame: 'Creating game...',
      startingGame: 'Starting game...'
    },

    // Game Play
    gamePlay: {
      back: 'Back',
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