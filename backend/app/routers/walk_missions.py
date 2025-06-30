"""散歩ミッションAPIのルーター定義"""

# 標準ライブラリ
from datetime import datetime, timedelta, timezone
from typing import List

# サードパーティライブラリ
from fastapi import APIRouter, HTTPException, status

# ローカルアプリケーション
from app.db import prisma_client
from app.schemas.walk_missions import (
    WalkMissionCreate,
    WalkMissionResponse,
)  # Pydanticスキーマをインポート


# 散歩ミッション用のAPIルーターを作成
walk_missions_router = APIRouter(prefix="/api/walk_missions", tags=["walk_missions"])

JST = timezone(timedelta(hours=9))


# 散歩ミッション新規登録API
@walk_missions_router.post(
    "",  # エンドポイントURL
    response_model=WalkMissionResponse,  # レスポンスの型
    status_code=status.HTTP_201_CREATED,  # 成功時のHTTPステータス
)
async def create_walk_mission(walk_mission: WalkMissionCreate):
    """
    散歩ミッションの新規登録API
    ※ 当日の care_log が存在しない場合は自動作成
    """
    try:
        print(f"[walk_missions] POST受信: {walk_mission}")

        # 当日の care_log を確認・作成
        now_jst = datetime.now(JST)
        today = now_jst.date()
        # 今日の範囲を定義（datetime型でJSTで生成しUTCに変換）
        start_of_day_jst = datetime.combine(today, datetime.min.time(), JST)
        end_of_day_jst = datetime.combine(today, datetime.max.time(), JST)
        start_of_day = start_of_day_jst.astimezone(timezone.utc)
        end_of_day = end_of_day_jst.astimezone(timezone.utc)

        # care_setting を取得（1つしかない想定）
        care_setting = await prisma_client.care_settings.find_first()
        if not care_setting:
            print("[walk_missions] care_setting not found")
            raise HTTPException(status_code=404, detail="Care setting not found")

        print(f"[walk_missions] care_setting取得成功: {care_setting.id}")

        # 当日の care_log を検索
        care_log = await prisma_client.care_logs.find_first(
            where={
                "care_setting_id": care_setting.id,
                "date": {
                    "gte": start_of_day,
                    "lte": end_of_day,
                },
            }
        )

        # care_log が存在しない場合は新規作成
        if not care_log:
            print("[walk_missions] care_log作成中...")
            # 日付をdatetimeに変換（Prismaスキーマに合わせる）
            date_as_datetime = start_of_day

            care_log = await prisma_client.care_logs.create(
                data={
                    "care_setting_id": care_setting.id,
                    "date": date_as_datetime,  # datetimeとして保存
                    "fed_morning": False,
                    "fed_night": False,
                }
            )
            print(f"[walk_missions] care_log自動作成成功: {care_log.id}")
        else:
            print(f"[walk_missions] 既存care_log使用: {care_log.id}")

        # walk_mission を作成（care_log_id を自動設定）
        result = await prisma_client.walk_missions.create(
            data={
                "care_log_id": care_log.id,  # 確実に存在する care_log_id を使用
                "started_at": walk_mission.started_at,
                "ended_at": walk_mission.ended_at,
                "total_distance_m": walk_mission.total_distance_m,
                "result": walk_mission.result,
            }
        )
        print(f"[walk_missions] walk_mission作成成功: {result.id}")
        return result

    except HTTPException:
        # HTTPExceptionはそのまま再発生
        raise
    except Exception as e:
        print(f"[walk_missions] POST エラー詳細: {type(e).__name__}: {e}")
        raise HTTPException(
            status_code=500, detail="DB登録時にエラーが発生しました"
        ) from e


# 散歩ミッション一覧取得API
@walk_missions_router.get(
    "",  # エンドポイントURL
    response_model=List[WalkMissionResponse],  # レスポンスの型（リスト）
)
async def get_walk_missions():
    """
    散歩ミッション一覧取得API
    """
    try:
        print("[walk_missions] GET一覧取得開始")
        # Prismaクライアントで全件取得（作成日時の降順）
        results = await prisma_client.walk_missions.find_many(
            order={"created_at": "desc"}
        )
        print(f"[walk_missions] 取得件数: {len(results)}")
        return results  # 取得したレコード一覧を返す
    except Exception as e:
        print(f"[walk_missions] GET エラー詳細: {type(e).__name__}: {e}")
        # DBエラー時は500エラーを返す
        raise HTTPException(
            status_code=500, detail="DB取得時にエラーが発生しました"
        ) from e


# 散歩ミッション更新API
@walk_missions_router.patch(
    "/{mission_id}",  # エンドポイントURL（id指定）
    response_model=WalkMissionResponse,  # レスポンスの型
)
async def update_walk_mission(mission_id: int, walk_mission: WalkMissionCreate):
    """
    散歩ミッションの更新API
    """
    try:
        print(
            f"[walk_missions] PATCH受信: mission_id={mission_id}, data={walk_mission}"
        )

        # Prismaクライアントで指定idのレコードを更新
        result = await prisma_client.walk_missions.update(
            where={"id": mission_id},
            data=walk_mission.model_dump(
                exclude_unset=True
            ),  # Pydantic v2対応：未指定フィールドは除外
        )
        if not result:
            print(f"[walk_missions] mission not found: {mission_id}")
            # レコードが見つからない場合は404エラー
            raise HTTPException(status_code=404, detail="ミッションが見つかりません")

        print(f"[walk_missions] 更新成功: {result.id}")
        return result  # 更新後のレコードを返す
    except HTTPException:
        # HTTPExceptionはそのまま再発生
        raise
    except Exception as e:
        print(f"[walk_missions] PATCH エラー詳細: {type(e).__name__}: {e}")
        # DBエラー時は500エラーを返す
        raise HTTPException(
            status_code=500, detail="DB更新時にエラーが発生しました"
        ) from e
