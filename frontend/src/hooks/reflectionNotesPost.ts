// src/utils/reflectionNotes.ts

// 反省文を新規作成
export const createReflectionNote = async (content: string) => {
  // バックエンドのAPIにPOSTリクエストを送る
  const res = await fetch('http://localhost:8000/api/reflection_notes', {
    method: 'POST',
    headers: {
      // 送信データの形式をJSONと指定
      'Content-Type': 'application/json',
    },
    // リクエストボディに反省文の内容を含める
    body: JSON.stringify({ content }),
  });

  // レスポンスが正常でない場合はエラーを投げる
  if (!res.ok) {
    throw new Error('Failed to create reflection note');
  }
  // 作成した反省文のデータを返す
  return res.json();
};
