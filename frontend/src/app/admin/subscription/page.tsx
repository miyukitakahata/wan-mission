'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // radixui/button
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Crown,
  MessageCircle,
  Heart,
  Check,
  Lock,
  Shield,
} from 'lucide-react'; // lucide-reactアイコン

export default function SubscriptionPage() {
  const router = useRouter(); // Next.jsのフックページ遷移などに使う
  const [isSubscribed, setIsSubscribed] = useState(false); // サブスク未登録状態
  const [paymentData, setPaymentData] = useState({
    // 決済情報の初期値
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'credit',
  });
  const [showPaymentForm, setShowPaymentForm] = useState(true);

  const handlePayment = async () => {
    // 実際の実装では、ここでStripe決済処理を行います
    try {
      // Stripe決済処理のプレースホルダー
      console.log('Stripe決済処理開始', paymentData);

      // 決済成功のシミュレーション
      setTimeout(() => {
        setIsSubscribed(true);
        alert(
          '決済が完了しました！プレミアムプランにご加入いただきありがとうございます！'
        );
      }, 2000);
    } catch (error) {
      alert('決済処理中にエラーが発生しました。もう一度お試しください。');
    }
  };

  // TODO_DBにデータを更新追加
  const handleInputChange = (field: string, value: string) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  // TODO_DBにデータを更新追加
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return v;
  };
  // TODO_DBにデータを更新追加
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const features = [
    {
      icon: MessageCircle,
      title: 'わんことおはなし機能',
      description:
        'AIを使ってわんちゃんと楽しく会話ができます。わんちゃんの気持ちがもっとわかるようになります！',
      color: 'text-blue-500',
    },
    {
      icon: Heart,
      title: '保護犬・保護猫支援',
      description:
        '月額料金の一部が保護犬・保護猫団体に寄付されます。あなたのお世話が困っている動物たちの支援につながります。',
      color: 'text-red-500',
    },
  ];

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
          <h1 className="text-xl font-bold">サブスクリプション</h1>
        </div>

        {/* プレミアムプラン紹介 */}
        <Card className="mb-6 shadow-lg border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="pb-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <Crown className="h-8 w-8 text-yellow-500 mr-2" />
              <h2 className="text-xl font-bold text-orange-800">
                わん🐾みっしょん
              </h2>
            </div>
            <h3 className="text-xl font-bold text-orange-800">プレミアム</h3>
            <div className="mt-3">
              <span className="text-3xl font-bold text-orange-800">¥300</span>
              <span className="text-sm text-orange-600">/月</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-orange-200"
                  >
                    <Icon
                      className={`h-6 w-6 ${feature.color} mt-0.5 flex-shrink-0`}
                    />
                    <div>
                      <h3 className="font-medium text-orange-800 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-orange-700">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <Heart className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  社会貢献について
                </span>
              </div>
              <p className="text-xs text-green-700">
                プレミアム会員の皆様からの月額料金の一部（約30円）は、保護犬・保護猫団体への寄付として活用されます。
                あなたのわんちゃんとの楽しい時間が、困っている動物たちの支援につながります。
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            {isSubscribed && (
              <div className="w-full text-center">
                <div className="flex items-center justify-center mb-2">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">
                    プレミアム会員です
                  </span>
                </div>
                <Button variant="outline" className="w-full">
                  プランを管理
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* 決済フォーム */}
        {showPaymentForm && !isSubscribed && (
          <Card className="mb-6 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-center">
                <Lock className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-bold">プレミアム会員に加入する</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 決済方法選択 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="paymentMethod"
                    className="text-sm font-medium"
                  >
                    決済方法
                  </Label>
                  <Select
                    value={paymentData.paymentMethod}
                    onValueChange={(value) =>
                      handleInputChange('paymentMethod', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="決済方法を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">クレジットカード</SelectItem>
                      <SelectItem value="debit">デビットカード</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* カード情報入力 */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="cardholderName"
                      className="text-sm font-medium"
                    >
                      カード名義人
                    </Label>
                    <Input
                      id="cardholderName"
                      placeholder="YAMADA TARO"
                      value={paymentData.cardholderName}
                      onChange={(e) =>
                        handleInputChange('cardholderName', e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-sm font-medium">
                      カード番号
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) =>
                        handleInputChange(
                          'cardNumber',
                          formatCardNumber(e.target.value)
                        )
                      }
                      maxLength={19}
                      className="text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="expiryDate"
                        className="text-sm font-medium"
                      >
                        有効期限
                      </Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) =>
                          handleInputChange(
                            'expiryDate',
                            formatExpiryDate(e.target.value)
                          )
                        }
                        maxLength={5}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-sm font-medium">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) =>
                          handleInputChange(
                            'cvv',
                            e.target.value.replace(/\D/g, '').slice(0, 4)
                          )
                        }
                        maxLength={4}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* セキュリティ情報 */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-blue-800 font-medium mb-1">
                        安全な決済
                      </p>
                      <p className="text-xs text-blue-700">
                        お客様のカード情報は暗号化され、安全に処理されます。
                        決済処理にはStripeを使用しており、PCI
                        DSS準拠の高いセキュリティ基準を満たしています。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 月額料金確認 */}
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-800">
                      料金
                    </span>
                    <span className="text-lg font-bold text-yellow-800">
                      ¥300
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    1回限りのお支払いです。以降の自動課金はありません。
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentForm(false)}
              >
                キャンセル
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                onClick={handlePayment}
                disabled={
                  !paymentData.cardNumber ||
                  !paymentData.expiryDate ||
                  !paymentData.cvv ||
                  !paymentData.cardholderName
                }
              >
                <Lock className="mr-2 h-4 w-4" />
                決済する
              </Button>
            </CardFooter>
          </Card>
        )}

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
