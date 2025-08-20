"use client";

import React, { useState } from "react";
import UserTableHeader from "./UserTableHeader";
import UserTableRow from "./UserTableRow";
import UserPointLogDialog from "@/components/admin/points/UserPointLogDialog";
import DeductPointDialog from "@/components/admin/points/DeductPointDialog";
import { MemberRow } from "@/types/user";

type Props = {
  users: MemberRow[];
  totalCount: number;
  loading?: boolean;
};

export default function UserTable({
  users,
  totalCount,
  loading = false,
}: Props) {
  const [logTarget, setLogTarget] = useState<MemberRow | null>(null);
  const [deductTarget, setDeductTarget] = useState<MemberRow | null>(null);

  return (
    <div className='rounded-2xl border bg-white shadow-sm'>
      <div className='flex bg-gray-50 items-center justify-between px-4 py-3 border-b'>
        <div className='font-medium'>회원 목록</div>
        <div className='text-sm text-muted-foreground'>
          {users.length === totalCount
            ? `총 ${totalCount.toLocaleString()}건`
            : `검색 결과 ${users.length.toLocaleString()}건 / 전체 ${totalCount.toLocaleString()}건`}
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <UserTableHeader />
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className='p-8 text-center text-muted-foreground'
                >
                  로딩 중…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className='px-4 py-8 text-center text-sm text-gray-500'
                >
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onShowLog={setLogTarget}
                  onDeduct={setDeductTarget}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 모달들 */}
      {logTarget && (
        <UserPointLogDialog
          open
          userId={logTarget.id}
          nickname={logTarget.nickname}
          onClose={() => setLogTarget(null)}
        />
      )}
      {deductTarget && (
        <DeductPointDialog
          open
          userId={deductTarget.id}
          nickname={deductTarget.nickname}
          onClose={() => setDeductTarget(null)}
        />
      )}
    </div>
  );
}
