'use client';

import { formatInTimeZone } from 'date-fns-tz';
import { useState, useEffect } from 'react';

// バックエンドからどんなデータ型でもらうのかを定義
export interface CareLogToday {
  care_log_id: number | null;
  fed_morning: boolean;
  fed_night: boolean;
  walked: boolean;
}

export function useCareLogs(careSettingId: number) {
  // バックエンドから取ったケアログを入れる
  const [careLog, setCareLog] = useState<CareLogToday | null>(null);
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
      console.log('[useCareLogs] fetchCareLogs start');

      // 日本時間の「今日」を文字列にする
      const todayJapan = formatInTimeZone(
        new Date(),
        'Asia/Tokyo',
        'yyyy-MM-dd'
      );
      console.log('[useCareLogs] todayJapanの確認:', todayJapan);

      // バックエンドのFastAPIに直接GETリクエスト
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/care_logs/by_date?care_setting_id=${careSettingId}&date=${todayJapan}`,
        {
          credentials: 'include', // 認証Cookieが必要なら
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          // 記録なし（デフォルト値扱い）
          console.log('[useCareLogs] No care_log found (404)');
          setCareLog(null);
          return;
        }
        // それ以外のエラーは例外を投げる
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // サーバーから来たレスポンスをJSONに変換
      const data = await res.json();

      console.log('useCareLogsのfetchデータ確認:', data);
      // 取得したデータを画面で使えるようにstateにセット
      setCareLog(data);

      // エラーがあればここでキャッチ
    } catch (err) {
      console.error('[useCareLogs] fetchCareLogs error:', err);
      setError('ケアログの取得に失敗しました');
      // 最後にローディング終了(読み込み終了)
    } finally {
      setLoading(false);
    }
  };

  // 画面が最初に表示されたタイミングで、一度だけ fetchCareLogs を実行
  useEffect(() => {
    if (careSettingId) {
      fetchCareLogs();
    }
  }, [careSettingId]);

  // 更新した際に再度データを取得できるようにするため、refetch関数も定義
  return { careLog, loading, error, refetch: fetchCareLogs };
}
