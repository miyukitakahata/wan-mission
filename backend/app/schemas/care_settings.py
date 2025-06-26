from pydantic import BaseModel
from datetime import datetime, date, time


# POST /api/care_settingsのリクエストモデル
class CareSettingCreateRequest(BaseModel):
    parent_name: str
    child_name: str
    dog_name: str
    care_start_date: date
    care_end_date: date
    morning_meal_time: time
    night_meal_time: time
    walk_time: time
    care_password: str
    care_clear_status: str


# POST /api/care_settingsのレスポンスモデル
class CareSettingCreateResponse(BaseModel):
    id: int
    user_id: str
    parent_name: str
    child_name: str
    dog_name: str
    care_start_date: date
    care_end_date: date
    morning_meal_time: time
    night_meal_time: time
    walk_time: time
    care_password: str
    care_clear_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# GET /api/care_settings/meのレスポンスモデル
class CareSettingMeResponse(BaseModel):
    id: int
    parent_name: str
    child_name: str
    dog_name: str
    care_start_date: date
    care_end_date: date
    morning_meal_time: time
    night_meal_time: time
    walk_time: time

    class Config:
        from_attributes = True


# PATCH /api/care_settings/:idのリクエストモデル
class CareSettingUpdateRequest(BaseModel):
    care_start_date: date
    care_end_date: date
    care_clear_status: str


# PATCH /api/care_settings/:idのレスポンスモデル
class CareSettingUpdateResponse(BaseModel):
    care_clear_status: str

    class Config:
        from_attributes = True


# POST /api/care_settings/verify_pinのリクエストモデル
class VerifyPinRequest(BaseModel):
    input_password: str


# POST /api/care_settings/verify_pinのレスポンスモデル
class VerifyPinResponse(BaseModel):
    verified: bool

    class Config:
        from_attributes = True


# PATCH /api/care_settings/:id/clearのリクエストモデル
class CareSettingClearRequest(BaseModel):
    care_clear_status: str  # "cleared" か "not_cleared"


# PATCH /api/care_settings/:id/clearのレスポンスモデル
class CareSettingClearResponse(BaseModel):
    care_clear_status: str
