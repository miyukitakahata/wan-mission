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

export default function AdminPage() {
  // TODO_DBから取得したデータを表示するページ
  const router = useRouter();
  const [currentPoints, setCurrentPoints] = useState(45);
  const [maxPoints] = useState(100);
  const [consecutiveDays, setConsecutiveDays] = useState(3);
  const [targetDays] = useState(7);
  const [childName, setChildName] = useState('さき');

  useEffect(() => {
    // TODO_ローカルストレージから家族情報を取得 (DBから取得する場合はAPIを呼び出す
    const familyInfo = JSON.parse(localStorage.getItem('familyInfo') || '{}');
    if (familyInfo.childName) {
      setChildName(familyInfo.childName);
    }
  }, []);

  const progressPercentage = Math.round((currentPoints / maxPoints) * 100);

  const handleGoalClear = () => {
    router.push('/goal-clear');
  };

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

        {/* 家族会議で決めた目標 */}
        <Card className="mb-4 shadow-lg">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-bold flex items-center">
              <Target className="mr-2 h-5 w-5 text-orange-500" />
              {childName}ちゃん、{consecutiveDays}日達成中！
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
              onClick={handleGoalClear}
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
