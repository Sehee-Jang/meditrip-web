"use client";

import { Heart } from "lucide-react";
import { toggleFavoriteHospital } from "@/services/hospitals/favorites";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { auth } from "@/lib/firebase";

interface FavoriteButtonProps {
  hospitalId: string;
  position?: "absolute" | "inline";
  onToggle?: (newStatus: boolean) => void;
}

export default function FavoriteButton({
  hospitalId,
  position = "inline",
  onToggle,
}: FavoriteButtonProps) {
  const { isFavorited, toggleFavorite } = useFavoritesStore();

  const isActive = isFavorited(hospitalId);

  const handleToggle = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    await toggleFavoriteHospital(user.uid, hospitalId); // Firestore 업데이트
    toggleFavorite(hospitalId); // Zustand 업데이트
    onToggle?.(!isActive); // 필요 시 부모에게 전달
  };

  const wrapperClass =
    position === "absolute" ? "absolute top-2 right-2 z-10" : "inline-flex";

  return (
    <div className={wrapperClass}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        className='p-1'
        aria-label='찜하기'
      >
        <Heart
          fill={isActive ? "#ef4444" : "none"}
          className={`w-7 h-7 cursor-pointer transition stroke-2 ${
            isActive ? "text-red-500" : "text-gray-400 hover:text-red-500"
          }`}
        />
      </button>
    </div>
  );
}
