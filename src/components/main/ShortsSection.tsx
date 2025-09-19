"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Container from "../common/Container";
import VideoCard from "../shorts/VideoCard";
import { ChevronRight } from "lucide-react";
import type { Video } from "@/types/video";
import { listVideos } from "@/services/shorts/videos.client";

export default function ShortsSection() {
  const t = useTranslations("shorts-section");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  // 한 줄에 보여줄 개수 (모바일: 4=2x2, 데스크탑: 컨테이너 너비 기반)
  const [visibleCount, setVisibleCount] = useState(6);

  const [items, setItems] = useState<Video[]>([]);

  const viewedIds = useRef<Set<string>>(new Set());
  const viewedRatio = viewCount / Math.max(items.length, 1);

  // 데스크탑 한 줄 측정을 위한 컨테이너 참조
  const rowRef = useRef<HTMLDivElement | null>(null);

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

  // 데이터 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fsItems = await listVideos({ limit: 50 });
      if (!cancelled) setItems(fsItems);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 뷰포트/컨테이너 기반으로 보여줄 카드 개수 계산
  useEffect(() => {
    if (typeof window === "undefined") return;

    const compute = () => {
      const w = window.innerWidth;
      const mobile = w < 768; // md 미만

      if (mobile) {
        setVisibleCount(4); // 2 x 2
        return;
      }

      // md 이상: 컨테이너 실제 너비로 한 줄 개수 계산
      const wrap = rowRef.current;
      const wrapWidth = wrap?.clientWidth ?? w;

      // 브레이크포인트별 카드 폭(비디오 카드 자체는 w-full, 그리드 트랙 폭으로 제어)
      const cardWidth = w >= 1280 ? 220 : w >= 1024 ? 200 : 180; // xl / lg / md
      const gap = 16; // gap-4

      // 한 줄에 딱 맞는 개수 계산 (여유 보정 위해 +gap)
      const maxItems = Math.max(
        Math.floor((wrapWidth + gap) / (cardWidth + gap)),
        1
      );
      setVisibleCount(maxItems);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // 노출된 카드 추적 (이 섹션 내부만 관찰)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rowRef.current ?? document;

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
      { threshold: 0.3 }
    );

    const itemsEls = root.querySelectorAll(".shorts-item");
    itemsEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const shortsToShow = items.slice(0, visibleCount);

  return (
    <section className='py-10 '>
      <Container>
        {/* 제목 및 더보기 버튼 */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-bold mb-4'>{t("title")}</h2>

          {/* 더 보기 버튼 (데스크탑만) */}
          <Link
            href='/shorts/'
            className='hidden md:inline-flex items-center gap-1 bg-white text-black border text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 hover:border-gray-300 transition'
          >
            {t("seeMore")}
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* 모바일: 2열 그리드로 2x2 */}
        <ul className='md:hidden grid grid-cols-2 gap-3'>
          {items.slice(0, 4).map((item) => {
            const _id = item.id;
            const isBlocked = showPrompt && !viewedIds.current.has(_id);
            return (
              <li key={_id}>
                <VideoCard
                  id={_id}
                  title={item.title}
                  thumbnailUrl={item.thumbnailUrl}
                  youtubeUrl={item.youtubeUrl}
                  viewCount={Math.floor(Math.random() * 10000 + 500)}
                  category={item.category}
                  isBlocked={isBlocked}
                />
              </li>
            );
          })}
        </ul>

        {/* 데스크탑: 한 줄, 가로폭만큼만 표시 */}
        <div
          ref={rowRef}
          className='
            hidden md:block
          '
        >
          <ul
            className='
              grid grid-flow-col auto-cols-[var(--card)]
              gap-4
              [--card:180px] lg:[--card:200px] xl:[--card:220px]
            '
          >
            {shortsToShow.map((item) => {
              const _id = item.id;
              const isBlocked = showPrompt && !viewedIds.current.has(_id);
              return (
                <li key={_id} className='h-full'>
                  <VideoCard
                    id={_id}
                    title={item.title}
                    thumbnailUrl={item.thumbnailUrl}
                    youtubeUrl={item.youtubeUrl}
                    viewCount={Math.floor(Math.random() * 10000 + 500)}
                    category={item.category}
                    isBlocked={isBlocked}
                  />
                </li>
              );
            })}
          </ul>
        </div>

        {/* 더 보기 버튼 (모바일만) */}
        <div className='mt-8 flex justify-center md:hidden'>
          <Link
            href='/shorts'
            className='inline-flex items-center gap-1 bg-white text-black border text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 hover:border-gray-300 transition'
          >
            {t("seeMore")}
          </Link>
        </div>

        {/* {showPrompt && <SignupPrompt />} */}
      </Container>
    </section>
  );
}
