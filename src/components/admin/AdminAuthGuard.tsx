"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // 로그인 페이지는 가드 우회 (조기 return 금지, 훅 호출 이후에 분기)
  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    // 로그인 페이지는 검증 스킵
    if (isLoginRoute) {
      setAuthorized(true);
      return;
    }

    let cancelled = false;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: FirebaseUser | null) => {
        const nextParam = `?next=${encodeURIComponent(pathname ?? "/admin")}`;

        if (!user) {
          if (!cancelled) setAuthorized(false);
          router.replace(`/admin/login${nextParam}`);
          return;
        }

        try {
          const role: UserRole | null = await getUserRole(user.uid);
          const isAdmin = role === "admin" || role === "super_admin";

          if (!cancelled) {
            if (isAdmin) {
              setAuthorized(true);
            } else {
              setAuthorized(false);
              router.replace(`/admin/login${nextParam}`);
            }
          }
        } catch {
          if (!cancelled) setAuthorized(false);
          router.replace(`/admin/login${nextParam}`);
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [isLoginRoute, pathname, router]);

  // 렌더 분기(훅 호출 이후)
  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (authorized !== true) {
    return (
      <div className='flex items-center justify-center h-full'>
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
