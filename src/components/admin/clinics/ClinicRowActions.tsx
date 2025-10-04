"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, SquarePen, Trash2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ClinicRowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onOpenPackages?: () => void;
}

function clearBodyPointerSoon(): void {
  if (typeof document === "undefined") return;
  document.body.style.pointerEvents = "";
  queueMicrotask(() => {
    document.body.style.pointerEvents = "";
  });
  requestAnimationFrame(() => {
    document.body.style.pointerEvents = "";
  });
}

export default function ClinicRowActions({
  onEdit,
  onDelete,
  onOpenPackages,
}: ClinicRowActionsProps) {
  return (
    <DropdownMenu
      // 열림/닫힘 어떤 전환이든 한 번씩 복구
      onOpenChange={() => clearBodyPointerSoon()}
    >
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' aria-label='더 보기'>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='w-40'
        onInteractOutside={() => clearBodyPointerSoon()}
        onCloseAutoFocus={() => clearBodyPointerSoon()}
      >
        {/* ✨ 패키지 메뉴 추가(선택적으로 노출) */}
        {onOpenPackages && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              clearBodyPointerSoon();
              onOpenPackages();
            }}
          >
            <Plus className='mr-2 size-4' />
            패키지
          </DropdownMenuItem>
        )}

        {/* 수정 */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault(); // 메뉴 기본 닫힘 타이밍과 레이스 방지
            clearBodyPointerSoon();
            onEdit(); // 시트 열기
          }}
        >
          <SquarePen className='mr-2 size-4' />
          수정
        </DropdownMenuItem>

        {/* 삭제 */}
        <DropdownMenuItem
          className='text-red-600 focus:text-red-600'
          onSelect={(e) => {
            e.preventDefault();
            clearBodyPointerSoon();
            onDelete();
          }}
        >
          <Trash2 className='mr-2 size-4' />
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
