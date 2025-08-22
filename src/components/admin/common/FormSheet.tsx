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
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className={`w-full ${widthClassName} p-0`}>
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='sticky top-0 z-10 border-b bg-background'>
            <div className='px-6 py-4'>
              <SheetHeader className='space-y-1'>
                <SheetTitle className='text-base font-semibold'>
                  {title}
                </SheetTitle>
                {description && (
                  <SheetDescription className='text-sm text-muted-foreground'>
                    {description}
                  </SheetDescription>
                )}
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
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    type='submit'
                    form={formId}
                    disabled={loading}
                    className='bg-indigo-700 hover:bg-indigo-800'
                    onClick={() => {
                      const form = document.getElementById(
                        formId
                      ) as HTMLFormElement | null;
                      form?.requestSubmit();
                    }}
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
