"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { useTranslations } from "next-intl";
import SignupPrompt from "./SignupPrompt";
import Image from "next/image";
import Link from "next/link";

// mock 데이터
const mockShorts = [
  {
    id: 1,
    youtubeUrl: "https://www.youtube.com/shorts/1KsyWcipOJA",
    thumbnail: "/images/shorts_thumb1.jpg",
    category: "면역관리",
    title: "기침과 가래에 좋은 한방차 만들기",
  },
  {
    id: 2,
    youtubeUrl: "https://www.youtube.com/shorts/pYfr5DhnOak",
    thumbnail: "/images/shorts_thumb2.jpg",
    category: "스트레스",
    title: "스트레스 완화를 위한 호흡법",
  },
  {
    id: 3,
    youtubeUrl: "https://www.youtube.com/shorts/eedVPzSACkU",
    thumbnail: "/images/shorts_thumb3.jpg",
    category: "다이어트",
    title: "체지방 감량에 좋은 침자리",
  },
  {
    id: 4,
    youtubeUrl: "https://www.youtube.com/shorts/KrhhJw9Fq4Y",
    thumbnail: "/images/shorts_thumb4.jpg",
    category: "안티에이징",
    title: "10년 젊어지는 쳐진눈 올리기 마사지",
  },
  // 추가 mock 필요시 이어서 작성
];

export default function ContentSection() {
  const t = useTranslations("Theme");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const viewedIds = useRef<Set<number>>(new Set());
  const viewedRatio = viewCount / mockShorts.length;

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setIsAnonymous(user.isAnonymous);
    }
  }, []);

  useEffect(() => {
    if (isAnonymous && viewedRatio >= 1 / 3 && !showPrompt) {
      setShowPrompt(true);
    }
  }, [isAnonymous, viewedRatio, showPrompt]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = Number(entry.target.getAttribute("data-id"));
          if (entry.isIntersecting && !viewedIds.current.has(id)) {
            viewedIds.current.add(id);
            setViewCount(viewedIds.current.size);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    const items = document.querySelectorAll(".shorts-item");
    items.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className='px-4 py-10'>
      <h2 className='text-xl font-bold mb-4'>{t("title")}</h2>

      {/* 카드와 버튼을 flex로 정렬 */}
      <div className='flex flex-wrap gap-4 items-start justify-between'>
        {mockShorts.map((item) => (
          <div
            key={item.id}
            className='w-[150px] border border-black/10 rounded-lg overflow-hidden bg-white'
          >
            <div className='relative w-full h-[150px]'>
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                className='object-cover'
              />
            </div>
            <div className='p-2'>
              <p className='text-sm text-gray-800'>{item.category}</p>
              <p className='text-sm font-bold mt-1 line-clamp-2'>
                {item.title}
              </p>
            </div>
          </div>
        ))}

        {/* ✅ 데스크탑: 카드 옆에 보이는 더보기 버튼 */}
        <div className='hidden md:flex w-[150px] h-[210px] items-center justify-center'>
          <Link
            href='/contents'
            className='px-4 py-2 bg-black text-white text-sm font-medium rounded-md'
          >
            더 보기
          </Link>
        </div>
      </div>

      {/* ✅ 모바일: 콘텐츠 하단에 중앙 정렬된 더보기 버튼 */}
      <div className='mt-8 md:hidden flex justify-center'>
        <Link
          href='/contents'
          className='block w-full  text-center px-6 py-2 bg-black text-white text-sm font-medium rounded-md'
        >
          더 보기
        </Link>
      </div>
    </section>
    // <section className='px-4 py-10'>
    //   <h2 className='text-xl font-bold mb-4'>Discover Our Themes</h2>
    //   <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
    //     {mockShorts.map((item) => {
    //       const isBlocked = showPrompt && !viewedIds.current.has(item.id);
    //       return (
    //         <div
    //           key={item.id}
    //           data-id={item.id}
    //           className='shorts-item rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition'
    //           style={{
    //             filter: isBlocked ? "blur(5px)" : "none",
    //             pointerEvents: isBlocked ? "none" : "auto",
    //             opacity: isBlocked ? 0.5 : 1,
    //             transition: "all 0.3s ease",
    //           }}
    //         >
    //           <Link href={item.youtubeUrl} target='_blank'>
    //             <div className='relative w-full aspect-[9/16]'>
    //               <Image
    //                 src={item.thumbnail}
    //                 alt={item.title}
    //                 fill
    //                 className='object-cover'
    //               />
    //             </div>
    //             <div className='p-2 bg-white'>
    //               <p className='text-xs text-gray-500'>{item.category}</p>
    //               <p className='text-sm font-medium'>{item.title}</p>
    //             </div>
    //           </Link>
    //         </div>
    //       );
    //     })}
    //   </div>

    //   {showPrompt && <SignupPrompt />}
    // </section>
  );
}
