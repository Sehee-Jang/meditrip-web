type QuestionItemProps = {
  username: string;
  date: string;
  category: string;
  question: string;
  answers: number;
};

export default function QuestionItem({
  username,
  date,
  category,
  question,
  answers,
}: QuestionItemProps) {
  return (
    <div className='flex items-start gap-3 py-4 border-b'>
      <div className='text-red-500 text-xl'>❓</div>
      <div className='flex-1'>
        <p className='font-medium'>{question}</p>
        <div className='text-sm text-gray-500 mt-1'>
          👤 사용자: {username} | 🗓 {date} | 📁 카테고리: {category} | 💬 답변:{" "}
          {answers}개
        </div>
      </div>
    </div>
  );
}
