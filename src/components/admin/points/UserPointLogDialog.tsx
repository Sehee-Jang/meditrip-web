import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import PointLogList from "@/components/common/points/PointLogList";

interface Props {
  userId: string;
  nickname: string;
  open: boolean;
  onClose: () => void;
}

interface Log {
  points: number;
  description?: string;
  createdAt?: { toDate: () => Date };
}

export default function UserPointLogDialog({
  userId,
  nickname,
  open,
  onClose,
}: Props) {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    if (!open) return;
    const fetchLogs = async () => {
      const q = query(
        collection(db, `users/${userId}/pointLogs`),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setLogs(snap.docs.map((doc) => doc.data() as Log));
    };
    fetchLogs();
  }, [userId, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md px-6 py-6 rounded-2xl'>
        <DialogHeader className='mb-4'>
          <DialogTitle className='text-lg font-bold'>
            {nickname}님의 포인트 내역
          </DialogTitle>
        </DialogHeader>

        <PointLogList logs={logs} emptyMessage='포인트 내역이 없습니다.' />
      </DialogContent>
    </Dialog>
  );
}
