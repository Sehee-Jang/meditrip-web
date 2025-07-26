"use client";

// import QuestionItem from "./QuestionItem";
import { mockQuestions } from "@/data/mockData";
import { useEffect, useState } from "react";
import { getAllQuestions } from "@/services/questions/getAllQuestions";
import Link from "next/link";

export default function QuestionList() {
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await getAllQuestions();
      setQuestions(data);
    };
    fetch();
  }, []);

  return (
    <div className='space-y-2'>
      <ul className='max-w-3xl mx-auto px-4 py-8 space-y-4'>
        {questions.map((q) => (
          <li
            key={q.id}
            className='border rounded-md p-4 hover:bg-gray-50 transition'
          >
            <Link href={`/questions/${q.id}`}>
              <div className='flex flex-col gap-1'>
                <span className='text-sm text-gray-500'>{q.category}</span>
                <h3 className='text-lg font-medium'>{q.title}</h3>
                <p className='text-xs text-gray-400'>
                  {q.createdAt?.toDate?.().toLocaleDateString() ?? "날짜 없음"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* {mockQuestions.map((q, idx) => (
        <QuestionItem key={idx} {...q} />
      ))} */}
    </div>
  );
}
