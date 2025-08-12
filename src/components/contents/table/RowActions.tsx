"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteVideo } from "@/services/contents/videos.client";

export default function RowActions({
  videoId,
  onDeleted,
}: {
  videoId: string;
  onDeleted: () => void;
}) {
  const handleDelete = async () => {
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;
    try {
      await deleteVideo(videoId);
      toast.success("삭제되었습니다.");
      onDeleted();
    } catch (e) {
      console.error(e);
      toast.error("삭제에 실패했어요.");
    }
  };

  return (
    <div className='flex items-center justify-center'>
      <Button variant='destructive' size='sm' onClick={handleDelete}>
        삭제
      </Button>
    </div>
  );
}
