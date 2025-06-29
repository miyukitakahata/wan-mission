from fastapi import APIRouter, HTTPException, status, Depends
from app.db import prisma_client
from app.dependencies import verify_firebase_token
import random
from app.schemas.message_logs import MessageLogResponse

message_logs_router = APIRouter(prefix="/api/message_logs", tags=["message_logs"])

FREE_PLAN_MESSAGES = [
    "わん！きょうもがんばろうね！",
    "おさんぽだいすきだよ！",
    "ごはんまだかな〜？",
    "だいすきだよ！",
    "しっぽふりふり！",
]


@message_logs_router.post(
    "/generate",
    response_model=MessageLogResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_message_log(user_id: str = Depends(verify_firebase_token)):
    """
    犬のひとことを生成して保存し、返すAPI
    （無料プラン対応版・固定セリフからランダム選択）
    """
    try:
        # ランダムメッセージを選ぶ
        selected_message = random.choice(FREE_PLAN_MESSAGES)

        # DBに保存
        new_log = await prisma_client.message_logs.create(
            data={
                "user_id": user_id,
                "content": selected_message,
                "is_llm_based": False,
            }
        )

        return new_log

    except Exception as e:
        print(f"[ERROR] generate_message_log: {e}")
        raise HTTPException(
            status_code=500,
            detail="犬のひとこと生成中にサーバーエラーが発生しました",
        ) from e
