"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { deductPoints } from "@/services/points/deductPoints";
import { toast } from "sonner";

interface Props {
  userId: string;
  nickname: string;
  open: boolean;
  onClose: () => void;
}

export default function DeductPointDialog({
  userId,
  nickname,
  open,
  onClose,
}: Props) {
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState("");

  const handleSubmit = async () => {
    if (!amount || !reason.trim()) {
      toast.error("차감 금액과 사유를 모두 입력해주세요.");
      return;
    }

    await deductPoints({ userId, amount, reason });
    toast.success(`-${amount}P 차감 완료`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md space-y-4'>
        <DialogHeader>
          <DialogTitle>{nickname}님 포인트 차감</DialogTitle>
        </DialogHeader>

        <div className='space-y-2'>
          <label className='block text-sm font-medium'>차감 금액</label>
          <input
            type='number'
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder='예: 100'
            className='w-full border rounded-md px-3 py-2'
          />
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-medium'>차감 사유</label>
          <input
            type='text'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='예: 잘못된 게시글'
            className='w-full border rounded-md px-3 py-2'
          />
        </div>

        <div className='pt-2 flex justify-end gap-2'>
          <button
            onClick={onClose}
            className='text-sm px-4 py-2 border rounded-md'
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className='text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'
          >
            차감
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
