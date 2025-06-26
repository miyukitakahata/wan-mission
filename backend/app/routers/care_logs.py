from fastapi import APIRouter, HTTPException, Depends, Header
from prisma import Prisma
from pydantic import BaseModel
from datetime import date, time, datetime

care_logs_router = APIRouter(
    prefix="/api/care_logs",
    tags=["care_logs"]
)

db = Prisma()