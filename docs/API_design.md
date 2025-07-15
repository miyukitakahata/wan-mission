# 📚API 設計書

わん 🐾 みっしょんのユーザー管理、設定ページ、毎日のミッション実施記録、反省文、犬のひとこと履歴、散歩の成功/失敗、Stripe 決済の管理をするための RESTful API です。

## 1. API 概要

- **ベース URL**：`http://localhost:8000/api`
- **スキーム**：`HTTP`
- **認証**：Firebase 認証
- **データ形式**：JSON
- **バージョン**：v1

---

## 2. エンドポイント一覧

本アプリではユーザーと設定（care_settings）は 1 対 1 で関連しており、`care_logs` や `reflection_notes` はその設定に対して記録される。`user_id` と `care_setting_id` は別の ID。

## 2.1 ユーザー管理

- **エンドポイント:** `/api/users/`
- **メソッド:** `GET`, `POST`
- **説明:** Firebase UID + UUID 管理、プラン管理（current_plan）付き

### 2.1-1 新規ユーザー登録

- POST`/api/users`
- Firebase 認証後にアプリ独自 DB にユーザー情報を登録する

**🔐 認証**

- Firebase トークンで UID を取得後に呼び出し（バックエンド側で UID を受け取る想定）

**📥 リクエスト例:**

```json
{
  "firebase_uid": "A1b2C3d4E5F6G7",
  "email": "user@example.com",
  "current_plan": "free",
  "is_verified": true
}
```

**📤 レスポンス例:**

```json
{
  "id": "1fc99ee4-87e6-4a58-bbeb-a8f122b4567d",
  "firebase_uid": "A1b2C3d4E5F6G7",
  "email": "user@example.com",
  "current_plan": "free",
  "is_verified": true,
  "created_at": "2025-06-14T08:00:00+09:00",
  "updated_at": "2025-06-14T08:00:00+09:00"
}
```

### 2.1-2 ログインユーザー情報取得

- GET`/api/users/me`
- Firebase の ID トークンにより、対象のユーザーを特定

**🔐 認証**

- Authorization ヘッダーに Firebase ID トークンが必要

```json
Authorization: Bearer <Firebase_ID_Token>
```

**📤 レスポンス例:**

```json
{
  "id": "1fc99ee4-87e6-4a58-bbeb-a8f122b4567d",
  "firebase_uid": "A1b2C3d4E5F6G7",
  "email": "user@example.com",
  "current_plan": "premium",
  "is_verified": true,
  "created_at": "2025-06-14T08:00:00+09:00",
  "updated_at": "2025-06-14T09:00:00+09:00"
}
```

現在、プラン変更（アップグレード）はユーザーが直接 PATCH するのではなく、Stripe Webhook 処理で自動更新を行う設計。

---

## 2.2 初回設定ページ

- **エンドポイント:** `/api/care_settings/`
- **メソッド:** `GET`, `POST`
- **説明:**
  - ユーザーごとのお世話設定情報を管理
  - 親・子ども・犬の名前、開始・終了期間、スケジュール時間帯、PIN パスワードなどを保存

### 2.2-1 新規登録（初回設定）

- POST`/api/care_settings`
- Firebase 認証後、ユーザー ID を自動で紐づけて登録

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 リクエスト例:**

```json
{
  "parent_name": "まゆみママ",
  "child_name": "さきちゃん",
  "dog_name": "ころん",
  "care_start_date": "2025-06-14",
  "care_end_date": "2025-07-14",
  "morning_meal_time": "07:00",
  "night_meal_time": "18:00",
  "walk_time": "17:00",　　
  "care_password": "1234",
  "care_clear_status": "not_cleared"
}
※ `user_id` はバックエンドで Firebase の認証情報から自動で紐づけ
```

**📤 レスポンス例:**

```json
{
  "id": 5,
  "user_id": "1fc99ee4-87e6-4a58-bbeb-a8f122b4567d",
  "parent_name": "まゆみママ",
  "child_name": "さきちゃん",
  "dog_name": "ころん",
  "care_start_date": "2025-06-14",
  "care_end_date": "2025-07-14",
  "morning_meal_time": "07:00:00",
  "night_meal_time": "18:00:00",
  "walk_time": "17:00:00",
  "care_password": "1234",
  "care_clear_status": "not_cleared",
  "created_at": "2025-06-14T08:00:00+09:00",
  "updated_at": "2025-06-14T09:00:00+09:00"
}
```

