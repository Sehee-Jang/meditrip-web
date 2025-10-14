"use client";

import React from "react";
import AdminDataTable, {
  type DataTableColumn,
} from "@/components/admin/common/AdminDataTable";
import { Button } from "@/components/ui/button";
import { restoreClinic } from "@/services/admin/clinics/clinics";
import type { ClinicWithId } from "@/types/clinic";
import { RotateCcw } from "lucide-react";

interface Props {
  items: ClinicWithId[];
  totalCount: number;
  onChanged: () => void;
  loading?: boolean;
}

export default function ClinicDeletedTable({
  items,
  totalCount,
  onChanged,
  loading = false,
}: Props) {
  const [restoringId, setRestoringId] = React.useState<string | null>(null);

  const columns = React.useMemo(
    () =>
      [
        { header: "No.", widthClass: "w-[64px]", align: "center" },
        { header: "이름" },
        { header: "삭제일", widthClass: "w-[220px]" },
        { header: "액션", widthClass: "w-[120px]", align: "right" },
      ] as const satisfies ReadonlyArray<DataTableColumn>,
    []
  );

  const handleRestore = async (id: string) => {
    const ok = confirm(
      "삭제된 업체를 복구할까요? 복구 시 상태는 숨김으로 전환됩니다."
    );
    if (!ok) return;
    try {
      setRestoringId(id);
      await restoreClinic(id);
      onChanged();
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <AdminDataTable<ClinicWithId>
      title='삭제된 업체 목록'
      items={items}
      totalCount={totalCount}
      loading={loading}
      columns={columns}
      getRowKey={(clinic) => clinic.id}
      emptyMessage='삭제된 업체가 없습니다.'
      renderRow={(clinic, index) => (
        <tr className='border-t'>
          <td className='px-4 py-3 text-center text-muted-foreground'>
            {index + 1}
          </td>
          <td className='px-4 py-3'>{clinic.name?.ko ?? "-"}</td>
          <td className='px-4 py-3 text-muted-foreground'>
            {formatDeletedAt(clinic.deletedAt)}
          </td>
          <td className='px-4 py-3 pr-4 text-right'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => void handleRestore(clinic.id)}
              disabled={restoringId === clinic.id || loading}
              className='inline-flex items-center gap-2'
            >
              <RotateCcw className='h-4 w-4' />
              복구
            </Button>
          </td>
        </tr>
      )}
    />
  );
}

function formatDeletedAt(value: ClinicWithId["deletedAt"]): string {
  if (!value) return "-";

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate();
    return date.toLocaleString();
  }

  if (
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds: unknown }).seconds === "number"
  ) {
    const seconds = (value as { seconds: number }).seconds;
    return new Date(seconds * 1000).toLocaleString();
  }

  return "-";
}
