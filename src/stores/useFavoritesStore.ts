import { create } from "zustand";

interface FavoritesStore {
  favoriteIds: string[];
  setFavorites: (ids: string[]) => void;
  toggleFavorite: (id: string) => void;
  isFavorited: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteIds: [],
  setFavorites: (ids) => set({ favoriteIds: ids }),
  toggleFavorite: (id) => {
    const current = get().favoriteIds;
    const updated = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id];
    set({ favoriteIds: updated });
  },
  isFavorited: (id) => get().favoriteIds.includes(id),
}));
