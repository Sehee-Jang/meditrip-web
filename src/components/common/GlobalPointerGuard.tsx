"use client";

import { useEffect } from "react";
import { restoreBodyPointer } from "@/lib/dom/restoreBodyPointer";

/** 전역적으로 body의 pointer-events 누수를 감시/복원 */
export default function GlobalPointerGuard() {
  useEffect(() => {
    // 첫 마운트 시 즉시 복원
    restoreBodyPointer();

    // 라우팅/가시성 변경 시에도 복원
    const handle = () => restoreBodyPointer();
    window.addEventListener("pageshow", handle);
    window.addEventListener("popstate", handle);
    document.addEventListener("visibilitychange", handle);

    // 예외로 남았던 경우를 주기적으로 청소(가벼운 인터벌)
    const tid = window.setInterval(restoreBodyPointer, 1500);

    return () => {
      window.removeEventListener("pageshow", handle);
      window.removeEventListener("popstate", handle);
      document.removeEventListener("visibilitychange", handle);
      window.clearInterval(tid);
    };
  }, []);

  return null;
}
