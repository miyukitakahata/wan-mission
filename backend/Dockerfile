FROM python:3.11-slim
WORKDIR /app

# Node.js をインストール（npxのため）
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g prisma

# Python ライブラリをインストール
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# アプリのコードをコピー
COPY . .

# Prisma Python クライアント自動生成&DBマイグレ
RUN prisma generate
RUN npx prisma migrate deploy

EXPOSE 8000

# マイグレーションしてからサーバー起動！
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

