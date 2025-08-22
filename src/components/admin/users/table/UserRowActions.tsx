import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { MemberRow } from "@/types/user";

type Props = {
  user: MemberRow;
  onShowLog: (user: MemberRow) => void;
  onDeduct: (user: MemberRow) => void;
};

export default function UserRowActions({ user, onShowLog, onDeduct }: Props) {
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
      <DropdownMenuContent align='end' className='w-36'>
        {/* 포인트 내역   */}
        <DropdownMenuItem onClick={() => onShowLog(user)}>
          포인트 내역
        </DropdownMenuItem>

        {/* 포인트 차감  */}
        <DropdownMenuItem onClick={() => onDeduct(user)}>
          포인트 차감
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
