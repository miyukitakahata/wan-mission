# app/routers/payment.py

from fastapi import APIRouter, HTTPException
from app.services import stripe_service
from fastapi.responses import JSONResponse

payment_router = APIRouter(prefix="/api/payments", tags=["payments"])


@payment_router.post("/create-checkout-session")
async def create_checkout_session():
    try:
        # StripeのCheckoutセッションを作成
        session_url = stripe_service.create_checkout_session()

        # セッションのURLを返す(明示的にJSONレスポンスを作って返す)
        return JSONResponse(
            {"url": session_url},
            status_code=200,
        )

    except Exception as e:
        print(f"[ERROR] create_checkout_session: {e}")
        raise HTTPException(
            status_code=500,
            detail="決済セッション生成中にサーバーエラーが発生しました",
        ) from e
