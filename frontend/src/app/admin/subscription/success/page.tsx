// src/app/success/page.tsx
import { useAuth } from '@/context/AuthContext';

const user = useAuth(); // 認証情報を取得

console.log('[SuccessPage] User:', user.currentUser);

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold text-green-600">
        決済が完了しました！ありがとうございます！
      </h1>
    </div>
  );
}
