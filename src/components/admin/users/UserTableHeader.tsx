"use client";

export default function UserTableHeader() {
  return (
    <thead className='sticky top-0 z-10 bg-white/80 backdrop-blur border-b'>
      <tr className='[&>th]:py-3 [&>th]:px-4 text-xs text-muted-foreground'>
        <th style={{ width: "24%" }} className='text-left'>
          이름
        </th>
        <th style={{ width: "28%" }} className='text-left'>
          이메일
        </th>
        <th style={{ width: "14%" }} className='text-center'>
          포인트
        </th>
        <th style={{ width: "10%" }} className='text-center'>
          가입일
        </th>
        <th style={{ width: "10%" }} className='text-center'>
          마케팅 동의
        </th>
        <th style={{ width: "14%" }} className='text-center'>
          더 보기
        </th>
      </tr>
    </thead>
  );
}
