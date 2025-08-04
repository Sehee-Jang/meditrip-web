"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Question } from "@/types/question";
import CommonButton from "@/components/common/CommonButton";
import { useTranslations } from "next-intl";
import { deleteQuestion } from "@/services/questions/deleteQuestion";
import { getFormattedDate } from "@/utils/date";

export default function QuestionDetail({ question }: { question: Question }) {
  const router = useRouter();
  const t = useTranslations("question-detail");

  const handleDelete = async () => {
    const confirmed = confirm(t("confirmDelete"));
    if (!confirmed) return;

    try {
      await deleteQuestion(question.id);
      router.push("/community");
    } catch (err) {
      console.error(err);
      alert(t("deleteFailed"));
    }
  };

  const createdDate = new Date(question.createdAt);

  return (
    <article className='max-w-3xl mx-auto px-4 py-6 space-y-4'>
      {/* 본문 */}
      <p className='text-sm text-gray-500'>{question.category}</p>
      <h1 className='text-2xl font-bold'>{question.title}</h1>

      <p className='text-sm text-gray-400'>{getFormattedDate(createdDate)}</p>

      <div className='text-base whitespace-pre-line'>{question.content}</div>

      {question.imageUrl && (
        <div className='mt-4'>
          <Image
            src={question.imageUrl}
            alt='첨부 이미지'
            width={600}
            height={400}
            className='rounded-md'
          />
        </div>
      )}

      {/* 버튼 영역 */}
      <div className='flex justify-end gap-2'>
        <CommonButton
          className='bg-gray-200 text-black hover:bg-gray-300'
          onClick={() => router.push("/community")}
        >
          {t("back")}
        </CommonButton>
        <CommonButton
          className='bg-white text-black border border-gray-300 hover:bg-gray-100'
          onClick={() =>
            router.push(`/community/questions/${question.id}/edit/`)
          }
        >
          {t("edit")}
        </CommonButton>
        <CommonButton
          className='bg-red-500 hover:bg-red-600'
          onClick={handleDelete}
        >
          {t("delete")}
        </CommonButton>
      </div>
    </article>
  );
}
