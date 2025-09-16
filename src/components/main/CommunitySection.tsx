"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import Container from "../common/Container";
import { Link } from "@/i18n/navigation";
import CommunityList from "./CommunityList";

export default function CommunitySection() {
  const t = useTranslations("community-section");

  return (
    <section className='bg-white py-10'>
      <Container>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h2 className='text-xl md:text-2xl font-semibold'>{t("title")}</h2>
            <p className='text-sm text-gray-500'>{t("description")}</p>
          </div>

          {/* 데스크탑 CTA */}
          <Link
            href='/community'
            className='hidden md:inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs border border-gray-200 text-gray-600 hover:bg-gray-50'
          >
            {t("cta")}
            <ChevronRight size={14} />
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
            {t("cta")}
            <ChevronRight size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
