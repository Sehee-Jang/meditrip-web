import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";
import React from "react";

export default function AdminDashboardPage() {
  return (
    <>
      {/* 1) 헤더 */}
      <AdminHeaderBar
        title='관리자 대시보드'
        description='관리자 대시보드 페이지입니다.'
      />

      <div className='text-xl text-center'>
        <p>페이지 준비중입니다.</p>
      </div>

      {/* 2) 간단한 위젯 영역 (추후 실제 데이터로 교체) */}
      {/* <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='p-6 bg-background rounded-lg shadow'>
          <h2 className='text-sm text-muted-foreground'>전체 예약</h2>
          <p className='mt-2 text-2xl font-semibold'>123건</p>
        </div>
        <div className='p-6 bg-background rounded-lg shadow'>
          <h2 className='text-sm text-muted-foreground'>1:1 상담</h2>
          <p className='mt-2 text-2xl font-semibold'>45건</p>
        </div>
        <div className='p-6 bg-background rounded-lg shadow'>
          <h2 className='text-sm text-muted-foreground'>회원 수</h2>
          <p className='mt-2 text-2xl font-semibold'>789명</p>
        </div>
      </div> */}

      {/* 3) 추가할 위젯이나 차트 영역 */}
    </>
  );
}
