"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { GlobeIcon } from "lucide-react";

type Props = { mobileOnly?: boolean };

export default function LanguageSwitcher({ mobileOnly = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (newLocale: "ko" | "ja") => {
    if (newLocale === locale) return setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      setOpen(false);
    });
  };

  // 모바일: 커스텀 메뉴(옵션 위치/크기 완전 제어)
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDocClick);
    return () => document.removeEventListener("pointerdown", onDocClick);
  }, [open]);

  // 데스크탑: 네이티브 셀렉트 유지(폰트만 16px 이상)
  if (!mobileOnly) {
    return (
      <select
        className='border px-2 py-1 text-[16px]'
        value={locale}
        onChange={(e) => changeLanguage(e.target.value as "ko" | "ja")}
        disabled={isPending}
      >
        <option value='ko'>한국어</option>
        <option value='ja'>日本語</option>
      </select>
    );
  }

  return (
    <div className='relative' ref={popRef}>
      <button
        onClick={() => setOpen((p) => !p)}
        className='p-1'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-label='Change language'
      >
        <GlobeIcon size={20} />
      </button>

      {open && (
        <div
          role='menu'
          className='absolute right-0 top-10 z-50 w-44 rounded-md border bg-white shadow-lg'
        >
          <button
            role='menuitem'
            className='block w-full px-4 py-3 text-left text-[16px]'
            onClick={() => changeLanguage("ko")}
            disabled={isPending}
          >
            한국어
          </button>
          <button
            role='menuitem'
            className='block w-full px-4 py-3 text-left text-[16px]'
            onClick={() => changeLanguage("ja")}
            disabled={isPending}
          >
            日本語
          </button>
        </div>
      )}
    </div>
  );
}
