"use client";

import * as React from "react";
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
import ConfirmDialog from "@/components/admin/common/ConfirmDialog";

export default function RowActions({ questionId }: { questionId: string }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const confirmDelete = async (): Promise<void> => {
    try {
      setDeleting(true);
      await deleteQuestion(questionId);
      await qc.invalidateQueries({ queryKey: ["admin-questions"] });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='h-8 w-8'>
            <MoreHorizontal className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-36'>
          <DropdownMenuItem
            onClick={() => router.push(`/admin/community/${questionId}`)}
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
            onClick={() => setDeleteOpen(true)}
          >
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='질문을 삭제할까요?'
        description='삭제 후 되돌릴 수 없습니다.'
        confirmText='삭제'
        cancelText='취소'
        confirmVariant='destructive'
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
