from datetime import datetime
from pydantic import BaseModel


class MessageLogResponse(BaseModel):
    id: int
    user_id: str
    content: str
    is_llm_based: bool
    created_at: datetime

    class Config:
        from_attributes = True
