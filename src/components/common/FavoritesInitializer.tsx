"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

export default function FavoritesInitializer() {
  const init = useFavoritesStore((s) => s.init);
  const reset = useFavoritesStore((s) => s.reset);

  useEffect(() => {
    let unsubFav: ReturnType<typeof init> | undefined;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsubFav = init(user.uid);
      } else {
        reset();
        if (unsubFav) {
          unsubFav();
          unsubFav = undefined;
        }
      }
    });

    return () => {
      unsubAuth();
      if (unsubFav) unsubFav();
    };
  }, [init, reset]);

  return null;
}
