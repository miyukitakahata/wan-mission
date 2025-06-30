"""お世話記録（care_logs）用のPydanticスキーマ定義"""

# 標準ライブラリ
from datetime import datetime, date
from typing import Optional

# サードパーティライブラリ
from pydantic import BaseModel, Field


# /api/care_logs のレスポンスモデル
class CareLogResponse(BaseModel):
    """お世話記録のレスポンス用モデル"""

    id: int
    care_setting_id: int
    date: datetime  # Prismaスキーマに合わせてdatetimeに変更
    fed_morning: Optional[bool]
    fed_night: Optional[bool]
    created_at: datetime

    class Config:
        """Pydantic設定クラス（ORMモデル対応）"""

        from_attributes = True


# POST /api/care_logs のリクエストモデル
class CareLogCreateRequest(BaseModel):
    """お世話記録の新規作成用リクエストモデル"""

    date: date  # フロントエンドからはdate形式で受信
    fed_morning: bool
    fed_night: bool


# PATCH /api/care_logs/:id のリクエストモデル
class CareLogUpdateRequest(BaseModel):
    """お世話記録の更新用リクエストモデル"""

    fed_morning: Optional[bool] = None
    fed_night: Optional[bool] = None


# 今日のお世話記録取得用レスポンスモデル
class CareLogTodayResponse(BaseModel):
    """今日のお世話記録取得用レスポンスモデル"""

    care_log_id: int | None
    fed_morning: bool
    fed_night: bool
    walked: bool
