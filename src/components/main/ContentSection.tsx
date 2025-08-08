"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { useTranslations } from "next-intl";
// import SignupPrompt from "./SignupPrompt";
import Link from "next/link";
import Container from "../common/Container";
import VideoCard from "../contents/VideoCard";
import { ChevronRight } from "lucide-react";
import type { Video } from "@/types/video";
import { fetchVideos } from "@/services/contents/videos.client";

export default function ContentSection() {
  const t = useTranslations("content-section");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(6);
  const [isMobile, setIsMobile] = useState(false);
  const [items, setItems] = useState<Video[]>([]);

  const viewedIds = useRef<Set<string>>(new Set());
  const viewedRatio = viewCount / Math.max(items.length, 1);

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

  // 첫 로드 시 Firestore에서 최신순으로 넉넉히 가져오기
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { items: fsItems } = await fetchVideos({ limit: 50 });
      if (!cancelled) setItems(fsItems);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

        // 카드들이 한 줄에 들어갈 수 있도록 조절
        setVisibleCount(Math.max(maxItems, 1));
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
          const id = entry.target.getAttribute("data-id");
          if (!id) return;
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

  const shortsToShow = items.slice(0, visibleCount);

  return (
    <section className='py-10 bg-white'>
      <Container>
        {/* 제목 및 더보기 버튼 */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold mb-4'>{t("title")}</h2>

          {/* 더 보기 버튼 (데스크탑) */}
          {!isMobile && (
            <Link
              href='/contents/'
              className='hidden md:flex items-center gap-1 bg-white text-black border text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 hover:border-gray-300 transition'
            >
              {t("seeMore")}
              <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* 콘텐츠 카드들 */}
        <div
          className={`flex ${
            isMobile
              ? "flex-wrap gap-x-4 gap-y-8 justify-between"
              : "flex-nowrap gap-x-4 justify-start"
          }`}
        >
          {/* 카드 렌더링 */}
          {shortsToShow.map((item) => {
            const _id = item.id;
            const isBlocked = showPrompt && !viewedIds.current.has(_id);
            return (
              <VideoCard
                key={_id}
                id={_id}
                title={item.title}
                thumbnailUrl={item.thumbnailUrl}
                youtubeUrl={item.youtubeUrl}
                viewCount={Math.floor(Math.random() * 10000 + 500)}
                category={item.category}
                isBlocked={isBlocked}
              />
            );
          })}
        </div>

        {/* 더 보기 버튼 (모바일) */}
        {isMobile && (
          <div className='mt-8 flex justify-center'>
            <Link
              href='/contents'
              className='hidden md:flex items-center gap-1 bg-white text-black border text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 hover:border-gray-300 transition'
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
