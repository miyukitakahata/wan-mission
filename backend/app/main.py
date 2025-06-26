from fastapi import FastAPI
from app.db import prisma_client
from dotenv import load_dotenv

# ルーターの import
from app.routers.user import user_router
from app.routers.care_settings import care_settings_router
from app.routers.walk_missions import walk_missions_router

# Prisma Client を使うための import
from app.db import prisma_client

app = FastAPI()

# .envファイルから環境変数を読み込む
load_dotenv()


# Prisma Client の接続・切断イベントを追加
@app.on_event("startup")
async def startup():
    await prisma_client.connect()


@app.on_event("shutdown")
async def shutdown():
    await prisma_client.disconnect()


# ルーターを登録
app.include_router(user_router)
app.include_router(care_settings_router)
app.include_router(walk_missions_router)


# ルートパス
@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI!"}
