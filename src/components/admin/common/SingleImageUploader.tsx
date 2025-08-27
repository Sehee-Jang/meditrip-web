"use client";

import * as React from "react";
import ImagesUploader from "./ImagesUploader";
import type { StoragePreset } from "@/constants/storage";

interface Props {
  value?: string; // 단일 이미지 URL
  onChange: (url?: string) => void;
  preset?: StoragePreset; // 프리셋(권장)
  bucket?: string; // 수동 버킷
  dir?: string; // 수동 디렉터리
  accept?: string; // 기본 'image/*'
  disabled?: boolean;
}

export default function SingleImageUploader({
  value,
  onChange,
  preset,
  bucket,
  dir,
  accept = "image/*",
  disabled,
}: Props) {
  const arr = value ? [value] : [];

  return (
    <div className='space-y-2'>
      <ImagesUploader
        value={arr}
        onChange={(urls) => onChange(urls[0])} // 첫 이미지만 반영
        preset={preset}
        bucket={bucket}
        dir={dir}
        accept={accept}
        multiple={false} // 단일 업로드
        disabled={disabled}
      />
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=''
          className='h-24 w-full rounded object-cover border'
        />
      )}
    </div>
  );
}
