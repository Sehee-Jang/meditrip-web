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
import { PortalContainerProvider } from "@/components/a11y/PortalContainerContext";

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
  // SheetContent DOM을 포털 컨테이너로 사용
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  // 닫힐 때 완전 언마운트하여 포커스/포털 잔존 이슈 예방
  if (!open && !mountWhenClosed) return null;

  // open 전환 시 강제 재마운트로 내부 상태 초기화
  const sheetKey = open ? "open" : "closed";

  return (
    <Sheet key={sheetKey} open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={contentRef}
        side='right'
        className={`w-full ${widthClassName} p-0`}
        // 자동 포커스 방지(강제 포커스로 인한 스크롤/트랩 꼬임 방지)
        onOpenAutoFocus={(e) => e.preventDefault()}
        // 로딩 중 바깥클릭/ESC 닫힘을 막으려면 아래 주석 해제
        // onInteractOutside={(e) => { if (loading) e.preventDefault(); }}
        // onEscapeKeyDown={(e) => { if (loading) e.preventDefault(); }}
      >
        {/* 모달 내부 자식들이 동일 컨테이너로 포털되도록 Provider 적용 */}
        <PortalContainerProvider value={contentRef}>
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
                    {/* form 속성만으로 제출 처리 */}
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
        </PortalContainerProvider>
      </SheetContent>
    </Sheet>
  );
}
