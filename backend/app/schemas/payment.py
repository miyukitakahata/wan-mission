from pydantic import BaseModel


class CheckoutSessionCreateRequest(BaseModel):
    """Checkoutセッション作成用リクエストモデル"""

    firebase_uid: str  # Firebase UIDを受け取るフィールド
