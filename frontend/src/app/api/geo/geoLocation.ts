// Geolocation取得ロジック

// 下記のコメントは開発中のみ、削除する予定
// 主な役割：GPS取得と距離計算ロジック
// GPSTracker クラス
// startTracking()：位置追跡を開始し、初期座標を取得し、watchPosition で後続の位置変化を監視する。
// 位置情報が更新されるたびに：
// 新しい座標（currentPosition）を取得。
// 前回の座標（previousPosition）との距離を（ハーサイン公式で）比較する。
// 精度（accuracy）が50未満、かつ距離が max(5, accuracy/2) を超える場合のみ、totalDistance に加算する。
// コールバック（onDistanceUpdate）を通じて、現在の累積距離をリアルタイムに返す。
// 精度フィルタ
// 精度（accuracy）が50mを超える位置データはノイズとみなして無視する。

// 距離計算関数（Haversine formula）
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // 地球の半径（メートル）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // メートル単位
};

// GPS位置情報の型定義
export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

// GPS追跡クラス
export class GPSTracker {
  private watchId: number | null = null;

  private currentPosition: GPSPosition | null = null;

  private previousPosition: GPSPosition | null = null; // 前回位置を記録（路徑距離計算用）

  private startPosition: GPSPosition | null = null; // 開始位置を記録（参考用）

  private totalDistance: number = 0;

  private onPositionUpdate: ((position: GPSPosition) => void) | null = null;

  private onDistanceUpdate: ((distance: number) => void) | null = null;

  private onError: ((error: string) => void) | null = null;

  // デバッグ用：位置更新回数を記録
  private positionUpdateCount: number = 0;

  // 定時更新用：タイマーID
  private updateTimerId: NodeJS.Timeout | null = null;

  // 定時更新が使用中かどうか
  private usingTimerUpdate: boolean = false;

  constructor() {
    this.checkGeolocationSupport();
  }

  // Geolocationサポートチェック
  private checkGeolocationSupport(): boolean {
    if (!navigator.geolocation) {
      console.error('[GPSTracker] Geolocationがサポートされていません');
      if (this.onError) {
        this.onError('お使いのブラウザはGPS機能をサポートしていません');
      }
      return false;
    }
    console.log('[GPSTracker] Geolocationサポート確認済み');
    return true;
  }

  // 位置情報更新コールバック設定
  public setPositionCallback(callback: (position: GPSPosition) => void): void {
    this.onPositionUpdate = callback;
    console.log('[GPSTracker] 位置情報更新コールバック設定完了');
  }

  // 距離更新コールバック設定
  public setDistanceCallback(callback: (distance: number) => void): void {
    this.onDistanceUpdate = callback;
    console.log('[GPSTracker] 距離更新コールバック設定完了');
  }

  // エラーコールバック設定
  public setErrorCallback(callback: (error: string) => void): void {
    this.onError = callback;
    console.log('[GPSTracker] エラーコールバック設定完了');
  }

  // 定時更新方式：タイマーを使用してgetCurrentPositionを定期実行
  private startTimerUpdate(): void {
    console.log('[GPSTracker] 定時更新方式開始：タイマーによるGPS取得');
    this.usingTimerUpdate = true;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 1000, // 1秒以内のキャッシュは使用可能
    };

