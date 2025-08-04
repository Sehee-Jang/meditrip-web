"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import CommonButton from "../common/CommonButton";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

export default function AskQuestionButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const t = useTranslations("community-page");
  const router = useRouter();
  const pathname = usePathname(); // 현재 경로
  const locale = useLocale();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 익명 또는 로그아웃 상태 제외
      setIsLoggedIn(!!user && !user.isAnonymous);
    });
    return () => unsubscribe();
  }, []);
  const handleClick = () => {
    if (isLoggedIn) {
      router.push(`/${locale}/community/questions`);
    } else {
      // 현재 경로를 redirect 쿼리로 포함하여 locale도 반영
      const encoded = encodeURIComponent(`/${locale}/community/questions`);
      router.push(`/${locale}/login?redirect=${encoded}`);
    }
  };

  return (
    <div className='my-6 flex flex-col items-center'>
      <CommonButton onClick={handleClick} className='w-1/2 text-sm'>
        {t("cta")}
      </CommonButton>
      <p className='text-sm text-muted-foreground mt-2'>{t("banner")}</p>
    </div>
  );
}
