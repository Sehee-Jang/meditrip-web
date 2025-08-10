"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type Props = {
  userId: string;
  /** i18n에서 받아온 익명 대체 텍스트(반드시 전달) */
  fallbackName: string;
  className?: string;
};

export default function UserNameById({
  userId,
  fallbackName,
  className = "",
}: Props) {
  const [name, setName] = useState<string>(fallbackName);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const snap = await getDoc(doc(db, "users", userId));
        if (!alive) return;
        if (snap.exists()) {
          const data = snap.data() as { nickname?: string };
          if (data.nickname) setName(data.nickname);
        }
      } catch {
        // 에러 시 fallbackName 유지
      }
    };
    void run();
    return () => {
      alive = false;
    };
  }, [userId, fallbackName]);

  return <span className={`truncate ${className}`}>{name}</span>;
}
