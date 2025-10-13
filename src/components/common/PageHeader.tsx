"use client";

import React from "react";
import { useRouter } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  desktopTitle: string;
  mobileTitle: string;
  showBackIcon?: boolean;
  center?: boolean;
  children?: React.ReactNode;
  desc?: string;
}

export default function PageHeader({
  desktopTitle,
  mobileTitle,
  showBackIcon = false,
  center = false,
  children,
  desc,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {/* 모바일 헤더 */}
      <div className='md:hidden mb-6 w-full border-b border-border bg-card text-card-foreground'>
        <div className='flex items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2'>
            {showBackIcon && (
              <button
                onClick={handleBack}
                className='rounded-lg p-2 transition-colors
                           hover:bg-accent hover:text-accent-foreground
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                aria-label='뒤로가기'
              >
                <ChevronLeft className='h-6 w-6' />
              </button>
            )}
            <h1 className='text-xl font-bold'>{mobileTitle}</h1>
          </div>
          {children && <div className='ml-auto'>{children}</div>}
        </div>
      </div>

      {/* 데스크탑 헤더 */}
      <div
        className={`hidden md:flex items-center justify-between mx-4 md:mx-40 my-16 ${
          center ? "justify-center" : ""
        }`}
      >
        {/* 왼쪽 공간(비움) */}
        <div className='w-6' />

        <div className='text-center flex-1'>
          {/* 가운데 업체명 */}
          <h1 className='md:text-4xl font-bold mb-2'>{desktopTitle}</h1>

          {/* 설명 */}
          <p className='mb-6 text-sm text-muted-foreground'>{desc}</p>
        </div>

        {/* 오른쪽 찜 버튼 */}
        {children && <div>{children}</div>}
      </div>
    </>
  );
}
