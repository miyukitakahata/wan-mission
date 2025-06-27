"""FastAPIメインアプリケーションのエントリーポイント"""

from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
from fastapi import FastAPI
from dotenv import load_dotenv

# ルーターの import
from app.routers.user import user_router
from app.routers.care_logs import care_logs_router
from app.routers.care_settings import care_settings_router
from app.routers.walk_missions import walk_missions_router

# Prisma Client を使うための import
from app.db import prisma_client


# Prisma Client の lifespan context manager（FastAPI v0.95以降の推奨）
@asynccontextmanager
async def lifespan(_: FastAPI):
    """起動時と終了時の処理をまとめて管理"""
    await prisma_client.connect()  # 起動時の処理
    yield
    await prisma_client.disconnect()  # 終了時の処理


# lifespanを使ったFastAPIインスタンス
app = FastAPI(lifespan=lifespan)

# CORSの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ← Next.js開発サーバーのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# .envファイルから環境変数を読み込む
load_dotenv()

# ルーターを登録
app.include_router(user_router)
app.include_router(care_logs_router)
app.include_router(care_settings_router)
app.include_router(walk_missions_router)


# ルートパス
@app.get("/")
async def read_root():
    """ルートパスのテスト用エンドポイント"""
    return {"message": "Hello from FastAPI!"}