    // 3分間隔で位置情報を取得
    this.updateTimerId = setInterval(() => {
      console.log('[GPSTracker] 定時更新方式：getCurrentPosition実行中...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[GPSTracker] 定時更新方式：位置情報取得成功', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });

          // 前回位置を保存
          this.previousPosition = this.currentPosition;

          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          if (this.onPositionUpdate) {
            this.onPositionUpdate(this.currentPosition);
          }

          // 距離計算処理（路徑距離）
          this.calculatePathDistance();
        },
        (error) => {
          console.error('[GPSTracker] 定時更新方式：位置情報取得エラー', {
            code: error.code,
            message: error.message,
          });
        },
        options
      );
    }, 180000); // 3分間隔（180秒）
  }

  // 路徑距離の計算（前回位置からの累積）
  private calculatePathDistance(): void {
    if (this.previousPosition && this.currentPosition) {
      // 時間間隔計算
      const timeInterval =
        this.currentPosition.timestamp - this.previousPosition.timestamp;
      const timeIntervalSeconds = timeInterval / 1000;

      console.log('[GPSTracker] 路徑距離計算開始', {
        previous: {
          lat: this.previousPosition.latitude,
          lng: this.previousPosition.longitude,
          accuracy: this.previousPosition.accuracy,
          time: new Date(this.previousPosition.timestamp).toLocaleTimeString(),
        },
        current: {
          lat: this.currentPosition.latitude,
          lng: this.currentPosition.longitude,
          accuracy: this.currentPosition.accuracy,
          time: new Date(this.currentPosition.timestamp).toLocaleTimeString(),
        },
        timeInterval: `${timeIntervalSeconds.toFixed(1)}秒`,
      });

      // 精度50m超はノイズとみなして無視（路徑距離なので少し厳しく）
      if (this.currentPosition.accuracy > 50) {
        console.log(
          '[GPSTracker] 精度が低すぎるためスキップ',
          `${this.currentPosition.accuracy.toFixed(1)}m > 50m`
        );
        return;
      }

      const distance = calculateDistance(
        this.previousPosition.latitude,
        this.previousPosition.longitude,
        this.currentPosition.latitude,
        this.currentPosition.longitude
      );

      // 3分間隔なので、より緩い距離しきい値を設定
      // 精度が良い場合は10m、悪い場合でも最大30m
      const threshold = Math.min(
        Math.max(10, this.currentPosition.accuracy / 2),
        30
      );

      // 速度計算（異常な移動を検出）
      const speed =
        timeIntervalSeconds > 0 ? (distance / timeIntervalSeconds) * 3.6 : 0; // km/h

      console.log('[GPSTracker] 路徑距離計算結果', {
        distance: `${distance.toFixed(2)}m`,
        threshold: `${threshold.toFixed(2)}m`,
        accuracy: `${this.currentPosition.accuracy.toFixed(1)}m`,
        speed: `${speed.toFixed(1)}km/h`,
        willAdd: distance > threshold && speed < 15,
        currentTotal: `${this.totalDistance.toFixed(2)}m`,
      });

      // 異常に高速な移動（15km/h以上）は除外（散歩なので）
      if (speed > 15) {
        console.log(
          '[GPSTracker] 異常に高速な移動のためスキップ',
          `${speed.toFixed(1)}km/h`
        );
        return;
      }

      if (distance > threshold) {
        this.totalDistance += distance;
        console.log('[GPSTracker] 路徑距離追加', {
          addedDistance: `${distance.toFixed(2)}m`,
          totalDistance: `${this.totalDistance.toFixed(2)}m`,
          newTotal: `${this.totalDistance.toFixed(0)}m`,
        });

        if (this.onDistanceUpdate) {
          this.onDistanceUpdate(this.totalDistance);
        }
      } else {
        console.log('[GPSTracker] 距離が小さすぎるためスキップ', {
          distance: `${distance.toFixed(2)}m`,
          threshold: `${threshold.toFixed(2)}m`,
          reason: distance <= threshold ? '距離不足' : 'その他',
        });
      }
    } else if (!this.previousPosition) {
      console.log('[GPSTracker] 初回位置設定、距離計算はスキップ');
    } else {
      console.log('[GPSTracker] 現在位置が取得できていません');
    }
  }

  // GPS追跡開始
  public startTracking(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.checkGeolocationSupport()) {
        resolve(false);
        return;
      }

      console.log('[GPSTracker] GPS追跡開始');

      const options: PositionOptions = {
        enableHighAccuracy: true, // 高精度モード
        timeout: 10000, // 10秒タイムアウト
        maximumAge: 0, // キャッシュされた位置情報を使用しない
      };

      // 現在位置を取得
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[GPSTracker] 初期位置取得成功', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });

          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          // 開始位置を設定
          this.startPosition = { ...this.currentPosition };
          // 初回は前回位置をnullにして、最初の移動から計算開始
          this.previousPosition = null;

          if (this.onPositionUpdate) {
            this.onPositionUpdate(this.currentPosition);
          }

          // watchPosition開始前のデバッグログ
          console.log('[GPSTracker] watchPosition開始...');
          this.positionUpdateCount = 0;

          // 位置情報の監視を開始
          this.watchId = navigator.geolocation.watchPosition(
            (watchPosition) => {
              this.positionUpdateCount += 1;
              console.log(
                `[GPSTracker] watchPositionコールバック呼び出し #${this.positionUpdateCount}`,
                {
                  lat: watchPosition.coords.latitude,
                  lng: watchPosition.coords.longitude,
                  accuracy: watchPosition.coords.accuracy,
                  timestamp: new Date(
                    watchPosition.timestamp
                  ).toLocaleTimeString(),
                }
              );

              // 前回位置を保存
              this.previousPosition = this.currentPosition;

              this.currentPosition = {
                latitude: watchPosition.coords.latitude,
                longitude: watchPosition.coords.longitude,
                accuracy: watchPosition.coords.accuracy,
                timestamp: watchPosition.timestamp,
              };

              if (this.onPositionUpdate) {
                this.onPositionUpdate(this.currentPosition);
              }

              // 距離計算処理（路徑距離）
              this.calculatePathDistance();
            },
            (error) => {
              console.error('[GPSTracker] watchPositionエラー', {
                code: error.code,
                message: error.message,
                callCount: this.positionUpdateCount,
              });

              // watchPositionが失敗した場合、定時更新方式を開始
              if (!this.usingTimerUpdate) {
                console.log(
                  '[GPSTracker] watchPosition失敗、定時更新方式に切り替え'
                );
                this.startTimerUpdate();
              }

              if (this.onError) {
                this.onError(
                  '位置情報の監視に失敗しました（定時更新方式を使用中）'
                );
              }
            },
            options
          );

          console.log('[GPSTracker] watchPosition設定完了', {
            watchId: this.watchId,
          });

          // 30秒後にwatchPositionが呼ばれていない場合、定時更新方式に切り替え
          setTimeout(() => {
            if (this.positionUpdateCount === 0 && !this.usingTimerUpdate) {
              console.warn(
                '[GPSTracker] 30秒間watchPositionが呼ばれていません、定時更新方式に切り替え'
              );
              this.startTimerUpdate();
            }
          }, 30000);

          resolve(true);
        },
        (error) => {
          console.error('[GPSTracker] 初期位置取得エラー', {
            code: error.code,
            message: error.message,
            userAgent: navigator.userAgent,
          });

          let errorMessage = '位置情報の取得に失敗しました';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                '位置情報の許可が拒否されました。設定で許可してください。';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                '位置情報が利用できません（Wi-Fiや位置情報サービスを確認してください）。';
              break;
            case error.TIMEOUT:
              errorMessage = '位置情報の取得がタイムアウトしました。';
              break;
            default:
              errorMessage = `不明なエラーが発生しました（code: ${error.code}）`;
              break;
          }
          if (this.onError) {
            this.onError(errorMessage);
          }
          resolve(false);
        },
        options
      );
    });
  }

  // GPS追跡停止
  public stopTracking(): void {
    console.log('[GPSTracker] GPS追跡停止');

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('[GPSTracker] watchPosition停止');
    }

    if (this.updateTimerId) {
      clearInterval(this.updateTimerId);
      this.updateTimerId = null;
      console.log('[GPSTracker] 定時更新方式タイマー停止');
    }

    this.usingTimerUpdate = false;
    this.positionUpdateCount = 0;
  }

  // 現在の総距離を取得
  public getTotalDistance(): number {
    return this.totalDistance;
  }

  // 現在の位置を取得
  public getCurrentPosition(): GPSPosition | null {
    return this.currentPosition;
  }

  // 距離をリセット
  public resetDistance(): void {
    console.log('[GPSTracker] 距離リセット');
    this.totalDistance = 0;
    this.startPosition = null;
    this.previousPosition = null;
  }

  // 追跡中かどうかを確認
  public isTracking(): boolean {
    return this.watchId !== null || this.updateTimerId !== null;
  }

  // デバッグ情報を取得
  public getDebugInfo(): {
    watchId: number | null;
    positionUpdateCount: number;
    usingTimerUpdate: boolean;
    totalDistance: number;
  } {
    return {
      watchId: this.watchId,
      positionUpdateCount: this.positionUpdateCount,
      usingTimerUpdate: this.usingTimerUpdate,
      totalDistance: this.totalDistance,
    };
  }
}

// ユーティリティ関数：位置情報の許可状態を確認
export const checkLocationPermission = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        resolve(true);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve(false);
        } else {
          resolve(true); // 他のエラーは一時的なものとして許可ありとみなす
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });

// ユーティリティ関数：位置情報の精度レベルを取得
export const getAccuracyLevel = (accuracy: number): string => {
  if (accuracy <= 5) return '非常に高精度';
  if (accuracy <= 10) return '高精度';
  if (accuracy <= 20) return '中精度';
  if (accuracy <= 50) return '低精度';
  return '非常に低精度';
};
