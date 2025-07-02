// src/firebase/config.ts
// Firebaseの初期化と認証モジュールの設定ファイル

// Firebase SDKから必要な関数をインポート
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebaseプロジェクトの設定情報
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Firebaseアプリを初期化（1回だけ実行）
const app = initializeApp(firebaseConfig);

// Firebaseの認証モジュールをエクスポート
const auth = getAuth(app);
export default auth;
