/** 개별 답변 카드 + 답글 토글/입력/목록 */
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AnswerItem } from "@/types/question";
import { updateAnswer, deleteAnswer } from "@/services/community-admin/answers";
import { formatDateTimeCompact } from "@/utils/date";

export default function AnswerItemCard({
  questionId,
  answer,
}: {
  questionId: string;
  answer: AnswerItem;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(answer.content);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const createdAt = formatDateTimeCompact(answer.createdAt);

  const handleSave = async (): Promise<void> => {
    if (!content.trim()) return;
    try {
      setSubmitting(true);
      await updateAnswer(questionId, answer.id, content.trim());
      await qc.invalidateQueries({ queryKey: ["admin-answers", questionId] });
      setEditing(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      setSubmitting(true);
      await deleteAnswer(questionId, answer.id);
      await qc.invalidateQueries({ queryKey: ["admin-answers", questionId] });
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <li className='rounded-xl border p-3'>
      <div className='flex items-start justify-between gap-4'>
        <div className='flex-1 min-w-0'>
          <div className='text-xs text-muted-foreground mb-1'>{createdAt}</div>

          {editing ? (
            <div className='space-y-2'>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder='답변 내용을 입력하세요'
              />
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleSave}
                  disabled={submitting || !content.trim()}
                >
                  <Save className='mr-1 h-4 w-4' />
                  저장
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => {
                    setContent(answer.content);
                    setEditing(false);
                  }}
                  disabled={submitting}
                >
                  <X className='mr-1 h-4 w-4' />
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <div className='whitespace-pre-wrap text-sm leading-6'>
              {answer.content}
            </div>
          )}
        </div>
        <div className='flex shrink-0 gap-1'>
          {!editing && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setEditing(true)}
              className='-mr-1'
            >
              <Pencil className='size-4' />
              <span className='ml-1'>수정</span>
            </Button>
          )}
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setConfirmOpen(true)}
            disabled={submitting}
          >
            <Trash2 className='size-4' />
            <span className='ml-1'>삭제</span>
          </Button>
        </div>
      </div>
      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogTitle>답변을 삭제할까요?</DialogTitle>
          <DialogDescription>삭제 후에는 되돌릴 수 없습니다.</DialogDescription>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={submitting}
            >
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}
