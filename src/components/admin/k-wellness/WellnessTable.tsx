"use client";

import React, { useState } from "react";
import AdminDataTable, { DataTableColumn } from "../common/AdminDataTable";
import { Wellness } from "@/types/wellness";
import WellnessTableRow from "./WellnessTableRow";
import WellnessFormDialog from "./WellnessFormDialog";
import { deleteWellness } from "@/services/wellness/deleteWellness";
import { toast } from "sonner";

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

  const handleDelete = async (id: string) => {
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;
    try {
      await deleteWellness(id);
      toast.success("삭제되었습니다.");
      onChanged?.(); // 👈 목록 갱신
    } catch {
      toast.error("삭제에 실패했어요.");
    }
  };

  return (
    <>
      <AdminDataTable<Wellness>
        title={title}
        items={items}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        getRowKey={(w) => w.id}
        renderRow={(w) => (
          <WellnessTableRow
            wellness={w}
            onEdit={(id) => setEditId(id)}
            onDelete={(id) => void handleDelete(id)}
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
