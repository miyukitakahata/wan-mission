'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Target,
  Trophy,
  FileText,
  User,
  CreditCard,
} from 'lucide-react';
import { useCareSettings } from '@/hooks/useCareSettings';
import { useCareLogs } from '@/hooks/useCareLogs';
import { useAuth } from '@/context/AuthContext';
import { getAuth, signOut } from 'firebase/auth';

export default function AdminPage() {
  // TODO_DBから取得したデータを表示するページ
  const router = useRouter();

  // 追加するhooksを呼ぶ
  // CareSettings取得
  const {
    careSettings,
    loading: settingsLoading,
    error: settingsError,
  } = useCareSettings();
  // careSettingsが取得できた後でcareLogsを呼ぶ
  const careSettingId = careSettings?.id ?? 0;
  const {
    careLog,
    loading: logsLoading,
    error: logsError,
  } = useCareLogs(careSettingId);

  // 現在の経過日数や目標日数、子どもの名前の状態管理
  const [consecutiveDays, setConsecutiveDays] = useState<number | null>(null);
  const [targetDays, setTargetDays] = useState<number>(0);
  const [childName, setChildName] = useState<string>('');
  const user = useAuth(); // 認証情報を取得

  console.log('[AdminPage] User:', user.currentUser);

  // ログアウト処理
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        localStorage.clear();
        router.push('/onboarding/login');
      })
      .catch((error) => {
        console.error('Firebaseログアウト失敗:', error);
      });
  };

  // データを取得したらchildNameとconsecutiveDaysとtargetDaysを更新
  useEffect(() => {
    // careSettingsのデータが取得出来たら
    if (careSettings) {
      console.log(
        'adminぺージでcareSettingsのデータ取れているか:',
        careSettings
      );
      setChildName(careSettings.child_name);

      // 連続日数の差を計算
      const startDate = new Date(careSettings.care_start_date);
      const today = new Date(); // 今日の日付
      const diffTime = Math.abs(today.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 開始日を含めるために1日追加

      setConsecutiveDays(diffDays);

      // 目標日数を設定
      const endDate = new Date(careSettings.care_end_date);
      const targetDiffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const targetDiffDays =
        Math.ceil(targetDiffTime / (1000 * 60 * 60 * 24)) + 1; // 開始日を含めるために1日追加

      setTargetDays(targetDiffDays);
    }
  }, [careSettings]);

  // =========================
  // 目標カードだけ分岐レンダリング
  // =========================
  const renderGoalCard = () => {
    if (settingsLoading || logsLoading) {
      return (
        <Card className="mb-4 shadow-lg">
          <CardContent>
            <p className="text-center text-gray-500 py-4">読み込み中...</p>
          </CardContent>
        </Card>
      );
    }

    if (settingsError || logsError) {
      return (
        <Card className="mb-4 shadow-lg">
          <CardContent>
            <p className="text-center text-red-500 py-4">
              エラーが発生しました
            </p>
          </CardContent>
        </Card>
      );
    }

    if (!careSettings || consecutiveDays === null || childName === '') {
      return (
        <Card className="mb-4 shadow-lg">
          <CardContent>
            <p className="text-center text-gray-500 py-4">データがありません</p>
          </CardContent>
        </Card>
      );
    }

    if (!careLog || careLog.care_log_id === null) {
      return (
        <Card className="mb-4 shadow-lg border border-orange-200 bg-orange-50">
          <CardContent>
            <p className="text-center text-orange-800 py-4">
              今日はまだお世話記録がありません
            </p>
          </CardContent>
        </Card>
      );
    }

    // ここまで来たらすべてのデータOK(careLogがあるならreturnできる)
    return (
      <Card className="mb-4 shadow-lg">
        <CardHeader className="pb-3">
          <h2 className="text-lg font-bold flex items-center">
            <Target className="mr-2 h-5 w-5 text-orange-500" />
            {childName}さん、{consecutiveDays}日達成中！
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-center font-medium text-orange-800">
                {targetDays}日連続でお世話を達成しよう！
              </p>
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-orange-700">
                    現在の連続日数
                  </span>
                  <span className="text-sm font-bold text-orange-800">
                    {consecutiveDays}/{targetDays}日
                  </span>
                </div>
                <Progress
                  value={(consecutiveDays / targetDays) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  console.log('adminページでcareLog確認:', careLog);
  console.log('adminページでcareSettings確認:', careSettings);
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 px-4 py-6">
      <div className="w-full max-w-xs mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">管理者画面</h1>
        </div>

        {/* 右上のログアウトボタン */}
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 bg-white border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-600 px-2 py-1 h-auto text-xs rounded-md"
          onClick={handleLogout}
        >
          ログアウト🐾
        </Button>

        {/* 家族会議で決めた目標 */}
        {renderGoalCard()}

        {/* ナビゲーションボタン */}
        <div className="space-y-3">
          {/* ユーザー情報 */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center py-4 border-orange-200 hover:bg-orange-50"
            onClick={() => router.push('/admin/user-info')}
          >
            <User className="mr-2 h-5 w-5 text-orange-600" />
            <span className="text-orange-800">ユーザー情報</span>
          </Button>

          {/* サブスクリプション */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center py-4 border-orange-200 hover:bg-orange-50"
            onClick={() => router.push('/admin/subscription')}
          >
            <CreditCard className="mr-2 h-5 w-5 text-orange-600" />
            <span className="text-orange-800">サブスクリプション</span>
          </Button>

          {/* 反省文を見る */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center py-4 border-orange-200 hover:bg-orange-50"
            onClick={() => router.push('/settings/reflections')}
          >
            <FileText className="mr-2 h-5 w-5 text-orange-600" />
            <span className="text-orange-800">反省文を見る</span>
          </Button>

          {/* 目標達成！ */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-sm">
            <p className="text-sm text-green-700 mb-3 text-center">
              目標達成！
            </p>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center py-4"
              onClick={() => router.push('/goal-clear')}
            >
              <Trophy className="mr-2 h-5 w-5" />
              クリアおめでとう
            </Button>
          </div>

          {/* 戻るボタン */}
          <Button
            variant="outline"
            className="w-full mt-6 border-orange-200 hover:bg-orange-50 text-orange-800"
            onClick={() => router.push('/dashboard')}
          >
            トップページに戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
