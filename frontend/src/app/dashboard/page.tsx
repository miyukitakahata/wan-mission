'use client';

import { useState, useEffect } from 'react';
// import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
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
import { useAuth } from '@/context/AuthContext';

// 本番環境での Firebase 認証設定手順:
// 1. Firebase config を設定
// 2. 上記の import を有効化
// 3. useEffect 内の認証処理コメントを解除
// 4. ユーザーログイン状態の管理を実装

// API エンドポイントのベース URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardPage() {
  const router = useRouter();
  // const searchParams = useSearchParams();

  // care_settings の状態管理
  const [careSettings, setCareSettings] = useState<{
    id: number;
    parent_name: string;
    child_name: string;
    dog_name: string;
    care_start_date: string;
    care_end_date: string;
  } | null>(null);
  const [careSettingsLoading, setCareSettingsLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const testuser = useAuth(); // 認証情報を取得

  console.log('[NamePage] User:', testuser.currentUser);

  // Firebase 認証ヘッダーを取得する関数
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers.Authorization = `Bearer ${token}`;
        console.log('[Dashboard] Firebase token を取得しました');
      } else {
        throw new Error('ユーザーが未ログイン状態です');
      }
    } catch (authError) {
      console.error('[Dashboard] Firebase 認証エラー:', authError);
      throw authError;
    }

    return headers;
  };

  // お世話状態
  const [careLog, setCareLog] = useState({
    fed_morning: false,
    fed_night: false,
    walked: false,
    care_log_id: null,
  });
  const [loading, setLoading] = useState(false);
  // クライアント側でのみ日付を使用
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Firebase認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        '[Dashboard] 認証状態変更:',
        user ? 'ログイン済み' : '未ログイン'
      );
      setAuthUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // care_settings を取得（認証完了後）
  useEffect(() => {
    if (authLoading || !authUser) {
      console.log('[Dashboard] 認証待ちまたは未認証のためAPIコール延期');
      return;
    }

    const fetchCareSettings = async () => {
      setCareSettingsLoading(true);
      try {
        const headers = await getAuthHeaders();

        const res = await fetch(`${API_BASE_URL}/api/care_settings/me`, {
          method: 'GET',
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          setCareSettings({
            id: data.id,
            parent_name: data.parent_name,
            child_name: data.child_name,
            dog_name: data.dog_name,
            care_start_date: data.care_start_date,
            care_end_date: data.care_end_date,
          });
          console.log('[Dashboard] care_settings取得成功:', data);
        } else if (res.status === 404) {
          console.log(
            '[Dashboard] care_settings が見つかりません（新規ユーザー）'
          );
          // 新規ユーザーの場合、onboarding にリダイレクト
          router.push('/onboarding');
        } else {
          console.error(`[Dashboard] care_settings取得失敗: ${res.status}`);
        }
      } catch (error) {
        console.error('[Dashboard] care_settings取得エラー:', error);
      } finally {
        setCareSettingsLoading(false);
      }
    };

    fetchCareSettings();
  }, [authLoading, authUser, router]);

  // お世話状態をAPIから取得（care_settings取得後に実行）
  useEffect(() => {
    if (!careSettings?.id || !mounted) return; // care_settings がない場合、またはマウント前は実行しない

    const fetchCareLog = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const headers = await getAuthHeaders();

        const res = await fetch(
          `${API_BASE_URL}/api/care_logs/today?care_setting_id=${careSettings.id}&date=${today}`,
          {
            method: 'GET',
            headers,
          }
        );

        if (res.ok) {
          const data = await res.json();
          setCareLog({
            fed_morning: data.fed_morning,
            fed_night: data.fed_night,
            walked: data.walked,
            care_log_id: data.care_log_id || null,
          });
          console.log('[Dashboard] 今日のcare_log取得成功:', data);
        } else {
          console.error(`[Dashboard] care_log取得失敗: ${res.status}`);
        }
      } catch (error) {
        console.error('[Dashboard] care_log取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCareLog();
  }, [careSettings?.id, mounted]); // careSettings.id と mounted に依存

  // 昨日の散歩状態を確認し、未実施ならば sad-departure ページへリダイレクト
  // COMMENTED OUT: 昨日散歩確認機能を一時的に無効化
  /*
  useEffect(() => {
    if (!careSettings?.id || !mounted) return; // care_settings がない場合、またはマウント前は実行しない

    const checkYesterdayWalk = async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().slice(0, 10);

      try {
        console.log(
          `[Dashboard] 昨日の散歩確認開始: careSettingId=${careSettings.id}, date=${dateStr}`
        );

        // Firebase 認証ヘッダーを取得
        let authHeaders: Record<string, string>;
        try {
          authHeaders = await getAuthHeaders();
        } catch (authError) {
          console.error('[Dashboard] 認証失敗:', authError);
          return; // 認証エラーの場合は処理を中断
        }

        // fetch バックエンド API
        const res = await fetch(
          `${API_BASE_URL}/api/care_logs/by_date?care_setting_id=${careSettings.id}&date=${dateStr}`,
          {
            method: 'GET',
            headers: authHeaders,
          }
        );

        if (!res.ok) {
          console.error(`[Dashboard] API 呼び出し失敗: status=${res.status}`);

          // 認証エラーの場合の特別な処理
          if (res.status === 401) {
            console.error(
              '[Dashboard] 認証エラー: Firebase token が無効または期限切れです'
            );
            // to-do: 必要に応じてログイン画面にリダイレクト
            // router.push('/login');
            return;
          }

          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log(`[Dashboard] 後端レスポンス:`, data);

        // 昨日のcare_logが存在し、散歩が未実施の場合
        if (data && data.care_log_id && !data.walked) {
          console.log(
            '[Dashboard] 昨日散歩未実施のため sad-departure にリダイレクト'
          );
          router.push('/sad-departure');
        }
        // 昨日のcare_logが存在しない散歩が未実施の場合
        else if (data && !data.care_log_id && !data.walked) {
          console.log(
            '[Dashboard] 昨日記録なし(散歩未実施)のため sad-departure にリダイレクト'
          );
          router.push('/sad-departure');
        }
      } catch (error) {
        console.error('[Dashboard] 昨日の散歩確認エラー:', error);
      }
    };

    checkYesterdayWalk();
  }, [careSettings?.id, mounted, router]); // careSettings.id, mounted, router に依存
  */

  // ミッション定義
  const missions = [
    {
      id: 'morning-food',
      name: 'あさごはん',
      icon: Coffee,
      completed: careLog.fed_morning,
    },
    {
      id: 'evening-food',
      name: 'ゆうごはん',
      icon: Utensils,
      completed: careLog.fed_night,
    },
    {
      id: 'walk',
      name: 'おさんぽ',
      icon: Footprints,
      completed: careLog.walked,
    },
  ];

  // わんちゃんのひとこと
  const dogMessages = ['きょうもいっしょにあそぼうね！'];

  const [currentMessage, setCurrentMessage] = useState(dogMessages[0]);

  const handleDogClick = async () => {
    try {
      // Firebase認証トークンを取得
      const user = auth.currentUser;
      if (!user) {
        throw new Error('ログインが必要です');
      }
      const idToken = await user.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/message_logs/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`, // 認証トークンを追加
        },
      });
      if (!res.ok) {
        throw new Error('メッセージ取得失敗');
      }
      const data = await res.json();
      setCurrentMessage(data.message);
    } catch (error) {
      console.error('犬メッセージ取得エラー:', error);
    }
  };

  // お世話タスク完了時の処理
  const handleMissionComplete = async (missionId: string) => {
    if (missionId === 'walk') {
      // 散歩は /walk に遷移
      router.push('/walk');
      return;
    }

    try {
      // 認証ヘッダーを取得
      const headers = await getAuthHeaders();

      // care_log_id がなければ新規作成
      let careLogId = careLog.care_log_id;
      if (!careLogId) {
        // 今日の care_log を新規作成
        const today = new Date().toISOString().slice(0, 10);
        const res = await fetch(`${API_BASE_URL}/api/care_logs/`, {
          method: 'POST',
          headers,
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
            headers,
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
      const today = new Date().toISOString().split('T')[0];

      const res2 = await fetch(
        `${API_BASE_URL}/api/care_logs/today?care_setting_id=${careSettings?.id}&date=${today}`,
        {
          method: 'GET',
          headers,
        }
      );
      if (!res2.ok) {
        const text = await res2.text();
        console.error('取得後失敗', res2.status, text);
      } else {
        const data2 = await res2.json();
        console.log('取得後', data2);
        setCareLog({
          fed_morning: data2.fed_morning,
          fed_night: data2.fed_night,
          walked: data2.walked,
          care_log_id: data2.care_log_id || null,
        });
      }
    } catch (error) {
      console.error('お世話タスク更新エラー:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 読み込み中表示 */}
      {authLoading ||
      !authUser ||
      !careSettings?.id ||
      loading ||
      careSettingsLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>
            {(() => {
              if (authLoading) return '認証確認中...';
              if (!authUser) return '認証が必要です';
              if (!careSettings?.id) return 'ユーザー情報を取得中...';
              return '読み込み中...';
            })()}
          </p>
        </div>
      ) : (
        <>
          {/* ヘッダーナビゲーション */}
          {/* <div className="bg-white shadow-sm p-4"> */}
          <div className="bg-white shadow-sm p-4 sticky top-0 z-30">
            <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center py-3 px-2 h-16"
                onClick={() => router.push('/dashboard')}
              >
                <Heart className="h-5 w-5 mb-1" />
                <span className="text-xs">おせわ</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center py-3 px-2 h-16"
                onClick={() => router.push('/walk')}
              >
                <Footprints className="h-5 w-5 mb-1" />
                <span className="text-xs">おさんぽ</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center py-3 px-2 h-16"
                onClick={() => router.push('/admin-login')}
              >
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-xs">かんりしゃ</span>
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

                    {/* 犬の画像 → 動画 */}
                    <div className="flex flex-col items-center">
                      {/* <Button
                        variant="ghost"
                        className="relative w-28 h-28 p-0 hover:scale-105 transition-transform duration-200"
                        onClick={handleDogClick}
                      > */}
                      {/* <Image
                          src="/images/cute-puppy.png"
                          alt="わんちゃん"
                          fill
                          style={{ objectFit: 'contain' }}
                          priority
                        />
                      </Button> */}
                      <Button
                        variant="ghost"
                        className="relative w-60 h-60 max-w-xs max-h-xs p-0 hover:scale-105 transition-transform duration-200 rounded-full overflow-hidden"
                        onClick={handleDogClick}
                      >
                        <video
                          src="/animations/dog-idle.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-contain"
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
                    きょうのおせわみっしょん
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
