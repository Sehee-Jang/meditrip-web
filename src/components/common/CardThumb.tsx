"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src?: string | null;
  alt: string; // i18n 키로 받은 문자열 전달 권장
  className?: string; // 부모에서 relative 컨테이너 제공 필요
};

export default function CardThumb({ src, alt, className }: Props) {
  const [failed, setFailed] = useState(false);
  const url = typeof src === "string" ? src.trim() : "";
  const showRemote = url.length > 0 && !failed;

  if (!showRemote) {
    return (
      <img
        src='/images/placeholders/community_default_img.webp'
        alt={alt}
        loading='lazy'
        className={`absolute inset-0 h-full w-full object-cover ${
          className ?? ""
        }`}
      />
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes='(max-width: 640px) 100vw, 400px'
      className={`object-cover ${className ?? ""}`}
      onError={() => setFailed(true)}
    />
  );
}
