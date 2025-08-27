"use client";

import AdminDataTable, {
  type DataTableColumn,
} from "@/components/admin/common/AdminDataTable";
import VideoTableRow from "./VideoTableRow";
import type { Video } from "@/types/video";
import { deleteVideo } from "@/services/shorts/videos.client";
import { toast } from "sonner";

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
  const columns = [
    { header: "썸네일", widthClass: "w-[14%]", align: "center" },
    { header: "제목" }, // 가변
    { header: "카테고리", widthClass: "w-[22%]", align: "center" },
    { header: "등록일", widthClass: "w-[22%]", align: "center" },
    { header: "작업", widthClass: "w-[20%]", align: "right" },
  ] as const satisfies ReadonlyArray<DataTableColumn>;

  const handleDelete = async (id: string) => {
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;
    try {
      await deleteVideo(id);
      toast.success("삭제되었습니다.");
      onChanged();
    } catch {
      toast.error("삭제에 실패했어요.");
    }
  };

  return (
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
  );
}
