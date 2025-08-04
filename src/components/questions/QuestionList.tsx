"use client";

import { useEffect, useState } from "react";
import { getAllQuestions } from "@/services/questions/getAllQuestions";
import Link from "next/link";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Question } from "@/types/question";
import { getFormattedDate } from "@/utils/date";

export default function QuestionList() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const t = useTranslations("community-page");
  const tCategory = useTranslations("categories");

  useEffect(() => {
    const fetch = async () => {
      const data = await getAllQuestions();
      setQuestions(data);
    };
    fetch();
  }, []);

  return (
    <div className='space-y-2'>
      <ul className='max-w-3xl mx-auto px-4 py-8 space-y-4'>
        {questions.map((q) => {
          const date = q.createdAt
            ? getFormattedDate(q.createdAt)
            : t("noDate");
          const answerCount = q.answers?.length || 0;
          const hasAnswer = answerCount > 0;

          return (
            <li key={q.id} className='p-4 hover:bg-gray-50 border-b transition'>
              <Link href={`/community/questions/${q.id}`}>
                <div className='flex items-center gap-3'>
                  {/* 아이콘 */}
                  <div className='mt-1 '>
                    <MessageSquare className='text-gray-400 w-5 h-5' />
                  </div>

                  {/* 질문 본문 */}
                  <div className='flex-1'>
                    <h3 className='text-base font-medium mt-1'>{q.title}</h3>
                    <div className='flex flex-wrap items-center gap-2 text-sm text-gray-400'>
                      <span>
                        👤 {t("question.user")}:
                        {q.user?.name || t("question.anonymous")}
                      </span>
                      <span>|</span>
                      <span>🗓 {date}</span>
                      <span>|</span>
                      <span>
                        📁 {t("question.category")}: {tCategory(q.category)}
                      </span>
                    </div>
                  </div>

                  {/* 답변 상태 */}
                  <div className='ml-auto mt-1'>
                    {hasAnswer ? (
                      <span className='flex items-center text-sm text-green-600'>
                        <CheckCircle className='w-4 h-4 mr-1' />
                        {t("answer")} ({answerCount})
                      </span>
                    ) : (
                      <span className='flex items-center text-sm text-gray-400'>
                        <Clock className='w-4 h-4 mr-1' />
                        {t("question.pending")} (0)
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
