"use client";

import { Link } from "@/i18n/navigation";
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
      <h2 className='mb-3 text-base font-semibold'>{t("questions.title")}</h2>

      {questions.length === 0 ? (
        <div className='rounded-2xl border border-border bg-card px-5 py-6 text-center text-sm text-muted-foreground shadow-sm'>
          {t("questions.empty")}
        </div>
      ) : (
        <ul className='space-y-3'>
          {questions.map((q) => (
            <li key={q.id}>
              <Link
                href={`/community/questions/${q.id}`}
                className='group block rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:p-5'
              >
                <div className='flex items-start justify-between gap-4'>
                  {/* 왼쪽: 제목 + 날짜 */}
                  <div className='min-w-0'>
                    <h3 className='font-medium leading-6 line-clamp-2'>
                      {q.title}
                    </h3>
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {t("questions.writtenDate")}: {q.date}
                    </p>
                  </div>

                  {/* 오른쪽: 상태 배지 + 화살표(가까이 배치) */}
                  <div className='flex items-center gap-2 shrink-0'>
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                        q.answered
                          ? // 답변됨(성공) — 라이트/다크 쌍
                            "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700"
                          : // 대기중(경고) — 라이트/다크 쌍
                            "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:ring-rose-700",
                      ].join(" ")}
                    >
                      {q.answered
                        ? t("questions.answered")
                        : t("questions.pending")}
                    </span>
                    <ChevronRight
                      size={18}
                      className='text-muted-foreground transition-colors group-hover:text-foreground/80'
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
