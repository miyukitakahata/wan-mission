'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Sparkles } from 'lucide-react';

export default function GoalClearPage() {
  const router = useRouter();
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);

    // 5秒後に自動でダッシュボードに戻る
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 to-orange-100 px-6 py-8">
      <div className="w-full max-w-sm text-center">
        {/* アニメーション効果 */}
        <div className="relative mb-8">
          {showAnimation && (
            <>
              {[...Array(6)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="absolute h-8 w-8 text-yellow-400 animate-pulse"
                  style={{
                    top: `${20 + i * 15}%`,
                    left: `${10 + i * 15}%`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </>
          )}

          <div
            className={`transform transition-all duration-1000 ${showAnimation ? 'scale-110 rotate-12' : 'scale-100'}`}
          >
            <Trophy className="h-24 w-24 text-yellow-500 mx-auto mb-4" />
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="flex justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              <h1 className="text-3xl font-bold text-orange-800 mb-2">
                🎉 目標クリア！ 🎉
              </h1>

              <p className="text-lg text-gray-700 mb-4">
                おめでとうございます！
                <br />
                今日の目標を達成しました！
              </p>

              <div className="bg-orange-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-800">
                  わんちゃんもとても喜んでいます！
                  <br />
                  明日も一緒に頑張りましょう！
                </p>
              </div>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full text-lg font-bold"
                onClick={() => router.push('/dashboard')}
              >
                続ける
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-gray-600 mt-4">5秒後に自動的に戻ります...</p>
      </div>
    </div>
  );
}