### 2.2-2 自分の設定情報を取得

- GET`/api/care_settings/me`
- Firebase トークンからユーザー特定し、そのユーザーの care_setting を 1 件取得

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📤 レスポンス例:**

```json
{
  "id": 5,
  "parent_name": "まゆみママ",
  "child_name": "さきちゃん",
  "dog_name": "ころん",
  "care_start_date": "2025-06-14",
  "care_end_date": "2025-07-14",
  "morning_meal_time": "07:00:00",
  "night_meal_time": "18:00:00",
  "walk_time": "17:00:00"
}
```

### 2.2-3 管理画面アクセス用 PIN 認証

- POST`/api/care_settings/verify_pin`
- 初回の `/api/care_settings` 登録時に保存される `"care_password"` を使って照合

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 リクエスト例:**

```json
{
  "input_password": "1234"
}
```

**📤 レスポンス例:**

```json
{
  "verified": true
}
```

※ PIN が一致しない場合：

```json
{
  "verified": false
}
```

---

## 2.3 お世話記録

- **エンドポイント:** `/api/care_logs/`
- **メソッド:** `GET`, `POST` ,`PATCH`
- **説明:**
  - 毎日の記録（朝ごはん・夜ごはん・散歩の実施状況など）を記録する
  - 1 日ごとに 1 件のレコード
  - `care_setting_id` はサーバー側で Firebase 認証から自動紐づけ

### 2.3-1 本日の記録を取得（保護者用）

- GET`/api/care_logs/today`
- 指定日の記録を取得し、ミッション達成状況を確認

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 クエリ例:**

```
/api/care_logs/today?care_setting_id=5&date=2025-06-14

```

**📤 レスポンス例:**

```json
{
  "care_log_id": 21,
  "fed_morning": true,
  "fed_night": false,
  "walked": true
}
```

✅ ※ 記録が無い場合

```json
{
  "care_log_id": null,
  "fed_morning": false,
  "fed_night": false,
  "walked": false
}
```

### 2.3-2 日付指定で記録を取得（振り返り用）

- **GET** `/api/care_logs/by_date`
- 任意の日付の記録を取得

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 クエリ例:**

```
/api/care_logs/by_date?care_setting_id=5&date=2025-07-13
```

**📤 レスポンス例:**

```json
{
  "care_log_id": 19,
  "fed_morning": true,
  "fed_night": true,
  "walked": false
}
```

✅ 記録が無い場合

```json
{
  "care_log_id": null,
  "fed_morning": false,
  "fed_night": false,
  "walked": false
}
```

### 2.3-3 新規記録（ミッション達成時）

- POST`/api/care_logs`
- 1 日 1 件。すでに記録がある場合はエラー。

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 リクエスト例:**

```json
{
  "date": "2025-07-14",
  "fed_morning": true,
  "fed_night": false,
  "walk_result": true,
  "walk_total_distance_m": 1023
}
```

**📤 レスポンス例:**

```json
{
  "id": 21,
  "care_setting_id": 5,
  "date": "2025-07-14",
  "fed_morning": true,
  "fed_night": false,
  "walk_result": true,
  "walk_total_distance_m": 1023,
  "created_at": "2025-07-14T09:15:00+09:00"
```

✅ ※ 既に同じ日付が存在する場合

```json
{
  "detail": "この日付の記録は既に存在します。PATCHで更新してください。"
}
```

### 2.3-4 既存ログの更新（後から夜ごはんを押したなど）

- PATCH`/api/care_logs/{id}`
- 指定 ID の記録を部分更新

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 リクエスト例(夜ごはんを後から追加):**

```json
{
  "fed_night": true
}
```

**📤 レスポンス例:**

```json
{
  "id": 21,
  "care_setting_id": 5,
  "date": "2025-07-14",
  "fed_morning": true,
  "fed_night": true,
  "walk_result": true,
  "walk_total_distance_m": 1200,
  "created_at": "2025-07-14T09:15:00+09:00"
}
```

### 2.3-5 全履歴を取得（管理画面）

- **GET** `/api/care_logs/list`
- 指定`care_setting_id`の全記録を取得

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 クエリ例:**

```
/api/care_logs/list?care_setting_id=5
```

**📤 レスポンス例:**

