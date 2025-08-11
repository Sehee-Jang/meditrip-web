"use client";

import { useState } from "react";
import { migrateMockToFirestore } from "@/services/contents/videos.client";
import { mockShorts } from "@/data/mockData";

export default function MigratePage() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onRun = async () => {
    setRunning(true);
    setErr(null);
    setDone(null);
    try {
      const count = await migrateMockToFirestore(mockShorts, {
        overwrite: true,
        useFixedId: true,
      });
      setDone(count);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className='max-w-xl mx-auto p-6'>
      <h1 className='text-xl font-bold mb-4'>Mock → Firestore 마이그레이션</h1>
      <p className='text-sm text-gray-600 mb-3'>
        버튼을 누르면 mockShorts를 <code>videos</code> 컬렉션에 일괄
        업로드합니다.
      </p>
      <button
        onClick={onRun}
        disabled={running}
        className='px-4 py-2 rounded-md border disabled:opacity-50'
      >
        {running ? "업로드 중..." : "마이그레이션 실행"}
      </button>
      {done !== null && (
        <p className='mt-3 text-green-700'>완료: {done}개 업로드</p>
      )}
      {err && <p className='mt-3 text-red-600'>에러: {err}</p>}
    </main>
  );
}
