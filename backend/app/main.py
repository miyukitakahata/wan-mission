"""FastAPIメインアプリケーションのエントリーポイント"""

import os
from contextlib import asynccontextmanager

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from dotenv import load_dotenv

# .envファイルから環境変数を読み込む
load_dotenv()

# ルーターの import
from app.routers.user import user_router
from app.routers.care_logs import care_logs_router
from app.routers.care_settings import care_settings_router
from app.routers.reflection_notes import reflection_notes_router
from app.routers.message_logs import message_logs_router
from app.routers.payment import payment_router
from app.routers.webhook_events import webhook_events_router


# Prisma Client を使うための import
from app.db import prisma_client


# FastAPI Exporterを使ってメトリクス収集のためimport
from prometheus_fastapi_instrumentator import Instrumentator


# Prisma Client の lifespan context manager（FastAPI v0.95以降の推奨）
@asynccontextmanager
async def lifespan(_: FastAPI):
    """起動時と終了時の処理をまとめて管理"""
    await prisma_client.connect()  # 起動時の処理
    yield
    await prisma_client.disconnect()  # 終了時の処理


# lifespanを使ったFastAPIインスタンス
app = FastAPI(lifespan=lifespan)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターを登録
app.include_router(user_router)
app.include_router(care_logs_router)
app.include_router(care_settings_router)
app.include_router(reflection_notes_router)
app.include_router(message_logs_router)
app.include_router(payment_router)
app.include_router(webhook_events_router)


# ルートパス
@app.get("/")
async def read_root():
    """ルートパスのテスト用エンドポイント"""
    return {"message": "Hello from FastAPI!"}


# メトリクス収集器の初期化と有効化
Instrumentator().instrument(app).expose(app)


# レスポンスタイム遅延テスト用エンドポイント
# import time
#
#
# @app.get("/slow")
# async def slow_endpoint():
#     """わざと5.0秒待つ遅いレスポンス（Prometheusのalertテスト用）"""
#     time.sleep(5.0)
#     return {"message": "This is a slow response"}
