'use client';

import type React from 'react';

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
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Dog } from 'lucide-react'; // lucide-reactアイコン

export default function OnboardingLoginPage() {
  // DB：usersテーブルに対応
  const router = useRouter(); // Next.jsのフックページ遷移などに使う
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState(''); // email,pin未入力
  const [showPin, setShowPin] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && pin && pin.length === 4) {
      // ログイン情報を保存（管理者認証でも使用できるように）
      const loginSettings = {
        email,
        pin,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('loginSettings', JSON.stringify(loginSettings));

      if (isNewUser) {
        // 新規ユーザーの場合、ご家族の情報入力へ
        router.push('/onboarding/name');
      } else {
        // 既存ユーザーの場合、ダッシュボードへ
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
          <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Dog className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-center">わん🐾みっしょん</h1>
          <Progress value={40} className="w-full" />
          <p className="text-center text-base text-muted-foreground">
            ステップ 2/5
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          {/* ユーザータイプ選択 */}
          <div className="relative mb-6 bg-gray-100 rounded-lg p-1 overflow-hidden">
            <div
              className={`absolute bottom-0 left-0 h-1 w-1/2 bg-black rounded transition-transform duration-300 ${
                isNewUser ? 'translate-x-0' : 'translate-x-full'
              }`}
            />
            <Button
              variant="ghost"
              className={`flex-1 text-sm z-10 relative ${
                isNewUser ? 'text-black font-bold' : 'text-muted-foreground'
              }`}
              onClick={() => setIsNewUser(true)}
            >
              新規登録
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 text-sm z-10 relative ${
                !isNewUser ? 'text-black font-bold' : 'text-muted-foreground'
              }`}
              onClick={() => setIsNewUser(false)}
            >
              ログイン
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-base flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="pin"
                className="text-base flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                4桁PIN
              </Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(value);
                  }}
                  required
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
              {isNewUser && (
                <p className="text-sm text-muted-foreground">
                  覚えやすい4桁の数字を設定してください
                </p>
              )}
            </div>

            {!isNewUser && (
              <div className="text-right">
                <Button
                  variant="link"
                  className="text-sm text-orange-600 hover:text-orange-700 p-0"
                >
                  パスワードをお忘れですか？
                </Button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-base py-3"
              disabled={!email || !pin || pin.length !== 4}
            >
              {isNewUser ? '新規登録して続ける' : 'ログインして続ける'}
            </Button>
          </form>

          {isNewUser && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                新規登録の場合、次のステップでご家族の情報を入力していただきます。
                設定したPINは管理者画面へのアクセスにも使用できます。
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/onboarding/welcome')}
            className="w-1/3 text-sm py-3"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <div className="w-2/3 ml-2 text-center">
            <p className="text-xs text-muted-foreground">
              続行することで
              <Button variant="link" className="text-xs p-0 h-auto">
                利用規約
              </Button>
              に同意したものとみなします
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
