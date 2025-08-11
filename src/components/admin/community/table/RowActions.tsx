"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setQuestionHidden } from "@/services/community-admin/hideQuestion";
import { deleteQuestion } from "@/services/community-admin/deleteQuestion";

export default function RowActions({
  questionId,
}: {
  questionId: string;
}) {
  const qc = useQueryClient();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8'>
          <MoreHorizontal className='size-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-36'>
        <DropdownMenuItem
          onClick={() =>
            router.push(`/admin/community/${questionId}`)
          }
        >
          답변 작성
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await setQuestionHidden(questionId, true);
            await qc.invalidateQueries({ queryKey: ["admin-questions"] });
          }}
        >
          숨김 처리
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            await setQuestionHidden(questionId, false);
            await qc.invalidateQueries({ queryKey: ["admin-questions"] });
          }}
        >
          숨김 해제
        </DropdownMenuItem>
        <DropdownMenuItem
          className='text-red-600 focus:text-red-600'
          onClick={async () => {
            if (!confirm("정말 삭제할까요?")) return;
            await deleteQuestion(questionId);
            await qc.invalidateQueries({ queryKey: ["admin-questions"] });
          }}
        >
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
