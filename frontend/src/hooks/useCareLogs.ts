'use client';

import { useState, useEffect } from 'react';

// バックエンドからどんなデータ型でもらうのかを定義
export interface CareLog {
  date: string;
  fed_morning: boolean;
  fed_night: boolean;
}

export function useCareLogs() {
  // バックエンドから取ったケアログを入れる
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  // ローディング状態とエラーメッセージを管理
  const [loading, setLoading] = useState(true);
  // エラーが起きたらここにメッセージを入れる
  const [error, setError] = useState('');

  // 実際にバックエンドからデータを取ってくる関数
  const fetchCareLogs = async () => {
    // 最初にローディング中の状態にする（読み込み開始）
    setLoading(true);
    setError('');
    try {
      // バックエンドのFastAPIに直接GETリクエスト
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/care_logs/today`,
        {
          credentials: 'include', // 認証Cookieが必要なら
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // サーバーから来たレスポンスをJSONに変換
      const data = await res.json();

      // 取得したデータを画面で使えるようにstateにセット
      setCareLogs(data);

      // エラーがあればここでキャッチ
    } catch (err) {
      console.error(err);
      setError('ケアログの取得に失敗しました');
      // 最後にローディング終了(読み込み終了)
    } finally {
      setLoading(false);
    }
  };

  // 画面が最初に表示されたタイミングで、一度だけ fetchCareLogs を実行
  useEffect(() => {
    fetchCareLogs();
  }, []);

  // 更新した際に再度データを取得できるようにするため、refetch関数も定義
  return { careLogs, loading, error, refetch: fetchCareLogs };
}
