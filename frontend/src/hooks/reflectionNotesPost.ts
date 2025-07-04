'use client';

// このファイルは、反省文を新規作成するためのAPIリクエストを送るhooksです。

import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase/config'; // → "[DEFAULT]" ならOK
import { ReflectionNoteCreateRequest } from '@/types/reflection';
// すでにFirebase初期化していると仮定

// 反省文を新規作成
export const createReflectionNote = async (content: string) => {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;

  if (!user) {
    throw new Error('ユーザーがログインしていません');
  }

  // ユーザーのIDトークンを取得
  const token = await user.getIdToken();
  console.log('🔥 Firebaseトークン:', token);
  console.log('🔥 送信データ:', content);

  const body: ReflectionNoteCreateRequest = {
    content,
  };

  // バックエンドのAPIにPOSTリクエストを送る
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reflection_notes`,
    {
      method: 'POST',
      headers: {
        // 送信データの形式をJSONと指定
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // リクエストボディに反省文の内容を含める
      body: JSON.stringify(body),
    }
  );

  let data;
  try {
    // 一度だけ JSON を読み取り、ログにも使う
    data = await res.json();
    console.log('🔥レスポンス内容', data);
  } catch (err) {
    console.error('🔥JSONの読み取りに失敗しました:', err);
    throw new Error('サーバーから無効なレスポンスが返されました');
  }

  // console.log('🔥レスポンスステータス', res.status);
  // console.log('🔥レスポンス内容', await res.text());

  // レスポンスが正常でない場合はエラーを投げる
  if (!res.ok) {
    throw new Error('Failed to create reflection note');
  }
  // 作成した反省文のデータを返す
  return res.json();
};
