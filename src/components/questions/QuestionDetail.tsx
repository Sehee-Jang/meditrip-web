"use client";

import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Question } from "@/types/question";
import type { AnswerItem } from "@/types/question";
import CommonButton from "@/components/common/CommonButton";
import { useTranslations } from "next-intl";
import { deleteQuestion } from "@/services/questions/deleteQuestion";
import { formatDateCompact } from "@/utils/date";
import { listAnswers } from "@/services/community-admin/answers";
import UserNameById from "@/components/common/UserNameById";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";

export default function QuestionDetail({ question }: { question: Question }) {
  const router = useRouter();
  const t = useTranslations("question-detail");
  const tCat = useTranslations("categories"); // ⬅️ 카테고리 i18n

  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      const owner = !!user && !!question.userId && user.uid === question.userId;
      setIsOwner(owner);
    });
    return () => unsub();
  }, [question.userId]);

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

  // 삭제 버튼 핸들러
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
      {/* 헤더 */}
      <header className='space-y-3'>
        <h1 className='text-2xl md:text-3xl font-bold tracking-[-0.01em] text-gray-900'>
          {question.title}
        </h1>

        {/* 카테고리 · 작성자 · 작성일 */}
        <div className='flex flex-wrap items-center gap-2 text-xs text-gray-500'>
          {/* 카테고리 */}
          <span className='inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2.5 py-1'>
            {tCat(question.category)}
          </span>

          {question.userId && <span className='text-gray-300'>•</span>}

          {/* 작성자명 */}
          {question.userId ? (
            <span className='truncate'>
              <UserNameById
                userId={question.userId}
                fallbackName={t("anonymous")}
              />
            </span>
          ) : null}

          <span className='text-gray-300'>•</span>

          {/* 작성일 */}
          <time dateTime={createdDate.toISOString()}>
            {formatDateCompact(createdDate)}
          </time>
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
              alt={t("image.alt")}
              width={1200}
              height={800}
              className='w-full h-auto object-cover'
              priority
            />
          </div>
        )}
      </section>

      <hr className='border-gray-100' />

      {/* 운영자 답변 */}
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-[17px] font-semibold text-gray-900'>
            {t("answers.title")}
          </h2>
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
          <div className='text-sm text-gray-500'>{t("answers.none")}</div>
        ) : (
          <ul className='space-y-3'>
            {answers.map((a) => (
              <li
                key={a.id}
                className='rounded-xl border border-gray-200 bg-white p-4'
              >
                <div className='text-[12px] text-gray-500 mb-2'>
                  {formatDateCompact(new Date(a.createdAt))}
                  {a.updatedAt && (
                    <span className='ml-2'>
                      · {t("answers.updated")}{" "}
                      {formatDateCompact(new Date(a.updatedAt))}
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

      {/* 버튼: 본인에게만 노출 */}
      {isOwner && (
        <div className='pt-2 flex flex-col sm:flex-row gap-2 justify-end'>
          {/* 목록 버튼 */}
          <CommonButton
            className='sm:w-auto w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
            onClick={() => router.push("/community")}
          >
            {t("back")}
          </CommonButton>

          {/* 수정 버튼 */}
          <CommonButton
            className='sm:w-auto w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
            onClick={() =>
              router.push(`/community/questions/${question.id}/edit/`)
            }
          >
            {t("edit")}
          </CommonButton>

          {/* 삭제 버튼 */}
          <CommonButton
            className='sm:w-auto w-full bg-red-500 hover:bg-red-600'
            onClick={handleDelete}
          >
            {t("delete")}
          </CommonButton>
        </div>
      )}

      {/* 버튼: 본인이 아닌 경우 */}
      {!isOwner && (
        <div className='pt-2 flex justify-end'>
          {/* 목록 버튼 */}
          <CommonButton
            className='sm:w-auto w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
            onClick={() => router.push("/community")}
          >
            {t("back")}
          </CommonButton>
        </div>
      )}
    </article>
  );
}
