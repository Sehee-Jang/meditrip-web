"use client";

import { Heart } from "lucide-react";
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
  className?: string;
  onToggle?: (next: boolean) => void;
}

export default function FavoriteButton({
  hospitalId,
  position = "inline",
  className = "",
  onToggle,
}: FavoriteButtonProps) {
  const isActive = useFavoritesStore((s) => s.isFavorited(hospitalId));
  const toggleAndSync = useFavoritesStore((s) => s.toggleAndSync);
  const t = useTranslations("my-favorite");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const wrapperClass =
    position === "absolute"
      ? `absolute top-2 right-2 z-10 ${className}`
      : `inline-flex ${className}`;

  const handleToggle = async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("로그인 후 이용해 주세요.");
      return;
    }
    try {
      setLoading(true);
      // toggleAndSync가 true(추가) / false(해제) 반환
      const added = await toggleAndSync(user.uid, hospitalId);
      onToggle?.(added);

      // 추가 시에만 성공 토스트 (기존 UX 유지)
      if (added) {
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
    } catch {
      toast.error("잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={wrapperClass}>
      <Dialog open={open} onOpenChange={setOpen}>
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isActive) {
              // 해제는 확인 모달
              setOpen(true);
            } else {
              // 추가는 즉시
              void handleToggle();
            }
          }}
          className='p-1'
          aria-label={isActive ? t("aria.unfavorite") : t("aria.favorite")}
          aria-pressed={isActive}
          disabled={loading}
        >
          <Heart
            className={`w-5 h-5 cursor-pointer transition stroke-2 ${
              isActive
                ? "fill-red-500 text-red-500"
                : "text-gray-400 hover:text-red-500"
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
