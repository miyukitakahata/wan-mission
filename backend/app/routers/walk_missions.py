"""散歩ミッションAPIのルーター定義"""

from typing import List  # 型ヒント用
from fastapi import (
    APIRouter,
    HTTPException,
    status,
)  # FastAPIのルーター・例外・HTTPステータスをインポート

from app.db import prisma_client  # Prismaクライアントをインポート
from app.schemas.walk_missions import (
    WalkMissionCreate,
    WalkMissionResponse,
)  # Pydanticスキーマをインポート


# 散歩ミッション用のAPIルーターを作成
walk_missions_router = APIRouter(prefix="/api/walk_missions", tags=["walk_missions"])


# 散歩ミッション新規登録API
@walk_missions_router.post(
    "",  # エンドポイントURL
    response_model=WalkMissionResponse,  # レスポンスの型
    status_code=status.HTTP_201_CREATED,  # 成功時のHTTPステータス
)
async def create_walk_mission(walk_mission: WalkMissionCreate):
    """
    散歩ミッションの新規登録API
    """
    print("POST 受信:", walk_mission)
    try:
        # PrismaクライアントでDBに新規レコードを作成
        result = await prisma_client.walk_missions.create(
            data={
                "care_log_id": walk_mission.care_log_id,
                "started_at": walk_mission.started_at,
                "ended_at": walk_mission.ended_at,
                "total_distance_m": walk_mission.total_distance_m,
                "result": walk_mission.result,
            }
        )
        print("作成結果:", result)
        return result  # 作成したレコードを返す
    except Exception as e:
        print("DBエラー詳細:", e)
        # DBエラー時は500エラーを返す
        raise HTTPException(
            status_code=500, detail="DB登録時にエラーが発生しました"
        ) from e


# 散歩ミッション一覧取得API
@walk_missions_router.get(
    "",  # エンドポイントURL
    response_model=List[WalkMissionResponse],  # レスポンスの型（リスト）
)
async def get_walk_missions():
    """
    散歩ミッション一覧取得API
    """
    try:
        # Prismaクライアントで全件取得（作成日時の降順）
        results = await prisma_client.walk_missions.find_many(
            order={"created_at": "desc"}
        )
        return results  # 取得したレコード一覧を返す
    except Exception as e:
        print("DBエラー詳細:", e)
        # DBエラー時は500エラーを返す
        raise HTTPException(
            status_code=500, detail="DB取得時にエラーが発生しました"
        ) from e


# 散歩ミッション更新API
@walk_missions_router.patch(
    "/{id}",  # エンドポイントURL（id指定）
    response_model=WalkMissionResponse,  # レスポンスの型
)
async def update_walk_mission(mission_id: int, walk_mission: WalkMissionCreate):
    """
    散歩ミッションの更新API
    """
    try:
        # Prismaクライアントで指定idのレコードを更新
        result = await prisma_client.walk_missions.update(
            where={"id": mission_id},
            data=walk_mission.model_dump(
                exclude_unset=True
            ),  # Pydantic v2対応：未指定フィールドは除外
        )
        if not result:
            # レコードが見つからない場合は404エラー
            raise HTTPException(status_code=404, detail="ミッションが見つかりません")
        return result  # 更新後のレコードを返す
    except Exception as e:
        print("DBエラー詳細:", e)
        # DBエラー時は500エラーを返す
        raise HTTPException(
            status_code=500, detail="DB更新時にエラーが発生しました"
        ) from e
