"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { subscribeFavoriteHospitalIds } from "@/services/clinics/favorites";
import type { Unsubscribe } from "firebase/firestore";

export default function FavoritesInitializer() {
  const setIds = useFavoritesStore((s) => s.setIds);
  const reset = useFavoritesStore((s) => s.reset);

  useEffect(() => {
    let unsubFav: Unsubscribe | null = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      // 이전 구독 클린업
      if (unsubFav) {
        unsubFav();
        unsubFav = null;
      }

      if (u?.uid) {
        // 로그인된 뒤에만 구독 시작
        unsubFav = subscribeFavoriteHospitalIds(u.uid, setIds);
      } else {
        reset();
      }
    });

    return () => {
      unsubAuth();
      if (unsubFav) unsubFav();
    };
  }, [setIds, reset]);

  return null;
}
