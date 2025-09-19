"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTranslations } from "next-intl";

type Props = {
  userId: string;
  /** 화면에 먼저 보여줄 임시 이름(없으면 i18n anonymous 사용) */
  fallbackName?: string;
  /** 아바타 크기(px) */
  size?: number;
  /** 이름 숨김 여부 (아바타만 표시) */
  hideName?: boolean;
  className?: string;
};

export default function UserChip({
  userId,
  fallbackName,
  size = 24,
  hideName = false,
  className = "",
}: Props) {
  const t = useTranslations("community-section");
  const [name, setName] = useState<string>(fallbackName ?? t("anonymous"));
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (!alive) return;
        if (snap.exists()) {
          const data = snap.data() as {
            nickname?: string;
            profileImage?: string;
            photoURL?: string;
          };
          if (data.nickname) setName(data.nickname);
          const img = data.profileImage ?? data.photoURL;
          if (img) setUrl(img);
        }
      } catch {
        // 무시: 폴백 UI 사용
      }
    };
    void run();
    return () => {
      alive = false;
    };
  }, [userId]);

  const initial = (name && name.trim().charAt(0).toUpperCase()) || "?";

  return (
    <span className={`inline-flex items-center gap-2 min-w-0 ${className}`}>
      {url ? (
        <span
          className='relative rounded-full overflow-hidden bg-gray-200 shrink-0'
          style={{ width: size, height: size }}
        >
          <Image
            src={url}
            alt={t("avatarAlt", { name })}
            fill
            className='object-cover'
            sizes={`${size}px`}
          />
        </span>
      ) : (
        <span
          className='grid place-items-center rounded-full bg-gray-200 text-[10px] sm:text-xs text-muted-foreground shrink-0'
          style={{ width: size, height: size }}
          aria-label={t("avatarAlt", { name })}
        >
          {initial}
        </span>
      )}

      {!hideName && <span className='truncate'>{name}</span>}
    </span>
  );
}
