import { BOARD_SIZE } from './const';

// レイアウト関連の定数
export const LAYOUT = {
  // 画面全体サイズ
  GAME: {
    WIDTH: 1024,
    HEIGHT: 768,
  },
  
  // 画面サイズ
  SCREEN: {
    get CENTER_X() { return LAYOUT.GAME.WIDTH / 2; },
    get CENTER_Y() { return LAYOUT.GAME.HEIGHT / 2; },
  },
  
  // フォントサイズ
  FONT_SIZE: {
    LARGE: '64px',
    MEDIUM: '40px',
    SMALL: '24px',
  },
  
  // カラー
  COLORS: {
    WHITE: '#ffffff',
    BLUE: 0x1565c0,
    GREEN: '#00ff00',
  },
  
  // サイズ
  BUTTON: {
    WIDTH: 200,
    HEIGHT: 80,
  },
  
  // フォント
  FONT_FAMILY: 'Arial',

  // 背景色
  BACKGROUND_COLOR: '#028af8',
} as const;

export const BOARD = {
  CELL_SIZE: 30,
  OFFSET_X: 50,
  OFFSET_Y: 50,
  STONE_RADIUS: 12,
  get SIZE() { return BOARD_SIZE; }
};

export const SCREEN = {
  CENTER_X: 400,
  CENTER_Y: 300
};

export const PADDING = {
  SMALL: { x: 10, y: 5 },
  MEDIUM: { x: 20, y: 10 }
};

export const FONT = {
  FAMILY: 'Arial',
  SIZES: {
    SMALL: '12px',
    NORMAL: '14px',
    MEDIUM: '16px',
    LARGE: '24px',
    TITLE: '32px',
    HERO: '48px'
  }
};
