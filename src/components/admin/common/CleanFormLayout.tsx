"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import useScrollSpy from "./useScrollSpy";

interface SectionItem {
  id: string;
  label: string;
}

interface CleanFormLayoutProps {
  sections: readonly SectionItem[];
  children: React.ReactNode;
  /** 시트 상단 고정 영역(헤더 등) 높이 보정값 */
  topOffsetPx?: number;
}

/**
 * 사이드바 내비 + 오른쪽 스크롤 컨테이너 레이아웃
 * - 스크롤 루트를 컨테이너로 고정
 * - 클릭 시 오프셋 보정하여 수동 스크롤
 */
export default function CleanFormLayout({
  sections,
  children,
  topOffsetPx = 96,
}: CleanFormLayoutProps) {
  // 내부 컨테이너(백업 루트)
  const fallbackRef = useRef<HTMLDivElement>(null);
  // 실제 스크롤 루트: 우선 data-sheet-scroll-root, 없으면 fallbackRef
  const [rootEl, setRootEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const external = document.querySelector<HTMLElement>(
      "[data-sheet-scroll-root]"
    );
    setRootEl(external ?? fallbackRef.current);
  }, []);

  // 스크롤 스파이(루트 기준)
  const spiedActiveId = useScrollSpy(
    sections.map((s) => s.id),
    { current: rootEl },
    topOffsetPx
  );

  // 클릭 직후 잠깐 강제 활성(관찰자 갱신 전 깜빡임 방지)
  const [manualActive, setManualActive] = useState<string | null>(null);
  const activeId = manualActive ?? spiedActiveId;

  // 오른쪽 컨테이너 내부의 섹션 DOM을 수집
  const sectionMap = useMemo(() => {
    const root = rootEl;
    const map = new Map<string, HTMLElement>();
    if (!root) return map;
    sections.forEach(({ id }) => {
      const el = root.querySelector<HTMLElement>(`[data-section="${id}"]`);
      if (el) map.set(id, el);
    });
    return map;
  }, [sections, children, rootEl]);

  // 사이드바 클릭 → 컨테이너 기준 좌표로 수동 스크롤
  const handleNavClick = (id: string) => {
    const root = rootEl;
    const target = sectionMap.get(id);
    if (!root || !target) return;

    setManualActive(id);
    window.setTimeout(() => setManualActive(null), 400);

    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTopInRoot = targetRect.top - rootRect.top;

    const desiredTop =
      (root as HTMLElement).scrollTop + targetTopInRoot - topOffsetPx;
    const maxTop = Math.max(0, root.scrollHeight - root.clientHeight);
    const clampedTop = Math.min(desiredTop, maxTop);

    (root as HTMLElement).scrollTo({ top: clampedTop, behavior: "smooth" });
  };

  return (
    <div className='grid lg:grid-cols-[220px_1fr] gap-8 min-h-[70vh]'>
      {/* 사이드바 */}
      <aside className='hidden lg:block'>
        <nav className='sticky top-4'>
          <ul className='space-y-1'>
            {sections.map((s) => {
              const active = activeId === s.id;
              return (
                <li key={s.id}>
                  <button
                    type='button'
                    onClick={() => handleNavClick(s.id)}
                    className={[
                      "block w-full text-left rounded-lg px-3 py-2 text-sm transition",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60",
                    ].join(" ")}
                    aria-current={active ? "true" : undefined}
                  >
                    {s.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* 콘텐츠 컨테이너
         - 외부 루트가 있으면: 오버플로우/높이 제한 없음(외부가 스크롤 담당)
         - 외부 루트가 없으면: fallbackRef에 스크롤 루트를 설정 */}
      <div className='relative'>
        <div
          ref={fallbackRef}
          className={
            rootEl && rootEl !== fallbackRef.current
              ? "space-y-10" // 외부 루트 사용: 스크롤/높이 X
              : "space-y-10 overflow-auto pr-2 max-h-[75vh]"
          } // 백업 루트
          style={{
            scrollPaddingTop: `${topOffsetPx}px`, // 포커스/앵커 보정
          }}
        >
          {children}
          {/* 하단 여유: 바닥에서도 마지막 섹션 올려 앉히기 */}
          <div
            aria-hidden
            className='pointer-events-none'
            style={{ height: Math.max(160, topOffsetPx) }}
          />
        </div>
      </div>
    </div>
  );
}
