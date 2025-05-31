/**
 * Gomoku 関連の型定義
 */

import type { Gomoku } from 'src/types/database';
import type { Player } from 'src/types/database';

// ゲームセッション管理用インターフェース
export interface GameSession {
    id: string;
    gameData: Gomoku;
    isActive: boolean;
    lastUpdateTime: number;
}

// イベントハンドラー用インターフェース
export interface GameManagerEvents {
    gameCreated: (game: Gomoku) => void;
    gameUpdated: (game: Gomoku) => void;
    gameFinished: (game: Gomoku, winner: Player | null) => void;
    error: (error: string) => void;
}

// ゲーム状態の更新用インターフェース
export interface GameUpdateData {
    board_state: number[][];
    updated_at: string;
    is_finished?: boolean;
    winner_id?: string;
    finished_at?: string;
    current_player_turn?: string;
}

// デバッグ情報用インターフェース
export interface DebugInfo {
    activeSessions: {
        [gameId: string]: {
            id: string;
            isActive: boolean;
            lastUpdateTime: number;
            gameData: Gomoku;
        }
    };
    playerId: string;
} 