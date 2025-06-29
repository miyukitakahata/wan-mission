"""反省文のAPIルーター定義"""

from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from app.db import prisma_client
from app.schemas.reflection_notes import (
    ReflectionNoteCreate,
    ReflectionNoteResponse,
)
from app.routers.care_settings import verify_firebase_token  # Firebase認証ダミー関数

# 反省文用のAPIルーターを作成
reflection_notes_router = APIRouter(
    prefix="/api/reflection_notes", tags=["reflection_notes"]
)


# 反省文の新規登録API
@reflection_notes_router.post(
    "",  # エンドポイントURL
    response_model=ReflectionNoteResponse,  # レスポンスの型
    status_code=status.HTTP_201_CREATED,
)
async def create_reflection_note(
    note: ReflectionNoteCreate,
    firebase_uid: str = Depends(verify_firebase_token),
):
    """
    反省文の新規登録API（子ども）
    """
    print("POST 受信:", note)
    try:
        # Firebase UID からユーザー取得
        user = await prisma_client.users.find_unique(
            where={"firebase_uid": firebase_uid}
        )
        if not user:
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

        # care_setting_id を取得
        care_setting = await prisma_client.care_settings.find_first(
            where={"user_id": user.id}
        )
        if not care_setting:
            raise HTTPException(status_code=404, detail="お世話設定が見つかりません")

        # DBに新規レコード作成
        result = await prisma_client.reflection_notes.create(
            data={
                "care_setting_id": care_setting.id,
                "content": note.content,
                "approved_by_parent": False,
            }
        )
        print("作成結果:", result)
        return result
    except Exception as e:
        print("DBエラー詳細:", e)
        raise HTTPException(
            status_code=500, detail="DB登録時にエラーが発生しました"
        ) from e


# 反省文の一覧取得API
@reflection_notes_router.get(
    "",  # エンドポイントURL
    response_model=List[ReflectionNoteResponse],
)
async def get_reflection_notes():
    """
    反省文一覧取得API（保護者用）
    """
    try:
        results = await prisma_client.reflection_notes.find_many(
            order={"created_at": "desc"}
        )
        return results
    except Exception as e:
        print("DBエラー詳細:", e)
        raise HTTPException(
            status_code=500, detail="DB取得時にエラーが発生しました"
        ) from e
