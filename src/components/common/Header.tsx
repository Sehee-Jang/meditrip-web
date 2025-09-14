"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  HospitalIcon,
  UserIcon,
  BookOpenIcon,
  LogInIcon,
  BriefcaseBusiness,
} from "lucide-react";
import { observeAuth } from "@/lib/auth";
import LanguageSwitcher from "../LanguageSwitcher";

export default function Header() {
  const t = useTranslations("header");
  const [user, setUser] = useState<{ uid: string; email?: string } | null>(
    null
  );

  useEffect(() => {
    // observeAuth가 now: (user: User|null) => void 로 바뀌었다고 가정
    const unsubscribe = observeAuth((u) => {
      if (u) {
        // 실제 로그인된 사용자
        setUser({ uid: u.uid, email: u.email ?? undefined });
      } else {
        // 익명 또는 비로그인 상태
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className='flex justify-between items-center px-4 py-3 border-b bg-white'>
      <Link href='/' className='text-xl font-bold text-black'>
        ONYU
      </Link>

      {/* 데스크탑 메뉴 */}
      <nav className='hidden md:flex items-center gap-6 text-sm text-gray-800'>
        <Link href='/'>{t("main")}</Link>
        <Link href='/articles'>{t("contents")}</Link>
        {/* <Link href='/community'>{t("community")}</Link> */}
        <Link href='/hospital'>{t("hospital")}</Link>
        <Link href='/tour'>{t("tour")}</Link>
        {user ? (
          <>
            <Link href='/mypage'>{t("mypage")}</Link>
          </>
        ) : (
          <Link href='/login' className='px-2 py-1 rounded hover:bg-gray-100'>
            {t("login")}
          </Link>
        )}
        <Link href='/community'>{t("business")}</Link>
        <LanguageSwitcher /> {/* 드롭다운만 표시 */}
      </nav>

      {/* 모바일 아이콘 메뉴 */}
      <nav className='flex md:hidden items-center gap-4 text-gray-700'>
        {/* 콘텐츠 */}
        <Link href='/articles' aria-label='contents'>
          <BookOpenIcon size={20} />
        </Link>

        {/* 커뮤니티 */}
        {/* <Link href='/community' aria-label={t("community")}>
          <MessageCircleIcon size={20} />
        </Link> */}

        {/* 병원 */}
        <Link href='/hospital' aria-label='hospital'>
          <HospitalIcon size={20} />
        </Link>

        {/* 마이페이지 & 로그인 */}
        {user ? (
          <>
            {/* 프로필/마이페이지 아이콘 */}
            <Link href='/mypage' aria-label={t("mypage")}>
              <UserIcon size={20} />
            </Link>
          </>
        ) : (
          <Link href='/login' aria-label={t("login")}>
            <LogInIcon size={20} />
          </Link>
        )}

        {/* 비지니스 문의 */}
        <Link href='/community' aria-label='business'>
          <BriefcaseBusiness size={20} />
        </Link>

        <LanguageSwitcher mobileOnly />
      </nav>
    </header>
  );
}
