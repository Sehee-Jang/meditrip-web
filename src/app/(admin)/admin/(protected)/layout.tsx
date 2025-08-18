import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import QueryProvider from "@/providers/QueryProvider";

export const metadata = {
  title: "메디트립 백오피스",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AdminAuthGuard>
        <div className='flex h-dvh min-h-screen bg-gray-50'>
          {/* 1) 사이드바 */}
          <Sidebar />

          {/* 2) 메인 영역 */}
          <div className='flex-1 flex flex-col'>
            {/* 상단 바: 날짜, 프로필, 로그아웃 */}
            <Topbar />

            {/* 실제 페이지 컨텐츠 */}
            <main className='flex-1 overflow-auto p-6'>{children}</main>
          </div>
        </div>
      </AdminAuthGuard>
    </QueryProvider>
  );
}
