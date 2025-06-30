"""散歩ミッションの作成およびレスポンス用スキーマ定義"""

# 標準ライブラリ
from datetime import datetime
from typing import Optional

# サードパーティライブラリ
from pydantic import BaseModel, Field


class WalkMissionCreate(BaseModel):
    """散歩ミッション作成時のリクエストスキーマ"""

    care_log_id: Optional[int] = None  # 指定しない、自動設定
    started_at: datetime  # 散歩開始日時
    ended_at: datetime  # 散歩終了日時
    total_distance_m: int  # 総移動距離（メートル）
    result: str = Field(
        ..., pattern="^(success|fail)$"
    )  # 成功または失敗を示す（正規表現で制約）


class WalkMissionResponse(WalkMissionCreate):
    """散歩ミッション取得レスポンススキーマ（IDと作成日時を含む）"""

    id: int  # 散歩ミッションのユニークID（主キー）
    created_at: datetime  # レコードの作成日時

    class Config:
        """ORMモデルからの変換を可能にする設定"""

        from_attributes = True  # Pydantic v2で推奨される設定（ORM対応）
