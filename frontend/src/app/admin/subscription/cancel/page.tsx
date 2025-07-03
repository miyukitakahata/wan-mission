// src/app/cancel/page.tsx

'use client';

import { XCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 p-4">
      <div className="max-w-sm mx-auto">
        {/* Cancel Card */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                お支払いがキャンセルされました
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed">
                決済処理が中断されました。
                <br />
                いつでも再度お試しいただけます。
              </p>
            </div>

            {/* Dog illustration placeholder */}
            <Image
              src="/images/cancel.png"
              alt="Cancel"
              width={400}
              height={400}
            />

            {/* Info message */}
            <div className="bg-orange-50 rounded-2xl p-4 mb-6 border border-orange-200">
              <h2 className="text-lg font-semibold text-orange-800 mb-2">
                💡 お支払いについて
              </h2>
              <p className="text-sm text-orange-700">
                料金は発生していません。
                <br />
                準備ができたらいつでもお試しください。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-14 text-lg font-medium shadow-lg"
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
