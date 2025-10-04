"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { ClinicWithId } from "@/types/clinic";
import AdminDataTable, {
  type DataTableColumn,
} from "@/components/admin/common/AdminDataTable";
import ClinicFormDialog from "./ClinicFormDialog";
import PackagesPanel from "./PackagesPanel";
import ClinicTableRow from "./ClinicTableRow";
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
  // 상위에 dirty 상태 통지
  onDirtyChange?: (dirty: boolean) => void;
  // 상위에 저장/취소 액션 바인딩
  onBindActions?: (actions: { save: () => void; cancel: () => void }) => void;
}

export default function ClinicTable({
  items,
  totalCount,
  onChanged,
  loading = false,
  title = "병원 목록",
  onDirtyChange,
  onBindActions,
}: Props) {
  const [editId, setEditId] = useState<string | null>(null);
  const [pkgClinicId, setPkgClinicId] = useState<string | null>(null);

  // 로컬 정렬 상태
  const [rows, setRows] = useState<ClinicWithId[]>(() =>
    [...items].sort(compareByDisplayOrder)
  );
  const [dirty, setDirty] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // 행 이동 시 잠깐 강조할 id
  const [flashRowId, setFlashRowId] = useState<string | null>(null);

  // 서버 데이터 변경 → 로컬 동기화
  useEffect(() => {
    setRows([...items].sort(compareByDisplayOrder));
    setDirty(false);
  }, [items]);

  // 부모에 dirty 상태를 안전하게 동기화
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  // 위/아래 이동 스왑 유틸
  const swap = (arr: ClinicWithId[], i: number, j: number): ClinicWithId[] => {
    const next = [...arr];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  // 이동 핸들러
  const move = (id: string, dir: "up" | "down") => {
    setRows((prev) => {
      const i = prev.findIndex((x) => x.id === id);
      if (i < 0) return prev;
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= prev.length) return prev;
      const next = swap(prev, i, j);

      if (!dirty) {
        setDirty(true);
      }

      // 행 하이라이트(짧게)
      setFlashRowId(next[j].id);
      window.setTimeout(() => setFlashRowId(null), 450);

      return next;
    });
  };

  // 저장/취소
  const saveOrder = useCallback(async () => {
    try {
      setSaving(true);
      const orderMap = rows.map((c, idx) => ({ id: c.id, displayOrder: idx }));
      await updateClinicOrders(orderMap);
      setDirty(false);

      onChanged();
    } finally {
      setSaving(false);
    }
  }, [rows, onChanged]);

  const cancelChanges = useCallback(() => {
    setRows([...items].sort(compareByDisplayOrder));
    setDirty(false);
  }, [items]);

  // 부모에 액션 바인딩
  useEffect(() => {
    onBindActions?.({ save: saveOrder, cancel: cancelChanges });
  }, [onBindActions, saveOrder, cancelChanges]);

  // 테이블 리마운트 키(순서 변경 시 강제 재렌더)
  const tableKey = React.useMemo(() => rows.map((r) => r.id).join("|"), [rows]);

  // 테이블 헤더
  const columns = useMemo(
    () =>
      [
        { header: "No.", widthClass: "w-[56px]", align: "center" },
        { header: "이름" }, // 가변
        { header: "카테고리", widthClass: "w-[28%]" },
        { header: "상태", widthClass: "w-[120px]", align: "center" },
        { header: "순서", widthClass: "w-[112px]", align: "center" },
        { header: "액션", widthClass: "w-[88px]", align: "right" },
      ] as const satisfies ReadonlyArray<DataTableColumn>,
    []
  );

  return (
    <>
      <div
        className={dirty ? "rounded-lg ring-1 ring-[var(--primary)]/30" : ""}
      >
        <AdminDataTable<ClinicWithId>
          key={tableKey}
          title={title}
          items={rows.slice()}
          totalCount={totalCount}
          loading={loading}
          columns={columns}
          countLabel={(n, total) => (
            <>
              총 {total.toLocaleString()}건{dirty ? " (변경됨)" : ""}
            </>
          )}
          getRowKey={(c) => c.id}
          renderRow={(c) => {
            const idx = rows.findIndex((x) => x.id === c.id);
            const isFirst = idx <= 0;
            const isLast = idx === rows.length - 1;
            return (
              <ClinicTableRow
                clinic={c}
                index={idx}
                flash={flashRowId === c.id}
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
      </div>

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
