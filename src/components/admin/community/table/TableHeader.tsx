"use client";

export default function TableHeader() {
  return (
    <thead className='sticky top-0 z-10 bg-white/80 backdrop-blur border-b'>
      <tr className='[&>th]:py-3 [&>th]:px-4 text-xs text-muted-foreground'>
        <th style={{ width: "35%" }} className='text-left'>
          제목
        </th>
        <th style={{ width: "15%" }} className='text-center'>
          카테고리
        </th>
        <th style={{ width: "10%" }} className='text-left'>
          작성자명
        </th>
        <th style={{ width: "8%" }} className='text-center'>
          답변
        </th>
        <th style={{ width: "20%" }} className='text-left'>
          작성일
        </th>
        <th style={{ width: "12%" }} className='text-center'>
          액션
        </th>
      </tr>
    </thead>
  );
}
