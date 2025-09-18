import { create } from "zustand";
import type { Unsubscribe } from "firebase/firestore";
import {
  subscribeFavoriteHospitalIds,
  toggleFavoriteHospital as svcToggle,
} from "@/services/clinics/favorites";

type FavoritesState = {
  ids: Set<string>;
  init: (uid: string) => Unsubscribe | undefined;
  setFavorites: (ids: string[]) => void;
  setIds: (ids: string[]) => void;
  isFavorited: (clinicId: string) => boolean;
  toggleFavoriteLocal: (clinicId: string) => void;
  toggleAndSync: (uid: string, clinicId: string) => Promise<boolean>;
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
  isFavorited: (clinicId: string) => get().ids.has(clinicId),

  toggleFavoriteLocal: (clinicId: string) => {
    const next = new Set(get().ids);
    if (next.has(clinicId)) next.delete(clinicId);
    else next.add(clinicId);
    set({ ids: next });
  },

  toggleAndSync: async (uid: string, clinicId: string) => {
    const added = await svcToggle(uid, clinicId);
    const next = new Set(get().ids);
    if (added) next.add(clinicId);
    else next.delete(clinicId);
    set({ ids: next });
    return added;
  },

  reset: () => set({ ids: new Set<string>() }),
}));
