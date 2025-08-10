"use client";

export default function TableHeader() {
  return (
    <thead className='sticky top-0 z-10 bg-white/80 backdrop-blur border-b'>
      <tr className='[&>th]:py-3 [&>th]:px-4 [&>th]:text-left text-xs text-muted-foreground'>
        <th style={{ width: "38%" }}>제목</th>
        <th style={{ width: "14%" }}>카테고리</th>
        <th style={{ width: "10%" }} className='text-center'>
          이미지
        </th>
        <th style={{ width: "10%" }} className='text-center'>
          답변
        </th>
        <th style={{ width: "18%" }}>작성일</th>
        <th style={{ width: "10%" }} className='text-center'>
          액션
        </th>
      </tr>
    </thead>
  );
}
