from app.db import prisma_client
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import json

webhook_events_router = APIRouter(prefix="/api/webhook_events", tags=["webhook_events"])


@webhook_events_router.post("/")
async def stripe_webhook(request: Request):
    """StripeのWebhookイベントを受け取るエンドポイント"""
    try:
        # ここにStripeのWebhookイベント処理ロジックを実装
        # 例: 支払い成功時の処理など
        event = await request.json()
        # print(f"[INFO] Webhook event のjson形式を確認: {event}")

        # 必要な中身を取り出す
        event_id = event.get("id")  # Stripeが発行する「このWebhookイベント自体のID」
        event_type = event.get("type")
        data_object = event.get("data", {}).get("object", {})

        stripe_session_id = None
        if event_type == "checkout.session.completed":
            # Checkoutセッション完了イベントの場合、セッションIDを取得
            stripe_session_id = data_object.get("id")

        payment_intent_id = data_object.get("payment_intent")
        customer_email = data_object.get("billing_details", {}).get("email")
        amount = data_object.get("amount")
        currency = data_object.get("currency")
        payment_status = data_object.get("status")

        # DBに保存
        await prisma_client.webhook_events.create(
            data={
                "id": event_id,
                "event_type": event_type,
                "stripe_session_id": stripe_session_id,  # CheckoutセッションID
                "stripe_payment_intent_id": payment_intent_id,
                "customer_email": customer_email,
                "amount": amount,
                "currency": currency,
                "payment_status": payment_status,
                "payload": json.dumps(event),  # Webhookイベントの全体を保存
                "processed": False,  # 未処理フラグ
            }
        )

        return JSONResponse(
            {"message": "Webhook eventを保存しました"},
            status_code=200,
        )

    except Exception as e:
        print(f"[ERROR] Webhook処理失敗: {e}")
        raise HTTPException(status_code=500, detail="Webhook processing failed") from e
