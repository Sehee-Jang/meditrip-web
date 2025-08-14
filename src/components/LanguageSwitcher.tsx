"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { GlobeIcon } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import type { AppLocale } from "@/types/user";

type Props = { mobileOnly?: boolean };

export default function LanguageSwitcher({ mobileOnly = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  const syncLocale = async (next: AppLocale) => {
    // 1) URL locale 변경 (UI 즉시 반응)
    startTransition(() => {
      router.replace(pathname, { locale: next });
      setOpen(false);
    });

    // 2) 쿠키 동기화 (next-intl의 "마지막 언어 기억" 시나리오 대비)
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;

    // 3) 로그인 유저면 Firestore에도 저장 (소스들 간 일관성 유지)
    const uid = auth.currentUser?.uid;
    if (uid) {
      updateDoc(doc(db, "users", uid), {
        preferredLocale: next,
        updatedAt: serverTimestamp(),
      }).catch((e) => {
        // 실패해도 UI는 이미 바뀌었으므로 경고만 남김
        console.warn(
          "[locale-sync] failed to update users/{uid}.preferredLocale:",
          e
        );
      });
    }
  };

  const changeLanguage = (next: AppLocale) => {
    if (next === locale) {
      setOpen(false);
      return;
    }
    void syncLocale(next);
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

  // 모바일: 팝오버 메뉴
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
