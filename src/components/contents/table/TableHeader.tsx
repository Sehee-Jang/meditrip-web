"use client";

export default function TableHeader() {
  return (
    <thead className='bg-slate-50'>
      <tr className='text-left text-[13px] text-slate-500'>
        <th className='px-4 py-3 font-medium'>제목</th>
        <th className='px-4 py-3 font-medium'>카테고리</th>
        <th className='px-4 py-3 font-medium text-center'>썸네일</th>
        <th className='px-4 py-3 font-medium text-center'>조회수</th>
        <th className='px-4 py-3 font-medium'>등록일</th>
        <th className='px-4 py-3 font-medium text-center'>작업</th>
      </tr>
    </thead>
  );
}
