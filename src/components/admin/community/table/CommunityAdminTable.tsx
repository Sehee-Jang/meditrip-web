"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

import {
  getAdminQuestions,
  type AdminQuestionFilter,
} from "@/services/community-admin/getAdminQuestions";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

export default function CommunityAdminTable({
  filter,
  locale,
}: {
  filter: AdminQuestionFilter;
  locale: string;
}) {
  const [cursor, setCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-questions", filter, cursor?.id ?? null],
    queryFn: async () => getAdminQuestions(20, filter, cursor ?? undefined),
  });

  const items = data?.items ?? [];

  return (
    <div className='rounded-2xl border bg-white shadow-sm'>
      <div className='flex items-center justify-between px-4 py-3 border-b'>
        <div className='font-medium'>문의 목록</div>
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
              items.map((q) => <TableRow key={q.id} q={q} locale={locale} />)
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
