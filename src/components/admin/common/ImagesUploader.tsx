"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string; // default: images
  dir?: string; // default: clinics
}

export default function ImagesUploader({
  value,
  onChange,
  bucket = "images",
  dir = "clinics",
}: Props) {
  const [uploading, setUploading] = React.useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const path = `${dir}/${crypto.randomUUID()}-${encodeURIComponent(
          file.name
        )}`;
        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
      onChange([...(value ?? []), ...newUrls]);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-3'>
        <input
          type='file'
          accept='image/*'
          multiple
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <Button type='button' variant='secondary' disabled={uploading}>
          {uploading ? "업로드 중..." : "첨부"}
        </Button>
      </div>

      {value?.length ? (
        <ul className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {value.map((u) => (
            <li key={u} className='relative'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u}
                alt=''
                className='h-24 w-full rounded object-cover border'
              />
              <button
                type='button'
                className='absolute right-1 top-1 rounded bg-black/50 px-2 py-0.5 text-xs text-white'
                onClick={() => onChange(value.filter((x) => x !== u))}
              >
                제거
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
