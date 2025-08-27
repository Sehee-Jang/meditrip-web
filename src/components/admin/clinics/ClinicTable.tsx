"use client";

import React, { useState } from "react";
import type { ClinicWithId } from "@/types/clinic";
import AdminDataTable, {
  type DataTableColumn,
} from "@/components/admin/common/AdminDataTable";
import ClinicFormDialog from "./ClinicFormDialog";
import PackagesPanel from "./PackagesPanel";
import ClinicTableRow from "./ClinicTableRow";

interface Props {
  /** 필터 적용된 결과 */
  items: ClinicWithId[];
  /** 전체 개수(필터 적용 전) */
  totalCount: number;
  /** 변경 이후 리스트 갱신 */
  onChanged: () => void;
  /** 조회/갱신 중 표시 */
  loading?: boolean;
  /** 상단 타이틀 */
  title?: string;
}

export default function ClinicTable({
  items,
  totalCount,
  onChanged,
  loading = false,
  title = "병원 목록",
}: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [pkgClinicId, setPkgClinicId] = useState<string | null>(null);

  const columns = [
    { header: "이름" }, // 가변
    { header: "카테고리", widthClass: "w-[20%]" },
    { header: "상태", widthClass: "w-[16%]", align: "center" },
    { header: "액션", widthClass: "w-[24%]", align: "right" },
  ] as const satisfies ReadonlyArray<DataTableColumn>;

  return (
    <>
      <AdminDataTable<ClinicWithId>
        title={title}
        items={items}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        getRowKey={(c) => c.id}
        renderRow={(c) => (
          <ClinicTableRow
            clinic={c}
            onUpdated={onChanged}
            onOpenPackages={setPkgClinicId}
            onEdit={setEditId}
          />
        )}
        emptyMessage='등록된 병원이 없습니다.'
      />

      {/* 편집 다이얼로그 */}
      {editId && (
        <ClinicFormDialog
          clinicId={editId}
          open
          onOpenChange={(v) => !v && setEditId(null)}
          onUpdated={() => {
            onChanged();
            setEditId(null);
          }}
        />
      )}

      {/* 패키지 패널 */}
      {pkgClinicId && (
        <PackagesPanel
          clinicId={pkgClinicId}
          open
          onOpenChange={(v: boolean) => {
            if (!v) setPkgClinicId(null);
          }}
        />
      )}
    </>
  );
}


