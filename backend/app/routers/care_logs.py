from fastapi import APIRouter, HTTPException, status
from app.db import prisma_client
from app.schemas.care_logs import (
    CareLogResponse,
    CareLogCreateRequest,
    CareLogUpdateRequest,
)
from datetime import date, datetime, timedelta

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

        # date: date型 → DateTime型に変換
        request_datetime = datetime.combine(request.date, datetime.min.time())

        # すでに同じ日付の記録が存在するかチェック
        existing_log = await prisma_client.care_logs.find_first(
            where={
                "care_setting_id": care_setting.id,
                "date": request_datetime,
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
                "date": request_datetime,
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


# GET /api/care_logs/today のルーター
@care_logs_router.get(
    "/today",
    response_model=CareLogResponse,
    status_code=status.HTTP_200_OK,
)
async def get_today_care_log():
    """
    本日のお世話記録を取得API
    ※ care_settingが1つしかない想定
    """
    try:
        # 今日の開始と明日の開始（範囲を作成）
        today_start = datetime.combine(date.today(), datetime.min.time())
        tomorrow_start = today_start + timedelta(days=1)

        # care_setting取得
        care_setting = await prisma_client.care_settings.find_first()
        if not care_setting:
            raise HTTPException(status_code=404, detail="Care setting not found")

        # 今日の日付範囲でcare_logを取得
        today_log = await prisma_client.care_logs.find_first(
            where={
                "care_setting_id": care_setting.id,
                "date": {
                    "gte": today_start,
                    "lt": tomorrow_start,
                },
            }
        )
        if not today_log:
            raise HTTPException(
                status_code=404, detail="今日のお世話記録はまだありません"
            )

        return today_log

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] get_today_care_log: {e}")
        raise HTTPException(
            status_code=500,
            detail="本日の記録取得中にエラーが発生しました",
        ) from e
