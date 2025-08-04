"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        router.replace(redirectTo); // 로그인되었으면 리디렉션
      }
    });

    return () => unsubscribe();
  }, [redirectTo, router]);

  return null; // UI 없음
}
