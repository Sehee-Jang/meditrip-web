"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import {
  listVideosPage,
  type FireVideoAdminCursor,
} from "@/services/contents/videos.client";

export default function VideoAdminTable() {
  const [cursor, setCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-videos", cursor?.id ?? null],
    queryFn: async () =>
      listVideosPage(20, (cursor as FireVideoAdminCursor) ?? undefined),
  });

  const items = data?.items ?? [];

  return (
    <div className='rounded-2xl border bg-white shadow-sm'>
      <div className='flex items-center justify-between px-4 py-3 border-b'>
        <div className='font-medium'>콘텐츠 목록</div>
        <div className='text-sm text-muted-foreground'>총 {items.length}건</div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <TableHeader />
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className='p-8 text-center text-muted-foreground'
                >
                  로딩 중…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className='p-8 text-center text-muted-foreground'
                >
                  결과가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((v) => (
                <TableRow
                  key={v.id}
                  v={v}
                  onDeleted={() => {
                    // 삭제 후 첫 페이지부터 다시 로드
                    setCursor(null);
                    void refetch();
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className='p-3 flex justify-end'>
        <Button
          variant='outline'
          size='sm'
          disabled={!data?.cursor}
          onClick={() => setCursor(data?.cursor ?? null)}
        >
          더 보기
        </Button>
      </div>
    </div>
  );
}
