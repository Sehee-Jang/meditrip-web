"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, SquarePen, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PackageRowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

function clearBodyPointerSoon(): void {
  if (typeof document === "undefined") return;
  document.body.style.pointerEvents = "";
  queueMicrotask(() => (document.body.style.pointerEvents = ""));
  requestAnimationFrame(() => (document.body.style.pointerEvents = ""));
}

export default function PackageRowActions({
  onEdit,
  onDelete,
}: PackageRowActionsProps) {
  return (
    <DropdownMenu onOpenChange={() => clearBodyPointerSoon()}>
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
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            clearBodyPointerSoon();
            onEdit();
          }}
        >
          <SquarePen className='mr-2 size-4' />
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
          <Trash2 className='mr-2 size-4' />
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
