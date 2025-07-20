"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { useTranslations } from "next-intl";
// import SignupPrompt from "./SignupPrompt";
import Link from "next/link";
import { mockShorts } from "@/data/mockData";
import Container from "./layout/Container";
import VideoCard from "./VideoCard";

export default function ContentSection() {
  const t = useTranslations("Theme");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isMobile, setIsMobile] = useState(false);
  const viewedIds = useRef<Set<number>>(new Set());
  const viewedRatio = viewCount / mockShorts.length;

  // 유저 로그인 정보
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setIsAnonymous(user.isAnonymous);
    }
  }, []);

  // 익명 유저에게 블러 처리
  useEffect(() => {
    if (isAnonymous && viewedRatio >= 1 / 3 && !showPrompt) {
      setShowPrompt(true);
    }
  }, [isAnonymous, viewedRatio, showPrompt]);

  // 뷰포트 기준으로 보여줄 카드 개수 계산
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateLayout = () => {
      const w = window.innerWidth;
      const mobile = w < 768;
      setIsMobile(mobile);

      if (mobile) {
        setVisibleCount(4); // 2x2
      } else {
        const containerPadding = 24; // md:px-6
        const cardWidth = 150;
        const gap = 16;
        const totalAvailable = w - containerPadding * 2;
        const maxItems = Math.floor(totalAvailable / (cardWidth + gap));

        // 카드들 + "더보기" 버튼까지 포함해서 한 줄에 들어갈 수 있도록 조절
        setVisibleCount(Math.max(maxItems - 1, 1)); // 최소 1개 보장
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  // 노출된 카드 추적
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

  const shortsToShow = mockShorts.slice(0, visibleCount);

  return (
    <section className='py-10 bg-white'>
      <Container>
        <h2 className='text-xl font-bold mb-4'>{t("title")}</h2>

        <div
          className={`flex items-start ${
            isMobile
              ? "flex-wrap gap-x-4 gap-y-8 justify-around"
              : "flex-nowrap gap-x-4 justify-start"
          }`}
        >
          {shortsToShow.map((item) => {
            const isBlocked = showPrompt && !viewedIds.current.has(item.id);
            return (
              <VideoCard
                key={item.id}
                id={item.id}
                title={item.title}
                thumbnailUrl={item.thumbnail}
                youtubeUrl={item.youtubeUrl}
                viewCount={Math.floor(Math.random() * 10000 + 500)}
                category={item.category}
                isBlocked={isBlocked}
              />
            );
          })}

          {/* 더 보기 버튼 (데스크탑) */}
          {!isMobile && (
            <div className='w-[150px] h-[210px] flex items-center justify-center'>
              <Link
                href='/contents'
                className='px-4 py-2 bg-black text-white text-sm font-medium rounded-md'
              >
                {t("seeMore")}
              </Link>
            </div>
          )}
        </div>

        {/* 더 보기 버튼 (모바일) */}
        {isMobile && (
          <div className='mt-8 flex justify-center'>
            <Link
              href='/contents'
              className='block w-full text-center px-6 py-2 bg-black text-white text-sm font-medium rounded-md'
            >
              {t("seeMore")}
            </Link>
          </div>
        )}

        {/* {showPrompt && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <SignupPrompt />
        </div>
      )} */}
      </Container>
    </section>
  );
}
