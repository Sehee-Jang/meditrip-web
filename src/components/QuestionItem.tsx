import { getTranslations } from "next-intl/server";

type QuestionItemProps = {
  username: string;
  date: string;
  category: string;
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

  return (
    <div className='flex items-start gap-3 py-4 border-b'>
      <div className='text-red-500 text-xl'>❓</div>
      <div className='flex-1'>
        <p className='font-medium'>{question}</p>
        <div className='text-sm text-gray-500 mt-1'>
          👤 {t("question.user")}: {username} | 🗓 {date} | 📁{" "}
          {t("question.category")}: {category} | 💬 {t("question.answer")}:{" "}
          {answers}개
        </div>
      </div>
    </div>
  );
}
