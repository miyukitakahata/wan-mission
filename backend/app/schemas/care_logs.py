from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


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
