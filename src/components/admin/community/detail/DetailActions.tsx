"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye, Trash2 } from "lucide-react";
import CommunityAnswerDialog from "../CommunityAnswerDialog";
import { setQuestionHidden } from "@/services/community-admin/hideQuestion";
import { deleteQuestion } from "@/services/community-admin/deleteQuestion";
import { createAnswer } from "@/services/community-admin/answers";
import ConfirmDialog from "@/components/admin/common/ConfirmDialog";

export default function DetailActions({ questionId }: { questionId: string }) {
  const qc = useQueryClient();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const confirmDelete = async (): Promise<void> => {
    try {
      setDeleting(true);
      await deleteQuestion(questionId);
      router.push(`/admin/community`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      {/* 답변 작성 */}
      <CommunityAnswerDialog
        questionId={questionId}
        onSubmit={async (content) => {
          await createAnswer(questionId, content);
          await qc.invalidateQueries({
            queryKey: ["admin-answers", questionId],
          });
          await qc.invalidateQueries({
            queryKey: ["admin-question", questionId],
          });
        }}
      />
      {/* 숨김/표시/삭제 */}
      <Button
        variant='outline'
        onClick={async () => {
          await setQuestionHidden(questionId, true);
          await qc.invalidateQueries({
            queryKey: ["admin-question", questionId],
          });
        }}
      >
        <EyeOff className='mr-1.5 size-4' />
        숨김
      </Button>
      <Button
        variant='outline'
        onClick={async () => {
          await setQuestionHidden(questionId, false);
          await qc.invalidateQueries({
            queryKey: ["admin-question", questionId],
          });
        }}
      >
        <Eye className='mr-1.5 size-4' />
        표시
      </Button>
      <Button variant='destructive' onClick={() => setDeleteOpen(true)}>
        <Trash2 className='mr-1.5 size-4' />
        삭제
      </Button>

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
    </div>
  );
}
