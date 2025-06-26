# app/routers/walk_missions.py

from fastapi import APIRouter, HTTPException, status
from typing import List
from app.db import prisma_client  # Prismaクライアントをインポート
from app.schemas.walk_missions import WalkMissionCreate, WalkMissionResponse

walk_missions_router = APIRouter()


@walk_missions_router.post(
    "/api/walk_missions",
    response_model=WalkMissionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_walk_mission(walk_mission: WalkMissionCreate):
    """
    散歩ミッションの新規登録API
    """
    try:
        result = await prisma_client.walkmission.create(
            data={
                "care_log_id": walk_mission.care_log_id,
                "started_at": walk_mission.started_at,
                "ended_at": walk_mission.ended_at,
                "total_distance_m": walk_mission.total_distance_m,
                "result": walk_mission.result,
            }
        )
        return result
    except Exception as e:
        # DBエラー時
        raise HTTPException(
            status_code=500, detail="DB登録時にエラーが発生しました"
        ) from e


@walk_missions_router.get(
    "/api/walk_missions",
    response_model=List[WalkMissionResponse],
)
async def get_walk_missions():
    """
    散歩ミッション一覧取得API
    """
    try:
        results = await prisma_client.walkmission.find_many(
            order={"created_at": "desc"}
        )
        return results
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="DB取得時にエラーが発生しました"
        ) from e


@walk_missions_router.patch(
    "/api/walk_missions/{id}",
    response_model=WalkMissionResponse,
)
async def update_walk_mission(id: int, walk_mission: WalkMissionCreate):
    """
    散歩ミッションの更新API
    """
    try:
        result = await prisma_client.walkmission.update(
            where={"id": id},
            data=walk_mission.model_dump(exclude_unset=True),  # Pydantic v2対応
        )
        if not result:
            raise HTTPException(status_code=404, detail="ミッションが見つかりません")
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="DB更新時にエラーが発生しました"
        ) from e
