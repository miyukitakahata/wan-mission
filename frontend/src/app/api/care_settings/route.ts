import { NextResponse } from "next/server";

export async function GET() {
  try {
    // APIからケア設定情報を取得
    // 実際の実装では、データベースやセッションから情報を取得します
    // ここではサンプルデータを返します
    const careSettings = {
      mom_name: "山田 花子",
      child_name: "さき",
      dog_name: "ポチ",
      care_start_date: "2024-01-15",
      care_end_date: "2024-01-22",
    };

    return NextResponse.json(careSettings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch care settings" },
      { status: 500 }
    );
  }
}
