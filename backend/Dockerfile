FROM python:3.11-slim
WORKDIR /app

# 必要ファイルだけ先にコピーして pip install
COPY requirements.txt .env ./
RUN pip install --no-cache-dir -r requirements.txt

# アプリのコードをコピー
COPY . .

# Prisma Python クライアント自動生成
RUN prisma generate

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
