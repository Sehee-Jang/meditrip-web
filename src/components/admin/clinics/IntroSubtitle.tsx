"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

type IntroSubtitleProps = {
  /** 표시할 원문 텍스트 */
  text: string;
  /** 텍스트 길이 기준으로 버튼 노출 여부를 휴리스틱하게 제어(기본 50자) */
  minLengthToShowToggle?: number;
};

export default function IntroSubtitle({
  text,
  minLengthToShowToggle = 50,
}: IntroSubtitleProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  // 아주 긴 경우에만 토글 버튼 노출(간단한 휴리스틱)
  const shouldShowToggle = useMemo(
    () => text.trim().length > minLengthToShowToggle,
    [text, minLengthToShowToggle]
  );

  // 레이아웃: 텍스트(좌) + 토글 버튼(우) 한 줄 정렬
  return (
    <div className='mt-1 flex items-start justify-between gap-3'>
      <p
        className={[
          "text-sm md:text-base text-muted-foreground leading-relaxed",
          expanded ? "" : "line-clamp-1", // 접힘 상태에서 1줄+… 처리
        ].join(" ")}
      >
        {text}
      </p>

      {shouldShowToggle && (
        <button
          type='button'
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "설명 접기" : "설명 펼치기"}
          className='mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center
                     rounded-full border border-border bg-card hover:bg-accent
                     focus:outline-none focus-visible:ring-2'
        >
          <ChevronDown
            size={16}
            className={[
              "transition-transform duration-200",
              expanded ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      )}
    </div>
  );
}
