"use client";
// 今追加できていないページ
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Heart } from "lucide-react"; // lucide-reactアイコン
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ReflectionWritingPage() {
  const router = useRouter(); // Next.jsのフックページ遷移などに使う
  const [reflection, setReflection] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (reflection.trim() && title.trim()) {
      setIsSubmitting(true);

      // 反省文を保存する処理
      const reflectionData = {
        id: Date.now(),
        title,
        content: reflection,
        date: new Date().toISOString().split("T")[0],
      };

      // ローカルストレージに保存
      const existingReflections = JSON.parse(
        localStorage.getItem("reflections") || "[]"
      );
      existingReflections.push(reflectionData);
      localStorage.setItem("reflections", JSON.stringify(existingReflections));

      // お世話の状態をリセット（わんちゃんが戻ってくる）
      localStorage.setItem("lastCareTime", new Date().toISOString());
      localStorage.setItem("dogReturned", "true");

      // 少し待ってから戻ってくる演出画面に遷移
      setTimeout(() => {
        router.push("/welcome-back");
      }, 1000);
    }
  };

  const reflectionPrompts = [
    "わんちゃんにどんなことをしてあげられなかったですか？",
    "わんちゃんはどんな気持ちだったと思いますか？",
    "次回はどのようにお世話をしたいですか？",
    "わんちゃんに謝りたいことはありますか？",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-4 sm:px-6 py-6">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center">
            <FileText className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
            反省文を書く
          </h1>
        </div>

        <Card className="mb-6 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <Heart className="mr-2 h-4 w-4 text-red-500" />
              <h2 className="text-base sm:text-lg font-medium">
                わんちゃんへの気持ちを書いてみましょう
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              わんちゃんが悲しい思いをしてしまいました。あなたの気持ちを素直に書いて、
              次回はもっと良いお世話ができるように振り返ってみましょう。
            </p>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="title"
                  className="text-sm sm:text-base font-medium"
                >
                  反省文のタイトル
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="例：お散歩をさぼってしまいました"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label
                  htmlFor="reflection"
                  className="text-sm sm:text-base font-medium"
                >
                  反省文
                </Label>
                <Textarea
                  id="reflection"
                  placeholder="わんちゃんへの気持ちや反省を書いてください..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="mt-1 min-h-32"
                  rows={6}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 bg-blue-50">
          <CardHeader className="pb-2">
            <h3 className="text-base font-medium">書くヒント</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reflectionPrompts.map((prompt, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2 text-sm">•</span>
                  <p className="text-sm text-gray-600">{prompt}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            className="w-full bg-purple-400 hover:bg-purple-500 text-white py-4 sm:py-6 text-sm sm:text-base rounded-full disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!reflection.trim() || !title.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                わんちゃんを呼んでいます...
              </div>
            ) : (
              "反省文を保存する"
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full py-3 sm:py-4 text-sm sm:text-base rounded-full"
            onClick={() => router.push("/dashboard")}
            disabled={isSubmitting}
          >
            後で書く
          </Button>
        </div>

        {reflection.trim() && title.trim() && !isSubmitting && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 text-center">
              反省文を書くことで、わんちゃんとの絆が深まります。きっとわんちゃんも喜んでくれるでしょう。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