```json
{
  "care_logs": [
    {
      "id": 1,
      "date": "2025-07-10",
      "walk_result": true,
      "care_setting_id": 5
    },
    {
      "id": 2,
      "date": "2025-07-11",
      "walk_result": false,
      "care_setting_id": 5
    }
  ]
}
```

---

## 2.4 反省文

- **エンドポイント:** `/api/reflection_notes/`
- **メソッド:** `GET`, `POST` ,`PATCH`
- **説明:**  反省文は子供が書く／保護者の承認フラグ付き
  - 子どもが反省文を書く → 保護者が確認＆承認
  - 1 人のユーザーが複数書くケースを想定
  - `care_setting_id` はサーバー側で自動解決

### 2.4-1 反省文一覧を取得（保護者用）

- GET`/api/reflection_notes`
- ログインユーザー（保護者）の `care_setting_id` に紐づく全ての反省文を返却

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📤 レスポンス例:**

```json
[
  {
    "id": 1,
    "care_setting_id": 5,
    "content": "ねぼうしてあさごはんをわすれました。ころん、ごめんね。",
    "approved_by_parent": false,
    "created_at": "2025-06-14T10:00:00+09:00",
    "updated_at": "2025-06-14T10:00:00+09:00"
  },
  {
    "id": 2,
    "care_setting_id": 5,
    "content": "ころんのさんぽをわすれてしまった。つぎはきをつける！",
    "approved_by_parent": true,
    "created_at": "2025-06-15T09:45:00+09:00",
    "updated_at": "2025-06-15T10:00:00+09:00"
  }
]
```

### 2.4-2 子どもが反省文を新規投稿

- POST`/api/reflection_notes`
- ログインユーザーの `care_setting_id` に自動紐づけて新規保存

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 リクエスト例:**

```json
{
  "content": "ころんのさんぽをわすれてしまった。つぎはきをつける！"
}
```

**📤 レスポンス例:**

```json
{
  "id": 3,
  "care_setting_id": 5,
  "content": "ころんのさんぽをわすれてしまった。つぎはきをつける！",
  "approved_by_parent": false,
  "created_at": "2025-06-16T09:00:00+09:00",
  "updated_at": "2025-06-16T09:00:00+09:00"
}
```

✅ ※ サーバー側で

- care_setting_id 自動挿入
- approved_by_parent は初期値 false 固定

### 2.4-3 保護者が反省文を承認

- PATCH`/api/reflection_notes/{note_id}`
- 特定の反省文の `approved_by_parent` を更新

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 リクエスト例:**

```json
{
  "approved_by_parent": true
}
```

**📤 レスポンス例:**

```json
{
  "id": 3,
  "care_setting_id": 5,
  "content": "ころんのさんぽをわすれてしまった。つぎはきをつける！",
  "approved_by_parent": true,
  "created_at": "2025-06-16T09:00:00+09:00",
  "updated_at": "2025-06-16T10:00:00+09:00"
}
```

---

## 2.5 犬のひとこと履歴

- **エンドポイント:** `/api/message_logs/`
- **メソッド:** `POST`
- **説明:**  犬がひとことをしゃべる。有料会員は LLM ベース、無料会員は決まったセリフ
  - プレミアム判定：`users.current_plan === 'premium'` で切り分ける
  - DB には保存せず、その場で生成してフロントに返す

### 2.5-1 犬のひとこと生成 API

- POST`/api/message_logs/generate`
- ページを開いたときなどに呼び出し、その場で生成したメッセージをフロントに返す

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 リクエスト例（空送信 OK）:**

```json
{}
```

**📤 レスポンス例（固定 or LLM ベースを判定して返却）:**

✅ プレミアムプランの場合（LLM 生成例）

```json
{
  "message": "はみがきたいせつだわん"
}
```

✅ 無料プランの場合（固定メッセージ例）

```json
{
  "message": "わん！"
}
```

---

## 2.6 Stripe 決済のログ管理

- **エンドポイント:** `/api/payment/`
- **メソッド:** `POST`
- **説明:**
  - Stripe Checkout セッション生成
  - 決済ステータス確認
  - Webhook 経由の支払い記録は webhook_events 経由で内部処理する設計のため、ここで直接受け取らない

### 2.6-1 プレミアム購入を開始する（Stripe Checkout セッション作成）

- POST`/api/payment/checkout-session`
- フロントエンドで「購入」ボタンを押したときに呼ばれて、Stripe Checkout の決済ページ URL を返す

