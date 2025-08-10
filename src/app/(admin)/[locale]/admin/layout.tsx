import React from "react";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { routing } from "@/i18n/routing";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import QueryProvider from "@/providers/QueryProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const metadata = {
  title: "메디트립 백오피스",
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryProvider>
        <div className='flex h-dvh min-h-screen bg-gray-50'>
          {/* 1) 사이드바 */}
          <Sidebar locale={locale} />

          {/* 2) 메인 영역 */}
          <div className='flex-1 flex flex-col'>
            {/* 상단 바: 날짜, 프로필, 로그아웃 */}
            <Topbar />

            {/* 실제 페이지 컨텐츠 */}
            <main className='flex-1 overflow-auto p-6'>
              <AdminAuthGuard>{children}</AdminAuthGuard>
            </main>
          </div>
        </div>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
