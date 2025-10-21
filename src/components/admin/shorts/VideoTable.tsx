"use client";

import * as React from "react";
import AdminDataTable, {
  type DataTableColumn,
} from "@/components/admin/common/AdminDataTable";
import VideoTableRow from "./VideoTableRow";
import type { Video } from "@/types/video";
import { deleteVideo } from "@/services/shorts/videos.client";
import { toast } from "sonner";
import ConfirmDialog from "@/components/admin/common/ConfirmDialog";

interface Props {
  items: Video[];
  totalCount: number;
  loading?: boolean;
  title?: string;
  onChanged: () => void;
}

export default function VideoTable({
  items,
  totalCount,
  loading = false,
  title = "컨텐츠 목록",
  onChanged,
}: Props) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [targetId, setTargetId] = React.useState<string | null>(null);

  const columns = [
    { header: "썸네일", widthClass: "w-[14%]", align: "center" },
    { header: "제목" }, // 가변
    { header: "카테고리", widthClass: "w-[22%]", align: "center" },
    { header: "등록일", widthClass: "w-[22%]", align: "center" },
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
      await deleteVideo(targetId);
      toast.success("삭제되었습니다.");
      onChanged();
    } catch {
      toast.error("삭제에 실패했어요.");
    } finally {
      setDeleting(false);
      setTargetId(null);
    }
  };

  return (
    <>
      <AdminDataTable<Video>
        title={title}
        items={items}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        getRowKey={(v) => v.id}
        renderRow={(v) => <VideoTableRow v={v} onDelete={handleDelete} />}
        emptyMessage='데이터가 없습니다.'
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setTargetId(null);
        }}
        title='영상 콘텐츠를 삭제할까요?'
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
