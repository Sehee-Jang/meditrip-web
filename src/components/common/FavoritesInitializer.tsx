"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserFavoriteHospitalIds } from "@/services/hospitals/favorites";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

export default function FavoritesInitializer() {
  const setFavorites = useFavoritesStore((s) => s.setFavorites);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ids = await getUserFavoriteHospitalIds(user.uid);
        setFavorites(ids);
      }
    });
    return () => unsubscribe();
  }, [setFavorites]);

  return null;
}
