import React from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { SearchBar } from "@/components/ui/search-bar";
import ReservationsTable from "@/components/admin/ReservationTable";
import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";

export default function AdminReservationsPage() {
  return (
    <>
      <AdminHeaderBar
        title='예약 관리 페이지'
        description='예약을 관리할 수 있는 페이지입니다.'
      />

      {/* 2) 검색 필터 바 */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <SearchBar placeholder='예약번호, 환자명으로 검색' />
        <div className='flex items-center gap-4'>
          <DatePicker />
          {/* 나중에 상태 필터 드롭다운도 추가 */}
        </div>
      </div>

      {/* 3) 테이블 영역 (임시 데이터) */}
      <ReservationsTable />
    </>
  );
}
