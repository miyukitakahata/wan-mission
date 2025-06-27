'use client';

import { useState, useEffect } from 'react';

export interface CareSettings {
  parent_name: string;
  child_name: string;
  dog_name: string;
  care_start_date: string;
  care_end_date: string;
}

export function useCareSettings() {
  const [careSettings, setCareSettings] = useState<CareSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCareSettings = async () => {
    setLoading(true);
    setError('');
    try {
      // バックエンドのFastAPIに直接GET
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/care_settings/me`,
        {
          credentials: 'include', // 認証Cookieが必要なら
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      setCareSettings({
        mom_name: data.parent_name,
        child_name: data.child_name,
        dog_name: data.dog_name,
        care_start_date: data.care_start_date,
        care_end_date: data.care_end_date,
      });
    } catch (err) {
      console.error(err);
      setError('情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareSettings();
  }, []);

  return { careSettings, loading, error, refetch: fetchCareSettings };
}
