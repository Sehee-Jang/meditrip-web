"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingSpinner from "@/components/common/LoadingSpinner";
export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { locale } = useParams() as { locale: string };
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: FirebaseUser | null) => {
        if (!user) {
          // 로그인되지 않음 → 로그인 페이지로
          router.replace(`/${locale}/login`);
          return;
        }
        // Firestore에서 사용자 문서 읽어서 role 필드 확인
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const data = userSnap.data();

        if (!data || data.role !== "admin") {
          // 관리자가 아님 → 홈으로
          router.replace(`/${locale}`);
          return;
        }
        // 관리자 확인 완료
        setAuthorized(true);
      }
    );

    return () => unsubscribe();
  }, [locale, router]);

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
