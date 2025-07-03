// src/app/success/page.tsx

import { useAuth } from '@/context/AuthContext'; // 認証情報を取得するカスタムフック

export default function SuccessPage() {
  const user = useAuth(); // 認証情報を取得

  console.log('[NamePage] User:', user.currentUser);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-green-600">
        決済が完了しました！ありがとうございます！
      </h1>
    </div>
  );
}
