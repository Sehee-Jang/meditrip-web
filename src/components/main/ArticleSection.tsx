"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import Container from "../common/Container";
import { Link } from "@/i18n/navigation";
import CommunityList from "./CommunityList";

export default function ArticleSection() {
  const t = useTranslations("article");

  return (
    <section className='bg-white py-10'>
      <Container>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h2 className='text-xl md:text-2xl font-semibold'>
              {t("section.title")}
            </h2>
            <p className='text-sm text-gray-500'>{t("section.desc")}</p>
          </div>

          {/* 데스크탑 CTA */}
          <Link
            href='/community'
            className='hidden md:flex items-center gap-1 bg-white text-black border text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 hover:border-gray-300 transition'
          >
            {t("section.button")}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* 커뮤니티 리스트 */}
        <CommunityList />

        {/* 모바일: 질문올리기 버튼 */}
        <div className='md:hidden mt-6 flex justify-center'>
          <Link
            href='/community'
            className='w-full max-w-xs bg-white text-black border flex items-center justify-center gap-1 text-sm font-medium px-4 py-3 rounded-md'
          >
            {t("section.button")}
            <ChevronRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
