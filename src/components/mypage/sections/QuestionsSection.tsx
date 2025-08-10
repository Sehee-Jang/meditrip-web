"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import type { MyQuestion } from "@/types/mypage";

export default function QuestionsSection({
  questions,
}: {
  questions: MyQuestion[];
}) {
  const t = useTranslations("mypage");

  return (
    <section>
      <h2 className='text-base font-semibold mb-3'>{t("questions.title")}</h2>

      {questions.length === 0 ? (
        <div className='rounded-2xl border bg-white shadow-sm px-5 py-6 text-center text-gray-500'>
          {t("questions.empty")}
        </div>
      ) : (
        <ul className='space-y-3'>
          {questions.map((q) => (
            <li key={q.id}>
              <Link
                href={`/community/questions/${q.id}`}
                className='group block rounded-2xl border bg-white shadow-sm p-4 sm:p-5 hover:bg-gray-100 transition'
              >
                <div className='flex items-start justify-between gap-4'>
                  {/* 왼쪽: 제목 + 날짜 */}
                  <div className='min-w-0'>
                    <h3 className='font-medium leading-6 line-clamp-2'>
                      {q.title}
                    </h3>
                    <p className='mt-1 text-sm text-gray-600'>
                      {t("questions.writtenDate")}: {q.date}
                    </p>
                  </div>

                  {/* 오른쪽: 상태 배지 + 화살표(가까이 배치) */}
                  <div className='flex items-center gap-2 shrink-0'>
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                        q.answered
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-rose-50 text-rose-700 ring-rose-200",
                      ].join(" ")}
                    >
                      {q.answered
                        ? t("questions.answered")
                        : t("questions.pending")}
                    </span>
                    <ChevronRight
                      size={18}
                      className='text-gray-300 group-hover:text-gray-400'
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
