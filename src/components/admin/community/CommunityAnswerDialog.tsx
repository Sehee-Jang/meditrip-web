"use client";

import { useState } from "react";

export default function CommunityAnswerDialog({
  onSubmit,
}: {
  questionId: string;
  onSubmit: (content: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  return (
    <>
      <button
        className='px-2 py-1 border rounded'
        onClick={() => setOpen(true)}
      >
        답변
      </button>
      {open && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center'>
          <div className='bg-white rounded-xl p-4 w-full max-w-lg'>
            <h3 className='font-semibold mb-2'>답변 작성</h3>
            <textarea
              className='w-full border rounded p-2 min-h-[120px]'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='답변 내용을 입력하세요'
            />
            <div className='mt-3 flex justify-end gap-2'>
              <button
                className='px-3 py-1 border rounded'
                onClick={() => setOpen(false)}
              >
                취소
              </button>
              <button
                className='px-3 py-1 bg-black text-white rounded'
                onClick={async () => {
                  await onSubmit(content);
                  setContent("");
                  setOpen(false);
                }}
                disabled={!content.trim()}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
