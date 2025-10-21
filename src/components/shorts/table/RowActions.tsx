"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteVideo } from "@/services/shorts/videos.client";
import ConfirmDialog from "@/components/admin/common/ConfirmDialog";

export default function RowActions({
  videoId,
  onDeleted,
}: {
  videoId: string;
  onDeleted: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    setDeleteOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    try {
      setDeleting(true);
      await deleteVideo(videoId);
      toast.success("삭제되었습니다.");
      onDeleted();
    } catch (e) {
      console.error(e);
      toast.error("삭제에 실패했어요.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className='flex items-center justify-center'>
      <Button variant='destructive' size='sm' onClick={handleDelete}>
        삭제
      </Button>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title='영상 콘텐츠를 삭제할까요?'
        description='삭제 후 되돌릴 수 없습니다.'
        confirmText='삭제'
        cancelText='취소'
        confirmVariant='destructive'
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
