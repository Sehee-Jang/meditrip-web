"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { getAdminQuestionById } from "@/services/community-admin/getAdminQuestionById";
import { Button } from "@/components/ui/button";
import DetailHeader from "./DetailHeader";
import DetailActions from "./DetailActions";
import AnswerSection from "./AnswerSection";
export default function CommunityAdminDetail({
  questionId,
  locale,
}: {
  questionId: string;
  locale: string;
}) {
  const router = useRouter();

  // 질문 본문
  const { data: question, isLoading } = useQuery({
    queryKey: ["admin-question", questionId],
    queryFn: () => getAdminQuestionById(questionId),
  });

  if (isLoading) {
    return (
      <div className='rounded-2xl border bg-white shadow-sm p-6'>로딩 중…</div>
    );
  }
  if (!question) {
    return (
      <div className='rounded-2xl border bg-white shadow-sm p-6'>
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* 상단 바 */}
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.push(`/${locale}/admin/community`)}
          className='-ml-2'
        >
          <ArrowLeft className='mr-1.5 size-4' />
          목록으로
        </Button>
      </div>

      {/* 본문 카드 */}
      <div className='rounded-2xl border bg-white shadow-sm'>
        <div className='flex items-start justify-between gap-4 px-6 py-5 border-b'>
          <DetailHeader question={question} />
          <DetailActions questionId={question.id} locale={locale} />
        </div>

        {/* 콘텐츠 영역 */}
        <div className='px-6 py-6 space-y-6'>
          {question.imageUrl && (
            <div className='rounded-xl border overflow-hidden max-w-lg'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.imageUrl}
                alt=''
                className='w-full object-contain'
              />
            </div>
          )}

          <div className='prose prose-sm max-w-none'>
            <p className='whitespace-pre-wrap leading-7'>{question.content}</p>
          </div>

          {/* 답변 섹션 */}
          <AnswerSection questionId={question.id} />
        </div>
      </div>
    </div>
  );
}
