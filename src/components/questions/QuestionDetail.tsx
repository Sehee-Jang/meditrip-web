"use client";

import Image from "next/image";
import { Question } from "@/types/Question";

export default function QuestionDetail({ question }: { question: Question }) {
  return (
    <article className='max-w-3xl mx-auto px-4 py-6 space-y-4'>
      <p className='text-sm text-gray-500'>{question.category}</p>
      <h1 className='text-2xl font-bold'>{question.title}</h1>

      <p className='text-sm text-gray-400'>
        {question.createdAt?.toDate?.().toLocaleDateString() ?? "날짜 없음"}
      </p>

      <div className='text-base whitespace-pre-line'>{question.content}</div>

      {question.imageUrl && (
        <div className='mt-4'>
          <Image
            src={question.imageUrl}
            alt='첨부 이미지'
            width={600}
            height={400}
            className='rounded-md'
          />
        </div>
      )}
    </article>
  );
}
