"use client";

import { Heart } from "lucide-react";
import { toggleFavoriteHospital } from "@/services/hospitals/favorites";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { auth } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

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
  const t = useTranslations("my-favorite");
  const [open, setOpen] = useState(false);

  const handleToggle = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    await toggleFavoriteHospital(user.uid, hospitalId); // Firestore 업데이트
    toggleFavorite(hospitalId); // Zustand 업데이트
    onToggle?.(!isActive); // 필요 시 부모에게 전달

    if (!isActive) {
      toast.success(
        <>
          <div className='font-medium text-black'>
            {t("toast.favoriteSuccess")}
          </div>
          <div className='text-sm text-gray-600 mt-1'>
            {t("toast.favoriteDescription")}
          </div>
        </>
      );
    }
  };

  const wrapperClass =
    position === "absolute" ? "absolute top-2 right-2 z-10" : "inline-flex";

  return (
    <div className={wrapperClass}>
      <Dialog open={open} onOpenChange={setOpen}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isActive) {
              setOpen(true); // 모달 열기
            } else {
              handleToggle(); // 찜 추가는 즉시
            }
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
        <DialogContent>
          <DialogTitle>{t("dialog.title")}</DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
          <DialogFooter>
            <Button
              variant='outline'
              className='min-w-[80px]'
              onClick={() => setOpen(false)}
            >
              {t("dialog.cancel")}
            </Button>
            <Button
              variant='destructive'
              className='min-w-[80px] font-semibold'
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await handleToggle();
                setOpen(false);
              }}
            >
              {t("dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
