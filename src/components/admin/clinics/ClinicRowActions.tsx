"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ClinicRowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
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
        className='w-36'
        onInteractOutside={() => clearBodyPointerSoon()}
        onCloseAutoFocus={() => clearBodyPointerSoon()}
      >
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault(); // 메뉴 기본 닫힘 타이밍과 레이스 방지
            clearBodyPointerSoon();
            onEdit(); // 시트 열기
          }}
        >
          수정
        </DropdownMenuItem>
        <DropdownMenuItem
          className='text-red-600 focus:text-red-600'
          onSelect={(e) => {
            e.preventDefault();
            clearBodyPointerSoon();
            onDelete();
          }}
        >
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
