/**
 * PlayFabマッチメイキング機能を管理するクラス
 * - マッチメイキングチケットの作成・管理
 * - マッチング状態の監視
 * - マッチング結果の取得
 * 
 * 責務：
 * - PlayFab REST APIとの通信
 * - マッチメイキングの状態管理
 * - エラーハンドリング
 * - リトライ処理
 */

import { logger } from 'src/utils/logger';
import { PlayFabAuth } from 'src/auth/PlayFab/playfabAuth';
import { MATCHMAKING_CONFIG } from 'src/consts/matchmaking';
import { GomokuRepository } from 'src/repository/supabase/gomokuRepository';
import type {
  CreateMatchmakingTicketRequest,
  CreateMatchmakingTicketResult,
  GetMatchmakingTicketResult,
  GetMatchResult,
  MatchmakingResult,
  MatchTransitionData,
  GameCreationResult,
  PlayFabMatchDetails
} from 'src/types/matchmaking';
import type { GameCreateParams } from 'src/types';

export class PlayFabMatchmaking {
  private static instance: PlayFabMatchmaking;
  private auth: PlayFabAuth;
  private gomokuRepository: GomokuRepository;
  private isInitialized: boolean = false;
  private entityToken: string | null = null;
  // Entity ID: PlayFabのtitle player account ID（基本的にPlayFabIdと同じ値）
  private entityId: string | null = null;
  // Entity Type: "title_player_account" 固定
  private entityType: string | null = null;
  private titleId: string;

  private constructor() {
    this.auth = PlayFabAuth.getInstance();
    this.gomokuRepository = new GomokuRepository();
    this.titleId = import.meta.env.VITE_PLAYFAB_TITLE_ID || '';
  }

  /**
 * シングルトンインスタンスを取得
 * @returns PlayFabMatchmakingのインスタンス
 */
  public static getInstance(): PlayFabMatchmaking {
    if (!PlayFabMatchmaking.instance) {
      PlayFabMatchmaking.instance = new PlayFabMatchmaking();
    }
    return PlayFabMatchmaking.instance;
  }

  /**
 * マッチメイキングチケットを作成
 * @param queueName マッチメイキングキュー名
 * @returns チケット作成結果のPromise
 */
  async createMatchmakingTicket(queueName: string = MATCHMAKING_CONFIG.QUEUE_NAME): Promise<MatchmakingResult> {
    try {
      // PlayFabにログインしているかチェック
      if (!this.auth.isLoggedIn()) {
        throw new Error('PlayFabにログインしていません');
      }

      const playerId = this.auth.getPlayerId();
      if (!playerId) {
        throw new Error('プレイヤーIDが取得できません');
      }

      logger.info('マッチメイキングチケットを作成中...', { queueName, playerId });

      // Entity Tokenと Entity情報を取得
      const entityToken = await this.getEntityToken();
      if (!entityToken) {
        throw new Error('Entity Tokenの取得に失敗しました');
      }

      if (!this.entityId || !this.entityType) {
        throw new Error('Entity情報の取得に失敗しました');
      }

      logger.debug('Entity情報を使用してマッチメイキングチケットを作成中:', {
        entityId: this.entityId,
        entityType: this.entityType
      });

      const request: CreateMatchmakingTicketRequest = {
        QueueName: queueName,
        Creator: {
          Entity: {
            Id: this.entityId,
            Type: this.entityType
          },
          // TODO: 適切に設定する
          Attributes: {
            DataObject: {
              skill: 1000, // 基本スキル値
              region: 'japan' // 地域設定
            }
          }
        },
        GiveUpAfterSeconds: MATCHMAKING_CONFIG.TIMEOUT_SECONDS
      };

      const response = await this.callPlayFabAPI('Match/CreateMatchmakingTicket', request, entityToken);

      if (response.ok) {
        const result: CreateMatchmakingTicketResult = await response.json();
        logger.debug('CreateMatchmakingTicket APIレスポンス全体:', JSON.stringify(result, null, 2));

        // PlayFab REST APIのレスポンス構造を確認
        let ticketId: string | undefined;

        if (result.data && result.data.TicketId) {
          ticketId = result.data.TicketId;
          logger.debug('TicketIdをresult.data.TicketIdから取得:', ticketId);
        } else if (result.TicketId) {
          ticketId = result.TicketId;
          logger.debug('TicketIdをresult.TicketIdから取得:', ticketId);
        } else {
          logger.error('TicketIdがレスポンスに見つかりません。レスポンス構造:', result);
          throw new Error('TicketIdがレスポンスに含まれていません');
        }

        logger.info('マッチメイキングチケット作成成功:', ticketId);
        return {
          success: true,
          ticketId: ticketId
        };
      } else {
        const error = await response.json();
        logger.error('CreateMatchmakingTicket APIエラー:', error);
        throw new Error(error.errorMessage || 'マッチメイキングチケットの作成に失敗しました');
      }
    } catch (error) {
      logger.error('マッチメイキングチケット作成例外:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'マッチメイキングチケットの作成に失敗しました'
      };
    }
  }

