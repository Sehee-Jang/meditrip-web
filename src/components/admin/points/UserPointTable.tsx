"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import UserPointLogDialog from "@/components/admin/points/UserPointLogDialog";
import DeductPointDialog from "@/components/admin/points/DeductPointDialog";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  nickname: string;
  email: string;
  points?: number;
}

export default function UserPointTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deductTarget, setDeductTarget] = useState<User | null>(null);

  const fetchUsers = async () => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
    setUsers(list);
  };

  useEffect(() => {
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
                <td className='text-center px-4 py-3 space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setSelectedUser(user)}
                  >
                    {selectedUser?.id === user.id ? "닫기" : "보기"}
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => setDeductTarget(user)}
                  >
                    사용
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모달창: 포인트 내역 */}
      {selectedUser && (
        <UserPointLogDialog
          userId={selectedUser.id}
          nickname={selectedUser.nickname}
          open={true}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* 모달창: 포인트 사용 */}
      {deductTarget && (
        <DeductPointDialog
          open={true}
          userId={deductTarget.id}
          nickname={deductTarget.nickname}
          onClose={() => {
            setDeductTarget(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
