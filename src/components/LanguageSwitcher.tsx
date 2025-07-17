"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState, useTransition } from "react";
import { GlobeIcon } from "lucide-react";

export default function LanguageSwitcher({
  mobileOnly = false,
}: {
  mobileOnly?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const changeLanguage = (newLocale: string) => {
    // locale이 같으면 skip
    if (newLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
      setOpen(false);
    });
  };

  // 데스크탑: 항상 보이게
  if (!mobileOnly) {
    return (
      <select
        className='border px-2 py-1 text-sm'
        value={locale}
        onChange={(e) => changeLanguage(e.target.value)}
        disabled={isPending}
      >
        <option value='ko'>한국어</option>
        <option value='ja'>日本語</option>
      </select>
    );
  }

  // 모바일: 🌐 아이콘 클릭 시 토글
  return (
    <div className='relative'>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className='p-1'
        aria-label='Change language'
      >
        <GlobeIcon size={20} />
      </button>

      {open && (
        <select
          className='absolute right-0 top-8 border px-2 py-1 text-sm bg-white shadow-md z-10'
          value={locale}
          onChange={(e) => changeLanguage(e.target.value)}
          disabled={isPending}
        >
          <option value='ko'>한국어</option>
          <option value='ja'>日本語</option>
        </select>
      )}
    </div>
  );
}
