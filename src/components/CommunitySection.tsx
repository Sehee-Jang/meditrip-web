"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import Container from "./layout/Container";
import { useQuestions } from "@/hooks/useQuestions";
import Link from "next/link";

export default function CommunitySection() {
  const t = useTranslations("community-section");
  const { questions, loading } = useQuestions(2);

  return (
    <section className='bg-white py-10'>
      <Container>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h2 className='text-xl md:text-2xl font-semibold'>{t("title")}</h2>
            <p className='text-sm text-gray-500'>{t("description")}</p>
          </div>

          {/* 데스크탑 질문올리기 버튼 */}
          <Link
            href='/community/'
            className='hidden md:flex items-center gap-1 bg-white text-black border text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 hover:border-gray-300 transition'
          >
            {t("cta")}
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {loading ? (
            <p>Loading...</p> // 필요시 skeleton 컴포넌트로 교체 가능
          ) : (
            questions.map((q) => (
              <Link
                key={q.id}
                href={`/community/questions/${q.id}`}
                className='border rounded-lg overflow-hidden shadow-sm bg-gray-50 hover:bg-gray-100 transition'
              >
                <div className='aspect-[4/3] bg-gray-200 flex items-center justify-center text-sm text-gray-500'>
                  {q.imageUrl ? (
                    <img
                      src={q.imageUrl}
                      alt='preview'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    "Image Thumb"
                  )}
                </div>
                <div className='p-4'>
                  <h3 className='text-sm font-semibold'>{q.title}</h3>
                  <div className='text-xs text-gray-500 mt-2'>
                    <div className='flex items-center gap-2'>
                      <div className='w-4 h-4 rounded-full bg-gray-300' />
                      <span>{q.userId || "익명"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Mobile CTA Button */}
        <div className='md:hidden mt-6 flex justify-center'>
          <Link
            href='/community'
            className='w-full max-w-xs bg-white text-black border flex items-center justify-center gap-1 text-sm font-medium px-4 py-3 rounded-md '
          >
            {t("cta")}
            <ChevronRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
