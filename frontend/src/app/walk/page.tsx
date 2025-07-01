'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Square, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GPSTracker } from '@/app/api/geo/geoLocation';
import { saveWalkRecord } from '@/app/api/walk_api/walkApi';

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
  const [gpsStatus, setGpsStatus] = useState('準備中');

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
      setGpsStatus(`エラー: ${error}`);
    });

    // 位置更新コールバック設定
    gpsTracker.setPositionCallback((position) => {
      setGpsStatus(`GPS精度: ${position.accuracy.toFixed(1)}m`);
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
    setGpsStatus('GPS初期化中...');

    try {
      // GPS追跡開始
      const trackingStarted = await gpsTracker.startTracking();

      if (trackingStarted) {
        setGpsStatus('GPS追跡開始');

        // 時間カウンタ開始
        const timer = setInterval(() => {
          setWalkTime((prev) => prev + 1);
        }, 1000);
        setWalkTimer(timer);

        setDialogContent({
          title: 'お散歩記録開始！',
          description:
            'GPS追跡を開始しました。安全に気をつけて楽しい散歩をしてください！',
        });
        setShowDialog(true);
      } else {
        // GPS開始失敗の場合
        setIsWalking(false);
        setGpsStatus('GPS初期化失敗');
        setDialogContent({
          title: 'GPS エラー',
          description:
            '位置情報の取得に失敗しました。位置情報の許可を確認してください。',
        });
        setShowDialog(true);
      }
    } catch (error) {
      console.error('散歩開始エラー:', error);
      setIsWalking(false);
      setGpsStatus('開始エラー');
    }
  };

  const endWalk = async () => {
    // タイマー停止
    if (walkTimer) {
      clearInterval(walkTimer);
    }

    // GPS追跡停止
    gpsTracker.stopTracking();
    setGpsStatus('GPS停止');
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
        title: 'お散歩完了！',
        description: `距離: ${Math.round(walkDistance)}m\n時間: ${formatTime(walkTime)}\n記録を自動保存しました。`,
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
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-30">
        <Image
          src="/images/walk-background.png"
          alt="Walk background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-green-700 hover:bg-green-200"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-green-800">お散歩</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Main Content */}
        <div className="max-w-md mx-auto space-y-8">
          {/* Walk Stats */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(walkDistance)}m
                </div>
                <div className="text-sm text-gray-600">距離</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatTime(walkTime)}
                </div>
                <div className="text-sm text-gray-600">時間</div>
              </div>
            </div>

            {/* GPS Status */}
            <div className="mt-4 text-center">
              <div className="text-xs text-gray-500">{gpsStatus}</div>
            </div>
          </div>

          {/* Dog Image Centered */}
          <div className="flex justify-center">
            <div className="relative w-40 h-40">
              <Image
                src="/images/cute-puppy.png"
                alt="わんちゃん"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>

          {/* Walk Control */}
          <div className="text-center space-y-4">
            {!isWalking ? (
              <Button
                onClick={startWalk}
                className="w-full max-w-xs h-12 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-base flex items-center justify-center shadow-md mx-auto"
              >
                <Play className="h-5 w-5 mr-2" />
                おさんぽかいし
              </Button>
            ) : (
              <Button
                onClick={endWalk}
                className="w-full max-w-xs h-12 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-base flex items-center justify-center shadow-md mx-auto"
              >
                <Square className="h-5 w-5 mr-2" />
                おさんぽしゅうりょう
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full max-w-xs h-12 rounded-full font-bold text-base mt-2 mx-auto"
              onClick={() => router.back()}
            >
              戻る
            </Button>
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                {isWalking
                  ? '散歩中です。安全に気をつけて！'
                  : 'ボタンを押して散歩を開始しましょう'}
              </p>
            </div>
          </div>

          {/* Instructions */}
          {!isWalking && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                散歩のコツ
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 安全な場所を選んで散歩しましょう</li>
                <li>• 水分補給を忘れずに</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-green-800">
              {dialogContent.title}
            </DialogTitle>
            <DialogDescription className="text-center">
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleDialogClose}
              className="bg-green-600 hover:bg-green-700"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
