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
- **メソッド:** `GET`, `POST` ,`PATCH`
- **説明:** Firebase UID + UUID 管理、プレミアムフラグ（current_plan）付き

### 2.1-1 新規ユーザー登録

- POST`/api/users`
- Firebase 認証後にアプリ独自 DB にユーザー情報を登録する

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
  "created_at": "2025-06-14T08:00:00+09:00",　　- ユーザー作成日
  "updated_at": "2025-06-14T08:00:00+09:00"　　 - プラン更新（何か更新された時）
}
```

### 2.1-2 ユーザー情報取得

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
  "email": "user@example.com",
  "current_plan": "premium",
  "is_verified": true,
  "created_at": "2025-06-14T08:00:00+09:00",
  "updated_at": "2025-06-14T09:00:00+09:00"
}
```

### 2.1-3 ユーザープラン変更（アップグレード時）

- PATCH`/api/users/current_plan`

**📥 リクエスト例:**

```json
{
  "current_plan": "premium"
}
```

**📤 レスポンス例:**

```json
{
  "current_plan": "premium",
  "updated_at": "2025-06-14T09:00:00+09:00"
}
```

---

## 2.2 初回設定ページ

- **エンドポイント:** `/api/care_settings/`
- **メソッド:** `GET`, `POST` ,`PATCH`
- **説明:**  設定ページ情報（ママ・子供・犬の名前、スケジュール、PIN パスワードなど）

### 2.2-1 新規登録（初回設定）

- POST`/api/care_settings`

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
※ `user_id` はバックエンドで Firebase の認証情報から自動で紐づける前提
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

散歩（"walk_time"）：この時間までにしたい →first_walk_time と last_walk_time 作ってその間に散歩行ったかを判断する（実装時に微調整してくのがいいかも）

### 2.2-2 自分の設定情報を取得

- GET`/api/care_settings/me`
- 実装時、`verify_firebase_token()` でユーザー特定してから `care_settings.find_first(where={"user_id": user.id})`

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

### 2.2-3 再チャレンジ（設定のリセット or 編集）

- PATCH`/api/care_settings/:id`

**📥 リクエスト例（編集・再スタート時）:**

```json
{
  "care_start_date": "2025-06-15",
  "care_end_date": "2025-07-15",
  "care_clear_status": "not_cleared"
}
```

**📤 レスポンス例:**

```json
{
  "care_clear_status": "not_cleared"
}
```

### 2.2-4 管理画面アクセス用 PIN 認証

- POST`/api/care_settings/verify_pin`
- 初回の `/api/care_settings` 登録時に保存される `"care_password"` を使って照合

**📥 リクエスト例（編集・再スタート時）:**

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

### 2.2-5 ミッションクリア状態を更新

- PATCH`/api/care_settings/:id/clear` （一部更新（`care_clear_status` だけを変更）のため PUT ではなく PATCH メソッドを使用）
- ユーザーが設定した期間を全て達成したときに、`care_settings.care_clear_status` を `"cleared"` に更新する
- 失敗時は反省ページ（2.4）に遷移

**📥 リクエスト例:**

```json
{
  "care_clear_status": "cleared"
}
```

**📤 レスポンス例:**

```json
{
  "care_clear_status": "cleared"
}
```

---

## 2.3 お世話記録

- **エンドポイント:** `/api/care_logs/`
- **メソッド:** `GET`, `POST` ,`PATCH`
- **説明:**  毎日の記録（朝ごはん・夜ごはん・散歩の実施状況など）を記録する
  - 各日付ごとに 1 件のレコード
  - `care_setting_id` （サーバー側で自動挿入）は`care_settings.id` （設定ページの ID）と紐づけ

### 2.3-1 本日の記録を取得（保護者用）

- GET`/api/care_logs/today`

**📤 レスポンス例:**

```json
{
  "id": 1,
  "care_setting_id": 1,
  "date": "2025-06-14",
  "fed_morning": true,
  "fed_night": false,
  "created_at": "2025-06-14T08:00:00+09:00"
}
```

### 2.3-2 新規記録（初回ミッション達成時）

- POST`/api/care_logs`
- 通常は 1 日 1 件。すでに記録がある場合はエラーまたは `PATCH` へ誘導。

**📥 リクエスト例:**

```json
{
  "date": "2025-06-14",
  "fed_morning": true,
  "fed_night": false
}
```

**📤 レスポンス例:**

```json
{
  "id": 21,
  "care_setting_id": 5,
  "date": "2025-06-14",
  "fed_morning": true,
  "fed_night": false,
  "created_at": "2025-06-14T09:15:00+09:00"
}
```

### 2.3-3 既存ログの更新（後から夜ごはんを押したなど）

