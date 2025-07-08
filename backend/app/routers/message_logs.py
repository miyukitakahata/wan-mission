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
FREE_PLAN_MESSAGES = ["わん！", "きょうもいっしょだわん！", "だいすきだわん！"]


# def get_openai_message() -> str:
def get_openai_message(child_name: str) -> str:
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
                        # 情報
                        "あなたは犬のキャラクターです。8歳の子ども「{child_name}」に話しかけるように答えてください。"
                        # 【今回のタスク】
                        "- 以下のカテゴリのうち「{step}番」に該当する内容から、1つだけ豆知識を出してください。"
                        # 【カテゴリ】
                        "- 犬のお世話種類"
                        "- 躾が必要なところ"
                        "- 医学知識"
                        "- かならず最初に「{child_name}、」と名前をつけて下さい"
                        "- 出力は40文字以内のひとことでお願いします。"
                        "- お散歩の話は出さないでください。"
                        "- 直前・直後と同じ内容(例：「犬のお世話の種類」の後「犬のお世話の種類」を出す)を出すのは禁止です。"
                        "- 主語に「犬」や「ぼくは」などは禁止、動作・気持ち中心に伝えてください。"
                        "- 語尾には「〜だわん」「〜するわん」など、犬らしい言い回しをつけてください。"
                        "- 「ひらがなを中心に、小学2年生でも読める言葉で話してください。"
                        "- 40文字以内の一文で答えてください。"
                    ),
                }
            ],
            max_tokens=30,
            temperature=0,
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
            # 名前が未登録のときの代替
            child_name = user.child_name or "きみ"
            # プレミアムプランの場合はOpenAI APIを使用
            # message = get_openai_message()
            message = get_openai_message(child_name=child_name)
        else:
            # 無料プランの場合は固定メッセージからランダム選択
            message = random.choice(FREE_PLAN_MESSAGES)

        return JSONResponse(content={"message": message})

    except (KeyError, AttributeError, TypeError) as general_error:
        print(f"[ERROR] generate_message_log: {general_error}")
        # 予期しないエラーの場合でも、最低限固定メッセージを返す
        fallback_message = random.choice(FREE_PLAN_MESSAGES)
        return JSONResponse(content={"message": fallback_message})
