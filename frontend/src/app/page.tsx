'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ユーザーの認証状態を取得するカスタムフック追加
// import { redirect } from "next/navigation";

export default function Home() {
  const router = useRouter();
  //   ユーザーの情報取得
  //   const { user } = useAuth();

  useEffect(() => {
    router.push('/onboarding');
  }, [router]);

  return null;
}
//   if (user) {
//     redirect("/dashboard");
//   } else {
//     redirect("/onboarding");
//   }
// }
