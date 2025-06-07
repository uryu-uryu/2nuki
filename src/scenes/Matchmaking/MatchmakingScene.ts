/**
 * マッチメイキングシーン
 * PlayFabのマッチメイキング機能を使用して対戦相手を探し、
 * マッチングが成功したらゲームを開始するシーン
 * 
 * 責務：
 * - マッチメイキングの開始・管理
 * - マッチング状態の表示とUI制御
 * - マッチング成功時のゲーム作成とシーン遷移
 * - エラーハンドリングとユーザーフィードバック
 */

import * as Phaser from 'phaser';
import { SCREEN, PADDING } from 'src/consts/layout';
import { COLORS, LARGE_TEXT_STYLE, DEFAULT_TEXT_STYLE } from 'src/consts/styles';
import { SCENE_KEYS } from 'src/consts/scenes';
import { MATCHMAKING_CONFIG, MATCHMAKING_STATUS } from 'src/consts/matchmaking';
import { PlayFabMatchmaking } from 'src/service/playfab/matchMaking/PlayFabMatchmaking';
import type { MatchmakingState, MatchTransitionData, PlayFabMatchDetails } from 'src/types/matchmaking';
import { logger } from 'src/utils/logger';
import i18next from 'src/i18n/config';
import { PlayFabAuth } from 'src/auth/PlayFab/playfabAuth';

export class MatchmakingScene extends Phaser.Scene {
  private matchmakingService!: PlayFabMatchmaking;
  private matchmakingState: MatchmakingState;

  // UI要素
  private statusText!: Phaser.GameObjects.Text;
  private elapsedTimeText!: Phaser.GameObjects.Text;
  private cancelButton!: Phaser.GameObjects.Text;
  private retryButton!: Phaser.GameObjects.Text;
  private backToMenuButton!: Phaser.GameObjects.Text;
  private loadingAnimation!: Phaser.GameObjects.Graphics;

  // タイマー
  private elapsedTimer!: Phaser.Time.TimerEvent;
  private pollingTimer!: Phaser.Time.TimerEvent;

  constructor() {
    super(SCENE_KEYS.MATCHMAKING);

    // 初期状態を設定
    this.matchmakingState = {
      status: MATCHMAKING_STATUS.IDLE,
      ticketId: null,
      matchId: null,
      elapsedTime: 0,
      error: null,
      pollingTimer: null
    };
  }

  init() {
    this.matchmakingService = PlayFabMatchmaking.getInstance();
  }

  create() {
    // 背景色を設定
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    this.createUI();
    this.startMatchmaking();
  }

  /**
           * UIを作成
           */
  private createUI(): void {
    // タイトル
    this.add.text(
      SCREEN.CENTER_X, 100,
      i18next.t('matchmaking.title'),
      {
        ...LARGE_TEXT_STYLE,
        color: COLORS.TEXT.PRIMARY
      }
    ).setOrigin(0.5);

    // ステータステキスト
    this.statusText = this.add.text(
      SCREEN.CENTER_X, 200,
      i18next.t('matchmaking.searching'),
      {
        ...DEFAULT_TEXT_STYLE,
        color: COLORS.TEXT.PRIMARY,
        align: 'center'
      }
    ).setOrigin(0.5);

    // 経過時間テキスト
    this.elapsedTimeText = this.add.text(
      SCREEN.CENTER_X, 250,
      i18next.t('matchmaking.elapsedTime', { time: '0' }),
      {
        ...DEFAULT_TEXT_STYLE,
        color: COLORS.TEXT.SECONDARY
      }
    ).setOrigin(0.5);

    // ローディングアニメーション
    this.createLoadingAnimation();

    // ボタン作成
    this.createButtons();

    // 初期状態に応じてUIを更新
    this.updateUI();
  }

  /**
           * ローディングアニメーションを作成
           */
  private createLoadingAnimation(): void {
    this.loadingAnimation = this.add.graphics();
    this.loadingAnimation.setPosition(SCREEN.CENTER_X, 320);

    // 回転アニメーション
    this.tweens.add({
      targets: this.loadingAnimation,
      rotation: Math.PI * 2,
      duration: 1500,
      repeat: -1,
      ease: 'Linear'
    });

    this.drawLoadingCircle();
  }

