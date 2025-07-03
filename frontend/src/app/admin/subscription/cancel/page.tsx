// src/app/cancel/page.tsx

import { useAuth } from '@/context/AuthContext'; // 認証情報を取得するカスタムフック

export default function CancelPage() {
  const user = useAuth(); // 認証情報を取得

  console.log('[CancelPage] User:', user.currentUser);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600">
        決済をキャンセルしました。
      </h1>
    </div>
  );
}