  /**
 * マッチメイキングチケットの状態を取得
 * @param ticketId チケットID
 * @returns チケット状態取得結果のPromise
 */
  async getMatchmakingTicket(ticketId: string): Promise<GetMatchmakingTicketResult | null> {
    try {
      const entityToken = await this.getEntityToken();
      if (!entityToken) {
        throw new Error('Entity Tokenの取得に失敗しました');
      }

      logger.debug('マッチメイキングチケット状態取得中...', ticketId);

      const request = {
        TicketId: ticketId,
        QueueName: MATCHMAKING_CONFIG.QUEUE_NAME
      };

      const response = await this.callPlayFabAPI('Match/GetMatchmakingTicket', request, entityToken);

      if (response.ok) {
        const result: GetMatchmakingTicketResult = await response.json();
        logger.debug('GetMatchmakingTicket APIレスポンス:', JSON.stringify(result, null, 2));

        // PlayFab REST APIのレスポンス構造に応じてデータを取得
        let ticketData: GetMatchmakingTicketResult;

        if (result.data) {
          // data プロパティがある場合はそちらを使用
          ticketData = {
            TicketId: result.data.TicketId,
            Status: result.data.Status,
            MatchId: result.data.MatchId,
            EstimatedWaitTimeSeconds: result.data.EstimatedWaitTimeSeconds
          };
        } else {
          // 直接プロパティがある場合はそちらを使用
          ticketData = result;
        }

        logger.debug('マッチメイキングチケット状態:', ticketData.Status);
        return ticketData;
      } else {
        logger.error('マッチメイキングチケット状態取得エラー:', await response.text());
        return null;
      }
    } catch (error) {
      logger.error('マッチメイキングチケット状態取得例外:', error);
      return null;
    }
  }

