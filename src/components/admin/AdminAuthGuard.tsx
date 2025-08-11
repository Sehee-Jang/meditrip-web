"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { getUserRole, type UserRole } from "@/services/users/getUserRole";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: FirebaseUser | null) => {
        // 비로그인 → 관리자 로그인 페이지로
        if (!user) {
          router.replace(`/admin/login`);
          if (!cancelled) setAuthorized(false);
          return;
        }

        try {
          const role: UserRole | null = await getUserRole(user.uid);

          // 관리자/슈퍼관리자만 통과
          if (role === "admin" || role === "super_admin") {
            if (!cancelled) setAuthorized(true);
          } else {
            router.replace(`/admin/login`);
            if (!cancelled) setAuthorized(false);
          }
        } catch {
          // 조회 실패 시에도 로그인 페이지로
          router.replace(`/admin/login`);
          if (!cancelled) setAuthorized(false);
        }
      }
    );
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router]);

  // 아직 확인 중일 땐 스피너
  if (authorized === null) {
    return (
      <div className='flex items-center justify-center h-full'>
        <LoadingSpinner />
      </div>
    );
  }

  // 허가됐으면 자식 컴포넌트 렌더
  return <>{children}</>;
}
