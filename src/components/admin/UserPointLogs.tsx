// src/components/admin/UserPointLogs.tsx

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

interface Log {
  amount: number;
  reason: string;
  createdAt?: { toDate: () => Date };
}

export default function UserPointLogs({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const q = query(
        collection(db, `users/${userId}/pointLogs`),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const result = snap.docs.map((doc) => doc.data() as Log);
      setLogs(result);
    };
    fetchLogs();
  }, [userId]);

  if (logs.length === 0) {
    return <p className='text-sm text-gray-500'>포인트 내역이 없습니다.</p>;
  }

  return (
    <div className='border rounded-md p-4 bg-gray-50'>
      <h4 className='text-sm font-semibold mb-3'>포인트 적립/차감 내역</h4>
      <ul className='space-y-2'>
        {logs.map((log, idx) => (
          <li key={idx} className='flex justify-between text-sm'>
            <div className='text-gray-700'>{log.reason}</div>
            <div className='text-gray-500'>
              {log.amount > 0 ? `+${log.amount}` : log.amount}P ·
              {log.createdAt
                ? " " + log.createdAt.toDate().toLocaleDateString()
                : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
