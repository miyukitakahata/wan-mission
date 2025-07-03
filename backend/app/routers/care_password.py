from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from prisma import Prisma

router = APIRouter()


class CheckPinInput(BaseModel):
    firebase_uid: str
    pin: str


@router.post("/check_pin")
async def check_pin(data: CheckPinInput):
    db = Prisma()
    await db.connect()

    try:
        # firebase_uid 経由でリレーションされた care_settings を取得
        care_setting = await db.care_settings.find_first(
            where={"user": {"firebase_uid": data.firebase_uid}}, include={"user": True}
        )

        if not care_setting:
            raise HTTPException(status_code=404, detail="ユーザー設定が見つかりません")

        if care_setting.care_password != data.pin:
            raise HTTPException(status_code=401, detail="PINコードが一致しません")

        return {"message": "PIN認証成功"}
    finally:
        await db.disconnect()
