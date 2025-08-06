// src/components/admin/UserPointTable.tsx

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import UserPointLogs from "./UserPointLogs";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  nickname: string;
  email: string;
  points?: number;
}

export default function UserPointTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(list);
    };
    fetchUsers();
  }, []);

  return (
    <div className='space-y-4'>
      <div className='overflow-x-auto border rounded-md'>
        <table className='min-w-full text-sm text-left'>
          <thead className='bg-gray-50 border-b'>
            <tr>
              <th className='px-4 py-3 font-semibold text-gray-700'>닉네임</th>
              <th className='px-4 py-3 font-semibold text-gray-700'>이메일</th>
              <th className='px-4 py-3 font-semibold text-gray-700'>포인트</th>
              <th className='px-4 py-3 font-semibold text-gray-700 text-center'>
                내역
              </th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {users.map((user) => (
              <tr key={user.id} className='hover:bg-gray-50'>
                <td className='px-4 py-3'>{user.nickname}</td>
                <td className='px-4 py-3 text-muted-foreground'>
                  {user.email}
                </td>
                <td className='px-4 py-3 font-medium'>{user.points ?? 0}P</td>
                <td className='px-4 py-3 text-center'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setSelectedUserId(
                        selectedUserId === user.id ? null : user.id
                      )
                    }
                  >
                    {selectedUserId === user.id ? "닫기" : "보기"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUserId && (
        <div className='border-t pt-4'>
          <UserPointLogs userId={selectedUserId} />
        </div>
      )}
    </div>
  );
}
