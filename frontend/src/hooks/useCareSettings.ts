'use client';

import { useState, useEffect } from 'react';

// バックエンドからどんなデータ型でもらうのかを定義
export interface CareSettings {
  parent_name: string;
  child_name: string;
  dog_name: string;
  care_start_date: string;
  care_end_date: string;
}

export function useCareSettings() {
  // バックエンドから取った設定を入れる
  const [careSettings, setCareSettings] = useState<CareSettings | null>(null);
  // ローディング状態とエラーメッセージを管理
  const [loading, setLoading] = useState(true);
  // エラーが起きたらここにメッセージを入れる
  const [error, setError] = useState('');

  // 実際にバックエンドからデータを取ってくる関数
  const fetchCareSettings = async () => {
    // 最初にローディング中の状態にする（読み込み開始）
    setLoading(true);
    setError('');
    try {
      // バックエンドのFastAPIに直接GETリクエスト
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/care_settings/me`,
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
      setCareSettings({
        parent_name: data.parent_name,
        child_name: data.child_name,
        dog_name: data.dog_name,
        care_start_date: data.care_start_date,
        care_end_date: data.care_end_date,
      });

      // エラーがあればここでキャッチ
    } catch (err) {
      console.error(err);
      setError('情報の取得に失敗しました');

      // 最後にローディング終了(読み込み終了)
    } finally {
      setLoading(false);
    }
  };

  // 画面が最初に表示されたタイミングで、一度だけ fetchCareSettings を実行
  // →「ページ開いたら自動でサーバーからデータを取ってくる」仕組み
  useEffect(() => {
    fetchCareSettings();
  }, []);

  // 更新した際に再度データを取得できるようにするため、refetch関数も定義
  return { careSettings, loading, error, refetch: fetchCareSettings };
}
