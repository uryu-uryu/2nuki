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
