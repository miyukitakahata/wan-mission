'use client';

import { useState } from 'react';
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
import {
  ArrowLeft,
  Calendar,
  Coffee,
  Utensils,
  Footprints,
} from 'lucide-react'; // lucide-reactアイコン
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CareSettingsPage() {
  // DB：care_settingテーブルに対応
  // あさごはん、夕ご飯時間修正必要
  const router = useRouter(); // Next.jsのフックページ遷移などに使う
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [morningMealTime, setMorningMealTime] = useState('');
  const [eveningMealTime, setEveningMealTime] = useState('');
  const [walkTime, setWalkTime] = useState(''); // 開始日、終了日、朝ご飯、夜ごはん、散歩時間
  const [error, setError] = useState('');

  // 今日の日付を取得（最小日付として使用）
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = () => {
    if (!startDate) {
      setError('お世話スタート日を選択してください');
      return;
    }

    if (!endDate) {
      setError('お世話終了日を選択してください');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('終了日はスタート日より後の日付を選択してください');
      return;
    }

    if (!morningMealTime) {
      setError('朝ごはんの時間を選択してください');
      return;
    }

    if (!eveningMealTime) {
      setError('夕ご飯の時間を選択してください');
      return;
    }

    if (!walkTime) {
      setError('お散歩時間を選択してください');
      return;
    }

    // お世話設定を保存
    const careSettings = {
      startDate,
      endDate,
      morningMealTime,
      eveningMealTime,
      walkTime,
    };
    localStorage.setItem('careSettings', JSON.stringify(careSettings));

    // お世話開始時間を記録
    localStorage.setItem('lastCareTime', new Date().toISOString());

    // ローディング画面に遷移
    router.push('/onboarding/admin-pin');
  };

  const isFormComplete =
    startDate && endDate && morningMealTime && eveningMealTime && walkTime;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
          <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Calendar className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-center">お世話設定</h1>
          <Progress value={80} className="w-full" />
          <p className="text-center text-base text-muted-foreground">
            ステップ 4/5
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* お世話期間設定 */}
            <div className="space-y-3">
              <h3 className="text-base font-medium text-center">
                📅 お世話期間
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="startDate"
                  className="text-sm flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-green-500" />
                  お世話スタート日
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setError('');
                  }}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="endDate"
                  className="text-sm flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4 text-red-500" />
                  お世話終了日
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setError('');
                  }}
                  className="text-base"
                />
              </div>
            </div>

            {/* お世話時間設定 */}
            <div className="space-y-3">
              <h3 className="text-base font-medium text-center">
                ⏰ お世話時間
              </h3>

              <div className="space-y-2">
                <Label
                  htmlFor="morningMeal"
                  className="text-sm flex items-center gap-2"
                >
                  <Coffee className="h-4 w-4 text-yellow-600" />
                  朝ごはんの時間
                </Label>
                <Select
                  value={morningMealTime}
                  onValueChange={(value) => {
                    setMorningMealTime(value);
                    setError('');
                  }}
                >
                  <SelectTrigger id="morningMeal" className="text-base">
                    <SelectValue placeholder="時間を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => i + 6).map((hour) => (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    ))}
                    {Array.from({ length: 5 }, (_, i) => i + 6).map((hour) => (
                      <SelectItem key={`${hour}-30`} value={`${hour}:30`}>
                        {hour}:30
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="eveningMeal"
                  className="text-sm flex items-center gap-2"
                >
                  <Utensils className="h-4 w-4 text-orange-600" />
                  夕ご飯の時間
                </Label>
                <Select
                  value={eveningMealTime}
                  onValueChange={(value) => {
                    setEveningMealTime(value);
                    setError('');
                  }}
                >
                  <SelectTrigger id="eveningMeal" className="text-base">
                    <SelectValue placeholder="時間を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 6 }, (_, i) => i + 17).map((hour) => (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    ))}
                    {Array.from({ length: 6 }, (_, i) => i + 17).map((hour) => (
                      <SelectItem key={`${hour}-30`} value={`${hour}:30`}>
                        {hour}:30
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="walkTime"
                  className="text-sm flex items-center gap-2"
                >
                  <Footprints className="h-4 w-4 text-blue-600" />
                  お散歩時間
                </Label>
                <Select
                  value={walkTime}
                  onValueChange={(value) => {
                    setWalkTime(value);
                    setError('');
                  }}
                >
                  <SelectTrigger id="walkTime" className="text-base">
                    <SelectValue placeholder="時間を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    ))}
                    {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => (
                      <SelectItem key={`${hour}-30`} value={`${hour}:30`}>
                        {hour}:30
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {isFormComplete && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700 text-center">
                  設定完了！わんちゃんとの楽しい時間が始まります 🐕
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/onboarding/name')}
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
