import React from "react";
import PageHeader from "@/components/common/PageHeader";
import { DatePicker } from "@/components/ui/date-picker";
import { SearchBar } from "@/components/ui/search-bar";

export default function ReservationsPage() {
  return (
    <div className='space-y-6'>
      {/* 1) 페이지 헤더 */}
      <PageHeader
        desktopTitle='예약 관리'
        mobileTitle='예약 관리'
        showBackIcon={false}
        center
      />

      {/* 2) 검색 필터 바 */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <SearchBar placeholder='예약번호, 환자명으로 검색' />
        <div className='flex items-center gap-4'>
          <DatePicker />
          {/* 나중에 상태 필터 드롭다운도 추가 */}
        </div>
      </div>

      {/* 3) 테이블 영역 (임시 더미 데이터) */}
      <div className='overflow-auto bg-white rounded-lg shadow'>
        <table className='min-w-full table-auto'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-2 text-left'>예약번호</th>
              <th className='px-4 py-2 text-left'>환자명</th>
              <th className='px-4 py-2 text-left'>국적</th>
              <th className='px-4 py-2 text-left'>진료과목</th>
              <th className='px-4 py-2 text-left'>상태</th>
              <th className='px-4 py-2 text-left'>예약일시</th>
              <th className='px-4 py-2 text-left'>작업</th>
            </tr>
          </thead>
          <tbody>
            {/* 더미 데이터 한 줄 */}
            <tr className='border-t'>
              <td className='px-4 py-2'>#1001</td>
              <td className='px-4 py-2'>홍길동</td>
              <td className='px-4 py-2'>🇰🇷 한국</td>
              <td className='px-4 py-2'>내과</td>
              <td className='px-4 py-2'>
                <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm'>
                  예약
                </span>
              </td>
              <td className='px-4 py-2'>2025-08-05 10:30</td>
              <td className='px-4 py-2'>
                <button className='text-blue-600 hover:underline'>
                  상세보기
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
