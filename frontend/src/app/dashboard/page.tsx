'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Heart,
  Footprints,
  Settings,
  Coffee,
  Utensils,
  Star,
} from 'lucide-react';

// API エンドポイントのベース URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const router = useRouter();
  // const searchParams = useSearchParams();
  // To-do
  // care_setting_id を仮で1とする（本番はユーザーごとに取得）
  const careSettingId = 1;

  // お世話状態
  const [careLog, setCareLog] = useState({
    fed_morning: false,
    fed_night: false,
    walked: false,
    care_log_id: null,
  });
  const [loading, setLoading] = useState(true);

  // お世話状態をAPIから取得
  useEffect(() => {
    const fetchCareLog = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/care_logs/today?care_setting_id=${careSettingId}`
        );
        const data = await res.json();
        setCareLog({
          fed_morning: data.fed_morning,
          fed_night: data.fed_night,
          walked: data.walked,
          care_log_id: data.care_log_id || null,
        });
      } catch (error) {
        console.error('Error fetching care log:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCareLog();
  }, []);

  // ミッション定義
  const missions = [
    {
      id: 'morning-food',
      name: '朝ごはんをあげる',
      icon: Coffee,
      completed: careLog.fed_morning,
    },
    {
      id: 'evening-food',
      name: '夕ご飯をあげる',
      icon: Utensils,
      completed: careLog.fed_night,
    },
    {
      id: 'walk',
      name: '散歩に行く',
      icon: Footprints,
      completed: careLog.walked,
    },
  ];

  // わんちゃんのひとこと
  const dogMessages = [
    '今日も一緒に遊ぼうね！',
    'お腹すいたワン！',
    '散歩に行きたいワン〜',
    'ありがとうワン！',
    '元気いっぱいだワン！',
    '撫でてくれてありがとうワン♪',
    '今日はいい天気だワン！',
    '一緒にいると楽しいワン〜',
    'お世話してくれて嬉しいワン！',
    '遊ぼうワン！ワン！',
    '大好きだワン♡',
    '今度はどこに行くワン？',
  ];

  const [currentMessage, setCurrentMessage] = useState(dogMessages[0]);

  const handleDogClick = () => {
    const randomIndex = Math.floor(Math.random() * dogMessages.length);
    setCurrentMessage(dogMessages[randomIndex]);
  };

  // お世話タスク完了時の処理
  const handleMissionComplete = async (missionId: string) => {
    if (missionId === 'walk') {
      // 散歩は /walk に遷移
      router.push('/walk');
      return;
    }

    try {
      // care_log_id がなければ新規作成
      let careLogId = careLog.care_log_id;
      if (!careLogId) {
        // 今日の care_log を新規作成
        const today = new Date().toISOString().slice(0, 10);
        const res = await fetch(`${API_BASE_URL}/api/care_logs/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: today,
            fed_morning: missionId === 'morning-food',
            fed_night: missionId === 'evening-food',
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          console.error('POST失敗', res.status, text);
          throw new Error('POST失敗');
        }
        const data = await res.json();
        console.log('POST成功', { careLogId, missionId, data });
        careLogId = data.id;
      } else {
        // 既存の care_log を部分更新
        const updateBody: any = {};
        if (missionId === 'morning-food') updateBody.fed_morning = true;
        if (missionId === 'evening-food') updateBody.fed_night = true;
        const resPatch = await fetch(
          `${API_BASE_URL}/api/care_logs/${careLogId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateBody),
          }
        );
        if (!resPatch.ok) {
          const text = await resPatch.text();
          console.error('PATCH失敗', resPatch.status, text);
          throw new Error('PATCH失敗');
        }
        const dataPatch = await resPatch.json();
        console.log('PATCH成功', { careLogId, missionId, data: dataPatch });
      }
      // 更新後、再取得
      const res2 = await fetch(
        `${API_BASE_URL}/api/care_logs/today?care_setting_id=${careSettingId}`
      );
      if (!res2.ok) {
        const text = await res2.text();
        console.error('取得後失敗', res2.status, text);
      }
      const data2 = await res2.json();
      console.log('取得後', data2);
      setCareLog({
        fed_morning: data2.fed_morning,
        fed_night: data2.fed_night,
        walked: data2.walked,
        care_log_id: data2.care_log_id || null,
      });
    } catch (error) {
      console.error('お世話タスク更新エラー:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 載入中顯示 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>読み込み中...</p>
        </div>
      ) : (
        <>
          {/* ヘッダーナビゲーション */}
          <div className="bg-white shadow-sm p-4">
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center py-3 px-2 h-16"
                onClick={() => router.push('/dashboard')}
              >
                <Heart className="h-5 w-5 mb-1" />
                <span className="text-xs">お世話</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center py-3 px-2 h-16"
                onClick={() => router.push('/walk')}
              >
                <Footprints className="h-5 w-5 mb-1" />
                <span className="text-xs">お散歩</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center py-3 px-2 h-16"
                onClick={() => router.push('/admin-login')}
              >
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-xs">管理者</span>
              </Button>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="px-4 py-6">
            <div className="w-full max-w-xs mx-auto space-y-6">
              {/* 犬のアニメーション・ひとこと */}
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
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-white" />
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-5 border-transparent border-t-gray-300" />
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
                          style={{ objectFit: 'contain' }}
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
                      const isCompleted = mission.completed;

                      return (
                        <Button
                          key={mission.id}
                          variant="ghost"
                          className={`w-full h-12 flex items-center justify-start text-left px-4 ${
                            isCompleted
                              ? 'bg-green-50 text-green-800'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleMissionComplete(mission.id)}
                          disabled={isCompleted}
                        >
                          <div className="flex items-center space-x-3">
                            {isCompleted ? (
                              <div className="text-green-500 text-lg">✅</div>
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded" />
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
        </>
      )}
    </div>
  );
}
