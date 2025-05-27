import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  DB_TABLES,
  GAME_STATE_COLUMNS,
  REALTIME_CHANNELS,
  DB_SCHEMA
} from '../../types';

// Supabaseの設定（環境変数から取得）
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// 固定ID（シングルレコード用）
const GAME_STATE_ID = 1;

export class SupabaseService {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // スコアを取得
  async getScore(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from(DB_TABLES.GAME_STATE)
        .select(GAME_STATE_COLUMNS.SCORE)
        .single();

      if (error) {
        console.error('Score取得エラー:', error);
        return 0;
      }

      return data?.[GAME_STATE_COLUMNS.SCORE] || 0;
    } catch (error) {
      console.error('Score取得例外:', error);
      return 0;
    }
  }

  // スコアを更新
  async updateScore(newScore: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(DB_TABLES.GAME_STATE)
        .upsert({
          [GAME_STATE_COLUMNS.ID]: GAME_STATE_ID,
          [GAME_STATE_COLUMNS.SCORE]: newScore,
          [GAME_STATE_COLUMNS.UPDATED_AT]: new Date().toISOString()
        });

      if (error) {
        console.error('Score更新エラー:', error);
      }
    } catch (error) {
      console.error('Score更新例外:', error);
    }
  }

  // リアルタイム購読を開始
  subscribeToScoreChanges(callback: (score: number) => void): void {
    this.channel = this.supabase
      .channel(REALTIME_CHANNELS.GAME_STATE_CHANGES)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: DB_SCHEMA.PUBLIC,
          table: DB_TABLES.GAME_STATE
        },
        (payload) => {
          console.log('リアルタイム更新:', payload);
          if (payload.new && typeof payload.new === 'object' && GAME_STATE_COLUMNS.SCORE in payload.new) {
            callback(payload.new[GAME_STATE_COLUMNS.SCORE] as number);
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
}
