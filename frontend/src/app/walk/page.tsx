"use client";
// API実装してみて要検討
// GeolocationAPIを使って、フロントで経度緯度測定し散歩の距離を測定→成功失敗判定
// →バックエンドに距離（m）、成功か失敗かの結果を返す
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Square, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function WalkPage() {
  const router = useRouter();
  const [isWalking, setIsWalking] = useState(false);
  const [walkTime, setWalkTime] = useState(0);
  const [walkDistance, setWalkDistance] = useState(0);
  const [walkTimer, setWalkTimer] = useState<NodeJS.Timeout | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: "",
    description: "",
  });

  const startWalk = () => {
    setIsWalking(true);
    setWalkTime(0);
    setWalkDistance(0);

    const timer = setInterval(() => {
      setWalkTime((prev) => prev + 1);
      // 距離をメートル単位で増加（1秒あたり1-3メートル程度）
      setWalkDistance((prev) => prev + 1 + Math.random() * 2);
    }, 1000);
    setWalkTimer(timer);

    setDialogContent({
      title: "お散歩記録開始！",
      description:
        "GPS追跡を開始しました。安全に気をつけて楽しい散歩をしてください！",
    });
    setShowDialog(true);
  };

  const endWalk = () => {
    if (walkTimer) {
      clearInterval(walkTimer);
    }
    setIsWalking(false);

    // 散歩データを自動保存
    const walkData = {
      date: new Date().toISOString().split("T")[0],
      distance: Math.round(walkDistance),
      time: walkTime,
      duration: formatTime(walkTime),
    };

    // ローカルストレージに保存
    const existingWalks = JSON.parse(
      localStorage.getItem("walkHistory") || "[]"
    );
    existingWalks.push(walkData);
    localStorage.setItem("walkHistory", JSON.stringify(existingWalks));

    // 散歩ミッション完了をローカルストレージに保存
    const completedMissions = JSON.parse(
      localStorage.getItem("completedMissions") || "[]"
    );
    if (!completedMissions.includes("walk")) {
      completedMissions.push("walk");
      localStorage.setItem(
        "completedMissions",
        JSON.stringify(completedMissions)
      );
    }

    setDialogContent({
      title: "お散歩記録完了！",
      description: `距離: ${Math.round(walkDistance)}メートル
時間: ${formatTime(walkTime)}
記録を自動保存しました。`,
    });
    setShowDialog(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    // 散歩終了後、ダイアログを閉じたらダッシュボードに戻る
    if (!isWalking && walkTime > 0) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-green-100 max-w-[390px] mx-auto overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center p-3 bg-white shadow-sm h-14 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mr-2 p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">おさんぽ</h1>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* 距離表示 */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl px-6 py-4 shadow-lg border-2 border-green-200">
            <p className="text-center text-lg font-bold text-green-800">
              現在 {Math.round(walkDistance)} メートル
            </p>
            <p className="text-center text-sm text-green-600 mt-1">
              {isWalking ? "お散歩中..." : "お散歩前"}
            </p>
          </div>
        </div>

        {/* わんちゃんお散歩アニメーション */}
        <div className="mb-8">
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm relative">
            {/* 背景画像 */}
            <div className="w-56 h-56 bg-cover bg-center bg-no-repeat relative">
              <Image
                src="/images/walk-path-background.png"
                alt="散歩道の背景"
                fill
                style={{ objectFit: "cover" }}
                priority
              />

              {/* 歩いている効果のみ表示 */}
              {isWalking && (
                <div className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 translate-y-1/2 flex space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  <div
                    className="w-3 h-3 bg-green-400 rounded-full animate-ping"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-3 h-3 bg-green-400 rounded-full animate-ping"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 時間表示 */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 bg-white rounded-xl px-4 py-2 shadow-md">
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-lg font-bold text-gray-800">
              {formatTime(walkTime)}
            </span>
          </div>
        </div>

        {/* コントロールボタン */}
        <div className="w-full max-w-xs space-y-3">
          {!isWalking ? (
            <>
              <Button
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl shadow-lg text-lg font-bold"
                onClick={startWalk}
              >
                <Play className="mr-2 h-5 w-5" />
                お散歩開始
              </Button>
              <Button
                variant="outline"
                className="w-full py-3 rounded-2xl text-base font-medium"
                onClick={() => router.push("/dashboard")}
              >
                戻る
              </Button>
            </>
          ) : (
            <Button
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl shadow-lg text-lg font-bold"
              onClick={endWalk}
            >
              <Square className="mr-2 h-5 w-5" />
              お散歩終了
            </Button>
          )}
        </div>
      </div>

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
            <Button onClick={handleDialogClose}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
