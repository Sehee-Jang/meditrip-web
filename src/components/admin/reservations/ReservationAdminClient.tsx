"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import SearchInput from "@/components/common/SearchInput";
import ReservationsTable from "./ReservationTable";
import {
  getReservations,
  type Reservation,
} from "@/services/reservations/getReservations";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FilterRow, SelectFilter } from "../common/FilterControls";

type StatusFilter = "all" | "예약" | "완료" | "취소";

export default function ReservationAdminClient() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: () => getReservations(),
  });

  useEffect(() => {
    if (error) toast.error("예약 정보를 불러오지 못했어요.");
  }, [error]);

   const items = useMemo<Reservation[]>(
     () => (data ?? []) as Reservation[],
     [data]
   );

 const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return items.filter((r) => {
      const hitKw =
        kw.length === 0 ||
        r.id.toLowerCase().includes(kw) ||
        r.patientName.toLowerCase().includes(kw) ||
        r.clinicName.toLowerCase().includes(kw) ||
        r.packageName.toLowerCase().includes(kw);
      const hitStatus = status === "all" ? true : r.status === status;
      return hitKw && hitStatus;
    });
  }, [items, keyword, status]);

  return (
    <div className='space-y-4'>
      {/* 검색 필터 바 */}
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <FilterRow>
          <SearchInput
            value={keyword}
            onChange={setKeyword}
            placeholder='예약번호 또는 환자명으로 검색'
            aria-label='예약번호 또는 환자명으로 검색'
            className='w-[280px]'
            icon
          />
          <SelectFilter<StatusFilter>
            value={status}
            onChange={setStatus}
            aria-label='예약 상태'
            options={[
              { value: "all", label: "예약 상태(전체)" },
              { value: "예약", label: "예약" },
              { value: "완료", label: "완료" },
              { value: "취소", label: "취소" },
            ]}
            triggerClassName='h-9 w-auto text-sm'
          />
        </FilterRow>
        <div className='flex items-center gap-2'>
          <DatePicker />
        </div>
      </div>

      <ReservationsTable
        items={filtered}
        totalCount={items.length}
        loading={isFetching}
        onChanged={() => void refetch()}
      />
    </div>
  );
}
