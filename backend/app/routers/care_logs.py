from fastapi import APIRouter, HTTPException, status
from app.db import prisma_client
from app.schemas.care_logs import (
    CareLogResponse,
    CareLogCreateRequest,
    CareLogUpdateRequest,
)

care_logs_router = APIRouter(prefix="/api/care_logs", tags=["care_logs"])


# POST /api/care_logs のルーター
@care_logs_router.post(
    "/",
    response_model=CareLogResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_care_log(request: CareLogCreateRequest):
    """
    お世話記録の新規作成API
    ※ 通常は1日1件。重複記録は不可（エラー返却）
    """
    try:
        # 対応する care_setting を取得（1つしかない想定）
        care_setting = await prisma_client.care_settings.find_first()
        if not care_setting:
            raise HTTPException(status_code=404, detail="Care setting not found")

        # すでに同じ日付の記録が存在するかチェック
        existing_log = await prisma_client.care_logs.find_first(
            where={
                "care_setting_id": care_setting.id,
                "date": request.date,
            }
        )
        if existing_log:
            raise HTTPException(
                status_code=400,
                detail="この日付の記録は既に存在します。PATCHで更新してください。",
            )

        # 新規記録を作成
        new_log = await prisma_client.care_logs.create(
            data={
                "care_setting_id": care_setting.id,
                "date": request.date,
                "fed_morning": request.fed_morning,
                "fed_night": request.fed_night,
            }
        )

        return new_log

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="お世話記録の登録中にエラーが発生しました",
        ) from e


# PATCH /api/care_logs/:id のルーター
@care_logs_router.patch(
    "/{care_log_id}",
    response_model=CareLogResponse,
    status_code=status.HTTP_200_OK,
)
async def update_care_log(
    care_log_id: int,
    request: CareLogUpdateRequest,
):
    """
    お世話記録の更新API（fed_morning / fed_night の部分更新）
    """
    try:
        # 対象の care_log を取得
        existing_log = await prisma_client.care_logs.find_unique(
            where={"id": care_log_id}
        )
        if not existing_log:
            raise HTTPException(status_code=404, detail="Care log not found")

        # 更新処理（model_dumpで未指定項目は除外）
        updated_log = await prisma_client.care_logs.update(
            where={"id": care_log_id},
            data=request.model_dump(exclude_unset=True),
        )

        return updated_log

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="お世話記録の更新中にエラーが発生しました",
        ) from e
