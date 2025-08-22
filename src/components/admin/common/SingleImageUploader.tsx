"use client";

import * as React from "react";
import ImagesUploader from "./ImagesUploader";

interface Props {
  value?: string;
  onChange: (url?: string) => void;
  dir?: string;
}

export default function SingleImageUploader({ value, onChange, dir }: Props) {
  const arr = value ? [value] : [];
  return (
    <div className='space-y-2'>
      <ImagesUploader
        value={arr}
        onChange={(urls) => onChange(urls[0])}
        dir={dir}
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
