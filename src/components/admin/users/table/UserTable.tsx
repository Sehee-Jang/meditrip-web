"use client";

import React, { useState } from "react";
import AdminDataTable, {
  type DataTableColumn,
} from "@/components/admin/common/AdminDataTable";
import UserTableRow from "./UserTableRow";
import UserPointLogDialog from "@/components/admin/points/UserPointLogDialog";
import DeductPointDialog from "@/components/admin/points/DeductPointDialog";
import { MemberRow } from "@/types/user";

type Props = {
  users: MemberRow[];
  totalCount: number;
  loading?: boolean;
  title?: string;
};

export default function UserTable({
  users,
  totalCount,
  loading = false,
  title = "회원 목록",
}: Props) {
  const [logTarget, setLogTarget] = useState<MemberRow | null>(null);
  const [deductTarget, setDeductTarget] = useState<MemberRow | null>(null);

  const columns = [
    { header: "이름" }, // 가변
    { header: "이메일", widthClass: "w-[32%]" },
    { header: "포인트", widthClass: "w-[12%]", align: "right" },
    { header: "가입일", widthClass: "w-[16%]", align: "center" },
    { header: "마케팅 동의", widthClass: "w-[12%]", align: "center" },
    { header: "더 보기", widthClass: "w-[12%]", align: "right" },
  ] as const satisfies ReadonlyArray<DataTableColumn>;

  return (
    <>
      <AdminDataTable<MemberRow>
        title={title}
        items={users}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        getRowKey={(u) => u.id}
        renderRow={(u) => (
          <UserTableRow
            user={u}
            onShowLog={setLogTarget}
            onDeduct={setDeductTarget}
          />
        )}
        emptyMessage='데이터가 없습니다.'
      />

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
    </>
  );
}
