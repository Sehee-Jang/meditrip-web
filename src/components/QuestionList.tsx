import QuestionItem from "./QuestionItem";

const mockQuestions = [
  {
    username: "익명",
    date: "2025.07.15",
    category: "여성질환",
    question: "생리불순이 자주 발생하는데, 침 치료로도 개선이 될까요?",
    answers: 1,
  },
  {
    username: "소라맘",
    date: "2025.07.14",
    category: "멘탈케어",
    question: "스트레스로 잠을 못 자는데, 한약이 도움이 되나요?",
    answers: 1,
  },
];

export default function QuestionList() {
  return (
    <div className='space-y-2'>
      {mockQuestions.map((q, idx) => (
        <QuestionItem key={idx} {...q} />
      ))}
    </div>
  );
}
