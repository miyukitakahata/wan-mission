'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield, Eye, EyeOff, Lock } from 'lucide-react'; // lucide-reactアイコン

export default function AdminPinPage() {
  // DB：care_settingのcare_passwordに対応
  const router = useRouter(); // Next.jsのフックページ遷移などに使う
  const [adminPin, setAdminPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false); // 確認用PINコードの表示／非表示を切り替えるための状態
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const familyInfoStr = localStorage.getItem('familyInfo');
      const careSettingsStr = localStorage.getItem('careSettings');

      if (!familyInfoStr || !careSettingsStr) {
        setError('必要な設定情報が見つかりません');
        return;
      }

      const familyInfo = JSON.parse(familyInfoStr);
      const careSettings = JSON.parse(careSettingsStr);

      console.log('[Step5] familyInfo:', familyInfo);
      console.log('[Step5] careSettings:', careSettings);

      const {
        parent_name: parentName,
        child_name: childName,
        dog_name: dogName,
      } = familyInfo;

      const {
        care_start_date: careStartDate,
        care_end_date: careEndDate,
        morning_meal_time: morningMealTime,
        night_meal_time: nightMealTime,
        walk_time: walkTime,
      } = careSettings;

      // バリデーション
      if (!parentName || !childName || !dogName) {
        setError('家族情報が不完全です');
        return;
      }

      if (
        !careStartDate ||
        !careEndDate ||
        !morningMealTime ||
        !nightMealTime ||
        !walkTime
      ) {
        setError('お世話設定が不完全です');
        return;
      }

      if (!adminPin) {
        setError('管理者PINを入力してください');
        return;
      }

      if (adminPin.length !== 4) {
        setError('PINは4桁で入力してください');
        return;
      }

      if (!/^\d{4}$/.test(adminPin)) {
        setError('PINは数字のみで入力してください');
        return;
      }

      if (adminPin !== confirmPin) {
        setError('PINが一致しません');
        return;
      }

      const token = await getAuth().currentUser?.getIdToken();
      if (!token) {
        setError('認証情報が取得できません');
        return;
      }

      const res = await fetch('/api/care_settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parent_name: parentName,
          child_name: childName,
          dog_name: dogName,
          care_password: adminPin,
          care_start_date: careStartDate,
          care_end_date: careEndDate,
          morning_meal_time: `${careStartDate}T${morningMealTime}`,
          night_meal_time: `${careStartDate}T${nightMealTime}`,
          walk_time: `${careStartDate}T${walkTime}`,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'サーバーエラーが発生しました');
      }

      const created = await res.json();
      localStorage.setItem('careSettingId', String(created.id));
      localStorage.setItem('lastCareTime', new Date().toISOString());
      localStorage.setItem(
        'adminSettings',
        JSON.stringify({
          adminPin,
          createdAt: new Date().toISOString(),
        })
      );

      router.push('/loading-screen');
    } catch (err: any) {
      console.error('登録失敗:', err);
      setError(err.message || '登録中にエラーが発生しました');
    }
  };

  const isFormComplete =
    adminPin && confirmPin && adminPin === confirmPin && adminPin.length === 4;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
          <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Shield className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-center">管理者PIN設定</h1>
          <Progress value={100} className="w-full" />
          <p className="text-center text-base text-muted-foreground">
            ステップ 5/5
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* 説明文 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Lock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    管理者PINについて
                  </p>
                  <p className="text-xs text-blue-700">
                    このPINは管理者画面にアクセスする際に必要です。
                    お子さんが勝手に設定を変更できないよう、
                    覚えやすく安全な4桁の数字を設定してください。
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="adminPin"
                className="text-base flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                管理者PIN（4桁）
              </Label>
              <div className="relative">
                <Input
                  id="adminPin"
                  type={showPin ? 'text' : 'password'}
                  placeholder="••••"
                  value={adminPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setAdminPin(value);
                    setError('');
                  }}
                  className="pr-10 text-center text-2xl tracking-widest"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? 'PINを隠す' : 'PINを表示'}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                管理者画面へのアクセスに使用します
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPin"
                className="text-base flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                管理者PIN（確認）
              </Label>
              <div className="relative">
                <Input
                  id="confirmPin"
                  type={showConfirmPin ? 'text' : 'password'}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setConfirmPin(value);
                    setError('');
                  }}
                  className="pr-10 text-center text-2xl tracking-widest"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  aria-label={showConfirmPin ? 'PINを隠す' : 'PINを表示'}
                >
                  {showConfirmPin ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {isFormComplete && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-700">管理者PIN設定完了！</p>
                </div>
              </div>
            )}

            {/* 注意事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-yellow-800">
                    <strong>重要:</strong>{' '}
                    このPINは忘れないようにメモしておいてください。
                    管理者画面での設定変更、ゲームリセット、統計確認などに必要です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/onboarding/third-step')}
            className="w-1/3 text-sm py-3"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <Button
            className="w-2/3 ml-2 bg-orange-500 hover:bg-orange-600 text-sm py-3"
            onClick={handleSubmit}
            disabled={!isFormComplete}
          >
            お世話を始める
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
