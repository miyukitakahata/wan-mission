from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# POST /api/reflection_notes のリクエストモデル
class ReflectionNoteCreate(BaseModel):
    content: str


# GET /api/reflection_notes のレスポンスモデル
class ReflectionNoteResponse(BaseModel):
    id: int
    care_setting_id: int
    content: str
    approved_by_parent: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True  # ORMモード
