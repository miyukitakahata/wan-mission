'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const user = useAuth(); // 認証情報を取得

console.log('[NamePage] User:', user.currentUser);

// DB:reflection_notesテーブルに対応
// このページで反省文登録が完結するなら、送るボタンで登録
export default function SadDeparturePage() {
  const router = useRouter(); // Next.jsのフックページ遷移などに使う

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 px-4 sm:px-6 py-6 [&_*]:text-[18px]">
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center text-center space-y-8">
        {/* タイトル */}
        <h1 className="text-base sm:text-lg font-medium text-gray-800 px-4">
          「犬からの悲しい言葉」
        </h1>

        {/* 反省文ボタン */}
        <Button
          variant="outline"
          className="px-12 py-3 rounded-full bg-white border-2 border-gray-300 text-gray-800 text-sm font-medium shadow-sm hover:bg-gray-50"
          onClick={() => router.push('/reflection-writing')}
        >
          反省文
        </Button>

        {/* 犬のシルエット */}
        <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 犬の体 */}
            <ellipse cx="60" cy="85" rx="25" ry="30" fill="#1a1a1a" />

            {/* 犬の頭 */}
            <ellipse cx="60" cy="45" rx="20" ry="22" fill="#1a1a1a" />

            {/* 左耳 */}
            <ellipse
              cx="45"
              cy="35"
              rx="8"
              ry="18"
              fill="#1a1a1a"
              transform="rotate(-25 45 35)"
            />

            {/* 右耳 */}
            <ellipse
              cx="75"
              cy="35"
              rx="8"
              ry="18"
              fill="#1a1a1a"
              transform="rotate(25 75 35)"
            />

            {/* 前足（左） */}
            <ellipse cx="45" cy="95" rx="6" ry="15" fill="#1a1a1a" />

            {/* 前足（右） */}
            <ellipse cx="75" cy="95" rx="6" ry="15" fill="#1a1a1a" />

            {/* 尻尾 */}
            <ellipse
              cx="35"
              cy="75"
              rx="4"
              ry="12"
              fill="#1a1a1a"
              transform="rotate(-30 35 75)"
            />
          </svg>
        </div>

        {/* おくるボタン */}
        <Button
          className="w-32 bg-purple-400 hover:bg-purple-500 text-white py-3 rounded-full shadow-md text-sm font-medium"
          onClick={() => router.push('/reflection-writing')}
        >
          おくる
        </Button>
      </div>
    </div>
  );
}
