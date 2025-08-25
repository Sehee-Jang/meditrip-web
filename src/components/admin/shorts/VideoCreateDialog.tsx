"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VideoCreateForm from "./VideoCreateForm";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

export default function VideoCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>영상 등록</DialogTitle>
        </DialogHeader>
        <VideoCreateForm
          onCreated={() => {
            onCreated();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
