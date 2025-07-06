"""
犬のひとこと生成APIルーター。
無料プランは固定メッセージ、プレミアムはOpenAIで生成。
"""

import os
import random
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.db import prisma_client
from app.dependencies import verify_firebase_token
from openai import OpenAI, OpenAIError

message_logs_router = APIRouter(prefix="/api/message_logs", tags=["message_logs"])

# To-do: ひらがなにする
FREE_PLAN_MESSAGES = [
    "おさんぽだいすきだよ！",
    "ごはんまだかな〜？",
    "だいすきだよ！",
    "しっぽふりふり！",
    "きょうもいっしょにあそぼうね！",
    "おなかすいたわん！",
    "さんぽにいきたいわん〜",
    "ありがとうわん！",
    "げんきいっぱいだわん！",
    "なでてくれてありがとうわん♪",
    "きょうはいいてんきだわん！",
    "おせわしてくれてうれしいわん！",
    "あそぼうわん！わん！",
    "だいすきだわん♡",
    "こんどはどこにいくわん？",
]


def get_openai_message() -> str:
    """
    OpenAI APIを呼び出してメッセージを生成する

    Returns:
        str: 生成されたメッセージ
    """
    try:

        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY が設定されていません")

        # クライアントを明示的に初期化
        client = OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "あなたは犬のキャラクターです。プレミアム会員の子ども（8歳）に向けて、犬といっしょにくらすときに知っておくとよい、ちょっとたいへんなことやおせわのじかんたい、こうどうのいみなどのまめちしきを、30文字いないでやさしく教えてください。ひらがなと小学2年生レベルの漢字をつかってください。さいごは「〜わん」「〜だわん」「〜するわん」などの語尾をつけてください。"
                    ),
                }
            ],
            max_tokens=30,
            temperature=0.8,
            timeout=10,
        )

        message = response.choices[0].message.content
        if message:
            return message.strip()

        raise ValueError("OpenAIからの応答が空です")

    except OpenAIError as openai_error:
        print(f"OpenAI API エラー: {openai_error}")
        # エラーが発生した場合は固定メッセージを返す
        return random.choice(FREE_PLAN_MESSAGES)
    except ValueError as value_error:
        print(f"OpenAI API 設定エラー: {value_error}")
        return random.choice(FREE_PLAN_MESSAGES)


@message_logs_router.post("/generate")
async def generate_message_log(
    firebase_uid: str = Depends(verify_firebase_token),
) -> JSONResponse:
    """
    犬のひとことを生成して保存し、返すAPI
    無料プラン対応：固定セリフからランダム選択
    プレミアムプラン対応：OpenAIで生成。

    Args:
        firebase_uid (str): Firebase認証UID

    Returns:
        JSONResponse: 生成されたメッセージ

    Raises:
        HTTPException: ユーザーが見つからない場合
    """
    try:
        # firebase_uidからusersテーブルのuserを特定
        user = await prisma_client.users.find_unique(
            where={"firebase_uid": firebase_uid}
        )

        if not user:
            raise HTTPException(
                status_code=400, detail="指定されたFirebase UIDのユーザーが存在しません"
            )

        if user.current_plan == "premium":
            # プレミアムプランの場合はOpenAI APIを使用
            message = get_openai_message()
        else:
            # 無料プランの場合は固定メッセージからランダム選択
            message = random.choice(FREE_PLAN_MESSAGES)

        return JSONResponse(content={"message": message})

    except (KeyError, AttributeError, TypeError) as general_error:
        print(f"[ERROR] generate_message_log: {general_error}")
        # 予期しないエラーの場合でも、最低限固定メッセージを返す
        fallback_message = random.choice(FREE_PLAN_MESSAGES)
        return JSONResponse(content={"message": fallback_message})
