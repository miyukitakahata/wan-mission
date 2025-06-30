"""お世話記録（care_logs）APIルーターの定義"""

# 標準ライブラリ
from datetime import date, datetime

# サードパーティライブラリ
from fastapi import APIRouter, HTTPException, status, Query

# ローカルアプリケーション
from app.db import prisma_client
from app.schemas.care_logs import (
    CareLogResponse,
    CareLogCreateRequest,
    CareLogUpdateRequest,
    CareLogTodayResponse,
)

care_logs_router = APIRouter(prefix="/api/care_logs", tags=["care_logs"])


# POST /api/care_logs のルーター
@care_logs_router.post(
    "/",
    response_model=CareLogResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_care_log(request: CareLogCreateRequest):
    """
    お世話記録の新規作成API
    ※ 通常は1日1件。重複記録は不可（エラー返却）
    """
    try:
        print(f"[care_logs] POST受信: {request}")

        # 対応する care_setting を取得（1つしかない想定）
        # TO-DO ユーザーごとに対応する care_setting を取得（1つしかない想定）
        care_setting = await prisma_client.care_settings.find_first()
        if not care_setting:
            print("[care_logs] care_setting not found")
            raise HTTPException(status_code=404, detail="Care setting not found")

        print(f"[care_logs] care_setting取得成功: {care_setting.id}")

        # 日付をdatetimeに変換（Prismaスキーマに合わせる）
        date_as_datetime = datetime.combine(request.date, datetime.min.time())
        print(f"[care_logs] 変換後日付: {date_as_datetime}")

        # すでに同じ日付の記録が存在するかチェック
        # 同じ日の範囲で検索（00:00:00 ～ 23:59:59）
        start_of_day = date_as_datetime
        end_of_day = date_as_datetime.replace(hour=23, minute=59, second=59)

        existing_log = await prisma_client.care_logs.find_first(
            where={
                "care_setting_id": care_setting.id,
                "date": {
                    "gte": start_of_day,
                    "lte": end_of_day,
                },
            }
        )

        if existing_log:
            print(f"[care_logs] 既存記録発見: {existing_log.id}")
            raise HTTPException(
                status_code=400,
                detail="この日付の記録は既に存在します。PATCHで更新してください。",
            )

        # 新規記録を作成
        new_log = await prisma_client.care_logs.create(
            data={
                "care_setting_id": care_setting.id,
                "date": date_as_datetime,  # datetimeとして保存
                "fed_morning": request.fed_morning,
                "fed_night": request.fed_night,
            }
        )

        print(f"[care_logs] 新規記録作成成功: {new_log.id}")
        return new_log

    except HTTPException:
        # HTTPExceptionはそのまま再発生
        raise
    except Exception as e:
        print(f"[care_logs] POST エラー詳細: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=500,
            detail="お世話記録の登録中にエラーが発生しました",
        ) from e


# PATCH /api/care_logs/:id のルーター
@care_logs_router.patch(
    "/{care_log_id}",
    response_model=CareLogResponse,
    status_code=status.HTTP_200_OK,
)
async def update_care_log(
    care_log_id: int,
    request: CareLogUpdateRequest,
):
    """
    お世話記録の更新API（fed_morning / fed_night の部分更新）
    """
    try:
        print(f"[care_logs] PATCH受信: care_log_id={care_log_id}, request={request}")

        # 対象の care_log を取得
        existing_log = await prisma_client.care_logs.find_unique(
            where={"id": care_log_id}
        )
        if not existing_log:
            print(f"[care_logs] care_log not found: {care_log_id}")
            raise HTTPException(status_code=404, detail="Care log not found")

        print(f"[care_logs] 既存記録取得成功: {existing_log.id}")

        # 更新処理（model_dumpで未指定項目は除外）
        update_data = request.model_dump(exclude_unset=True)
        print(f"[care_logs] 更新データ: {update_data}")

        updated_log = await prisma_client.care_logs.update(
            where={"id": care_log_id},
            data=update_data,
        )

        print(f"[care_logs] 更新成功: {updated_log.id}")
        return updated_log

    except HTTPException:
        # HTTPExceptionはそのまま再発生
        raise
    except Exception as e:
        print(f"[care_logs] PATCH エラー詳細: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=500,
            detail="お世話記録の更新中にエラーが発生しました",
        ) from e


# GET /api/care_logs/today のルーター
@care_logs_router.get(
    "/today",
    response_model=CareLogTodayResponse,
    status_code=status.HTTP_200_OK,
)
async def get_today_care_log(care_setting_id: int = Query(...)):
    """
    今日のお世話記録と散歩タスク完了状況を取得するAPI
    - fed_morning, fed_night: care_logs から取得
    - walked: walk_missions の result が 'success' なら True
    - care_log_id: care_logs の主キー（POST/PATCHと同じ形式で返す）
    """
    try:
        print(f"[care_logs] GET today受信: care_setting_id={care_setting_id}")

        today = date.today()
        # 今日の範囲を定義（datetime型で）
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())

        print(f"[care_logs] 検索範囲: {start_of_day} ～ {end_of_day}")

        # 今日の care_log を取得
        care_log = await prisma_client.care_logs.find_first(
            where={
                "care_setting_id": care_setting_id,
                "date": {
                    "gte": start_of_day,
                    "lte": end_of_day,
                },
            }
        )

        if not care_log:
            print("[care_logs] 今日の記録なし、デフォルト値で返却")
            # レコードがなければデフォルト値で返す
            fed_morning = False
            fed_night = False
            care_log_id = None
        else:
            print(f"[care_logs] 今日の記録取得成功: {care_log.id}")
            fed_morning = care_log.fed_morning or False
            fed_night = care_log.fed_night or False
            care_log_id = care_log.id

        # 今日の walk_missions で result='success' があるか判定
        walked = False
        if care_log_id:
            print(f"[care_logs] walk_missions検索開始: care_log_id={care_log_id}")
            missions = await prisma_client.walk_missions.find_many(
                where={
                    "care_log_id": care_log_id,
                    "started_at": {
                        "gte": start_of_day,
                        "lte": end_of_day,
                    },
                    "result": "success",
                }
            )
            walked = len(missions) > 0
            print(
                f"[care_logs] walk_missions検索結果: {len(missions)}件, walked={walked}"
            )

        response = CareLogTodayResponse(
            care_log_id=care_log_id,
            fed_morning=fed_morning,
            fed_night=fed_night,
            walked=walked,
        )
        print(f"[care_logs] レスポンス: {response}")
        return response

    except Exception as e:
        print(f"[care_logs] GET today エラー詳細: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=500,
            detail="今日のお世話記録取得中にエラーが発生しました",
        ) from e