  /**
 * マッチ情報を取得
 * @param matchId マッチID
 * @param queueName キュー名
 * @returns マッチ情報取得結果のPromise
 */
  async getMatch(matchId: string, queueName: string = MATCHMAKING_CONFIG.QUEUE_NAME): Promise<MatchmakingResult> {
    try {
      const entityToken = await this.getEntityToken();
      if (!entityToken) {
        throw new Error('Entity Tokenの取得に失敗しました');
      }

      logger.info('マッチ情報取得中...', { matchId, queueName });

      const request = {
        MatchId: matchId,
        QueueName: queueName
      };

      const response = await this.callPlayFabAPI('Match/GetMatch', request, entityToken);

      logger.debug('GetMatch HTTP ステータス:', response.status);

      if (response.ok) {
        const result: GetMatchResult = await response.json();
        logger.debug('GetMatch APIレスポンス全体:', JSON.stringify(result, null, 2));

        // レスポンス構造を詳細に調査
        logger.debug('レスポンス構造調査:', {
          hasData: !!result.data,
          hasMatch: !!result.Match,
          topLevelKeys: Object.keys(result),
          dataKeys: result.data ? Object.keys(result.data) : null
        });

        // PlayFab REST APIのレスポンス構造に応じてマッチ情報を取得
        let matchDetails: PlayFabMatchDetails;

        if (result.data) {
          // result.data 自体がマッチ詳細情報
          matchDetails = {
            MatchId: result.data.MatchId,
            Members: result.data.Members,
            RegionPreferences: result.data.RegionPreferences || [],
            ArrangementString: result.data.ArrangementString
          };
          logger.debug('マッチ情報をresult.dataから取得');
        } else if (result.Match) {
          // フォールバック: 古い構造の場合
          matchDetails = result.Match;
          logger.debug('マッチ情報をresult.Matchから取得');
        } else {
          logger.error('マッチ情報の取得に失敗。レスポンス詳細:', {
            result: result,
            resultType: typeof result,
            resultConstructor: result.constructor.name,
            stringified: JSON.stringify(result, null, 2)
          });
          throw new Error('マッチ情報がレスポンスに含まれていません');
        }

        logger.info('マッチ情報取得成功:', matchDetails.MatchId);
        return {
          success: true,
          matchDetails: matchDetails
        };
      } else {
        const errorText = await response.text();
        logger.error('GetMatch API HTTPエラー:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        let errorMessage = 'マッチ情報の取得に失敗しました';
        try {
          const errorJson = JSON.parse(errorText);
          logger.error('GetMatch APIエラー詳細:', errorJson);
          if (errorJson.errorMessage) {
            errorMessage = errorJson.errorMessage;
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (parseError) {
          logger.error('エラーレスポンスのJSON解析に失敗:', parseError);
        }

        throw new Error(`${errorMessage} (HTTP ${response.status})`);
      }
    } catch (error) {
      logger.error('マッチ情報取得例外:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'マッチ情報の取得に失敗しました'
      };
    }
  }

  /**
                       * マッチメイキングをキャンセル
                       * @param ticketId チケットID
                       * @param queueName キュー名
                       * @returns キャンセル結果のPromise
                       */
  async cancelMatchmaking(ticketId: string, queueName: string = MATCHMAKING_CONFIG.QUEUE_NAME): Promise<boolean> {
    try {
      const entityToken = await this.getEntityToken();
      if (!entityToken) {
        throw new Error('Entity Tokenの取得に失敗しました');
      }

      logger.info('マッチメイキングキャンセル中...', { ticketId, queueName });

      const request = {
        TicketId: ticketId,
        QueueName: queueName
      };

      const response = await this.callPlayFabAPI('Match/CancelMatchmakingTicket', request, entityToken);

      if (response.ok) {
        logger.info('マッチメイキングキャンセル成功:', ticketId);
        return true;
      } else {
        logger.error('マッチメイキングキャンセルエラー:', await response.text());
        return false;
      }
    } catch (error) {
      logger.error('マッチメイキングキャンセル例外:', error);
      return false;
    }
  }

  /**
                       * プレイヤーIDを取得
                       * @returns プレイヤーID
                       */
  getPlayerId(): string | null {
    return this.auth.getPlayerId();
  }

  /**
                       * ログイン状態を確認
                       * @returns ログイン済みかどうか
                       */
  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  /**
       * Entity情報をリセット
       * ログイン状態が変更された場合やエラー時に実行
       */
  resetEntityInfo(): void {
    this.entityToken = null;
    this.entityId = null;
    this.entityType = null;
    logger.debug('Entity情報をリセットしました');
  }

  /**
                     * マッチメイキングの状態を継続的に監視
                     * @param ticketId チケットID
                     * @param onStatusUpdate 状態更新時のコールバック
                     * @returns マッチ成立時のマッチ情報、エラー時はnull
                     */
  async pollMatchmakingStatus(
    ticketId: string,
    onStatusUpdate?: (status: string) => void
  ): Promise<MatchmakingResult> {
    try {
      let attempts = 0;
      const maxAttempts = Math.ceil(MATCHMAKING_CONFIG.TIMEOUT_SECONDS * 1000 / MATCHMAKING_CONFIG.POLLING_INTERVAL_MS);

      while (attempts < maxAttempts) {
        const ticketResult = await this.getMatchmakingTicket(ticketId);

        if (!ticketResult) {
          await this.delay(MATCHMAKING_CONFIG.POLLING_INTERVAL_MS);
          attempts++;
          continue;
        }

        // 状態更新コールバック呼び出し
        if (onStatusUpdate) {
          onStatusUpdate(ticketResult.Status);
        }

        logger.debug(`マッチング状態確認 (試行 ${attempts + 1}/${maxAttempts}):`, ticketResult.Status);

        switch (ticketResult.Status) {
        case 'Matched':
          if (ticketResult.MatchId) {
            logger.info('マッチ成立！マッチ情報取得中...', ticketResult.MatchId);
            return await this.getMatch(ticketResult.MatchId);
          }
          break;

        case 'Canceled':
          return {
            success: false,
            error: 'マッチメイキングがキャンセルされました'
          };

        case 'Failed':
          return {
            success: false,
            error: 'マッチメイキングに失敗しました'
          };

        case 'WaitingForMatch':
        case 'WaitingForServer':
          // 継続してポーリング
          break;
        }

        await this.delay(MATCHMAKING_CONFIG.POLLING_INTERVAL_MS);
        attempts++;
      }

      return {
        success: false,
        error: 'マッチメイキングがタイムアウトしました'
      };
    } catch (error) {
      logger.error('マッチメイキング状態監視エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'マッチメイキング監視中にエラーが発生しました'
      };
    }
  }

  /**
 * マッチ成立後にSupabaseでゲームレコードを作成
 * @param matchDetails PlayFabから取得したマッチ詳細
 * @returns ゲーム作成結果
 */
  async createGameFromMatch(matchDetails: PlayFabMatchDetails): Promise<GameCreationResult> {
    try {
      // 現在のEntity IDを取得
      if (!this.entityId) {
        throw new Error('自分のEntity IDが取得できません');
      }

      const myEntityId = this.entityId;

      // 自分のPlayFabIdも取得（ログ用）
      const myPlayerId = this.auth.getPlayerId();

      logger.debug('マッチ参加者の確認:', {
        myEntityId,
        myPlayerId,
        members: matchDetails.Members
      });

      // マッチ参加者から相手プレイヤーを特定
      const members = matchDetails.Members || [];
      if (members.length !== 2) {
        throw new Error(`マッチ参加者数が異常です: ${members.length}人`);
      }

      const opponent = members.find((member) =>
        member.Entity?.Id !== myEntityId
      );

      if (!opponent) {
        throw new Error('相手プレイヤーが見つかりません');
      }

      // Entity IDをそのまま使用（変換不要）
      // DBレコードには Entity ID (title player account ID) を直接保存
      const opponentEntityId = opponent.Entity.Id;

      logger.info('プレイヤー情報の確認:', {
        myEntityId,
        myPlayerId: myPlayerId || 'N/A',
        opponentEntityId,
        opponentEntityType: opponent.Entity.Type
      });

      // ゲーム作成の重複を防ぐため、Entity IDでソートして小さい方がゲーム作成を担当
      const sortedEntityIds = [myEntityId, opponentEntityId].sort();
      const shouldCreateGame = sortedEntityIds[0] === myEntityId;

      if (!shouldCreateGame) {
        logger.info('相手プレイヤーがゲーム作成を担当します。待機中...');

        // 相手がゲーム作成するまで待機し、作成されたゲームを探す
        let attempts = 0;
        const maxAttempts = 10; // 最大10回試行（20秒）

        while (attempts < maxAttempts) {
          await this.delay(2000);

          // Entity IDベースで自分が参加しているゲームを探す
          const myGames = await this.gomokuRepository.getPlayerGames(myEntityId);

          // 相手のEntity IDが含まれているゲームを探す
          const matchedGame = myGames.find(game =>
            game.black_player_id === opponentEntityId ||
                        game.white_player_id === opponentEntityId
          );

          if (matchedGame) {
            logger.info('相手が作成したゲームが見つかりました:', {
              gameId: matchedGame.id,
              blackPlayer: matchedGame.black_player_id,
              whitePlayer: matchedGame.white_player_id
            });

            const isBlackPlayer = matchedGame.black_player_id === myEntityId;

            return {
              success: true,
              gameData: {
                ...matchedGame,
                id: matchedGame.id,
                matchId: matchDetails.MatchId,
                myPlayerId: myEntityId,  // Entity IDを使用
                opponentPlayerId: opponentEntityId,  // Entity IDを使用
                isBlackPlayer
              }
            };
          }

          attempts++;
          logger.debug(`ゲーム検索試行 ${attempts}/${maxAttempts}...`);
        }

        // ゲームが見つからない場合のフォールバック
        throw new Error('相手が作成したゲームが見つかりませんでした');
      }

      logger.info('自分がゲーム作成を担当します');

      // 先攻（黒石）プレイヤーをランダムに決定（Entity IDベース）
      const isBlackPlayer = Math.random() < 0.5;
      const blackPlayerId = isBlackPlayer ? myEntityId : opponentEntityId;
      const whitePlayerId = isBlackPlayer ? opponentEntityId : myEntityId;

      logger.info('ゲームレコード作成中...', {
        matchId: matchDetails.MatchId,
        blackPlayer: blackPlayerId,
        whitePlayer: whitePlayerId,
        myRole: isBlackPlayer ? '先攻（黒石）' : '後攻（白石）',
        gameCreator: myEntityId,
        note: 'Entity IDベースでDBレコード作成'
      });

      // Supabaseでゲームレコードを作成（Entity IDを使用）
      const gameParams: GameCreateParams = {
        blackPlayerId,  // Entity ID
        whitePlayerId   // Entity ID
      };

      const gameData = await this.gomokuRepository.createGame(gameParams);

      if (!gameData) {
        throw new Error('Supabaseでのゲーム作成に失敗しました');
      }

      logger.info('ゲーム作成成功:', {
        gameId: gameData.id,
        matchId: matchDetails.MatchId,
        blackPlayer: blackPlayerId,
        whitePlayer: whitePlayerId,
        note: 'Entity IDでDBレコード作成完了'
      });

      return {
        success: true,
        gameData: {
          ...gameData,
          matchId: matchDetails.MatchId,
          myPlayerId: myEntityId,      // Entity IDを返す
          opponentPlayerId: opponentEntityId,  // Entity IDを返す
          isBlackPlayer
        }
      };
    } catch (error) {
      logger.error('ゲーム作成エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ゲームの作成に失敗しました'
      };
    }
  }

  /**
 * マッチ情報をゲーム遷移用のデータに変換
 * @param gameData ゲーム作成結果のデータ
 * @returns ゲーム遷移用データ
 */
  createTransitionData(gameData: NonNullable<GameCreationResult['gameData']>): MatchTransitionData {
    return {
      matchId: gameData.matchId,
      myPlayerId: gameData.myPlayerId,
      opponentPlayerId: gameData.opponentPlayerId,
      isBlackPlayer: gameData.isBlackPlayer,
      gameId: gameData.id
    };
  }

  /**
 * PlayFabの初期化状態を確認
 * @returns 初期化完了のPromise
 */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // PlayFab認証の初期化を確認
      if (!this.auth.isLoggedIn()) {
        logger.warn('PlayFab認証が必要です。先にログインを実行してください。');
        return false;
      }

      this.isInitialized = true;
      logger.info('PlayFabマッチメイキング初期化完了');
      return true;
    } catch (error) {
      logger.error('PlayFabマッチメイキング初期化エラー:', error);
      return false;
    }
  }

  /**
 * Entity Tokenを取得
 * @returns Entity Token
 */
  private async getEntityToken(): Promise<string | null> {
    if (this.entityToken && this.entityId && this.entityType) {
      return this.entityToken;
    }

    try {
      // PlayFabログイン情報からセッショントークンを取得
      const loginInfo = this.auth.getLoginInfo();
      if (!loginInfo?.SessionTicket) {
        throw new Error('PlayFabセッショントークンが見つかりません。先にログインしてください。');
      }

      logger.debug('Entity Token取得中...');

      // REST APIでEntity Tokenを取得
      const url = `https://${this.titleId}.playfabapi.com/Authentication/GetEntityToken`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authentication': loginInfo.SessionTicket
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const result = await response.json();
        logger.debug('Entity Token APIレスポンス全体:', JSON.stringify(result, null, 2));

        // PlayFab REST APIのレスポンス構造を確認
        let entityToken: string | null = null;
        let entityInfo: { Id: string; Type: string } | null = null;

        if (result.data && result.data.EntityToken) {
          entityToken = result.data.EntityToken;
          // Entity情報も取得
          if (result.data.Entity) {
            entityInfo = {
              Id: result.data.Entity.Id,
              Type: result.data.Entity.Type
            };
          }
          logger.debug('Entity情報をresult.data.Entityから取得');
        } else if (result.EntityToken) {
          entityToken = result.EntityToken;
          // Entity情報も取得
          if (result.Entity) {
            entityInfo = {
              Id: result.Entity.Id,
              Type: result.Entity.Type
            };
          }
          logger.debug('Entity情報をresult.Entityから取得');
        } else {
          logger.error('Entity Tokenがレスポンスに見つかりません。レスポンス構造:', result);
          throw new Error('Entity Tokenがレスポンスに含まれていません');
        }

        if (!entityInfo) {
          logger.error('Entity情報がレスポンスに見つかりません。レスポンス構造:', result);
          throw new Error('Entity情報がレスポンスに含まれていません');
        }

        this.entityToken = entityToken;
        this.entityId = entityInfo.Id;
        this.entityType = entityInfo.Type;

        logger.debug('Entity Token取得成功', {
          entityId: this.entityId,
          entityType: this.entityType
        });

        return this.entityToken;
      } else {
        const errorText = await response.text();
        logger.error('Entity Token API HTTPエラー:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        let errorMessage = 'Entity Tokenの取得に失敗しました';
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errorMessage) {
            errorMessage = errorJson.errorMessage;
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (parseError) {
          logger.error('エラーレスポンスのJSON解析に失敗:', parseError);
        }

        throw new Error(`${errorMessage} (HTTP ${response.status})`);
      }
    } catch (error) {
      logger.error('Entity Token取得例外:', error);
      throw error; // nullを返すのではなく、例外を再スローしてエラーハンドリングを改善
    }
  }

  /**
 * PlayFab REST APIを呼び出す
 * @param endpoint APIエンドポイント
 * @param request リクエストデータ
 * @param entityToken Entity Token
 * @returns APIレスポンス
 */
  private async callPlayFabAPI(endpoint: string, request: unknown, entityToken: string): Promise<Response> {
    const url = `https://${this.titleId}.playfabapi.com/${endpoint}`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-EntityToken': entityToken
      },
      body: JSON.stringify(request)
    });
  }

  /**
 * 指定ミリ秒待機する
 * @param ms 待機時間（ミリ秒）
 */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }
} 