- PATCH`/api/care_logs/:id`

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
  "date": "2025-06-14",
  "fed_morning": true,
  "fed_night": true,
  "created_at": "2025-06-14T09:15:00+09:00"
}
```

---

## 2.4 反省文

- **エンドポイント:** `/api/reflection_notes/`
- **メソッド:** `GET`, `POST` ,`PATCH`
- **説明:**  反省文は子供が書く／保護者の承認フラグ付き
  - 子どもが反省文を書く → 保護者が確認＆承認
  - 承認される ＝ 再チャレンジボタン → 新しい `care_settings` を登録（＝リセット）
  - `care_setting_id` はサーバー側で自動挿入
  - `content` は文字数制限を行う

### 2.4-1 反省文一覧を取得（保護者用）

- GET`/api/reflection_notes`

**📤 レスポンス例:**

```json
{
  "id": 1,
  "care_setting_id": 5,
  "content": "ねぼうしてあさごはんをわすれました。ころん、ごめんね。",
  "approved_by_parent": false,
  "created_at": "2025-06-14T10:00:00+09:00",
  "updated_at": "2025-06-14T10:00:00+09:00"
}
```

### 2.4-2 子どもが反省文を新規投稿

- POST`/api/reflection_notes`
- `care_setting_id` はサーバー側で自動補完（ログイン中ユーザーの設定を取得）

**📥 リクエスト例:**

```json
{
  "content": "ころんのさんぽをわすれてしまった。つぎはきをつける！"
}
```

**📤 レスポンス例:**

```json
{
  "id": 2,
  "content": "ころんにごはんをわすれてしまった。つぎはきをつける！",
  "approved_by_parent": false,
  "created_at": "2025-06-14T10:15:00+09:00"
}
```

### 2.4-3 保護者が反省文を承認（再チャレンジボタン押下）

- PATCH`/api/reflection_notes/:id/approve`

**📥 リクエスト例:**

```json
{
  "approved_by_parent": true
}
```

**📤 レスポンス例:**

```json
{
  "approved_by_parent": true
}
```

---

## 2.5 犬のひとこと履歴

- **エンドポイント:** `/api/message_logs/`
- **メソッド:** `POST`
- **説明:**  犬がひとことをしゃべる。有料会員は LLM ベース、無料会員は決まったセリフ
  - 紐づく対象：`user_id` （UUID）は発話対象のユーザー
  - `is_llm_based` は Open AI による生成かどうか
  - プレミアム判定：`users.current_plan === 'premium'` で切り分ける
  - 無料ユーザー： `is_llm_based: false` の固定メッセージからランダム抽出
  - `content` は文字数制限を行う

### 2.5-1 最新の犬のひとことを取得 + 保存

- POST`/api/message_logs/generate`
- ユーザーがページを開いたときに呼ばれ、表示用のメッセージをバックエンドで生成し、そのまま保存してフロントエンドに返す

**📥 リクエスト例（クライアントは空送信 or ユーザー情報だけ）:**

```json
{}
```

**📤 レスポンス例（保存＋表示）:**

```json
{
  "id": 12,
  "user_id": "1fc99ee4-87e6-4a58-bbeb-a8f122b4567d",
  "content": "きょうもおさんぽありがとう！ころん うれしい！",
  "is_llm_based": true,
  "created_at": "2025-06-14T18:00:00+09:00"
}
```

※表示対象は `user_id` に紐づく最新のログ 1 件

---

## 2.6 散歩ミッション

- **エンドポイント:** `/api/walk_missions/`
- **メソッド:** `GET`, `POST` ,`PATCH`
- **説明:**  散歩の成功／失敗、保護者確認の有無、犬の悲しい一言などを記録

### 2.6-1 新規ミッション結果の登録

- POST`/api/walk_missions`
- 処理の流れ：
  1. 子どもが「散歩開始」ボタン押す → Geolocation API で距離測定
  2. 散歩終了後にフロントで距離を判定（1km 以上 or 未満）
  3. サーバーに「成功 or 失敗」結果を送信し、ミッション結果を記録

**📥 リクエスト例（失敗した場合）:**

```json
{
  "care_log_id": 31,
  "started_at": "2025-06-14T18:00:00+09:00",
  "ended_at": "2025-06-14T18:15:00+09:00"
  "total_distance_m": 1200,
  "resule": "success"
}
```

**📤 レスポンス例:**

```json
{
  "id": 18,
  "care_log_id": 31,
  "started_at": "2025-06-14T18:00:00+09:00",
  "ended_at": "2025-06-14T18:15:00+09:00"
  "total_distance_m": 1200,
  "resule": "success",
  "created_at": "2025-06-14T18:15:00+09:00"
}
```

### 2.6-2 一覧取得（保護者画面用）

- GET`/api/walk_missions`

**📤 レスポンス例:**

```json
[
  {
    "id": 18,
    "total_distance_m": 1200,
    "result": "success",
    "created_at": "2025-06-14T18:15:00+09:00"
  },
  {
    "id": 19,
    "total_distance_m": 900,
    "result": "failed",
    "created_at": "2025-06-15T18:00:00+09:00"
  }
]
```

---

## 2.7 Stripe 決済のログ 確認

- **エンドポイント:** `/api/payment/`
- **メソッド:** `GET`, `POST`
- **説明:** PaymentIntent ID、決済成功状態、課金時刻、Charge ID 等

### 2.7-1 プレミアム購入を開始する（Stripe Checkout セッション作成）

- POST`/api/payment/checkout-session`
- 説明：Stripe Checkout セッションを作成

**📥 リクエスト例（失敗した場合）:**

```json
{
  "product_name": "premium_plan"
}
```

**📤 レスポンス例:**

```json
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_test_abc123"
}
```

**サーバー処理：**

- Firebase の ID トークンから `firebase_uid` を取得
- Stripe Checkout セッションを生成
- `stripe_session_id` を取得して保存（or 保持）
- DB 書き込みは Webhook 側で実施するためここでは不要

### 2.7-2 購入ステータスを確認

- GET`/api/payment/status`
- 説明：管理者画面で現在の購入ステータスを取得。Firebase 認証必須。

**📤 レスポンス例:**

```json
{
  "plan": "premium",
  "purchased_at": "2025-06-14T10:15:00+09:00",
  "payment_intent_id": "pi_1ABC123",
  "status": "paid"
}
```

**サーバー処理：**

- Firebase の ID トークンから `firebase_uid` を取得
- `payment` テーブルから `status = 'paid'` の最新レコードを取得
- プラン情報などと合わせて返却

### 2.7-3 支払い情報を記録

- POST`/api/payment/webhook`
- 説明：Stripe Webhook を受け取って支払い情報を記録

**📥 リクエスト例（Stripe から自動送信）:**

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
      "payment_status": "paid"
    }
  }
}
```

