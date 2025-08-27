"use client";

import React, { useState } from "react";
import AdminDataTable, { DataTableColumn } from "../common/AdminDataTable";
import { Wellness } from "@/types/wellness";
import WellnessTableRow from "./WellnessTableRow";
import WellnessFormDialog from "./WellnessFormDialog";

interface Props {
  items: Wellness[];
  totalCount: number;
  loading?: boolean;
  title?: string;
  onChanged?: () => void;
}

export default function WellnessTable({
  items,
  totalCount,
  loading = false,
  title = "K-웰니스 콘텐츠 목록",
  onChanged,
}: Props) {
  const [editId, setEditId] = useState<string | null>(null);

  const columns = [
    { header: "제목" },
    { header: "카테고리", widthClass: "w-[22%]", align: "center" },
    { header: "등록일", widthClass: "w-[22%]", align: "center" },
    { header: "작업", widthClass: "w-[20%]", align: "right" },
  ] as const satisfies ReadonlyArray<DataTableColumn>;

  return (
    <>
      <AdminDataTable<Wellness>
        title={title}
        items={items}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        getRowKey={(v) => v.id}
        renderRow={(v) => (
          <WellnessTableRow
            v={v}
            onEdit={() => setEditId(v.id)}
            onChanged={onChanged}
          />
        )}
        emptyMessage='데이터가 없습니다.'
      />

      {editId && (
        <WellnessFormDialog
          id={editId}
          open
          onOpenChange={(v) => !v && setEditId(null)}
          onUpdated={() => {
            onChanged?.();
            setEditId(null);
          }}
        />
      )}
    </>
  );
}
