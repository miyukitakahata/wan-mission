// src/app/cancel/page.tsx
import { useAuth } from '@/context/AuthContext';

const user = useAuth(); // 認証情報を取得

console.log('[CancelPage] User:', user.currentUser);

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600">
        決済をキャンセルしました。
      </h1>
    </div>
  );
}
