"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  description: string;
  points: number;
  condition: string;
  active: boolean;
}

export default function EventEditDialog({
  onEdit,
}: {
  onEdit: (event: Event) => void;
}) {
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    const snap = await getDocs(collection(db, "pointEvents"));
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
    setEvents(list);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "pointEvents", id));
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className='space-y-4'>
      <h3 className='text-base font-semibold'>이벤트 목록</h3>
      <table className='w-full text-sm border'>
        <thead>
          <tr className='bg-gray-50 text-left'>
            <th className='p-2'>설명</th>
            <th className='p-2'>포인트</th>
            <th className='p-2'>조건</th>
            <th className='p-2'>상태</th>
            <th className='p-2 text-center'>관리</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className='border-t hover:bg-accent'>
              <td className='p-2'>{e.description}</td>
              <td className='p-2'>{e.points}P</td>
              <td className='p-2'>{e.condition}</td>
              <td className='p-2'>{e.active ? "✅" : "❌"}</td>
              <td className='p-2 text-center space-x-2'>
                <Button variant='outline' size='sm' onClick={() => onEdit(e)}>
                  수정
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDelete(e.id)}
                >
                  삭제
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
