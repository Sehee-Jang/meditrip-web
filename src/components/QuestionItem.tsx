import { getTranslations } from "next-intl/server";
import { CategoryKey } from "@/constants/categories";

type QuestionItemProps = {
  username: string;
  date: string;
  category: CategoryKey;
  question: string;
  answers: number;
};

export default async function QuestionItem({
  username,
  date,
  category,
  question,
  answers,
}: QuestionItemProps) {
  const t = await getTranslations("community-page");
  const tCategory = await getTranslations("categories");

  return (
    <div className='flex items-start gap-3 py-4 border-b'>
      <div className='text-red-500 text-xl'>❓</div>
      <div className='flex-1'>
        <p className='font-medium'>{question}</p>
        <div className='text-sm text-gray-500 mt-1'>
          👤 {t("question.user")}: {username} | 🗓 {date} | 📁{" "}
          {t("question.category")}: {tCategory(category)} | 💬{" "}
          {t("question.answer")}: {answers}
          {t("question.qty")}
        </div>
      </div>
    </div>
  );
}
