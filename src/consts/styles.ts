import { LAYOUT } from './layout';

export const DEFAULT_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: LAYOUT.FONT_SIZE.MEDIUM,
    color: LAYOUT.COLORS.WHITE,
    fontFamily: LAYOUT.FONT_FAMILY,
} as const;

// 大きいテキスト用のスタイル
export const LARGE_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
    ...DEFAULT_TEXT_STYLE,
    fontSize: LAYOUT.FONT_SIZE.LARGE,
} as const;

// 小さいテキスト用のスタイル
export const SMALL_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
    ...DEFAULT_TEXT_STYLE,
    fontSize: LAYOUT.FONT_SIZE.SMALL,
} as const;

// ステータス表示用の緑テキストスタイル
export const STATUS_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
    ...SMALL_TEXT_STYLE,
    color: LAYOUT.COLORS.GREEN,
} as const; 