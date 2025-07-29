"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";
import {
  HospitalIcon,
  UserIcon,
  BookOpenIcon,
  MessageCircleIcon,
} from "lucide-react";

export default function Header() {
  const t = useTranslations("header");

  return (
    <header className='flex justify-between items-center px-4 py-3 border-b bg-white'>
      <Link href='/' className='text-xl font-bold text-black'>
        ONYU
      </Link>

      {/* 데스크탑 메뉴 */}
      <nav className='hidden md:flex items-center gap-6 text-sm text-gray-800'>
        <Link href='/'>{t("main")}</Link>
        <Link href='/contents'>{t("content")}</Link>
        <Link href='/community'>{t("community")}</Link>
        <Link href='/hospital'>{t("hospital")}</Link>
        <Link href='/mypage'>{t("mypage")}</Link>
        <LanguageSwitcher /> {/* 🌐 드롭다운만 표시 */}
      </nav>

      {/* 모바일 아이콘 메뉴 */}
      <nav className='flex md:hidden items-center gap-4 text-gray-700'>
        <Link href='/contents' aria-label={t("content")}>
          <BookOpenIcon size={20} />
        </Link>
        <Link href='/community' aria-label={t("community")}>
          <MessageCircleIcon size={20} />
        </Link>
        <Link href='/hospital' aria-label='hospital'>
          <HospitalIcon size={20} />
        </Link>
        <Link href='/mypage' aria-label='mypage'>
          <UserIcon size={20} />
        </Link>
        <LanguageSwitcher mobileOnly />
      </nav>
    </header>
  );
}
