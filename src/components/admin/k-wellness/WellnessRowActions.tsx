"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import type { Wellness } from "@/types/wellness";

type Props = {
  wellness: Wellness;
  onEdit: () => void;
  onDelete: () => void;
};

export default function WellnessRowActions({ onEdit, onDelete }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          aria-label='행 동작'
        >
          <MoreHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          수정
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className='text-destructive focus:text-destructive'
        >
          <Trash2 className='mr-2 size-4' />
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
