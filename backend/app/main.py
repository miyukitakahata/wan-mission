# from fastapi import FastAPI

# app = FastAPI()

# @app.get("/")
# def read_root():
#     return {"message": "Hello from FastAPI!"}

from fastapi import FastAPI
from routers.user import user_router
from prisma import Prisma

app = FastAPI()
db = Prisma()

app.include_router(user_router)


@app.get("/")
async def read_root():
    return {"message": "Hello from FastAPI!"}


@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


@app.get("/dbcheck")
async def dbcheck():
    # users テーブルの1件目を取得
    user = await db.users.find_first()
    if user:
        return {"db_connection": "ok", "user_sample": user}
    else:
        return {"db_connection": "ok", "user_sample": None}
