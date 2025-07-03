'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, User, Heart, Calendar, Loader2, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCareSettings } from '@/hooks/useCareSettings';
import { useAuth } from '@/context/AuthContext';

export default function UserInfoPage() {
  const router = useRouter();
  const user = useAuth(); // 認証情報を取得
  console.log('[UserInfoPage] User:', user.currentUser);
  // hooksから取得
  const { careSettings, loading, error, refetch } = useCareSettings();

  // プレミアム会員状態をチェック（実際の実装では、サブスクリプション状態を確認）
  const [isPremium, setIsPremium] = useState(false);
  useEffect(() => {
    const subscriptionData = JSON.parse(
      localStorage.getItem('subscriptionData') || '{}'
    );
    setIsPremium(subscriptionData.isPremium || false);
  }, []);

  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    if (!dateString) return '未設定';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // ローディング中
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 px-4 py-6">
        <div className="w-full max-w-xs mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">ユーザー情報</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </div>
      </div>
    );
  }

  // エラー時
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 px-4 py-6">
        <div className="w-full max-w-xs mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">ユーザー情報</h1>
          </div>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={refetch}
                className="mt-4 bg-orange-500 hover:bg-orange-600"
              >
                再試行
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // データが正常に取得できた場合
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
          <h1 className="text-xl font-bold">ユーザー情報</h1>
        </div>

        {/* 家族情報 */}
        <Card className="mb-4 shadow-lg">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-bold flex items-center">
              <User className="mr-2 h-5 w-5 text-orange-500" />
              家族情報
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-sm font-medium text-orange-800">
                  ママパパの名前
                </span>
                <span className="text-sm text-orange-700">
                  {careSettings?.parent_name || '未設定'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-sm font-medium text-orange-800">
                  子どもの名前
                </span>
                <span className="text-sm text-orange-700">
                  {careSettings?.child_name || '未設定'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <Heart className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-orange-800">
                    ワンちゃんの名前
                  </span>
                </div>
                <span className="text-sm text-orange-700">
                  {careSettings?.dog_name || '未設定'}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center">
                  <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-orange-800">
                    会員ステータス
                  </span>
                </div>
                <div className="flex items-center">
                  {isPremium ? (
                    <Badge className="bg-yellow-500 text-white">
                      <Crown className="mr-1 h-3 w-3" />
                      プレミアム会員
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-gray-600 border-gray-300"
                    >
                      無料会員
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* お世話期間 */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="pb-3">
            <h2 className="text-lg font-bold flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-orange-500" />
              お世話期間
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-sm font-medium text-orange-800">
                  お世話スタート日
                </span>
                <span className="text-sm text-orange-700">
                  {formatDate(careSettings?.care_start_date || '')}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-sm font-medium text-orange-800">
                  お世話終了日
                </span>
                <span className="text-sm text-orange-700">
                  {formatDate(careSettings?.care_end_date || '')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 戻るボタン */}
        <Button
          variant="outline"
          className="w-full border-orange-200 hover:bg-orange-50 text-orange-800"
          onClick={() => router.push('/admin')}
        >
          管理者画面に戻る
        </Button>
      </div>
    </div>
  );
}
