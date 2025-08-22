"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { getAdminQuestions } from "@/services/community-admin/getAdminQuestions";
import AdminDataTable, {
  type DataTableColumn,
} from "@/components/admin/common/AdminDataTable";
import CommunityTableRow from "./CommunityTableRow";
import type { AdminFilter } from "@/features/community/admin/filters";

export default function CommunityAdminTable({
  filter,
}: {
  filter: AdminFilter;
}) {
  const [cursor, setCursor] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-questions", filter, cursor?.id ?? null],
    queryFn: async () => getAdminQuestions(20, filter, cursor ?? undefined),
  });

  // 필터가 바뀌면 페이지네이션 커서 초기화
  useEffect(() => {
    setCursor(null);
  }, [filter]);

  const items = data?.items ?? [];

  // 열 정의

  const columns = [
    { header: "제목" }, // 가변
    { header: "카테고리", widthClass: "w-[18%]", align: "center" },
    { header: "작성자명", widthClass: "w-[22%]" },
    { header: "답변", widthClass: "w-[12%]", align: "right" },
    { header: "작성일", widthClass: "w-[22%]", align: "center" },
    { header: "더 보기", widthClass: "w-[14%]", align: "right" },
  ] as const satisfies ReadonlyArray<DataTableColumn>;

  return (
    <>
      <AdminDataTable
        title='문의 목록'
        items={items}
        totalCount={items.length} // 전체 개수를 모르면 현재 페이지 개수로 표기
        loading={isLoading}
        columns={columns}
        getRowKey={(q) => q.id}
        renderRow={(q) => <CommunityTableRow q={q} />}
        emptyMessage='결과가 없습니다.'
        // 페이지 단위 카운트 라벨로 교체
        countLabel={(n) => `총 ${n.toLocaleString()}건`}
      />

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
    </>
  );
}
