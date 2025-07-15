import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock
from app.main import app
from app.dependencies import verify_firebase_token

# FastAPIアプリをTestClientに渡す
client = TestClient(app)


@pytest.fixture
def mock_prisma(monkeypatch):
    """
    prisma_clientをモックする
    """
    mock_client = AsyncMock()

    # user.find_unique
    mock_client.users.find_unique.return_value = AsyncMock(id=1)

    # care_setting.find_first
    mock_client.care_settings.find_first.return_value = AsyncMock(id=10)

    # care_logs.find_first → 既存ログなし
    mock_client.care_logs.find_first.return_value = None

    # care_logs.create → 作成成功
    mock_client.care_logs.create.return_value = AsyncMock(
        id=123,
        care_setting_id=10,
        date="2025-07-01",
        fed_morning=True,
        fed_night=False,
        walk_result=True,
        walk_total_distance_m=1000,
    )

    # prisma_clientを実際のappに差し替える
    monkeypatch.setattr("app.routers.care_logs.prisma_client", mock_client)

    # Firebase認証をモック
    app.dependency_overrides[verify_firebase_token] = lambda: "test-uid"

    return mock_client


# POST /api/care_logs のテストコード
# 正常系
def test_create_success(mock_prisma):
    """
    正常系：care_logを新規登録できる
    """
    request_payload = {
        "date": "2025-07-01",
        "fed_morning": True,
        "fed_night": False,
        "walk_result": True,
        "walk_total_distance_m": 1000,
    }

    # テストクライアントでPOST
    response = client.post(
        "/api/care_logs",
        json=request_payload,
        headers={"Authorization": "Bearer test-token"},
    )
    assert response.status_code == 201
    data = response.json()

    # モックした戻り値と一致することを確認
    assert data["id"] == 123
    assert data["date"] == "2025-07-01"
    assert data["fed_morning"] is True
    assert data["fed_night"] is False
    assert data["walk_result"] is True
    assert data["walk_total_distance_m"] == 1000

    # prisma_clientの呼び出しを確認
    mock_prisma.users.find_unique.assert_awaited_once()
    mock_prisma.care_settings.find_first.assert_awaited()
    mock_prisma.care_logs.create.assert_awaited_once()


# 異常系
def test_create_conflict_error(mock_prisma):
    """
    異常系：同じ日付の記録が既に存在する場合
    """
    # 既存ログがあるようにモックを変更
    mock_prisma.care_logs.find_first.return_value = AsyncMock(id=999)

    request_payload = {
        "date": "2025-07-01",
        "fed_morning": True,
        "fed_night": False,
        "walk_result": True,
        "walk_total_distance_m": 1000,
    }

    response = client.post(
        "/api/care_logs",
        json=request_payload,
        headers={"Authorization": "Bearer test-token"},
    )

    # 期待する異常応答
    assert response.status_code == 400
    data = response.json()
    assert "この日付の記録は既に存在します" in data["detail"]
