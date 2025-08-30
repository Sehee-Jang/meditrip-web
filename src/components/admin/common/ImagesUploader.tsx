"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { resolveStorage, type StoragePreset } from "@/constants/storage";

interface Props {
  value: string[]; // 현재 이미지 URL 배열(제어형)
  onChange: (urls: string[]) => void;

  // 우선순위: preset → bucket/dir (수동 지정 시 preset을 덮어씀)
  preset?: StoragePreset;
  bucket?: string;
  dir?: string;

  // 파일 선택 동작 제어
  accept?: string; // 기본 'image/*'
  multiple?: boolean; // 기본 true
  disabled?: boolean; // 업로드버튼 비활성화
}

// 파일명 안전화: 공백→하이픈, 허용문자만 유지, 소문자
function toSafeFileName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

export default function ImagesUploader({
  value,
  onChange,
  preset,
  bucket,
  dir,
  accept = "image/*",
  multiple = true,
  disabled = false,
}: Props) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // 최종 업로드 대상 버킷/디렉터리 계산
  const { bucket: finalBucket, dir: finalDir } = resolveStorage(
    preset,
    bucket,
    dir
  );

  // 숨겨진 input을 버튼으로 트리거
  const openPicker = (): void => {
    inputRef.current?.click();
  };

  // 에러 메시지 포맷터(타입 안전)
  const fmt = (e: unknown): string =>
    e instanceof Error ? e.message : "Unknown error";

  // 파일 업로드
  async function handleFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        // 폴더/랜덤 파일명 + 원본명(특수문자 안전)
        const safeName = toSafeFileName(file.name);
        const path = `${finalDir}/${crypto.randomUUID()}-${safeName}`;

        // 업로드 (RLS/버킷/정책에 따라 실패 가능)
        const { error } = await supabase.storage
          .from(finalBucket)
          .upload(path, file, {
            upsert: false,
            contentType: file.type || "application/octet-stream",
          });

        if (error) {
          throw new Error(fmt(error));
        }

        // 공개 URL (버킷이 public이거나 select policy 허용 필요)
        const { data } = supabase.storage.from(finalBucket).getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }

      // 중복 제거 후 반영
      const merged = Array.from(new Set([...(value ?? []), ...newUrls]));
      onChange(merged);
    } catch (e) {
      console.error("ImagesUploader upload failed:", e);
      alert(
        `이미지 업로드에 실패했습니다.\n버킷(${finalBucket})/권한/프로젝트 키를 확인해주세요.\n사유: ${fmt(
          e
        )}`
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = ""; // 동일 파일 재선택 허용
    }
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-3'>
        {/* 실제 파일 입력은 숨기고 버튼으로 제어 */}
        <input
          ref={inputRef}
          type='file'
          accept={accept}
          multiple={multiple}
          onChange={(e) => void handleFiles(e.target.files)}
          className='hidden'
        />
        <Button
          type='button'
          variant='secondary'
          disabled={uploading || disabled}
          onClick={openPicker}
        >
          {uploading ? "업로드 중..." : "이미지 선택"}
        </Button>
      </div>

      {/* 썸네일 그리드 */}
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
