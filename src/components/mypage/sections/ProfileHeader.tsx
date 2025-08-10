"use client";

import { useTranslations } from "next-intl";
import AvatarUploader from "../settings/AvatarUploader";

export default function ProfileHeader({
  name,
  photoURL,
  onAvatarUpdated,
}: {
  name: string;
  photoURL?: string;
  onAvatarUpdated?: (url: string) => void;
}) {
  const t = useTranslations("mypage");
  return (
    <div className='flex items-center gap-4 mb-6'>
      <AvatarUploader photoURL={photoURL} onUploaded={onAvatarUpdated} />
      <p className='text-lg font-medium'>{t("greeting", { name })}</p>
    </div>
  );
}
