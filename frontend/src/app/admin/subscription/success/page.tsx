// src/app/success/page.tsx

'use client';

import { CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export default function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 px-4 py-6">
      <div className="w-full max-w-xs">
        {/* Success Card */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                お支払い完了！
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                ありがとうございます。
                <br />
                決済が正常に処理されました。
              </p>
            </div>

            {/* Dog illustration placeholder */}
            <Image
              src="/images/success.png"
              alt="Success"
              width={400}
              height={400}
            />

            {/* Success message */}
            <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                プレミアム会員になりました
              </h2>
              <p className="text-sm text-green-700">
                わんちゃんとの会話をお楽しみください
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl h-14 text-lg font-medium shadow-lg"
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              ホームに戻る
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
