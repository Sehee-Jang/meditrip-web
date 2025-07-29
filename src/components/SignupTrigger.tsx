"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface Props {
  children: React.ReactNode;
}

export default function SignupTrigger({ children }: Props) {
  const [isAnon, setIsAnon] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  // 1) 익명 로그인 여부 감지
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAnon(!!user?.isAnonymous);
    });
    return unsub;
  }, []);

  // 2) 클릭 & 스크롤 이벤트 설정
  useEffect(() => {
    if (!isAnon || triggered) return;

    // 비디오 카드 개수 파악
    const videoItems = document.querySelectorAll<HTMLElement>(".shorts-item");
    const total = videoItems.length;
    const isMobile = window.innerWidth < 768;
    // 모바일은 ½, 데스크탑은 ⅓ 클릭 시 트리거
    const clickThreshold = Math.ceil(total / (isMobile ? 2 : 3));

    // 클릭 핸들러
    const onClick = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest(".shorts-item");
      if (card) setClickCount((c) => c + 1);
    };

    // 스크롤 핸들러 (½ 지점)
    const onScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrolled / maxScroll >= 0.5) triggerSignup();
    };

    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll);

    // 클릭 횟수 감시
    if (clickCount >= clickThreshold) {
      triggerSignup();
    }

    function triggerSignup() {
      setTriggered(true);

      // 3) 회원가입 섹션으로 부드럽게 스크롤
      document
        .getElementById("signup-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isAnon, clickCount, triggered]);

  return (
    <div className='relative'>
      {/* blur 및 transition 적용 */}
      <div
        className={`transition-filter duration-300 ${
          triggered ? "filter blur-md" : ""
        }`}
      >
        {children}
      </div>

      {/* blur 상태일 때만 이 overlay가 children 위에 떠서 클릭을 막음 */}
      {triggered && (
        <div className='absolute inset-0 z-10 pointer-events-auto' />
      )}
    </div>
  );
}
