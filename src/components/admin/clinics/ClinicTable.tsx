"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { ClinicWithId } from "@/types/clinic";
import AdminDataTable, {
  type DataTableColumn,
} from "@/components/admin/common/AdminDataTable";
import ClinicFormDialog from "./ClinicFormDialog";
import PackagesPanel from "./PackagesPanel";
import ClinicTableRow from "./ClinicTableRow";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { updateClinicOrders } from "@/services/admin/clinics/clinics";

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

  // ① 로컬 정렬 상태
  const [rows, setRows] = useState<ClinicWithId[]>(() =>
    [...items].sort(compareByDisplayOrder)
  );
  const [dirty, setDirty] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // 서버 데이터 변경 → 로컬 동기화
  useEffect(() => {
    setRows([...items].sort(compareByDisplayOrder));
    setDirty(false);
  }, [items]);
  // ② 위/아래 이동 스왑 유틸
  const swap = (arr: ClinicWithId[], i: number, j: number): ClinicWithId[] => {
    const next = [...arr];
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    return next;
  };

  // ③ 이동 핸들러
  const move = (id: string, dir: "up" | "down") => {
    setRows((prev) => {
      const i = prev.findIndex((x) => x.id === id);
      if (i < 0) return prev;
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= prev.length) return prev;
      const next = swap(prev, i, j);
      setDirty(true);
      return next;
    });
  };

  // ④ 저장/취소
  const saveOrder = async () => {
    try {
      setSaving(true);
      const orderMap = rows.map((c, idx) => ({
        id: c.id,
        displayOrder: idx, // 0부터 순차 부여(작을수록 상단)
      }));
      await updateClinicOrders(orderMap);
      setDirty(false);
      onChanged(); // 서버 재조회
    } finally {
      setSaving(false);
    }
  };

  const tableKey = React.useMemo(() => rows.map((r) => r.id).join("|"), [rows]);

  const cancelChanges = () => {
    setRows([...items].sort(compareByDisplayOrder));
    setDirty(false);
  };

  // ⑤ 테이블 헤더(기존 유지)
  const columns = useMemo(
    () =>
      [
        { header: "이름" }, // 가변
        { header: "카테고리", widthClass: "w-[20%]" },
        { header: "상태", widthClass: "w-[16%]", align: "center" },
        { header: "액션", widthClass: "w-[24%]", align: "right" },
      ] as const satisfies ReadonlyArray<DataTableColumn>,
    []
  );

  return (
    <>
      {/* 상단 툴바: 저장/취소 */}
      <div className='mb-3 flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          총 {totalCount.toLocaleString()}개
          {dirty && <span className='ml-2 text-amber-600'>(변경됨)</span>}
        </div>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={cancelChanges}
            disabled={!dirty || saving || loading}
            title='변경 취소'
          >
            <RotateCcw className='mr-2 h-4 w-4' />
            취소
          </Button>
          <Button
            type='button'
            onClick={saveOrder}
            disabled={!dirty || saving || loading}
            title='변경사항 저장'
          >
            <Save className='mr-2 h-4 w-4' />
            {saving ? "저장 중…" : "변경사항 저장"}
          </Button>
        </div>
      </div>

      <AdminDataTable<ClinicWithId>
        key={tableKey}
        title={title}
        items={rows.slice()}
        totalCount={totalCount}
        loading={loading}
        columns={columns}
        getRowKey={(c) => c.id}
        renderRow={(c) => {
          const idx = rows.findIndex((x) => x.id === c.id);
          const isFirst = idx <= 0;
          const isLast = idx === rows.length - 1;
          return (
            <ClinicTableRow
              clinic={c}
              onUpdated={onChanged}
              onOpenPackages={setPkgClinicId}
              onEdit={setEditId}
              onMoveUp={() => move(c.id, "up")}
              onMoveDown={() => move(c.id, "down")}
              isFirst={isFirst}
              isLast={isLast}
              sortingDisabled={saving || loading}
            />
          );
        }}
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

/** displayOrder가 없으면 큰 값 취급 → 끝으로 밀림 */
function compareByDisplayOrder(
  a: { displayOrder?: number },
  b: { displayOrder?: number }
) {
  const ax =
    typeof a.displayOrder === "number"
      ? a.displayOrder
      : Number.MAX_SAFE_INTEGER;
  const bx =
    typeof b.displayOrder === "number"
      ? b.displayOrder
      : Number.MAX_SAFE_INTEGER;
  return ax - bx;
}
