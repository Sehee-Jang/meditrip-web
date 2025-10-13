"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { Reservation } from "@/services/reservations/getReservations";

function StatusBadge({ status }: { status: Reservation["status"] }) {
  const cls =
    status === "예약"
      ? "bg-green-100 text-green-800"
      : status === "취소"
      ? "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-800"; // 완료
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${cls}`}
    >
      {status}
    </span>
  );
}

export default function ReservationTableRow({
  r,
}: {
  r: Reservation;
  onChanged?: () => void;
}) {
  const router = useRouter();

  return (
    <tr
      className='border-t hover:bg-muted/20'
      onClick={() => router.push(`/admin/reservations/${r.id}`)}
    >
      {/* 예약번호 */}
      <td className='px-4 py-3'>
        <span className='tabular-nums'>#{r.id.slice(-4)}</span>
      </td>

      {/* 환자명 */}
      <td className='px-4 py-3'>
        <span className='block truncate'>{r.patientName}</span>
      </td>

      {/* 국적 */}
      <td className='px-4 py-3 text-center'>{r.nationality}</td>

      {/* 업체명 */}
      <td className='px-4 py-3'>
        <span className='block truncate' title={r.clinicName}>
          {r.clinicName}
        </span>
      </td>

      {/* 예약내용 */}
      <td className='px-4 py-3'>
        <span className='block truncate' title={r.packageName}>
          {r.packageName}
        </span>
      </td>

      {/* 상태 */}
      <td className='px-4 py-3 text-center'>
        <StatusBadge status={r.status} />
      </td>

      {/* 예약일시 */}
      <td className='px-4 py-3 text-center'>
        {format(r.reservedAt.toDate(), "yyyy-MM-dd HH:mm")}
      </td>

      {/* 작업: 우측 + pr-4, 행 클릭 방지 */}
      <td
        className='px-4 py-3 pr-4 text-right'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='inline-flex items-center justify-end gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => router.push(`/admin/reservations/${r.id}`)}
          >
            상세보기
          </Button>
          {/* 필요 시 Dropdown 액션으로 확장 가능 */}
        </div>
      </td>
    </tr>
  );
}
