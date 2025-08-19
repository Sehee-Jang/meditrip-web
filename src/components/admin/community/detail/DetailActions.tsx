"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EyeOff, Eye, Trash2 } from "lucide-react";
import CommunityAnswerDialog from "../CommunityAnswerDialog";
import { setQuestionHidden } from "@/services/community-admin/hideQuestion";
import { deleteQuestion } from "@/services/community-admin/deleteQuestion";
import { createAnswer } from "@/services/community-admin/answers";

export default function DetailActions({ questionId }: { questionId: string }) {
  const qc = useQueryClient();
  const router = useRouter();
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
      <Button
        variant='destructive'
        onClick={async () => {
          if (!confirm("정말 삭제할까요?")) return;
          await deleteQuestion(questionId);
          router.push(`/admin/community`);
        }}
      >
        <Trash2 className='mr-1.5 size-4' />
        삭제
      </Button>
    </div>
  );
}
