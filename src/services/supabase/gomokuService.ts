import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  DB_TABLES,
  GOMOKU_COLUMNS,
  REALTIME_CHANNELS,
  DB_SCHEMA,
} from '../../types';
import type {
  Gomoku,
  GameCreateParams,
  GameUpdateParams,
  Player
} from '../../types';
import { BOARD_SIZE } from '../../consts/const';

// Supabaseの設定（環境変数から取得）
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export class GomokuService {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // 新しいゲームを作成
  async createGame(params: GameCreateParams): Promise<Gomoku | null> {
    try {
      // 空の盤面を初期化
      const emptyBoard: number[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));

      const { data, error } = await this.supabase
        .from(DB_TABLES.GOMOKU)
        .insert({
          [GOMOKU_COLUMNS.BLACK_PLAYER_ID]: params.blackPlayerId,
          [GOMOKU_COLUMNS.WHITE_PLAYER_ID]: params.whitePlayerId,
          [GOMOKU_COLUMNS.CURRENT_PLAYER_TURN]: params.blackPlayerId, // 黒が先手
          [GOMOKU_COLUMNS.BOARD_STATE]: emptyBoard,
          [GOMOKU_COLUMNS.IS_FINISHED]: false,
        })
        .select()
        .single();

      if (error) {
        console.error('ゲーム作成エラー:', error);
        return null;
      }

      return data as Gomoku;
    } catch (error) {
      console.error('ゲーム作成例外:', error);
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
        console.error('ゲーム取得エラー:', error);
        return null;
      }

      return data as Gomoku;
    } catch (error) {
      console.error('ゲーム取得例外:', error);
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
        console.error('プレイヤーゲーム取得エラー:', error);
        return [];
      }

      return data as Gomoku[];
    } catch (error) {
      console.error('プレイヤーゲーム取得例外:', error);
      return [];
    }
  }

  // 手を打つ
  async makeMove(gameId: string, params: GameUpdateParams): Promise<Gomoku | null> {
    try {
      // 現在のゲーム状態を取得
      const currentGame = await this.getGame(gameId);
      if (!currentGame) {
        console.error('ゲームが見つかりません');
        return null;
      }

      // ゲームが終了していないかチェック
      if (currentGame[GOMOKU_COLUMNS.IS_FINISHED]) {
        console.error('ゲームは既に終了しています');
        return null;
      }

      // 現在のプレイヤーのターンかチェック
      if (currentGame[GOMOKU_COLUMNS.CURRENT_PLAYER_TURN] !== params.playerId) {
        console.error('あなたのターンではありません');
        return null;
      }

      // 指定位置が空いているかチェック
      const boardState = currentGame[GOMOKU_COLUMNS.BOARD_STATE];
      if (boardState[params.row][params.col] !== 0) {
        console.error('その位置には既に石があります');
        return null;
      }

      // 新しい盤面を作成
      const newBoardState = boardState.map(row => [...row]);
      const playerStone = params.playerId === currentGame[GOMOKU_COLUMNS.BLACK_PLAYER_ID] ? 1 : 2;
      newBoardState[params.row][params.col] = playerStone;

      // 勝敗判定
      const winner = this.checkWinner(newBoardState, params.row, params.col, playerStone);
      const isFinished = winner !== null;

      // 次のプレイヤーを決定
      const nextPlayer = params.playerId === currentGame[GOMOKU_COLUMNS.BLACK_PLAYER_ID]
        ? currentGame[GOMOKU_COLUMNS.WHITE_PLAYER_ID]
        : currentGame[GOMOKU_COLUMNS.BLACK_PLAYER_ID];

      // ゲーム状態を更新
      const updateData: any = {
        [GOMOKU_COLUMNS.BOARD_STATE]: newBoardState,
        [GOMOKU_COLUMNS.UPDATED_AT]: new Date().toISOString(),
      };

      if (isFinished) {
        updateData[GOMOKU_COLUMNS.IS_FINISHED] = true;
        updateData[GOMOKU_COLUMNS.WINNER_ID] = params.playerId;
        updateData[GOMOKU_COLUMNS.FINISHED_AT] = new Date().toISOString();
      } else {
        updateData[GOMOKU_COLUMNS.CURRENT_PLAYER_TURN] = nextPlayer;
      }

      const { data, error } = await this.supabase
        .from(DB_TABLES.GOMOKU)
        .update(updateData)
        .eq(GOMOKU_COLUMNS.ID, gameId)
        .select()
        .single();

      if (error) {
        console.error('手の更新エラー:', error);
        return null;
      }

      return data as Gomoku;
    } catch (error) {
      console.error('手の更新例外:', error);
      return null;
    }
  }

  // 勝敗判定（五目並べのルール）
  private checkWinner(board: number[][], row: number, col: number, player: number): string | null {
    const directions = [
      [0, 1],   // 横
      [1, 0],   // 縦
      [1, 1],   // 右下斜め
      [1, -1]   // 右上斜め
    ];

    for (const [dx, dy] of directions) {
      let count = 1; // 現在の石も含む

      // 正方向にカウント
      let x = row + dx;
      let y = col + dy;
      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === player) {
        count++;
        x += dx;
        y += dy;
      }

      // 逆方向にカウント
      x = row - dx;
      y = col - dy;
      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === player) {
        count++;
        x -= dx;
        y -= dy;
      }

      // 5つ並んだら勝利
      if (count >= 5) {
        return player === 1 ? 'black' : 'white';
      }
    }

    return null;
  }

  // ゲームを放棄
  async forfeitGame(gameId: string, playerId: string): Promise<Gomoku | null> {
    try {
      const currentGame = await this.getGame(gameId);
      if (!currentGame) {
        console.error('ゲームが見つかりません');
        return null;
      }

      if (currentGame[GOMOKU_COLUMNS.IS_FINISHED]) {
        console.error('ゲームは既に終了しています');
        return null;
      }

      // 相手プレイヤーを勝者にする
      const winnerId = playerId === currentGame[GOMOKU_COLUMNS.BLACK_PLAYER_ID]
        ? currentGame[GOMOKU_COLUMNS.WHITE_PLAYER_ID]
        : currentGame[GOMOKU_COLUMNS.BLACK_PLAYER_ID];

      const { data, error } = await this.supabase
        .from(DB_TABLES.GOMOKU)
        .update({
          [GOMOKU_COLUMNS.IS_FINISHED]: true,
          [GOMOKU_COLUMNS.WINNER_ID]: winnerId,
          [GOMOKU_COLUMNS.FINISHED_AT]: new Date().toISOString(),
          [GOMOKU_COLUMNS.UPDATED_AT]: new Date().toISOString(),
        })
        .eq(GOMOKU_COLUMNS.ID, gameId)
        .select()
        .single();

      if (error) {
        console.error('ゲーム放棄エラー:', error);
        return null;
      }

      return data as Gomoku;
    } catch (error) {
      console.error('ゲーム放棄例外:', error);
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
          console.log('五目並べリアルタイム更新:', payload);
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