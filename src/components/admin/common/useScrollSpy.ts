"use client";

import { RefObject, useEffect, useState } from "react";

/**
 * 컨테이너(root) 기준 스크롤 스파이
 */
export default function useScrollSpy(
  ids: readonly string[],
  rootRef: RefObject<HTMLElement | null>,
  topOffsetPx: number
): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(ids[0]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elements: HTMLElement[] = [];
    ids.forEach((id) => {
      const el = root.querySelector<HTMLElement>(`[data-section="${id}"]`);
      if (el) elements.push(el);
    });
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => {
            const el = e.target as HTMLElement;
            const top =
              el.getBoundingClientRect().top - root.getBoundingClientRect().top;
            return { id: el.dataset.section ?? el.id, top };
          })
          .filter((v) => !!v.id)
          .sort((a, b) => a.top - b.top);

        if (visible[0]?.id) setActiveId(visible[0].id);
      },
      {
        root,
        // 상단: 고정 헤더만큼 제외 / 하단: -5%로 완화(마지막 섹션도 교차되도록)
        rootMargin: `-${topOffsetPx}px 0px -5% 0px`,
        threshold: [0.01, 0.2, 0.4, 0.6, 0.8, 1],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, rootRef, topOffsetPx]);

  return activeId;
}
