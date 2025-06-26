from pydantic import BaseModel, Field
from datetime import datetime


class WalkMissionCreate(BaseModel):
    care_log_id: int
    started_at: datetime
    ended_at: datetime
    total_distance_m: int
    result: str = Field(..., pattern="^(success|fail)$")  # v2はpattern


class WalkMissionResponse(WalkMissionCreate):
    id: int
    created_at: datetime


class Config:
    from_attributes = True  # Pydantic v2推奨
