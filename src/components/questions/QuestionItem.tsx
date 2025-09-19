"use client";
import { CategoryKey } from "@/constants/categories";
import { useTranslations } from "next-intl";

type QuestionItemProps = {
  username: string;
  date: string;
  category: CategoryKey;
  question: string;
  answers: number;
};

export default function QuestionItem({
  username,
  date,
  category,
  question,
  answers,
}: QuestionItemProps) {
  const t = useTranslations("community-page");
  const tCategory = useTranslations("categories");

  return (
    <div className='flex items-start gap-3 py-4 border-b'>
      <div className='text-red-500 text-xl'>❓</div>
      <div className='flex-1'>
        <p className='font-medium'>{question}</p>
        <div className='text-sm text-muted-foreground mt-1'>
          👤 {t("question.user")}: {username} | 🗓 {date} | 📁{" "}
          {t("question.category")}: {tCategory(category)} | 💬{" "}
          {t("question.answer")}: {answers}
          {t("question.qty")}
        </div>
      </div>
    </div>
  );
}
