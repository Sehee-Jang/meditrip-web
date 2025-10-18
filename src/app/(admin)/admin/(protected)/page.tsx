import AdminHeaderBar from "@/components/admin/common/AdminHeaderBar";
import WishlistStatistics from "@/components/admin/dashboard/WishlistStatistics";
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
        <WishlistStatistics />
      </div>
    </>
  );
}
