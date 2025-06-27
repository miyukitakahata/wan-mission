# app/routers/care_settings.py

from fastapi import APIRouter, HTTPException, Depends, status
from app.db import prisma_client
from datetime import time, datetime
from app.schemas.care_settings import (
    CareSettingCreateRequest,
    CareSettingCreateResponse,
    CareSettingMeResponse,
    CareSettingUpdateRequest,
    CareSettingUpdateResponse,
    VerifyPinRequest,
    VerifyPinResponse,
    CareSettingClearRequest,
    CareSettingClearResponse,
)

care_settings_router = APIRouter(prefix="/api/care_settings", tags=["care_settings"])


# 仮のダミー認証
def verify_firebase_token():
    # 仮のfirebase_uidを返す（本来はトークンから解析）
    return "A1b2C3d4E5F6G7"


# POST/api/care_settingsのルーター
@care_settings_router.post(
    "/",
    response_model=CareSettingCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_care_setting(
    request: CareSettingCreateRequest,
    firebase_uid: str = Depends(verify_firebase_token),
):
    """
    お世話設定の新規作成API
    """
    try:
        # Firebase UIDからユーザー取得
        user = await prisma_client.users.find_unique(
            where={"firebase_uid": firebase_uid}
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # ケア設定を作成
        care_setting = await prisma_client.care_settings.create(
            data={
                "user_id": user.id,
                "parent_name": request.parent_name,
                "child_name": request.child_name,
                "dog_name": request.dog_name,
                "care_start_date": datetime.combine(request.care_start_date, time.min),
                "care_end_date": datetime.combine(request.care_end_date, time.min),
                "morning_meal_time": datetime.combine(
                    request.care_start_date, request.morning_meal_time
                ),
                "night_meal_time": datetime.combine(
                    request.care_start_date, request.night_meal_time
                ),
                "walk_time": datetime.combine(
                    request.care_start_date, request.walk_time
                ),
                "care_password": request.care_password,
                "care_clear_status": request.care_clear_status,
            }
        )

        return CareSettingCreateResponse(
            id=care_setting.id,
            user_id=care_setting.user_id,
            parent_name=care_setting.parent_name,
            child_name=care_setting.child_name,
            dog_name=care_setting.dog_name,
            care_start_date=care_setting.care_start_date.date(),
            care_end_date=care_setting.care_end_date.date(),
            morning_meal_time=care_setting.morning_meal_time.time(),
            night_meal_time=care_setting.night_meal_time.time(),
            walk_time=care_setting.walk_time.time(),
            care_password=care_setting.care_password,
            care_clear_status=care_setting.care_clear_status,
            created_at=care_setting.created_at,
            updated_at=care_setting.updated_at,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail="お世話設定の登録中にエラーが発生しました"
        ) from e


# GET/api/care_settings/meのルーター
@care_settings_router.get(
    "/me",
    response_model=CareSettingMeResponse,
    status_code=status.HTTP_200_OK,
)
async def get_my_care_setting(firebase_uid: str = Depends(verify_firebase_token)):
    """
    ログインユーザーのケア設定取得API
    """
    try:
        # Firebase UID からユーザー取得
        user = await prisma_client.users.find_unique(
            where={"firebase_uid": firebase_uid}
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 該当ユーザーのケア設定を取得
        care_setting = await prisma_client.care_settings.find_first(
            where={"user_id": user.id}
        )
        if not care_setting:
            raise HTTPException(status_code=404, detail="Care setting not found")

        return CareSettingMeResponse(
            id=care_setting.id,
            parent_name=care_setting.parent_name,
            child_name=care_setting.child_name,
            dog_name=care_setting.dog_name,
            care_start_date=care_setting.care_start_date.date(),
            care_end_date=care_setting.care_end_date.date(),
            morning_meal_time=care_setting.morning_meal_time.time(),
            night_meal_time=care_setting.night_meal_time.time(),
            walk_time=care_setting.walk_time.time(),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail="お世話設定の取得中にエラーが発生しました"
        ) from e


# PATCH /api/care_settings/:idのルーター
@care_settings_router.patch(
    "/{care_setting_id}",
    response_model=CareSettingUpdateResponse,
    status_code=status.HTTP_200_OK,
)
async def update_care_setting(
    care_setting_id: int,
    request: CareSettingUpdateRequest,
    firebase_uid: str = Depends(verify_firebase_token),
):
    """
    お世話設定の更新API
    """
    try:
        # 認証ユーザーを取得
        user = await prisma_client.users.find_unique(
            where={"firebase_uid": firebase_uid}
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 対象ケア設定を取得し、所有者か確認
        care_setting = await prisma_client.care_settings.find_unique(
            where={"id": care_setting_id}
        )
        if not care_setting or care_setting.user_id != user.id:
            raise HTTPException(
                status_code=403,
                detail="Care setting not found or unauthorized",
            )

        # 日付をdatetimeに変換して更新
        updated = await prisma_client.care_settings.update(
            where={"id": care_setting_id},
            data={
                "care_start_date": datetime.combine(request.care_start_date, time.min),
                "care_end_date": datetime.combine(request.care_end_date, time.min),
                "care_clear_status": request.care_clear_status,
            },
        )

        return CareSettingUpdateResponse(care_clear_status=updated.care_clear_status)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail="お世話設定の更新中にエラーが発生しました"
        ) from e


# POST /api/care_settings/verify_pinのルーター
@care_settings_router.post(
    "/verify_pin",
    response_model=VerifyPinResponse,
    status_code=status.HTTP_200_OK,
)
async def verify_care_setting_pin(
    request: VerifyPinRequest,
    firebase_uid: str = Depends(verify_firebase_token),
):
    """
    管理者PINの新規登録API
    """
    try:
        user = await prisma_client.users.find_unique(
            where={"firebase_uid": firebase_uid}
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        care_setting = await prisma_client.care_settings.find_first(
            where={"user_id": user.id}
        )
        if not care_setting:
            return VerifyPinResponse(verified=False)

        is_match = request.input_password == care_setting.care_password
        return VerifyPinResponse(verified=is_match)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail="PIN認証中にエラーが発生しました"
        ) from e


# PATCH /api/care_settings/:id/clearのルーター
@care_settings_router.patch(
    "/{care_setting_id}/clear",
    response_model=CareSettingClearResponse,
    status_code=status.HTTP_200_OK,
)
async def clear_care_setting_status(
    care_setting_id: int,
    request: CareSettingClearRequest,
    firebase_uid: str = Depends(verify_firebase_token),
):
    """
    ミッションクリア状態の更新API
    """
    try:
        # Firebase UID からユーザー取得
        user = await prisma_client.users.find_unique(
            where={"firebase_uid": firebase_uid}
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # care_setting の取得と所有者チェック
        care_setting = await prisma_client.care_settings.find_unique(
            where={"id": care_setting_id}
        )
        if not care_setting or care_setting.user_id != user.id:
            raise HTTPException(status_code=403, detail="Permission denied")

        # クリア状態を更新
        updated = await prisma_client.care_settings.update(
            where={"id": care_setting_id},
            data={"care_clear_status": request.care_clear_status},
        )

        return CareSettingClearResponse(care_clear_status=updated.care_clear_status)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail="ミッションクリア状態の更新中にエラーが発生しました"
        ) from e
