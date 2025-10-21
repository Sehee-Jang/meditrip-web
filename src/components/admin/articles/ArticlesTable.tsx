"use client";

import React, { useState } from "react";
import AdminDataTable, { DataTableColumn } from "../common/AdminDataTable";
import { Article } from "@/types/articles";
import ArticlesTableRow from "./ArticlesTableRow";
import ArticlesFormDialog from "./ArticlesFormDialog";
import { deleteArticle } from "@/services/articles/deleteArticle";
import { toast } from "sonner";
import ConfirmDialog from "@/components/admin/common/ConfirmDialog";

interface Props {
  items: Article[];
  totalCount: number;
  loading?: boolean;
  title?: string;
  onChanged?: () => void;
}

export default function ArticlesTable({
  items,
  totalCount,
  loading = false,
  title = "K-웰니스 아티클 목록",
  onChanged,
}: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  const columns = [
    { header: "제목" },
    { header: "카테고리", widthClass: "w-[18%]", align: "center" },
    { header: "등록일", widthClass: "w-[18%]", align: "center" },
    { header: "상태", widthClass: "w-[14%]", align: "center" },
    { header: "작업", widthClass: "w-[20%]", align: "right" },
  ] as const satisfies ReadonlyArray<DataTableColumn>;

  const handleDelete = async (id: string) => {
    setTargetId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!targetId) return;
    try {
      setDeleting(true);
      await deleteArticle(targetId);
      toast.success("삭제되었습니다.");
      onChanged?.(); // 목록 갱신
    } catch {
      toast.error("삭제에 실패했어요.");
    } finally {
      setDeleting(false);
      setTargetId(null);
    }
  };
  return (
    <>
      <AdminDataTable<Article>
        title={title}
        items={items}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        getRowKey={(w) => w.id}
        renderRow={(w) => (
          <ArticlesTableRow
            article={w}
            onUpdated={onChanged ?? (() => {})}
            onEdit={(id) => setEditId(id)}
            onDelete={(id) => void handleDelete(id)}
          />
        )}
        emptyMessage='데이터가 없습니다.'
      />

      {editId && (
        <ArticlesFormDialog
          id={editId}
          open
          onOpenChange={(v) => !v && setEditId(null)}
          onUpdated={() => {
            onChanged?.();
            setEditId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setTargetId(null);
        }}
        title='아티클을 삭제할까요?'
        description='삭제 후 되돌릴 수 없습니다.'
        confirmText='삭제'
        cancelText='취소'
        confirmVariant='destructive'
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
