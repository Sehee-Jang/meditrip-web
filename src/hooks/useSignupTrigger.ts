"use client";
import { useEffect, useRef } from "react";

type Options = {
  /** 페이지 스크롤 비율 (0~1). 지정하지 않으면 scroll 관찰. */
  threshold?: number;
  /** 비디오 요소를 직접 받아서 timeupdate 이벤트 관찰 */
  videoRef?: React.RefObject<HTMLVideoElement>;
  /** 트리거 시 호출할 콜백 */
  onTrigger: () => void;
};

export default function useSignupTrigger({
  threshold = 1 / 3,
  videoRef,
  onTrigger,
}: Options) {
  const triggeredRef = useRef(false);

  useEffect(() => {
    // 1) 비디오 감시 로직
    if (videoRef?.current) {
      const vid = videoRef.current;
      const handler = () => {
        if (
          !triggeredRef.current &&
          vid.duration > 0 &&
          vid.currentTime >= vid.duration * threshold
        ) {
          triggeredRef.current = true;
          onTrigger();
        }
      };
      vid.addEventListener("timeupdate", handler);
      return () => void vid.removeEventListener("timeupdate", handler);
    }

    // 2) 페이지 스크롤 감시 로직
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (
        !triggeredRef.current &&
        maxScroll > 0 &&
        scrollTop / maxScroll >= threshold
      ) {
        triggeredRef.current = true;
        onTrigger();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => void window.removeEventListener("scroll", onScroll);
  }, [threshold, videoRef, onTrigger]);
}
