// 臨時テストバージョン - GPS距離計算機能のみをテスト
// バックエンドAPI呼び出しを削除し、GPSロジックのテストに集中する

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WalkPage() {
  const [isWalking, setIsWalking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [walkTime, setWalkTime] = useState(0);
  const [status, setStatus] = useState('散歩を開始する準備');
  const [debugInfo, setDebugInfo] = useState<{ id: number; message: string }[]>(
    []
  );

  const watchIdRef = useRef<number | null>(null);
  const previousPositionRef = useRef<GeolocationPosition | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const totalDistanceRef = useRef(0);
  const lastUpdateTimeRef = useRef<Date | null>(null);

  // GPS距離計算関数（ハーバサイン式を使用）
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // 地球半径（メートル）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // デバッグ情報追加
  const addDebugInfo = (info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const uniqueId = Date.now() + Math.random(); // ユニークIDを追加
    const debugEntry = { id: uniqueId, message: `[${timestamp}] ${info}` };
    setDebugInfo((prev) => [debugEntry, ...prev.slice(0, 9)]);
  };

  // GPS位置更新処理
  const handlePositionUpdate = (position: GeolocationPosition) => {
    const now = new Date();
    const currentLat = position.coords.latitude;
    const currentLon = position.coords.longitude;
    const { accuracy } = position.coords;

    addDebugInfo(
      `GPS更新: 精度=${accuracy.toFixed(1)}m, 位置=(${currentLat.toFixed(6)}, ${currentLon.toFixed(6)})`
    );

    // 精度フィルター（100m以内）
    if (accuracy > 100) {
      addDebugInfo(`精度不良によりスキップ: ${accuracy.toFixed(1)}m > 100m`);
      return;
    }

    // 前回の位置がある場合、距離を計算
    if (previousPositionRef.current) {
      const prevLat = previousPositionRef.current.coords.latitude;
      const prevLon = previousPositionRef.current.coords.longitude;

      const segmentDistance = calculateDistance(
        prevLat,
        prevLon,
        currentLat,
        currentLon
      );

      // 距離しきい値（精度に基づく動的調整）
      const minDistance = Math.min(Math.max(10, accuracy / 5), 30);

      addDebugInfo(
        `セグメント距離: ${segmentDistance.toFixed(1)}m, しきい値: ${minDistance.toFixed(1)}m`
      );

      if (segmentDistance >= minDistance) {
        // 速度チェック（異常な移動をフィルター）
        const timeDiff =
          (now.getTime() -
            (lastUpdateTimeRef.current?.getTime() || now.getTime())) /
          1000;
        const speed = timeDiff > 0 ? (segmentDistance / timeDiff) * 3.6 : 0; // km/h

        if (speed <= 15) {
          // 15km/h以下（散歩速度）
          totalDistanceRef.current += segmentDistance;
          setDistance(Math.round(totalDistanceRef.current));
          addDebugInfo(
            `距離追加: +${segmentDistance.toFixed(1)}m, 合計: ${totalDistanceRef.current.toFixed(1)}m, 速度: ${speed.toFixed(1)}km/h`
          );
          lastUpdateTimeRef.current = now;
        } else {
          addDebugInfo(
            `速度異常によりスキップ: ${speed.toFixed(1)}km/h > 15km/h`
          );
        }
      }
    } else {
      addDebugInfo('初回位置設定完了');
      lastUpdateTimeRef.current = now;
    }

    // 現在位置を前回位置として保存
    previousPositionRef.current = position;
  };

  // GPS追跡開始
  const startWalk = () => {
    if (!navigator.geolocation) {
      alert('このブラウザはGPSをサポートしていません');
      return;
    }

    setIsWalking(true);
    setDistance(0);
    setWalkTime(0);
    setStatus('散歩中...');
    totalDistanceRef.current = 0;
    previousPositionRef.current = null;
    startTimeRef.current = new Date();
    lastUpdateTimeRef.current = null;

    addDebugInfo('散歩開始 - GPS追跡を開始');

    // GPS追跡開始（3分間隔）
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (error) => {
        addDebugInfo(`GPSエラー: ${error.message}`);
        console.error('GPS error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 180000, // 3分タイムアウト
        maximumAge: 60000, // 1分キャッシュ
      }
    );

    // 時間カウンター
    const timeInterval = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor(
          (Date.now() - startTimeRef.current.getTime()) / 1000
        );
        setWalkTime(elapsed);
      }
    }, 1000);

    // クリーンアップ用にintervalIdを保存
    (window as any).walkTimeInterval = timeInterval;
  };

  // GPS追跡停止
  const stopWalk = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if ((window as any).walkTimeInterval) {
      clearInterval((window as any).walkTimeInterval);
    }

    setIsWalking(false);
    setStatus(
      `散歩完了！ 距離: ${distance}m, 時間: ${Math.floor(walkTime / 60)}分${walkTime % 60}秒`
    );

    addDebugInfo(`散歩終了 - 合計距離: ${distance}m, 時間: ${walkTime}秒`);
  };

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(
    () => () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if ((window as any).walkTimeInterval) {
        clearInterval((window as any).walkTimeInterval);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-green-800 mb-6">
          🚶‍♀️ GPS距離テスト
        </h1>

        {/* メイン情報カード */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{status}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {distance}m
                </div>
                <div className="text-sm text-gray-600">距離</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatTime(walkTime)}
                </div>
                <div className="text-sm text-gray-600">時間</div>
              </div>
            </div>

            <div className="flex justify-center">
              {!isWalking ? (
                <Button
                  onClick={startWalk}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  散歩開始
                </Button>
              ) : (
                <Button
                  onClick={stopWalk}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  散歩終了
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* デバッグ情報カード */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">デバッグ情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs font-mono max-h-60 overflow-y-auto">
              {debugInfo.map((entry) => (
                <div
                  key={entry.id}
                  className="text-gray-700 border-b border-gray-100 pb-1"
                >
                  {entry.message}
                </div>
              ))}
              {debugInfo.length === 0 && (
                <div className="text-gray-500">
                  散歩を開始するとデバッグ情報が表示されます
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 使用説明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">テスト方法</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>1. 屋外の開けた場所に移動</p>
            <p>2. 「散歩開始」をタップ</p>
            <p>3. 実際に歩いて距離を測定</p>
            <p>4. デバッグ情報でGPS精度を確認</p>
            <p className="text-orange-600 font-medium">
              ⚠️ 3分間隔で更新されます
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// V0 version
// "use client";

// API実装してみて要検討
// GeolocationAPIを使って、フロントで経度緯度測定し散歩の距離を測定→成功失敗判定
// →バックエンドに距離（m）、成功か失敗かの結果を返す
// import { useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, Play, Square, Clock } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";

// export default function WalkPage() {
//   const router = useRouter();
//   const [isWalking, setIsWalking] = useState(false);
//   const [walkTime, setWalkTime] = useState(0);
//   const [walkDistance, setWalkDistance] = useState(0);
//   const [walkTimer, setWalkTimer] = useState<NodeJS.Timeout | null>(null);
//   const [showDialog, setShowDialog] = useState(false);
//   const [dialogContent, setDialogContent] = useState({
//     title: "",
//     description: "",
//   });

//   const startWalk = () => {
//     setIsWalking(true);
//     setWalkTime(0);
//     setWalkDistance(0);

//     const timer = setInterval(() => {
//       setWalkTime((prev) => prev + 1);
//       // 距離をメートル単位で増加（1秒あたり1-3メートル程度）
//       setWalkDistance((prev) => prev + 1 + Math.random() * 2);
//     }, 1000);
//     setWalkTimer(timer);

//     setDialogContent({
//       title: "お散歩記録開始！",
//       description:
//         "GPS追跡を開始しました。安全に気をつけて楽しい散歩をしてください！",
//     });
//     setShowDialog(true);
//   };

//   const endWalk = () => {
//     if (walkTimer) {
//       clearInterval(walkTimer);
//     }
//     setIsWalking(false);

//     // 散歩データを自動保存
//     const walkData = {
//       date: new Date().toISOString().split("T")[0],
//       distance: Math.round(walkDistance),
//       time: walkTime,
//       duration: formatTime(walkTime),
//     };

//     // ローカルストレージに保存
//     const existingWalks = JSON.parse(
//       localStorage.getItem("walkHistory") || "[]"
//     );
//     existingWalks.push(walkData);
//     localStorage.setItem("walkHistory", JSON.stringify(existingWalks));

//     // 散歩ミッション完了をローカルストレージに保存
//     const completedMissions = JSON.parse(
//       localStorage.getItem("completedMissions") || "[]"
//     );
//     if (!completedMissions.includes("walk")) {
//       completedMissions.push("walk");
//       localStorage.setItem(
//         "completedMissions",
//         JSON.stringify(completedMissions)
//       );
//     }

//     setDialogContent({
//       title: "お散歩記録完了！",
//       description: `距離: ${Math.round(walkDistance)}メートル
// 時間: ${formatTime(walkTime)}
// 記録を自動保存しました。`,
//     });
//     setShowDialog(true);
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}分${secs}秒`;
//   };

//   const handleDialogClose = () => {
//     setShowDialog(false);
//     // 散歩終了後、ダイアログを閉じたらダッシュボードに戻る
//     if (!isWalking && walkTime > 0) {
//       router.push("/dashboard");
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-green-100 max-w-[390px] mx-auto overflow-hidden">
//       {/* ヘッダー */}
//       <div className="flex items-center p-3 bg-white shadow-sm h-14 flex-shrink-0">
//         <Button
//           variant="ghost"
//           onClick={() => router.push("/dashboard")}
//           className="mr-2 p-2"
//         >
//           <ArrowLeft className="h-5 w-5" />
//         </Button>
//         <h1 className="text-lg font-bold">おさんぽ</h1>
//       </div>

//       {/* メインコンテンツ */}
//       <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
//         {/* 距離表示 */}
//         <div className="mb-8">
//           <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border-2 border-green-200">
//             <p className="text-center text-lg font-bold text-green-800">
//               現在 {Math.round(walkDistance)} メートル
//             </p>
//             <p className="text-center text-sm text-green-600 mt-1">
//               {isWalking ? "お散歩中..." : "お散歩前"}
//             </p>
//           </div>
//         </div>

//         {/* わんちゃんお散歩アニメーション */}
//         <div className="mb-8">
//           <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm relative">
//             {/* 背景画像 */}
//             <div className="w-56 h-56 bg-cover bg-center bg-no-repeat relative">
//               <Image
//                 src="/images/walk-path-background.png"
//                 alt="散歩道の背景"
//                 fill
//                 style={{ objectFit: "cover" }}
//                 priority
//               />

//               {/* 歩いている効果のみ表示 */}
//               {isWalking && (
//                 <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 flex space-x-2">
//                   <div className="w-3 h-3 bg-green-400 rounded-full animate-ping" />
//                   <div
//                     className="w-3 h-3 bg-green-400 rounded-full animate-ping"
//                     style={{ animationDelay: "0.2s" }}
//                    />
//                   <div
//                     className="w-3 h-3 bg-green-400 rounded-full animate-ping"
//                     style={{ animationDelay: "0.4s" }}
//                    />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* 時間表示 */}
//         <div className="mb-8">
//           <div className="flex items-center space-x-2 bg-white rounded-xl px-4 py-2 shadow-md">
//             <Clock className="h-5 w-5 text-blue-500" />
//             <span className="text-lg font-bold text-gray-800">
//               {formatTime(walkTime)}
//             </span>
//           </div>
//         </div>

//         {/* コントロールボタン */}
//         <div className="w-full max-w-xs space-y-3">
//           {!isWalking ? (
//             <>
//               <Button
//                 className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl shadow-lg text-lg font-bold"
//                 onClick={startWalk}
//               >
//                 <Play className="mr-2 h-5 w-5" />
//                 お散歩開始
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full py-3 rounded-2xl text-base font-medium"
//                 onClick={() => router.push("/dashboard")}
//               >
//                 戻る
//               </Button>
//             </>
//           ) : (
//             <Button
//               className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl shadow-lg text-lg font-bold"
//               onClick={endWalk}
//             >
//               <Square className="mr-2 h-5 w-5" />
//               お散歩終了
//             </Button>
//           )}
//         </div>
//       </div>

//       <Dialog open={showDialog} onOpenChange={handleDialogClose}>
//         <DialogContent className="bg-white rounded-lg max-w-sm mx-auto">
//           <DialogHeader>
//             <DialogTitle className="text-center text-xl">
//               {dialogContent.title}
//             </DialogTitle>
//             <DialogDescription className="text-center pt-2 text-base whitespace-pre-line">
//               {dialogContent.description}
//             </DialogDescription>
//           </DialogHeader>
//           <div className="flex justify-center mt-4">
//             <Button onClick={handleDialogClose}>OK</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
