"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  getQuestions,
  getQuestionsCount,
} from "@/services/questions/getQuestions";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { Question } from "@/types/question";
import { formatDateCompact } from "@/utils/date";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";
import UserNameById from "@/components/common/UserNameById";
import PaginationControls from "../common/PaginationControls";

export default function PaginatedQuestionList({
  pageSize = 5,
}: {
  pageSize?: number;
}) {
  const t = useTranslations("community-page");
  const tCat = useTranslations("categories");
  const [cursors, setCursors] = useState<
    (QueryDocumentSnapshot<DocumentData> | undefined)[]
  >([undefined]);
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // 1) 마운트 시 한 번만 전체 개수 조회
  useEffect(() => {
    getQuestionsCount().then((count) => setTotalCount(count));
  }, []);

  // 2) page 혹은 cursor 변경 시 질문 목록만 조회
  useEffect(() => {
    getQuestions(pageSize, cursors[page - 1]).then(({ questions, lastDoc }) => {
      setQuestions(questions);
      if (lastDoc && cursors.length === page) {
        setCursors((prev) => [...prev, lastDoc]);
      }
    });
  }, [page, pageSize, cursors]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className='space-y-2'>
      <ul className='mx-auto'>
        {questions.map((q) => {
          const date = q.createdAt
            ? formatDateCompact(q.createdAt)
            : t("noDate");

          const answerCount = Number(q.answersCount ?? 0);
          const hasAnswer = answerCount > 0;

          const userId = q.userId;

          return (
            <li
              key={q.id}
              className='py-6 px-4 border-b hover:bg-gray-50 transition'
            >
              <Link href={`/community/questions/${q.id}`}>
                <div className='flex items-center gap-3'>
                  <MessageSquare className='w-5 h-5 text-gray-400' />
                  <div className='flex-1'>
                    <h3 className='font-medium'>{q.title}</h3>
                    <div className='flex flex-wrap items-center gap-2 text-sm text-gray-400'>
                      <span>
                        👤 {t("question.user")}:{" "}
                        {userId ? (
                          <UserNameById
                            userId={userId}
                            fallbackName={t("question.anonymous")}
                          />
                        ) : (
                          t("question.anonymous")
                        )}
                      </span>
                      <span>|</span>
                      <span>🗓 {date}</span>
                      <span>|</span>
                      <span>
                        📁 {t("question.category")}: {tCat(q.category)}
                      </span>
                    </div>
                  </div>
                  <div className='ml-auto'>
                    {hasAnswer ? (
                      <span className='flex items-center text-sm text-green-600'>
                        <CheckCircle className='w-4 h-4 mr-1' />
                        {t("question.hasAnswer")} ({answerCount})
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

      <PaginationControls
        className='pt-8'
        current={page}
        totalPages={totalPages}
        onChange={setPage}
      />
    </div>
  );
}
