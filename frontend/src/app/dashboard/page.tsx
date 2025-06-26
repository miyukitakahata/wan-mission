"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Heart,
  Footprints,
  Settings,
  Coffee,
  Utensils,
  Star,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  useEffect(() => {
    // ローカルストレージから完了済みミッションを読み込み// TODO_DBからデータを取得
    const savedMissions = JSON.parse(
      localStorage.getItem("completedMissions") || "[]"
    );
    setCompletedMissions(savedMissions);
  }, []);

  // 今日のお世話ミッション
  const missions = [
    {
      id: "morning-food",
      name: "朝ごはんをあげる",
      icon: Coffee,
      completed: false,
    },
    {
      id: "evening-food",
      name: "夕ご飯をあげる",
      icon: Utensils,
      completed: false,
    },
    { id: "walk", name: "散歩に行く", icon: Footprints, completed: false },
  ];

  // わんちゃんのひとこと
  const dogMessages = [
    "今日も一緒に遊ぼうね！",
    "お腹すいたワン！",
    "散歩に行きたいワン〜",
    "ありがとうワン！",
    "元気いっぱいだワン！",
    "撫でてくれてありがとうワン♪",
    "今日はいい天気だワン！",
    "一緒にいると楽しいワン〜",
    "お世話してくれて嬉しいワン！",
    "遊ぼうワン！ワン！",
    "大好きだワン♡",
    "今度はどこに行くワン？",
  ];

  const [currentMessage, setCurrentMessage] = useState(dogMessages[0]);

  const handleDogClick = () => {
    const randomIndex = Math.floor(Math.random() * dogMessages.length);
    setCurrentMessage(dogMessages[randomIndex]);
  };

  const handleMissionComplete = (missionId: string) => {
    if (missionId === "walk") {
      router.push("/walk");
      return;
    }

    if (!completedMissions.includes(missionId)) {
      setCompletedMissions([...completedMissions, missionId]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* ヘッダーナビゲーション */}
      <div className="bg-white shadow-sm p-4">
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center py-3 px-2 h-16"
            onClick={() => router.push("/care-tasks")}
          >
            <Heart className="h-5 w-5 mb-1" />
            <span className="text-xs">お世話</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center py-3 px-2 h-16"
            onClick={() => router.push("/walk")}
          >
            <Footprints className="h-5 w-5 mb-1" />
            <span className="text-xs">お散歩</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center py-3 px-2 h-16"
            onClick={() => router.push("/admin-login")}
          >
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs">管理者</span>
          </Button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="px-4 py-6">
        <div className="w-full max-w-xs mx-auto space-y-6">
          {/* 犬のアニメーション・元気度バー・ひとこと */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                {/* ひとこと吹き出し */}
                <div className="relative bg-white border-2 border-gray-300 rounded-full px-8 py-3 shadow-lg max-w-[260px]">
                  <p className="text-center text-sm font-medium text-gray-800">
                    {currentMessage}
                  </p>
                  {/* 吹き出しの尻尾（下向き） */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-white"></div>
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-5 border-transparent border-t-gray-300"></div>
                  </div>
                </div>

                {/* 犬の画像 */}
                <div className="flex flex-col items-center">
                  <Button
                    variant="ghost"
                    className="relative w-28 h-28 p-0 hover:scale-105 transition-transform duration-200"
                    onClick={handleDogClick}
                  >
                    <Image
                      src="/images/cute-puppy.png"
                      alt="わんちゃん"
                      fill
                      style={{ objectFit: "contain" }}
                      priority
                    />
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    タップして話しかけよう！
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 今日のお世話ミッション */}
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-bold flex items-center">
                <Star className="mr-2 h-5 w-5 text-yellow-500" />
                今日のお世話ミッション
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {missions.map((mission) => {
                  const Icon = mission.icon;
                  const isCompleted = completedMissions.includes(mission.id);

                  return (
                    <Button
                      key={mission.id}
                      variant="ghost"
                      className={`w-full h-12 flex items-center justify-start text-left px-4 ${
                        isCompleted
                          ? "bg-green-50 text-green-800"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleMissionComplete(mission.id)}
                      disabled={isCompleted}
                    >
                      <div className="flex items-center space-x-3">
                        {isCompleted ? (
                          <div className="text-green-500 text-lg">✅</div>
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                        )}
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">
                          {mission.name}
                        </span>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