  /**
           * ローディング円を描画
           */
  private drawLoadingCircle(): void {
    this.loadingAnimation.clear();
    this.loadingAnimation.lineStyle(4, 0x4dabf7); // 青色（数値）
    this.loadingAnimation.strokeCircle(0, 0, 20);
    this.loadingAnimation.lineStyle(4, 0x868e96); // グレー色（数値）
    this.loadingAnimation.arc(0, 0, 20, 0, Math.PI, false);
    this.loadingAnimation.strokePath();
  }

  /**
           * ボタンを作成
           */
  private createButtons(): void {
    // キャンセルボタン
    this.cancelButton = this.add.text(
      SCREEN.CENTER_X - 100, 400,
      i18next.t('matchmaking.cancel'),
      {
        ...DEFAULT_TEXT_STYLE,
        color: COLORS.TEXT.WHITE,
        backgroundColor: COLORS.BUTTON.SECONDARY,
        padding: PADDING.MEDIUM
      }
    ).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.cancelMatchmaking());

    // 再試行ボタン
    this.retryButton = this.add.text(
      SCREEN.CENTER_X, 400,
      i18next.t('matchmaking.retry'),
      {
        ...DEFAULT_TEXT_STYLE,
        color: COLORS.TEXT.WHITE,
        backgroundColor: COLORS.BUTTON.PRIMARY,
        padding: PADDING.MEDIUM
      }
    ).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.retryMatchmaking());

    // メニューに戻るボタン
    this.backToMenuButton = this.add.text(
      SCREEN.CENTER_X + 100, 400,
      i18next.t('matchmaking.backToMenu'),
      {
        ...DEFAULT_TEXT_STYLE,
        color: COLORS.TEXT.WHITE,
        backgroundColor: COLORS.BUTTON.SECONDARY,
        padding: PADDING.MEDIUM
      }
    ).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.goBackToMenu());
  }

  /**
           * マッチメイキングを開始
           */
  private async startMatchmaking(): Promise<void> {
    try {
      logger.info('マッチメイキングを開始します');

      // ログイン状態をチェック
      if (!this.matchmakingService.isLoggedIn()) {
        logger.info('PlayFabにログインしていません。自動ログインを実行します...');
        this.statusText.setText('PlayFabにログイン中...');

        try {
          // PlayFabAuth インスタンスを取得して自動ログイン
          const auth = (this.matchmakingService as unknown as { auth: PlayFabAuth }).auth;
          await auth.loginAnonymously();
          logger.info('PlayFab自動ログイン成功');
        } catch (loginError) {
          this.setError('PlayFabへの自動ログインに失敗しました: ' + (loginError instanceof Error ? loginError.message : '不明なエラー'));
          return;
        }
      }

      // デバッグ: ログイン情報の詳細を確認
      const loginInfo = (this.matchmakingService as unknown as { auth: PlayFabAuth }).auth.getLoginInfo();
      logger.debug('PlayFabログイン情報:', JSON.stringify(loginInfo, null, 2));

      if (!loginInfo?.SessionTicket) {
        this.setError('SessionTicketが取得できません。ログイン状態を確認してください。');
        return;
      }

      logger.debug('SessionTicket確認済み:', loginInfo.SessionTicket.substring(0, 20) + '...');

      // PlayFab Multiplayer SDKの初期化
      const initResult = await this.matchmakingService.initialize();
      if (!initResult) {
        this.setError('PlayFab Multiplayer SDKの初期化に失敗しました');
        return;
      }

      this.matchmakingState.status = MATCHMAKING_STATUS.SEARCHING;
      this.matchmakingState.elapsedTime = 0;
      this.matchmakingState.error = null;

      // マッチメイキングチケットを作成
      const result = await this.matchmakingService.createMatchmakingTicket();

      if (!result.success) {
        this.setError(result.error || 'マッチメイキングチケットの作成に失敗しました');
        return;
      }

      if (!result.ticketId) {
        this.setError('チケットIDが取得できませんでした');
        return;
      }

      // チケットIDを状態に保存
      this.matchmakingState.ticketId = result.ticketId;

      // 実際のマッチング監視を開始
      this.startMatchmakingPolling();
      this.startTimers();
      this.updateUI();
    } catch (error) {
      logger.error('マッチメイキング開始エラー:', error);
      this.setError(error instanceof Error ? error.message : 'マッチメイキングの開始に失敗しました');
    }
  }

  /**
         * マッチメイキング状態の監視を開始
         */
  private async startMatchmakingPolling(): Promise<void> {
    try {
      if (!this.matchmakingState.ticketId) {
        this.setError('チケットIDが無効です');
        return;
      }

      // 状態更新コールバックを定義
      const onStatusUpdate = (status: string) => {
        logger.debug('マッチング状態更新:', status);

        switch (status) {
        case 'WaitingForPlayers':
        case 'WaitingForMatch':
        case 'WaitingForServer':
          // 検索中状態を維持
          break;
        case 'Matched':
          this.matchmakingState.status = MATCHMAKING_STATUS.MATCHED;
          this.updateUI();
          break;
        }
      };

      // 実際のマッチング監視を開始
      const matchResult = await this.matchmakingService.pollMatchmakingStatus(
        this.matchmakingState.ticketId,
        onStatusUpdate
      );

      if (matchResult.success && matchResult.matchDetails) {
        await this.onMatchFound(matchResult.matchDetails);
      } else {
        this.setError(matchResult.error || 'マッチメイキングに失敗しました');
      }
    } catch (error) {
      logger.error('マッチメイキング監視エラー:', error);
      this.setError(error instanceof Error ? error.message : 'マッチメイキング中にエラーが発生しました');
    }
  }

  /**
         * マッチ成立時の処理
         * @param matchDetails PlayFabから取得したマッチ詳細
         */
  private async onMatchFound(matchDetails: PlayFabMatchDetails): Promise<void> {
    try {
      logger.info('マッチが成立しました！ゲームを作成中...', matchDetails.MatchId);

      this.matchmakingState.status = MATCHMAKING_STATUS.MATCHED;
      this.matchmakingState.matchId = matchDetails.MatchId;
      this.stopTimers();
      this.updateUI();

      // ステータステキストを「ゲーム作成中」に更新
      this.statusText.setText(i18next.t('matchmaking.creatingGame'));

      // Supabaseでゲームレコードを作成
      const gameResult = await this.matchmakingService.createGameFromMatch(matchDetails);

      if (!gameResult.success) {
        this.setError(gameResult.error || 'ゲームの作成に失敗しました');
        return;
      }

      // ステータステキストを「ゲーム開始中」に更新
      this.statusText.setText(i18next.t('matchmaking.startingGame'));

      // ゲーム遷移データを準備
      if (!gameResult.gameData) {
        this.setError('ゲームデータの取得に失敗しました');
        return;
      }

      const transitionData: MatchTransitionData = this.matchmakingService.createTransitionData(gameResult.gameData);

      logger.info('ゲームシーンに遷移します', {
        gameId: transitionData.gameId,
        matchId: transitionData.matchId,
        role: transitionData.isBlackPlayer ? '先攻（黒石）' : '後攻（白石）'
      });

      // 少し待ってからシーン遷移（UX向上のため）
      await this.delay(1000);

      // ゲームシーンに遷移（データを引き継ぎ）
      this.scene.start(SCENE_KEYS.GOMOKU_GAME, transitionData);
    } catch (error) {
      logger.error('マッチ成立後の処理エラー:', error);
      this.setError(error instanceof Error ? error.message : 'ゲームの開始に失敗しました');
    }
  }

  /**
           * タイマーを開始
           */
  private startTimers(): void {
    // 経過時間カウンター
    this.elapsedTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.matchmakingState.elapsedTime++;
        this.updateElapsedTimeDisplay();

        // タイムアウトチェック
        if (this.matchmakingState.elapsedTime >= MATCHMAKING_CONFIG.TIMEOUT_SECONDS) {
          this.onMatchmakingTimeout();
        }
      },
      loop: true
    });
  }

  /**
           * マッチメイキングをキャンセル
           */
  private async cancelMatchmaking(): Promise<void> {
    try {
      logger.info('マッチメイキングをキャンセルします');

      if (this.matchmakingState.ticketId) {
        await this.matchmakingService.cancelMatchmaking(this.matchmakingState.ticketId);
      }

      this.matchmakingState.status = MATCHMAKING_STATUS.CANCELLED;
      this.stopTimers();
      this.updateUI();
    } catch (error) {
      logger.error('マッチメイキングキャンセルエラー:', error);
    }
  }

  /**
           * マッチメイキングを再試行
           */
  private retryMatchmaking(): void {
    this.resetState();
    this.startMatchmaking();
  }

  /**
           * メインメニューに戻る
           */
  private goBackToMenu(): void {
    this.stopTimers();
    this.scene.start(SCENE_KEYS.MAIN_MENU);
  }

  /**
           * マッチメイキングタイムアウト処理
           */
  private onMatchmakingTimeout(): void {
    logger.info('マッチメイキングがタイムアウトしました');
    this.matchmakingState.status = MATCHMAKING_STATUS.TIMEOUT;
    this.stopTimers();
    this.updateUI();
  }

  /**
           * エラー状態を設定
           * @param error エラーメッセージ
           */
  private setError(error: string): void {
    logger.error('マッチメイキングエラー:', error);
    this.matchmakingState.status = MATCHMAKING_STATUS.ERROR;
    this.matchmakingState.error = error;
    this.stopTimers();
    this.updateUI();
  }

  /**
           * タイマーを停止
           */
  private stopTimers(): void {
    if (this.elapsedTimer) {
      this.elapsedTimer.remove();
    }
    if (this.pollingTimer) {
      this.pollingTimer.remove();
    }
  }

  /**
           * 状態をリセット
           */
  private resetState(): void {
    this.stopTimers();
    this.matchmakingState = {
      status: MATCHMAKING_STATUS.IDLE,
      ticketId: null,
      matchId: null,
      elapsedTime: 0,
      error: null,
      pollingTimer: null
    };
  }

  /**
           * UIを更新
           */
  private updateUI(): void {
    this.updateStatusDisplay();
    this.updateButtonVisibility();
    this.updateLoadingAnimation();
  }

  /**
           * ステータス表示を更新
           */
  private updateStatusDisplay(): void {
    switch (this.matchmakingState.status) {
    case MATCHMAKING_STATUS.SEARCHING:
      this.statusText.setText(i18next.t('matchmaking.searching'));
      this.statusText.setColor(COLORS.TEXT.PRIMARY);
      break;
    case MATCHMAKING_STATUS.MATCHED:
      this.statusText.setText(i18next.t('matchmaking.found'));
      this.statusText.setColor(COLORS.BUTTON.PRIMARY);
      break;
    case MATCHMAKING_STATUS.TIMEOUT:
      this.statusText.setText(i18next.t('matchmaking.timeout'));
      this.statusText.setColor(COLORS.TEXT.SECONDARY);
      break;
    case MATCHMAKING_STATUS.ERROR:
      this.statusText.setText(i18next.t('matchmaking.error'));
      this.statusText.setColor('#ff4444');
      break;
    case MATCHMAKING_STATUS.CANCELLED:
      this.statusText.setText('キャンセルされました');
      this.statusText.setColor(COLORS.TEXT.SECONDARY);
      break;
    }
  }

  /**
           * ボタンの表示状態を更新
           */
  private updateButtonVisibility(): void {
    const isSearching = this.matchmakingState.status === MATCHMAKING_STATUS.SEARCHING;
    const finishedStatuses = [
      MATCHMAKING_STATUS.MATCHED,
      MATCHMAKING_STATUS.TIMEOUT,
      MATCHMAKING_STATUS.ERROR,
      MATCHMAKING_STATUS.CANCELLED
    ] as const;
    const isFinished = finishedStatuses.includes(this.matchmakingState.status as typeof finishedStatuses[number]);

    this.cancelButton.setVisible(isSearching);
    this.retryButton.setVisible(isFinished && this.matchmakingState.status !== MATCHMAKING_STATUS.MATCHED);
    this.backToMenuButton.setVisible(isFinished);
  }

  /**
           * ローディングアニメーションの表示状態を更新
           */
  private updateLoadingAnimation(): void {
    const isSearching = this.matchmakingState.status === MATCHMAKING_STATUS.SEARCHING;
    this.loadingAnimation.setVisible(isSearching);
  }

  /**
           * 経過時間表示を更新
           */
  private updateElapsedTimeDisplay(): void {
    this.elapsedTimeText.setText(
      i18next.t('matchmaking.elapsedTime', { time: this.matchmakingState.elapsedTime.toString() })
    );
  }

  /**
           * シーン破棄時の処理
           */
  destroy() {
    this.stopTimers();
    // Phaserシーンのdestroyメソッドは存在しないため、代わりにshutdownを使用
  }

  /**
         * 指定ミリ秒待機する
         * @param ms 待機時間（ミリ秒）
         */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, ms));
  }
} 