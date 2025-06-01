import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  DB_TABLES,
  GOMOKU_COLUMNS,
  REALTIME_CHANNELS,
  DB_SCHEMA,
} from 'src/types';
import type { Gomoku, GameCreateParams, Player } from 'src/types';
import { BOARD_SIZE } from 'src/consts/const';
import { logger } from 'src/utils/logger';

// Supabaseの設定（環境変数から取得）
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export class GomokuRepository {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // 新しいゲームを作成
  async createGame(params: GameCreateParams): Promise<Gomoku | null> {
    try {
      const emptyBoard: number[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));

      const { data, error } = await this.supabase
        .from(DB_TABLES.GOMOKU)
        .insert({
          [GOMOKU_COLUMNS.BLACK_PLAYER_ID]: params.blackPlayerId,
          [GOMOKU_COLUMNS.WHITE_PLAYER_ID]: params.whitePlayerId,
          [GOMOKU_COLUMNS.CURRENT_PLAYER_TURN]: params.blackPlayerId,
          [GOMOKU_COLUMNS.BOARD_STATE]: emptyBoard,
          [GOMOKU_COLUMNS.IS_FINISHED]: false,
        })
        .select()
        .single();

      if (error) {
        logger.error('ゲーム作成エラー - Supabaseエラー:', error.message, '詳細:', error.details);
        return null;
      }

      return data as Gomoku;
    } catch (error) {
      logger.error('ゲーム作成例外 - 予期せぬエラー:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  // ゲームを取得
  async getGame(gameId: string): Promise<Gomoku | null> {
    try {
      const { data, error } = await this.supabase
        .from(DB_TABLES.GOMOKU)
        .select('*')
        .eq(GOMOKU_COLUMNS.ID, gameId)
        .single();

      if (error) {
        logger.error('ゲーム取得エラー:', error);
        return null;
      }

      return data as Gomoku;
    } catch (error) {
      logger.error('ゲーム取得例外:', error);
      return null;
    }
  }

  // プレイヤーのアクティブなゲーム一覧を取得
  async getPlayerGames(playerId: string): Promise<Gomoku[]> {
    try {
      const { data, error } = await this.supabase
        .from(DB_TABLES.GOMOKU)
        .select('*')
        .or(`${GOMOKU_COLUMNS.BLACK_PLAYER_ID}.eq.${playerId},${GOMOKU_COLUMNS.WHITE_PLAYER_ID}.eq.${playerId}`)
        .eq(GOMOKU_COLUMNS.IS_FINISHED, false)
        .order(GOMOKU_COLUMNS.UPDATED_AT, { ascending: false });

      if (error) {
        logger.error('プレイヤーゲーム取得エラー:', error);
        return [];
      }

      return data as Gomoku[];
    } catch (error) {
      logger.error('プレイヤーゲーム取得例外:', error);
      return [];
    }
  }

  // ゲーム状態を更新
  async updateGameState(gameId: string, updateData: Partial<Gomoku>): Promise<Gomoku | null> {
    try {
      const { data, error } = await this.supabase
        .from(DB_TABLES.GOMOKU)
        .update(updateData)
        .eq(GOMOKU_COLUMNS.ID, gameId)
        .select()
        .single();

      if (error) {
        logger.error('ゲーム状態更新エラー:', error);
        return null;
      }

      return data as Gomoku;
    } catch (error) {
      logger.error('ゲーム状態更新例外:', error);
      return null;
    }
  }

  // リアルタイム購読を開始
  subscribeToGameChanges(gameId: string, callback: (game: Gomoku) => void): void {
    this.channel = this.supabase
      .channel(REALTIME_CHANNELS.GOMOKU_CHANGES)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: DB_SCHEMA.PUBLIC,
          table: DB_TABLES.GOMOKU,
          filter: `${GOMOKU_COLUMNS.ID}=eq.${gameId}`
        },
        (payload) => {
          logger.debug('五目並べリアルタイム更新:', payload);
          if (payload.new && typeof payload.new === 'object') {
            callback(payload.new as Gomoku);
          }
        }
      )
      .subscribe();
  }

  // リアルタイム購読を停止
  unsubscribe(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  // ユーティリティ: 盤面の空のセル数を取得
  getEmptyCellCount(board: number[][]): number {
    let count = 0;
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) {
          count++;
        }
      }
    }
    return count;
  }

  // ユーティリティ: プレイヤーの色を取得
  getPlayerColor(game: Gomoku, playerId: string): Player | null {
    if (game[GOMOKU_COLUMNS.BLACK_PLAYER_ID] === playerId) {
      return 'black';
    }
    if (game[GOMOKU_COLUMNS.WHITE_PLAYER_ID] === playerId) {
      return 'white';
    }
    return null;
  }

  // ユーティリティ: 現在のターンのプレイヤー色を取得
  getCurrentTurnColor(game: Gomoku): Player {
    return game[GOMOKU_COLUMNS.CURRENT_PLAYER_TURN] === game[GOMOKU_COLUMNS.BLACK_PLAYER_ID]
      ? 'black'
      : 'white';
  }
} 