**🔐 認証**

```
Authorization: Bearer <Firebase_ID_Token>
```

**📥 リクエスト例（クライアント送信、リクエストボディは空）:**

```json
{}
```

**📤 レスポンス例（成功時）:**

```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_abc123"
}
```

**📤 レスポンス例（すでにプレミアムの場合）**

```json
{
  "detail": "すでにプレミアムプランです。再度の購入は不要です。"
}
```

- HTTP 400

**サーバー処理：**

1.  Firebase ID トークンから`firebase_uid`を特定
2.  ユーザーのプランを DB から確認
3.  すでに「premium」ならエラー返却（購入防止）
4.  Stripe Checkout セッションを生成
5.  セッション URL を返却

---

## 2.7 Stripe からの Webhook イベントの記録

- **エンドポイント:** `/api/webhook_events/`
- **メソッド:** `POST`
- **説明:**
  - Stripe から送られてくる Webhook イベントを監査用に**必ず記録**
  - 成功・失敗問わず全てログ保存
  - 処理済みは`processed=True`、エラー時は`error_message`を記録

### 2.7-1 Stripe Webhook イベントの受信処理

- POST`/api/webhook_events/`
- Stripe の Webhook エンドポイントに設定
- Stripe 側が自動送信するリクエストを受信して保存

**🔐 認証**

- Stripe が直接呼び出すため、API キーなどの認証はなし

**📥 リクエスト例（Stripe が自動送信 例）:**

```json
{
  "id": "evt_1xyz456",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_abc123",
      "payment_intent": "pi_1ABC123",
      "amount_total": 300,
      "currency": "jpy",
      "customer_email": "user@example.com",
      "status": "paid",
      "metadata": {
        "firebase_uid": "A1b2C3d4E5F6G7"
      }
    }
  }
}
```

**📤 レスポンス例:**

```json
{
  "message": "Webhook eventを保存しました"
}
```

**サーバー側の処理概要：**

1. JSON ボディを受信してパース
2. `webhook_events` テーブルに以下のデータを保存：

| フィールド名               | 値                                  |
| -------------------------- | ----------------------------------- |
| `id`                       | `evt_1xyz456`（Stripe イベント ID） |
| `event_type`               | `checkout.session.completed`        |
| `stripe_session_id`        | `cs_test_abc123`                    |
| `stripe_payment_intent_id` | `pi_1ABC123`                        |
| `customer_email`           | `user@example.com`                  |
| `amount`                   | 300                                 |
| `currency`                 | `"jpy"`                             |
| `payment_status`           | `"paid"`                            |
| `payload`                  | 受信したリクエスト全文（JSON）      |
| `processed`                | 初期値は`False`                     |
| `error_message`            | エラーがあれば記録、成功時は null   |

3.  `checkout.session.completed`の場合は即座に処理を試みて、payment 登録・ユーザー`current_plan`アップグレード

### 2.7-2 Webhook イベントをまとめて処理（内部管理用）

- POST `/api/webhook_events/process`
- Stripe からは呼ばれず、サーバー内部 or 管理用バッチ用
- DB に溜まった未処理イベントをまとめて処理
- 説明:
  - `processed=False`かつ`event_type=checkout.session.completed`なレコードを取得
  - 1 件ずつ `payment` テーブルに登録
  - ユーザーの`current_plan`を`premium`に更新
  - 成功したものは`processed=True`に更新
  - エラーは`error_message`を記録して次へ

**📥 リクエスト例(**管理用なので通常空送信**)**

```json
{}
```

**📤 レスポンス例（成功時）**

```json
{
  "message": "3 件のイベントを処理してpaymentテーブルに保存しました"
}
```

**📤 レスポンス例（未処理がない場合）**

```json
{
  "message": "未処理のWebhookイベントはありません"
}
```

**サーバー処理：**

1.  未処理イベントを全件取得
2.  1 件ずつ：

- payment テーブルに INSERT
- ユーザー current_plan を premium に更新
- 成功 →processed を True
- 失敗 →error_message を記録

---

## 3. ステータスコード

- `200 OK`: データ取得・更新成功
- `201 Created`: 新規作成成功
- `400 Bad Request`: リクエスト不正
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: 権限エラー
- `404 Not Found`: リソースなし
- `500 Internal Server Error`: サーバーエラー
