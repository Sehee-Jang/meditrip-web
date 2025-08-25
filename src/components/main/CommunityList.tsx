"use client";

import { useTranslations } from "next-intl";
import CommunityListItem from "./CommunityListItem";
import { useQuestions } from "@/hooks/useQuestions";

const LIMIT = 5;

export default function CommunityList() {
  const t = useTranslations("community-section");
  const { questions, loading } = useQuestions(LIMIT);

  return (
    <div className='bg-white'>
      <ul className='divide-y divide-gray-200/70'>
        {loading
          ? Array.from({ length: LIMIT }).map((_, i) => (
              <li key={i} className='px-4 py-3.5 animate-pulse'>
                <div className='h-4 w-2/3 rounded bg-gray-200/70' />
                <div className='mt-2 h-3 w-36 rounded bg-gray-100' />
              </li>
            ))
          : questions.map((q) => (
              <CommunityListItem
                key={q.id}
                question={{
                  id: q.id,
                  title: q.title ?? "",
                  userId: q.userId ?? "",
                  createdAt: q.createdAt, // ISO 문자열 그대로
                  answersCount:
                    typeof q.answersCount === "number"
                      ? q.answersCount
                      : undefined,
                }}
                anonymousLabel={t("anonymous")}
              />
            ))}
      </ul>
    </div>
  );
}
