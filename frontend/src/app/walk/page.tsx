'use client';

import { useState, useEffect } from 'react';
// import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
// import { ArrowLeft, Play, Square, Clock } from 'lucide-react';
import { ArrowLeft, Clock } from 'lucide-react';

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
  const [isWalking, setIsWalking] = useState(false);
  const [walkTime, setWalkTime] = useState(0);
  const [walkDistance, setWalkDistance] = useState(0);
  const [walkTimer, setWalkTimer] = useState<NodeJS.Timeout | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: '',
    description: '',
  });

  // GPS関連の状態管理
  const [gpsTracker] = useState(() => new GPSTracker());
  // const [gpsStatus, setGpsStatus] = useState('準備中');

  // 時間フォーマット関数
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const startWalk = async () => {
    setIsWalking(true);
    setWalkTime(0);
    setWalkDistance(0);
    // setGpsStatus('GPS初期化中...');

    try {
      // GPS追跡開始
      const trackingStarted = await gpsTracker.startTracking();

      if (trackingStarted) {
        console.log('GPS追跡開始');
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
        setDialogContent({
          title: 'ばしょがわからないよ',
          description:
            'ばしょのじょうほうが うまくとれなかったみたい。もういちどためしてみてね！',
        });
        setShowDialog(true);
      }
    } catch (error) {
      console.error('散歩開始エラー:', error);
      setIsWalking(false);
      // setGpsStatus('開始エラー');
    }
  };

  const endWalk = async () => {
    // タイマー停止
    if (walkTimer) {
      clearInterval(walkTimer);
    }

    // GPS追跡停止
    gpsTracker.stopTracking();
    console.log('GPS追跡停止');
    // setGpsStatus('GPS停止');
    setIsWalking(false);

    // 散歩データを準備
    const walkData = {
      date: new Date().toISOString().split('T')[0],
      distance: Math.round(walkDistance),
      duration: walkTime,
      startTime: new Date(Date.now() - walkTime * 1000).toISOString(),
    };

    try {
      // バックエンドに散歩データ保存
      const result = await saveWalkRecord(walkData);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 px-6 py-8">
      <div className="flex flex-col h-screen max-w-[390px] mx-auto overflow-hidden">
        {/* ヘッダー */}
        <div className="mb-10 flex items-center p-3 bg-green-50 h-14 flex-shrink-0">
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

          {/* アニメーションエリア */}
          <div className="mb-10 w-full flex justify-center">
            <div
              className="border-2 border-gray-200 rounded-3xl overflow-hidden shadow-md bg-white flex items-center justify-center"
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
