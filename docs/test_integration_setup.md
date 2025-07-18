# 🧪 統合テスト設置・実行ガイド

## 📋 現在の統合テスト状況

### ✅ **完了済み**

- **Backend**: `backend/tests/integration/`

  - `test_integration.py` - お世話フロー統合テスト
  - `test_api_endpoints.py` - 全 API エンドポイント統合テスト
  - `test_database_integration.py` - データベース統合テスト

- **Frontend**: `frontend/src/tests/integration/`
  - `auth-flow.test.tsx` - 認証フロー統合テスト
  - `care-log-flow.test.tsx` - お世話ログフロー統合テスト
  - `payment-flow.test.tsx` - 決済フロー統合テスト

---

## 🔧 1. 環境設置

### **Backend 設置**

```bash
cd backend

# requirements.txtに必要なパッケージを追加

pytest==8.2.2
pytest-asyncio==0.23.7
pytest-cov==6.0.0
httpx==0.27.0

# 仮想環境の有効化後、必要パッケージのインストールを実行
pip install -r requirements.txt
```

### **Frontend 設置**

```bash
cd frontend

# テスト依賴関係をインストール
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest

# Next.js Jest設定追加
npm install --save-dev jest-environment-jsdom

# Next.js babel追加
npm install --save-dev @babel/preset-react @babel/preset-typescript babel-jest
```

### **Jest 設定ファイル作成**

`frontend/jest.integration.config.js`:

詳細はファイル内にてご確認ください

`frontend/jest.setup.js`:

詳細はファイル内にてご確認ください

---

## 🚀 2. テスト実行方法

### **Backend テスト実行**

```bash
cd backend

# テスト実行＋カバレッジ確認
PYTHONPATH=. pytest tests/integration/ --cov=app --cov-report=html --cov-report=term-missing

# カバレッジレポート確認
open htmlcov/index.html
```

### **Frontend テスト実行**

```bash
cd frontend

# package.json にスクリプト追加
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest tests/integration",
    "test:integration:coverage": "jest --config jest.integration.config.js --coverage"
    "test:ci": "jest --coverage --watchAll=false"
  }
}

# テスト実行
npm run test:integration

# カバレッジ付きテスト
npm run test:integration:coverage
```

---

## 📊 3. カバレッジ目標とチェックポイント

### **目標カバレッジ: 80%**

### **重点測定項目**

#### **Backend API カバレッジ**

- ✅ Users API (`/api/users/`, `/api/users/me`)
- ✅ Care Settings API (`/api/care_settings/*`)
- ✅ Care Logs API (`/api/care_logs/*`)
- ✅ Reflection Notes API (`/api/reflection_notes/*`)
- ✅ Payments API (`/api/payments/*`)
- ✅ Message Logs API (`/api/message_logs/*`)
- ✅ Webhook Events API (`/api/webhook_events/*`)

#### **Frontend フロー カバレッジ**

- ✅ 認証フロー (ログイン → ダッシュボード)
- ✅ お世話ログフロー (タスク完了 → 状態更新)
- ✅ 散歩フロー (GPS → 距離計測 → 完了)
- ✅ 決済フロー (プラン購入 → Stripe 連携)

#### **データベース統合性**

- ✅ ユーザー ↔ お世話設定の関係
- ✅ お世話設定 ↔ ログの関係
- ✅ カスケード削除の動作
- ✅ 制約違反のハンドリング

---

## 🎯 4. 追加で必要な統合テスト

### **優先度: 高** 🔥

1. **E2E（End-to-End）テスト**

   ```bash
   # Playwrightのインストール
   cd frontend
   npm install --save-dev @playwright/test

   # E2Eテスト作成例
   # tests/e2e/complete-user-journey.spec.ts
   ```

2. **Firebase Authentication 統合テスト**

   - 実際の Firebase Emulator を使用したテスト
   - トークン検証の統合テスト

3. **Stripe Webhook 統合テスト**
   - 実際の Stripe CLI を使用した Webhook テスト
   - 決済フロー完全結合テスト

### **優先度: 中** ⚡

4. **リアルタイム機能テスト**

   - GPS 位置追跡の精度テスト
   - WebSocket 接続テスト（もしあれば）

5. **エラーハンドリング統合テスト**
   - ネットワークエラー時の動作
   - API 制限時の fallback 動作

---

## 🔧 5. テスト実行スクリプト

### **全体統合テスト実行スクリプト**

`scripts/run_integration_tests.sh`:

```bash
#!/bin/bash
set -e

echo "🧪 統合テスト実行開始..."

# Backend 統合テスト
echo "🐍 Backend 統合テスト実行中..."
cd backend
pytest tests/integration/ --cov=app --cov-report=html --cov-report=term-missing

# Frontend 統合テスト
echo "🎨 Frontend 統合テスト実行中..."
cd ../frontend
npm run test:coverage

echo "✅ 統合テスト完了！"
echo "📊 カバレッジレポート:"
echo "Backend: backend/htmlcov/index.html"
echo "Frontend: frontend/coverage/lcov-report/index.html"
```

### **CI/CD 用テストスクリプト**

`.github/workflows/integration-tests.yml`:

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install Backend Dependencies
        run: |
          cd backend
          pip install -r requirements.txt

      - name: Install Frontend Dependencies
        run: |
          cd frontend
          npm ci

      - name: Run Backend Integration Tests
        run: |
          cd backend
          pytest tests/integration/ --cov=app --cov-fail-under=80

      - name: Run Frontend Integration Tests
        run: |
          cd frontend
          npm run test:ci
```

---

## 📝 6. テスト実行時のチェックリスト

### **統合テスト実行前**

- [ ] データベースが起動している
- [ ] 環境変数が正しく設定されている
- [ ] 依存関係がインストールされている

### **テスト実行中**

- [ ] Backend 統合テストが全て通過する
- [ ] Frontend 統合テストが全て通過する
- [ ] カバレッジが 80%以上を達成している

### **テスト完了後**

- [ ] カバレッジレポートを確認する
- [ ] 失敗したテストがあれば原因を調査する
- [ ] 新しい機能に対応するテストを追加する

---

これで統合テストの設置と実行が完了です！ 🎉
