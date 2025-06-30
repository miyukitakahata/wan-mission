// fetchでバックエンドの /api/walk を叩く関数

// 下記のコメントは開発中のみ、削除する予定
// 主な役割：バックエンド API との通信、散歩記録の保存・取得
// saveWalkRecord：今回の散歩距離、時間、結果などのデータをバックエンドへ送信する。
// determineWalkSuccess：距離に基づいて目標達成可否を判定する。

// 散步データの型定義
export interface WalkData {
  id?: string;
  userId?: string;
  date: string;
  distance: number; // メートル単位
  duration: number; // 秒単位
  startTime?: string;
  endTime?: string;
  success: boolean;
  route?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  }[];
}

// 散步結果の型定義
export interface WalkResult {
  success: boolean;
  message: string;
  data?: WalkData;
  error?: string;
}

// 散步ミッションの型定義
export interface WalkMission {
  id: string;
  title: string;
  description: string;
  targetDistance: number; // メートル単位
  targetDuration: number; // 秒単位
  reward?: string;
  isCompleted: boolean;
}

// API エンドポイントのベース URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// 散步記録を保存する関数
export const saveWalkRecord = async (walkData: any): Promise<WalkResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/walk_missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walkData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: '散歩記録が正常に保存されました',
      data: result,
    };
  } catch (error) {
    console.error('散歩記録保存エラー:', error);
    return {
      success: false,
      message: '散歩記録の保存に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// 散歩記録を更新するAPI
export const updateWalkRecord = async (
  id: number,
  walkData: Partial<WalkData>
): Promise<WalkResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/walk_missions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walkData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: '散歩記録が正常に更新されました',
      data: result,
    };
  } catch (error) {
    console.error('散歩記録更新エラー:', error);
    return {
      success: false,
      message: '散歩記録の更新に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ユーザーの散步履歴を取得する関数
export const getWalkHistory = async (userId?: string): Promise<WalkResult> => {
  try {
    const url = userId
      ? `${API_BASE_URL}/api/walk-missions/history?userId=${userId}`
      : `${API_BASE_URL}/api/walk-missions/history`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 必要に応じて認証ヘッダーを追加
        // "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: '散步履歴を正常に取得しました',
      data: result,
    };
  } catch (error) {
    console.error('散步履歴取得エラー:', error);
    return {
      success: false,
      message: '散步履歴の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// 散步ミッション一覧を取得する関数
export const getWalkMissions = async (): Promise<WalkResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/walk-missions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 必要に応じて認証ヘッダーを追加
        // "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: '散步ミッションを正常に取得しました',
      data: result,
    };
  } catch (error) {
    console.error('散步ミッション取得エラー:', error);
    return {
      success: false,
      message: '散步ミッションの取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// 特定の散步ミッションを取得する関数
export const getWalkMission = async (
  missionId: string
): Promise<WalkResult> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/walk-missions/${missionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 必要に応じて認証ヘッダーを追加
          // "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: '散步ミッションを正常に取得しました',
      data: result,
    };
  } catch (error) {
    console.error('散步ミッション取得エラー:', error);
    return {
      success: false,
      message: '散步ミッションの取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// 散步ミッションを完了としてマークする関数
export const completeWalkMission = async (
  missionId: string,
  walkData: WalkData
): Promise<WalkResult> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/walk-missions/${missionId}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 必要に応じて認証ヘッダーを追加
          // "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(walkData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: '散步ミッションが正常に完了しました',
      data: result,
    };
  } catch (error) {
    console.error('散步ミッション完了エラー:', error);
    return {
      success: false,
      message: '散步ミッションの完了に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// 散步統計を取得する関数
export const getWalkStats = async (
  userId?: string,
  period?: string
): Promise<WalkResult> => {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (period) params.append('period', period);

    const url = `${API_BASE_URL}/api/walk-missions/stats${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 必要に応じて認証ヘッダーを追加
        // "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: '散步統計を正常に取得しました',
      data: result,
    };
  } catch (error) {
    console.error('散步統計取得エラー:', error);
    return {
      success: false,
      message: '散步統計の取得に失敗しました',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// ローカルストレージ用のユーティリティ関数
export const saveWalkToLocalStorage = (walkData: any): void => {
  try {
    const existingWalks = JSON.parse(
      localStorage.getItem('walkHistory') || '[]'
    );
    existingWalks.push({
      ...walkData,
      id: Date.now().toString(), // ローカル用のID
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('walkHistory', JSON.stringify(existingWalks));
  } catch (error) {
    console.error('ローカルストレージ保存エラー:', error);
  }
};

export const getWalksFromLocalStorage = (): WalkData[] => {
  try {
    return JSON.parse(localStorage.getItem('walkHistory') || '[]');
  } catch (error) {
    console.error('ローカルストレージ取得エラー:', error);
    return [];
  }
};

// 散步成功判定のロジック
// 距離のみで1000 m 以上は成功
export const determineWalkSuccess = (
  distance: number,
  _duration: number,
  targetDistance?: number,
  _targetDuration?: number
): boolean => {
  // デフォルトの目標距離（設定されていない場合）
  const defaultTargetDistance = 1000; // 1000メートル

  const actualTargetDistance = targetDistance || defaultTargetDistance;

  // 距離のみで判定（1000メートル以上で成功）
  return distance >= actualTargetDistance;
};
