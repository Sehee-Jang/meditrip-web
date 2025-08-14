"use client";

import { useEffect } from "react";
import { observeAuth } from "@/lib/auth";
import FavoritesInitializer from "@/components/common/FavoritesInitializer";

export default function AuthObserver() {
  useEffect(() => {
    observeAuth((user) => {
      if (!user) {
        console.log("🔓 비로그인 상태입니다.");
        return;
      }
      if (user.isAnonymous) {
        console.log("✅ 익명 로그인 상태입니다:", user.uid);
      } else {
        console.log("🔐 일반 로그인 상태입니다:", user.email || user.uid);
      }
    });
  }, []);

  return (
    <>
      <FavoritesInitializer />
    </>
  );
}
