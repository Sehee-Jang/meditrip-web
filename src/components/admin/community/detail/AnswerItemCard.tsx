/** 개별 답변 카드 + 답글 토글/입력/목록 */
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { AnswerItem } from "@/types/question";
import { listReplies, createReply } from "@/services/community-admin/answers";

export default function AnswerItemCard({
  questionId,
  answer,
}: {
  questionId: string;
  answer: AnswerItem;
}) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState("");
  const qc = useQueryClient();

  const { data: replies, isLoading } = useQuery({
    queryKey: ["admin-replies", questionId, answer.id],
    queryFn: () => listReplies(questionId, answer.id),
    enabled: open,
  });
  return (
    <li className='rounded-xl border p-3'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <div className='text-xs text-muted-foreground mb-1'>
            {new Date(answer.createdAt).toLocaleString()} · 답글{" "}
            {answer.repliesCount}개
          </div>
          <div className='whitespace-pre-wrap text-sm leading-6'>
            {answer.content}
          </div>
        </div>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => setOpen((v) => !v)}
          className='-mr-2'
        >
          {open ? (
            <ChevronDown className='size-4' />
          ) : (
            <ChevronRight className='size-4' />
          )}
          <span className='ml-1'>답글</span>
        </Button>
      </div>

      {open && (
        <div className='mt-3 pl-3 border-l'>
          {/* 답글 입력 */}
          <div className='flex items-center gap-2'>
            <Input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder='답글 내용을 입력하세요'
            />
            <Button
              size='sm'
              disabled={!reply.trim()}
              onClick={async () => {
                await createReply(questionId, answer.id, reply.trim());
                setReply("");
                await qc.invalidateQueries({
                  queryKey: ["admin-replies", questionId, answer.id],
                });
                await qc.invalidateQueries({
                  queryKey: ["admin-answers", questionId],
                }); // repliesCount 반영
              }}
            >
              등록
            </Button>
          </div>

          {/* 답글 목록 */}
          <div className='mt-3'>
            {isLoading ? (
              <div className='text-xs text-muted-foreground'>답글 로딩 중…</div>
            ) : !replies || replies.length === 0 ? (
              <div className='text-xs text-muted-foreground'>
                등록된 답글이 없습니다.
              </div>
            ) : (
              <ul className='space-y-2'>
                {replies.map((r) => (
                  <li
                    key={r.id}
                    className='rounded border px-3 py-2 bg-slate-50'
                  >
                    <div className='text-[11px] text-muted-foreground mb-1'>
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                    <div className='whitespace-pre-wrap text-sm leading-6'>
                      {r.content}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
