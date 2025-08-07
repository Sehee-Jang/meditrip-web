import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useAuthCheck() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // 초기 null 상태
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isLoggedIn, loading };
}
