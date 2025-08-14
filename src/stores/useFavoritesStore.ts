import { create } from "zustand";
import type { Unsubscribe } from "firebase/firestore";
import {
  subscribeFavoriteHospitalIds,
  toggleFavoriteHospital as svcToggle,
} from "@/services/hospitals/favorites";

type FavoritesState = {
  ids: Set<string>;
  init: (uid: string) => Unsubscribe | undefined;
  setFavorites: (ids: string[]) => void;
  setIds: (ids: string[]) => void;
  isFavorited: (hospitalId: string) => boolean;
  toggleFavoriteLocal: (hospitalId: string) => void;
  toggleAndSync: (uid: string, hospitalId: string) => Promise<boolean>;
  reset: () => void;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: new Set<string>(),

  init: (uid: string) => {
    if (!uid) return;
    return subscribeFavoriteHospitalIds(uid, (list) => {
      set({ ids: new Set(list) });
    });
  },

  setFavorites: (ids: string[]) => set({ ids: new Set(ids) }),
  setIds: (ids: string[]) => set({ ids: new Set(ids) }),
  isFavorited: (hospitalId: string) => get().ids.has(hospitalId),

  toggleFavoriteLocal: (hospitalId: string) => {
    const next = new Set(get().ids);
    if (next.has(hospitalId)) next.delete(hospitalId);
    else next.add(hospitalId);
    set({ ids: next });
  },

  toggleAndSync: async (uid: string, hospitalId: string) => {
    const added = await svcToggle(uid, hospitalId);
    const next = new Set(get().ids);
    if (added) next.add(hospitalId);
    else next.delete(hospitalId);
    set({ ids: next });
    return added;
  },

  reset: () => set({ ids: new Set<string>() }),
}));
