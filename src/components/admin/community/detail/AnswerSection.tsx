"use client";

import { useQuery } from "@tanstack/react-query";
import { listAnswers } from "@/services/community-admin/answers";
import AnswerItemCard from "./AnswerItemCard";

export default function AnswerSection({ questionId }: { questionId: string }) {
  const { data: answers, isLoading } = useQuery({
    queryKey: ["admin-answers", questionId],
    queryFn: () => listAnswers(questionId),
  });

  return (
    <section className='pt-4'>
      <h3 className='font-semibold mb-3'>
        답변{" "}
        <span className='text-muted-foreground'>({answers?.length ?? 0})</span>
      </h3>

      {isLoading ? (
        <div className='text-sm text-muted-foreground'>로딩 중…</div>
      ) : !answers || answers.length === 0 ? (
        <div className='text-sm text-muted-foreground'>
          아직 등록된 답변이 없습니다.
        </div>
      ) : (
        <ul className='space-y-3'>
          {answers.map((a) => (
            <AnswerItemCard key={a.id} questionId={questionId} answer={a} />
          ))}
        </ul>
      )}
    </section>
  );
}
