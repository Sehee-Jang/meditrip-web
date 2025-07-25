"use client";

import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import Container from "./layout/Container";

const mockPosts = [
  {
    id: 1,
    title: "건강한 다이어트 방법이 궁금해요",
    hashtags: ["#다이어트", "#건강관리"],
    userId: "user123",
    thumbnail: "/images/mock-thumbnail1.jpg",
  },
  {
    id: 2,
    title: "여성질환에 좋은 한약이 있을까요?",
    hashtags: ["#여성질환", "#한의학"],
    userId: "hanidoc88",
    thumbnail: "/images/mock-thumbnail2.jpg",
  },
];

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

          {/* 데스크탑 질문올리기 버튼 */}
          <button className='hidden md:flex items-center gap-1 bg-white text-black border text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 hover:border-gray-300 transition'>
            {t("cta")}
            <ChevronRight size={16} />
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {mockPosts.map((post) => (
            <div
              key={post.id}
              className='border rounded-lg overflow-hidden shadow-sm bg-gray-50'
            >
              <div className='aspect-[4/3] bg-gray-200 flex items-center justify-center text-sm text-gray-500'>
                Image Thumb nail
              </div>
              <div className='p-4'>
                <h3 className='text-sm font-semibold'>{post.title}</h3>
                <div className='flex flex-wrap gap-1 mt-1 mb-2'>
                  {post.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className='text-xs bg-gray-100 rounded px-2 py-0.5 border text-gray-600'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className='flex items-center gap-2 text-xs text-gray-500'>
                  <div className='w-4 h-4 rounded-full bg-gray-300' />
                  <span className='font-medium'>{post.userId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile CTA Button */}
        <div className='md:hidden mt-6 flex justify-center'>
          <button className='w-full max-w-xs bg-white text-black border flex items-center justify-center gap-1 text-sm font-medium px-4 py-3 rounded-md '>
            {t("cta")}
            <ChevronRight size={16} />
          </button>
        </div>
      </Container>
    </section>
  );
}
