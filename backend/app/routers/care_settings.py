from fastapi import APIRouter, HTTPException, Depends, Header
from prisma import Prisma
from pydantic import BaseModel
from datetime import date, time, datetime

care_settings_router = APIRouter(
    prefix="/api/care_settings",
    tags=["care_settings"]
)

db = Prisma()

# POST /api/care_settingsのリクエストモデル
class CareSettingCreateRequest(BaseModel):
    parent_name: str
    child_name: str
    dog_name: str
    care_start_date: date
    care_end_date: date
    morning_meal_time: time
    night_meal_time: time
    walk_time: time
    care_password: str
    care_clear_status: str

# POST /api/care_settingsのレスポンスモデル
class CareSettingCreateResponse(BaseModel):
    id: int
    user_id: str
    parent_name: str
    child_name: str
    dog_name: str
    care_start_date: date
    care_end_date: date
    morning_meal_time: time
    night_meal_time: time
    walk_time: time
    care_password: str
    care_clear_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# GET /api/care_settings/meのレスポンスモデル
class CareSettingMeResponse(BaseModel):
    id: int
    parent_name: str
    child_name: str
    dog_name: str
    care_start_date: date
    care_end_date: date
    morning_meal_time: time
    night_meal_time: time
    walk_time: time

    class Config:
        from_attributes = True

# PATCH /api/care_settings/:idのリクエストモデル
class CareSettingUpdateRequest(BaseModel):
    care_start_date: date
    care_end_date: date
    care_clear_status: str

# PATCH /api/care_settings/:idのレスポンスモデル
class CareSettingUpdateResponse(BaseModel):
    care_clear_status: str

    class Config:
        from_attributes = True

# POST /api/care_settings/verify_pinのリクエストモデル
class VerifyPinRequest(BaseModel):
    input_password: str

# POST /api/care_settings/verify_pinのレスポンスモデル
class VerifyPinResponse(BaseModel):
    verified: bool

    class Config:
        from_attributes = True

# PATCH /api/care_settings/:id/clearのリクエストモデル
class CareSettingClearRequest(BaseModel):
    care_clear_status: str  # "cleared" か "not_cleared"

# PATCH /api/care_settings/:id/clearのレスポンスモデル
class CareSettingClearResponse(BaseModel):
    care_clear_status: str

# 仮のダミー認証
def verify_firebase_token():
    # 仮のfirebase_uidを返す（本来はトークンから解析）
    return "A1b2C3d4E5F6G7"

# POST/api/care_settingsのルーター
@care_settings_router.post("/", response_model=CareSettingCreateResponse)
async def create_care_setting(
    request: CareSettingCreateRequest,
    firebase_uid: str = Depends(verify_firebase_token)
):
    await db.connect()
    user = await db.users.find_unique(where={"firebase_uid": firebase_uid})
    if not user:
        await db.disconnect()
        raise HTTPException(status_code=404, detail="User not found")

    care_setting = await db.care_settings.create(
        data={
            "user_id": user.id,
            "parent_name": request.parent_name,
            "child_name": request.child_name,
            "dog_name": request.dog_name,
            "care_start_date": datetime.combine(request.care_start_date, time.min),
            "care_end_date": datetime.combine(request.care_end_date, time.min),
            "morning_meal_time": datetime.combine(request.care_start_date, request.morning_meal_time),
            "night_meal_time": datetime.combine(request.care_start_date, request.night_meal_time),
            "walk_time": datetime.combine(request.care_start_date, request.walk_time),
            "care_password": request.care_password,
            "care_clear_status": request.care_clear_status,
        }
    )
    await db.disconnect()
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
        updated_at=care_setting.updated_at
    )


# GET/api/care_settings/meのルーター
@care_settings_router.get("/me", response_model=CareSettingMeResponse)
async def get_my_care_setting(firebase_uid: str = Depends(verify_firebase_token)):
    await db.connect()

    user = await db.users.find_unique(where={"firebase_uid": firebase_uid})
    if not user:
        await db.disconnect()
        raise HTTPException(status_code=404, detail="User not found")

    care_setting = await db.care_settings.find_first(where={"user_id": user.id})
    if not care_setting:
        await db.disconnect()
        raise HTTPException(status_code=404, detail="Care setting not found")

    await db.disconnect()

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


# PATCH /api/care_settings/:idのルーター
@care_settings_router.patch("/{care_setting_id}", response_model=CareSettingUpdateResponse)
async def update_care_setting(
    care_setting_id: int,
    request: CareSettingUpdateRequest,
    firebase_uid: str = Depends(verify_firebase_token)
):
    await db.connect()

    user = await db.users.find_unique(where={"firebase_uid": firebase_uid})
    if not user:
        await db.disconnect()
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.care_settings.find_unique(where={"id": care_setting_id})
    if not existing or existing.user_id != user.id:
        await db.disconnect()
        raise HTTPException(status_code=404, detail="Care setting not found or unauthorized")

    updated = await db.care_settings.update(
        where={"id": care_setting_id},
        data={
            "care_start_date": datetime.combine(request.care_start_date, time.min),
            "care_end_date": datetime.combine(request.care_end_date, time.min),
            "care_clear_status": request.care_clear_status,
        }
    )

    await db.disconnect()
    return CareSettingUpdateResponse(care_clear_status=updated.care_clear_status)


# POST /api/care_settings/verify_pinのルーター
@care_settings_router.post("/verify_pin", response_model=VerifyPinResponse)
async def verify_pin(
    request: VerifyPinRequest,
    firebase_uid: str = Depends(verify_firebase_token)
):
    await db.connect()
    user = await db.users.find_unique(where={"firebase_uid": firebase_uid})
    if not user:
        await db.disconnect()
        raise HTTPException(status_code=404, detail="User not found")

    care_setting = await db.care_settings.find_first(where={"user_id": user.id})
    await db.disconnect()

    if not care_setting:
        return VerifyPinResponse(verified=False)

    is_match = request.input_password == care_setting.care_password
    return VerifyPinResponse(verified=is_match)


# PATCH /api/care_settings/:id/clearのルーター
@care_settings_router.patch("/{care_setting_id}/clear", response_model=CareSettingClearResponse)
async def clear_care_setting(
    care_setting_id: int,
    request: CareSettingClearRequest,
    firebase_uid: str = Depends(verify_firebase_token)
):
    await db.connect()
    user = await db.users.find_unique(where={"firebase_uid": firebase_uid})
    if not user:
        await db.disconnect()
        raise HTTPException(status_code=404, detail="User not found")

    # 対象の care_setting を取得し、user_id が一致することを確認
    care_setting = await db.care_settings.find_unique(where={"id": care_setting_id})
    if not care_setting or care_setting.user_id != user.id:
        await db.disconnect()
        raise HTTPException(status_code=403, detail="Permission denied")

    updated = await db.care_settings.update(
        where={"id": care_setting_id},
        data={"care_clear_status": request.care_clear_status}
    )
    await db.disconnect()

    return CareSettingClearResponse(care_clear_status=updated.care_clear_status)

