"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  formId: string;
  children: React.ReactNode;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  widthClassName?: string;
  /** 커스텀 푸터를 쓰고 싶을 때 제공 (제공 시 기본 푸터를 대체) */
  footer?: React.ReactNode;

  /** 닫혀있을 때도 컴포넌트를 유지하고 싶다면 true (기본: false → 닫히면 완전 언마운트) */
  mountWhenClosed?: boolean;
}

export default function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  formId,
  children,
  loading,
  submitLabel = "저장",
  cancelLabel = "취소",
  widthClassName = "sm:max-w-[840px]",
  footer,
  mountWhenClosed = false,
}: FormSheetProps) {
  // 닫힐 때 완전 언마운트 → 포털/오버레이/포커스트랩 잔존 이슈 방지
  if (!open && !mountWhenClosed) return null;

  // open 상태가 바뀔 때마다 Sheet를 강제 재마운트 → 내부 포커스/포털 초기화
  const sheetKey = open ? "open" : "closed";

  return (
    <Sheet key={sheetKey} open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className={`w-full ${widthClassName} p-0`}
        // 자동 포커스 방지(입력칸 강제 포커스로 인해 스크롤/트랩 꼬임 방지)
        onOpenAutoFocus={(e) => e.preventDefault()}
        // 로딩 중일 때 바깥 클릭/ESC로 닫히지 않게 하려면 주석 해제
        // onInteractOutside={(e) => { if (loading) e.preventDefault(); }}
        // onEscapeKeyDown={(e) => { if (loading) e.preventDefault(); }}
      >
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='sticky top-0 z-10 border-b bg-background'>
            <div className='px-6 py-4'>
              <SheetHeader className='space-y-1'>
                <SheetTitle className='text-base font-semibold'>
                  {title}
                </SheetTitle>
                {description ? (
                  <SheetDescription className='text-sm text-muted-foreground'>
                    {description}
                  </SheetDescription>
                ) : null}
              </SheetHeader>
            </div>
          </div>

          {/* Body */}
          <div className='min-h-0 flex-1 overflow-y-auto px-6 py-6'>
            {children}
          </div>

          {/* Footer */}
          <div className='sticky bottom-0 z-10 border-t bg-background'>
            <div className='flex items-center justify-end gap-2 px-4 py-3'>
              {footer ?? (
                <>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                  >
                    {cancelLabel}
                  </Button>
                  {/*  form 속성만으로 안전하게 제출 (requestSubmit 제거) */}
                  <Button
                    type='submit'
                    form={formId}
                    disabled={loading}
                    className='bg-indigo-700 hover:bg-indigo-800'
                  >
                    {submitLabel}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
