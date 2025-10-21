"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmVariant = "default" | "destructive";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  confirmVariant?: ConfirmVariant;
  loading?: boolean;
  disabled?: boolean;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  confirmVariant = "default",
  loading = false,
  disabled = false,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    if (disabled || loading) return;
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={description ? "confirm-desc" : undefined}
      >
        <DialogTitle className='text-base'>{title}</DialogTitle>
        {description ? (
          <DialogDescription id='confirm-desc' className='text-sm'>
            {description}
          </DialogDescription>
        ) : null}
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type='button'
            variant={
              confirmVariant === "destructive" ? "destructive" : "default"
            }
            onClick={() => void handleConfirm()}
            disabled={loading}
          >
            {loading ? "처리 중..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
