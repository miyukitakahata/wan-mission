from fastapi import APIRouter, HTTPException, Depends, Header
from prisma import Prisma
from pydantic import BaseModel
from datetime import date, time, datetime
from typing import Optional

care_logs_router = APIRouter(
    prefix="/api/care_logs",
    tags=["care_logs"]
)

db = Prisma()

# /api/care_logs のレスポンスモデル
class CareLogResponse(BaseModel):
    id: int
    care_setting_id: int
    date: date
    fed_morning: Optional[bool]
    fed_night: Optional[bool]
    created_at: datetime

    class Config:
        from_attributes = True


# POST /api/care_logs のリクエストモデル
class CareLogCreateRequest(BaseModel):
    date: date
    fed_morning: bool
    fed_night: bool


# PATCH /api/care_logs/:id のリクエストモデル
class CareLogUpdateRequest(BaseModel):
    fed_morning: Optional[bool] = None
    fed_night: Optional[bool] = None


# 仮のダミー認証
def verify_firebase_token():
    # 仮のfirebase_uidを返す（本来はトークンから解析）
    return "A1b2C3d4E5F6G7"

# POST /api/care_logs のルーター
@care_logs_router.post("/", response_model=CareLogResponse)
async def create_care_log(
    request: CareLogCreateRequest,
    firebase_uid: str = Depends(verify_firebase_token)
):
    await db.connect()

    # 認証ユーザーを取得
    user = await db.users.find_unique(where={"firebase_uid": firebase_uid})
    if not user:
        await db.disconnect()
        raise HTTPException(status_code=404, detail="User not found")
    
    # ユーザーに紐づくcare_settingを取得
    care_setting = await db.care_setting.find_first(where={"user_id": user.id})
    if not care_setting:
        await db.disconnect()
        raise HTTPException(status_code=404, detail="Care setting not found")
    
    # 同じ日付に既に記録があるか確認
    existing_log = await db.care_log.find_first(
        where={
            "care_setting_id": care_setting.id,
            "date": request.date
        }
    )
    if existing_log:
        await db.disconnect()
        raise HTTPException(
            status_code=400,
            detail="この日付の記録は既に存在します。PATCHで更新してください。"
        )