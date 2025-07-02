'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Heart } from 'lucide-react'; // lucide-reactアイコン
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createReflectionNote } from '@/hooks/reflectionNotesPost';
import Image from 'next/image';

export default function ReflectionWritingPage() {
  const router = useRouter(); // Next.jsのフックページ遷移などに使う
  const [reflection, setReflection] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (reflection.trim() && title.trim()) {
      setIsSubmitting(true);

      try {
        // APIで送信
        await createReflectionNote(`${title}\n${reflection}`);

        // お世話の状態をリセット（わんちゃんが戻ってくる）
        localStorage.setItem('lastCareTime', new Date().toISOString());
        localStorage.setItem('dogReturned', 'true');

        setTimeout(() => {
          router.push('/welcome-back');
        }, 1000);
      } catch (error) {
        alert('保存に失敗しました。ネットワークを確認してください。');
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-8">
      <div className="w-full max-w-xs mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-2 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* メインコンテンツ */}
        <div className="flex flex-col items-center space-y-8">
          {/* タイトル */}
          <div className="text-center space-y-2 px-4">
            <p className="text-base font-medium text-gray-800 leading-relaxed">
              わんちゃんはさびしくなって、どこかへ行ってしまいました。
            </p>
            <p className="text-base font-medium text-gray-800 leading-relaxed">
              次はもっと仲よくすごせるように、
            </p>
            <p className="text-base font-medium text-gray-800 leading-relaxed">
              反省のきもちを書いてみよう。
            </p>
          </div>

          {/* 反省文記入フォーム */}
          <div className="w-full max-w-sm space-y-4 bg-white rounded-lg p-4 border-2 border-gray-300 shadow-sm">
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                タイトル
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="例：お散歩をさぼってしまいました"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label
                htmlFor="reflection"
                className="text-sm font-medium text-gray-700"
              >
                反省文
              </Label>
              <Textarea
                id="reflection"
                placeholder="わんちゃんへの気持ちや反省を書いてください..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="mt-1 min-h-24"
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 犬のシルエット */}
          <div className="w-40 h-40 flex items-center justify-center">
            <Image
              src="/images/sad-dog-silhouette.png"
              alt="悲しそうな犬のシルエット"
              width={160}
              height={160}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          {/* おくる（送信）ボタン */}
          <Button
            className={`w-32 text-white py-3 rounded-full shadow-md text-sm font-medium ${
              reflection.trim() && title.trim() && !isSubmitting
                ? 'bg-purple-400 hover:bg-purple-500'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={!reflection.trim() || !title.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                送信中...
              </div>
            ) : (
              'おくる'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
