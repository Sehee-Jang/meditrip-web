"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface Props {
  children: React.ReactNode;
}

export default function SignupTrigger({ children }: Props) {
  const [isAnon, setIsAnon] = useState<boolean>(true);
  const [triggered, setTriggered] = useState<boolean>(false);
  const [clickCount, setClickCount] = useState<number>(0);

  // 1) Auth 상태 감지: 익명/로그아웃이면 isAnon=true, 그 외 false
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      const anon = !user || user.isAnonymous === true;
      setIsAnon(anon);

      // 로그인(일반/구글/회원가입 완료) 전환 시 즉시 블러 해제
      if (!anon) {
        setTriggered(false);
        setClickCount(0);
      }
    });
    return unsub;
  }, []);

  const shouldBlur = isAnon && triggered;

  // 2) 익명/비로그인 상태에서만 클릭/스크롤 트리거 동작
  useEffect(() => {
    if (!isAnon || triggered) return;

    const videoItems = document.querySelectorAll<HTMLElement>(".shorts-item");
    const total = videoItems.length;
    const isMobile = window.innerWidth < 768;
    const clickThreshold = Math.max(1, Math.ceil(total / (isMobile ? 2 : 3)));

    const onClick = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest(".shorts-item");
      if (card) setClickCount((c) => c + 1);
    };

    const triggerSignup = () => {
      setTriggered(true);
      document
        .getElementById("signup-section")
        ?.scrollIntoView({ behavior: "smooth" });
    };

    const onScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && scrolled / maxScroll >= 0.5) triggerSignup();
    };

    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll);

    if (clickCount >= clickThreshold) triggerSignup();

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isAnon, triggered, clickCount]);

  return (
    <div className='relative'>
      <div
        className={`transition-[filter] duration-300 ${
          shouldBlur ? "blur-md" : ""
        }`}
      >
        {children}
      </div>
      {shouldBlur && (
        <div className='absolute inset-0 z-10 pointer-events-auto' />
      )}
    </div>
  );
}
