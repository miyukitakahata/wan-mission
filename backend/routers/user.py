from fastapi import APIRouter, HTTPException, Depends, Header
from prisma import Prisma
from pydantic import BaseModel
from datetime import datetime

user_router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

db = Prisma()

# POST/api/usersのリクエストモデル
class UserCreateRequest(BaseModel):
    firebase_uid: str
    email: str
    current_plan: str
    is_verified: bool

# POST /api/usersのレスポンスモデル
class UserCreateResponse(BaseModel):
    id: str
    firebase_uid: str
    email: str
    current_plan: str
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Prismaの戻り値をそのまま変換

# GET /api/users/meのレスポンスモデル
class UserMeResponse(BaseModel):
    id: str
    email: str
    current_plan: str
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# PATCH /api/users/current_planのリクエストモデル
class UserPlanUpdateRequest(BaseModel):
    current_plan: str

# PATCH /api/users/current_planのレスポンスモデル
class UserPlanUpdateResponse(BaseModel):
    current_plan: str
    updated_at: datetime

    class Config:
        from_attributes = True


@user_router.post("/", response_model=UserCreateResponse)
async def create_users(user_data: UserCreateRequest):
    await db.connect()
    
    # すでに登録済みのFirebase UIDか確認
    existing_user = await db.users.find_unique(where={"firebase_uid": user_data.firebase_uid})
    if existing_user:
        await db.disconnect()
        raise HTTPException(status_code=409, detail="User already exists")
    
    # 新規登録
    new_user = await db.users.create(
        data={
            "firebase_uid": user_data.firebase_uid,
            "email": user_data.email,
            "current_plan": user_data.current_plan,
            "is_verified":user_data.is_verified
        }
    )

    await db.disconnect()
    return new_user

#user_router.patch("/current_plan", response_model=UserPlanUpdateResponse)
#sync def update_user_plan(
#   plan_update: UserPlanUpdateRequest,
#   authorization: str = Header(...)
#:
#   await db.connect()
#
#   # ここは本来 Firebase トークンから UID を取得（今回は仮でベタ書き）
#   firebase_uid = "A1b2C3d4E5F6G7"  # TODO: Firebase連携後に置き換える
#
#   # 対象ユーザーの検索
#   user = await db.users.find_unique(where={"firebase_uid": firebase_uid})
#   if not user:
#       await db.disconnect()
#       raise HTTPException(status_code=404, detail="User not found")
#   
#   # プラン更新
#   updated_user = await db.users.update(
#       where={"firebase_uid": firebase_uid},
#       data={"current_plan": plan_update.current_plan}
#   )
#
#   await db.disconnect()
#   return updated_user