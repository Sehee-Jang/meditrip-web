"use client";

import * as React from "react";
import AdminDataTable, {
  type DataTableColumn,
} from "@/components/admin/common/AdminDataTable";
import ReservationTableRow from "./ReservationTableRow";
import { type Reservation } from "@/services/reservations/getReservations";

interface Props {
  items: Reservation[]; // 필터 적용된 결과
  totalCount: number; // 전체 개수(필터 전)
  loading?: boolean;
  title?: string;
  onChanged?: () => void; // 상태 변경 등 후 새로고침 필요 시
}

export default function ReservationTable({
  items,
  totalCount,
  loading = false,
  title = "예약 목록",
  onChanged,
}: Props) {
  const columns = [
    { header: "예약번호", widthClass: "w-[12%]" },
    { header: "환자명", widthClass: "w-[12%]" },
    { header: "국적", widthClass: "w-[8%]", align: "center" },
    { header: "업체명" }, // 가변
    { header: "예약내용", widthClass: "w-[18%]" },
    { header: "상태", widthClass: "w-[10%]", align: "center" },
    { header: "예약일시", widthClass: "w-[18%]", align: "center" },
    { header: "작업", widthClass: "w-[10%]", align: "right" },
  ] as const satisfies ReadonlyArray<DataTableColumn>;

  return (
    <AdminDataTable<Reservation>
      title={title}
      items={items}
      totalCount={totalCount}
      loading={loading}
      columns={columns}
      getRowKey={(r) => r.id}
      renderRow={(r) => <ReservationTableRow r={r} onChanged={onChanged} />}
      emptyMessage='데이터가 없습니다.'
    />
  );
}
