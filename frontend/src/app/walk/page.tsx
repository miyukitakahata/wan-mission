'use client';

import { useState, useEffect, useCallback } from 'react';
// import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
// import { ArrowLeft, Play, Square, Clock } from 'lucide-react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GPSTracker } from '@/app/api/geo/geoLocation';
import { saveWalkRecord } from '@/app/api/walk_api/walkApi';
import DogWalkAnimation from '@/components/ui/dog-walk-animation';

export default function WalkPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth(); // 認証情報を取得
  const [isWalking, setIsWalking] = useState(false);
  const [walkTime, setWalkTime] = useState(0);
  const [walkDistance, setWalkDistance] = useState(0);
  const [walkTimer, setWalkTimer] = useState<NodeJS.Timeout | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: '',
    description: '',
  });

  const [careSettingId, setCareSettingId] = useState<number | null>(null);

  // GPS関連の状態管理
  const [gpsTracker] = useState(() => new GPSTracker());
  // const [gpsStatus, setGpsStatus] = useState('準備中');

  // 時間フォーマット関数
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Firebase認証トークンを取得するヘルパー関数（リファクタリング）
  const getFirebaseToken = useCallback(async (): Promise<string> => {
    if (!currentUser) {
      throw new Error('認証トークンが取得できませんでした');
    }
    const token = await currentUser.getIdToken();
    return token;
  }, [currentUser]);

  // 認証状態をチェックするヘルパー関数
  const isAuthenticated = (): boolean => !loading && currentUser !== null;

  // 認証状態は下記のreturn文で適切に処理されるため、自動リダイレクトは不要
  // useEffect(() => {
  //   if (!loading && !currentUser) {
  //     router.push('/onboarding/login');
  //   }
  // }, [currentUser, loading, router]);

  // コンポーネントマウント時にGPSTrackerを設定
  useEffect(() => {
    // 距離更新コールバック設定
    gpsTracker.setDistanceCallback((distance: number) => {
      setWalkDistance(distance);
    });

    // エラーコールバック設定
    gpsTracker.setErrorCallback((error: string) => {
      console.error('GPS エラー:', error);
      // setGpsStatus(`エラー: ${error}`);

      // エラーメッセージを日本語に変換
      let userFriendlyMessage = '';
      if (error.includes('位置情報の許可が拒否されました')) {
        userFriendlyMessage =
          'ばしょのじょうほうの きょかを おねがいします。\n\nせっていがめん → ぷらいばしー → ばしょのじょうほう → このあぷりをONにしてね！';
      } else if (error.includes('位置情報が利用できません')) {
        userFriendlyMessage =
          'ばしょのじょうほうが つかえません。\n\n【かいけつほうほう】\n1. そとやおにわに でてみてね\n2. でんわのせっていで「ばしょさーびす」をONにしてね\n3. ぶらうざのせっていで「ばしょのきょか」をONにしてね\n4. Wi-Fiをきって、もばいるでーたにしてみてね\n5. ぶらうざのきゃっしゅをくりあしてみてね\n\n※しつないや ビルのなかでは GPSが つかいにくいです';
      } else if (error.includes('タイムアウト')) {
        userFriendlyMessage =
          'ばしょのじょうほうの しゅとくに じかんがかかりすぎました。\n\n【ためしてみて】\n1. でんぱのよいばしょに いどうしてね\n2. そとやまどぎわで ためしてみてね\n3. Wi-Fiを きりかえてみてね';
      } else {
        userFriendlyMessage =
          'ばしょのじょうほうで もんだいが おきました。\n\n【ためしてみて】\n1. あぷりをさいきどうしてみてね\n2. ぶらうざをさいきどうしてみてね\n3. でばいすをさいきどうしてみてね';
      }

      // GPS開始中の場合のみダイアログを表示（散歩状態は維持）
      setIsWalking((currentIsWalking) => {
        if (currentIsWalking) {
          setDialogContent({
            title: 'ばしょのもんだい',
            description: `${userFriendlyMessage}\n\n【おしらせ】\nじかんは そのまま けいぞくします。\nGPSがなおったら、きょりも きろくされるよ！`,
          });
          setShowDialog(true);
          // 散歩状態は維持し、タイマーも継続させる
        }
        return currentIsWalking; // 散歩状態を維持
      });
    });

    // 位置更新コールバック設定
    gpsTracker.setPositionCallback((position) => {
      console.log(`GPS精度: ${position.accuracy.toFixed(1)}m`);
      // setGpsStatus(`GPS精度: ${position.accuracy.toFixed(1)}m`);
    });

    return () => {
      // クリーンアップ
      if (gpsTracker.isTracking()) {
        gpsTracker.stopTracking();
      }
    };
  }, [gpsTracker]);

  useEffect(() => {
    const fetchCareSettingId = async () => {
      // 認証状態をチェック - loadingが完了してからのみ実行
      if (loading) {
        console.log('認証状態確認中...');
        return;
      }

      if (!currentUser) {
        console.log('認証が必要です - ケア設定取得をスキップ');
        return;
      }

      try {
        const token = await getFirebaseToken();

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

        // care_settings/meエンドポイントを使用してケア設定を直接取得
        const careRes = await fetch(`${API_BASE_URL}/api/care_settings/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!careRes.ok) throw new Error('お世話設定の取得に失敗しました');

        const careSetting = await careRes.json();
        setCareSettingId(careSetting.id);
        console.log('ケア設定ID取得成功:', careSetting.id);
      } catch (err) {
        console.error('[WalkPage] careSettingIdの取得エラー:', err);
        // 認証エラーの場合は適切なエラーメッセージを表示
        if (err instanceof Error && err.message.includes('認証トークン')) {
          console.error('Firebase認証が必要です');
          // 自動リダイレクトは行わない（UIでハンドリング）
        }
      }
    };

    fetchCareSettingId();
  }, [currentUser, loading, router, getFirebaseToken]);

  const startWalk = async () => {
    setIsWalking(true);
    setWalkTime(0);
    setWalkDistance(0);
    // setGpsStatus('GPS初期化中...');

    try {
      // 事前に位置情報の許可状態をチェック（参考情報として）
      let permissionState = 'unknown';
      if (navigator.permissions) {
        try {
          const permission = await navigator.permissions.query({
            name: 'geolocation',
          });
          permissionState = permission.state;
          console.log('位置情報許可状態:', permission.state);

          // 明確に拒否されている場合は、ユーザーに情報を提供
          if (permission.state === 'denied') {
            console.log('位置情報が拒否されていますが、GPS追跡を試行します');
            setDialogContent({
              title: 'ばしょのきょかをかくにん',
              description:
                'ばしょのじょうほうが きょかされていないようです。\n\nもしきょかのがめんがでたら、「きょか」をおしてね！\n\nきょかされていない場合、せっていがめんでONにしてね！',
            });
            setShowDialog(true);

            // 3秒後にダイアログを閉じて、GPS追跡を試行
            setTimeout(() => {
              setShowDialog(false);
            }, 3000);

            // 少し待ってからGPS追跡を試行
            await new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, 1000);
            });
          }
        } catch (permissionError) {
          console.log('Permission API not supported:', permissionError);
        }
      }

      // GPS追跡開始（許可状態に関わらず試行）
      console.log('GPS追跡開始準備中...');
      const trackingStarted = await gpsTracker.startTracking();

      if (trackingStarted) {
        console.log('GPS追跡開始成功');
        // setGpsStatus('GPS追跡開始');

        // 時間カウンタ開始
        const timer = setInterval(() => {
          setWalkTime((prev) => prev + 1);
        }, 1000);
        setWalkTimer(timer);

        setDialogContent({
          title: 'おさんぽかいし！',
          description: 'きをつけて、たのしくおさんぽしてね！',
        });
        setShowDialog(true);
      } else {
        // GPS開始失敗の場合
        setIsWalking(false);
        console.error('GPS初期化失敗');
        // setGpsStatus('GPS初期化失敗');

        // 許可状態に応じたエラーメッセージを表示
        let errorTitle = 'ばしょがわからないよ';
        let errorDescription =
          'ばしょのじょうほうが うまくとれなかったみたい。\n\n1. ばしょのじょうほうがゆるされているかかくにんしてね\n2. Wi-Fiやもばいるでーたがつながっているかみてね\n3. ばしょさーびすがONになっているかみてね\n\nそれでもだめなら、もういちどためしてみてね！';

        if (permissionState === 'denied') {
          errorTitle = 'ばしょのきょかがひつよう';
          errorDescription =
            'ばしょのじょうほうの きょかが ひつようです。\n\nせっていがめん → ぷらいばしー → ばしょのじょうほう → このあぷりをONにしてね！\n\nそのあと、ぺーじをさいよみこみしてね！';
        }

        setDialogContent({
          title: errorTitle,
          description: errorDescription,
        });
        setShowDialog(true);
      }
    } catch (error) {
      console.error('散歩開始エラー:', error);
      setIsWalking(false);
      // setGpsStatus('開始エラー');
      setDialogContent({
        title: 'えらーがおきました',
        description:
          'よくわからないえらーがおきました。\n\n1. あぷりをさいきどうしてみてね\n2. ぶらうざをさいきどうしてみてね\n3. でばいすをさいきどうしてみてね',
      });
      setShowDialog(true);
    }
  };

  const endWalk = async () => {
    // 認証状態をチェック
    if (!isAuthenticated()) {
      console.error('認証が必要です');
      setDialogContent({
        title: 'にんしょうエラー',
        description: 'ログインしていないため、データを保存できませんでした。',
      });
      setShowDialog(true);
      return;
    }

    // タイマー停止
    if (walkTimer) {
      clearInterval(walkTimer);
    }

    // GPS追跡停止
    gpsTracker.stopTracking();
    console.log('GPS追跡停止');
    // setGpsStatus('GPS停止');
    setIsWalking(false);

    // 日本時間の日付を取得する関数
    const getJapanDate = () => {
      const now = new Date();
      const japanTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
      );
      return japanTime.toISOString().split('T')[0];
    };

    // 散歩データを準備
    const walkData = {
      date: getJapanDate(), // 日本時間の日付を使用
      distance: Math.round(walkDistance),
      duration: walkTime,
      startTime: new Date(Date.now() - walkTime * 1000).toISOString(),
    };

    console.log('散歩データ（日本時間対応）:', walkData);

    try {
      if (!careSettingId) {
        throw new Error('careSettingId が取得できませんでした');
      }

      // Firebase認証トークンを取得
      const token = await getFirebaseToken();

      // バックエンドに散歩データ保存
      const result = await saveWalkRecord(walkData, careSettingId, token);
      console.log('散歩データ保存完了:', result);

      // ローカルストレージにも保存（バックアップ）
      const existingWalks = JSON.parse(
        localStorage.getItem('walkHistory') || '[]'
      );
      existingWalks.push({
        ...walkData,
        time: walkTime,
        duration: formatTime(walkTime),
      });
      localStorage.setItem('walkHistory', JSON.stringify(existingWalks));

      // 散歩ミッション完了をローカルストレージに保存
      const completedMissions = JSON.parse(
        localStorage.getItem('completedMissions') || '[]'
      );
      if (!completedMissions.includes('walk')) {
        completedMissions.push('walk');
        localStorage.setItem(
          'completedMissions',
          JSON.stringify(completedMissions)
        );
      }

      setDialogContent({
        title: 'おさんぽおつかれさま！',
        description: `きょり：${Math.round(walkDistance)}m\nじかん：${formatTime(walkTime)}\nきょうもがんばったね！きろくしたよ。`,
      });
      setShowDialog(true);
    } catch (error) {
      console.error('散歩データサーバー保存エラー:', error);
      console.log('散歩データはローカルに保存されました');
      // エラーでもローカル保存は実行
      const existingWalks = JSON.parse(
        localStorage.getItem('walkHistory') || '[]'
      );
      existingWalks.push({
        ...walkData,
        time: walkTime,
        duration: formatTime(walkTime),
      });
      localStorage.setItem('walkHistory', JSON.stringify(existingWalks));

      setDialogContent({
        title: 'おさんぽおつかれさま！',
        description: `きょり：${Math.round(walkDistance)}m\nじかん：${formatTime(walkTime)}\nサーバーへの保存に失敗しましたが、ローカルに保存されました。`,
      });
      setShowDialog(true);
    }
  };

  // 散歩終了後、ダイアログを閉じたらダッシュボードに戻る
  const handleDialogClose = () => {
    setShowDialog(false);
    // 散歩終了後、ダイアログを閉じたらダッシュボードに戻る
    if (!isWalking && walkTime > 0) {
      router.push('/dashboard');
    }
  };

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(
    () => () => {
      if (walkTimer) {
        clearInterval(walkTimer);
      }
      if (gpsTracker.isTracking()) {
        gpsTracker.stopTracking();
      }
    },
    [walkTimer, gpsTracker]
  );

  // 認証状態がローディング中の場合、ローディング画面を表示
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg">認証確認中...</div>
      </div>
    );
  }

  // 認証されていない場合、認証が必要な旨を表示
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        <div className="text-lg text-red-600 font-bold mb-4">
          認証が必要です
        </div>
        <Button
          onClick={() => router.push('/onboarding/login')}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          ログインページへ
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
      <div className="flex flex-col h-screen max-w-[390px] mx-auto overflow-hidden">
        {/* ヘッダー */}
        <div className="mb-10 flex items-center p-3 bg-white h-14 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mr-2 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">おさんぽ</h1>
        </div>

        {/* メインコンテンツ */}
        <div className="mb-10 w-full max-w-xs">
          <div className="mb-10 bg-white rounded-3xl px-8 py-5 border-2 border-green-200 flex flex-col justify-center items-center">
            {/* 距離＋時間：縦並びセンター */}
            <div className="flex flex-col items-center justify-center w-full">
              {/* 距離 */}
              <span className="text-base font-bold text-green-800">
                {Math.round(walkDistance)} メートル
              </span>
              {/* 時間 */}
              <span className="flex items-center text-base text-gray-800 font-bold mt-2">
                <Clock className="h-5 w-5 text-blue-500 mr-1" />
                {formatTime(walkTime)}
              </span>
            </div>
            {/* 2行目 */}
            {/* <div className="flex flex-row items-center justify-between w-full"> */}
            {/* 状態 */}
            {/* <span className="text-base text-green-600 font-medium">
              {isWalking ? 'お散歩中' : 'お散歩前'} */}
            {/* </span> */}
            {/* GPS */}
            {/* <span className="text-xs text-gray-500">{gpsStatus}</span>
          </div> */}
          </div>

          {/* 散歩ミッション達成条件 */}
          <div className="mb-6 w-full">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-yellow-800">
                  🎯 みっしょんたっせい：1000メートルいじょうあるこう！
                </span>
              </div>
            </div>
          </div>

          {/* アニメーションエリア */}
          <div className="mb-10 w-full flex justify-center">
            <div
              className="border-2 border-gray-200 scale-105 rounded-3xl overflow-hidden shadow-md bg-white flex items-center justify-center"
              style={{ width: 280, height: 200 }}
            >
              <DogWalkAnimation isWalking={isWalking} />
            </div>
          </div>

          {/* お散歩前 or お散歩中 状態テキスト（中央寄せ） */}
          <div className="mb-8 w-full flex flex-col items-center justify-center">
            <span className="text-lg text-green-600 font-bold">
              {isWalking ? 'おさんぽちゅう' : 'おさんぽまえ'}
            </span>
            {/* <span className="text-xs text-gray-500 mt-1">{gpsStatus}</span> */}
          </div>

          {/* 開始ボタン */}
          {!isWalking && (
            <Button
              className="w-full max-w-xs bg-green-500 hover:bg-green-600 text-white py-5 rounded-2xl shadow-xl text-xl font-bold mb-4"
              onClick={startWalk}
            >
              おさんぽかいし
            </Button>
          )}

          {/* 終了ボタン */}
          {isWalking && (
            <Button
              className="w-full max-w-xs bg-red-500 hover:bg-red-600 text-white py-5 rounded-2xl shadow-xl text-xl font-bold mt-4"
              onClick={endWalk}
            >
              おさんぽおわり
            </Button>
          )}
        </div>

        {/* ダイアログ部分 */}
        <Dialog open={showDialog} onOpenChange={handleDialogClose}>
          <DialogContent className="bg-white rounded-lg max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">
                {dialogContent.title}
              </DialogTitle>
              <DialogDescription className="text-center pt-2 text-base whitespace-pre-line">
                {dialogContent.description}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleDialogClose}
                className="bg-black text-white border border-white px-6 py-2 rounded-lg shadow-none hover:bg-gray-800 active:bg-gray-900"
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
