'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Calendar, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// // 反省文のサンプルデータ
// const reflectionData = [
//   {
//     id: 1,
//     date: "2023-06-10",
//     title: "お散歩をさぼってしまいました",
//     content:
//       "今日は雨が降っていたので、お散歩に行きませんでした。でも、わんちゃんは散歩を楽しみにしていたようで、とても残念そうでした。明日は天気が良くなったら、少し長めにお散歩に行こうと思います。",
//   },
//   {
//     id: 2,
//     date: "2023-06-08",
//     title: "ごはんの時間が遅れました",
//     content:
//       "仕事が忙しくて、わんちゃんのごはんの時間が1時間遅れてしまいました。わんちゃんはお腹を空かせて待っていたようで、申し訳ない気持ちでいっぱいです。明日からは、タイマーをセットして、時間通りにごはんをあげるようにします。",
//   },
//   {
//     id: 3,
//     date: "2023-06-05",
//     title: "おもちゃを買い忘れました",
//     content:
//       "わんちゃんのお気に入りのおもちゃが壊れてしまったので、新しいものを買うと約束していましたが、忘れてしまいました。わんちゃんは古いおもちゃを探していて、とても悲しそうでした。明日こそは必ず買いに行きます。",
//   },
// ]

type ReflectionNote = {
  id: number;
  content: string;
  approved_by_parent: boolean;
  created_at: string;
  updated_at: string;
  care_setting_id: number;
};

export default function ReflectionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [reflectionData, setReflectionData] = useState<ReflectionNote[]>([]);

  useEffect(() => {
    const fetchReflectionNotes = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/reflection_notes');
        const data = await res.json();
        setReflectionData(data);
      } catch (err) {
        console.error('反省文の取得に失敗しました', err);
      }
    };

    fetchReflectionNotes();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 px-4 sm:px-6 py-6">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">反省文一覧</h1>
        </div>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">すべての反省文</TabsTrigger>
            <TabsTrigger value="calendar">カレンダー表示</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="space-y-4">
              {reflectionData.map((reflection) => (
                <Card key={reflection.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <h2 className="text-base sm:text-lg font-medium">
                        {reflection.approved_by_parent
                          ? '再チャレンジ済み'
                          : '未承認の反省文'}
                      </h2>
                      <span className="text-xs text-muted-foreground">
                        {new Date(reflection.created_at).toLocaleDateString(
                          'ja-JP'
                        )}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base">{reflection.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="calendar">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-base sm:text-lg font-medium">
                    2023年6月
                  </h2>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    月を選択
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
                    <div key={day} className="text-xs font-medium py-1">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                    const hasReflection = reflectionData.some(
                      (r) => new Date(r.date).getDate() === day
                    );
                    return (
                      <Button
                        key={day}
                        variant={hasReflection ? 'default' : 'outline'}
                        className={`h-10 w-full ${
                          hasReflection
                            ? 'bg-orange-200 hover:bg-orange-300 text-orange-800'
                            : ''
                        }`}
                        onClick={() => {
                          if (hasReflection) {
                            setActiveTab('all');
                          }
                        }}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button
          className="w-full mt-6 bg-orange-500 hover:bg-orange-600"
          onClick={() => router.push('/dashboard')}
        >
          <Heart className="mr-2 h-4 w-4" />
          お世話再チャレンジ承認
        </Button>
      </div>
    </div>
  );
}
