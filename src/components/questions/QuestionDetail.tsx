"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Question } from "@/types/question";
import type { AnswerItem } from "@/types/question";
import CommonButton from "@/components/common/CommonButton";
import { useTranslations } from "next-intl";
import { deleteQuestion } from "@/services/questions/deleteQuestion";
import { getFormattedDate } from "@/utils/date";
import { listAnswers } from "@/services/community-admin/answers";

export default function QuestionDetail({ question }: { question: Question }) {
  const router = useRouter();
  const t = useTranslations("question-detail");

  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingAnswers(true);
      try {
        const items = await listAnswers(question.id);
        if (mounted) setAnswers(items);
      } finally {
        if (mounted) setLoadingAnswers(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [question.id]);

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
    <article className='max-w-3xl mx-auto px-4 py-8 space-y-8'>
      {/* 헤더: 카테고리 배지 + 제목 + 메타 */}
      <header className='space-y-3'>
        <div className='inline-flex items-center gap-2'>
          <span className='rounded-full bg-gray-100 text-gray-700 text-xs px-2.5 py-1'>
            {question.category}
          </span>
          {question.user?.nickname ? (
            <span className='text-xs text-gray-500'>
              · {question.user.nickname}
            </span>
          ) : null}
        </div>

        <h1 className='text-[22px] md:text-2xl font-semibold tracking-[-0.01em] text-gray-900'>
          {question.title}
        </h1>

        <div className='text-[13px] text-gray-500'>
          {getFormattedDate(createdDate)}
        </div>
      </header>

      {/* 본문 */}
      <section className='space-y-4'>
        <div className='text-[15px] leading-7 text-gray-900 whitespace-pre-wrap'>
          {question.content}
        </div>

        {question.imageUrl && (
          <div className='relative w-full overflow-hidden rounded-2xl border border-gray-200'>
            <Image
              src={question.imageUrl}
              alt='첨부 이미지'
              width={1200}
              height={800}
              className='w-full h-auto object-cover'
              priority
            />
          </div>
        )}
      </section>

      {/* 구분선 */}
      <hr className='border-gray-100' />

      {/* 운영자 답변 */}
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-[17px] font-semibold text-gray-900'>답변</h2>
        </div>

        {loadingAnswers ? (
          <ul className='space-y-3'>
            {Array.from({ length: 2 }).map((_, i) => (
              <li
                key={i}
                className='rounded-xl border border-gray-200 bg-white p-4'
              >
                <div className='h-3 w-24 rounded bg-gray-100 mb-3 animate-pulse' />
                <div className='h-3 w-full rounded bg-gray-100 mb-2 animate-pulse' />
                <div className='h-3 w-2/3 rounded bg-gray-100 animate-pulse' />
              </li>
            ))}
          </ul>
        ) : answers.length === 0 ? (
          <div className='text-sm text-gray-500'>
            아직 등록된 답변이 없습니다.
          </div>
        ) : (
          <ul className='space-y-3'>
            {answers.map((a) => (
              <li
                key={a.id}
                className='rounded-xl border border-gray-200 bg-white p-4'
              >
                <div className='text-[12px] text-gray-500 mb-2'>
                  {getFormattedDate(new Date(a.createdAt))}
                  {a.updatedAt && (
                    <span className='ml-2'>
                      · 수정 {getFormattedDate(new Date(a.updatedAt))}
                    </span>
                  )}
                </div>
                <div className='text-[15px] leading-7 text-gray-900 whitespace-pre-wrap'>
                  {a.content}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 버튼 영역 */}
      <div className='pt-2 flex flex-col sm:flex-row gap-2 justify-end'>
        <CommonButton
          className='sm:w-auto w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
          onClick={() => router.push("/community")}
        >
          {t("back")}
        </CommonButton>
        <CommonButton
          className='sm:w-auto w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
          onClick={() =>
            router.push(`/community/questions/${question.id}/edit/`)
          }
        >
          {t("edit")}
        </CommonButton>
        <CommonButton
          className='sm:w-auto w-full bg-red-500 hover:bg-red-600'
          onClick={handleDelete}
        >
          {t("delete")}
        </CommonButton>
      </div>
    </article>
  );
}
