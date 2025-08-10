"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { resizeToWebp } from "@/utils/resizeToWebp";
import { uploadAvatarWebp } from "@/services/users/uploadAvatar";

type Props = {
  photoURL?: string;
  onUploaded?: (url: string) => void;
};

export default function AvatarUploader({ photoURL, onUploaded }: Props) {
  const t = useTranslations("mypage");
  const [uploading, setUploading] = useState(false);

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("avatar.toasts.invalidType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("avatar.toasts.tooLarge"));
      return;
    }
    try {
      setUploading(true);
      const webp = await resizeToWebp(file, 512, 0.9);
      const url = await uploadAvatarWebp(webp);
      onUploaded?.(url);
      toast.success(t("avatar.toasts.success"));
    } catch (e) {
      console.error(e);
      toast.error(t("avatar.toasts.error"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className='relative'>
      <div className='relative w-14 h-14 rounded-full overflow-hidden bg-gray-200'>
        {photoURL ? (
          <Image
            src={photoURL}
            alt={t("avatar.alt")}
            fill
            className='object-cover'
            sizes='56px'
          />
        ) : null}
      </div>

      {/* 오버레이 버튼(작게) */}
      <label
        className='
          absolute -bottom-1 -right-1 grid place-items-center
          w-7 h-7 rounded-full
          bg-white/90 backdrop-blur shadow ring-1 ring-black/5
          cursor-pointer
        '
        title={t("avatar.change")}
        aria-label={t("avatar.change")}
      >
        <Camera className='w-4 h-4' />
        <input
          type='file'
          accept='image/*'
          className='sr-only'
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.currentTarget.value = ""; // 같은 파일 재선택 가능
          }}
        />
      </label>
    </div>
  );
}