**📤 レスポンス例:**

```json
{
  "status": "ok"
}
```

**サーバー処理の流れ：**

1. Stripe 署名を検証（セキュリティ）
2. 受け取った`stripe_session_id`をもとに重複を確認
3. `payment` テーブルに以下の情報を登録：

| 項目                       | 値の取得元                                   |
| -------------------------- | -------------------------------------------- |
| `stripe_session_id`        | `object.id`                                  |
| `stripe_payment_intent_id` | `object.payment_intent`                      |
| `amount`                   | `object.amount_total`                        |
| `currency`                 | `object.currency`                            |
| `status`                   | `object.payment_status`                      |
| `firebase_uid`             | セッションの metadata に含めておくと取得可能 |
| `created_at`               | 現在時刻                                     |

---

## 2.8 Stripe からの Webhook イベントの記録

- **エンドポイント:** `/api/webhook_events/`
- **メソッド:** `GET`, `POST`
- **説明:** Stripe から送られてくる Webhook 通知を記録・監査するための内部用途 API。「成功していようが失敗していようが、すべて記録する」ことを目的とする。

### 2.8-1 Stripe Webhook イベントの受信処理

- POST`/api/webhook-events/stripe`

**📥 リクエスト例（Stripe が自動送信）:**

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
      "payment_status": "paid"
    }
  }
}
```

**📤 レスポンス例:**

```json
{
  "status": "ok"
}
```

**サーバー側の処理概要：**

1. Stripe 署名を検証（ヘッダー `Stripe-Signature`）
2. `webhook_events` テーブルに以下のデータを保存：

| フィールド名               | 値                                       |
| -------------------------- | ---------------------------------------- |
| `id`                       | `evt_1xyz456`（Stripe イベント ID）      |
| `event_type`               | `checkout.session.completed`             |
| `stripe_session_id`        | `cs_test_abc123`（Checkout Session ID）  |
| `stripe_payment_intent_id` | `pi_1ABC123`                             |
| `customer_email`           | `user@example.com`                       |
| `amount`                   | 300                                      |
| `currency`                 | `"jpy"`                                  |
| `payment_status`           | `"paid"`                                 |
| `payload`                  | 受信したリクエスト全文（JSON）           |
| `received_at`              | 処理時のタイムスタンプ                   |
| `processed`                | `true` または `false`（処理成功で true） |
| `error_message`            | エラーがあれば記録、成功時は null        |

処理が成功すれば `processed: true`、エラー時は `false` + `error_message` を記録

### 2.8-2 Webhook イベントの詳細取得

- GET`/api/webhook-events/:id`

**📤 レスポンス例:**

```json
{
  "id": "evt_1xyz456",
  "event_type": "checkout.session.completed",
  "stripe_session_id": "cs_test_abc123",
  "stripe_payment_intent_id": "pi_1ABC123",
  "customer_email": "user@example.com",
  "amount": 300,
  "currency": "jpy",
  "payment_status": "paid",
  "processed": true,
  "error_message": null,
  "payload": {
    "id": "evt_1xyz456",
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_abc123",
        "payment_intent": "pi_1ABC123",
        "amount_total": 300,
        "currency": "jpy",
        "customer_email": "user@example.com",
        "payment_status": "paid"
      }
    }
  },
  "received_at": "2025-06-14T10:14:59+09:00"
}
```

**サーバー処理：**

- Firebase の ID トークンから `firebase_uid` を取得
- `payment` テーブルから `status = 'paid'` の最新レコードを取得
- プラン情報などと合わせて返却

---

## 3. ステータスコード

- `200 OK`: 正常終了
- `201 Created`: リソース作成
- `400 Bad Request`: リクエストエラー
- `401 Unauthorized`: 認証エラー
- `404 Not Found`: リソース未検出
