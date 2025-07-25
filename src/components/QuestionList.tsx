import QuestionItem from "./QuestionItem";
import { mockQuestions } from "@/data/mockData";

export default function QuestionList() {
  return (
    <div className='space-y-2'>
      {mockQuestions.map((q, idx) => (
        <QuestionItem key={idx} {...q} />
      ))}
    </div>
  );
}
