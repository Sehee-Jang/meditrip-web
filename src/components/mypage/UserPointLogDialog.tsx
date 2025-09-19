"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { auth } from "@/lib/firebase";
import PointLogList from "@/components/common/points/PointLogList";
import { useTranslations } from "next-intl";

interface PointLog {
  id: string;
  description: string;
  points: number;
  createdAt: Timestamp;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserPointLogDialog({ open, onClose }: Props) {
  const t = useTranslations("mypage.pointsLog");
  const [logs, setLogs] = useState<PointLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "users", user.uid, "pointLogs"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const result = snap.docs.map((d) => {
        const data = d.data() as Omit<PointLog, "id">;
        return {
          id: d.id,
          ...data,
        };
      });

      setLogs(result);
      setLoading(false);
    };

    if (open) {
      loadLogs();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md w-full rounded-2xl'>
        <DialogHeader>
          <DialogTitle>{t("logTitle")}</DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            {t("logDescription")}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className='text-muted-foreground text-sm'>{t("logLoading")}</p>
        ) : (
          <PointLogList logs={logs} emptyMessage={t("logEmpty")} />
        )}
      </DialogContent>
    </Dialog>
  );
}
